import type { Language } from '../types';
import { audioEngine } from './audioEngine';

export type SpeechState = 'idle' | 'listening' | 'processing';

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionResultLike extends ArrayLike<SpeechRecognitionAlternative> {
  isFinal?: boolean;
}

export interface SpeechRecognitionResultListLike extends ArrayLike<SpeechRecognitionResultLike> {}

export interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

export interface SpeechRecognitionErrorLike {
  error: string;
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  const ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return typeof ctor === 'function' ? (ctor as SpeechRecognitionCtor) : null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

export type SpeechErrorCode =
  | 'not-supported'
  | 'no-speech'
  | 'not-allowed'
  | 'network'
  | 'start-failed'
  | 'unknown';

export interface SpeechSessionCallbacks {
  onInterim: (text: string) => void;
  onResult: (text: string) => void;
  onStateChange: (state: SpeechState) => void;
  onError: (code: SpeechErrorCode) => void;
}

const TIMEOUT_MS = 10000;
const MAX_SILENT_RESTARTS = 2;

export class SpeechSession {
  private recognition: SpeechRecognitionLike | null = null;
  private state: SpeechState = 'idle';
  private timeoutId: number | null = null;
  private silentRestarts = 0;
  private language: Language;
  private callbacks: SpeechSessionCallbacks;
  private stoppedByUser = false;

  constructor(language: Language, callbacks: SpeechSessionCallbacks) {
    this.language = language;
    this.callbacks = callbacks;
  }

  getState(): SpeechState {
    return this.state;
  }

  private setState(s: SpeechState): void {
    this.state = s;
    this.callbacks.onStateChange(s);
  }

  private clearTimeout(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private armTimeout(): void {
    this.clearTimeout();
    this.timeoutId = window.setTimeout(() => {
      if (this.state === 'listening') {
        try {
          this.recognition?.stop();
        } catch {
          // Ignore
        }
      }
    }, TIMEOUT_MS);
  }

  private teardown(): void {
    this.clearTimeout();
    const rec = this.recognition;
    this.recognition = null;
    if (rec) {
      try {
        rec.onstart = null;
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.abort();
      } catch {
        // Ignore
      }
    }
  }

  start(): void {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      this.callbacks.onError('not-supported');
      return;
    }
    this.stoppedByUser = false;
    this.silentRestarts = 0;

    audioEngine.setLanguage(this.language);
    const config = audioEngine.getSpeechRecognitionConfig();
    const rec = new Ctor();
    rec.lang = config.lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    this.recognition = rec;

    rec.onstart = () => {
      this.setState('listening');
      this.armTimeout();
    };

    rec.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < event.results.length; i++) {
        const row = event.results[i];
        const alt = row && row[0];
        if (!alt) continue;
        if (row.isFinal) {
          finalText += alt.transcript;
        } else {
          interimText += alt.transcript;
        }
      }
      if (finalText.trim()) {
        this.silentRestarts = 0;
        this.setState('processing');
        this.teardown();
        this.callbacks.onResult(finalText.trim());
      } else if (interimText.trim()) {
        this.silentRestarts = 0;
        this.callbacks.onInterim(interimText.trim());
      }
    };

    rec.onerror = (event) => {
      if (this.stoppedByUser) return;
      const code = (event && event.error) || 'unknown';
      if (code === 'no-speech' || code === 'aborted') {
        return;
      }
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        this.setState('idle');
        this.teardown();
        this.callbacks.onError('not-allowed');
        return;
      }
      if (code === 'network') {
        this.setState('idle');
        this.teardown();
        this.callbacks.onError('network');
        return;
      }
      this.setState('idle');
      this.teardown();
      this.callbacks.onError('unknown');
    };

    rec.onend = () => {
      if (this.stoppedByUser) {
        this.setState('idle');
        return;
      }
      this.clearTimeout();
      if (this.state === 'processing') {
        return;
      }
      if (this.silentRestarts < MAX_SILENT_RESTARTS) {
        this.silentRestarts += 1;
        try {
          rec.start();
        } catch {
          this.setState('idle');
        }
      } else {
        this.setState('idle');
        this.teardown();
        this.callbacks.onError('no-speech');
      }
    };

    try {
      rec.start();
    } catch {
      this.setState('idle');
      this.teardown();
      this.callbacks.onError('start-failed');
    }
  }

  stop(): void {
    this.stoppedByUser = true;
    this.teardown();
    this.setState('idle');
  }
}