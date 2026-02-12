
-- Allow teachers to read profiles of their linked students
CREATE POLICY "Teachers can read linked student profiles"
  ON public.profiles FOR SELECT
  USING (
    has_role(auth.uid(), 'teacher') AND
    id IN (
      SELECT student_id FROM public.teacher_students WHERE teacher_id = auth.uid()
    )
  );

-- Allow students to read profiles of their linked teachers
CREATE POLICY "Students can read linked teacher profiles"
  ON public.profiles FOR SELECT
  USING (
    has_role(auth.uid(), 'student') AND
    id IN (
      SELECT teacher_id FROM public.teacher_students WHERE student_id = auth.uid()
    )
  );
