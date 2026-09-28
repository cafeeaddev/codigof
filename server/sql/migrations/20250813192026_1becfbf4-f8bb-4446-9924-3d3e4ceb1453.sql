-- Insert new question for Risk & quality area
INSERT INTO public.mission4_questions (
  id,
  question_text,
  question_type,
  target_areas,
  softwares,
  star_legends
) VALUES (
  711,
  'Queremos conhecer um pouco mais do seu conhecimento nas ferramentas que você usa na sua área.',
  'star-rating',
  ARRAY['Risk & quality'],
  ARRAY['Arengibox', 'Compliance catalyst'],
  jsonb_build_object(
    '1', jsonb_build_object('text', 'Não utilizo/Não aplicável', 'points', 0),
    '2', jsonb_build_object('text', 'Nunca usei ou conheço muito pouco', 'points', 1),
    '3', jsonb_build_object('text', 'Sei o básico, consigo realizar tarefas simples', 'points', 2),
    '4', jsonb_build_object('text', 'Consigo usar funções intermediárias com segurança', 'points', 3),
    '5', jsonb_build_object('text', 'Sou expert e consigo ensinar e otimizar o uso da ferramenta', 'points', 4)
  )
);