import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ oauth: vi.fn(), create: vi.fn(), session: vi.fn() }));
vi.mock('@lovable.dev/cloud-auth-js', () => ({ createLovableAuth: mocks.create.mockReturnValue({ signInWithOAuth: mocks.oauth }) }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { setSession: mocks.session } } }));
import { signInWithSocialProvider } from '@/lib/social-auth';
beforeEach(() => { mocks.oauth.mockReset(); mocks.session.mockReset(); });
it('uses the existing Celsius hosted broker rather than an IONOS static route', () => {
  expect(mocks.create).toHaveBeenCalledWith({ oauthBrokerUrl: 'https://celsius-narrative-engine.lovable.app/~oauth/initiate' });
});
it.each(['google', 'apple'] as const)('redirects %s to the current origin without changing the session', async provider => {
  mocks.oauth.mockResolvedValue({ redirected: true, error: null });
  await signInWithSocialProvider(provider);
  expect(mocks.oauth).toHaveBeenCalledWith(provider, { redirect_uri: `${window.location.origin}/` });
  expect(mocks.session).not.toHaveBeenCalled();
});
it('preserves provider failures without trying to set a session', async () => {
  const error = new Error('Sign in was cancelled'); mocks.oauth.mockResolvedValue({ error });
  expect((await signInWithSocialProvider('apple')).error).toBe(error);
  expect(mocks.session).not.toHaveBeenCalled();
});
it('propagates session installation errors instead of reporting success', async () => {
  mocks.oauth.mockResolvedValue({ tokens: { access_token: 'test', refresh_token: 'test' }, error: null });
  const error = new Error('Session rejected'); mocks.session.mockResolvedValue({ error });
  expect((await signInWithSocialProvider('google')).error).toBe(error);
});
