import type { Language } from '../types';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'lus', name: 'Mizo', nativeName: 'Mizo ṭawng', flag: '🇮🇳' },
  { code: 'mni', name: 'Meitei (Manipuri)', nativeName: 'মেইতেই (মণিপুরী)', flag: '🇮🇳' },
  { code: 'kha', name: 'Khasi', nativeName: 'Khasi', flag: '🇮🇳' },
  { code: 'grt', name: 'Garo', nativeName: 'Garo', flag: '🇮🇳' },
  { code: 'trp', name: 'Kokborok', nativeName: 'Kokborok', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
];