-- Create storage bucket for movie posters
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'movie-posters',
  'movie-posters',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Storage policies for movie posters
CREATE POLICY "Anyone can view posters"
ON storage.objects FOR SELECT
USING (bucket_id = 'movie-posters');

CREATE POLICY "Authenticated users can upload posters"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'movie-posters' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update own posters"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'movie-posters' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete own posters"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'movie-posters' 
  AND auth.uid() IS NOT NULL
);