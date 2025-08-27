import { useState } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FastTrackFormProps {
  userName: string;
  onComplete: () => void;
  onResponseSubmitted?: () => void;
}

export const FastTrackForm = ({ userName, onComplete, onResponseSubmitted }: FastTrackFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para as respostas
  const [interestLevel, setInterestLevel] = useState<string>('');
  const [timeCommitment, setTimeCommitment] = useState<string>('');
  const [mainObjective, setMainObjective] = useState<string>('');
  const [otherObjective, setOtherObjective] = useState<string>('');

  const handleSubmit = async () => {
    // Validação
    if (!interestLevel || !timeCommitment || !mainObjective) {
      toast({
        title: "Informações necessárias",
        description: "Para continuar, complete todas as perguntas do formulário.",
        variant: "default",
      });
      return;
    }

    if (mainObjective === 'outro' && !otherObjective.trim()) {
      toast({
        title: "Informação adicional necessária",
        description: "Conte-nos mais sobre seu objetivo específico.",
        variant: "default",
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
        return;
      }

      const { error } = await supabase
        .from('fast_track_responses')
        .insert({
          user_id: user.id,
          accepted_terms: true, // User already accepted terms to get here
          interest_level: interestLevel,
          time_commitment: timeCommitment,
          main_objective: mainObjective,
          other_objective: mainObjective === 'outro' ? otherObjective : null
        });

      if (error) throw error;

      // Update user_progress to mark mission 5 as completed and set position
      const { error: progressError } = await supabase
        .from('user_progress')
        .update({ 
          missao_5_completed: true,
          current_position: 'extra_mission_completed'
        })
        .eq('user_id', user.id);

      if (progressError) {
        console.error('Error updating mission 5 completion:', progressError);
      }

      toast({
        title: "Missão Finalizada! Medalha Conquistada: Universo",
        description: "Você está prestes a conquistar o universo. Mestre do cosmos!",
      });
      
      // Mostra tela FastTrackThankYou ANTES do refresh
      onComplete();
      onResponseSubmitted?.();
    } catch (error) {
      console.error('Erro ao salvar respostas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas respostas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 pb-[calc(100px+env(safe-area-inset-bottom,0px))]">
          <div className="mb-4 md:mb-8">
            <div className="relative overflow-hidden animate-epic-entry bg-background/95 backdrop-blur-sm border-2 border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-xl">
              <div className="relative p-6 md:p-8">
                <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 relative z-10">
                  
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
                    
                    <div className="text-center">
                      <p className="text-lg font-semibold text-cyan-300">
                        Inscrição FastTrack Digital
                      </p>
                    </div>
                  </div>

                  {/* Formulário */}
                  <div className="flex-1 text-left space-y-6 w-full">
                    <div className="relative">
                      <div 
                        className="absolute inset-0 bg-gradient-to-r opacity-10 blur-sm rounded-lg"
                        style={{ 
                          background: 'linear-gradient(45deg, hsl(var(--primary))20, transparent, hsl(var(--primary))20)' 
                        }}
                      />
                      <div className="relative text-foreground/90 leading-relaxed p-6 rounded-lg border border-border/50 bg-background/30">
                        <h3 className="text-xl font-bold text-cyan-300 mb-6">Inscrição FastTrack Digital</h3>
                        
                        <div className="space-y-6 md:space-y-8">
                          {/* Pergunta 1 */}
                          <div className="space-y-3 md:space-y-4">
                            <Label className="text-base font-medium text-foreground">
                              1. Você tem interesse em participar do programa FastTrack Digital (programa de aceleração digital)?
                            </Label>
                            <RadioGroup value={interestLevel} onValueChange={setInterestLevel}>
                              <Label 
                                htmlFor="interesse-sim" 
                                className="cursor-pointer flex items-center space-x-2 w-full text-sm md:text-base"
                              >
                                <RadioGroupItem value="muito-interessado" id="interesse-sim" />
                                <span>Sim, muito interessado(a)</span>
                              </Label>
                              <Label 
                                htmlFor="interesse-talvez" 
                                className="cursor-pointer flex items-center space-x-2 w-full text-sm md:text-base"
                              >
                                <RadioGroupItem value="gostaria-mas-sem-tempo" id="interesse-talvez" />
                                <span>Gostaria, mas devido as minhas demandas atuais não vou conseguir participar</span>
                              </Label>
                              <Label 
                                htmlFor="interesse-nao" 
                                className="cursor-pointer flex items-center space-x-2 w-full text-sm md:text-base"
                              >
                                <RadioGroupItem value="sem-interesse" id="interesse-nao" />
                                <span>Não tenho interesse no momento</span>
                              </Label>
                            </RadioGroup>
                          </div>

                          {/* Pergunta 2 */}
                          <div className="space-y-3 md:space-y-4">
                            <Label className="text-base font-medium text-foreground">
                              2. Quanto tempo por semana você acredita que pode dedicar ao programa FastTrack?
                            </Label>
                            <RadioGroup value={timeCommitment} onValueChange={setTimeCommitment}>
                              <Label 
                                htmlFor="tempo-1" 
                                className="cursor-pointer flex items-center space-x-2 w-full text-sm md:text-base"
                              >
                                <RadioGroupItem value="menos-1h" id="tempo-1" />
                                <span>Menos de 1 hora</span>
                              </Label>
                              <Label 
                                htmlFor="tempo-2" 
                                className="cursor-pointer flex items-center space-x-2 w-full text-sm md:text-base"
                              >
                                <RadioGroupItem value="1-2h" id="tempo-2" />
                                <span>1 a 2 horas</span>
                              </Label>
                              <Label 
                                htmlFor="tempo-3" 
                                className="cursor-pointer flex items-center space-x-2 w-full text-sm md:text-base"
                              >
                                <RadioGroupItem value="3-4h" id="tempo-3" />
                                <span>3 a 4 horas</span>
                              </Label>
                              <Label 
                                htmlFor="tempo-4" 
                                className="cursor-pointer flex items-center space-x-2 w-full text-sm md:text-base"
                              >
                                <RadioGroupItem value="mais-4h" id="tempo-4" />
                                <span>Mais de 4 horas</span>
                              </Label>
                            </RadioGroup>
                          </div>

                          {/* Pergunta 3 */}
                          <div className="space-y-3 md:space-y-4">
                            <Label className="text-base font-medium text-foreground">
                              3. Qual seu principal objetivo ao participar do FastTrack Digital?
                            </Label>
                            <RadioGroup value={mainObjective} onValueChange={setMainObjective}>
                              <Label 
                                htmlFor="obj-1" 
                                className="cursor-pointer flex items-center space-x-2 w-full text-sm md:text-base"
                              >
                                <RadioGroupItem value="habilidades-tecnicas" id="obj-1" />
                                <span>Melhorar minhas habilidades técnicas</span>
                              </Label>
                              <Label 
                                htmlFor="obj-2" 
                                className="cursor-pointer flex items-center space-x-2 w-full text-sm md:text-base"
                              >
                                <RadioGroupItem value="carreira" id="obj-2" />
                                <span>Acelerar minha carreira na empresa</span>
                              </Label>
                              <Label 
                                htmlFor="obj-3" 
                                className="cursor-pointer flex items-center space-x-2 w-full text-sm md:text-base"
                              >
                                <RadioGroupItem value="inovacao" id="obj-3" />
                                <span>Aplicar inovação e tecnologia no meu trabalho</span>
                              </Label>
                              <Label 
                                htmlFor="obj-4" 
                                className="cursor-pointer flex items-center space-x-2 w-full text-sm md:text-base"
                              >
                                <RadioGroupItem value="ferramentas" id="obj-4" />
                                <span>Conhecer novas ferramentas digitais</span>
                              </Label>
                              <Label 
                                htmlFor="obj-5" 
                                className="cursor-pointer flex items-center space-x-2 w-full text-sm md:text-base"
                              >
                                <RadioGroupItem value="outro" id="obj-5" />
                                <span>Outro (especifique):</span>
                              </Label>
                            </RadioGroup>
                            
                            {mainObjective === 'outro' && (
                              <div className="ml-6">
                                <Textarea
                                  placeholder="Especifique seu objetivo..."
                                  value={otherObjective}
                                  onChange={(e) => setOtherObjective(e.target.value)}
                                  className="mt-2"
                                  rows={3}
                                />
                              </div>
                            )}
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

      {/* Botão fixo na parte inferior */}
      <div className="bg-background border-t p-4 safe-area-inset-bottom">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white min-h-[48px] text-base"
        >
          {isSubmitting ? 'Enviando...' : 'Finalizar Missão'}
        </Button>
      </div>
    </div>
  );
};