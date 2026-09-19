import type { Language } from '../types';
import { voiceCommands } from './voiceCommandsData';

export type VoiceIntent =
  | 'OPEN_HOME'
  | 'OPEN_MEMORY_MATRIX'
  | 'OPEN_MUSIC_MATCH'
  | 'OPEN_BAMBOO_BASKET'
  | 'OPEN_PATTERN_SEQUENCE'
  | 'OPEN_WORD_SCRAMBLE'
  | 'OPEN_MATH_MAZE'
  | 'OPEN_SMRITI_RONG'
  | 'OPEN_TAAL_XUR'
  | 'OPEN_WHAT_CHANGED'
  | 'OPEN_PROGRESS'
  | 'READ_PROGRESS'
  | 'OPEN_REMINDERS'
  | 'OPEN_CAREGIVER'
  | 'OPEN_SETTINGS'
  | 'OPEN_LANGUAGE_SELECTION'
  | 'GO_BACK'
  | 'LOGOUT'
  | 'START_GAME'
  | 'PAUSE_GAME'
  | 'RESUME_GAME'
  | 'NEXT'
  | 'REPEAT'
  | 'STOP'
  | 'READ_SCORE'
  | 'SET_REMINDER'
  | 'SHOW_REWARDS'
  | 'SHOW_COINS';

export interface CommandEntry {
  phrases: string[];
  keywords: string[];
}

export const VOICE_INTENT_LIST: VoiceIntent[] = [
  'OPEN_HOME',
  'OPEN_MEMORY_MATRIX',
  'OPEN_MUSIC_MATCH',
  'OPEN_BAMBOO_BASKET',
  'OPEN_PATTERN_SEQUENCE',
  'OPEN_WORD_SCRAMBLE',
  'OPEN_MATH_MAZE',
  'OPEN_SMRITI_RONG',
  'OPEN_TAAL_XUR',
  'OPEN_WHAT_CHANGED',
  'OPEN_PROGRESS',
  'READ_PROGRESS',
  'OPEN_REMINDERS',
  'OPEN_CAREGIVER',
  'OPEN_SETTINGS',
  'OPEN_LANGUAGE_SELECTION',
  'GO_BACK',
  'LOGOUT',
  'START_GAME',
  'PAUSE_GAME',
  'RESUME_GAME',
  'NEXT',
  'REPEAT',
  'STOP',
  'READ_SCORE',
  'SET_REMINDER',
  'SHOW_REWARDS',
  'SHOW_COINS',
];

const ALL_LANGUAGES: Language[] = ['en', 'as', 'bn', 'lus', 'mni', 'kha', 'grt', 'trp', 'ne'];

// Keep all scripts the STT engines may produce: Latin (+extended +combining),
// Devanagari, Bengali/Assamese, Meitei Mayek.
const KEEP_CLASS =
  'a-z0-9\\u00C0-\\u024F\\u0300-\\u036F\\u0900-\\u097F\\u0980-\\u09FF\\uAAE0-\\uAAFF\\u1E00-\\u1EFF';
const STRIP_REGEX = new RegExp(`[^${KEEP_CLASS}\\s]`, 'g');

export function normalizeCommandText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, '')
    .replace(STRIP_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasBoundaryPhrase(input: string, phrase: string): boolean {
  return (
    input.startsWith(phrase + ' ') ||
    input.endsWith(' ' + phrase) ||
    input.includes(' ' + phrase + ' ') ||
    input === phrase
  );
}

export function detectIntent(rawText: string, language: Language): VoiceIntent | null {
  const input = normalizeCommandText(rawText);
  if (!input) return null;
  const inputTokens = new Set(input.split(' '));
  const ordered = [language, ...ALL_LANGUAGES.filter((l) => l !== language)];

  let best: VoiceIntent | null = null;
  let bestScore = 0;

  for (const lang of ordered) {
    const dict = voiceCommands[lang];
    if (!dict) continue;
    const priority = lang === language ? 8 : 0;
    for (const intentKey of Object.keys(dict) as VoiceIntent[]) {
      const entry = dict[intentKey];
      if (!entry) continue;
      let score = 0;
      for (const phrase of entry.phrases) {
        const np = normalizeCommandText(phrase);
        if (np && input.includes(np)) {
          score += np.split(' ').length * 5;
        }
      }
      for (const kw of entry.keywords) {
        const nk = normalizeCommandText(kw);
        if (!nk) continue;
        const single = nk.indexOf(' ') === -1;
        if (single ? inputTokens.has(nk) : hasBoundaryPhrase(input, nk)) {
          score += 1;
        }
      }
      if (score > 0) {
        const total = score + priority;
        if (total > bestScore) {
          bestScore = total;
          best = intentKey;
        }
      }
    }
  }

  return best;
}