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

      // Get user info from localStorage or context (since we're using profile-based auth)
      const currentUser = {
        nome: 'Nawana De Oliveira Marques Dos Santos',
        email: 'nawana.santos@forvismazars.com'
      };

      // Insert response record
      const { error } = await supabase
        .from('respostas')
        .insert({
          nome: currentUser.nome,
          email: currentUser.email,
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
        title: "Missão 1 concluída!",
        description: "Passando para a Missão 2...",
      });

      // Automatically progress to mission 2 after a delay
      setTimeout(() => {
        onClose(); // This will trigger showing mission 2
      }, 2000);

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
      <div className="h-full flex flex-col items-center justify-center space-y-4 p-4">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-primary" />
        </div>
        <div className="text-center">
          <h4 className="text-lg font-bold text-primary mb-1">
            Missão Concluída!
          </h4>
          <p className="text-sm text-muted-foreground">
            Suas respostas foram salvas. Próxima missão em breve.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestionData = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground mb-1">Como você encara o digital?</h3>
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

      <div className="flex-1 flex flex-col">
        <h4 className="text-base font-medium text-foreground mb-4">
          {currentQuestionData.question}
        </h4>

        <div className="flex-1 overflow-y-auto">
          <RadioGroup
            value={answers[currentQuestionData.id] || ""}
            onValueChange={(value) => handleAnswerSelect(currentQuestionData.id, value)}
            className="space-y-2"
          >
            {currentQuestionData.options.map((option) => (
              <div key={option.letter} className="flex items-start space-x-2 p-2 rounded hover:bg-muted/20">
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

        <div className="flex justify-between mt-4 pt-4 border-t border-secondary/30">
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
              {isSubmitting ? 'Enviando...' : 'Finalizar'}
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
    </div>
  );
};