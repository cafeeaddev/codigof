-- Create table for Fluxo do Cliente submissions
CREATE TABLE public.fluxo_cliente_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_name TEXT NOT NULL,
  group_members TEXT,
  flowchart_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fluxo_cliente_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public quiz)
CREATE POLICY "Anyone can insert fluxo cliente submissions"
ON public.fluxo_cliente_submissions
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read (for host screen)
CREATE POLICY "Anyone can view fluxo cliente submissions"
ON public.fluxo_cliente_submissions
FOR SELECT
USING (true);

-- Allow admins to delete
CREATE POLICY "Admins can delete fluxo cliente submissions"
ON public.fluxo_cliente_submissions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);