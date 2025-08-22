import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Rocket, Star, ExternalLink, Sparkles } from 'lucide-react';

interface FastTrackCompleteProps {
  onComplete: () => void;
}

const FastTrackComplete: React.FC<FastTrackCompleteProps> = ({ onComplete }) => {
  const handleRedirect = () => {
    window.open('https://mazars.cafeead.com.br/', '_blank');
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-3xl"
    >
      <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-primary/20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full"
              initial={{
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
                opacity: 0
              }}
              animate={{
                y: [null, Math.random() * -200 - 50],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center space-y-8">
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto w-32 h-32"
            >
              <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-primary rounded-full flex items-center justify-center">
                <Rocket className="w-16 h-16 text-primary-foreground" />
              </div>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center"
              >
                <Star className="w-6 h-6 text-yellow-900" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 py-2 text-lg">
                MISSÃO COMPLETA!
              </Badge>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Parabéns, Explorador Digital!
              </h1>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-xl p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div className="text-left space-y-4">
                <h3 className="text-2xl font-semibold">Uma mensagem especial da Cody:</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  "Incrível! Você demonstrou ter as competências digitais necessárias para nossa jornada de transformação. 
                  Agora que você completou todas as missões e se inscreveu no Fast Track, sua verdadeira aventura digital 
                  está apenas começando! Estou muito orgulhosa do seu progresso. Vamos juntos conquistar o universo digital! 🚀✨"
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <p className="text-muted-foreground">
              Você será redirecionado para a plataforma do Fast Track Digital onde sua jornada de aceleração continuará.
            </p>
            
            <Button
              onClick={handleRedirect}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-xl py-6"
            >
              <ExternalLink className="w-6 h-6 mr-3" />
              Sua Jornada Começa Agora
            </Button>

            <p className="text-xs text-muted-foreground">
              Você será redirecionado para: mazars.cafeead.com.br
            </p>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default FastTrackComplete;