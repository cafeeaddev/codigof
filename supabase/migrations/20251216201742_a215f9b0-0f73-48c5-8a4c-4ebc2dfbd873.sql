-- Redistribuir respostas corretas: A=3, B=3, C=2, D=2

-- Pergunta 1: C→A (trocar A↔C)
UPDATE logica_aplicada_questions SET
  option_a = 'Um passo a passo organizado para chegar a um resultado',
  option_c = 'Um tipo de software criado para automatizar processos',
  correct_option = 'A'
WHERE order_position = 1;

-- Pergunta 3: C→D (trocar C↔D)
UPDATE logica_aplicada_questions SET
  option_c = 'Um conjunto de ações executadas obrigatoriamente na mesma ordem',
  option_d = 'Um ponto de decisão que avalia um critério e direciona o fluxo para caminhos distintos',
  correct_option = 'D'
WHERE order_position = 3;

-- Pergunta 4: C→A (trocar A↔C)
UPDATE logica_aplicada_questions SET
  option_a = 'Todo mês, enquanto houver lançamento pendente, continuar conciliando.',
  option_c = 'Se o cliente estiver em dia, mostrar "Cliente em dia".',
  correct_option = 'A'
WHERE order_position = 4;

-- Pergunta 6: C→B (trocar B↔C)
UPDATE logica_aplicada_questions SET
  option_b = 'Uma decisão de sim ou não',
  option_c = 'Uma ação/tarefa',
  correct_option = 'B'
WHERE order_position = 6;

-- Pergunta 7: C→D (trocar C↔D)
UPDATE logica_aplicada_questions SET
  option_c = 'Pedido Técnico',
  option_d = 'Pedido Caótico',
  correct_option = 'D'
WHERE order_position = 7;

-- Pergunta 8: C→A (trocar A↔C)
UPDATE logica_aplicada_questions SET
  option_a = 'Definir o papel da IA, o contexto, o que deve ser entregue e possíveis limites de tamanho ou tom',
  option_c = 'Um pedido curto e direto, deixando a IA decidir abordagem, formato e profundidade',
  correct_option = 'A'
WHERE order_position = 8;

-- Pergunta 10: C→B (trocar B↔C)
UPDATE logica_aplicada_questions SET
  option_b = 'Tornar explícitas dependências, decisões e repetições, reduzindo ambiguidades antes da automação',
  option_c = 'Melhorar a comunicação visual em apresentações',
  correct_option = 'B'
WHERE order_position = 10;