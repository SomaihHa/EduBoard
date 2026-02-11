
CREATE TABLE public.saved_lecture_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  key_terms JSONB DEFAULT '[]'::jsonb,
  questions_and_answers JSONB DEFAULT '[]'::jsonb,
  highlights JSONB DEFAULT '[]'::jsonb,
  original_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_lecture_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saved notes"
ON public.saved_lecture_notes FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own saved notes"
ON public.saved_lecture_notes FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own saved notes"
ON public.saved_lecture_notes FOR DELETE
USING (user_id = auth.uid());
