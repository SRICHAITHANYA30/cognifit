import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  User,
  Globe,
  Palette,
  Volume2,
  BellRing,
  Brain,
  Trophy,
  ShieldCheck,
  Eye,
  KeyRound,
  HeartHandshake,
  Info,
  LogOut,
  Download,
  Trash2,
  RefreshCw,
  Check,
  X,
  Mic,
  Sun,
  Moon,
  Sparkles,
  Trees,
  Waves,
} from 'lucide-react';
import type {
  AuthSession,
  DisplaySettings,
  FontScale,
  GameType,
  Language,
  ThemeMode,
  UserPreferences,
} from '../../types';
import { translations } from '../../locales/translations';
import { LANGUAGES } from '../../locales/languages';
import { DEFAULT_USER_PREFERENCES, db } from '../../services/db';
import { adaptiveEngine } from '../../services/adaptiveEngine';
import { audioEngine } from '../../services/audioEngine';
import { speak } from '../../services/tts';
import { generateClinicalPdfReport } from '../../services/pdfReport';
import { PatientAvatar } from '../common/PatientAvatar';
import { version as appVersion } from '../../../package.json';

interface SettingsPageProps {
  language: Language;
  settings: DisplaySettings;
  onUpdateSettings: (settings: DisplaySettings) => void;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (view: 'kiosk' | 'reminders' | 'caregiver' | 'avatar_setup') => void;
  onBack: () => void;
  onLogout: () => void;
  authSession: AuthSession | null;
  onProfileNameChanged: (name: string) => void;
}

type ConfirmKind = 'resetAdaptive' | 'resetProgress' | 'clearData' | 'logout';

const GAME_ORDER: GameType[] = [
  'smriti_rong',
  'memory_matrix',
  'taal_xur',
  'muga_motif',
  'word_scramble',
  'math_maze',
  'bamboo_basket',
  'music_match',
  'what_changed',
  'number_mismatch',
];

// ---------- small building blocks (same glass language as the app) ----------

function Section(props: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="settings-section" aria-label={props.title}>
      <div className="settings-section-head">
        <div className="settings-section-icon" aria-hidden="true">{props.icon}</div>
        <h2 className="settings-section-title">{props.title}</h2>
      </div>
      <p className="settings-section-desc">{props.desc}</p>
      <div className="settings-section-body">{props.children}</div>
    </section>
  );
}

function ToggleRow(props: { label: string; desc?: string; checked: boolean; onChange: () => void }) {
  const inputId = React.useId();
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <label className="settings-row-label" htmlFor={inputId}>{props.label}</label>
        {props.desc && <p className="settings-row-desc">{props.desc}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className={`settings-state-pill ${props.checked ? 'on' : 'off'}`} aria-hidden="true">
          {props.checked ? '✓' : '○'}
        </span>
        <label className="settings-toggle">
          <input
            id={inputId}
            type="checkbox"
            checked={props.checked}
            onChange={props.onChange}
            aria-label={props.label}
          />
          <span className="settings-toggle-track" aria-hidden="true">
            <span className="settings-toggle-knob" />
          </span>
        </label>
      </div>
    </div>
  );
}

function InfoRow(props: { label: string; value: string }) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <span className="settings-row-label">{props.label}</span>
      </div>
      <span className="settings-row-value">{props.value}</span>
    </div>
  );
}

function ConfirmModal(props: {
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="pin-modal-overlay" role="alertdialog" aria-modal="true" aria-label={props.title}>
      <div className="pin-modal-box" style={{ maxWidth: '480px', textAlign: 'left' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '10px' }}>
          {props.title}
        </h3>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '22px', lineHeight: 1.55 }}>
          {props.body}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="btn-game-play"
            style={{
              flex: 1,
              minHeight: '52px',
              fontSize: '16px',
              background: props.danger ? '#dc2626' : undefined,
            }}
            onClick={props.onConfirm}
          >
            <span>{props.confirmLabel}</span>
          </button>
          <button
            type="button"
            className="btn-back-kiosk"
            style={{ minHeight: '52px' }}
            onClick={props.onCancel}
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------ settings page ------------------------------

export const SettingsPage: React.FC<SettingsPageProps> = ({
  language,
  settings,
  onUpdateSettings,
  onLanguageChange,
  onNavigate,
  onBack,
  onLogout,
  authSession,
  onProfileNameChanged,
}) => {
  const t = translations[language] || translations['en'];
  const userId = authSession?.userId ?? '';
  const isPatient = authSession?.role === 'patient';

  // Extended prefs (extras live here; theme/font/language/sound/high-contrast
  // always follow the live `settings` prop from App).
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    try {
      return userId ? db.getUserPreferences(userId) : { ...DEFAULT_USER_PREFERENCES };
    } catch {
      return { ...DEFAULT_USER_PREFERENCES };
    }
  });
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | null>(null);
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);
  const [profileName, setProfileName] = useState<string>(() => {
    try {
      if (!authSession) {
        return '';
      }
      return db.getUserById(authSession.userId)?.name ?? authSession.name;
    } catch {
      return authSession?.name ?? '';
    }
  });
  const [pinCurrent, setPinCurrent] = useState('');
  const [pinNew, setPinNew] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinMsg, setPinMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pinBusy, setPinBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (noticeTimer.current !== null) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, []);

  const flashNotice = (message: string) => {
    setNotice(message);
    if (noticeTimer.current !== null) {
      window.clearTimeout(noticeTimer.current);
    }
    noticeTimer.current = window.setTimeout(() => setNotice(null), 2600);
  };

  // Live progress summaries, re-read from the offline store on every render
  // (reset handlers below already re-render via notice/confirm state).
  const summaries = (() => {
    try {
      const coins = db.getCoinSummary();
      const activities = db.getActivities();
      return {
        coinsTotal: coins.total,
        coinsToday: coins.today,
        completed: activities.filter(a => a.completedSuccessfully).length,
        reminders: db.getReminders().length,
        sessions: activities.length,
        coinRecords: db.getCoinEntries().length,
        sync: db.getSyncStatus(),
        telemetry: db.getTelemetry(),
      };
    } catch {
      return {
        coinsTotal: 0,
        coinsToday: 0,
        completed: 0,
        reminders: 0,
        sessions: 0,
        coinRecords: 0,
        sync: null,
        telemetry: [],
      };
    }
  })();

  const readProfile = () => {
    try {
      return db.getPatientProfile();
    } catch {
      return null;
    }
  };
  const profile = readProfile();

  const readAvatar = () => {
    try {
      return userId ? db.getAvatar(userId) : null;
    } catch {
      return null;
    }
  };
  const avatarConfig = readAvatar();

  const voiceCfg = (() => {
    try {
      return {
        tts: audioEngine.getTextToSpeechLang(),
        stt: audioEngine.getSpeechRecognitionLang(),
      };
    } catch {
      return { tts: 'en-IN', stt: 'en-IN' };
    }
  })();

  // ---- write-through helpers (live device settings + per-user snapshot) ----

  const persistExtras = (patch: Partial<UserPreferences>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    if (userId) {
      db.saveUserPreferences(userId, {
        ...next,
        theme: settings.theme,
        fontScale: settings.fontScale,
        highContrast: settings.highContrast,
        soundEnabled: settings.soundEnabled,
        language: settings.language,
      });
    }
    flashNotice(t.savedMessage);
  };

  const updateDevice = (patch: Partial<DisplaySettings>) => {
    const next = { ...settings, ...patch };
    onUpdateSettings(next);
    if (userId) {
      db.saveUserPreferences(userId, { ...prefs, ...next });
    }
    flashNotice(t.savedMessage);
  };

  const changeLanguage = (lang: Language) => {
    onLanguageChange(lang);
    if (userId) {
      db.saveUserPreferences(userId, { ...prefs, language: lang });
    }
    flashNotice(t.savedMessage);
  };

  // ---- section actions (all hit real systems) ----

  const saveProfileName = () => {
    if (!authSession || !profileName.trim()) {
      return;
    }
    const updated = db.updateUserName(authSession.userId, profileName);
    if (updated) {
      db.updateSessionName(updated.name);
      onProfileNameChanged(updated.name);
      flashNotice(t.savedMessage);
      audioEngine.playSuccessChime();
    }
  };

  const testVoice = () => {
    speak(t.testVoiceSample, language);
  };

  const toggleAdaptive = () => {
    const next = !prefs.adaptiveDifficultyEnabled;
    adaptiveEngine.setAdaptiveEnabled(next);
    persistExtras({ adaptiveDifficultyEnabled: next });
  };

  const resetAdaptive = () => {
    adaptiveEngine.resetAdaptiveState();
    setConfirm(null);
    flashNotice(t.savedMessage);
    audioEngine.playSuccessChime();
  };

  const resetProgress = () => {
    db.resetGameProgress();
    adaptiveEngine.resetAdaptiveState();
    setConfirm(null);
    flashNotice(t.savedMessage);
    audioEngine.playSuccessChime();
  };

  const exportJson = () => {
    try {
      const dump: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('brainactiver_')) {
          const raw = localStorage.getItem(key);
          try {
            dump[key] = raw ? JSON.parse(raw) : null;
          } catch {
            dump[key] = raw;
          }
        }
      }
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `brainactiver-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      flashNotice(t.savedMessage);
    } catch {
      // Download is best-effort; data itself stays safe in localStorage.
    }
  };

  const exportPdf = () => {
    try {
      const past7Days = db.getPast7DaysCsi();
      const prof = db.getPatientProfile();
      generateClinicalPdfReport(prof, past7Days, summaries.telemetry);
      audioEngine.playSuccessChime();
    } catch {
      // Report generation is best-effort.
    }
  };

  const eraseAllData = () => {
    try {
      const doomed: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('brainactiver_')) {
          doomed.push(key);
        }
      }
      doomed.forEach(key => localStorage.removeItem(key));
    } catch {
      // Reload proceeds regardless; a fresh boot re-seeds defaults.
    }
    window.location.reload();
  };

  const submitPinChange = async () => {
    if (!authSession || pinBusy) {
      return;
    }
    if (!/^\d{4,8}$/.test(pinNew)) {
      setPinMsg({ ok: false, text: t.pinInvalidMsg });
      return;
    }
    if (pinNew !== pinConfirm) {
      setPinMsg({ ok: false, text: t.pinMismatchMsg });
      return;
    }
    setPinBusy(true);
    try {
      const result = await db.changeUserPin(authSession.userId, pinCurrent, pinNew);
      if (result.ok) {
        setPinMsg({ ok: true, text: t.pinChangedMsg });
        setPinCurrent('');
        setPinNew('');
        setPinConfirm('');
        audioEngine.playSuccessChime();
      } else {
        setPinMsg({ ok: false, text: t.pinErrorMsg });
      }
    } catch {
      setPinMsg({ ok: false, text: t.pinErrorMsg });
    } finally {
      setPinBusy(false);
    }
  };

  // ---- option lists ----

  const themeOptions: { id: ThemeMode; label: string; icon: React.ReactNode; bg: string }[] = [
    { id: 'light', label: t.themeLight, icon: <Sun size={20} />, bg: '#ffffff' },
    { id: 'dark', label: t.themeDark, icon: <Moon size={20} />, bg: '#0f172a' },
    { id: 'comfort', label: t.themeComfort, icon: <Sparkles size={20} />, bg: '#fef3c7' },
    { id: 'forest', label: t.themeForest, icon: <Trees size={20} />, bg: '#064e3b' },
    { id: 'azure', label: t.themeAzure, icon: <Waves size={20} />, bg: '#0369a1' },
  ];

  const fontOptions: { id: FontScale; label: string }[] = [
    { id: 'small', label: t.fontSizeSmall },
    { id: 'normal', label: t.fontSizeMedium },
    { id: 'large', label: t.fontSizeLarge },
    { id: 'xlarge', label: t.fontSizeXL },
  ];

  const levelBand = (level: number): string => {
    if (level <= 2) {
      return t.bandEasy;
    }
    if (level === 3) {
      return t.bandMedium;
    }
    return t.bandHard;
  };

  const gameLevels = GAME_ORDER.map(id => {
    const records = summaries.telemetry.filter(r => r.gameType === id);
    const level = records.length > 0 ? records[records.length - 1].difficultyLevel : 2;
    return { id, level };
  });

  const gameTitles: Record<GameType, string> = {
    smriti_rong: t.game1Title,
    memory_matrix: t.game2Title,
    taal_xur: t.game3Title,
    muga_motif: t.game4Title,
    word_scramble: t.game5Title,
    math_maze: t.game6Title,
    bamboo_basket: t.game7Title,
    music_match: t.game8Title,
    what_changed: t.game9Title,
    number_mismatch: t.game10Title,
  };

  const voiceNative = LANGUAGES.find(l => l.code === language)?.nativeName ?? language;

  return (
    <div className="settings-page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <button className="btn-back-kiosk" onClick={onBack} aria-label={t.settingsBackBtn}>
          <ArrowLeft size={22} />
          <span>{t.settingsBackBtn}</span>
        </button>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--primary-emerald)' }}>
            {t.settingsTitle}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {t.settingsSubtitle}
          </p>
        </div>
      </div>

      {notice && (
        <div className="settings-notice" role="status">
          <Check size={18} style={{ verticalAlign: '-3px', marginRight: '8px' }} aria-hidden="true" />
          {notice}
        </div>
      )}

      {/* 1. Profile */}
      <Section icon={<User size={26} />} title={t.profileSection} desc={t.profileDesc}>
        <div className="settings-row">
          <div className="settings-row-text">
            <span className="settings-row-label">{t.avatarLabel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PatientAvatar config={avatarConfig} size={52} />
            {isPatient && (
              <button
                type="button"
                className="btn-routine-action"
                style={{ minHeight: '48px', padding: '8px 16px' }}
                onClick={() => onNavigate('avatar_setup')}
              >
                <span>{t.editAvatarBtn}</span>
              </button>
            )}
          </div>
        </div>
        <div style={{ padding: '14px 0', borderTop: '1px solid var(--border-subtle)' }}>
          <label htmlFor="settings-profile-name" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
            {t.nameLabel}
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              id="settings-profile-name"
              type="text"
              className="settings-input"
              style={{ flex: 1, minWidth: '200px' }}
              value={profileName}
              onChange={e => setProfileName(e.target.value)}
              maxLength={60}
              autoComplete="name"
            />
            <button
              type="button"
              className="btn-game-play btn-play-emerald"
              style={{ minHeight: '52px', width: 'auto', padding: '12px 26px', fontSize: '1rem' }}
              onClick={saveProfileName}
            >
              <Check size={20} />
              <span>{t.savePreferences}</span>
            </button>
          </div>
        </div>
        <InfoRow label={t.roleLabel} value={authSession?.role === 'caregiver' ? t.caregiverRole : t.patientRole} />
        <InfoRow label={t.phoneLabel} value={authSession?.phoneNumber ?? '—'} />
      </Section>

      {/* 2. Language & Region */}
      <Section icon={<Globe size={26} />} title={t.languageSection} desc={t.languageDesc}>
        <div className="settings-row">
          <div className="settings-row-text">
            <label className="settings-row-label" htmlFor="settings-language">{t.appLanguageLabel}</label>
          </div>
          <select
            id="settings-language"
            className="settings-select"
            value={language}
            onChange={e => changeLanguage(e.target.value as Language)}
          >
            {LANGUAGES.map(opt => (
              <option key={opt.code} value={opt.code}>
                {opt.nativeName} ({opt.name})
              </option>
            ))}
          </select>
        </div>
        <InfoRow label={t.voiceLanguageLabel} value={`${voiceNative} (${voiceCfg.tts} • ${voiceCfg.stt})`} />
      </Section>

      {/* 3. Appearance */}
      <Section icon={<Palette size={26} />} title={t.appearanceSection} desc={t.appearanceDesc}>
        <div style={{ marginBottom: '18px' }}>
          <div className="settings-row-label" style={{ marginBottom: '10px' }}>{t.themeTitle}</div>
          <div className="settings-option-grid">
            {themeOptions.map(opt => (
              <button
                key={opt.id}
                type="button"
                className={`settings-option-btn ${settings.theme === opt.id ? 'active' : ''}`}
                onClick={() => updateDevice({ theme: opt.id })}
                aria-pressed={settings.theme === opt.id}
              >
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: opt.bg, border: '1px solid #94a3b8', display: 'inline-block' }} aria-hidden="true" />
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="settings-row-label" style={{ marginBottom: '10px' }}>{t.fontSizeLabel}</div>
          <div className="settings-option-grid">
            {fontOptions.map(opt => (
              <button
                key={opt.id}
                type="button"
                className={`settings-option-btn ${settings.fontScale === opt.id ? 'active' : ''}`}
                onClick={() => updateDevice({ fontScale: opt.id })}
                aria-pressed={settings.fontScale === opt.id}
              >
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* 4. Voice & Audio */}
      <Section icon={<Volume2 size={26} />} title={t.voiceSection} desc={t.voiceDesc}>
        <ToggleRow
          label={t.soundLabel}
          desc={t.soundDesc}
          checked={settings.soundEnabled}
          onChange={() => updateDevice({ soundEnabled: !settings.soundEnabled })}
        />
        <ToggleRow
          label={t.voiceAssistantLabel}
          checked={prefs.voiceAssistantEnabled}
          onChange={() => persistExtras({ voiceAssistantEnabled: !prefs.voiceAssistantEnabled })}
        />
        <ToggleRow
          label={t.voiceCommandsLabel}
          checked={prefs.voiceCommandsEnabled}
          onChange={() => persistExtras({ voiceCommandsEnabled: !prefs.voiceCommandsEnabled })}
        />
        <ToggleRow
          label={t.reminderVoiceLabel}
          checked={prefs.reminderVoiceEnabled}
          onChange={() => persistExtras({ reminderVoiceEnabled: !prefs.reminderVoiceEnabled })}
        />
        <div className="settings-row">
          <div className="settings-row-text">
            <span className="settings-row-label">{t.testVoiceBtn}</span>
          </div>
          <button
            type="button"
            className="btn-routine-action"
            style={{ minHeight: '52px', padding: '10px 22px' }}
            onClick={testVoice}
          >
            <Mic size={20} />
            <span>{t.testVoiceBtn}</span>
          </button>
        </div>
      </Section>

      {/* 5. Notifications & Reminders */}
      <Section icon={<BellRing size={26} />} title={t.notifSection} desc={t.notifDesc}>
        <ToggleRow
          label={t.notificationsLabel}
          desc={t.notificationsDesc}
          checked={prefs.notificationsEnabled}
          onChange={() => persistExtras({ notificationsEnabled: !prefs.notificationsEnabled })}
        />
        <ToggleRow
          label={t.reminderAlarmsLabel}
          desc={t.reminderAlarmsDesc}
          checked={prefs.reminderAlarmsEnabled}
          onChange={() => persistExtras({ reminderAlarmsEnabled: !prefs.reminderAlarmsEnabled })}
        />
        <ToggleRow
          label={t.reminderVoiceLabel}
          checked={prefs.reminderVoiceEnabled}
          onChange={() => persistExtras({ reminderVoiceEnabled: !prefs.reminderVoiceEnabled })}
        />
        <div className="settings-row">
          <div className="settings-row-text">
            <span className="settings-row-label">{t.manageRemindersBtn}</span>
          </div>
          <button
            type="button"
            className="btn-routine-action"
            style={{ minHeight: '52px', padding: '10px 22px' }}
            onClick={() => onNavigate('reminders')}
          >
            <BellRing size={20} />
            <span>{t.manageRemindersBtn}</span>
          </button>
        </div>
      </Section>

      {/* 6. Cognitive Games */}
      <Section icon={<Brain size={26} />} title={t.gamesSection} desc={t.gamesDesc}>
        <ToggleRow
          label={t.adaptiveLabel}
          desc={t.adaptiveDesc}
          checked={prefs.adaptiveDifficultyEnabled}
          onChange={toggleAdaptive}
        />
        <div className="settings-row" style={{ display: 'block' }}>
          <div className="settings-row-label" style={{ marginBottom: '10px' }}>{t.currentLevelsLabel}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {gameLevels.map(g => (
              <div
                key={g.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'var(--bg-parchment)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {gameTitles[g.id]}
                </span>
                <span className="settings-state-pill on">
                  {levelBand(g.level)} · {g.level}/5
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <span className="settings-row-label">{t.resetAdaptiveBtn}</span>
          </div>
          <button
            type="button"
            className="btn-routine-action"
            style={{ minHeight: '52px', padding: '10px 22px' }}
            onClick={() => setConfirm('resetAdaptive')}
          >
            <RefreshCw size={20} />
            <span>{t.resetAdaptiveBtn}</span>
          </button>
        </div>
      </Section>

      {/* 7. Rewards & Progress */}
      <Section icon={<Trophy size={26} />} title={t.rewardsSection} desc={t.rewardsDesc}>
        <InfoRow label={t.totalCoinsLabel} value={`🪙 ${summaries.coinsTotal}`} />
        <InfoRow label={t.todayCoinsLabel} value={`🪙 ${summaries.coinsToday}`} />
        <InfoRow label={t.completedActivitiesLabel} value={`${summaries.completed}`} />
        <div className="settings-row">
          <div className="settings-row-text">
            <span className="settings-row-label">{t.resetProgressBtn}</span>
          </div>
          <button
            type="button"
            className="settings-danger-btn"
            style={{ width: 'auto', padding: '10px 22px' }}
            onClick={() => setConfirm('resetProgress')}
          >
            <Trash2 size={20} />
            <span>{t.resetProgressBtn}</span>
          </button>
        </div>
      </Section>

      {/* 8. Privacy & Data */}
      <Section icon={<ShieldCheck size={26} />} title={t.privacySection} desc={t.privacyDesc}>
        <InfoRow label={t.offlineStatusLabel} value={t.offlineOnValue} />
        <div className="settings-row" style={{ display: 'block' }}>
          <div className="settings-row-label" style={{ marginBottom: '10px' }}>{t.storedDataLabel}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <InfoRow label={t.dataRemindersLabel} value={`${summaries.reminders}`} />
            <InfoRow label={t.dataSessionsLabel} value={`${summaries.sessions}`} />
            <InfoRow label={t.dataCoinsLabel} value={`${summaries.coinRecords}`} />
          </div>
        </div>
        <InfoRow
          label={t.syncStatusLabel}
          value={summaries.sync ? `${summaries.sync.pendingRecordsCount} queued` : '—'}
        />
        <div className="settings-row">
          <div className="settings-row-text">
            <span className="settings-row-label">{t.exportJsonBtn}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-routine-action"
              style={{ minHeight: '52px', padding: '10px 18px' }}
              onClick={exportJson}
            >
              <Download size={20} />
              <span>{t.exportJsonBtn}</span>
            </button>
            <button
              type="button"
              className="btn-routine-action"
              style={{ minHeight: '52px', padding: '10px 18px' }}
              onClick={exportPdf}
            >
              <Download size={20} />
              <span>{t.downloadPdfReport}</span>
            </button>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <span className="settings-row-label">{t.clearDataBtn}</span>
          </div>
          <button
            type="button"
            className="settings-danger-btn"
            style={{ width: 'auto', padding: '10px 22px' }}
            onClick={() => setConfirm('clearData')}
          >
            <Trash2 size={20} />
            <span>{t.clearDataBtn}</span>
          </button>
        </div>
      </Section>

      {/* 9. Accessibility */}
      <Section icon={<Eye size={26} />} title={t.accessSection} desc={t.accessDesc}>
        <div style={{ marginBottom: '6px' }}>
          <div className="settings-row-label" style={{ marginBottom: '10px' }}>{t.fontSizeLabel}</div>
          <div className="settings-option-grid">
            {fontOptions.map(opt => (
              <button
                key={opt.id}
                type="button"
                className={`settings-option-btn ${settings.fontScale === opt.id ? 'active' : ''}`}
                onClick={() => updateDevice({ fontScale: opt.id })}
                aria-pressed={settings.fontScale === opt.id}
              >
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
        <ToggleRow
          label={t.highContrastLabel}
          checked={settings.highContrast}
          onChange={() => updateDevice({ highContrast: !settings.highContrast })}
        />
        <ToggleRow
          label={t.reducedMotionLabel}
          checked={prefs.reducedMotion}
          onChange={() => persistExtras({ reducedMotion: !prefs.reducedMotion })}
        />
        <ToggleRow
          label={t.largeTargetsLabel}
          checked={prefs.largerTouchTargets}
          onChange={() => persistExtras({ largerTouchTargets: !prefs.largerTouchTargets })}
        />
      </Section>

      {/* 10. Security */}
      <Section icon={<KeyRound size={26} />} title={t.securitySection} desc={t.securityDesc}>
        <div style={{ padding: '6px 0 4px' }}>
          <div className="settings-row-label" style={{ marginBottom: '10px' }}>{t.changePinLabel}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '420px' }}>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              className="settings-input"
              placeholder={t.currentPinLabel}
              aria-label={t.currentPinLabel}
              value={pinCurrent}
              onChange={e => setPinCurrent(e.target.value.replace(/\D/g, '').slice(0, 8))}
              maxLength={8}
            />
            <input
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              className="settings-input"
              placeholder={t.newPinLabel}
              aria-label={t.newPinLabel}
              value={pinNew}
              onChange={e => setPinNew(e.target.value.replace(/\D/g, '').slice(0, 8))}
              maxLength={8}
            />
            <input
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              className="settings-input"
              placeholder={t.confirmPinLabel}
              aria-label={t.confirmPinLabel}
              value={pinConfirm}
              onChange={e => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 8))}
              maxLength={8}
            />
            <button
              type="button"
              className="btn-game-play btn-play-emerald"
              style={{ minHeight: '52px', fontSize: '1rem' }}
              onClick={() => void submitPinChange()}
              disabled={pinBusy}
            >
              <KeyRound size={20} />
              <span>{pinBusy ? '…' : t.changePinBtn}</span>
            </button>
            {pinMsg && (
              <p
                role="status"
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: pinMsg.ok ? 'var(--primary-emerald)' : '#dc2626',
                }}
              >
                {pinMsg.text}
              </p>
            )}
          </div>
        </div>
        <InfoRow label={t.sessionLabel} value={authSession ? `${authSession.name} (${authSession.phoneNumber})` : '—'} />
        <InfoRow
          label={t.loginTimeLabel}
          value={authSession ? new Date(authSession.loggedInAt).toLocaleString() : '—'}
        />
        <InfoRow
          label={t.expiryLabel}
          value={authSession ? new Date(authSession.expiresAt).toLocaleString() : '—'}
        />
      </Section>

      {/* 11. Caregiver (patients only) */}
      {isPatient && (
        <Section icon={<HeartHandshake size={26} />} title={t.caregiverSection} desc={t.caregiverDesc}>
          <InfoRow label={t.caregiverContactLabel} value={profile?.caregiverContact ?? '—'} />
          <InfoRow label={t.ashaLabel} value={profile?.ashaWorkerName ?? '—'} />
          <InfoRow label={t.sharingStatusLabel} value={t.sharingOnValue} />
          <div className="settings-row">
            <div className="settings-row-text">
              <span className="settings-row-label">{t.openCaregiverBtn}</span>
            </div>
            <button
              type="button"
              className="btn-routine-action"
              style={{ minHeight: '52px', padding: '10px 22px' }}
              onClick={() => onNavigate('caregiver')}
            >
              <HeartHandshake size={20} />
              <span>{t.openCaregiverBtn}</span>
            </button>
          </div>
        </Section>
      )}

      {/* 12. About */}
      <Section icon={<Info size={26} />} title={t.aboutSection} desc={t.aboutText}>
        <InfoRow label={t.appName} value={t.appSubtitle} />
        <InfoRow label={t.versionLabel} value={appVersion} />
        <InfoRow label={t.techLabel} value="React • TypeScript • Web Audio • Local on-device storage" />
        <InfoRow label={t.offlineStatusLabel} value={t.offlineOnValue} />
      </Section>

      {/* 13. Logout */}
      <section className="settings-section" aria-label={t.logoutBtn}>
        <button
          type="button"
          className="settings-danger-btn"
          onClick={() => setConfirm('logout')}
        >
          <LogOut size={22} />
          <span>{t.logoutBtn}</span>
        </button>
      </section>

      {/* Confirmations for destructive / sensitive actions */}
      {confirm === 'resetAdaptive' && (
        <ConfirmModal
          title={t.resetAdaptiveBtn}
          body={t.resetAdaptiveConfirm}
          confirmLabel={t.confirmBtn}
          onConfirm={resetAdaptive}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm === 'resetProgress' && (
        <ConfirmModal
          title={t.resetProgressBtn}
          body={t.resetProgressConfirm}
          confirmLabel={t.confirmBtn}
          danger
          onConfirm={resetProgress}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm === 'clearData' && (
        <ConfirmModal
          title={t.clearDataTitle}
          body={t.clearDataDesc}
          confirmLabel={t.clearDataConfirm}
          danger
          onConfirm={eraseAllData}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm === 'logout' && (
        <ConfirmModal
          title={t.logoutTitle}
          body={t.logoutDesc}
          confirmLabel={t.logoutConfirmBtn}
          onConfirm={onLogout}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
};
