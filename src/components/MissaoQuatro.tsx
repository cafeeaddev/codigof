import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { StarRating } from './StarRating';
import { useMission4Questions } from '@/hooks/useMission4Questions';
import { useAreas } from '@/hooks/useAreas';

interface MissaoQuatroProps {
  onComplete: () => void;
}

export const MissaoQuatro = ({ onComplete }: MissaoQuatroProps) => {
  const { profile, user } = useAuth();
  const { getAreaById } = useAreas();
  
  // Obter o objeto área completo baseado no area_id do perfil
  const userArea = getAreaById((profile as any)?.area_id);
  
  console.log('MissaoQuatro - profile:', profile);
  console.log('MissaoQuatro - userArea:', userArea);
  
  // Buscar perguntas da missão 4 com base na área do usuário
  const { questions: dbQuestions, isLoading: loadingQuestions, error } = useMission4Questions(userArea?.id);
  
  // Convert to the format expected by the component
  const questions = dbQuestions.map(q => ({
    id: q.id,
    question: q.question_text,
    type: q.question_type === 'star-rating' ? 'star-rating' : 'regular',
    softwares: q.softwares || [],
    starLegends: q.star_legends || {},
    options: q.options ? Object.entries(q.options).map(([letter, option]: [string, any]) => ({
      letter,
      text: option.text,
      points: option.points
    })) : []
  }));

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

      const { error: responseError } = await supabase
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

      if (responseError) throw responseError;

      // Update user progress to mark mission 4 as completed and add XP
      if (user) {
        const { data: existingProgress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        const currentXP = existingProgress?.total_xp || 0;

        // Verificar se todas as outras missões foram completadas para definir game_end_date
        const allMissionsCompleted = existingProgress?.missao_1_completed && 
                                    existingProgress?.missao_2_completed && 
                                    existingProgress?.missao_3_completed;

        const updateData: any = {
          user_id: user.id,
          missao_4_completed: true,
          total_xp: currentXP + 25, // Adicionar 25 XP da missão 4
          missao_4_current_question: currentQuestion + 1,
          missao_4_answers: answers,
          last_saved_at: new Date().toISOString()
        };

        // Se todas as missões estão completas, definir data de fim do jogo
        if (allMissionsCompleted) {
          updateData.game_end_date = new Date().toISOString();
        }

        const { error: progressError } = await supabase
          .from('user_progress')
          .upsert(updateData, {
            onConflict: 'user_id'
          });

        if (progressError) throw progressError;
      }

      toast({
        title: "Medalha conquistada: Galáxia"
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

  if (loadingQuestions) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Carregando perguntas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-destructive">Erro ao carregar perguntas: {error}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Nenhuma pergunta encontrada para sua área.</p>
      </div>
    );
  }

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
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="flex flex-col max-w-4xl mx-auto w-full p-3 pb-[calc(100px+env(safe-area-inset-bottom,0px))] min-h-full">
          {/* Progress Header - mais compacto */}
          <div className="mb-4 sticky top-0 bg-background z-10 pb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Pergunta {currentQuestion + 1} de {questions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            
            {/* Progress Bar with gradient */}
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="flex-1 min-h-0">
            <div className="bg-card rounded-lg p-4 md:p-6 border shadow-sm">
              <h3 className="text-base md:text-lg font-medium text-foreground mb-4 leading-relaxed">
                {currentQuestionData.question}
              </h3>

              {currentQuestionData.type === 'star-rating' ? (
                <div className="space-y-4">
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Avalie seu conhecimento em cada ferramenta usando as estrelas:
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {Object.entries(currentQuestionData.starLegends).map(([stars, legend]) => (
                        <div key={stars}>
                          <strong>{stars} estrela{stars !== '1' ? 's' : ''}:</strong> {(legend as { text: string }).text}
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
                  className="space-y-0.5"
                >
                  {currentQuestionData.options.map((option) => (
                    <div 
                      key={option.letter} 
                      className="flex items-start space-x-3 p-2 rounded-lg hover:bg-purple-500/20 cursor-pointer transition-colors duration-200"
                      onClick={() => handleAnswerSelect(currentQuestionData.id, option.letter)}
                    >
                      <RadioGroupItem
                        value={option.letter}
                        id={`q${currentQuestionData.id}-${option.letter}`}
                        className="mt-1 h-4 w-4"
                      />
                      <Label
                        htmlFor={`q${currentQuestionData.id}-${option.letter}`}
                        className="text-xs md:text-sm text-foreground cursor-pointer flex-1 leading-relaxed"
                      >
                        <span className="font-medium mr-2">{option.letter})</span>
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Fixed Navigation Buttons */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-background border-t-2 border-primary/30 z-[100]"
        style={{ 
          minHeight: '90px',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.3)'
        }}
      >
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-4 px-4 py-4 h-full">
          <Button
            type="button"
            onClick={() => goToPreviousQuestion()}
            disabled={currentQuestion === 0}
            variant="outline"
            className="flex items-center space-x-2 min-w-[120px] h-12 text-base font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Anterior</span>
          </Button>
          {currentQuestion === questions.length - 1 ? (
            <Button
              type="button"
              onClick={() => submitQuiz()}
              disabled={isSubmitting || progress < 100}
              className="flex items-center space-x-2 min-w-[120px] h-12 text-base font-medium bg-primary hover:bg-primary/90"
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
              className="flex items-center space-x-2 min-w-[120px] h-12 text-base font-medium bg-primary hover:bg-primary/90"
            >
              <span>Próxima</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};