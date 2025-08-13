import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Share2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${phrase}\n#PerfilDigital #AprendizadoContínuo`);
      toast({ 
        title: 'Copiado!', 
        description: 'Frase copiada para a área de transferência.',
        duration: 3000
      });
    } catch {
      toast({ 
        title: 'Ops', 
        description: 'Não foi possível copiar. Tente novamente.', 
        variant: 'destructive' 
      });
    }
  };

  const handleShareLinkedIn = () => {
    const url = `${window.location.origin}/`;
    const title = `Meu Perfil Digital: ${profile} (${sublevel})`;
    const summary = phrase;
    const shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}&source=${encodeURIComponent('Gamificação Digital')}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
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
    <Card 
      className={cn(
        "relative overflow-hidden backdrop-blur-md animate-epic-entry",
        "bg-gradient-to-br from-card/80 to-card/40",
        "border-2",
        className
      )}
      style={{
        borderColor: profileColor,
        boxShadow: `0 0 20px ${profileColor}30`,
        animationDelay: '1.2s'
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy 
            size={24} 
            style={{ color: profileColor }}
            className="animate-pulse"
          />
          <h3 
            className="text-xl font-bold"
            style={{ color: profileColor }}
          >
            Compartilhe sua conquista!
          </h3>
        </div>

        <div className="space-y-4">
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

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleCopy}
              variant="outline"
              className="flex-1 group relative overflow-hidden border-2 transition-all duration-300 hover:scale-105"
              style={{ 
                borderColor: profileColor,
                color: profileColor
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity" 
                   style={{ background: `linear-gradient(45deg, ${profileColor}, transparent)` }} />
              <Copy size={18} className="mr-2 relative z-10" />
              <span className="relative z-10">Copiar frase</span>
            </Button>

            <Button
              onClick={handleShareLinkedIn}
              className="flex-1 group relative overflow-hidden transition-all duration-300 hover:scale-105"
              style={{ 
                backgroundColor: profileColor,
                color: 'hsl(var(--background))'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-30 transition-opacity" 
                   style={{ background: 'linear-gradient(45deg, white, transparent)' }} />
              <Share2 size={18} className="mr-2 relative z-10" />
              <span className="relative z-10">LinkedIn</span>
            </Button>
          </div>
        </div>

        {/* Decorative corner elements */}
        <div 
          className="absolute top-2 right-2 w-1 h-6 rounded-full opacity-60"
          style={{ backgroundColor: profileColor }}
        />
        <div 
          className="absolute bottom-2 left-2 w-6 h-1 rounded-full opacity-60"
          style={{ backgroundColor: profileColor }}
        />
      </CardContent>
    </Card>
  );
};