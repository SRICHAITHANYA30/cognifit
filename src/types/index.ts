export type Language = 'en' | 'as' | 'bn' | 'ta' | 'lus'; // English | Assamese | Bengali | Tamil | Mizo

export type DementiaStage = 'Mild Cognitive Impairment (MCI)' | 'Early-Stage Dementia' | 'Moderate Dementia' | 'General Senior Wellness';

export type ThemeMode = 'light' | 'dark' | 'comfort' | 'forest' | 'azure';

export type FontScale = 'normal' | 'large' | 'xlarge';

export interface DisplaySettings {
  theme: ThemeMode;
  fontScale: FontScale;
  highContrast: boolean;
  soundEnabled: boolean;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  primaryDialect: string;
  dementiaStage: DementiaStage;
  baselineLatencyMs: number;
  ashaWorkerName: string;
  caregiverContact: string;
  emergencyContact: string;
}

export type GameType = 
  | 'smriti_rong'    // Reminiscence & Photo Memory
  | 'memory_matrix'  // Working Memory & Spatial Card Flip
  | 'taal_xur'       // Attention & Reaction Speed
  | 'muga_motif'     // Pattern Recognition & Routine Logic
  | 'word_scramble'  // Word & Language Recall
  | 'math_maze';     // Calculation & Problem Solving

export interface TelemetryRecord {
  id: string;
  timestamp: number;
  gameType: GameType;
  difficultyLevel: number; // 1 to 5
  decisionLatencyMs: number;
  motorLatencyMs: number;
  accuracy: number; // 0 to 1
  tremorHesitationCount: number;
  completedSuccessfully: boolean;
  synced: boolean;
}

export interface DailyCsiScore {
  date: string; // YYYY-MM-DD
  compositeCsi: number; // 0 to 100
  memoryScore: number;
  executiveScore: number;
  attentionScore: number;
  motorStabilityScore: number;
  sessionCount: number;
  clinicalNote: string;
}

export interface MemoryVaultItem {
  id: string;
  title: string;
  titleAssamese?: string;
  relationship?: string;
  relationshipAssamese?: string;
  category: 'family' | 'culture' | 'place' | 'routine';
  imageUrl: string;
  audioPromptAssamese: string;
  audioPromptEnglish: string;
  cluesAssamese: string[];
  cluesEnglish: string[];
  isCustomUploaded?: boolean;
}

export type ReminderFrequency = 'once' | 'daily' | 'weekdays' | 'weekly';

export interface ReminderItem {
  id: string;
  title: string;
  note: string;
  time: string; // HH:MM in 24h format e.g. "08:30"
  category: 'brain' | 'medicine' | 'water' | 'walk' | 'rest';
  frequency: ReminderFrequency;
  enabled: boolean;
  voiceAlarm: boolean;
  lastTriggeredDate?: string;
}

// Legacy routine interface for backward compatibility
export interface RoutineReminder {
  id: string;
  timeOfDay: string;
  hour: number;
  titleAssamese: string;
  titleEnglish: string;
  descriptionAssamese: string;
  descriptionEnglish: string;
  category: 'medicine' | 'tea' | 'meal' | 'walk' | 'rest';
  isCompleted: boolean;
  audioPromptAssamese: string;
}

export interface SyncStatus {
  lastSyncTimestamp: number | null;
  pendingRecordsCount: number;
  isSyncing: boolean;
  phcCenterName: string;
}
