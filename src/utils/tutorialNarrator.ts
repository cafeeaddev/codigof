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
        this.audioEl.muted = true;
        this.audioEl.src = "data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAA"; // minimal silent mp3 header
        await this.audioEl.play();
        this.audioEl.pause();
        this.audioEl.muted = false;
        this.audioEl.removeAttribute("src");
      }
    } catch (_) {}
  }

  isSpeaking() {
    return this.speaking;
  }

  private async speakWithEdge(text: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke("tutorial-narration", {
        body: { text },
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
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "pt-BR";
    utter.rate = 1;
    utter.onend = () => onend && onend();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    return true;
  }

  async speak(text: string, onend?: () => void) {
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
