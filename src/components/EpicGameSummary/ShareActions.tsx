import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Share2, Trophy, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface ShareActionsProps {
  phrase: string;
  profile: string;
  sublevel: string;
  className?: string;
  cardRef?: React.RefObject<HTMLDivElement>;
}

export const ShareActions: React.FC<ShareActionsProps> = ({
  phrase,
  profile,
  sublevel,
  className,
  cardRef
}) => {
  const handleShareLinkedIn = async () => {
    try {
      toast({ 
        title: 'Gerando imagem...', 
        description: 'Preparando sua conquista para compartilhar.',
        duration: 2000
      });

      // Se tem referência do card, gera screenshot primeiro
      if (cardRef?.current) {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: '#0a0a0a',
          scale: 1,
          useCORS: true,
          allowTaint: true,
          removeContainer: false,
          logging: false,
          height: cardRef.current.offsetHeight,
          width: cardRef.current.offsetWidth,
          x: 0,
          y: 0
        });

        // Gera o download da imagem
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `meu-perfil-digital-${profile.toLowerCase().replace(/\s+/g, '-')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }, 'image/png', 0.8);
      }

      // Abre o LinkedIn com o texto
      const url = `${window.location.origin}/`;
      const title = `Meu Perfil Digital: ${profile} (${sublevel})`;
      const summary = `${phrase}\n\n#PerfilDigital #AprendizadoContínuo`;
      const shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}&source=${encodeURIComponent('Gamificação Digital')}`;
      
      window.open(shareUrl, '_blank', 'noopener,noreferrer');

      toast({ 
        title: 'Sucesso!', 
        description: 'Imagem baixada e LinkedIn aberto para compartilhar.',
        duration: 3000
      });

    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      
      // Se falhar, pelo menos abre o LinkedIn
      const url = `${window.location.origin}/`;
      const title = `Meu Perfil Digital: ${profile} (${sublevel})`;
      const summary = `${phrase}\n\n#PerfilDigital #AprendizadoContínuo`;
      const shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}&source=${encodeURIComponent('Gamificação Digital')}`;
      
      window.open(shareUrl, '_blank', 'noopener,noreferrer');

      toast({ 
        title: 'LinkedIn aberto!', 
        description: 'Não foi possível gerar a imagem, mas o LinkedIn foi aberto.',
        duration: 3000
      });
    }
  };

  const getProfileColor = () => {
    switch (profile.toLowerCase()) {
      case 'ninja': return 'hsl(var(--neon-purple))';
      case 'pro-player': return 'hsl(var(--neon-cyan))';
      case 'explorer': return 'hsl(var(--neon-yellow))';
      case 'beginner +': return 'hsl(var(--neon-green))';
      default: return 'hsl(var(--neon-pink))';
    }
  };

  const profileColor = getProfileColor();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Texto do perfil */}
      <div className="relative">
        <div 
          className="absolute inset-0 bg-gradient-to-r opacity-10 blur-sm rounded-lg"
          style={{ 
            background: `linear-gradient(45deg, ${profileColor}20, transparent, ${profileColor}20)` 
          }}
        />
        <p className="relative text-foreground/90 leading-relaxed p-4 rounded-lg border border-border/50 bg-background/30">
          {phrase}
        </p>
      </div>

      {/* Título Compartilhe */}
      <div className="flex items-center gap-3 mb-2">
        <Trophy 
          size={20} 
          style={{ color: profileColor }}
          className="animate-pulse"
        />
        <h3 
          className="text-lg font-bold"
          style={{ color: profileColor }}
        >
          Compartilhe sua conquista!
        </h3>
      </div>

      {/* Botão */}
      <div className="flex justify-center">
        <Button
          onClick={handleShareLinkedIn}
          className="w-full sm:w-auto group relative overflow-hidden transition-all duration-300 hover:scale-105 px-8 py-3"
          style={{ 
            backgroundColor: profileColor,
            color: 'hsl(var(--background))'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-30 transition-opacity" 
               style={{ background: 'linear-gradient(45deg, white, transparent)' }} />
          <Share2 size={18} className="mr-2 relative z-10" />
          <span className="relative z-10">Compartilhar no LinkedIn</span>
        </Button>
      </div>
    </div>
  );
};