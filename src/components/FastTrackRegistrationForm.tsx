import { useState } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FastTrackRegistrationFormProps {
  userName: string;
  onBack: () => void;
  onRegistrationComplete: () => void;
}

export const FastTrackRegistrationForm = ({ userName, onBack, onRegistrationComplete }: FastTrackRegistrationFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    interestLevel: '',
    timeCommitment: '',
    mainObjective: '',
    otherObjective: ''
  });

  const handleSubmit = async () => {
    // Validation
    if (!formData.interestLevel || !formData.timeCommitment || !formData.mainObjective) {
      toast({
        title: "Erro",
        description: "Por favor, responda todas as questões obrigatórias.",
        variant: "destructive",
      });
      return;
    }

    if (formData.mainObjective === 'outro' && !formData.otherObjective.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, especifique seu objetivo no campo 'Outro'.",
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

      // Check if response already exists
      const { data: existingResponse } = await supabase
        .from('fast_track_responses')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingResponse) {
        toast({
          title: "Informação",
          description: "Você já possui uma inscrição registrada.",
        });
        onRegistrationComplete();
        return;
      }

      const { error } = await supabase
        .from('fast_track_responses')
        .insert({
          user_id: user.id,
          interest_level: formData.interestLevel,
          time_commitment: formData.timeCommitment,
          main_objective: formData.mainObjective === 'outro' ? formData.otherObjective : formData.mainObjective,
          other_objective: formData.mainObjective === 'outro' ? formData.otherObjective : null,
          accepted_terms: true
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Inscrição no FastTrack Digital realizada com sucesso!",
      });
      
      onRegistrationComplete();
    } catch (error) {
      console.error('Erro ao salvar inscrição:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar sua inscrição. Tente novamente.",
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
                    
                    <div className="text-center">
                      <p className="text-lg font-semibold text-cyan-300">
                        Vamos acelerar juntos!
                      </p>
                    </div>
                  </div>

                  {/* Formulário de inscrição */}
                  <div className="flex-1 text-center lg:text-left space-y-4 sm:space-y-6 w-full">
                    <div className="relative">
                      <div 
                        className="absolute inset-0 bg-gradient-to-r opacity-10 blur-sm rounded-lg"
                        style={{ 
                          background: 'linear-gradient(45deg, hsl(var(--primary))20, transparent, hsl(var(--primary))20)' 
                        }}
                      />
                      <div className="relative text-foreground/90 leading-relaxed p-6 rounded-lg border border-border/50 bg-background/30">
                        <h3 className="text-xl font-bold text-cyan-300 mb-6 text-left">Inscrição FastTrack Digital:</h3>
                        
                        <div className="space-y-8 text-left">
                          {/* Questão 1 - Interest Level */}
                          <div className="space-y-3">
                            <Label className="text-base font-medium text-foreground">
                              1. Você tem interesse em participar do programa FastTrack Digital (programa de aceleração digital)?
                            </Label>
                            <RadioGroup 
                              value={formData.interestLevel} 
                              onValueChange={(value) => setFormData(prev => ({ ...prev, interestLevel: value }))}
                              className="space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="muito-interessado" id="r1-1" />
                                <Label htmlFor="r1-1" className="text-sm cursor-pointer">Sim, muito interessado(a)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="gostaria-mas-sem-tempo" id="r1-2" />
                                <Label htmlFor="r1-2" className="text-sm cursor-pointer">Gostaria, mas devido as minhas demandas atuais não vou conseguir participar</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sem-interesse" id="r1-3" />
                                <Label htmlFor="r1-3" className="text-sm cursor-pointer">Não tenho interesse no momento</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Questão 2 - Time Commitment */}
                          <div className="space-y-3">
                            <Label className="text-base font-medium text-foreground">
                              2. Quanto tempo por semana você acredita que pode dedicar ao programa FastTrack?
                            </Label>
                            <RadioGroup 
                              value={formData.timeCommitment} 
                              onValueChange={(value) => setFormData(prev => ({ ...prev, timeCommitment: value }))}
                              className="space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="menos-1h" id="r2-1" />
                                <Label htmlFor="r2-1" className="text-sm cursor-pointer">Menos de 1 hora</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="1-2h" id="r2-2" />
                                <Label htmlFor="r2-2" className="text-sm cursor-pointer">1 a 2 horas</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="3-4h" id="r2-3" />
                                <Label htmlFor="r2-3" className="text-sm cursor-pointer">3 a 4 horas</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="mais-4h" id="r2-4" />
                                <Label htmlFor="r2-4" className="text-sm cursor-pointer">Mais de 4 horas</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Questão 3 - Main Objective */}
                          <div className="space-y-3">
                            <Label className="text-base font-medium text-foreground">
                              3. Qual seu principal objetivo ao participar do FastTrack Digital?
                            </Label>
                            <RadioGroup 
                              value={formData.mainObjective} 
                              onValueChange={(value) => setFormData(prev => ({ ...prev, mainObjective: value }))}
                              className="space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="melhorar-habilidades" id="r3-1" />
                                <Label htmlFor="r3-1" className="text-sm cursor-pointer">Melhorar minhas habilidades técnicas</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="acelerar-carreira" id="r3-2" />
                                <Label htmlFor="r3-2" className="text-sm cursor-pointer">Acelerar minha carreira na empresa</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="aplicar-inovacao" id="r3-3" />
                                <Label htmlFor="r3-3" className="text-sm cursor-pointer">Aplicar inovação e tecnologia no meu trabalho</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="conhecer-ferramentas" id="r3-4" />
                                <Label htmlFor="r3-4" className="text-sm cursor-pointer">Conhecer novas ferramentas digitais</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="outro" id="r3-5" />
                                <Label htmlFor="r3-5" className="text-sm cursor-pointer">Outro (especifique):</Label>
                              </div>
                              {formData.mainObjective === 'outro' && (
                                <div className="ml-6 mt-2">
                                  <Input
                                    placeholder="Especifique seu objetivo..."
                                    value={formData.otherObjective}
                                    onChange={(e) => setFormData(prev => ({ ...prev, otherObjective: e.target.value }))}
                                    className="w-full"
                                  />
                                </div>
                              )}
                            </RadioGroup>
                          </div>

                          <div className="flex gap-4 pt-6 border-t border-cyan-400/20">
                            <Button
                              onClick={onBack}
                              variant="outline"
                              className="w-full"
                              disabled={isSubmitting}
                            >
                              Voltar
                            </Button>
                            <Button
                              onClick={handleSubmit}
                              disabled={isSubmitting}
                              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                            >
                              {isSubmitting ? 'Enviando...' : 'Finalizar Inscrição'}
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