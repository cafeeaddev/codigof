import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, Star, Trophy, Sparkles } from 'lucide-react';

interface FastTrackDeclinedProps {
  onComplete: () => void;
}

const FastTrackDeclined: React.FC<FastTrackDeclinedProps> = ({ onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-3xl"
    >
      <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-primary/20 relative overflow-hidden">
        {/* Animated background hearts */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-primary/20"
              initial={{
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
                opacity: 0,
                scale: 0
              }}
              animate={{
                y: [null, Math.random() * -100 - 50],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 4,
                delay: i * 0.3,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <Heart className="w-4 h-4" />
            </motion.div>
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
              <div className="w-full h-full bg-gradient-to-br from-pink-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <Heart className="w-16 h-16 text-white" />
              </div>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 15, -15, 0]
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
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 text-lg">
                OBRIGADA!
              </Badge>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Muito Obrigada por Jogar!
              </h1>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 rounded-xl p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-8 h-8 text-pink-500" />
              </div>
              <div className="text-left space-y-4">
                <h3 className="text-2xl font-semibold">Uma mensagem carinhosa da Cody:</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  "Que jornada incrível nós fizemos juntos! Mesmo não seguindo para o Fast Track, você demonstrou 
                  suas competências digitais e aprendeu muito durante nossas missões. Estou muito orgulhosa de 
                  cada passo que você deu comigo. Continue explorando, aprendendo e crescendo no universo digital. 
                  Você é incrível! 💜✨"
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary-foreground" />
                </div>
                <p className="text-sm font-medium">Missões<br />Completadas</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium">Competências<br />Desenvolvidas</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium">Experiência<br />Incrível</p>
              </div>
            </div>

            <p className="text-muted-foreground">
              Suas competências digitais foram registradas e você pode continuar sua jornada de aprendizado sempre que quiser!
            </p>
            
            <Button
              onClick={onComplete}
              size="lg"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-xl py-6"
            >
              <Heart className="w-6 h-6 mr-3" />
              Finalizar Jornada
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default FastTrackDeclined;