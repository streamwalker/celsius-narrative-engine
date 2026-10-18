import { createLovableAuth } from '@lovable.dev/cloud-auth-js';
import { supabase } from '@/integrations/supabase/client';

// IONOS serves static files, not Lovable's /~oauth route. Keep OAuth on the
// existing Celsius project's managed broker, with the current app as callback.
const socialAuth = createLovableAuth({
  oauthBrokerUrl: 'https://celsius-narrative-engine.lovable.app/~oauth/initiate',
});

export async function signInWithSocialProvider(provider: 'google' | 'apple') {
  const result = await socialAuth.signInWithOAuth(provider, {
    redirect_uri: `${window.location.origin}/`,
  });
  if (result.error || result.redirected) return result;
  const { error } = await supabase.auth.setSession(result.tokens);
  if (error) return { error };
  return result;
}
