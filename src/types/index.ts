export type Language = 
  | 'en'   // English
  | 'as'   // Assamese
  | 'bn'   // Bengali
  | 'lus'  // Mizo
  | 'mni'  // Meitei (Manipuri)
  | 'kha'  // Khasi
  | 'grt'  // Garo
  | 'trp'  // Kokborok
  | 'ne';  // Nepali

export type DementiaStage = 'Mild Cognitive Impairment (MCI)' | 'Early-Stage Dementia' | 'Moderate Dementia' | 'General Senior Wellness';

export type ThemeMode = 'light' | 'dark' | 'comfort' | 'forest' | 'azure';

export type FontScale = 'small' | 'normal' | 'large' | 'xlarge';

export interface DisplaySettings {
  theme: ThemeMode;
  fontScale: FontScale;
  highContrast: boolean;
  soundEnabled: boolean;
  language: Language;
}

// Extended per-user preferences. The DisplaySettings subset drives the live
// theme/font/language/sound systems; the remaining flags gate voice,
// notifications, reminders, adaptive difficulty and accessibility features.
// Stored per user id (see db USER_PREFS) and applied on login.
export interface UserPreferences extends DisplaySettings {
  voiceAssistantEnabled: boolean;
  voiceCommandsEnabled: boolean;
  reminderVoiceEnabled: boolean;
  notificationsEnabled: boolean;
  reminderAlarmsEnabled: boolean;
  adaptiveDifficultyEnabled: boolean;
  largerTouchTargets: boolean;
  reducedMotion: boolean;
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

export type AvatarGender = 'male' | 'female';
export type AvatarHair = 'short' | 'bald' | 'bun';
export type AvatarSkin = 'light' | 'warm';
export type AvatarClothing = 'emerald' | 'maroon' | 'blue' | 'gold';

export interface AvatarConfig {
  gender: AvatarGender;
  hair: AvatarHair;
  skin: AvatarSkin;
  clothing: AvatarClothing;
  glasses: boolean;
  earrings: boolean;
}

export type GameType = 
  | 'smriti_rong'    // Reminiscence & Photo Memory
  | 'memory_matrix'  // Working Memory & Spatial Card Flip
  | 'taal_xur'       // Attention & Reaction Speed
  | 'muga_motif'     // Pattern Recognition & Routine Logic
  | 'word_scramble'  // Word & Language Recall
  | 'math_maze'      // Calculation & Problem Solving
  | 'bamboo_basket'  // Bamboo Basket Weaving Sequence
  | 'music_match'    // Auditory Matching & Gentle Recall
  | 'what_changed'   // Visual Observation & Change Detection
  | 'number_mismatch'; // Number Order & Mismatch Detection

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

export interface ActivityRecord {
  id: string;
  timestamp: number;
  gameType: GameType;
  gameTitle: string;
  difficultyLevel: number;
  score: number;
  maxPossibleScore: number;
  durationMs: number;
  mistakesCount: number;
  accuracy: number;
  completedSuccessfully: boolean;
  patientId: string;
  patientName: string;
  synced: boolean;
  // Reward coin metrics (optional for backward compatibility)
  coinsEarned?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
}

export interface CoinEntry {
  id: string;
  timestamp: number;
  amount: number;
  gameType: GameType;
}

export interface CoinSummary {
  today: number;
  total: number;
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

// Lifecycle states for a single scheduled reminder occurrence.
// PENDING is implicit (no record stored); DUE / ACKNOWLEDGED / COMPLETED /
// MISSED are persisted as ReminderEvent records by the reminder scheduler.
export type ReminderOccurrenceStatus = 'PENDING' | 'DUE' | 'ACKNOWLEDGED' | 'COMPLETED' | 'MISSED';

// Persisted record for one reminder occurrence (reminderId + scheduled date +
// scheduled time). This is the deduplication key, the status ledger, and the
// feed the caregiver dashboard reads for MISSED reminders. Stored under its
// own localStorage key; the ReminderItem shape is unchanged.
export interface ReminderEvent {
  occurrenceKey: string; // `${reminderId}|${YYYY-MM-DD}|${HH:MM}` (unique)
  reminderId: string;
  patientId: string; // device patient profile id (same convention as ActivityRecord)
  patientName: string; // device patient profile name
  sessionUserId: string; // auth session user id at trigger time ('' when unknown)
  profileId: string; // monitored device profile id (caregiver isolation scope)
  title: string;
  note: string;
  category: ReminderItem['category'];
  scheduledDate: string; // YYYY-MM-DD in device local time
  scheduledTime: string; // HH:MM 24h in device local time
  scheduledTimestamp: number; // epoch ms of the scheduled local time
  voiceAlarm: boolean;
  status: ReminderOccurrenceStatus;
  triggeredAt: number; // epoch ms when the occurrence became DUE (or was evaluated)
  acknowledgedAt?: number; // epoch ms when acknowledged/completed
  missedAt?: number; // epoch ms when marked MISSED
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

export type UserRole = 'patient' | 'caregiver';

export interface UserCredentials {
  id: string;
  phoneNumber: string;
  pinHash: string;
  role: UserRole;
  name: string;
  createdAt: number;
  lastLoginAt?: number;
}

export interface AuthSession {
  userId: string;
  role: UserRole;
  phoneNumber: string;
  name: string;
  loggedInAt: number;
  expiresAt: number;
}
