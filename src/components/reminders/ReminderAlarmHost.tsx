import React, { useEffect, useRef, useState } from 'react';
import { BellRing, Check } from 'lucide-react';
import type { Language, ReminderEvent } from '../../types';
import { translations } from '../../locales/translations';
import { REMINDER_EVENTS_STORAGE_KEY, REMINDERS_CHANGED_EVENT, db } from '../../services/db';
import { audioEngine } from '../../services/audioEngine';
import {
  acknowledgeReminderOccurrence,
  getActiveDueOccurrences,
  requestSchedulerCheckNow,
  startReminderScheduler,
} from '../../services/reminderScheduler';

interface Props {
  language: Language;
}

// Audible + visible side effects for one newly-DUE occurrence, using only the
// existing systems: the alarm ringtone, the TTS voice prompter (with the
// reminder's own title), and a local browser Notification (works offline).
// Honors the Settings switches: master "Notifications" suppresses everything
// here (the DUE record still ages into MISSED for the caregiver), and
// "Reminder voice" suppresses only the spoken title.
function fireAlarmSideEffects(event: ReminderEvent, language: Language): void {
  let notificationsOn = true;
  let reminderVoiceOn = true;
  try {
    const prefs = db.getActivePreferences();
    notificationsOn = prefs.notificationsEnabled;
    reminderVoiceOn = prefs.reminderVoiceEnabled;
  } catch {
    // Fail open: broken prefs must never silence existing alarms.
  }
  if (!notificationsOn) {
    console.log(`[ReminderScheduler] Notification suppressed by settings for "${event.title}".`);
    return;
  }

  try {
    audioEngine.startAlarmRingtone(30);
  } catch {
    // Audio is best-effort; the visual alarm banner always renders.
  }

  if (event.voiceAlarm && reminderVoiceOn) {
    console.log(`[ReminderScheduler] Triggering TTS: "${event.title}".`);
    try {
      audioEngine.speakPrompt(event.title, language);
    } catch {
      // TTS is best-effort; the ringtone and banner already fired.
    }
  } else {
    console.log(`[ReminderScheduler] TTS skipped (voice alarm disabled for "${event.title}").`);
  }

  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      console.log(`[ReminderScheduler] Triggering notification: "${event.title}".`);
      new Notification(event.title, {
        body: event.note || event.title,
        tag: event.occurrenceKey,
      });
    }
  } catch {
    // Browser notifications are optional; the in-app alarm banner always works.
  }
}

// App-level host: mounts the exact-time scheduler once the user is
// authenticated and renders the existing alarm banner UI for every DUE
// occurrence (most urgent first). Unmounting stops the scheduler interval.
export const ReminderAlarmHost: React.FC<Props> = ({ language }) => {
  const t = translations[language] || translations['en'];
  // True unless the user disabled master notifications in Settings (then DUE
  // occurrences are recorded silently and surface only as MISSED).
  const notificationsAllowed = (): boolean => {
    try {
      return db.getActivePreferences().notificationsEnabled;
    } catch {
      return true;
    }
  };

  // Seed from the offline ledger so alarms already DUE (e.g. app opened
  // late) render immediately — same lazy-load pattern as ReminderManager.
  const [dueQueue, setDueQueue] = useState<ReminderEvent[]>(() => {
    try {
      return notificationsAllowed() ? getActiveDueOccurrences() : [];
    } catch {
      return [];
    }
  });
  const alarmedKeys = useRef<Set<string>>(new Set());
  const langRef = useRef<Language>(language);
  // Tracks a denied browser-notification permission so the user gets a clear,
  // dismissible hint (sound + voice + in-app banner keep working regardless).
  const [notifDenied, setNotifDenied] = useState<boolean>(() => {
    try {
      return 'Notification' in window && Notification.permission === 'denied';
    } catch {
      return false;
    }
  });
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  useEffect(() => {
    langRef.current = language;
  }, [language]);

  useEffect(() => {
    const refreshPermission = () => {
      try {
        setNotifDenied('Notification' in window && Notification.permission === 'denied');
      } catch {
        // Permission state is best-effort.
      }
    };
    refreshPermission();
    window.addEventListener('focus', refreshPermission);
    document.addEventListener('visibilitychange', refreshPermission);
    return () => {
      window.removeEventListener('focus', refreshPermission);
      document.removeEventListener('visibilitychange', refreshPermission);
    };
  }, []);

  const active = dueQueue.length > 0 ? dueQueue[0] : null;

  useEffect(() => {
    // Browser notification permission is requested once; everything else
    // degrades gracefully when it is unavailable or denied.
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        const result = Notification.requestPermission() as unknown;
        if (result && typeof (result as Promise<unknown>).catch === 'function') {
          (result as Promise<unknown>).catch(() => undefined);
        }
      }
    } catch {
      // Notifications are optional; the in-app alarm banner always works.
    }

    const refreshQueue = () => {
      const due = notificationsAllowed() ? getActiveDueOccurrences() : [];
      const dueKeys = new Set(due.map(e => e.occurrenceKey));
      alarmedKeys.current.forEach(key => {
        if (!dueKeys.has(key)) {
          alarmedKeys.current.delete(key);
        }
      });
      setDueQueue(due);
    };

    // Ring for the first seeded DUE alarm (if any); the rest of the queue
    // stays silent until promoted by acknowledgement.
    const seeded = getActiveDueOccurrences();
    if (seeded.length > 0) {
      seeded.forEach(e => alarmedKeys.current.add(e.occurrenceKey));
      fireAlarmSideEffects(seeded[0], langRef.current);
    }

    const stopScheduler = startReminderScheduler({
      onDue: (event) => {
        if (!notificationsAllowed()) {
          console.log(`[ReminderScheduler] Banner suppressed by settings for "${event.title}".`);
          return;
        }
        setDueQueue(prev =>
          prev.some(e => e.occurrenceKey === event.occurrenceKey) ? prev : [...prev, event],
        );
        if (!alarmedKeys.current.has(event.occurrenceKey)) {
          alarmedKeys.current.add(event.occurrenceKey);
          fireAlarmSideEffects(event, langRef.current);
        }
      },
      onEventsChanged: () => {
        refreshQueue();
      },
    });

    // Cross-tab refresh (same-tab updates arrive via onEventsChanged).
    const handleStorage = (e: StorageEvent) => {
      if (e.key === REMINDER_EVENTS_STORAGE_KEY) {
        refreshQueue();
      }
    };
    window.addEventListener('storage', handleStorage);

    // Active/Disabled toggles and edits re-check immediately (no waiting for
    // the next 5s tick).
    const handleRemindersChanged = () => {
      refreshQueue();
      requestSchedulerCheckNow();
    };
    window.addEventListener(REMINDERS_CHANGED_EVENT, handleRemindersChanged);

    return () => {
      stopScheduler();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(REMINDERS_CHANGED_EVENT, handleRemindersChanged);
      audioEngine.stopAlarmChime();
    };
  }, []);

  // Safety net: never leave the ringtone playing with no visible alarm
  // (e.g. the occurrence auto-transitioned to MISSED).
  useEffect(() => {
    if (dueQueue.length === 0) {
      audioEngine.stopAlarmChime();
    }
  }, [dueQueue.length]);

  const handleResolve = (action: 'acknowledged' | 'completed') => {
    if (!active) {
      return;
    }
    acknowledgeReminderOccurrence(active.occurrenceKey, action);
    audioEngine.stopAlarmChime();
    if (action === 'completed') {
      audioEngine.playSuccessChime();
    }
    alarmedKeys.current.delete(active.occurrenceKey);
    const remaining = dueQueue.filter(e => e.occurrenceKey !== active.occurrenceKey);
    setDueQueue(remaining);
    // Promote the next queued alarm with full sound + voice.
    const next = remaining[0];
    if (next && !alarmedKeys.current.has(next.occurrenceKey)) {
      alarmedKeys.current.add(next.occurrenceKey);
      fireAlarmSideEffects(next, langRef.current);
    }
  };

  const showDeniedNotice = notifDenied && !noticeDismissed && !active;

  if (showDeniedNotice) {
    return (
      <div style={{
        background: '#fffbeb',
        color: '#92400e',
        padding: '12px 20px',
        borderRadius: '16px',
        border: '2px solid #fcd34d',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        fontSize: '14px',
        fontWeight: 700,
      }}>
        <BellRing size={20} />
        <span style={{ flex: 1 }}>
          Browser notifications are blocked — alarms will still appear here with sound and voice.
          You can re-enable them in your browser site settings.
        </span>
        <button
          onClick={() => setNoticeDismissed(true)}
          aria-label="Dismiss notification notice"
          style={{ background: 'none', border: 'none', color: '#92400e', cursor: 'pointer', fontSize: '18px', fontWeight: 900 }}
        >
          ×
        </button>
      </div>
    );
  }

  if (!active) {
    return null;
  }

  return (
    <div style={{
      background: '#dc2626',
      color: 'white',
      padding: '24px 32px',
      borderRadius: '24px',
      boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px',
      animation: 'pulse-ring 1.5s infinite',
      marginBottom: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div style={{ background: 'white', color: '#dc2626', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BellRing size={32} />
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {t.alarmActiveBanner}
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: 900 }}>{active.title}</h3>
          <p style={{ fontSize: '15px', opacity: 0.95 }}>{active.note}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleResolve('completed')}
          style={{
            background: '#065f46',
            color: 'white',
            border: '2px solid white',
            padding: '12px 22px',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={20} />
          <span>{t.markCompleted}</span>
        </button>
        <button
          onClick={() => handleResolve('acknowledged')}
          style={{
            background: 'white',
            color: '#991b1b',
            border: 'none',
            padding: '12px 22px',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {t.dismissAlarm}
        </button>
      </div>
    </div>
  );
};
