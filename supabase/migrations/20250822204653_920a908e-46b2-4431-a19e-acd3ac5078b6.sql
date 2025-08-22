-- Create fast_track_terms_responses table for Mission 5 terms acceptance
CREATE TABLE public.fast_track_terms_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  accepted_terms BOOLEAN NOT NULL DEFAULT false,
  want_to_participate BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fast_track_terms_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own terms responses" 
ON public.fast_track_terms_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own terms responses" 
ON public.fast_track_terms_responses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all terms responses" 
ON public.fast_track_terms_responses 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_fast_track_terms_responses_updated_at
BEFORE UPDATE ON public.fast_track_terms_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();