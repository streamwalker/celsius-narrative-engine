## Problem

When a user signs up from the Letter Page (or anywhere else), the app shows "check your email to verify your account", but no email arrives. Subsequent sign-in attempts then fail with `email_not_confirmed` (visible in the network logs).

## Root cause

The project has:
- A verified Lovable email domain (`notify.rentvsbuyhouse.com`) ✅
- A custom `auth-email-hook` edge function that uses the queue pattern (calls `enqueue_email`) ✅
- **NO email queue infrastructure** ❌ — the `email_send_log` table does not exist, which means the `enqueue_email` RPC, the pgmq `auth_emails` queue, and the `process-email-queue` cron job were never created.

So when Supabase fires the auth email hook on signup, the hook tries to enqueue the email, the RPC call fails silently (or errors), and nothing is ever sent. Supabase still considers the signup successful, so the UI shows the "check your email" toast — but the email never goes out.

## Fix

1. **Provision the email queue infrastructure.** This creates the pgmq queues (`auth_emails`, `transactional_emails`), the `enqueue_email` RPC, the `email_send_log` / `email_send_state` / `suppressed_emails` / `email_unsubscribe_tokens` tables, the `process-email-queue` edge function, and the pg_cron job that drains the queue every 5 seconds.

2. **Redeploy `auth-email-hook`** so it picks up the now-working `enqueue_email` RPC and reconciles with the email setup state.

3. **Verify by sending a fresh signup** and confirming a row appears in `email_send_log` with status `sent`.

## Notes

- No code changes are needed. The auth modal flow, the hook, and the templates are all correct — they just have no queue to write to.
- After this is fixed, the existing test account (`phil@streamwalkers.com`) can request a new confirmation email by signing up again or via a "Resend confirmation" flow. If you want, I can also add a "Resend confirmation email" button to the auth modal as a follow-up.
