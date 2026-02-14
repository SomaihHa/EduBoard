
-- Create pronunciation tasks table
CREATE TABLE public.pronunciation_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  language TEXT NOT NULL DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  level TEXT NOT NULL DEFAULT 'word' CHECK (level IN ('letter', 'word', 'sentence', 'paragraph')),
  text_content TEXT NOT NULL,
  phonetic_hint TEXT,
  practice_mode TEXT NOT NULL DEFAULT 'practice' CHECK (practice_mode IN ('practice', 'graded')),
  target_accuracy INTEGER DEFAULT 80,
  assign_to TEXT NOT NULL DEFAULT 'class' CHECK (assign_to IN ('individual', 'class')),
  assigned_student_id UUID,
  is_library_item BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pronunciation_tasks ENABLE ROW LEVEL SECURITY;

-- Teachers can CRUD own tasks
CREATE POLICY "Teachers can create pronunciation tasks"
  ON public.pronunciation_tasks FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'teacher'::app_role) AND teacher_id = auth.uid());

CREATE POLICY "Teachers can read own pronunciation tasks"
  ON public.pronunciation_tasks FOR SELECT
  USING (has_role(auth.uid(), 'teacher'::app_role) AND teacher_id = auth.uid());

CREATE POLICY "Teachers can update own pronunciation tasks"
  ON public.pronunciation_tasks FOR UPDATE
  USING (has_role(auth.uid(), 'teacher'::app_role) AND teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own pronunciation tasks"
  ON public.pronunciation_tasks FOR DELETE
  USING (has_role(auth.uid(), 'teacher'::app_role) AND teacher_id = auth.uid());

-- Students can read tasks assigned to them (class-wide or individual)
CREATE POLICY "Students can read assigned pronunciation tasks"
  ON public.pronunciation_tasks FOR SELECT
  USING (
    has_role(auth.uid(), 'student'::app_role) AND (
      (assign_to = 'class' AND teacher_id IN (
        SELECT teacher_id FROM public.teacher_students WHERE student_id = auth.uid()
      ))
      OR
      (assign_to = 'individual' AND assigned_student_id = auth.uid())
    )
  );

-- Create pronunciation submissions table
CREATE TABLE public.pronunciation_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.pronunciation_tasks(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  audio_url TEXT,
  accuracy_score INTEGER,
  clarity_score INTEGER,
  articulation_score INTEGER,
  stress_score INTEGER,
  overall_score INTEGER,
  mispronounced_parts JSONB DEFAULT '[]'::jsonb,
  ai_feedback TEXT,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  is_best_attempt BOOLEAN NOT NULL DEFAULT false,
  teacher_feedback TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pronunciation_submissions ENABLE ROW LEVEL SECURITY;

-- Students can insert own submissions
CREATE POLICY "Students can submit pronunciation attempts"
  ON public.pronunciation_submissions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'student'::app_role) AND student_id = auth.uid());

-- Students can read own submissions
CREATE POLICY "Students can read own pronunciation submissions"
  ON public.pronunciation_submissions FOR SELECT
  USING (student_id = auth.uid());

-- Students can update own submissions (for marking best attempt)
CREATE POLICY "Students can update own pronunciation submissions"
  ON public.pronunciation_submissions FOR UPDATE
  USING (student_id = auth.uid());

-- Teachers can read submissions for their tasks
CREATE POLICY "Teachers can read pronunciation submissions for own tasks"
  ON public.pronunciation_submissions FOR SELECT
  USING (
    has_role(auth.uid(), 'teacher'::app_role) AND task_id IN (
      SELECT id FROM public.pronunciation_tasks WHERE teacher_id = auth.uid()
    )
  );

-- Teachers can update submissions (for feedback)
CREATE POLICY "Teachers can update pronunciation submissions"
  ON public.pronunciation_submissions FOR UPDATE
  USING (
    has_role(auth.uid(), 'teacher'::app_role) AND task_id IN (
      SELECT id FROM public.pronunciation_tasks WHERE teacher_id = auth.uid()
    )
  );

-- Trigger for updated_at on tasks
CREATE TRIGGER update_pronunciation_tasks_updated_at
  BEFORE UPDATE ON public.pronunciation_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
