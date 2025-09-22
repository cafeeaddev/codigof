import { Button } from './ui/button';
import { Video, Loader2 } from 'lucide-react';
import { useVideoCapture } from '../hooks/useVideoCapture';
import { useToast } from '../hooks/use-toast';
import { Progress } from './ui/progress';

export const VideoExportButton = () => {
  const { captureVideo, downloadVideo, isRecording, progress } = useVideoCapture();
  const { toast } = useToast();

  const handleExportVideo = async () => {
    try {
      toast({
        title: "Gravando Vídeo",
        description: "Capturando vídeo MP4 do fundo vaporwave...",
      });

      const blob = await captureVideo({
        width: 1920,
        height: 1080,
        fps: 60,
        duration: 5,
        videoBitsPerSecond: 25000000 // Ultra high quality - 25 Mbps
      });

      downloadVideo(blob);

      toast({
        title: "Vídeo gravado!",
        description: "Download do MP4 iniciado automaticamente.",
      });
    } catch (error) {
      console.error('Erro ao gravar vídeo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gravar o vídeo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <Button
        onClick={handleExportVideo}
        disabled={isRecording}
        variant="outline"
        size="sm"
        className="bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
      >
        {isRecording ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Video className="mr-2 h-4 w-4" />
        )}
        {isRecording ? 'Gravando...' : 'Gravar Vídeo'}
      </Button>
      
      {isRecording && (
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