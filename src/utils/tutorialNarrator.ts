import { supabase } from "@/integrations/supabase/client";

function base64ToBlob(base64: string, contentType = "audio/mpeg") {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

class TutorialNarrator {
  private audioEl: HTMLAudioElement | null = null;
  private activated = false;
  private speaking = false;

  async init() {
    if (!this.audioEl) {
      this.audioEl = new Audio();
      this.audioEl.preload = "auto";
    }
  }

  async activate() {
    await this.init();
    this.activated = true;
    // try to unlock audio context by playing tiny silent sound
    try {
      if (this.audioEl) {
        console.log('[TutorialNarrator] Activating audio context...');
        this.audioEl.muted = true;
        this.audioEl.volume = 1.0;
        
        // Create a simple oscillator context instead of trying to load a file
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
          
          await audioContext.close();
        } catch (contextError) {
          console.warn('[TutorialNarrator] Audio context creation failed, using silent audio element');
          // Fallback to audio element with data URL
          this.audioEl.src = "data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAAAA";
          await this.audioEl.play();
          this.audioEl.pause();
        }
        
        this.audioEl.muted = false;
        this.audioEl.currentTime = 0;
        this.audioEl.removeAttribute("src");
        console.log('[TutorialNarrator] Audio context activated successfully. Muted:', this.audioEl.muted, 'Volume:', this.audioEl.volume);
      }
    } catch (error) {
      console.warn('[TutorialNarrator] Failed to activate audio context:', error);
    }
  }

  isSpeaking() {
    return this.speaking;
  }

  private async speakWithEdge(text: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke("tutorial-narration", {
        body: { text, voice: 'echo' },
      });
      if (error) throw error;
      const base64 = (data as any)?.audioContent;
      if (!base64) throw new Error("Sem áudio retornado");
      const blob = base64ToBlob(base64);
      if (!this.audioEl) await this.init();
      if (!this.audioEl) return false;
      this.audioEl.src = URL.createObjectURL(blob);
      await this.audioEl.play();
      return true;
    } catch (e) {
      return false;
    }
  }

  private speakWithWebSpeech(text: string, onend?: () => void) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
    const synth = window.speechSynthesis;
    const pickVoice = () => {
      const voices = synth.getVoices();
      return (
        voices.find(v => v.lang?.startsWith('pt') && /female|feminina|Luciana|Camila|Victoria/i.test(v.name)) ||
        voices.find(v => v.lang?.startsWith('pt')) ||
        voices[0]
      );
    };
    const voice = pickVoice();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "pt-BR";
    if (voice) utter.voice = voice;
    utter.pitch = 1.2; // leve toque robótico
    utter.rate = 0.98;
    utter.onend = () => onend && onend();
    synth.cancel();
    synth.speak(utter);
    return true;
  }

  async playCustomAudio(url: string, onend?: () => void): Promise<boolean> {
    try {
      if (!this.audioEl) await this.init();
      if (!this.audioEl) return false;
      
      console.log('[TutorialNarrator] Playing custom audio:', url);
      console.log('[TutorialNarrator] Audio state before play - Muted:', this.audioEl.muted, 'Volume:', this.audioEl.volume);
      
      // Ensure audio is unmuted and volume is set
      this.audioEl.muted = false;
      this.audioEl.volume = 1.0;
      
      // Try different CORS settings
      this.audioEl.crossOrigin = null; // Remove CORS restriction first
      
      const handleEnd = () => {
        console.log('[TutorialNarrator] Custom audio ended');
        this.speaking = false;
        onend && onend();
      };

      const handleError = (error: Event) => {
        console.error('[TutorialNarrator] Custom audio error - trying CORS bypass:', error);
        
        // Try with CORS enabled as fallback
        if (this.audioEl && this.audioEl.crossOrigin !== "anonymous") {
          console.log('[TutorialNarrator] Retrying with CORS enabled...');
          this.audioEl.crossOrigin = "anonymous";
          this.audioEl.load(); // Reload with new CORS setting
          return; // Let it try again
        }
        
        console.error('[TutorialNarrator] Custom audio failed completely');
        this.speaking = false;
        onend && onend();
      };

      const handleCanPlay = () => {
        console.log('[TutorialNarrator] Custom audio can play - starting playback');
        if (this.audioEl) {
          this.audioEl.play().catch((playError) => {
            console.error('[TutorialNarrator] Play failed:', playError);
            handleError(playError);
          });
        }
      };

      this.speaking = true;
      this.audioEl.src = url;
      this.audioEl.onended = handleEnd;
      this.audioEl.onerror = handleError;
      this.audioEl.oncanplay = handleCanPlay;
      
      // Force load the audio
      this.audioEl.load();
      
      console.log('[TutorialNarrator] Custom audio loading initiated');
      return true;
    } catch (error) {
      console.error('[TutorialNarrator] Failed to play custom audio:', error);
      this.speaking = false;
      return false;
    }
  }

  async speak(text: string, onend?: () => void, customAudioUrl?: string) {
    if (!this.activated) return;
    if (this.speaking) {
      // stop current
      if (this.audioEl) {
        this.audioEl.pause();
        this.audioEl.currentTime = 0;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }

    // If custom audio URL is provided, ONLY use custom audio (no TTS fallback)
    if (customAudioUrl) {
      console.log('[TutorialNarrator] Custom audio URL provided, skipping TTS fallback');
      const success = await this.playCustomAudio(customAudioUrl, onend);
      if (!success) {
        console.warn('[TutorialNarrator] Custom audio failed to play, calling onend without TTS fallback');
        // Don't fallback to TTS, just call onend to continue tutorial
        onend && onend();
      }
      return;
    }

    this.speaking = true;

    const handleEnd = () => {
      this.speaking = false;
      onend && onend();
    };

    // Try edge TTS first
    const ok = await this.speakWithEdge(text);
    if (ok) {
      if (this.audioEl) {
        this.audioEl.onended = handleEnd;
      }
      return;
    }

    // Fallback to Web Speech
    const fallback = this.speakWithWebSpeech(text, handleEnd);
    if (!fallback) {
      // If no audio APIs available, just call onend
      handleEnd();
    }
  }
}

export const narrator = new TutorialNarrator();
