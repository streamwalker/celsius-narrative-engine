-- Lettering projects table
CREATE TABLE public.lettering_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Lettering',
  script_text TEXT NOT NULL DEFAULT '',
  image_path TEXT,
  panels JSONB NOT NULL DEFAULT '[]'::jsonb,
  bubbles_by_panel JSONB NOT NULL DEFAULT '{}'::jsonb,
  speaker_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lettering_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lettering projects"
  ON public.lettering_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lettering projects"
  ON public.lettering_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lettering projects"
  ON public.lettering_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lettering projects"
  ON public.lettering_projects FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_lettering_projects_updated_at
  BEFORE UPDATE ON public.lettering_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_lettering_projects_user ON public.lettering_projects(user_id, updated_at DESC);

-- Private storage bucket for uploaded page artwork
INSERT INTO storage.buckets (id, name, public)
VALUES ('lettering-pages', 'lettering-pages', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can view their own lettering page files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lettering-pages' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own lettering page files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'lettering-pages' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own lettering page files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'lettering-pages' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own lettering page files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'lettering-pages' AND auth.uid()::text = (storage.foldername(name))[1]);
