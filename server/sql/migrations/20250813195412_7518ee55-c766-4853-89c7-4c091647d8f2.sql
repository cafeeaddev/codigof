-- Remover perguntas duplicadas 10-18 que são duplicações das perguntas universais 1-9
-- As perguntas universais (1-9) devem ser usadas para todas as áreas
-- Manter apenas as perguntas específicas de star-rating (19 para AUDITORIA, 20 para MARKETING)

DELETE FROM mission4_questions 
WHERE id BETWEEN 10 AND 18;