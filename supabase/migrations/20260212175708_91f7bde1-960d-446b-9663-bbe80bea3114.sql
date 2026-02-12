
-- Add assignment_type column to quran_assignments table
ALTER TABLE public.quran_assignments 
ADD COLUMN assignment_type text NOT NULL DEFAULT 'quran_recitation';

-- Add submission_text column to assignment_submissions for text-based submissions
ALTER TABLE public.assignment_submissions
ADD COLUMN submission_text text;

-- Add submission_image_url column for homework uploads
ALTER TABLE public.assignment_submissions
ADD COLUMN submission_image_url text;

-- Make audio_url nullable (not all types need audio)
ALTER TABLE public.assignment_submissions
ALTER COLUMN audio_url DROP NOT NULL,
ALTER COLUMN audio_url SET DEFAULT NULL;

-- Add index on assignment_type for filtering
CREATE INDEX idx_quran_assignments_type ON public.quran_assignments(assignment_type);
