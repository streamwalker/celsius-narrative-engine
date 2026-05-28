
-- 1. Lock down character-portraits storage policies
DROP POLICY IF EXISTS "Anyone can upload character portraits" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update character portraits" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete character portraits" ON storage.objects;
DROP POLICY IF EXISTS "Character portraits are publicly accessible" ON storage.objects;

-- Public read remains available through public URLs; restrict listing via storage API
-- (no broad SELECT policy is needed for public bucket public URL fetches).

-- Writes restricted to authenticated users; service role bypasses RLS.
CREATE POLICY "Authenticated users can upload character portraits"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'character-portraits');

CREATE POLICY "Authenticated users can update character portraits"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'character-portraits');

CREATE POLICY "Authenticated users can delete character portraits"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'character-portraits');

-- 2. Extend comic_projects/pages/panels SELECT policies to honour collaborators
DROP POLICY IF EXISTS "Users can view their own projects" ON public.comic_projects;
CREATE POLICY "Users can view their own or shared projects"
  ON public.comic_projects FOR SELECT
  USING (auth.uid() = user_id OR public.has_project_access(id, auth.uid()));

DROP POLICY IF EXISTS "Users can view pages of their projects" ON public.comic_pages;
CREATE POLICY "Users can view pages of accessible projects"
  ON public.comic_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.comic_projects
      WHERE comic_projects.id = comic_pages.project_id
        AND (comic_projects.user_id = auth.uid()
             OR public.has_project_access(comic_projects.id, auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can view panels of their pages" ON public.comic_panels;
CREATE POLICY "Users can view panels of accessible pages"
  ON public.comic_panels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.comic_pages cp
      JOIN public.comic_projects pr ON cp.project_id = pr.id
      WHERE cp.id = comic_panels.page_id
        AND (pr.user_id = auth.uid()
             OR public.has_project_access(pr.id, auth.uid()))
    )
  );

-- 3. project_versions: allow collaborator read; allow editor+ to insert
DROP POLICY IF EXISTS "Users can view versions of their projects" ON public.project_versions;
CREATE POLICY "Users can view versions of accessible projects"
  ON public.project_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.comic_projects
      WHERE comic_projects.id = project_versions.project_id
        AND (comic_projects.user_id = auth.uid()
             OR public.has_project_access(comic_projects.id, auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can create versions of their projects" ON public.project_versions;
CREATE POLICY "Editors can create versions of accessible projects"
  ON public.project_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.comic_projects
      WHERE comic_projects.id = project_versions.project_id
        AND comic_projects.user_id = auth.uid()
    )
    OR public.has_project_role(project_versions.project_id, auth.uid(), 'editor'::project_role)
  );

-- 4. Lock down SECURITY DEFINER email-queue helpers
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;

REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
