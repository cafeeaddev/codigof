import { Button } from './ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useGifCapture } from '../hooks/useGifCapture';
import { useToast } from '../hooks/use-toast';
import { Progress } from './ui/progress';

export const GifExportButton = () => {
  const { captureGif, downloadGif, isCapturing, progress } = useGifCapture();
  const { toast } = useToast();

  const handleExportGif = async () => {
    try {
      toast({
        title: "Capturando GIF",
        description: "Gerando GIF do fundo vaporwave...",
      });

      const blob = await captureGif({
        width: 800,
        height: 600,
        fps: 15,
        duration: 4,
        quality: 8
      });

      downloadGif(blob);

      toast({
        title: "GIF gerado!",
        description: "Download do GIF iniciado automaticamente.",
      });
    } catch (error) {
      console.error('Erro ao gerar GIF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o GIF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <Button
        onClick={handleExportGif}
        disabled={isCapturing}
        variant="outline"
        size="sm"
        className="bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
      >
        {isCapturing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {isCapturing ? 'Gerando...' : 'Exportar GIF'}
      </Button>
      
      {isCapturing && (
        <div className="bg-background/80 backdrop-blur-sm border border-primary/20 rounded-lg p-3 min-w-[200px]">
          <div className="text-xs text-muted-foreground mb-2">
            Progresso: {progress}%
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};