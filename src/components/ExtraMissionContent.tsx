import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FastTrackForm } from './FastTrackForm';
import { FastTrackThankYou } from './FastTrackThankYou';

interface ExtraMissionContentProps {
  userName: string;
  onBack: () => void;
  onDeclineShown?: (isShown: boolean) => void;
  onResponseSubmitted?: () => void;
}

export const ExtraMissionContent = ({ userName, onBack, onDeclineShown, onResponseSubmitted }: ExtraMissionContentProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [userChoice, setUserChoice] = useState<'accept' | 'decline' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeclineMessage, setShowDeclineMessage] = useState(false);
  const [showFastTrackForm, setShowFastTrackForm] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSubmit = async () => {
    if (!userChoice) {
      toast({
        title: "Erro",
        description: "Por favor, faça uma escolha antes de confirmar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user?.id) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if response already exists to prevent duplicates
      const { data: existingResponse } = await supabase
        .from('fast_track_terms_responses')
        .select('want_to_participate')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingResponse) {
        // User already responded, just update parent state
        if (!existingResponse.want_to_participate) {
          setShowDeclineMessage(true);
          onDeclineShown?.(true);
        } else {
          // Show FastTrack form if user wants to participate
          setShowFastTrackForm(true);
        }
        return;
      }

      const { error } = await supabase
        .from('fast_track_terms_responses')
        .insert({
          user_id: user.id,
          nome: userName,
          email: user.email || '',
          accepted_terms: userChoice === 'accept',
          want_to_participate: userChoice === 'accept'
        });

      if (error) throw error;

      // Atualizar progresso para indicar que está na missão extra
      await supabase
        .from('user_progress')
        .update({
          missao_5_current_question: 1,
          current_position: 'extra_mission_terms'
        })
        .eq('user_id', user.id);

      // Notify parent that response was submitted only for certain cases
      // Don't call onResponseSubmitted here as it triggers refresh that interferes with flow

      if (userChoice === 'decline') {
        // Atualizar posição para indicar recusa
        await supabase
          .from('user_progress')
          .update({ current_position: 'extra_mission_declined' })
          .eq('user_id', user.id);
          
        // Mostrar tela de decline PRIMEIRO antes de voltar
        setShowDeclineMessage(true);
        onDeclineShown?.(true);
        // 🔥 CORREÇÃO: Chamar onResponseSubmitted para forçar refresh do estado
        onResponseSubmitted?.();
      } else {
        // Show FastTrack form instead of going back
        setShowFastTrackForm(true);
        // Atualizar posição para formulário FastTrack
        await supabase
          .from('user_progress')
          .update({ current_position: 'extra_mission_fasttrack' })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar sua resposta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const termsContent = (
    <div className="space-y-4 text-sm">
      <p className="font-medium">
        Ao me inscrever no Fast Track do Código F, declaro estar ciente e de acordo com os seguintes compromissos:
      </p>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-cyan-300 mb-2">1. Participação e Dedicação</h4>
          <ul className="ml-4 space-y-1 list-disc text-foreground/90">
            <li>Participar de, no mínimo, 75% das atividades previstas (palestras, tech labs, desafios e encontros).</li>
            <li>Dedicar às atividades, estudos e desafios da trilha, incluindo aplicação prática dos aprendizados em meus projetos, desde que haja prévia comunicação ao gestor e à TI.</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-cyan-300 mb-2">2. Aprendizado Ativo e Ética</h4>
          <ul className="ml-4 space-y-1 list-disc text-foreground/90">
            <li>Comprometer-se com exploração, curiosidade e aprendizado contínuo.</li>
            <li>Respeitar princípios éticos, confidencialidade e propriedade intelectual, bem como diretrizes internas de cybersegurança, especialmente em atividades colaborativas.</li>
            <li>Aplicar os aprendizados de forma prática, explorando ferramentas digitais e soluções de IA propostas pelo programa, integrando os conceitos do programa à minha prática, desde que haja prévia comunicação ao gestor e à TI.</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-cyan-300 mb-2">3. Acompanhamento e Feedback</h4>
          <ul className="ml-4 space-y-1 list-disc text-foreground/90">
            <li>Estar disponível para mentorias, avaliações de progresso e sessões de feedback oferecidas pelo programa.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Carregar estado inicial baseado no progresso do usuário
  useEffect(() => {
    const loadInitialState = async () => {
      if (!user?.id) return;
      
      try {
        console.log('🔍 [ExtraMissionContent] Loading initial state for user:', user.id);
        
        // Verificar progresso do usuário primeiro
        const { data: userProgress } = await supabase
          .from('user_progress')
          .select('current_position, missao_5_completed')
          .eq('user_id', user.id)
          .maybeSingle();
          
        console.log('🎯 [ExtraMissionContent] User progress:', userProgress);
        
        // Se já completou a missão extra (current_position completed), mostrar thank you
        if (userProgress?.current_position === 'extra_mission_completed' || userProgress?.missao_5_completed) {
          console.log('✅ [ExtraMissionContent] User already completed extra mission - showing thank you');
          setShowThankYou(true);
          return;
        }
        
        // Verificar se usuário já respondeu aos termos
        const { data: termsResponse } = await supabase
          .from('fast_track_terms_responses')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        // Verificar se usuário já preencheu o formulário FastTrack
        const { data: fastTrackResponse } = await supabase
          .from('fast_track_responses')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        console.log('🔍 [ExtraMissionContent] Database checks:', {
          termsResponse: !!termsResponse,
          fastTrackResponse: !!fastTrackResponse,
          wantToParticipate: termsResponse?.want_to_participate
        });
          
        if (fastTrackResponse) {
          // Usuário já completou tudo, mostrar tela de agradecimento
          console.log('✅ [ExtraMissionContent] FastTrack completed - showing thank you');
          setShowThankYou(true);
        } else if (termsResponse) {
          // Usuário já respondeu aos termos
          if (!termsResponse.want_to_participate) {
            console.log('🔍 [ExtraMissionContent] User declined terms - showing decline message');
            setShowDeclineMessage(true);
            setUserChoice('decline');
          } else {
            // Usuário quer participar, mostrar formulário
            console.log('🔍 [ExtraMissionContent] User accepted terms - showing form');
            setShowFastTrackForm(true);
          }
        } else {
          console.log('🔍 [ExtraMissionContent] No previous response - showing terms');
        }
        // Se não há resposta anterior, mantém na tela de termos
      } catch (error) {
        console.error('Erro ao carregar estado inicial:', error);
      }
    };
    
    loadInitialState();
  }, [user?.id]);

  // Notify parent when decline message is shown/hidden
  useEffect(() => {
    onDeclineShown?.(showDeclineMessage);
  }, [showDeclineMessage, onDeclineShown]);

  // Show thank you screen
  if (showThankYou) {
    return (
      <FastTrackThankYou 
        userName={userName}
        onBack={onBack}
      />
    );
  }

  // Show FastTrack form screen
  if (showFastTrackForm) {
    return (
      <FastTrackForm 
        userName={userName}
        onComplete={() => setShowThankYou(true)}
      />
    );
  }

  // Show decline message screen
  if (showDeclineMessage) {
    return (
      <div className="w-full h-full min-h-screen md:min-h-0 relative overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="p-4 md:p-6">
            <div className="mb-8">
              <div className="relative overflow-hidden animate-epic-entry bg-background/95 backdrop-blur-sm border-2 border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-xl">
                <div className="relative p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
                    
                    {/* Avatar do Cody */}
                    <div className="flex-shrink-0 text-center lg:text-left">
                      <div className="relative mb-6">
                        <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full bg-gradient-to-r from-neon-purple via-neon-purple to-neon-cyan p-1 shadow-glow mx-auto lg:mx-0">
                          <div className="w-full h-full rounded-full bg-background/20 backdrop-blur-xl overflow-hidden relative">
                            <video 
                              className="w-full h-full object-cover rounded-full"
                              autoPlay
                              muted
                              loop
                              playsInline
                              preload="auto"
                            >
                              <source src="https://meta.cafeeadhost.com.br/Cody/hero-animation.mp4" type="video/mp4" />
                            </video>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-neon-cyan/10"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mensagem de despedida */}
                    <div className="flex-1 text-center lg:text-left space-y-4 sm:space-y-6 w-full">
                      <div className="relative">
                        <div 
                          className="absolute inset-0 bg-gradient-to-r opacity-10 blur-sm rounded-lg"
                          style={{ 
                            background: 'linear-gradient(45deg, hsl(var(--primary))20, transparent, hsl(var(--primary))20)' 
                          }}
                        />
                        <div className="relative text-foreground/90 leading-relaxed p-6 rounded-lg border border-border/50 bg-background/30 text-center">
                          <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-cyan-300">Poxa 🙁!!</h3>
                            <p className="text-lg">
                              Tudo bem, entendemos que esse pode não ser o momento ideal para você.
                            </p>
                            <p className="text-lg">
                              Seguimos juntos e nos encontraremos em uma próxima jornada digital!
                            </p>
                            <div className="mt-6">
                              <Button 
                                onClick={() => {
                                  console.log('🔥 [ExtraMissionContent] User clicked Voltar - going back to main screen');
                                  // 🔥 CORREÇÃO: Garantir refresh antes de voltar
                                  onResponseSubmitted?.();
                                  onBack();
                                }}
                                className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-8 py-3 rounded-lg transition-all duration-300"
                              >
                                Ver Resultados Finais
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen md:min-h-0 relative overflow-hidden">
      {/* Layout principal com ScrollArea */}
      <ScrollArea className="h-full w-full">
        <div className="p-4 md:p-6">
          {/* Hero Card da Missão Extra */}
          <div className="mb-8">
            {/* Hero Card simplificado para Fast Track */}
            <div className="relative overflow-hidden animate-epic-entry bg-background/95 backdrop-blur-sm border-2 border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-xl">
              <div className="relative p-6 md:p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
                  
                  {/* Avatar do Cody */}
                  <div className="flex-shrink-0 text-center lg:text-left">
                    <div className="relative mb-6">
                      <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full bg-gradient-to-r from-neon-purple via-neon-purple to-neon-cyan p-1 shadow-glow mx-auto lg:mx-0">
                        <div className="w-full h-full rounded-full bg-background/20 backdrop-blur-xl overflow-hidden relative">
                          <video 
                            className="w-full h-full object-cover rounded-full"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                          >
                            <source src="https://meta.cafeeadhost.com.br/Cody/hero-animation.mp4" type="video/mp4" />
                          </video>
                          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-neon-cyan/10"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Texto abaixo do Cody */}
                    <div className="text-center">
                      <p className="text-lg font-semibold text-cyan-300">
                        Vamos juntos para a próxima fase?
                      </p>
                    </div>
                  </div>

                  {/* Conteúdo dos termos */}
                  <div className="flex-1 text-center lg:text-left space-y-4 sm:space-y-6 w-full">
                    <div className="relative">
                      <div 
                        className="absolute inset-0 bg-gradient-to-r opacity-10 blur-sm rounded-lg"
                        style={{ 
                          background: 'linear-gradient(45deg, hsl(var(--primary))20, transparent, hsl(var(--primary))20)' 
                        }}
                      />
                      <div className="relative text-foreground/90 leading-relaxed p-6 rounded-lg border border-border/50 bg-background/30">
                        <h3 className="text-xl font-bold text-cyan-300 mb-4">Fast Track do Código F - Termos de Participação</h3>
                        <div className="text-left mb-6">
                          {termsContent}
                        </div>

                        {/* Formulário de escolha única */}
                        <div className="space-y-6 pt-4 border-t border-cyan-400/20">
                          <RadioGroup 
                            value={userChoice} 
                            onValueChange={(value) => setUserChoice(value as 'accept' | 'decline')}
                            className="space-y-4"
                          >
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="accept" id="accept-terms" />
                              <Label htmlFor="accept-terms" className="text-sm text-foreground/90 cursor-pointer">
                                Li e concordo com os termos acima e quero participar do Fast Track.
                              </Label>
                            </div>

                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="decline" id="decline-terms" />
                              <Label htmlFor="decline-terms" className="text-sm text-foreground/90 cursor-pointer">
                                Não concordo e não vou participar.
                              </Label>
                            </div>
                          </RadioGroup>

                          <div className="flex gap-4 pt-4">
                            <Button
                              onClick={handleSubmit}
                              disabled={isSubmitting || !userChoice}
                              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50"
                            >
                              {isSubmitting ? 'Enviando...' : 'Confirmar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};