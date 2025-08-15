import React, { useCallback, useRef, useState } from 'react';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const mountedRef = useRef(true);
  
  // Cleanup na desmontagem
  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safelyManipulateDOM = useCallback((action: () => void) => {
    try {
      if (mountedRef.current && document.body) {
        action();
      }
    } catch (error) {
      console.warn('DOM manipulation skipped due to error:', error);
    }
  }, []);

  const generateScreenshot = useCallback(async (element: HTMLDivElement): Promise<Blob | null> => {
    try {
      // Verifica se o elemento ainda existe no DOM
      if (!element || !document.contains(element) || !mountedRef.current) {
        console.warn('Element not available for screenshot');
        return null;
      }

      // Aguarda um frame para garantir que o DOM está estável
      await new Promise(resolve => requestAnimationFrame(resolve));

      const canvas = await html2canvas(element, {
        backgroundColor: '#0a0a0a',
        scale: 1,
        useCORS: true,
        allowTaint: true,
        removeContainer: false,
        logging: false,
        height: element.offsetHeight,
        width: element.offsetWidth,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          // Remove scripts do documento clonado para evitar conflitos
          const scripts = clonedDoc.querySelectorAll('script');
          scripts.forEach(script => script.remove());
        }
      });

      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 0.8);
      });
    } catch (error) {
      console.error('Screenshot generation failed:', error);
      return null;
    }
  }, []);

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    safelyManipulateDOM(() => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup com delay para garantir que o download iniciou
      setTimeout(() => {
        safelyManipulateDOM(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          URL.revokeObjectURL(url);
        });
      }, 100);
    });
  }, [safelyManipulateDOM]);

  const handleShareLinkedIn = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      if (!mountedRef.current) return;

      toast({ 
        title: 'Gerando imagem...', 
        description: 'Preparando sua conquista para compartilhar.',
        duration: 2000
      });

      // Se tem referência do card, gera screenshot primeiro
      if (cardRef?.current) {
        const blob = await generateScreenshot(cardRef.current);
        
        if (blob && mountedRef.current) {
          const filename = `meu-perfil-digital-${profile.toLowerCase().replace(/\s+/g, '-')}.png`;
          downloadBlob(blob, filename);
        }
      }

      // Abre o LinkedIn com o texto apenas se o componente ainda estiver montado
      if (mountedRef.current) {
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
      }

    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      
      // Fallback: pelo menos abre o LinkedIn
      if (mountedRef.current) {
        try {
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
        } catch (fallbackError) {
          console.error('Fallback também falhou:', fallbackError);
          
          toast({ 
            title: 'Erro', 
            description: 'Não foi possível abrir o LinkedIn. Tente novamente.',
            duration: 3000,
            variant: 'destructive'
          });
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsGenerating(false);
      }
    }
  }, [isGenerating, cardRef, profile, sublevel, phrase, generateScreenshot, downloadBlob]);

  const getProfileColor = () => {
    switch (profile.toLowerCase()) {
      case 'ninja': return 'hsl(var(--neon-purple))';
      case 'pro-player': return 'hsl(var(--neon-cyan))';
      case 'explorer': return 'hsl(var(--neon-purple))';
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


      {/* Botão */}
      <div className="flex justify-center">
        <Button
          onClick={handleShareLinkedIn}
          disabled={isGenerating}
          className="w-full sm:w-auto group relative overflow-hidden transition-all duration-300 hover:scale-105 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ 
            backgroundColor: isGenerating ? 'hsl(var(--muted))' : profileColor,
            color: 'hsl(var(--background))'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-30 transition-opacity" 
               style={{ background: 'linear-gradient(45deg, white, transparent)' }} />
          <Share2 size={18} className="mr-2 relative z-10" />
          <span className="relative z-10">
            {isGenerating ? 'Gerando...' : 'Compartilhar no LinkedIn'}
          </span>
        </Button>
      </div>
    </div>
  );
};