-- Create quiz4_submissions table
CREATE TABLE public.quiz4_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name text NOT NULL,
  group_members text,
  problem text NOT NULL,
  solution text NOT NULL,
  technology text NOT NULL,
  human_impact text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz4_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view quiz4 submissions"
ON public.quiz4_submissions
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert quiz4 submissions"
ON public.quiz4_submissions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can delete quiz4 submissions"
ON public.quiz4_submissions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz4_submissions;