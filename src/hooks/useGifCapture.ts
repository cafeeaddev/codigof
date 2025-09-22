import { useCallback, useState } from 'react';

// @ts-ignore - gif.js doesn't have proper TypeScript definitions
import GIF from 'gif.js';

interface GifCaptureOptions {
  width?: number;
  height?: number;
  fps?: number;
  duration?: number; // in seconds
  quality?: number; // 1-30, lower is better
}

export const useGifCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [progress, setProgress] = useState(0);

  const captureGif = useCallback(async (options: GifCaptureOptions = {}) => {
    const {
      width = 800,
      height = 600,
      fps = 15,
      duration = 4,
      quality = 10
    } = options;

    setIsCapturing(true);
    setProgress(0);

    try {
      // Find the canvas element from VaporwaveScene
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('Canvas não encontrado');
      }

      // Create GIF encoder
      const gif = new GIF({
        workers: 2,
        quality: quality,
        width: width,
        height: height,
        workerScript: '/node_modules/gif.js/dist/gif.worker.js'
      });

      const totalFrames = duration * fps;
      const frameInterval = 1000 / fps;
      let capturedFrames = 0;

      // Create a temporary canvas for resizing
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');

      if (!tempCtx) {
        throw new Error('Não foi possível criar contexto do canvas');
      }

      // Capture frames with better timing control
      const captureFrame = () => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            try {
              // Resize and capture frame
              tempCtx.drawImage(canvas, 0, 0, width, height);
              gif.addFrame(tempCanvas, { delay: frameInterval });
              
              capturedFrames++;
              const captureProgress = (capturedFrames / totalFrames) * 50;
              setProgress(Math.round(captureProgress));
              
              resolve();
            } catch (error) {
              console.error('Erro ao capturar frame:', error);
              resolve(); // Continue even if one frame fails
            }
          }, frameInterval);
        });
      };

      // Capture all frames sequentially
      for (let i = 0; i < totalFrames; i++) {
        await captureFrame();
      }

      console.log(`Captured ${capturedFrames} frames, starting render...`);

      // Render GIF with timeout
      return new Promise<Blob>((resolve, reject) => {
        let isFinished = false;
        
        // Set timeout to prevent infinite rendering
        const timeout = setTimeout(() => {
          if (!isFinished) {
            console.error('GIF rendering timeout');
            setIsCapturing(false);
            setProgress(0);
            reject(new Error('Timeout na geração do GIF'));
          }
        }, 30000); // 30 second timeout

        gif.on('progress', (p: number) => {
          if (!isFinished) {
            const renderProgress = 50 + (p * 50);
            setProgress(Math.round(renderProgress));
          }
        });

        gif.on('finished', (blob: Blob) => {
          if (!isFinished) {
            isFinished = true;
            clearTimeout(timeout);
            setProgress(100);
            setTimeout(() => {
              setIsCapturing(false);
              setProgress(0);
            }, 1000);
            resolve(blob);
          }
        });

        gif.on('error', (error: Error) => {
          if (!isFinished) {
            isFinished = true;
            clearTimeout(timeout);
            setIsCapturing(false);
            setProgress(0);
            reject(error);
          }
        });

        gif.render();
      });

    } catch (error) {
      setIsCapturing(false);
      setProgress(0);
      throw error;
    }
  }, []);

  const downloadGif = useCallback((blob: Blob, filename = 'vaporwave-background.gif') => {
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
      
      console.log('GIF download iniciado:', filename);
    } catch (error) {
      console.error('Erro no download do GIF:', error);
      throw error;
    }
  }, []);

  return {
    captureGif,
    downloadGif,
    isCapturing,
    progress
  };
};