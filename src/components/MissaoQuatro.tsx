import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { getMission4QuestionsForUser } from '@/data/questions';
import { StarRating } from './StarRating';

interface MissaoQuatroProps {
  onComplete: () => void;
}

export const MissaoQuatro = ({ onComplete }: MissaoQuatroProps) => {
  const { profile, user } = useAuth();
  
  // Get questions based on user's area
  const questions = useMemo(() => {
    const userQuestions = getMission4QuestionsForUser(profile?.area);
    // Convert to the format expected by the component
    return userQuestions.map(q => ({
      id: q.id,
      question: q.question,
      type: (q as any).type || 'regular',
      softwares: (q as any).softwares || [],
      starLegends: (q as any).starLegends || {},
      options: q.options ? Object.entries(q.options).map(([letter, option]) => ({
        letter,
        text: option.text,
        points: option.points
      })) : []
    }));
  }, [profile?.area]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [starRatings, setStarRatings] = useState<Record<number, Record<string, number>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerSelect = (questionId: number, optionLetter: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  const handleStarRatingChange = (questionId: number, software: string, rating: number) => {
    setStarRatings(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [software]: rating
      }
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    // Validate regular questions
    const regularQuestions = questions.filter(q => q.type !== 'star-rating');
    const starRatingQuestions = questions.filter(q => q.type === 'star-rating');
    
    if (Object.keys(answers).length !== regularQuestions.length) {
      toast({
        title: "Atenção",
        description: "Por favor, responda todas as perguntas antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    // Validate star rating questions (all softwares must be rated)
    for (const question of starRatingQuestions) {
      const ratings = starRatings[question.id];
      const allSoftwaresRated = question.softwares.every(software => 
        ratings && ratings[software] && ratings[software] > 0
      );
      if (!allSoftwaresRated) {
        toast({
          title: "Atenção",
          description: "Por favor, avalie todas as ferramentas na questão de avaliação.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Calculate total score
      let totalScore = 0;
      
      // Score from regular questions
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        const option = question?.options.find(opt => opt.letter === answer);
        if (option) {
          totalScore += option.points;
        }
      });

      // Score from star rating questions
      Object.entries(starRatings).forEach(([questionId, ratings]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        if (question?.type === 'star-rating') {
          Object.values(ratings).forEach(rating => {
            const legendData = question.starLegends[rating];
            if (legendData) {
              totalScore += legendData.points;
            }
          });
        }
      });

      // Get user info from auth context
      const currentUser = {
        nome: profile?.nome || 'Usuário',
        email: profile?.email || 'email@exemplo.com'
      };

      // Save responses to mission 4 table with user_id
      if (!user?.id) {
        toast({
          title: "Erro de autenticação",
          description: "Não foi possível identificar o usuário. Faça login novamente.",
          variant: "destructive"
        });
        return;
      }

      await supabase
        .from('respostas_missao4')
        .insert({
          nome: profile?.nome || 'Usuário',
          email: profile?.email || 'email@exemplo.com',
          user_id: user.id,
          respostas: {
            answers: answers,
            starRatings: starRatings,
            totalScore: totalScore
          }
        });

      // Update user progress to mark mission 4 as completed and add XP
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
              missao_4_completed: true,
              total_xp: (existingProgress.total_xp || 0) + 25
            })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('user_progress')
            .insert({
              user_id: user.id,
              missao_4_completed: true,
              total_xp: 25
            });
        }
      }

      toast({
        title: "Medalha conquistada: Galáxia",
        description: "Você explorou uma galáxia inteira. Imensidão sob controle!"
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

  const currentQuestionData = questions[currentQuestion];
  
  // Calculate progress considering both regular answers and star ratings
  let answeredCount = Object.keys(answers).length;
  const starRatingQuestions = questions.filter(q => q.type === 'star-rating');
  starRatingQuestions.forEach(question => {
    const ratings = starRatings[question.id];
    // Check if ALL softwares in the question have been rated (not just one)
    const allSoftwaresRated = question.softwares.every(software => 
      ratings && ratings[software] && ratings[software] > 0
    );
    if (allSoftwaresRated) {
      answeredCount++;
    }
  });
  
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="h-full flex flex-col min-h-0">
      <ScrollArea className="flex-1">
        <div className="p-2 pb-28" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)' }}>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">
                Pergunta {currentQuestion + 1} de {questions.length}
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

            {currentQuestionData.type === 'star-rating' ? (
              <div className="space-y-4">
                <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Avalie seu conhecimento em cada ferramenta usando as estrelas:
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {Object.entries(currentQuestionData.starLegends).map(([stars, legend]) => (
                      <div key={stars}>
                        <strong>{stars} estrela{stars !== '1' ? 's' : ''}:</strong> {(legend as any).text}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {currentQuestionData.softwares.map((software) => (
                    <StarRating
                      key={software}
                      software={software}
                      value={starRatings[currentQuestionData.id]?.[software] || 0}
                      onChange={(rating) => handleStarRatingChange(currentQuestionData.id, software, rating)}
                      legends={currentQuestionData.starLegends}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <RadioGroup
                value={answers[currentQuestionData.id] || ""}
                onValueChange={(value) => handleAnswerSelect(currentQuestionData.id, value)}
                className="space-y-3"
              >
                {currentQuestionData.options.map((option) => (
                  <div key={option.letter} className="flex items-start space-x-2 p-3 md:p-2 rounded hover:bg-muted/20 cursor-pointer" onClick={() => handleAnswerSelect(currentQuestionData.id, option.letter)}>
                    <RadioGroupItem
                      value={option.letter}
                      id={`q${currentQuestionData.id}-${option.letter}`}
                      className="border-secondary mt-0.5 h-5 w-5 md:h-4 md:w-4"
                    />
                    <Label
                      htmlFor={`q${currentQuestionData.id}-${option.letter}`}
                      className="text-base md:text-sm text-foreground cursor-pointer flex-1 leading-relaxed"
                    >
                      <span className="font-medium text-primary mr-1">{option.letter})</span>
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            <div className="mt-4 pt-2 flex justify-between items-center">
              <Button
                type="button"
                onClick={() => goToPreviousQuestion()}
                disabled={currentQuestion === 0}
                variant="outline"
                size="sm"
                className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                Anterior
              </Button>
              {currentQuestion === questions.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => submitQuiz()}
                  disabled={isSubmitting || (
                    currentQuestionData.type === 'star-rating' 
                      ? !currentQuestionData.softwares.every(software => 
                          starRatings[currentQuestionData.id]?.[software] > 0
                        )
                      : !answers[currentQuestionData.id]
                  )}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? 'Enviando...' : 'Finalizar Missão 4'}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => goToNextQuestion()}
                  disabled={
                    currentQuestionData.type === 'star-rating' 
                      ? !currentQuestionData.softwares.every(software => 
                          starRatings[currentQuestionData.id]?.[software] > 0
                        )
                      : !answers[currentQuestionData.id]
                  }
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
      </ScrollArea>
    </div>
  );
};