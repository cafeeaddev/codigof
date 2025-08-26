import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [wantToParticipate, setWantToParticipate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeclineMessage, setShowDeclineMessage] = useState(false);
  const [showFastTrackForm, setShowFastTrackForm] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSubmit = async () => {
    if (!acceptedTerms && wantToParticipate) {
      toast({
        title: "Erro",
        description: "Para participar, você deve aceitar os termos.",
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
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingResponse) {
        // User already responded, just update parent state
        if (!wantToParticipate) {
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
          accepted_terms: acceptedTerms,
          want_to_participate: wantToParticipate
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

      if (!wantToParticipate) {
        // Show decline message and notify parent immediately
        setShowDeclineMessage(true);
        onDeclineShown?.(true);
        // Atualizar posição para indicar recusa
        await supabase
          .from('user_progress')
          .update({ current_position: 'extra_mission_declined' })
          .eq('user_id', user.id);
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
          
        if (fastTrackResponse) {
          // Usuário já completou tudo, mostrar tela de agradecimento
          setShowThankYou(true);
        } else if (termsResponse) {
          // Usuário já respondeu aos termos
          if (!termsResponse.want_to_participate) {
            setShowDeclineMessage(true);
            setWantToParticipate(false);
          } else {
            // Usuário quer participar, mostrar formulário
            setShowFastTrackForm(true);
          }
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
          {/* Grid de Missões - igual ao WelcomeScreen */}
          <div className="hidden md:flex flex-col h-full gap-4 p-4">
            <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-4 shadow-neon">
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((missionId) => {
                  const isCompleted = missionId <= 4; // Missões 1-4 completas
                  const isExtraMission = missionId === 5;
                  
                  return (
                    <div key={missionId} className="relative">
                      <div className={`
                        bg-gradient-to-br p-4 rounded-xl border-2 relative overflow-hidden transition-all duration-300
                        ${isExtraMission 
                          ? 'from-gray-600/20 to-gray-700/20 border-gray-500/30' 
                          : 'from-neon-purple/20 to-neon-cyan/20 border-neon-purple/30'
                        }
                      `}>
                        {/* Checkmark ou X */}
                        <div className="absolute top-2 right-2">
                          {isExtraMission ? (
                            <div className="w-6 h-6 rounded-full bg-gray-600/50 flex items-center justify-center">
                              <span className="text-sm">❌</span>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-neon-cyan/20 border border-neon-cyan/50 flex items-center justify-center">
                              <span className="text-sm text-neon-cyan">✓</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Título da missão */}
                        <h3 className={`text-sm font-bold mb-2 ${
                          isExtraMission ? 'text-gray-400' : 'text-neon-purple'
                        }`}>
                          {isExtraMission ? 'MISSÃO EXTRA' : `MISSÃO ${missionId}`}
                        </h3>
                        
                        {/* Descrição */}
                        <p className="text-xs text-foreground/70 mb-3">
                          {isExtraMission 
                            ? 'Fim de Jogo!' 
                            : missionId === 1 ? 'Como você encara o digital?' 
                            : missionId === 2 ? 'O digital no seu dia a dia'
                            : missionId === 3 ? 'Quando o desafio é maior'
                            : 'Seu Radar de Ferramentas'
                          }
                        </p>
                        
                        {/* XP */}
                        <div className="text-xs mb-2">
                          <span className={isExtraMission ? 'text-gray-500' : 'text-foreground/60'}>
                            Vale 25 XP
                          </span>
                        </div>
                        
                        {/* Barra de progresso */}
                        <div className="w-full bg-background/30 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full transition-all duration-500 ${
                              isExtraMission ? 'bg-gray-600' : 'bg-neon-purple'
                            }`}
                            style={{ width: isCompleted ? '100%' : '0%' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
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

                        {/* Formulário de aceitação */}
                        <div className="space-y-6 pt-4 border-t border-cyan-400/20">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="accept-terms"
                              checked={acceptedTerms}
                              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                              className="mt-1"
                            />
                            <label htmlFor="accept-terms" className="text-sm text-foreground/90 cursor-pointer">
                              Li e concordo com os termos acima.
                            </label>
                          </div>

                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="want-participate"
                              checked={!wantToParticipate}
                              onCheckedChange={(checked) => setWantToParticipate(!checked)}
                              className="mt-1"
                            />
                            <label htmlFor="want-participate" className="text-sm text-foreground/90 cursor-pointer">
                              Não concordo e não vou participar.
                            </label>
                          </div>

                          <div className="flex gap-4 pt-4">
                            <Button
                              onClick={handleSubmit}
                              disabled={isSubmitting}
                              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
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