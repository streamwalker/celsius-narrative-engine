
DROP POLICY IF EXISTS "Authenticated users can update character portraits" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete character portraits" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload character portraits" ON storage.objects;

CREATE POLICY "Users can upload their own character portraits"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'character-portraits'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own character portraits"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'character-portraits'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'character-portraits'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own character portraits"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'character-portraits'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
