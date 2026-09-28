-- Create fritar_ovo_submissions table for "Missão Fritar um OVO"
CREATE TABLE public.fritar_ovo_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_name text NOT NULL,
  step_1 text NOT NULL,
  step_2 text NOT NULL,
  step_3 text NOT NULL,
  step_4 text NOT NULL,
  step_5 text NOT NULL,
  step_6 text NOT NULL,
  step_7 text NOT NULL,
  step_8 text NOT NULL,
  step_9 text NOT NULL,
  step_10 text NOT NULL,
  step_11 text NOT NULL,
  step_12 text NOT NULL,
  step_13 text NOT NULL,
  step_14 text NOT NULL,
  step_15 text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fritar_ovo_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert submissions (public activity)
CREATE POLICY "Anyone can insert fritar_ovo submissions"
ON public.fritar_ovo_submissions
FOR INSERT
WITH CHECK (true);

-- Anyone can view submissions
CREATE POLICY "Anyone can view fritar_ovo submissions"
ON public.fritar_ovo_submissions
FOR SELECT
USING (true);

-- Only admins can delete
CREATE POLICY "Admins can delete fritar_ovo submissions"
ON public.fritar_ovo_submissions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.fritar_ovo_submissions;