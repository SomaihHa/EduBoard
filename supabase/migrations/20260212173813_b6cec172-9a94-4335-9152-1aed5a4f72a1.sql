
-- Create presentations table
CREATE TABLE public.presentations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT '',
  grade_level TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '30 minutes',
  language TEXT NOT NULL DEFAULT 'en',
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  speaker_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;

-- Teachers can CRUD their own presentations
CREATE POLICY "Teachers can read own presentations"
  ON public.presentations FOR SELECT
  USING (has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

CREATE POLICY "Teachers can create presentations"
  ON public.presentations FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

CREATE POLICY "Teachers can update own presentations"
  ON public.presentations FOR UPDATE
  USING (has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own presentations"
  ON public.presentations FOR DELETE
  USING (has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_presentations_updated_at
  BEFORE UPDATE ON public.presentations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast teacher lookups
CREATE INDEX idx_presentations_teacher_id ON public.presentations(teacher_id);
