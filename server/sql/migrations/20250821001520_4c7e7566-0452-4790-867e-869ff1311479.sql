-- Create question_options table
CREATE TABLE public.question_options (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id integer NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_letter text NOT NULL CHECK (option_letter IN ('A', 'B', 'C', 'D', 'E', '1', '2', '3', '4', '5')),
  option_text text NOT NULL,
  points numeric NOT NULL DEFAULT 0,
  order_position integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(question_id, option_letter)
);

-- Enable RLS
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view question options" 
ON public.question_options 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify question options" 
ON public.question_options 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_question_options_updated_at
BEFORE UPDATE ON public.question_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing data from questions table
INSERT INTO public.question_options (question_id, option_letter, option_text, points, order_position)
SELECT 
  q.id as question_id,
  opt.key as option_letter,
  COALESCE(opt.value->>'text', opt.value::text) as option_text,
  COALESCE((q.points_mapping->>opt.key)::numeric, 0) as points,
  CASE opt.key 
    WHEN 'A' THEN 1
    WHEN 'B' THEN 2
    WHEN 'C' THEN 3
    WHEN 'D' THEN 4
    WHEN 'E' THEN 5
    WHEN '1' THEN 1
    WHEN '2' THEN 2
    WHEN '3' THEN 3
    WHEN '4' THEN 4
    WHEN '5' THEN 5
    ELSE 1
  END as order_position
FROM public.questions q
CROSS JOIN LATERAL jsonb_each(q.options) as opt(key, value)
WHERE q.options IS NOT NULL 
  AND q.question_type = 'multiple-choice';

-- For star-rating questions, migrate star_legends
INSERT INTO public.question_options (question_id, option_letter, option_text, points, order_position)
SELECT 
  q.id as question_id,
  star.key as option_letter,
  star.value::text as option_text,
  star.key::numeric as points,
  star.key::integer as order_position
FROM public.questions q
CROSS JOIN LATERAL jsonb_each_text(q.star_legends) as star(key, value)
WHERE q.star_legends IS NOT NULL 
  AND q.question_type = 'star-rating';