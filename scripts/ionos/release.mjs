import { readFile, writeFile, mkdir, rm, readdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { build, loadEnv } from 'vite';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const EXPECTED_PROJECT = 'jhtbircnacbdbixfzzkq';

/** Refuse a blank, private, expired or mismatched browser configuration. */
export function validateConfig(env, now = Date.now()) {
  const expected = env.IONOS_EXPECTED_PROJECT_REF || EXPECTED_PROJECT;
  let url;
  try { url = new URL(env.VITE_SUPABASE_URL); } catch { throw new Error('A valid VITE_SUPABASE_URL is required.'); }
  if (url.protocol !== 'https:' || url.hostname !== `${expected}.supabase.co` || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('Backend URL must be the expected HTTPS Supabase project root. Do not silently switch projects.');
  }
  if (env.VITE_SUPABASE_PROJECT_ID && env.VITE_SUPABASE_PROJECT_ID !== expected) throw new Error('Supabase project IDs disagree.');
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  if (/^sb_publishable_[A-Za-z0-9_-]{12,}$/.test(key)) return { projectRef: expected, keyType: 'publishable', url: url.origin };
  let payload;
  try { payload = JSON.parse(Buffer.from(key.split('.')[1] || '', 'base64url').toString()); } catch { throw new Error('A public publishable or legacy anon key is required.'); }
  if (key.split('.').length !== 3 || payload.role !== 'anon' || payload.ref !== expected || !Number.isFinite(payload.exp) || payload.exp * 1000 <= now) {
    throw new Error('Browser key must be an unexpired anon key for this project, never service_role or a secret key.');
  }
  // This checks claims, not the signature. Online backend acceptance is a separate check.
  return { projectRef: expected, keyType: 'legacy-anon', url: url.origin };
}

export function rejectUnsafeFile(name) {
  const p = name.replaceAll('\\', '/');
  return p.split('/').some(x => x.startsWith('.') && x !== '.htaccess') ||
    /(^|\/)(src|node_modules|supabase|scripts|deployment)(\/|$)/.test(p) ||
    /\.(map|ts|tsx|sql|pem|key|log|zip|tgz|woff2?|ttf|otf)$/i.test(p) ||
    /(^|\/)(package(-lock)?\.json|bun\.lockb?)$/i.test(p);
}

export async function listFiles(dir, prefix = '') {
  const result = [];
  for (const entry of await readdir(path.join(dir, prefix), { withFileTypes: true })) {
    const name = path.posix.join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Unexpected symbolic link: ${name}`);
    if (entry.isDirectory()) result.push(...await listFiles(dir, name));
    else result.push(name);
  }
  return result.sort();
}

export async function verifyBundle(dir) {
  const files = await listFiles(dir);
  for (const file of files) if (rejectUnsafeFile(file)) throw new Error(`Unsafe deploy file: ${file}`);
  for (const required of ['index.html', '.htaccess', '404.html', 'release.json', 'robots.txt']) {
    if (!files.includes(required)) throw new Error(`Missing ${required}`);
  }
  const html = await readFile(path.join(dir, 'index.html'), 'utf8');
  if (html.includes('/src/main') || !/type="module"/.test(html)) throw new Error('Deploy the production build, not source or the standalone preview.');
  const refs = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map(m => m[1].slice(1));
  if (!refs.some(ref => ref.endsWith('.js'))) throw new Error('No production entry script.');
  for (const ref of refs) if (!files.includes(ref)) throw new Error(`Missing entry asset: ${ref}`);
  for (const file of files.filter(f => /\.(js|html|json|css|txt)$/.test(f))) {
    const text = await readFile(path.join(dir, file), 'utf8');
    if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sb_secret_[A-Za-z0-9_-]{20,}|sk-proj-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{30,}/.test(text)) throw new Error(`Possible private credential in ${file}`);
    for (const jwt of text.matchAll(/eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)) {
      try { if (JSON.parse(Buffer.from(jwt[1], 'base64url').toString()).role === 'service_role') throw new Error('PRIVATE_ROLE'); }
      catch (e) { if (e.message === 'PRIVATE_ROLE') throw new Error(`Private database key in ${file}`); }
    }
  }
  return { files: files.length, entryAssets: refs.length };
}

export async function makeRelease() {
  const env = { ...loadEnv('production', ROOT, ''), ...process.env };
  const backend = validateConfig(env);
  await build({ root: ROOT, mode: 'production', base: '/', build: { sourcemap: false } });
  const dist = path.join(ROOT, 'dist');
  const output = path.join(ROOT, 'ionos-release');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  const revision = env.IONOS_SOURCE_REVISION || spawnSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).stdout?.trim() || 'uncommitted-workspace';
  const htaccess = await readFile(path.join(ROOT, 'deployment/ionos/.htaccess'), 'utf8');
  const originalRobots = await readFile(path.join(ROOT, 'public/robots.txt'), 'utf8');
  const timestamp = new Date().toISOString();
  const reports = [];
  for (const profile of ['staging', 'production']) {
    await writeFile(path.join(dist, '.htaccess'), htaccess + (profile === 'staging' ? '\n<IfModule mod_headers.c>\n  Header always set X-Robots-Tag "noindex, nofollow, noarchive"\n</IfModule>\n' : ''));
    await copyFile(path.join(ROOT, 'deployment/ionos/404.html'), path.join(dist, '404.html'));
    await writeFile(path.join(dist, 'robots.txt'), profile === 'staging' ? 'User-agent: *\nDisallow: /\n' : originalRobots);
    await writeFile(path.join(dist, 'release.json'), JSON.stringify({ app: 'Celsius', schemaVersion: 1, sourceRevision: revision, builtAt: timestamp, profile, hosting: 'IONOS Linux / Apache, domain root', backendProject: backend.projectRef, storyArchitectStorage: 'browser-local; export backups', launchStatus: 'awaiting target-domain and authenticated acceptance checks' }, null, 2));
    const verified = await verifyBundle(dist);
    const name = profile === 'staging' ? 'Celsius-IONOS-Staging.zip' : 'Celsius-IONOS-Publish.zip';
    const destination = path.join(output, name);
    const zipped = spawnSync('zip', ['-q', '-r', destination, '.'], { cwd: dist, encoding: 'utf8' });
    if (zipped.status !== 0) throw new Error(`zip is required (macOS/Linux). ${zipped.error?.message || zipped.stderr}`);
    const sha256 = createHash('sha256').update(await readFile(destination)).digest('hex');
    reports.push({ name, profile, sha256, ...verified });
  }
  await copyFile(path.join(ROOT, 'deployment/ionos/README.md'), path.join(output, 'START-HERE.md'));
  await copyFile(path.join(ROOT, 'scripts/ionos/check-live.py'), path.join(output, 'check-live.py'));
  await writeFile(path.join(output, 'SHA256SUMS.txt'), reports.map(r => `${r.sha256}  ${r.name}`).join('\n') + '\n');
  await writeFile(path.join(output, 'build-report.json'), JSON.stringify({ revision, builtAt: timestamp, backend, reports, pending: ['IONOS plan/domain/directory confirmation', 'Final-domain SSL and auth redirect settings', 'Real account sign-in, existing cloud projects, uploads and paid AI acceptance tests', 'Live backend authorization and RLS review'] }, null, 2));
  console.log(JSON.stringify({ output, reports }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  makeRelease().catch(e => { console.error(`IONOS release stopped: ${e.message}`); process.exitCode = 1; });
}
