CREATE POLICY "Admins can upload king maker admin files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'king-maker-uploads'
  AND (storage.foldername(name))[1] = 'admin'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update king maker admin files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'king-maker-uploads'
  AND (storage.foldername(name))[1] = 'admin'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete king maker admin files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'king-maker-uploads'
  AND (storage.foldername(name))[1] = 'admin'
  AND public.has_role(auth.uid(), 'admin')
);