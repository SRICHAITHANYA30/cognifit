import type { 
  DailyCsiScore, 
  DisplaySettings, 
  MemoryVaultItem, 
  PatientProfile, 
  ReminderItem, 
  RoutineReminder, 
  SyncStatus, 
  TelemetryRecord 
} from '../types';
import { adaptiveEngine } from './adaptiveEngine';

const STORAGE_KEYS = {
  PROFILE: 'brainactiver_profile_v2',
  VAULT: 'brainactiver_vault_v2',
  ROUTINES: 'brainactiver_routines_v2',
  REMINDERS: 'brainactiver_reminders_v2',
  SETTINGS: 'brainactiver_settings_v2',
  TELEMETRY: 'brainactiver_telemetry_v2',
  SYNC_STATUS: 'brainactiver_sync_status_v2',
};

const DEFAULT_SETTINGS: DisplaySettings = {
  theme: 'light',
  fontScale: 'large', // Large by default for elderly accessibility
  highContrast: false,
  soundEnabled: true,
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
    return JSON.parse(data);
  }

  public updateSettings(settings: DisplaySettings): void {
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

  public addReminder(item: Omit<ReminderItem, 'id'>): ReminderItem {
    const reminders = this.getReminders();
    const newReminder: ReminderItem = {
      ...item,
      id: `rem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    reminders.push(newReminder);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    return newReminder;
  }

  public updateReminder(updatedItem: ReminderItem): void {
    const reminders = this.getReminders().map(r => 
      r.id === updatedItem.id ? updatedItem : r
    );
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }

  public toggleReminderEnabled(id: string): ReminderItem[] {
    const reminders = this.getReminders().map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    return reminders;
  }

  public deleteReminder(id: string): ReminderItem[] {
    const reminders = this.getReminders().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    return reminders;
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
}

export const db = new LocalDatabase();
