INSERT INTO mission4_questions (
  question_id,
  question_text,
  question_type,
  softwares,
  star_legends,
  target_area_ids
) VALUES (
  718,
  'Queremos conhecer um pouco mais do seu conhecimento nas ferramentas que você usa na sua área.',
  'star-rating',
  ARRAY['Docusign'],
  '{
    "1": {"text": "Não utilizo/Não aplicável", "points": 0},
    "2": {"text": "Nunca usei ou conheço muito pouco", "points": 1}, 
    "3": {"text": "Sei o básico, consigo realizar tarefas simples", "points": 2},
    "4": {"text": "Consigo usar funções intermediárias com segurança", "points": 3},
    "5": {"text": "Sou expert e consigo ensinar e otimizar o uso da ferramenta", "points": 4}
  }'::jsonb,
  ARRAY['7946fd1a-9763-40e4-95d1-9edbd419b1e0'::uuid]
);