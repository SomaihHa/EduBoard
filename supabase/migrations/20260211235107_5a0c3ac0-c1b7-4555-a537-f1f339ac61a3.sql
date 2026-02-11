
-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone authenticated can read profiles" ON public.profiles;

-- Create a restrictive policy: users can only read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());
