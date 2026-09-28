-- Atualizar pergunta 1
UPDATE logica_aplicada_questions SET
  question_text = 'O que é um algoritmo, da forma como aprendemos no curso?',
  option_a = 'Um tipo de software criado para automatizar processos',
  option_b = 'Uma linguagem de programação usada apenas por desenvolvedores',
  option_c = 'Um passo a passo organizado para chegar a um resultado',
  option_d = 'Um relatório com indicadores de desempenho de um processo',
  correct_option = 'C'
WHERE order_position = 1;

-- Atualizar pergunta 2
UPDATE logica_aplicada_questions SET
  question_text = 'Qual exemplo representa melhor o conceito de sequência?',
  option_a = 'Se a documentação estiver completa, siga para análise.',
  option_b = 'Pegar a frigideira → ligar o fogo → colocar óleo → quebrar o ovo → colocar no prato.',
  option_c = 'Enquanto houver lançamento pendente, continue conciliando.',
  option_d = 'Aprovar desconto apenas com autorização do gestor.',
  correct_option = 'B'
WHERE order_position = 2;

-- Atualizar pergunta 3
UPDATE logica_aplicada_questions SET
  question_text = 'Em lógica de processos, o que representa uma condição (SE / ENTÃO / SENÃO)?',
  option_a = 'Um dado variável que se altera conforme o cliente',
  option_b = 'Um agrupamento de informações geradas pelo sistema',
  option_c = 'Um ponto de decisão que avalia um critério e direciona o fluxo para caminhos distintos',
  option_d = 'Um conjunto de ações executadas obrigatoriamente na mesma ordem',
  correct_option = 'C'
WHERE order_position = 3;

-- Atualizar pergunta 4
UPDATE logica_aplicada_questions SET
  question_text = 'Qual frase abaixo é um exemplo de loop ou repetição, como vimos no curso?',
  option_a = 'Se o cliente estiver em dia, mostrar ''Cliente em dia''.',
  option_b = 'Registrar o pagamento do cliente no sistema.',
  option_c = 'Todo mês, enquanto houver lançamento pendente, continuar conciliando.',
  option_d = 'Encaminhar o caso para o jurídico.',
  correct_option = 'C'
WHERE order_position = 4;

-- Atualizar pergunta 5
UPDATE logica_aplicada_questions SET
  question_text = 'O que são variáveis?',
  option_a = 'Uma ação automatizada que sempre executa o mesmo comportamento',
  option_b = 'Um elemento fixo do sistema que não sofre alterações',
  option_c = 'Um dado armazenado cujo valor pode mudar ao longo do processo, conforme o contexto ou regras definidas',
  option_d = 'Um recurso visual usado apenas para documentar o fluxo do processo',
  correct_option = 'C'
WHERE order_position = 5;

-- Atualizar pergunta 6
UPDATE logica_aplicada_questions SET
  question_text = 'No fluxograma, o losango representa:',
  option_a = 'O início ou o fim de um processo',
  option_b = 'Uma ação/tarefa',
  option_c = 'Uma decisão de sim ou não',
  option_d = 'Um relatório de saída',
  correct_option = 'C'
WHERE order_position = 6;

-- Atualizar pergunta 7
UPDATE logica_aplicada_questions SET
  question_text = E'Na Prompt Clinic, o exemplo:\n"Cody, monta uma proposta pro cliente, revise um contrato, vê um imposto que talvez esteja errado e ainda faz um resumo pro comitê… vê tudo isso aí pra mim rapidinho."\nfoi chamado de:',
  option_a = 'Pedido Lógico',
  option_b = 'Pedido Contraditório',
  option_c = 'Pedido Caótico',
  option_d = 'Pedido Técnico',
  correct_option = 'C'
WHERE order_position = 7;

-- Atualizar pergunta 8
UPDATE logica_aplicada_questions SET
  question_text = 'Segundo o que aprendemos no curso, o que torna um pedido bem estruturado para a IA (como a Cody)?',
  option_a = 'Um pedido curto e direto, deixando a IA decidir abordagem, formato e profundidade',
  option_b = 'Um pedido detalhado apenas no tema, sem definir expectativas de entrega',
  option_c = 'Definir o papel da IA, o contexto, o que deve ser entregue e possíveis limites de tamanho ou tom',
  option_d = 'Um pedido escrito majoritariamente em linguagem técnica, assumindo que isso garante melhor entendimento',
  correct_option = 'C'
WHERE order_position = 8;

-- Atualizar pergunta 9
UPDATE logica_aplicada_questions SET
  question_text = 'No contexto do curso, como o pseudocódigo se diferencia de um código de programação tradicional?',
  option_a = 'Ele já segue regras rígidas de sintaxe e pode ser executado diretamente pelo sistema',
  option_b = 'Ele substitui o fluxograma e elimina a necessidade de pensar em lógica',
  option_c = 'Ele descreve a lógica de forma estruturada e legível, sem depender de uma linguagem específica',
  option_d = 'Ele é usado apenas para registrar erros ou limitações da IA',
  correct_option = 'C'
WHERE order_position = 9;

-- Atualizar pergunta 10
UPDATE logica_aplicada_questions SET
  question_text = 'Por que desenhar um fluxograma antes de automatizar um processo?',
  option_a = 'Atender exigências formais e documentais da empresa',
  option_b = 'Melhorar a comunicação visual em apresentações',
  option_c = 'Tornar explícitas dependências, decisões e repetições, reduzindo ambiguidades antes da automação',
  option_d = 'Substituir o alinhamento com as áreas envolvidas, já que o processo fica autoexplicativo',
  correct_option = 'C'
WHERE order_position = 10;