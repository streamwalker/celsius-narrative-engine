
-- ============================================================================
-- COMIC PROJECTS / PAGES / PANELS
-- ============================================================================
CREATE TABLE public.comic_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Comic',
  script_text TEXT NOT NULL,
  art_style TEXT NOT NULL DEFAULT 'western',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.comic_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.comic_projects(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  opening_narration TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.comic_panels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.comic_pages(id) ON DELETE CASCADE,
  panel_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  narration TEXT,
  dialogue TEXT,
  is_black_and_white BOOLEAN DEFAULT false,
  image_data TEXT,
  prompt_used TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.comic_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comic_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comic_panels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects" ON public.comic_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON public.comic_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.comic_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.comic_projects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view pages of their projects" ON public.comic_pages FOR SELECT
USING (EXISTS (SELECT 1 FROM public.comic_projects WHERE id = comic_pages.project_id AND user_id = auth.uid()));
CREATE POLICY "Users can create pages in their projects" ON public.comic_pages FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.comic_projects WHERE id = comic_pages.project_id AND user_id = auth.uid()));
CREATE POLICY "Users can update pages in their projects" ON public.comic_pages FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.comic_projects WHERE id = comic_pages.project_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete pages in their projects" ON public.comic_pages FOR DELETE
USING (EXISTS (SELECT 1 FROM public.comic_projects WHERE id = comic_pages.project_id AND user_id = auth.uid()));

CREATE POLICY "Users can view panels of their pages" ON public.comic_panels FOR SELECT
USING (EXISTS (SELECT 1 FROM public.comic_pages cp JOIN public.comic_projects pr ON cp.project_id = pr.id WHERE cp.id = comic_panels.page_id AND pr.user_id = auth.uid()));
CREATE POLICY "Users can create panels in their pages" ON public.comic_panels FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.comic_pages cp JOIN public.comic_projects pr ON cp.project_id = pr.id WHERE cp.id = comic_panels.page_id AND pr.user_id = auth.uid()));
CREATE POLICY "Users can update panels in their pages" ON public.comic_panels FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.comic_pages cp JOIN public.comic_projects pr ON cp.project_id = pr.id WHERE cp.id = comic_panels.page_id AND pr.user_id = auth.uid()));
CREATE POLICY "Users can delete panels in their pages" ON public.comic_panels FOR DELETE
USING (EXISTS (SELECT 1 FROM public.comic_pages cp JOIN public.comic_projects pr ON cp.project_id = pr.id WHERE cp.id = comic_panels.page_id AND pr.user_id = auth.uid()));

CREATE TRIGGER update_comic_projects_updated_at
BEFORE UPDATE ON public.comic_projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_comic_projects_user_id ON public.comic_projects(user_id);
CREATE INDEX idx_comic_pages_project_id ON public.comic_pages(project_id);
CREATE INDEX idx_comic_panels_page_id ON public.comic_panels(page_id);

-- ============================================================================
-- STYLE FAVORITES / HISTORY / CUSTOM
-- ============================================================================
CREATE TABLE public.style_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  style_id TEXT,
  is_mix BOOLEAN DEFAULT false NOT NULL,
  primary_style TEXT,
  secondary_style TEXT,
  primary_intensity INTEGER,
  secondary_intensity INTEGER,
  custom_name TEXT,
  CONSTRAINT valid_favorite CHECK (
    (is_mix = false AND style_id IS NOT NULL) OR
    (is_mix = true AND primary_style IS NOT NULL AND secondary_style IS NOT NULL)
  )
);
ALTER TABLE public.style_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own favorites" ON public.style_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON public.style_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own favorites" ON public.style_favorites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.style_favorites FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.style_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  style_id TEXT,
  is_mix BOOLEAN DEFAULT false NOT NULL,
  primary_style TEXT,
  secondary_style TEXT,
  primary_intensity INTEGER,
  secondary_intensity INTEGER,
  use_count INTEGER DEFAULT 1 NOT NULL,
  last_used_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.style_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own style history" ON public.style_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own style history" ON public.style_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own style history" ON public.style_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own style history" ON public.style_history FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.custom_styles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  prompt_modifier TEXT NOT NULL,
  preview_emoji TEXT DEFAULT '🎨',
  base_style TEXT,
  CONSTRAINT name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 50)
);
ALTER TABLE public.custom_styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own custom styles" ON public.custom_styles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own custom styles" ON public.custom_styles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own custom styles" ON public.custom_styles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own custom styles" ON public.custom_styles FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_custom_styles_updated_at BEFORE UPDATE ON public.custom_styles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- GENERATION QUEUE
-- ============================================================================
CREATE TABLE public.generation_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.comic_projects(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','cancelled')),
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  script_text TEXT NOT NULL,
  art_style TEXT NOT NULL,
  character_context TEXT,
  reference_images JSONB DEFAULT '[]'::jsonb,
  labeled_images JSONB DEFAULT '[]'::jsonb,
  consistency_config JSONB,
  total_panels INTEGER NOT NULL DEFAULT 0,
  completed_panels INTEGER NOT NULL DEFAULT 0,
  notification_email TEXT,
  error_message TEXT,
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.generation_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own queue jobs" ON public.generation_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own queue jobs" ON public.generation_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own queue jobs" ON public.generation_queue FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own queue jobs" ON public.generation_queue FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_generation_queue_user_id ON public.generation_queue(user_id);
CREATE INDEX idx_generation_queue_status ON public.generation_queue(status);

-- ============================================================================
-- STORY PROJECTS
-- ============================================================================
CREATE TABLE public.story_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Story',
  story_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.story_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own story projects" ON public.story_projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own story projects" ON public.story_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own story projects" ON public.story_projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own story projects" ON public.story_projects FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_story_projects_updated_at BEFORE UPDATE ON public.story_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- USER PREFERENCES + PROJECT VERSIONS
-- ============================================================================
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  notification_email TEXT,
  notify_on_complete BOOLEAN DEFAULT true,
  notify_on_failure BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

CREATE TABLE public.project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.comic_projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  version_name TEXT,
  description TEXT,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_auto_save BOOLEAN DEFAULT false,
  UNIQUE(project_id, version_number)
);
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view versions of their projects" ON public.project_versions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.comic_projects WHERE comic_projects.id = project_versions.project_id AND comic_projects.user_id = auth.uid()));
CREATE POLICY "Users can create versions of their projects" ON public.project_versions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.comic_projects WHERE comic_projects.id = project_versions.project_id AND comic_projects.user_id = auth.uid()));
CREATE POLICY "Users can delete versions of their projects" ON public.project_versions FOR DELETE
USING (EXISTS (SELECT 1 FROM public.comic_projects WHERE comic_projects.id = project_versions.project_id AND comic_projects.user_id = auth.uid()));
CREATE INDEX idx_project_versions_project_id ON public.project_versions(project_id);
CREATE INDEX idx_project_versions_created_at ON public.project_versions(created_at DESC);

ALTER TABLE public.generation_queue ADD COLUMN IF NOT EXISTS notification_email TEXT;

-- ============================================================================
-- PROJECT COLLABORATORS / COMMENTS
-- ============================================================================
CREATE TYPE public.project_role AS ENUM ('owner','editor','viewer','commenter');

CREATE TABLE public.project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.comic_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.project_role NOT NULL DEFAULT 'viewer',
  invited_by UUID,
  invited_email TEXT,
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE public.project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.comic_projects(id) ON DELETE CASCADE,
  panel_id TEXT,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  position_x DECIMAL,
  position_y DECIMAL,
  is_resolved BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES public.project_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_project_access(_project_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_collaborators
    WHERE project_id = _project_id AND user_id = _user_id AND accepted_at IS NOT NULL
  ) OR EXISTS (
    SELECT 1 FROM public.comic_projects WHERE id = _project_id AND user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.has_project_role(_project_id UUID, _user_id UUID, _min_role public.project_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.comic_projects WHERE id = _project_id AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.project_collaborators
    WHERE project_id = _project_id AND user_id = _user_id AND accepted_at IS NOT NULL
    AND (
      (_min_role = 'viewer') OR
      (_min_role = 'commenter' AND role IN ('commenter','editor','owner')) OR
      (_min_role = 'editor' AND role IN ('editor','owner')) OR
      (_min_role = 'owner' AND role = 'owner')
    )
  )
$$;

CREATE POLICY "Users can view collaborators of their projects" ON public.project_collaborators FOR SELECT
USING (public.has_project_access(project_id, auth.uid()) OR user_id = auth.uid());
CREATE POLICY "Project owners can insert collaborators" ON public.project_collaborators FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.comic_projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "Project owners can update collaborators" ON public.project_collaborators FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.comic_projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "Project owners can delete collaborators" ON public.project_collaborators FOR DELETE
USING (EXISTS (SELECT 1 FROM public.comic_projects WHERE id = project_id AND user_id = auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Users can view comments on accessible projects" ON public.project_comments FOR SELECT
USING (public.has_project_access(project_id, auth.uid()));
CREATE POLICY "Users with commenter+ role can insert comments" ON public.project_comments FOR INSERT
WITH CHECK (public.has_project_role(project_id, auth.uid(), 'commenter'));
CREATE POLICY "Users can update their own comments" ON public.project_comments FOR UPDATE
USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own comments" ON public.project_comments FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- CHARACTER PORTRAITS STORAGE BUCKET
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('character-portraits', 'character-portraits', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Character portraits are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'character-portraits');

CREATE POLICY "Anyone can upload character portraits"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'character-portraits');

CREATE POLICY "Anyone can update character portraits"
ON storage.objects FOR UPDATE
USING (bucket_id = 'character-portraits');

CREATE POLICY "Anyone can delete character portraits"
ON storage.objects FOR DELETE
USING (bucket_id = 'character-portraits');
