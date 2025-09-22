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
      });

      // Track progress
      gif.on('progress', (p: number) => {
        setProgress(Math.round(p * 100));
      });

      const totalFrames = duration * fps;
      const frameDelay = 1000 / fps;

      // Create a temporary canvas for resizing
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');

      if (!tempCtx) {
        throw new Error('Não foi possível criar contexto do canvas');
      }

      // Capture frames
      for (let i = 0; i < totalFrames; i++) {
        await new Promise(resolve => setTimeout(resolve, frameDelay));
        
        // Resize and capture frame
        tempCtx.drawImage(canvas, 0, 0, width, height);
        
        gif.addFrame(tempCanvas, { delay: frameDelay });
        
        // Update progress for capture phase (0-50%)
        const captureProgress = (i / totalFrames) * 50;
        setProgress(Math.round(captureProgress));
      }

      // Render GIF
      return new Promise<Blob>((resolve, reject) => {
        gif.on('finished', (blob: Blob) => {
          setProgress(100);
          setIsCapturing(false);
          resolve(blob);
        });

        gif.on('error', (error: Error) => {
          setIsCapturing(false);
          reject(error);
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return {
    captureGif,
    downloadGif,
    isCapturing,
    progress
  };
};