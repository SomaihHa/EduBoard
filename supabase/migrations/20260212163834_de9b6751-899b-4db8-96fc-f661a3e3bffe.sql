
-- Teacher-Student linking table
CREATE TABLE public.teacher_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  student_id UUID NOT NULL,
  class_name TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, student_id)
);

ALTER TABLE public.teacher_students ENABLE ROW LEVEL SECURITY;

-- Teachers can see their own students
CREATE POLICY "Teachers can view own students"
  ON public.teacher_students FOR SELECT
  USING (has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

-- Students can see their own teachers
CREATE POLICY "Students can view own teachers"
  ON public.teacher_students FOR SELECT
  USING (has_role(auth.uid(), 'student') AND student_id = auth.uid());

-- Teachers can remove students
CREATE POLICY "Teachers can delete own links"
  ON public.teacher_students FOR DELETE
  USING (has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

-- Class invitations table
CREATE TABLE public.class_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  class_name TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER DEFAULT 50,
  use_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.class_invitations ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own invitations
CREATE POLICY "Teachers can view own invitations"
  ON public.class_invitations FOR SELECT
  USING (has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

CREATE POLICY "Teachers can create invitations"
  ON public.class_invitations FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

CREATE POLICY "Teachers can update own invitations"
  ON public.class_invitations FOR UPDATE
  USING (has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own invitations"
  ON public.class_invitations FOR DELETE
  USING (has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

-- Students can read active invitations (to join via code)
CREATE POLICY "Students can read active invitations"
  ON public.class_invitations FOR SELECT
  USING (has_role(auth.uid(), 'student') AND is_active = true);

-- Edge function will handle joining logic, so we need a service-role insert policy
-- Students can insert links via the join process
CREATE POLICY "Students can join classes"
  ON public.teacher_students FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'student') AND student_id = auth.uid());

-- Function to generate a random invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM public.class_invitations WHERE invite_code = code) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN code;
END;
$$;
