-- Corrigir "Netcop" para "Netcorp" nas respostas da missão 4
UPDATE respostas_missao4 
SET respostas = jsonb_set(
  respostas,
  '{starRatings}',
  (
    SELECT jsonb_object_agg(
      question_id,
      (
        SELECT jsonb_object_agg(
          CASE WHEN software_name = 'Netcop' THEN 'Netcorp' ELSE software_name END,
          rating
        )
        FROM jsonb_each(software_ratings) AS software_data(software_name, rating)
      )
    )
    FROM jsonb_each(respostas->'starRatings') AS question_data(question_id, software_ratings)
  )
)
WHERE respostas::text LIKE '%Netcop%';