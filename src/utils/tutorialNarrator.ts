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
        this.audioEl.src = "data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAA"; // minimal silent mp3 header
        await this.audioEl.play();
        this.audioEl.pause();
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
      this.audioEl.crossOrigin = "anonymous";
      
      const handleEnd = () => {
        console.log('[TutorialNarrator] Custom audio ended');
        this.speaking = false;
        onend && onend();
      };

      const handleError = (error: Event) => {
        console.error('[TutorialNarrator] Custom audio error:', error);
        this.speaking = false;
        onend && onend();
      };

      this.speaking = true;
      this.audioEl.src = url;
      this.audioEl.onended = handleEnd;
      this.audioEl.onerror = handleError;
      
      await this.audioEl.play();
      console.log('[TutorialNarrator] Custom audio started playing successfully');
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

    // Try custom audio first if provided
    if (customAudioUrl) {
      const success = await this.playCustomAudio(customAudioUrl, onend);
      if (success) return;
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
