INSERT INTO mission4_questions (
  question_id,
  question_text,
  question_type,
  softwares,
  star_legends,
  target_area_ids
) VALUES (
  719,
  'Queremos conhecer um pouco mais do seu conhecimento nas ferramentas que você usa na sua área.',
  'star-rating',
  ARRAY['AnyDesk', 'Active Directory', 'CoreView', 'SharePoint', 'OneDrive', 'VPN', 'Microsoft 365', 'Netcop', 'Power BI Desktop', 'Power Automate', 'Power Queries', 'Planner', 'MFA (Autenticação Multifator)', 'Firewall', 'Windows Defender', 'GLPI / CSC', 'Portais (integra e sistemas do BPO)', 'Portais de administração do Microsoft 365', 'PowerApps'],
  '{
    "1": {"text": "Não utilizo/Não aplicável", "points": 0},
    "2": {"text": "Nunca usei ou conheço muito pouco", "points": 1}, 
    "3": {"text": "Sei o básico, consigo realizar tarefas simples", "points": 2},
    "4": {"text": "Consigo usar funções intermediárias com segurança", "points": 3},
    "5": {"text": "Sou expert e consigo ensinar e otimizar o uso da ferramenta", "points": 4}
  }'::jsonb,
  ARRAY['3eef1201-edc0-4bd7-ab31-f838b0577d62'::uuid]
);