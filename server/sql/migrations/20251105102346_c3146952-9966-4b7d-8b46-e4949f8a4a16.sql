-- Create table for Quiz 5 - Mapa da Alfabetização Tecnológica
CREATE TABLE quiz5_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_name text NOT NULL,
  initials text NOT NULL,
  mindset_change text NOT NULL,
  digital_idea text NOT NULL,
  digital_habit text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quiz5_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view quiz5 submissions"
ON quiz5_submissions
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert quiz5 submissions"
ON quiz5_submissions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can delete quiz5 submissions"
ON quiz5_submissions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));