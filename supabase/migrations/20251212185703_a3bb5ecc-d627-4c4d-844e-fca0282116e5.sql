-- Create table for pseudo-código submissions
CREATE TABLE public.pseudo_codigo_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_name TEXT NOT NULL,
  pseudo_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pseudo_codigo_submissions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can insert pseudo_codigo submissions"
  ON public.pseudo_codigo_submissions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view pseudo_codigo submissions"
  ON public.pseudo_codigo_submissions
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can delete pseudo_codigo submissions"
  ON public.pseudo_codigo_submissions
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER TABLE public.pseudo_codigo_submissions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pseudo_codigo_submissions;