import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useMissionQuestions } from '@/hooks/useMissionQuestions';


interface QuizQuestion {
  id: number;
  question: string;
  options: {
    letter: string;
    text: string;
    points: number;
  }[];
}


interface QuizDigitalProps {
  onClose: () => void;
  userId?: string;
}

export const QuizDigital = ({ onClose, userId }: QuizDigitalProps) => {
  const { user: authUser, profile } = useAuth();
  const { questions: dbQuestions, isLoading: questionsLoading } = useMissionQuestions(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Converter dados do banco para o formato do QuizDigital
  const quizQuestions: QuizQuestion[] = dbQuestions.map(q => ({
    id: q.id,
    question: q.question_text,
    options: q.options.map(opt => ({
      letter: opt.option_letter,
      text: opt.option_text,
      points: Number(opt.points)
    }))
  }));

  // Carregar progresso salvo ao iniciar com validações robustas
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const currentUserId = authUser?.id || userId;
        console.log('[QuizDigital] Loading progress for userId:', currentUserId);
        
        if (currentUserId && !questionsLoading && quizQuestions.length > 0) {
          const { data: progress, error } = await supabase
            .from('user_progress')
            .select('missao_1_current_question, missao_1_answers')
            .eq('user_id', currentUserId)
            .maybeSingle();

          console.log('[QuizDigital] Loaded progress data:', progress, 'error:', error);
          console.log('[QuizDigital] Available questions count:', quizQuestions.length);
          
          if (progress) {
            const savedQuestionIndex = (progress.missao_1_current_question as number) - 1;
            const savedAnswers = (progress.missao_1_answers as Record<number, string>) || {};
            
            // Validação robusta do índice da pergunta
            const validQuestionIndex = Math.max(0, Math.min(savedQuestionIndex, quizQuestions.length - 1));
            
            // Se o índice salvo é inválido, resetar progresso
            if (savedQuestionIndex < 0 || savedQuestionIndex >= quizQuestions.length) {
              console.warn('[QuizDigital] Invalid saved question index:', savedQuestionIndex, 'resetting to 0');
              setCurrentQuestion(0);
              setAnswers({});
              
              // Resetar progresso no banco
              await supabase
                .from('user_progress')
                .update({
                  missao_1_current_question: 1,
                  missao_1_answers: {}
                })
                .eq('user_id', currentUserId);
            } else {
              console.log('[QuizDigital] Setting valid question to:', validQuestionIndex, 'answers:', savedAnswers);
              setCurrentQuestion(validQuestionIndex);
              setAnswers(savedAnswers);
            }
          } else {
            console.log('[QuizDigital] No saved progress found, starting from beginning');
            setCurrentQuestion(0);
            setAnswers({});
          }
        } else {
          console.log('[QuizDigital] No userId or questions not ready, starting from beginning');
          setCurrentQuestion(0);
          setAnswers({});
        }
      } catch (error) {
        console.error('[QuizDigital] Error loading quiz progress:', error);
        // Em caso de erro, começar do início
        setCurrentQuestion(0);
        setAnswers({});
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [authUser, userId, questionsLoading, quizQuestions.length]);

  // Salvar progresso quando resposta for selecionada
  const saveProgress = async (questionIndex: number, newAnswers: Record<number, string>) => {
    try {
      const currentUserId = authUser?.id || userId;
      console.log('[QuizDigital] Saving progress for userId:', currentUserId, 'question:', questionIndex + 1, 'answers:', newAnswers);
      
      if (currentUserId) {
        const { data, error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: currentUserId,
            missao_1_current_question: questionIndex + 1,
            missao_1_answers: newAnswers
          }, {
            onConflict: 'user_id'
          });
        
        if (error) {
          console.error('[QuizDigital] Error saving quiz progress:', error);
        } else {
          console.log('[QuizDigital] Progress saved successfully:', data);
        }
      } else {
        console.log('[QuizDigital] No userId found, cannot save progress');
      }
    } catch (error) {
      console.error('[QuizDigital] Error saving progress:', error);
    }
  };

  const handleAnswerSelect = (questionId: number, optionLetter: string) => {
    const newAnswers = {
      ...answers,
      [questionId]: optionLetter
    };
    setAnswers(newAnswers);
    saveProgress(currentQuestion, newAnswers);
  };

  const goToNextQuestion = () => {
    const nextIndex = currentQuestion + 1;
    if (nextIndex < quizQuestions.length) {
      console.log('[QuizDigital] Moving to next question:', nextIndex);
      setCurrentQuestion(nextIndex);
    } else {
      console.warn('[QuizDigital] Cannot go to next question, already at last:', currentQuestion);
    }
  };

  const goToPreviousQuestion = () => {
    const prevIndex = currentQuestion - 1;
    if (prevIndex >= 0) {
      console.log('[QuizDigital] Moving to previous question:', prevIndex);
      setCurrentQuestion(prevIndex);
    } else {
      console.warn('[QuizDigital] Cannot go to previous question, already at first:', currentQuestion);
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
        email: profile?.email || authUser?.email || 'email@exemplo.com'
      };

      // Insert response record with user_id
      const currentUserId = authUser?.id || userId;
      if (!currentUserId) {
        toast({
          title: "Erro de autenticação",
          description: "Não foi possível identificar o usuário. Faça login novamente.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('respostas')
        .insert({
          nome: profile?.nome || 'Usuário',
          email: profile?.email || authUser?.email || 'email@exemplo.com',
          user_id: currentUserId,
          respostas: responsesData
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

      // Update user progress and add XP
      if (currentUserId) {
        const { data: existingProgress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (existingProgress) {
          await supabase
            .from('user_progress')
            .update({
              missao_1_completed: true,
              total_xp: existingProgress.total_xp + 25
            })
            .eq('user_id', currentUserId);
        } else {
          await supabase
            .from('user_progress')
            .insert({
              user_id: currentUserId,
              missao_1_completed: true,
              total_xp: 25
            });
        }
      }

      setIsCompleted(true);
      toast({
        title: "Medalha conquistada: Satélite",
        description: "Você lançou seu primeiro satélite. A jornada começou!"
      });
      onClose();


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

  if (isLoading || questionsLoading || quizQuestions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 p-4">
        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center animate-spin">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
        <p className="text-sm text-muted-foreground">Carregando quiz...</p>
      </div>
    );
  }

  // Validação robusta do índice atual e dados da pergunta
  const safeCurrentQuestion = Math.max(0, Math.min(currentQuestion, quizQuestions.length - 1));
  const currentQuestionData = quizQuestions[safeCurrentQuestion];
  
  console.log('[QuizDigital] Current question index:', currentQuestion, 'safe index:', safeCurrentQuestion, 'total questions:', quizQuestions.length);
  
  // Verificação adicional para garantir que currentQuestionData existe
  if (!currentQuestionData) {
    console.error('[QuizDigital] No question data available at index:', safeCurrentQuestion);
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 p-4">
        <p className="text-sm text-destructive">Erro ao carregar pergunta atual.</p>
        <p className="text-xs text-muted-foreground">Índice: {currentQuestion}, Total: {quizQuestions.length}</p>
        <Button 
          onClick={() => {
            console.log('[QuizDigital] Resetting to first question');
            setCurrentQuestion(0);
          }} 
          variant="outline"
        >
          Voltar ao início
        </Button>
      </div>
    );
  }

  // Sincronizar índice se necessário
  if (currentQuestion !== safeCurrentQuestion) {
    console.log('[QuizDigital] Syncing question index from', currentQuestion, 'to', safeCurrentQuestion);
    setCurrentQuestion(safeCurrentQuestion);
  }

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quizQuestions.length) * 100;

  return (
    <>
      {/* Mobile Layout */}
      <div className="flex md:hidden h-full flex-col">
        {/* Progress Header */}
        <div className="p-4 bg-background border-b border-border/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Pergunta {currentQuestion + 1} de {quizQuestions.length}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 pb-24">
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-base font-semibold text-foreground mb-4 leading-relaxed">
                  {currentQuestionData.question}
                </h3>

                <RadioGroup
                  value={answers[currentQuestionData.id] || ""}
                  onValueChange={(value) => handleAnswerSelect(currentQuestionData.id, value)}
                  className="space-y-0.5"
                >
                  {currentQuestionData.options.map((option) => (
                    <div 
                      key={option.letter} 
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/20 cursor-pointer transition-all duration-200" 
                      onClick={() => handleAnswerSelect(currentQuestionData.id, option.letter)}
                    >
                      <RadioGroupItem
                        value={option.letter}
                        id={`q${currentQuestionData.id}-${option.letter}`}
                        className="mt-1 h-4 w-4"
                      />
                      <Label
                        htmlFor={`q${currentQuestionData.id}-${option.letter}`}
                        className="text-sm text-foreground cursor-pointer flex-1 leading-relaxed"
                      >
                        <span className="font-semibold mr-2 text-primary">{option.letter})</span>
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Fixed Mobile Buttons */}
        <div className="fixed bottom-12 left-0 right-0 p-3 bg-background border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
          <div className="flex justify-between items-center gap-2">
            <Button
              type="button"
              onClick={() => goToPreviousQuestion()}
              disabled={currentQuestion === 0}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 min-w-[90px] h-10 px-2 bg-background hover:bg-muted/50 border-border text-xs font-medium"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Anterior</span>
            </Button>

            {currentQuestion === quizQuestions.length - 1 ? (
              <Button
                type="button"
                onClick={() => submitQuiz()}
                disabled={!answers[currentQuestionData.id] || isSubmitting}
                size="sm"
                className="flex items-center space-x-1 min-w-[90px] h-10 px-2 bg-primary hover:bg-primary/90 text-xs font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1" />
                    <span>Enviando</span>
                  </>
                ) : (
                  <span>Finalizar</span>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => goToNextQuestion()}
                disabled={!answers[currentQuestionData.id]}
                size="sm"
                className="flex items-center space-x-1 min-w-[90px] h-10 px-2 bg-primary hover:bg-primary/90 text-xs font-medium"
              >
                <span>Próxima</span>
                <ChevronRight className="w-3 h-3" />
              </Button>
            )}
          </div>
          
          {/* Borda de fechamento visual */}
          <div className="mt-4 h-px border-t border-secondary/50 bg-gradient-to-r from-transparent via-secondary/40 to-transparent opacity-80"></div>
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden md:flex lg:hidden h-full flex-col">
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto w-full p-4 pb-24">
            {/* Progress Header */}
            <div className="mb-6 sticky top-0 bg-background z-10 pb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Pergunta {currentQuestion + 1} de {quizQuestions.length}
                </span>
              </div>
              
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <Card className="border shadow-sm mb-6">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6 leading-relaxed">
                  {currentQuestionData.question}
                </h3>

                <RadioGroup
                  value={answers[currentQuestionData.id] || ""}
                  onValueChange={(value) => handleAnswerSelect(currentQuestionData.id, value)}
                  className="space-y-0.5"
                >
                  {currentQuestionData.options.map((option) => (
                    <div 
                      key={option.letter} 
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/20 cursor-pointer transition-all duration-200" 
                      onClick={() => handleAnswerSelect(currentQuestionData.id, option.letter)}
                    >
                      <RadioGroupItem
                        value={option.letter}
                        id={`q${currentQuestionData.id}-${option.letter}`}
                        className="mt-1 h-4 w-4"
                      />
                      <Label
                        htmlFor={`q${currentQuestionData.id}-${option.letter}`}
                        className="text-sm text-foreground cursor-pointer flex-1 leading-relaxed"
                      >
                        <span className="font-semibold mr-2 text-primary">{option.letter})</span>
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Tablet Fixed Buttons */}
        <div className="fixed bottom-12 left-0 right-0 bg-background border-t border-border/50 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
            <Button
              type="button"
              onClick={() => goToPreviousQuestion()}
              disabled={currentQuestion === 0}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 min-w-[110px] h-11 px-4 bg-background hover:bg-muted/50 border-border text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </Button>

            {currentQuestion === quizQuestions.length - 1 ? (
              <Button
                type="button"
                onClick={() => submitQuiz()}
                disabled={!answers[currentQuestionData.id] || isSubmitting}
                size="sm"
                className="flex items-center space-x-2 min-w-[110px] h-11 px-4 bg-primary hover:bg-primary/90 text-sm font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Finalizar</span>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => goToNextQuestion()}
                disabled={!answers[currentQuestionData.id]}
                size="sm"
                className="flex items-center space-x-2 min-w-[110px] h-11 px-4 bg-primary hover:bg-primary/90 text-sm font-medium"
              >
                <span>Próxima</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {/* Borda de fechamento visual para tablet */}
          <div className="mt-6 h-[2px] border-t-2 border-secondary shadow-[0_0_8px_hsl(var(--secondary))] bg-gradient-to-r from-transparent via-secondary to-transparent opacity-100"></div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-full flex-col">
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto w-full p-4 pb-24">
            {/* Progress Header */}
            <div className="mb-6 sticky top-0 bg-background z-10 pb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Pergunta {currentQuestion + 1} de {quizQuestions.length}
                </span>
              </div>
              
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <Card className="border shadow-sm mb-6">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6 leading-relaxed">
                  {currentQuestionData.question}
                </h3>

                <RadioGroup
                  value={answers[currentQuestionData.id] || ""}
                  onValueChange={(value) => handleAnswerSelect(currentQuestionData.id, value)}
                  className="space-y-0.5"
                >
                  {currentQuestionData.options.map((option) => (
                    <div 
                      key={option.letter} 
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/20 cursor-pointer transition-all duration-200" 
                      onClick={() => handleAnswerSelect(currentQuestionData.id, option.letter)}
                    >
                      <RadioGroupItem
                        value={option.letter}
                        id={`q${currentQuestionData.id}-${option.letter}`}
                        className="mt-1 h-4 w-4"
                      />
                      <Label
                        htmlFor={`q${currentQuestionData.id}-${option.letter}`}
                        className="text-sm text-foreground cursor-pointer flex-1 leading-relaxed"
                      >
                        <span className="font-semibold mr-2 text-primary">{option.letter})</span>
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Desktop Fixed Buttons */}
        <div className="fixed bottom-12 left-0 right-0 bg-background p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
            <Button
              type="button"
              onClick={() => goToPreviousQuestion()}
              disabled={currentQuestion === 0}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 min-w-[110px] h-11 px-4 bg-background hover:bg-muted/50 border-border text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </Button>

            {currentQuestion === quizQuestions.length - 1 ? (
              <Button
                type="button"
                onClick={() => submitQuiz()}
                disabled={!answers[currentQuestionData.id] || isSubmitting}
                size="sm"
                className="flex items-center space-x-2 min-w-[110px] h-11 px-4 bg-primary hover:bg-primary/90 text-sm font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Finalizar</span>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => goToNextQuestion()}
                disabled={!answers[currentQuestionData.id]}
                size="sm"
                className="flex items-center space-x-2 min-w-[110px] h-11 px-4 bg-primary hover:bg-primary/90 text-sm font-medium"
              >
                <span>Próxima</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {/* Borda de fechamento visual para desktop */}
          <div className="mt-6 h-[2px] border-t-2 border-secondary shadow-[0_0_8px_hsl(var(--secondary))] bg-gradient-to-r from-transparent via-secondary to-transparent opacity-100"></div>
        </div>
      </div>
    </>
  );
};