import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FastTrackRegistrationForm } from './FastTrackRegistrationForm';

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
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

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
          onBack();
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

      // Notify parent that response was submitted
      onResponseSubmitted?.();

      if (!wantToParticipate) {
        // Show decline message and notify parent immediately
        setShowDeclineMessage(true);
        onDeclineShown?.(true);
      } else {
        // Show registration form
        setShowRegistrationForm(true);
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

  // Notify parent when decline message is shown/hidden
  useEffect(() => {
    onDeclineShown?.(showDeclineMessage);
  }, [showDeclineMessage, onDeclineShown]);

  // Show registration form
  if (showRegistrationForm) {
    return (
      <FastTrackRegistrationForm
        userName={userName}
        onBack={() => setShowRegistrationForm(false)}
        onRegistrationComplete={() => {
          toast({
            title: "Sucesso",
            description: "Inscrição no FastTrack Digital realizada com sucesso!",
          });
          onResponseSubmitted?.();
          onBack();
        }}
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
                        Pronto para esta etapa final?
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