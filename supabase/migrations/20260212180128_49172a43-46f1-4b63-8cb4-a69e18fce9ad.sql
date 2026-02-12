
-- Create storage bucket for presentation logos
INSERT INTO storage.buckets (id, name, public) VALUES ('presentation-logos', 'presentation-logos', true);

-- Storage policies: teachers can upload/manage their own logos
CREATE POLICY "Teachers can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'presentation-logos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Teachers can update own logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'presentation-logos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Teachers can delete own logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'presentation-logos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view presentation logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'presentation-logos');

-- Table for saved/preset logos
CREATE TABLE public.presentation_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  name text NOT NULL,
  storage_path text NOT NULL,
  is_preset boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.presentation_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can read own logos and presets"
ON public.presentation_logos FOR SELECT
USING (teacher_id = auth.uid() OR is_preset = true);

CREATE POLICY "Teachers can insert own logos"
ON public.presentation_logos FOR INSERT
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role) AND teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own logos"
ON public.presentation_logos FOR DELETE
USING (teacher_id = auth.uid() AND is_preset = false);
