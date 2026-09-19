import type { Language } from '../types';
import { audioEngine } from './audioEngine';

export function speak(text: string, language?: Language): void {
  audioEngine.speakPrompt(text, language);
}

export function stopSpeaking(): void {
  audioEngine.stopAlarmChime();
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Safety guard
    }
  }
}