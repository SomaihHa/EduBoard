
-- Skill practice groups
CREATE TABLE public.skill_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_by UUID NOT NULL,
  max_members INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.skill_groups ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can see groups
CREATE POLICY "Anyone can read skill groups"
ON public.skill_groups FOR SELECT
TO authenticated
USING (true);

-- Students can create groups
CREATE POLICY "Students can create groups"
ON public.skill_groups FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'student') AND created_by = auth.uid());

-- Creators can update their groups
CREATE POLICY "Creators can update own groups"
ON public.skill_groups FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

-- Creators can delete their groups
CREATE POLICY "Creators can delete own groups"
ON public.skill_groups FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_skill_groups_updated_at
BEFORE UPDATE ON public.skill_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Group memberships
CREATE TABLE public.skill_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.skill_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.skill_group_members ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can see members
CREATE POLICY "Anyone can read group members"
ON public.skill_group_members FOR SELECT
TO authenticated
USING (true);

-- Students can join groups
CREATE POLICY "Students can join groups"
ON public.skill_group_members FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'student') AND user_id = auth.uid());

-- Members can leave groups
CREATE POLICY "Members can leave groups"
ON public.skill_group_members FOR DELETE
TO authenticated
USING (user_id = auth.uid());
