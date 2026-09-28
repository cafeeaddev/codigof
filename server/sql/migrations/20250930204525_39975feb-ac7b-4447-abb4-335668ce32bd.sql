-- Create table for manual XP adjustments from spreadsheet
CREATE TABLE public.manual_xp_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  xp_value INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.manual_xp_adjustments ENABLE ROW LEVEL SECURITY;

-- Admins can view all manual XP adjustments
CREATE POLICY "Admins can view all manual xp adjustments"
  ON public.manual_xp_adjustments
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert manual XP adjustments
CREATE POLICY "Admins can insert manual xp adjustments"
  ON public.manual_xp_adjustments
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update manual XP adjustments
CREATE POLICY "Admins can update manual xp adjustments"
  ON public.manual_xp_adjustments
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete manual XP adjustments
CREATE POLICY "Admins can delete manual xp adjustments"
  ON public.manual_xp_adjustments
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_manual_xp_adjustments_updated_at
  BEFORE UPDATE ON public.manual_xp_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index on email for faster lookups
CREATE INDEX idx_manual_xp_adjustments_email ON public.manual_xp_adjustments(email);