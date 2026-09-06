// Web Audio API Synthesis Engine for Brainactiver
// 100% Offline, Zero external audio file download required.
import type { Language } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeAlarmInterval: number | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAlarmChime();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Synthesize Traditional Percussion Dhol
  public playDholBeat(type: 'dhum' | 'khei' = 'dhum') {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      if (type === 'dhum') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(48, now + 0.35);

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
      } else {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.Q.setValueAtTime(3, now);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch {
      // Defensive
    }
  }

  // Synthesize Folk Horn / Flute Pepa
  public playPepaNote(freq: number = 440, durationSeconds: number = 0.4) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.2, now);
      lfoGain.gain.setValueAtTime(8, now);
      lfo.connect(osc.frequency);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.8, now);
      filter.Q.setValueAtTime(6.5, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(now);
      osc.start(now);
      osc.stop(now + durationSeconds);
      lfo.stop(now + durationSeconds);
    } catch {
      // Defensive
    }
  }

  // Gentle, harmonic reward chime for dementia & elderly patients
  public playSuccessChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const notes = [329.63, 392.00, 440.00, 523.25, 659.25]; // E4, G4, A4, C5, E5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + (idx * 0.08);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.6);
      });
    } catch {
      // Defensive
    }
  }

  // Gentle guidance tone (comforting non-jarring feedback)
  public playSoftGuidance() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(310, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Defensive
    }
  }

  // Alarm reminder chime
  public playAlarmChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + (idx * 0.15);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.8);
      });
    } catch {
      // Defensive
    }
  }

  public startAlarmRingtone(durationSeconds: number = 10) {
    if (this.activeAlarmInterval) clearInterval(this.activeAlarmInterval);
    this.playAlarmChime();
    let elapsed = 0;
    this.activeAlarmInterval = window.setInterval(() => {
      elapsed += 2;
      if (elapsed >= durationSeconds) {
        this.stopAlarmChime();
      } else {
        this.playAlarmChime();
      }
    }, 2000);
  }

  public stopAlarmChime() {
    if (this.activeAlarmInterval) {
      clearInterval(this.activeAlarmInterval);
      this.activeAlarmInterval = null;
    }
  }

  // Multilingual Regional Voice Prompter
  public speakPrompt(text: string, language: Language = 'en') {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88; // Slightly measured cadence for clarity
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      
      if (language === 'ta') {
        const taVoice = voices.find(v => v.lang.startsWith('ta') || v.lang.includes('Tamil'));
        if (taVoice) {
          utterance.voice = taVoice;
          utterance.lang = taVoice.lang;
        } else {
          utterance.lang = 'en-IN';
        }
      } else if (language === 'bn') {
        const bnVoice = voices.find(v => v.lang.startsWith('bn') || v.lang.includes('Bengali'));
        if (bnVoice) {
          utterance.voice = bnVoice;
          utterance.lang = bnVoice.lang;
        } else {
          utterance.lang = 'en-IN';
        }
      } else if (language === 'as') {
        const asVoice = voices.find(v => v.lang.startsWith('as') || v.lang.includes('Assamese')) 
                     || voices.find(v => v.lang.startsWith('bn'))
                     || voices.find(v => v.lang.startsWith('hi'));
        if (asVoice) {
          utterance.voice = asVoice;
          utterance.lang = asVoice.lang;
        } else {
          utterance.lang = 'en-IN';
        }
      } else if (language === 'lus') {
        // Mizo fallback
        const inVoice = voices.find(v => v.lang === 'en-IN') || voices.find(v => v.lang.startsWith('en'));
        if (inVoice) {
          utterance.voice = inVoice;
          utterance.lang = inVoice.lang;
        }
      } else {
        const enVoice = voices.find(v => v.lang === 'en-IN') || voices.find(v => v.lang.startsWith('en'));
        if (enVoice) {
          utterance.voice = enVoice;
          utterance.lang = enVoice.lang;
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Safety guard
    }
  }
}

export const audioEngine = new AudioEngine();
