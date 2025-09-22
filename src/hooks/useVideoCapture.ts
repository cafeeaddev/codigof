import { useCallback, useState } from 'react';

interface VideoCaptureOptions {
  width?: number;
  height?: number;
  fps?: number;
  duration?: number; // in seconds
  videoBitsPerSecond?: number;
}

export const useVideoCapture = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  const captureVideo = useCallback(async (options: VideoCaptureOptions = {}) => {
    const {
      width = 1920,
      height = 1080,
      fps = 60,
      duration = 5,
      videoBitsPerSecond = 25000000 // 25 Mbps for ultra high quality
    } = options;

    // Check MediaRecorder support
    if (!MediaRecorder.isTypeSupported('video/mp4')) {
      throw new Error('Gravação de vídeo MP4 não é suportada neste navegador');
    }

    setIsRecording(true);
    setProgress(0);

    try {
      // Find the canvas element from VaporwaveScene
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('Canvas não encontrado');
      }

      // Create video stream from canvas
      const stream = canvas.captureStream(fps);
      
      // Configure MediaRecorder with highest quality settings
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/mp4; codecs="avc1.42E01E"',
        videoBitsPerSecond,
        audioBitsPerSecond: 128000 // High quality audio
      });

      const chunks: Blob[] = [];
      let startTime = Date.now();

      // Collect video data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      // Create final video blob
      const videoPromise = new Promise<Blob>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/mp4' });
          resolve(blob);
        };

        mediaRecorder.onerror = (error) => {
          reject(error);
        };
      });

      // Progress tracking
      const progressInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setProgress(Math.round(progress));
      }, 100);

      // Start recording with smaller chunks for better quality
      mediaRecorder.start(50); // Collect data every 50ms for smoother quality

      // Stop recording after duration
      setTimeout(() => {
        clearInterval(progressInterval);
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      }, duration * 1000);

      const blob = await videoPromise;
      
      setProgress(100);
      setTimeout(() => {
        setIsRecording(false);
        setProgress(0);
      }, 1000);

      return blob;

    } catch (error) {
      setIsRecording(false);
      setProgress(0);
      throw error;
    }
  }, []);

  const downloadVideo = useCallback((blob: Blob, filename = 'vaporwave-background.mp4') => {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('Vídeo MP4 download iniciado:', filename);
    } catch (error) {
      console.error('Erro no download do vídeo:', error);
      throw error;
    }
  }, []);

  return {
    captureVideo,
    downloadVideo,
    isRecording,
    progress
  };
};