// Read-only reachability checks. No accounts, email, app records or AI jobs are created.
import { loadEnv } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, validateConfig } from './release.mjs';
const env = { ...loadEnv('production', ROOT, ''), ...process.env };
const config = validateConfig(env);
const results = [];
for (const endpoint of ['/auth/v1/health', '/auth/v1/settings']) {
  try {
    const response = await fetch(config.url + endpoint, { headers: { apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY }, signal: AbortSignal.timeout(15000) });
    const row = { endpoint, status: response.status, ok: response.ok };
    if (endpoint.endsWith('/settings') && response.ok) {
      const settings = await response.json();
      row.emailEnabled = Boolean(settings.external?.email);
      row.signupDisabled = settings.disable_signup;
      row.emailAutoconfirm = settings.mailer_autoconfirm;
    }
    results.push(row);
  } catch (e) { results.push({ endpoint, ok: false, error: e.message }); }
}
const report = { checkedAt: new Date().toISOString(), backendProject: config.projectRef, results, limitation: 'Reachability only; no proof of sign-in, email delivery, redirects, database authorization, storage access or AI execution.' };
await mkdir(path.join(ROOT, 'ionos-release'), { recursive: true });
await writeFile(path.join(ROOT, 'ionos-release/backend-check.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
