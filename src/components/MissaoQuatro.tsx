import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MissaoQuatroProps {
  onComplete: () => void;
}

const questions = [
  {
    id: 1,
    question: "Word",
    options: [
      { value: "a", text: "Uso o Word para o básico, como escrever textos simples.", points: 0.0 },
      { value: "b", text: "Uso para textos simples, como cartas e relatórios curtos.", points: 1.0 },
      { value: "c", text: "Sei usar estilos, sumário automático e recursos de formatação mais avançados.", points: 2.5 },
      { value: "d", text: "Utilizo recursos como mala direta, controle de alterações e formatação corporativa.", points: 3.7 },
      { value: "e", text: "Crio modelos profissionais, configurando normas e recursos avançados para equipes.", points: 5.0 }
    ]
  },
  {
    id: 2,
    question: "PowerPoint",
    options: [
      { value: "a", text: "Consigo fazer apresentações simples", points: 0.0 },
      { value: "b", text: "Crio apresentações com textos e imagens.", points: 1.0 },
      { value: "c", text: "Uso animações, transições e layouts personalizados.", points: 2.5 },
      { value: "d", text: "Desenvolvo apresentações estruturadas para reuniões, com vídeos e gráficos.", points: 3.7 },
      { value: "e", text: "Crio templates institucionais, apresentações narrativas e visual storytelling.", points: 5.0 }
    ]
  },
  {
    id: 3,
    question: "Excel",
    options: [
      { value: "a", text: "Uso o Excel para tarefas simples, como organizar dados sem usar fórmulas.", points: 0.0 },
      { value: "b", text: "Conheço fórmulas básicas e formatação de tabelas.", points: 1.0 },
      { value: "c", text: "Uso funções intermediárias, filtros, gráficos e validações.", points: 2.5 },
      { value: "d", text: "Crio dashboards com PROC/VLOOKUP, tabelas dinâmicas e Power Query.", points: 3.7 },
      { value: "e", text: "Desenvolvo modelos automatizados, macros e soluções para múltiplos usuários.", points: 5.0 }
    ]
  },
  {
    id: 4,
    question: "Power BI",
    options: [
      { value: "a", text: "Já ouvi falar do Power BI, mas ainda não usei nem explorei a ferramenta.", points: 0.0 },
      { value: "b", text: "Conheço o nome ou assisti apresentações feitas com ele.", points: 1.0 },
      { value: "c", text: "Já criei relatórios simples com dados importados.", points: 2.5 },
      { value: "d", text: "Desenvolvo dashboards com DAX, filtros e visualizações interativas.", points: 3.7 },
      { value: "e", text: "Integro múltiplas fontes de dados e compartilho relatórios para tomada de decisão.", points: 5.0 }
    ]
  },
  {
    id: 5,
    question: "Power Automate",
    options: [
      { value: "a", text: "Nunca ouvi falar sobre essa ferramenta", points: 0.0 },
      { value: "b", text: "Nunca usei ou só ouvi falar.", points: 1.0 },
      { value: "c", text: "Testei fluxos simples, como alertas ou aprovações.", points: 2.5 },
      { value: "d", text: "Automatizei processos reais do meu trabalho.", points: 3.7 },
      { value: "e", text: "Crio fluxos conectando múltiplas ferramentas e oriento colegas.", points: 5.0 }
    ]
  },
  {
    id: 6,
    question: "SharePoint",
    options: [
      { value: "a", text: "Nunca acessei ao SharePoint.", points: 0.0 },
      { value: "b", text: "Já acessei páginas ou documentos, mas com uso pontual.", points: 1.0 },
      { value: "c", text: "Participo de equipes e bibliotecas compartilhadas.", points: 2.5 },
      { value: "d", text: "Organizo conteúdos, permissões e estrutura de sites.", points: 3.7 },
      { value: "e", text: "Administro ambientes SharePoint com fluxos, listas e integrações.", points: 5.0 }
    ]
  },
  {
    id: 7,
    question: "Power Apps",
    options: [
      { value: "a", text: "Ainda não ouvi falar sobre a ferramenta.", points: 0.0 },
      { value: "b", text: "Nunca usei ou só ouvi falar.", points: 1.0 },
      { value: "c", text: "Já explorei aplicativos prontos ou modelos.", points: 2.5 },
      { value: "d", text: "Criei apps simples para uso interno ou pessoal.", points: 3.7 },
      { value: "e", text: "Desenvolvo e publico aplicativos integrados com dados e processos da equipe.", points: 5.0 }
    ]
  },
  {
    id: 8,
    question: "Banco de Dados / SQL",
    options: [
      { value: "a", text: "Nunca tive contato com banco de dados/SQL.", points: 0.0 },
      { value: "b", text: "Já ouvi falar e tenho interesse em aprender mais.", points: 1.0 },
      { value: "c", text: "Já fiz consultas simples (SELECT, filtros, joins básicos).", points: 2.5 },
      { value: "d", text: "Realizo análises com queries intermediárias e múltiplas tabelas.", points: 3.7 },
      { value: "e", text: "Crio estruturas, mantenho bases e otimizações com SQL avançado.", points: 5.0 }
    ]
  },
  {
    id: 9,
    question: "Access",
    options: [
      { value: "a", text: "Nunca ouvi falar dessa ferramenta.", points: 0.0 },
      { value: "b", text: "Já abri arquivos Access, mas não utilizei ativamente.", points: 1.0 },
      { value: "c", text: "Entendo a estrutura de tabelas e relações.", points: 2.5 },
      { value: "d", text: "Crio formulários, consultas e relatórios simples.", points: 3.7 },
      { value: "e", text: "Desenvolvo bancos relacionais e soluções personalizadas.", points: 5.0 }
    ]
  },
  {
    id: 10,
    question: "ChatGPT / IA",
    options: [
      { value: "a", text: "Ainda não conheço nenhuma ferramenta de IA.", points: 0.0 },
      { value: "b", text: "Ainda não faz parte do meu dia a dia, mas já experimentei pelo menos uma IA.", points: 1.0 },
      { value: "c", text: "Uso para consultas ou inspiração.", points: 2.5 },
      { value: "d", text: "Aplico com foco em produtividade real.", points: 3.7 },
      { value: "e", text: "Crio fluxos ou soluções que combinam IA com outras ferramentas.", points: 5.0 }
    ]
  }
];

export const MissaoQuatro = ({ onComplete }: MissaoQuatroProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast({
        title: "Atenção",
        description: "Por favor, responda todas as perguntas antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate total score
      let totalScore = 0;
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        const option = question?.options.find(opt => opt.value === answer);
        if (option) {
          totalScore += option.points;
        }
      });

      // Get user info like the other missions do
      const currentUser = {
        nome: 'Nawana De Oliveira Marques Dos Santos',
        email: 'nawana.santos@forvismazars.com'
      };

      // Save responses to mission 4 table
      await supabase
        .from('respostas_missao4')
        .insert({
          nome: currentUser.nome,
          email: currentUser.email,
          respostas: {
            answers: answers,
            totalScore: totalScore
          }
        });

      toast({
        title: "Missão 4 concluída! +25 XP",
        description: `Você obteve ${totalScore.toFixed(1)} pontos em Ferramentas Digitais.`,
      });

      onComplete();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar respostas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const currentAnswer = answers[currentQ.id];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-primary text-sm font-mono font-bold">
                MISSÃO 4 - SEU RADAR DE FERRAMENTAS
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} de {questions.length}
            </span>
          </div>
          
          <Progress value={progress} className="w-full h-2 mb-4" />
          
          <CardTitle className="text-lg font-bold text-primary">
            {currentQ.id}. {currentQ.question}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <RadioGroup 
            value={currentAnswer || ""} 
            onValueChange={(value) => handleAnswer(currentQ.id, value)}
            className="space-y-4"
          >
            {currentQ.options.map((option) => (
              <div 
                key={option.value} 
                className="flex items-start space-x-3 p-3 rounded-lg border border-secondary/30 hover:border-primary/30 transition-colors"
              >
                <RadioGroupItem 
                  value={option.value} 
                  id={`${currentQ.id}-${option.value}`}
                  className="mt-1"
                />
                <Label 
                  htmlFor={`${currentQ.id}-${option.value}`}
                  className="flex-1 text-sm leading-relaxed cursor-pointer"
                >
                  <span className="font-semibold text-primary mr-2">
                    {option.value.toUpperCase()})
                  </span>
                  {option.text}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({option.points} pt{option.points !== 1 ? 's' : ''})
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between items-center pt-6 border-t border-secondary/30">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="w-24"
            >
              Anterior
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={!currentAnswer || isSubmitting}
                className="w-32"
              >
                {isSubmitting ? "Enviando..." : "Finalizar"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!currentAnswer}
                className="w-24"
              >
                Próxima
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};