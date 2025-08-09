-- Adicionar política para admins verem todos os progressos de usuários
CREATE POLICY "Admins can view all user progress" 
ON public.user_progress 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));