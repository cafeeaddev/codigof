-- Remover role de admin da Nawana (ela deve ser usuária regular, não admin)
DELETE FROM user_roles 
WHERE user_id = '600d753e-641a-4b06-a430-bbc50cd654a2' 
AND role = 'admin';