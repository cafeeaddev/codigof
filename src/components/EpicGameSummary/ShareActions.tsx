import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareActionsProps {
  phrase: string;
  profile: string;
  sublevel: string;
  className?: string;
}

export const ShareActions: React.FC<ShareActionsProps> = ({
  phrase,
  profile,
  sublevel,
  className
}) => {
  const handleShareLinkedIn = () => {
    // Apenas abre a página inicial do LinkedIn
    window.open('https://www.linkedin.com', '_blank', 'noopener,noreferrer');
  };

  // Cor única do LinkedIn para todos os usuários
  const linkedinColor = '#0077B5'; // Cor oficial do LinkedIn

  return (
    <div className={cn("space-y-4", className)}>
      {/* Texto do perfil */}
      <div className="relative">
        <div 
          className="absolute inset-0 bg-gradient-to-r opacity-10 blur-sm rounded-lg"
          style={{ 
            background: 'linear-gradient(45deg, hsl(var(--primary))20, transparent, hsl(var(--primary))20)' 
          }}
        />
        <p className="relative text-foreground/90 leading-relaxed p-4 rounded-lg border border-border/50 bg-background/30">
          {phrase}
        </p>
      </div>

      {/* Texto explicativo para LinkedIn */}
      <div className="text-center space-y-3">
        <p className="text-foreground/90 font-medium text-lg">
          Que tal compartilhar sua conquista no LinkedIn?
        </p>
        <div className="text-foreground/80 text-sm leading-relaxed">
          <p className="mb-2">
            Basta tirar um print desta página e publicar marcando a Forvis Mazars Brasil, usando as hashtags:
          </p>
          <p className="font-mono text-primary">
            #GrowBelongImpact #DesperteSeuCodigoF #CafeEAD
          </p>
        </div>
      </div>

      {/* Botão */}
      <div className="flex justify-center">
        <Button
          onClick={handleShareLinkedIn}
          className="w-full sm:w-auto group relative overflow-hidden transition-all duration-300 hover:scale-105 px-8 py-3 text-white"
          style={{ 
            backgroundColor: linkedinColor
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-30 transition-opacity" 
               style={{ background: 'linear-gradient(45deg, white, transparent)' }} />
          <Share2 size={18} className="mr-2 relative z-10" />
          <span className="relative z-10">
            Compartilhar no LinkedIn
          </span>
        </Button>
      </div>
    </div>
  );
};