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
}

export const FastTrackForm = ({ userName, onComplete }: FastTrackFormProps) => {
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
        title: "Erro",
        description: "Por favor, responda todas as perguntas.",
        variant: "destructive",
      });
      return;
    }

    if (mainObjective === 'outro' && !otherObjective.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, especifique seu objetivo.",
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
        title: "Sucesso",
        description: "Respostas enviadas com sucesso!",
      });
      
      onComplete();
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
    <div className="w-full h-full min-h-screen md:min-h-0 relative overflow-hidden">
      <ScrollArea className="h-full w-full">
        <div className="p-4 md:p-6">
          <div className="mb-8">
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
                        
                        <div className="space-y-8">
                          {/* Pergunta 1 */}
                          <div className="space-y-4">
                            <Label className="text-base font-medium text-foreground">
                              1. Você tem interesse em participar do programa FastTrack Digital (programa de aceleração digital)?
                            </Label>
                            <RadioGroup value={interestLevel} onValueChange={setInterestLevel}>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="muito-interessado" id="interesse-sim" />
                                <Label htmlFor="interesse-sim">Sim, muito interessado(a)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="gostaria-mas-sem-tempo" id="interesse-talvez" />
                                <Label htmlFor="interesse-talvez">Gostaria, mas devido as minhas demandas atuais não vou conseguir participar</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sem-interesse" id="interesse-nao" />
                                <Label htmlFor="interesse-nao">Não tenho interesse no momento</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Pergunta 2 */}
                          <div className="space-y-4">
                            <Label className="text-base font-medium text-foreground">
                              2. Quanto tempo por semana você acredita que pode dedicar ao programa FastTrack?
                            </Label>
                            <RadioGroup value={timeCommitment} onValueChange={setTimeCommitment}>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="menos-1h" id="tempo-1" />
                                <Label htmlFor="tempo-1">Menos de 1 hora</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="1-2h" id="tempo-2" />
                                <Label htmlFor="tempo-2">1 a 2 horas</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="3-4h" id="tempo-3" />
                                <Label htmlFor="tempo-3">3 a 4 horas</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="mais-4h" id="tempo-4" />
                                <Label htmlFor="tempo-4">Mais de 4 horas</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Pergunta 3 */}
                          <div className="space-y-4">
                            <Label className="text-base font-medium text-foreground">
                              3. Qual seu principal objetivo ao participar do FastTrack Digital?
                            </Label>
                            <RadioGroup value={mainObjective} onValueChange={setMainObjective}>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="habilidades-tecnicas" id="obj-1" />
                                <Label htmlFor="obj-1">Melhorar minhas habilidades técnicas</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="carreira" id="obj-2" />
                                <Label htmlFor="obj-2">Acelerar minha carreira na empresa</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="inovacao" id="obj-3" />
                                <Label htmlFor="obj-3">Aplicar inovação e tecnologia no meu trabalho</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ferramentas" id="obj-4" />
                                <Label htmlFor="obj-4">Conhecer novas ferramentas digitais</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="outro" id="obj-5" />
                                <Label htmlFor="obj-5">Outro (especifique):</Label>
                              </div>
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

                          {/* Botão de envio */}
                          <div className="pt-6 border-t border-cyan-400/20">
                            <Button
                              onClick={handleSubmit}
                              disabled={isSubmitting}
                              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                            >
                              {isSubmitting ? 'Enviando...' : 'Finalizar Missão'}
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