
CREATE TABLE public.platform_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read settings
CREATE POLICY "Settings readable by authenticated users"
ON public.platform_settings
FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings"
ON public.platform_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default YouTube channel URL
INSERT INTO public.platform_settings (key, value)
VALUES ('youtube_channel_url', 'https://youtube.com/@throtozm?sub_confirmation=1');
