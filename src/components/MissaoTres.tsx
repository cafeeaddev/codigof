import { useState } from 'react';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

interface QuizQuestion {
  id: number;
  question: string;
  options: {
    letter: string;
    text: string;
    points: number;
  }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 8,
    question: "Quando surge um problema fora da sua zona de conforto: (um novo desafio)",
    options: [
      { letter: "A", text: "Prefiro observar como os outros resolvem antes de tentar.", points: 0.0 },
      { letter: "B", text: "Observa como os outros resolvem e aprende com isso.", points: 1.0 },
      { letter: "C", text: "Dá sugestões com base em situações parecidas que viveu.", points: 2.5 },
      { letter: "D", text: "Testa uma solução prática com base no que conhece.", points: 3.7 },
      { letter: "E", text: "Estrutura uma proposta e comunica aprendizados com o grupo.", points: 5.0 }
    ]
  },
  {
    id: 9,
    question: "Em relação a novidades tecnológicas:",
    options: [
      { letter: "A", text: "Geralmente não busco novidades, prefiro focar no que já conheço bem.", points: 0.0 },
      { letter: "B", text: "Gosta de se informar, mesmo que não aplique diretamente.", points: 1.0 },
      { letter: "C", text: "Testa novas ferramentas quando vê potencial.", points: 2.5 },
      { letter: "D", text: "Acompanha tendências e busca aplicar no que faz.", points: 3.7 },
      { letter: "E", text: "Explora inovações que possam trazer ganhos para o time.", points: 5.0 }
    ]
  },
  {
    id: 10,
    question: "Quando participa de um projeto com foco digital:",
    options: [
      { letter: "A", text: "Prefiro contribuir quando recebo instruções claras e específicas.", points: 0.0 },
      { letter: "B", text: "Contribui melhor quando as tarefas já estão bem definidas.", points: 1.0 },
      { letter: "C", text: "Atua dentro da sua área de domínio com segurança.", points: 2.5 },
      { letter: "D", text: "Entrega com autonomia e propõe soluções práticas.", points: 3.7 },
      { letter: "E", text: "Colabora de forma estratégica, conectando pessoas e ferramentas.", points: 5.0 }
    ]
  },
  {
    id: 11,
    question: "Diante de uma nova ferramenta de automação:",
    options: [
      { letter: "A", text: "Ainda não usei essa ferramenta e prefiro focar nas tarefas que já conheço.", points: 0.0 },
      { letter: "B", text: "Prefere esperar orientações claras antes de usar.", points: 1.0 },
      { letter: "C", text: "Testa funcionalidades básicas em uma situação controlada.", points: 2.5 },
      { letter: "D", text: "Aplica em um processo conhecido para validar resultados.", points: 3.7 },
      { letter: "E", text: "Cria fluxos úteis e compartilha com quem possa se beneficiar.", points: 5.0 }
    ]
  },
  {
    id: 12,
    question: "Pensando no seu dia a dia atual:",
    options: [
      { letter: "A", text: "Cumpro minhas tarefas e não acompanho muito as novidades digitais.", points: 0.0 },
      { letter: "B", text: "Cumpre bem suas atividades e acompanha as mudanças.", points: 1.0 },
      { letter: "C", text: "Colabora com iniciativas digitais quando tem espaço.", points: 2.5 },
      { letter: "D", text: "Propõe soluções digitais aplicadas ao trabalho.", points: 3.7 },
      { letter: "E", text: "Atua conectando pessoas, processos e tecnologia em mudanças maiores.", points: 5.0 }
    ]
  }
];

interface MissaoTresProps {
  onComplete: () => void;
}

export const MissaoTres = ({ onComplete }: MissaoTresProps) => {
  const { profile, user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerSelect = (questionId: number, optionLetter: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length !== quizQuestions.length) {
      toast({
        title: "Quiz incompleto",
        description: "Por favor, responda todas as perguntas antes de finalizar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare responses as JSON string
      const responsesData = quizQuestions.map(question => {
        const selectedOption = answers[question.id];
        const option = question.options.find(opt => opt.letter === selectedOption);
        
        return {
          pergunta: question.id,
          resposta: selectedOption,
          pontuacao: option?.points || 0
        };
      });

      // Get user info from auth context
      const currentUser = {
        nome: profile?.nome || 'Usuário',
        email: profile?.email || 'email@exemplo.com'
      };

      // Insert response record for mission 3 with user_id
      if (!user?.id) {
        toast({
          title: "Erro de autenticação",
          description: "Não foi possível identificar o usuário. Faça login novamente.",
          variant: "destructive"
        });
        return;
      }

      const { error: responseError } = await supabase
        .from('respostas_missao3')
        .insert({
          nome: profile?.nome || 'Usuário',
          email: profile?.email || 'email@exemplo.com',
          user_id: user.id,
          respostas: responsesData
        });

      if (responseError) {
        console.error('Error saving mission 3 response:', responseError);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar sua resposta. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Update user progress and add XP
      
      if (user) {
        const { data: existingProgress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingProgress) {
          await supabase
            .from('user_progress')
            .update({
              missao_3_completed: true,
              total_xp: existingProgress.total_xp + 25
            })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('user_progress')
            .insert({
              user_id: user.id,
              missao_3_completed: true,
              total_xp: 25
            });
        }
      }

      setIsCompleted(true);
      toast({
        title: "Missão 3 concluída! +25 XP",
        description: "Parabéns! Suas respostas foram salvas.",
      });

      // Automatically complete after a delay
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      console.error('Error submitting mission 3 quiz:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar o quiz. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 p-4">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-primary" />
        </div>
        <div className="text-center">
          <h4 className="text-lg font-bold text-primary mb-1">
            Missão 3 Concluída!
          </h4>
          <p className="text-sm text-muted-foreground">
            Suas respostas foram salvas com sucesso.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestionData = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 pb-20">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground mb-1">Desafios e inovação</h3>
            <p className="text-sm text-muted-foreground">Missão 3 - Como você lida com novos desafios</p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">
                Pergunta {currentQuestion + 1} de {quizQuestions.length}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-secondary/20 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-base font-medium text-foreground mb-4">
              {currentQuestionData.question}
            </h4>

            <RadioGroup
              value={answers[currentQuestionData.id] || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestionData.id, value)}
              className="space-y-2"
            >
              {currentQuestionData.options.map((option) => (
                <div key={option.letter} className="flex items-start space-x-2 p-2 rounded hover:bg-muted/20 cursor-pointer" onClick={() => handleAnswerSelect(currentQuestionData.id, option.letter)}>
                  <RadioGroupItem
                    value={option.letter}
                    id={`q${currentQuestionData.id}-${option.letter}`}
                    className="border-secondary mt-0.5"
                  />
                  <Label
                    htmlFor={`q${currentQuestionData.id}-${option.letter}`}
                    className="text-xs text-foreground cursor-pointer flex-1 leading-relaxed"
                  >
                    <span className="font-medium text-primary mr-1">{option.letter})</span>
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </ScrollArea>
      
      <div className="flex justify-between p-4 pt-2 border-t border-secondary/30 bg-background">
        <Button
          onClick={goToPreviousQuestion}
          disabled={currentQuestion === 0}
          variant="outline"
          size="sm"
          className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
        >
          <ChevronLeft className="w-3 h-3 mr-1" />
          Anterior
        </Button>

        {currentQuestion === quizQuestions.length - 1 ? (
          <Button
            onClick={submitQuiz}
            disabled={!answers[currentQuestionData.id] || isSubmitting}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? 'Enviando...' : 'Finalizar Missão 3'}
          </Button>
        ) : (
          <Button
            onClick={goToNextQuestion}
            disabled={!answers[currentQuestionData.id]}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            Próxima
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};