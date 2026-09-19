// Web Audio API Synthesis Engine for Brainactiver
// 100% Offline, Zero external audio file download required.
import type { Language } from '../types';

// Global language configuration for voice system
export interface VoiceLanguageConfig {
  selectedLanguage: Language;
  languageCode: string;
  speechRecognitionLanguage: string;
  textToSpeechLanguage: string;
}

// Language to BCP-47 code mapping for speech engines
const LANGUAGE_CODE_MAP: Record<Language, { tts: string; stt: string }> = {
  en: { tts: 'en-IN', stt: 'en-IN' },
  as: { tts: 'as-IN', stt: 'as-IN' },
  bn: { tts: 'bn-IN', stt: 'bn-IN' },
  lus: { tts: 'en-IN', stt: 'en-IN' }, // Mizo fallback to English India
  mni: { tts: 'mni-IN', stt: 'mni-IN' }, // Meitei
  kha: { tts: 'en-IN', stt: 'en-IN' }, // Khasi fallback
  grt: { tts: 'en-IN', stt: 'en-IN' }, // Garo fallback
  trp: { tts: 'en-IN', stt: 'en-IN' }, // Kokborok fallback
  ne: { tts: 'ne-NP', stt: 'ne-NP' }, // Nepali
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeAlarmInterval: number | null = null;
  // Retained so the engine never garbage-collects a queued utterance
  // (a known cause of silently-dropped speech on some Chromium builds).
  private lastUtterance: SpeechSynthesisUtterance | null = null;
  private gestureUnlockInstalled = false;
  private voicesWarmedUp = false;

  // Voice language configuration - updated when user changes language
  private voiceConfig: VoiceLanguageConfig = {
    selectedLanguage: 'en',
    languageCode: 'en-IN',
    speechRecognitionLanguage: 'en-IN',
    textToSpeechLanguage: 'en-IN',
  };

  // Browsers gate AudioContext and speech behind user activation. A reminder
  // that fires on a timer has no gesture, so unlock the audio pipeline on
  // the first real interaction — afterwards scheduled alarms find it running.
  private ensureGestureUnlockInstalled(): void {
    if (this.gestureUnlockInstalled) {
      return;
    }
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }
    this.gestureUnlockInstalled = true;
    const unlock = () => {
      try {
        if (this.ctx && this.ctx.state === 'suspended') {
          void this.ctx.resume();
        }
      } catch {
        // Unlock is best-effort; playback paths retry independently.
      }
      this.warmUpVoices();
    };
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
    document.addEventListener('touchend', unlock);
  }

  private warmUpVoices(): void {
    try {
      if (!('speechSynthesis' in window)) {
        return;
      }
      window.speechSynthesis.getVoices();
      if (this.voicesWarmedUp) {
        return;
      }
      this.voicesWarmedUp = true;
      const refresh = () => {
        try {
          window.speechSynthesis.getVoices();
        } catch {
          // Voice list refresh is best-effort.
        }
      };
      try {
        window.speechSynthesis.addEventListener('voiceschanged', refresh, { once: true });
      } catch {
        const synth = window.speechSynthesis as unknown as { onvoiceschanged?: (() => void) | null };
        synth.onvoiceschanged = refresh;
      }
    } catch {
      // Voice warm-up is best-effort.
    }
  }

  private getContext(): AudioContext {
    this.ensureGestureUnlockInstalled();
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
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

  // Update voice configuration when language changes
  public setLanguage(language: Language): void {
    const mapping = LANGUAGE_CODE_MAP[language] || LANGUAGE_CODE_MAP.en;
    this.voiceConfig = {
      selectedLanguage: language,
      languageCode: mapping.tts,
      speechRecognitionLanguage: mapping.stt,
      textToSpeechLanguage: mapping.tts,
    };
  }

  // Get current voice configuration
  public getVoiceConfig(): VoiceLanguageConfig {
    return { ...this.voiceConfig };
  }

  // Get SpeechRecognition language for current selection
  public getSpeechRecognitionLang(): string {
    return this.voiceConfig.speechRecognitionLanguage;
  }

  // Get Text-to-Speech language for current selection
  public getTextToSpeechLang(): string {
    return this.voiceConfig.textToSpeechLanguage;
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

  // =====================================================================
  // Elder-friendly Relaxing Music Match sounds
  // Short, soft, calming instrumental phrases synthesised 100% locally
  // (bamboo flute, chimes, nature birdsong and a gentle soft heartbeat).
  // Volumes are intentionally low, attacks gentle, no sudden or loud hits.
  // =====================================================================

  // Calm bamboo flute phrase (gentle pentatonic, breathy tone)
  public playRelaxingFlute(variant: number = 0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const phrases = [
        [392.0, 440.0, 587.33, 493.88, 587.33], // G4 A4 D5 B4 D5
        [330.0, 392.0, 440.0, 523.25, 440.0],   // E4 G4 A4 C5 A4
      ];
      const notes = phrases[variant % phrases.length];
      const noteDur = 0.6;
      const gap = 0.12;

      notes.forEach((freq, idx) => {
        const start = now + (idx * (noteDur + gap));
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        const vibrato = ctx.createOscillator();
        const vibratoDepth = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        // Soft gentle vibrato like a wooden flute
        vibrato.frequency.setValueAtTime(4.5, start);
        vibratoDepth.gain.setValueAtTime(5, start);
        vibrato.connect(vibratoDepth);
        vibratoDepth.connect(osc.frequency);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 2.4, start);
        filter.Q.setValueAtTime(1.2, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.16, start + 0.18);
        gain.gain.linearRampToValueAtTime(0.08, start + noteDur * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, start + noteDur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        vibrato.start(start);
        osc.start(start);
        osc.stop(start + noteDur + 0.05);
        vibrato.stop(start + noteDur + 0.05);
      });
    } catch {
      // Defensive
    }
  }

  // Soft temple wind-chime sparkle (shimmering bell arpeggio)
  public playRelaxingChime(variant: number = 0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const phrases = [
        [523.25, 659.25, 783.99, 1046.5], // C5 E5 G5 C6
        [440.0, 523.25, 587.33, 880.0],   // A4 C5 D5 A5
      ];
      const notes = phrases[variant % phrases.length];
      const step = 0.28;

      notes.forEach((freq, idx) => {
        const start = now + (idx * step);
        // Fundamental sine plus two airy bell partials
        [1.0, 2.76, 4.17].forEach((partial, pIdx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteFreq = freq * partial;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(noteFreq, start);

          // Gentle chime attack, long soft shimmering decay
          const peak = pIdx === 0 ? 0.14 : 0.05;
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.linearRampToValueAtTime(peak, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 1.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(start);
          osc.stop(start + 1.55);
        });
      });
    } catch {
      // Defensive
    }
  }

  // Calm nature birdsong (two soft gentle chirps with a warm glide)
  public playRelaxingBird(variant: number = 0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const chirps = variant % 2 === 0
        ? [[1800, 2400], [1500, 2050]]
        : [[1600, 2200], [1250, 1750]];

      chirps.forEach(([from, to], idx) => {
        const start = now + (idx * 0.7);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(from, start);
        osc.frequency.linearRampToValueAtTime(to, start + 0.12);
        osc.frequency.linearRampToValueAtTime(from, start + 0.22);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.34);
      });
    } catch {
      // Defensive
    }
  }

  // Very soft gentle heartbeat / soft folk percussion pulse
  public playRelaxingHeartbeat(variant: number = 0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const base = variant % 2 === 0 ? 90 : 75;

      [0, 0.5].forEach((offset, idx) => {
        const start = now + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(base, start);
        osc.frequency.exponentialRampToValueAtTime(base * 0.55, start + 0.12);

        const peak = idx === 0 ? 0.22 : 0.16;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(peak, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {
      // Defensive
    }
  }

  // Single entry point used by the Music Match game
  public playRelaxingSound(type: 'flute' | 'chime' | 'bird' | 'heartbeat', variant: number = 0) {
    switch (type) {
      case 'flute': this.playRelaxingFlute(variant); break;
      case 'chime': this.playRelaxingChime(variant); break;
      case 'bird': this.playRelaxingBird(variant); break;
      case 'heartbeat': this.playRelaxingHeartbeat(variant); break;
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

  // Multilingual Regional Voice Prompter - uses dynamic language config
  public speakPrompt(text: string, language?: Language): void {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;
    this.ensureGestureUnlockInstalled();
    this.warmUpVoices();

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      this.lastUtterance = utterance;
      utterance.rate = 0.88; // Slightly measured cadence for clarity
      utterance.pitch = 1.05;

      // Use provided language or current configured language
      const targetLanguage = language || this.voiceConfig.selectedLanguage;
      const mapping = LANGUAGE_CODE_MAP[targetLanguage] || LANGUAGE_CODE_MAP.en;
      
      const voices = window.speechSynthesis.getVoices();
      
      // Find voice for the target language
      let selectedVoice: SpeechSynthesisVoice | null = null;
      
      // Try exact match first
      selectedVoice = voices.find(v => v.lang === mapping.tts) || null;
      
      // Try prefix match
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith(mapping.tts.split('-')[0])) || null;
      }
      
      // Try language name match
      if (!selectedVoice) {
        const langNames: Record<string, string[]> = {
          'as-IN': ['Assamese'],
          'bn-IN': ['Bengali'],
          'mni-IN': ['Meitei', 'Manipuri'],
          'kha': ['Khasi'],
          'grt': ['Garo'],
          'trp': ['Kokborok'],
          'ne-NP': ['Nepali'],
          'en-IN': ['English', 'India'],
        };
        const names = langNames[mapping.tts] || [];
        selectedVoice = voices.find(v => names.some(n => v.name.includes(n) || v.lang.includes(n))) || null;
      }
      
      // Fallback to English India
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang === 'en-IN') || voices.find(v => v.lang.startsWith('en')) || null;
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = mapping.tts;
      }

      // Track whether speech actually started: timer-fired alarms have no
      // user gesture, and some engines silently drop such utterances.
      let speechStarted = false;
      utterance.onstart = () => {
        speechStarted = true;
      };
      utterance.onend = () => {
        speechStarted = true;
      };
      utterance.onerror = () => {
        speechStarted = false;
      };

      window.speechSynthesis.speak(utterance);

      // Single guarded retry: if nothing started within 700ms the utterance
      // was dropped — speak it once more. Never retries speech that already
      // started, ended, was muted, or was superseded by newer speech.
      window.setTimeout(() => {
        try {
          if (this.isMuted || speechStarted) {
            return;
          }
          if (!('speechSynthesis' in window)) {
            return;
          }
          if (this.lastUtterance !== utterance) {
            return;
          }
          window.speechSynthesis.speak(utterance);
        } catch {
          // The single retry is best-effort.
        }
      }, 700);
    } catch {
      // Safety guard
    }
  }

  // Speech Recognition helper - returns config for Web Speech API
  public getSpeechRecognitionConfig(): { lang: string; continuous: boolean; interimResults: boolean } {
    return {
      lang: this.voiceConfig.speechRecognitionLanguage,
      continuous: true,
      interimResults: true,
    };
  }
}

export const audioEngine = new AudioEngine();
