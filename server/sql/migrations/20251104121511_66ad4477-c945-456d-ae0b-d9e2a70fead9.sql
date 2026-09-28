-- Permitir admins deletarem participantes do Quiz 1
CREATE POLICY "Admins can delete quiz1 participants"
ON public.codigo_f_participants
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir admins deletarem respostas do Quiz 1
CREATE POLICY "Admins can delete quiz1 answers"
ON public.codigo_f_answers
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir admins deletarem submissões do Quiz 2
CREATE POLICY "Admins can delete quiz2 submissions"
ON public.quiz2_submissions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir admins deletarem participantes do Quiz 3
CREATE POLICY "Admins can delete quiz3 participants"
ON public.quiz3_participants
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir admins deletarem respostas do Quiz 3
CREATE POLICY "Admins can delete quiz3 answers"
ON public.quiz3_answers
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));