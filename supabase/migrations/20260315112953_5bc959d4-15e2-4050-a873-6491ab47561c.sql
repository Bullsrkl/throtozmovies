-- Allow authenticated users to upload to payment-screenshots
CREATE POLICY "Authenticated users can upload to payment-screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-screenshots');

-- Allow public read (bucket is already public)
CREATE POLICY "Public read access for payment-screenshots"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-screenshots');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own files in payment-screenshots"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'payment-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files in payment-screenshots"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'payment-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);