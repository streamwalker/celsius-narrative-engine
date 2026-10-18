import test from 'node:test';
import assert from 'node:assert/strict';
import { validateConfig, rejectUnsafeFile, EXPECTED_PROJECT } from './release.mjs';
const jwt = changes => ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify({ role: 'anon', ref: EXPECTED_PROJECT, exp: 4102444800, ...changes })).toString('base64url'), 'signature'].join('.');
const env = () => ({ VITE_SUPABASE_URL: `https://${EXPECTED_PROJECT}.supabase.co`, VITE_SUPABASE_PROJECT_ID: EXPECTED_PROJECT, VITE_SUPABASE_PUBLISHABLE_KEY: jwt({}) });
test('accepts public legacy anon config', () => assert.equal(validateConfig(env()).keyType, 'legacy-anon'));
test('accepts modern publishable config', () => assert.equal(validateConfig({ ...env(), VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_abcdefghijklmnop' }).keyType, 'publishable'));
for (const [label, change] of [
  ['missing URL', { VITE_SUPABASE_URL: '' }], ['wrong project', { VITE_SUPABASE_URL: 'https://other.supabase.co' }],
  ['HTTP URL', { VITE_SUPABASE_URL: `http://${EXPECTED_PROJECT}.supabase.co` }], ['ID mismatch', { VITE_SUPABASE_PROJECT_ID: 'other' }],
  ['service role', { VITE_SUPABASE_PUBLISHABLE_KEY: jwt({ role: 'service_role' }) }], ['expired key', { VITE_SUPABASE_PUBLISHABLE_KEY: jwt({ exp: 1 }) }],
  ['wrong key project', { VITE_SUPABASE_PUBLISHABLE_KEY: jwt({ ref: 'other' }) }], ['private key', { VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_private' }],
  ['empty key', { VITE_SUPABASE_PUBLISHABLE_KEY: '' }], ['URL query', { VITE_SUPABASE_URL: `https://${EXPECTED_PROJECT}.supabase.co/?token=bad` }],
]) test(`rejects ${label}`, () => assert.throws(() => validateConfig({ ...env(), ...change })));
for (const name of ['.env', '.env.production', '.git/config', 'src/App.tsx', 'supabase/config.toml', 'node_modules/file.js', 'assets/index.js.map', 'private.pem', 'font.woff2']) test(`excludes ${name}`, () => assert.equal(rejectUnsafeFile(name), true));
for (const name of ['index.html', '.htaccess', 'release.json', '404.html', 'assets/index-AbCd1234.js', 'assets/logo.png']) test(`allows ${name}`, () => assert.equal(rejectUnsafeFile(name), false));
