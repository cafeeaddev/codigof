INSERT INTO public.mission4_questions (
  question_id,
  question_text,
  question_type,
  target_areas,
  softwares,
  star_legends
) VALUES (
  712,
  'Queremos conhecer um pouco mais do seu conhecimento nas ferramentas que você usa na sua área.',
  'star-rating',
  ARRAY['MARKETING'],
  ARRAY[
    'Pacote adobe (Indesign, Photoshop, Illustrator, Premiere, After effects, Acrobat)',
    'Canva - Rd station (E-mail marketing)',
    'Ferramentas google (Ads, Analytics)',
    'Power apps (Bi, Automate)',
    'Qualtrics (ferramenta de pesquisa)',
    'Clipchamp (gerador de voz ia)'
  ],
  '{
    "1": {"text": "Não utilizo/Não aplicável", "points": 0},
    "2": {"text": "Nunca usei ou conheço muito pouco", "points": 1},
    "3": {"text": "Sei o básico, consigo realizar tarefas simples", "points": 2},
    "4": {"text": "Consigo usar funções intermediárias com segurança", "points": 3},
    "5": {"text": "Sou expert e consigo ensinar e otimizar o uso da ferramenta", "points": 4}
  }'
);