import type {
  DailyCsiScore,
  DisplaySettings,
  MemoryVaultItem,
  PatientProfile,
  ReminderItem,
  ReminderEvent,
  RoutineReminder,
  SyncStatus,
  TelemetryRecord,
  ActivityRecord,
  CoinEntry,
  CoinSummary,
  GameType,
  UserCredentials,
  AuthSession,
  UserRole,
  Language,
  AvatarConfig,
  UserPreferences
} from '../types';
import { adaptiveEngine } from './adaptiveEngine';

const STORAGE_KEYS = {
  PROFILE: 'brainactiver_profile_v2',
  VAULT: 'brainactiver_vault_v2',
  ROUTINES: 'brainactiver_routines_v2',
  REMINDERS: 'brainactiver_reminders_v2',
  SETTINGS: 'brainactiver_settings_v2',
  TELEMETRY: 'brainactiver_telemetry_v2',
  ACTIVITIES: 'brainactiver_activities_v2',
  COINS: 'brainactiver_coins_v2',
  SYNC_STATUS: 'brainactiver_sync_status_v2',
  USERS: 'brainactiver_users_v2',
  AUTH_SESSION: 'brainactiver_auth_session_v2',
  AVATAR: 'brainactiver_avatar_v2',
  REMINDER_EVENTS: 'brainactiver_reminder_events_v2',
  USER_PREFS: 'brainactiver_user_prefs_v2',
};

// Same-tab broadcast fired whenever any user's extended preferences are
// saved, so live consumers (theme attributes, voice gating) refresh.
export const PREFS_CHANGED_EVENT = 'brainactiver:prefs-changed';

// Baseline extended preferences for a user with no saved snapshot yet.
// Everything defaults to the current app behavior (all features on,
// large senior-friendly text, no experimental accessibility overrides).
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'light',
  fontScale: 'large',
  highContrast: false,
  soundEnabled: true,
  language: 'en',
  voiceAssistantEnabled: true,
  voiceCommandsEnabled: true,
  reminderVoiceEnabled: true,
  notificationsEnabled: true,
  reminderAlarmsEnabled: true,
  adaptiveDifficultyEnabled: true,
  largerTouchTargets: false,
  reducedMotion: false,
};

// Storage key for persisted reminder occurrence events (DUE / ACKNOWLEDGED /
// COMPLETED / MISSED). Exported so the scheduler, the alarm host and the
// caregiver dashboard all observe the same key.
export const REMINDER_EVENTS_STORAGE_KEY = STORAGE_KEYS.REMINDER_EVENTS;

// Same-tab broadcast name fired whenever the reminder list itself changes
// (add / edit / Active-Disabled toggle / delete) so the running scheduler
// re-checks immediately instead of waiting for the next tick.
export const REMINDERS_CHANGED_EVENT = 'brainactiver:reminders-changed';

// Upper bound for stored reminder events so the offline log cannot grow
// without limit on the device. Oldest records are pruned first.
const MAX_REMINDER_EVENTS = 200;

const DEFAULT_SETTINGS: DisplaySettings = {
  theme: 'light',
  fontScale: 'large', // Large by default for elderly accessibility
  highContrast: false,
  soundEnabled: true,
  language: 'en',
};

const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    title: 'Morning Brain Activation Training',
    note: 'Complete 10 minutes of Memory Matrix & Taal Reflex exercises.',
    time: '08:00',
    category: 'brain',
    frequency: 'daily',
    enabled: true,
    voiceAlarm: true,
  },
  {
    id: 'rem-2',
    title: 'Morning Blood Pressure & Vitamin Medication',
    note: 'Take prescribed green tablet with a glass of lukewarm water.',
    time: '09:00',
    category: 'medicine',
    frequency: 'daily',
    enabled: true,
    voiceAlarm: true,
  },
  {
    id: 'rem-3',
    title: 'Hydration & Herbal Tea Break',
    note: 'Drink fresh water or warm herbal tea to maintain fluid balance.',
    time: '11:30',
    category: 'water',
    frequency: 'daily',
    enabled: true,
    voiceAlarm: false,
  },
  {
    id: 'rem-4',
    title: 'Gentle Courtyard Stroll & Sunlight',
    note: '15-minute gentle walk in garden with caregiver support.',
    time: '16:30',
    category: 'walk',
    frequency: 'daily',
    enabled: true,
    voiceAlarm: true,
  },
  {
    id: 'rem-5',
    title: 'Evening Relaxing Word & Math Game',
    note: 'Spend 5 minutes unwinding with Word Scramble before rest.',
    time: '19:30',
    category: 'brain',
    frequency: 'weekdays',
    enabled: true,
    voiceAlarm: false,
  }
];

// Culturally Authentic Pre-seeded Memory Vault
const INITIAL_VAULT: MemoryVaultItem[] = [
  {
    id: 'vault-1',
    title: 'Grandson Aarav',
    titleAssamese: 'নাতি আৰৱ',
    relationship: 'Grandson (Age 8)',
    relationshipAssamese: 'মৰমৰ নাতি (বয়স ৮ বছৰ)',
    category: 'family',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
    audioPromptAssamese: 'এইয়া আপোনাৰ মৰমৰ নাতি আৰৱ। গুৱাহাটীত স্কুলত পঢ়ে।',
    audioPromptEnglish: 'This is your grandson Aarav who studies in school.',
    cluesAssamese: ['আপোনাৰ বৰ মৰমৰ', 'স্কুললৈ যায়', 'নাতি ল’ৰা'],
    cluesEnglish: ['Your beloved grandchild', 'Goes to school', 'Loves playing with you'],
  },
  {
    id: 'vault-2',
    title: 'Kaziranga One-Horned Rhino',
    titleAssamese: 'কাজিৰঙাৰ এশিঙীয়া গঁড়',
    relationship: 'Pride of Northeast',
    relationshipAssamese: 'অসমৰ গৌৰৱ',
    category: 'culture',
    imageUrl: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=600&auto=format&fit=crop&q=80',
    audioPromptAssamese: 'আমাৰ কাজিৰঙা ৰাষ্ট্ৰীয় উদ্যানৰ এশিঙীয়া গঁড়।',
    audioPromptEnglish: 'The magnificent one-horned rhinoceros of Kaziranga National Park.',
    cluesAssamese: ['এশিঙীয়া বনৰীয়া জন্তু', 'কাজিৰঙাত পোৱা যায়', 'অসমৰ গৌৰৱ'],
    cluesEnglish: ['Has a single horn', 'Found in Kaziranga', 'State animal of Assam'],
  },
  {
    id: 'vault-3',
    title: 'Rongali Spring Festival & Gamusa',
    titleAssamese: 'ৰঙালী বিহু আৰু ফুলাম গামোচা',
    relationship: 'Traditional Spring Celebration',
    relationshipAssamese: 'বসন্তৰ হেঁপাহৰ বিহু',
    category: 'culture',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&auto=format&fit=crop&q=80',
    audioPromptAssamese: 'বহাগ বিহুৰ আনন্দ আৰু ডিঙিত পিন্ধোৱা ফুলাম গামোচা।',
    audioPromptEnglish: 'Spring celebration with traditional hand-woven red floral Gamosa.',
    cluesAssamese: ['ৰঙা ফুল তোলা কাপোৰ', 'ঢোল আৰু পেঁপা বাজে', 'ব’হাগ মাহত পতা হয়'],
    cluesEnglish: ['Woven with red floral motifs', 'Dhol and Pepa instruments play', 'Celebrated in spring'],
  },
  {
    id: 'vault-4',
    title: 'Daughter Jonali',
    titleAssamese: 'জী জোনালী',
    relationship: 'Eldest Daughter',
    relationshipAssamese: 'ডাঙৰ জীয়াৰী',
    category: 'family',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    audioPromptAssamese: 'আপোনাৰ ডাঙৰ জীয়াৰী জোনালী। তেওঁ সদায় আপোনাৰ কাষত থাকে।',
    audioPromptEnglish: 'Your eldest daughter Jonali who calls and cares for you every single day.',
    cluesAssamese: ['আপোনাক প্ৰতিদিনে ফোন কৰে', 'আপোনাৰ মৰমৰ জীয়ৰী'],
    cluesEnglish: ['Calls you every single day', 'Your caring eldest daughter'],
  },
  {
    id: 'vault-5',
    title: 'Majuli Traditional Mask Art',
    titleAssamese: 'মাজুলীৰ ঐতিহ্যবাহী মুখা শিল্প',
    relationship: 'Spiritual River Island Art',
    relationshipAssamese: 'সত্ৰীয়া সংস্কৃতি',
    category: 'culture',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    audioPromptAssamese: 'মাজুলী সত্ৰৰ ভাওনাৰ বাবে তৈয়াৰ কৰা পৌৰাণিক মুখা।',
    audioPromptEnglish: 'Traditional Vaishnavite hand-crafted mask made in Majuli Satras.',
    cluesAssamese: ['বাঁহ আৰু মাটিৰে সজা মুখা', 'মাজুলী সত্ৰত হয়'],
    cluesEnglish: ['Bamboo and clay mask', 'Made in Majuli island'],
  },
  {
    id: 'vault-6',
    title: 'Ancestral Tea Garden Home',
    titleAssamese: 'চাহ বাগিচাৰ পুৰণি চাংঘৰ',
    relationship: 'Childhood Memories',
    relationshipAssamese: 'শৈশৱৰ আপোন ঘৰ',
    category: 'place',
    imageUrl: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=600&auto=format&fit=crop&q=80',
    audioPromptAssamese: 'আপোনাৰ শৈশৱ কটোৱা সেউজীয়া চাহ বাগিচাৰ পুৰণি কাঠৰ বাংলো।',
    audioPromptEnglish: 'Your childhood ancestral wooden bungalow amidst lush tea gardens.',
    cluesAssamese: ['সেউজীয়া পাতৰ মাজত', 'আপোনাৰ শৈশৱৰ স্মৃতি'],
    cluesEnglish: ['Surrounded by tea bushes', 'Where you grew up'],
  }
];

const INITIAL_PROFILE: PatientProfile = {
  id: 'patient-jorhat-104',
  name: 'Pranab Baruah (প্ৰণৱ বৰুৱা)',
  age: 72,
  location: 'Jorhat, Assam / North Eastern Region',
  primaryDialect: 'Assamese & English',
  dementiaStage: 'Mild Cognitive Impairment (MCI)',
  baselineLatencyMs: 2150,
  ashaWorkerName: 'Anita Devi (ASHA Health Worker)',
  caregiverContact: '+91 94350 12345 (Daughter Jonali)',
  emergencyContact: '108 (EMRI Emergency Health Service)',
};

function generatePreseededTelemetry(): TelemetryRecord[] {
  const records: TelemetryRecord[] = [];
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const gameTypes: TelemetryRecord['gameType'][] = [
    'smriti_rong',
    'memory_matrix',
    'taal_xur',
    'muga_motif',
    'word_scramble',
    'math_maze',
  ];

  for (let d = 6; d >= 0; d--) {
    const dayTimestamp = now - (d * ONE_DAY);
    gameTypes.slice(0, 4).forEach((gt, idx) => {
      const latency = Math.round((Math.sin(d + idx) * 280) + 1920);
      const accuracy = Math.min(1.0, 0.78 + (Math.cos(d) * 0.14));
      records.push({
        id: `tel-seed-${d}-${idx}`,
        timestamp: dayTimestamp - (idx * 3600 * 1000),
        gameType: gt,
        difficultyLevel: d > 3 ? 2 : 3,
        decisionLatencyMs: latency,
        motorLatencyMs: Math.round(480 + (Math.random() * 110)),
        accuracy: Number(accuracy.toFixed(2)),
        tremorHesitationCount: Math.floor(Math.random() * 2),
        completedSuccessfully: accuracy >= 0.7,
        synced: d > 1,
      });
    });
  }
  return records;
}

class LocalDatabase {
  public getSettings(): DisplaySettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(data);
    // Migration: add language field if missing
    if (!parsed.language) {
      parsed.language = 'en';
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
    }
    return parsed;
  }

  public updateSettings(settings: DisplaySettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  public updateLanguage(language: Language): void {
    const settings = this.getSettings();
    settings.language = language;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  public clearLanguage(): void {
    const settings = this.getSettings();
    settings.language = 'en';
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  public getReminders(): ReminderItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(INITIAL_REMINDERS));
      return INITIAL_REMINDERS;
    }
    return JSON.parse(data);
  }

  private dispatchRemindersChanged(): void {
    try {
      window.dispatchEvent(new CustomEvent(REMINDERS_CHANGED_EVENT));
    } catch {
      // Broadcast is best-effort; persistence above already succeeded.
    }
  }

  public addReminder(item: Omit<ReminderItem, 'id'>): ReminderItem {
    const reminders = this.getReminders();
    const newReminder: ReminderItem = {
      ...item,
      id: `rem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    reminders.push(newReminder);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    this.dispatchRemindersChanged();
    return newReminder;
  }

  public updateReminder(updatedItem: ReminderItem): void {
    const reminders = this.getReminders().map(r =>
      r.id === updatedItem.id ? updatedItem : r
    );
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    this.dispatchRemindersChanged();
  }

  public toggleReminderEnabled(id: string): ReminderItem[] {
    const reminders = this.getReminders().map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    this.dispatchRemindersChanged();
    return reminders;
  }

  public deleteReminder(id: string): ReminderItem[] {
    const reminders = this.getReminders().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    this.dispatchRemindersChanged();
    return reminders;
  }

  // ===== Reminder occurrence event log (scheduler + caregiver feed) =====
  // Additive store: the ReminderItem shape and REMINDERS key are untouched.
  // Each record is one occurrence (reminderId + scheduled date + time) and
  // carries its lifecycle status (DUE / ACKNOWLEDGED / COMPLETED / MISSED).

  public getReminderEvents(): ReminderEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDER_EVENTS);
      if (!data) {
        return [];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? (parsed as ReminderEvent[]) : [];
    } catch {
      return [];
    }
  }

  public getReminderEvent(occurrenceKey: string): ReminderEvent | null {
    return this.getReminderEvents().find(e => e.occurrenceKey === occurrenceKey) || null;
  }

  private persistReminderEvents(events: ReminderEvent[]): ReminderEvent[] {
    const trimmed = events.slice(0, MAX_REMINDER_EVENTS);
    localStorage.setItem(STORAGE_KEYS.REMINDER_EVENTS, JSON.stringify(trimmed));
    this.dispatchReminderEventsChanged(trimmed);
    return trimmed;
  }

  private dispatchReminderEventsChanged(events: ReminderEvent[]): void {
    // Same real-time pattern used by recordTelemetry/recordCoins: a synthetic
    // storage event so open dashboards refresh without a page reload.
    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.REMINDER_EVENTS,
        newValue: JSON.stringify(events),
      }));
    } catch {
      // Non-browser runtimes (tests) or restricted contexts: persistence
      // above already succeeded, the broadcast is best-effort only.
    }
  }

  public saveReminderEvent(event: ReminderEvent): ReminderEvent {
    const events = this.getReminderEvents();
    const existingIndex = events.findIndex(e => e.occurrenceKey === event.occurrenceKey);
    if (existingIndex >= 0) {
      events[existingIndex] = event;
    } else {
      events.unshift(event);
    }
    this.persistReminderEvents(events);
    return event;
  }

  public updateReminderEventStatus(
    occurrenceKey: string,
    status: ReminderEvent['status'],
    extra?: Partial<Pick<ReminderEvent, 'acknowledgedAt' | 'missedAt'>>
  ): ReminderEvent | null {
    const events = this.getReminderEvents();
    const target = events.find(e => e.occurrenceKey === occurrenceKey);
    if (!target) {
      return null;
    }
    target.status = status;
    if (extra?.acknowledgedAt !== undefined) {
      target.acknowledgedAt = extra.acknowledgedAt;
    }
    if (extra?.missedAt !== undefined) {
      target.missedAt = extra.missedAt;
    }
    this.persistReminderEvents(events);
    return target;
  }

  public getMissedReminderEvents(profileId?: string): ReminderEvent[] {
    return this.getReminderEvents()
      .filter(e => e.status === 'MISSED' && (!profileId || e.profileId === profileId))
      .sort((a, b) => (b.missedAt || b.triggeredAt) - (a.missedAt || a.triggeredAt));
  }

  public stampReminderTriggeredDate(id: string, dateKey: string): void {
    try {
      const current = this.getReminders().find(r => r.id === id);
      if (current) {
        this.updateReminder({ ...current, lastTriggeredDate: dateKey });
      }
    } catch {
      // Best-effort bookkeeping; the event log above is the source of truth.
    }
  }

  public getPatientProfile(): PatientProfile {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
      return INITIAL_PROFILE;
    }
    return JSON.parse(data);
  }

  public updatePatientProfile(profile: PatientProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  public getMemoryVault(): MemoryVaultItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.VAULT);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.VAULT, JSON.stringify(INITIAL_VAULT));
      return INITIAL_VAULT;
    }
    return JSON.parse(data);
  }

  public addMemoryVaultItem(item: Omit<MemoryVaultItem, 'id'>): MemoryVaultItem {
    const vault = this.getMemoryVault();
    const newItem: MemoryVaultItem = {
      ...item,
      id: `vault-${Date.now()}`,
      isCustomUploaded: true,
    };
    vault.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.VAULT, JSON.stringify(vault));
    return newItem;
  }

  public deleteMemoryVaultItem(id: string): void {
    const vault = this.getMemoryVault().filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VAULT, JSON.stringify(vault));
  }

  public getRoutines(): RoutineReminder[] {
    const data = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    if (!data) {
      const def: RoutineReminder[] = [
        {
          id: 'rt-1',
          timeOfDay: '08:00 AM',
          hour: 8,
          titleAssamese: 'মগজুৰ প্ৰশিক্ষণ খেল',
          titleEnglish: 'Morning Brain Games (Brainactiver)',
          descriptionAssamese: 'স্মৃতি আৰু মনোযোগৰ খেলসমূহ খেলক।',
          descriptionEnglish: 'Practice 10 mins of Memory Matrix & Reflex games.',
          category: 'tea',
          isCompleted: true,
          audioPromptAssamese: 'মগজুৰ খেল খেলাৰ সময় হৈছে।',
        },
        {
          id: 'rt-2',
          timeOfDay: '09:00 AM',
          hour: 9,
          titleAssamese: 'পুৱাৰ ঔষধ আৰু পানী',
          titleEnglish: 'Morning Medication & Water',
          descriptionAssamese: 'সেউজীয়া টেবলেটটো পানীৰে সৈতে লওক।',
          descriptionEnglish: 'Take morning tablet with fresh water.',
          category: 'medicine',
          isCompleted: false,
          audioPromptAssamese: 'ঔষধ খোৱাৰ সময় হ’ল।',
        },
        {
          id: 'rt-3',
          timeOfDay: '01:00 PM',
          hour: 13,
          titleAssamese: 'দুপৰীয়াৰ পুষ্টিকৰ খাদ্য',
          titleEnglish: 'Nutritious Lunch & Rest',
          descriptionAssamese: 'পুষ্টিকৰ ভাত আৰু জিৰণি।',
          descriptionEnglish: 'Warm nutritious lunch followed by short rest.',
          category: 'meal',
          isCompleted: false,
          audioPromptAssamese: 'ভাত খোৱাৰ সময় হ’ল।',
        }
      ];
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(def));
      return def;
    }
    return JSON.parse(data);
  }

  public toggleRoutineCompleted(id: string): RoutineReminder[] {
    const routines = this.getRoutines().map(r => 
      r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
    );
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
    return routines;
  }

  public getTelemetry(): TelemetryRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.TELEMETRY);
    if (!data) {
      const seeded = generatePreseededTelemetry();
      localStorage.setItem(STORAGE_KEYS.TELEMETRY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(data);
  }

  public recordTelemetry(record: Omit<TelemetryRecord, 'id' | 'synced'>): TelemetryRecord {
    const telemetry = this.getTelemetry();
    const newRecord: TelemetryRecord = {
      ...record,
      id: `tel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      synced: false,
    };
    telemetry.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.TELEMETRY, JSON.stringify(telemetry));
    return newRecord;
  }

  public getActivities(): ActivityRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  }

  public recordActivity(record: Omit<ActivityRecord, 'id' | 'synced'>): ActivityRecord {
    const activities = this.getActivities();
    const newRecord: ActivityRecord = {
      ...record,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      synced: false,
    };
    activities.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    
    // Dispatch storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', { 
      key: STORAGE_KEYS.ACTIVITIES, 
      newValue: JSON.stringify(activities) 
    }));
    
    return newRecord;
  }

  // ===== Reward Coin Methods =====

  public getCoinEntries(): CoinEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.COINS);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  }

  public recordCoins(amount: number, gameType: GameType): void {
    if (amount <= 0) {
      return;
    }
    const entries = this.getCoinEntries();
    entries.push({
      id: `coin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      amount,
      gameType,
    });
    localStorage.setItem(STORAGE_KEYS.COINS, JSON.stringify(entries));

    // Dispatch storage event for real-time caregiver updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.COINS,
      newValue: JSON.stringify(entries),
    }));
  }

  public getCoinSummary(): CoinSummary {
    const todayKey = this.localDateKey(Date.now());
    let today = 0;
    let total = 0;
    for (const entry of this.getCoinEntries()) {
      total += entry.amount;
      if (this.localDateKey(entry.timestamp) === todayKey) {
        today += entry.amount;
      }
    }
    return { today, total };
  }

  private localDateKey(timestamp: number): string {
    const d = new Date(timestamp);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  public getPast7DaysCsi(): DailyCsiScore[] {
    const telemetry = this.getTelemetry();
    const scores: DailyCsiScore[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const target = new Date(now);
      target.setDate(target.getDate() - i);
      const dateStr = target.toISOString().split('T')[0];
      const dailyScore = adaptiveEngine.calculateDailyCsi(telemetry, dateStr);
      scores.push(dailyScore);
    }
    return scores;
  }

  public getSyncStatus(): SyncStatus {
    const telemetry = this.getTelemetry();
    const unsyncedCount = telemetry.filter(t => !t.synced).length;
    const stored = localStorage.getItem(STORAGE_KEYS.SYNC_STATUS);
    
    if (!stored) {
      return {
        lastSyncTimestamp: Date.now() - (12 * 3600 * 1000),
        pendingRecordsCount: unsyncedCount,
        isSyncing: false,
        phcCenterName: 'Titabar Health Centre (Assam Health Mission)',
      };
    }
    
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      pendingRecordsCount: unsyncedCount,
    };
  }

  public async syncWithPhc(): Promise<boolean> {
    const telemetry = this.getTelemetry();
    await new Promise(resolve => setTimeout(resolve, 1200));

    const updated = telemetry.map(t => ({ ...t, synced: true }));
    localStorage.setItem(STORAGE_KEYS.TELEMETRY, JSON.stringify(updated));

    const status: SyncStatus = {
      lastSyncTimestamp: Date.now(),
      pendingRecordsCount: 0,
      isSyncing: false,
      phcCenterName: 'Titabar Health Centre (Assam Health Mission)',
    };
    localStorage.setItem(STORAGE_KEYS.SYNC_STATUS, JSON.stringify(status));
    return true;
  }

  // ===== Authentication Methods =====

  private async hashPin(pin: string, salt?: string): Promise<{ hash: string; salt: string }> {
    const encoder = new TextEncoder();
    const saltBuffer = salt ? this.base64ToBuffer(salt) : crypto.getRandomValues(new Uint8Array(16));
    const saltBase64 = this.bufferToBase64(saltBuffer);
    
    const pinBuffer = encoder.encode(pin + saltBase64);
    const hashBuffer = await crypto.subtle.digest('SHA-256', pinBuffer);
    const hashBase64 = this.bufferToBase64(new Uint8Array(hashBuffer));
    
    return { hash: hashBase64, salt: saltBase64 };
  }

  private base64ToBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private bufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < buffer.length; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }

  private async verifyPin(pin: string, hash: string, salt: string): Promise<boolean> {
    const { hash: computedHash } = await this.hashPin(pin, salt);
    return computedHash === hash;
  }

  public async registerUser(phoneNumber: string, pin: string, role: UserRole, name: string): Promise<UserCredentials | null> {
    const users = this.getUsers();
    
    if (users.some(u => u.phoneNumber === phoneNumber)) {
      return null; // User already exists
    }

    const { hash, salt } = await this.hashPin(pin);
    const newUser: UserCredentials = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      phoneNumber,
      pinHash: `${hash}:${salt}`,
      role,
      name,
      createdAt: Date.now(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  public async loginUser(phoneNumber: string, pin: string, expectedRole: UserRole): Promise<UserCredentials | null> {
    const users = this.getUsers();
    const user = users.find(u => u.phoneNumber === phoneNumber && u.role === expectedRole);
    
    if (!user) {
      return null;
    }

    const [hash, salt] = user.pinHash.split(':');
    const isValid = await this.verifyPin(pin, hash, salt);
    
    if (!isValid) {
      return null;
    }

    // Update last login
    user.lastLoginAt = Date.now();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return user;
  }

  public getUsers(): UserCredentials[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  }

  public getUserById(userId: string): UserCredentials | null {
    const users = this.getUsers();
    return users.find(u => u.id === userId) || null;
  }

  public createSession(user: UserCredentials): AuthSession {
    const session: AuthSession = {
      userId: user.id,
      role: user.role,
      phoneNumber: user.phoneNumber,
      name: user.name,
      loggedInAt: Date.now(),
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
    };
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    return session;
  }

  public getSession(): AuthSession | null {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!data) {
      return null;
    }
    const session: AuthSession = JSON.parse(data);
    if (Date.now() > session.expiresAt) {
      this.clearSession();
      return null;
    }
    return session;
  }

  public clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  }

  public getAvatar(userId?: string): AvatarConfig | null {
    const key = userId ?? this.getSession()?.userId;
    const data = localStorage.getItem(STORAGE_KEYS.AVATAR);
    if (!data || !key) {
      return null;
    }
    try {
      const all = JSON.parse(data) as Record<string, AvatarConfig>;
      return all[key] || null;
    } catch {
      return null;
    }
  }

  public saveAvatar(config: AvatarConfig, userId?: string): void {
    const key = userId ?? this.getSession()?.userId ?? 'patient';
    const data = localStorage.getItem(STORAGE_KEYS.AVATAR);
    let all: Record<string, AvatarConfig> = {};
    if (data) {
      try {
        all = JSON.parse(data) as Record<string, AvatarConfig>;
      } catch {
        all = {};
      }
    }
    all[key] = config;
    localStorage.setItem(STORAGE_KEYS.AVATAR, JSON.stringify(all));
  }

  public async seedDefaultUsers(): Promise<void> {
    const users = this.getUsers();

    // Check if specific default users exist, if not create them
    const hasDefaultPatient = users.some(u => u.phoneNumber === '9435012345' && u.role === 'patient');
    const hasDefaultCaregiver = users.some(u => u.phoneNumber === '9435012346' && u.role === 'caregiver');

    if (!hasDefaultPatient) {
      await this.registerUser('9435012345', '1234', 'patient', 'Pranab Baruah');
    }
    if (!hasDefaultCaregiver) {
      await this.registerUser('9435012346', '1234', 'caregiver', 'Anita Devi');
    }
  }

  // ===== Per-user extended preferences (Settings) =====
  // Stored separately per user id under USER_PREFS; the device-level
  // SETTINGS key keeps driving the live theme/font/language systems and is
  // synced from the snapshot on login and back into it on logout.

  private readPrefsTable(): Record<string, UserPreferences> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PREFS);
      if (!data) {
        return {};
      }
      const parsed = JSON.parse(data);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, UserPreferences>) : {};
    } catch {
      return {};
    }
  }

  public hasUserPreferences(userId: string): boolean {
    if (!userId) {
      return false;
    }
    return Object.prototype.hasOwnProperty.call(this.readPrefsTable(), userId);
  }

  public getUserPreferences(userId: string): UserPreferences {
    const stored = userId ? this.readPrefsTable()[userId] : undefined;
    return { ...DEFAULT_USER_PREFERENCES, ...(stored ?? {}) };
  }

  public saveUserPreferences(userId: string, prefs: UserPreferences): void {
    if (!userId) {
      return;
    }
    const all = this.readPrefsTable();
    all[userId] = { ...DEFAULT_USER_PREFERENCES, ...prefs };
    localStorage.setItem(STORAGE_KEYS.USER_PREFS, JSON.stringify(all));
    try {
      window.dispatchEvent(new CustomEvent(PREFS_CHANGED_EVENT));
    } catch {
      // Broadcast is best-effort; persistence above already succeeded.
    }
  }

  // Effective preferences for the currently signed-in user (falling back to
  // the device settings merged over defaults when logged out). Synchronous
  // so timer-driven services (scheduler, alarm host) can consult it.
  public getActivePreferences(): UserPreferences {
    try {
      const session = this.getSession();
      if (session) {
        return this.getUserPreferences(session.userId);
      }
    } catch {
      // Fall through to device-level defaults below.
    }
    return { ...DEFAULT_USER_PREFERENCES, ...this.getSettings() };
  }

  // ===== Profile & security helpers (Settings) =====

  public updateUserName(userId: string, name: string): UserCredentials | null {
    const clean = name.trim();
    if (!userId || !clean) {
      return null;
    }
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return null;
    }
    user.name = clean;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return user;
  }

  public updateSessionName(name: string): void {
    const clean = name.trim();
    if (!clean) {
      return;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (!data) {
        return;
      }
      const session = JSON.parse(data);
      session.name = clean;
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    } catch {
      // Name sync is best-effort; the users table already holds the truth.
    }
  }

  // Changes a user's PIN after verifying the current one. Uses the same
  // SHA-256 + per-user salt scheme as registration — secrets are never
  // stored in plain text.
  public async changeUserPin(
    userId: string,
    currentPin: string,
    newPin: string
  ): Promise<{ ok: boolean; error?: 'not-found' | 'incorrect' }> {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { ok: false, error: 'not-found' };
    }
    const [hash, salt] = user.pinHash.split(':');
    const valid = await this.verifyPin(currentPin, hash, salt);
    if (!valid) {
      return { ok: false, error: 'incorrect' };
    }
    const { hash: newHash, salt: newSalt } = await this.hashPin(newPin);
    user.pinHash = `${newHash}:${newSalt}`;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return { ok: true };
  }

  // Clears game progress data (telemetry, activities, coins) for a fresh
  // start. Settings, reminders, profile and accounts are left untouched.
  public resetGameProgress(): void {
    localStorage.removeItem(STORAGE_KEYS.TELEMETRY);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.COINS);
  }
}

export const db = new LocalDatabase();
