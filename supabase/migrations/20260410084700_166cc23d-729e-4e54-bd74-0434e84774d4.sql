-- Fix 1: Remove the overly permissive SELECT policy on class_invitations
DROP POLICY IF EXISTS "Students can read active invitations" ON public.class_invitations;

-- Create a SECURITY DEFINER function to validate a specific invite code
-- Students must supply the code; they cannot browse all codes
CREATE OR REPLACE FUNCTION public.validate_invite_code(p_code text)
RETURNS TABLE (
  id uuid,
  invite_code text,
  class_name text,
  teacher_id uuid,
  is_active boolean,
  max_uses integer,
  use_count integer,
  expires_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ci.id,
    ci.invite_code,
    ci.class_name,
    ci.teacher_id,
    ci.is_active,
    ci.max_uses,
    ci.use_count,
    ci.expires_at
  FROM class_invitations ci
  WHERE ci.invite_code = upper(trim(p_code))
    AND ci.is_active = true;
$$;

-- Fix 2: Add DELETE policy for student recordings in storage
CREATE POLICY "Students can delete own recordings"
ON storage.objects
FOR DELETE
USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);