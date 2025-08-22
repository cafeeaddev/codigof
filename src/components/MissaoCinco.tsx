import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Rocket, Star, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import FastTrackTerms from './FastTrackTerms';
import FastTrackQuiz from './FastTrackQuiz';
import FastTrackComplete from './FastTrackComplete';
import FastTrackDeclined from './FastTrackDeclined';

interface MissaoCincoProps {
  onComplete: () => void;
  isVisible: boolean;
}

type MissionStep = 'intro' | 'terms' | 'quiz' | 'complete' | 'declined';

const MissaoCinco: React.FC<MissaoCincoProps> = ({ onComplete, isVisible }) => {
  const [currentStep, setCurrentStep] = useState<MissionStep>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();

  const handleStartMission = () => {
    setCurrentStep('terms');
  };

  const handleTermsAccepted = () => {
    setCurrentStep('quiz');
  };

  const handleTermsDeclined = () => {
    setCurrentStep('declined');
  };

  const handleQuizComplete = async (responses: any) => {
    if (!user || !profile) return;

    setIsLoading(true);
    try {
      // Salvar respostas da Missão 5
      await supabase.from('respostas_missao5').insert({
        user_id: user.id,
        nome: profile.nome,
        email: profile.email,
        respostas: responses
      });

      // Salvar respostas detalhadas do Fast Track
      await supabase.from('fast_track_responses').insert({
        user_id: user.id,
        accepted_terms: true,
        interest_level: responses.interest,
        time_commitment: responses.timeCommitment,
        main_objective: responses.mainObjective,
        other_objective: responses.otherObjective
      });

      // Marcar Missão 5 como completada
      await supabase
        .from('user_progress')
        .update({
          missao_5_completed: true,
          missao_5_answers: responses,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      setCurrentStep('complete');
    } catch (error) {
      console.error('Erro ao salvar respostas da Missão 5:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {currentStep === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-primary/20">
              <div className="text-center space-y-6">
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mb-4"
                  >
                    <Rocket className="w-12 h-12 text-primary-foreground" />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400"
                  >
                    <Star className="w-full h-full" />
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-2 text-lg">
                    MISSÃO 5
                  </Badge>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Fast Track Digital
                  </h1>
                  <div className="flex items-center justify-center gap-2 text-lg font-medium">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <span>Universo: "Você está prestes a conquistar o universo. Mestre do cosmos!"</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 text-left">
                  <h3 className="text-xl font-semibold mb-4 text-center">Sua Jornada Final</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Parabéns por chegar até aqui! Você demonstrou suas competências digitais e agora tem a oportunidade 
                    de participar do nosso programa de aceleração digital exclusivo. Esta missão especial te conectará 
                    com oportunidades únicas de crescimento e desenvolvimento.
                  </p>
                </div>

                <Button
                  onClick={handleStartMission}
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-lg py-6"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Iniciar Missão Final
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {currentStep === 'terms' && (
          <FastTrackTerms
            onAccept={handleTermsAccepted}
            onDecline={handleTermsDeclined}
          />
        )}

        {currentStep === 'quiz' && (
          <FastTrackQuiz
            onComplete={handleQuizComplete}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'complete' && (
          <FastTrackComplete onComplete={onComplete} />
        )}

        {currentStep === 'declined' && (
          <FastTrackDeclined onComplete={onComplete} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MissaoCinco;