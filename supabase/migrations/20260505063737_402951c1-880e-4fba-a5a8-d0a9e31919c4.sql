CREATE TABLE public.signup_confirmation_retries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  attempt_count int NOT NULL DEFAULT 0,
  max_attempts int NOT NULL DEFAULT 6,
  next_retry_at timestamptz NOT NULL,
  last_attempt_at timestamptz,
  last_error text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_signup_retries_due
  ON public.signup_confirmation_retries (next_retry_at)
  WHERE completed_at IS NULL;

ALTER TABLE public.signup_confirmation_retries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages retries"
  ON public.signup_confirmation_retries FOR ALL
  TO authenticated
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can view retries"
  ON public.signup_confirmation_retries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER signup_retries_updated_at
  BEFORE UPDATE ON public.signup_confirmation_retries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-enqueue a retry record when a new unconfirmed user is created
CREATE OR REPLACE FUNCTION public.handle_new_unconfirmed_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email_confirmed_at IS NULL THEN
    INSERT INTO public.signup_confirmation_retries (user_id, email, next_retry_at)
    VALUES (NEW.id, NEW.email, now() + interval '2 minutes')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_track_confirmation
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_unconfirmed_user();