import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
    id: 1,
    question: "Quando uma nova ferramenta digital é lançada na empresa, você...",
    options: [
      { letter: "A", text: "Prefiro esperar orientações ou alguém usar primeiro antes de se envolver.", points: 0.0 },
      { letter: "B", text: "Me sinto inseguro, Gosta de entender como aquilo se conecta com o que já conhece.", points: 1.0 },
      { letter: "C", text: "Explora por conta própria para ver se tem utilidade.", points: 2.5 },
      { letter: "D", text: "Aplica em alguma tarefa e vê na prática se vale a pena.", points: 3.7 },
      { letter: "E", text: "Avalia se a novidade pode contribuir para processos mais consistentes no time.", points: 5.0 }
    ]
  },
  {
    id: 2,
    question: "Ao ajudar um colega com uma ferramenta que você já usou...",
    options: [
      { letter: "A", text: "Nunca ajudei, geralmente prefiro que outra pessoa mais experiente oriente.", points: 0.0 },
      { letter: "B", text: "Tenta entender a dúvida e sugere um caminho para seguir.", points: 1.0 },
      { letter: "C", text: "Mostra rapidamente como você costuma usar e incentiva ele a tentar.", points: 2.5 },
      { letter: "D", text: "Explica detalhadamente, adaptando à necessidade específica dele.", points: 3.7 },
      { letter: "E", text: "Cria um guia ou template que pode ajudar não só ele, mas outros colegas.", points: 5.0 }
    ]
  },
  {
    id: 3,
    question: "Quando precisa aprender algo novo e complexo...",
    options: [
      { letter: "A", text: "Fico um pouco travado no início e espero alguém mostrar como começar.", points: 0.0 },
      { letter: "B", text: "Procura alguém que já fez e tenta entender como aplicou.", points: 1.0 },
      { letter: "C", text: "Assiste vídeos, lê artigos e testa por conta própria.", points: 2.5 },
      { letter: "D", text: "Aplica direto em um projeto real para aprender fazendo.", points: 3.7 },
      { letter: "E", text: "Aprende, aplica e adapta para que outros também possam usar.", points: 5.0 }
    ]
  },
  {
    id: 4,
    question: "Sobre ferramentas de IA como ChatGPT ou Copilot:",
    options: [
      { letter: "A", text: "Já ouvi falar, mas ainda não explorei por não saber exatamente como começar.", points: 0.0 },
      { letter: "B", text: "Ainda está conhecendo e prefere observar como outros usam.", points: 1.0 },
      { letter: "C", text: "Já experimentou para tarefas simples ou gerar ideias.", points: 2.5 },
      { letter: "D", text: "Usa regularmente para otimizar tarefas do seu trabalho.", points: 3.7 },
      { letter: "E", text: "Integra em processos importantes e compartilha métodos eficientes com o time.", points: 5.0 }
    ]
  }
];

interface QuizDigitalProps {
  onClose: () => void;
}

export const QuizDigital = ({ onClose }: QuizDigitalProps) => {
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para salvar as respostas.",
          variant: "destructive"
        });
        return;
      }

      // Get user profile to get name and email
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome, email')
        .eq('user_id', user.id)
        .single();

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

      // Insert response record
      const { error } = await supabase
        .from('respostas')
        .insert({
          nome: profile?.nome || 'Usuário',
          email: profile?.email || '',
          respostas: JSON.stringify(responsesData)
        });

      if (error) {
        console.error('Error saving quiz responses:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar suas respostas. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      setIsCompleted(true);
      toast({
        title: "Quiz concluído!",
        description: "Suas respostas foram salvas com sucesso.",
      });

    } catch (error) {
      console.error('Error submitting quiz:', error);
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
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-card/90 backdrop-blur-xl border-secondary/50">
          <CardContent className="text-center space-y-6 p-8">
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-primary mb-2">Quiz Concluído!</h2>
              <p className="text-muted-foreground">
                Suas respostas foram registradas com sucesso. Continue explorando seus desafios!
              </p>
            </div>
            <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
              Voltar aos Desafios
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestionData = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-card/90 backdrop-blur-xl border-secondary/50">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-primary">Quiz de Avaliação Digital</CardTitle>
            <Button variant="outline" onClick={onClose} size="sm">
              ✕
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-secondary/20 rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            Pergunta {currentQuestion + 1} de {quizQuestions.length}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-6">
              {currentQuestionData.question}
            </h3>

            <RadioGroup
              value={answers[currentQuestionData.id] || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestionData.id, value)}
              className="space-y-4"
            >
              {currentQuestionData.options.map((option) => (
                <div key={option.letter} className="flex items-start space-x-3 p-4 rounded-lg border border-secondary/30 hover:border-secondary/60 transition-colors">
                  <RadioGroupItem value={option.letter} id={`q${currentQuestionData.id}-${option.letter}`} />
                  <Label 
                    htmlFor={`q${currentQuestionData.id}-${option.letter}`}
                    className="flex-1 cursor-pointer leading-relaxed"
                  >
                    <span className="font-medium text-primary mr-2">{option.letter})</span>
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {currentQuestion === quizQuestions.length - 1 ? (
              <Button
                onClick={submitQuiz}
                disabled={!answers[currentQuestionData.id] || isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? "Salvando..." : "Finalizar Quiz"}
              </Button>
            ) : (
              <Button
                onClick={goToNextQuestion}
                disabled={!answers[currentQuestionData.id]}
                className="bg-primary hover:bg-primary/90"
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};