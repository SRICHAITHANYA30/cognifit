import type { ReminderEvent, ReminderItem } from '../types';
import { db } from './db';

// =====================================================================
// ReminderScheduler — exact-time, offline-first reminder engine.
// ---------------------------------------------------------------------
// - Reads reminders from the existing local db (localStorage, no network).
// - Ticks continuously while the app is open (no page refresh needed).
// - One occurrence = reminderId + scheduledDate + scheduledTime. Each
//   occurrence fires at most once (persisted ReminderEvent ledger).
// - Lifecycle per occurrence: PENDING (implicit) -> DUE -> ACKNOWLEDGED /
//   COMPLETED, or DUE -> MISSED after the acknowledgement grace period.
// - MISSED occurrences are persisted so the caregiver dashboard can read
//   them from the same offline store. No external SMS/email/push.
// =====================================================================

export const REMINDER_TICK_MS = 5000;
export const REMINDER_ACK_GRACE_MS = 5 * 60 * 1000;

const NEAR_DUE_LOG_WINDOW_MS = 3 * 60 * 1000;
const LOG_PREFIX = '[ReminderScheduler]';

export interface ReminderSchedulerCallbacks {
  onDue: (event: ReminderEvent, reminder: ReminderItem) => void;
  onEventsChanged: () => void;
}

export interface ReminderPatientIdentity {
  patientId: string;
  patientName: string;
  sessionUserId: string;
  profileId: string;
}

export type OccurrenceAction = 'pending' | 'settled' | 'fire-due' | 'mark-missed';

export interface OccurrenceEvaluation {
  applicable: boolean;
  action: OccurrenceAction;
  scheduledAt: Date | null;
  dateKey: string;
  occurrenceKey: string;
  reason: string;
}

// ------------------------- pure time helpers -------------------------

export function parseTimeToMinutes(time: string): { hours: number; minutes: number } | null {
  if (typeof time !== 'string') {
    return null;
  }
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(time.trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours > 23 || minutes > 59) {
    return null;
  }
  return { hours, minutes };
}

// "08:30" -> "08:30 AM", "12:00" -> "12:00 PM", "00:30" -> "12:30 AM", "23:30" -> "11:30 PM"
export function formatTime12h(time: string): string {
  const parsed = parseTimeToMinutes(time);
  if (!parsed) {
    return time;
  }
  const suffix = parsed.hours >= 12 ? 'PM' : 'AM';
  const hour12 = parsed.hours % 12 === 0 ? 12 : parsed.hours % 12;
  return `${String(hour12).padStart(2, '0')}:${String(parsed.minutes).padStart(2, '0')} ${suffix}`;
}

// Local (device) calendar date key: YYYY-MM-DD. Never UTC — midnight
// boundaries must follow the user's own timezone.
export function localDateKeyFromDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function occurrenceKeyFor(reminderId: string, dateKey: string, time: string): string {
  return `${reminderId}|${dateKey}|${time}`;
}

// Build the scheduled moment for `time` (HH:MM 24h) on the calendar day of
// `base`, in device local time. Because stored times come from
// <input type="time"> they are always unambiguous 24h values, so 12:00 AM /
// 12:00 PM / 23:30 are all handled without string guessing.
export function buildScheduledDate(time: string, base: Date): Date | null {
  const parsed = parseTimeToMinutes(time);
  if (!parsed) {
    return null;
  }
  const scheduled = new Date(base);
  scheduled.setHours(parsed.hours, parsed.minutes, 0, 0);
  return scheduled;
}

// Weekly reminders carry no stored weekday, so anchor them to the weekday the
// reminder was created (embedded in user-created ids as `rem-<epochMs>-xxxx`).
// Seed/legacy ids without a timestamp fall back to daily behaviour.
function weeklyAnchorWeekday(reminder: ReminderItem): number | null {
  const parts = reminder.id.split('-');
  if (parts.length >= 2) {
    const createdAt = Number(parts[1]);
    if (Number.isFinite(createdAt) && createdAt > 0) {
      return new Date(createdAt).getDay();
    }
  }
  return null;
}

export function isReminderActiveOnDate(reminder: ReminderItem, date: Date): boolean {
  switch (reminder.frequency) {
    case 'daily':
      return true;
    case 'weekdays': {
      const day = date.getDay();
      return day >= 1 && day <= 5;
    }
    case 'weekly': {
      const anchor = weeklyAnchorWeekday(reminder);
      if (anchor === null) {
        return true;
      }
      return date.getDay() === anchor;
    }
    case 'once':
    default:
      return true;
  }
}

// ------------------------- occurrence evaluation -------------------------

export function evaluateReminderOccurrence(
  reminder: ReminderItem,
  now: Date,
  events: ReminderEvent[],
): OccurrenceEvaluation {
  const dateKey = localDateKeyFromDate(now);
  const skip = (reason: string): OccurrenceEvaluation => ({
    applicable: false,
    action: 'settled',
    scheduledAt: null,
    dateKey,
    occurrenceKey: '',
    reason,
  });

  if (!reminder.enabled) {
    return skip('disabled');
  }
  if (reminder.frequency !== 'once' && !isReminderActiveOnDate(reminder, now)) {
    return skip(`frequency '${reminder.frequency}' is not active today`);
  }
  const scheduledAt = buildScheduledDate(reminder.time, now);
  if (!scheduledAt) {
    return skip(`unparseable time '${reminder.time}'`);
  }

  const occurrenceKey = occurrenceKeyFor(reminder.id, dateKey, reminder.time);
  const existing = events.find(e => e.occurrenceKey === occurrenceKey);
  if (reminder.frequency === 'once') {
    const firedBefore = events.some(
      e => e.reminderId === reminder.id && e.occurrenceKey !== occurrenceKey,
    );
    // Any prior record — DUE or terminal — means this once reminder already
    // fired. A stale DUE from another day is swept to MISSED by the engine,
    // while the same-day DUE below still transitions normally.
    if (firedBefore) {
      return skip('once reminder already fired');
    }
  }
  const elapsedMs = now.getTime() - scheduledAt.getTime();

  if (existing) {
    if (existing.status === 'DUE' && elapsedMs > REMINDER_ACK_GRACE_MS) {
      return {
        applicable: true,
        action: 'mark-missed',
        scheduledAt,
        dateKey,
        occurrenceKey,
        reason: 'grace period elapsed without acknowledgement',
      };
    }
    return {
      applicable: true,
      action: 'settled',
      scheduledAt,
      dateKey,
      occurrenceKey,
      reason: existing.status === 'DUE'
        ? 'already DUE, awaiting acknowledgement'
        : `already ${existing.status}`,
    };
  }

  if (elapsedMs < 0) {
    return {
      applicable: true,
      action: 'pending',
      scheduledAt,
      dateKey,
      occurrenceKey,
      reason: 'scheduled time is in the future',
    };
  }
  if (elapsedMs <= REMINDER_ACK_GRACE_MS) {
    return {
      applicable: true,
      action: 'fire-due',
      scheduledAt,
      dateKey,
      occurrenceKey,
      reason: 'scheduled time reached',
    };
  }
  return {
    applicable: true,
    action: 'mark-missed',
    scheduledAt,
    dateKey,
    occurrenceKey,
    reason: 'scheduled time passed beyond the grace period',
  };
}

export function resolvePatientIdentity(): ReminderPatientIdentity {
  try {
    const profile = db.getPatientProfile();
    let sessionUserId = '';
    try {
      sessionUserId = db.getSession()?.userId ?? '';
    } catch {
      sessionUserId = '';
    }
    return {
      patientId: profile?.id ?? sessionUserId ?? 'unknown-patient',
      patientName: profile?.name ?? 'Patient',
      sessionUserId,
      profileId: profile?.id ?? 'default-profile',
    };
  } catch {
    return {
      patientId: 'unknown-patient',
      patientName: 'Patient',
      sessionUserId: '',
      profileId: 'default-profile',
    };
  }
}

function buildEventSnapshot(
  reminder: ReminderItem,
  evaluation: OccurrenceEvaluation,
  identity: ReminderPatientIdentity,
  status: ReminderEvent['status'],
  nowMs: number,
): ReminderEvent {
  const scheduledAt = evaluation.scheduledAt as Date;
  const base: ReminderEvent = {
    occurrenceKey: evaluation.occurrenceKey,
    reminderId: reminder.id,
    patientId: identity.patientId,
    patientName: identity.patientName,
    sessionUserId: identity.sessionUserId,
    profileId: identity.profileId,
    title: reminder.title,
    note: reminder.note,
    category: reminder.category,
    scheduledDate: evaluation.dateKey,
    scheduledTime: reminder.time,
    scheduledTimestamp: scheduledAt.getTime(),
    voiceAlarm: reminder.voiceAlarm,
    status,
    triggeredAt: nowMs,
  };
  if (status === 'MISSED') {
    base.missedAt = nowMs;
  }
  return base;
}

function fireDueOccurrence(
  reminder: ReminderItem,
  evaluation: OccurrenceEvaluation,
  callbacks: ReminderSchedulerCallbacks,
): void {
  const identity = resolvePatientIdentity();
  const event = buildEventSnapshot(reminder, evaluation, identity, 'DUE', Date.now());
  // Final dedupe guard: another tab may have recorded this occurrence first.
  if (db.getReminderEvent(event.occurrenceKey)) {
    console.log(`${LOG_PREFIX} Skipping duplicate trigger for ${event.occurrenceKey} (already recorded).`);
    return;
  }
  db.saveReminderEvent(event);
  db.stampReminderTriggeredDate(reminder.id, evaluation.dateKey);
  console.log(
    `${LOG_PREFIX} Reminder due: "${reminder.title}" scheduled ${evaluation.dateKey} ` +
    `${reminder.time} (${formatTime12h(reminder.time)}).`,
  );
  console.log(`${LOG_PREFIX} Triggering alarm: "${reminder.title}".`);
  callbacks.onDue(event, reminder);
}

function safeGetEvent(occurrenceKey: string): ReminderEvent | null {
  try {
    return db.getReminderEvent(occurrenceKey);
  } catch {
    return null;
  }
}

function logMissedOccurrence(
  title: string,
  patientName: string,
  dateKey: string,
  time: string,
  missedAtMs: number,
): void {
  console.log(
    `${LOG_PREFIX} Reminder missed: "${title}" scheduled ${dateKey} ` +
    `${time} (${formatTime12h(time)}).`,
  );
  console.log(
    `${LOG_PREFIX} Caregiver notification created: patient "${patientName}", ` +
    `reminder "${title}", scheduled ${formatTime12h(time)}, status MISSED, ` +
    `date ${dateKey}, time missed ${new Date(missedAtMs).toLocaleTimeString()}.`,
  );
}

function markOccurrenceMissed(reminder: ReminderItem, evaluation: OccurrenceEvaluation): void {
  const nowMs = Date.now();
  const existing = safeGetEvent(evaluation.occurrenceKey);
  if (existing && existing.status !== 'DUE') {
    return; // Settled concurrently (acknowledged/completed elsewhere).
  }
  // The missed moment is always when the grace period lapsed
  // (scheduled + grace), never when the engine happened to notice — so the
  // caregiver feed stays truthful even for catch-up detections.
  const scheduledAt = evaluation.scheduledAt as Date;
  const missedAt = scheduledAt.getTime() + REMINDER_ACK_GRACE_MS;
  const identity = resolvePatientIdentity();
  if (existing) {
    db.updateReminderEventStatus(evaluation.occurrenceKey, 'MISSED', { missedAt });
    logMissedOccurrence(reminder.title, identity.patientName, evaluation.dateKey, reminder.time, missedAt);
  } else {
    // Catch-up path: the occurrence lapsed while the app was closed.
    const snapshot = buildEventSnapshot(reminder, evaluation, identity, 'MISSED', nowMs);
    snapshot.missedAt = missedAt;
    db.saveReminderEvent(snapshot);
    logMissedOccurrence(reminder.title, identity.patientName, evaluation.dateKey, reminder.time, missedAt);
  }
}

// Backstop for DUE records the per-reminder loop cannot see: occurrences from
// previous days, or reminders since disabled/deleted. Without this sweep a
// stale DUE would ring forever in the data layer.
function sweepStaleDueEvents(now: Date, events: ReminderEvent[]): boolean {
  let changed = false;
  for (const event of events) {
    if (event.status !== 'DUE') {
      continue;
    }
    if (now.getTime() - event.scheduledTimestamp <= REMINDER_ACK_GRACE_MS) {
      continue;
    }
    const fresh = safeGetEvent(event.occurrenceKey);
    if (!fresh || fresh.status !== 'DUE') {
      continue;
    }
    const missedAt = event.scheduledTimestamp + REMINDER_ACK_GRACE_MS;
    db.updateReminderEventStatus(event.occurrenceKey, 'MISSED', { missedAt });
    logMissedOccurrence(event.title, event.patientName, event.scheduledDate, event.scheduledTime, missedAt);
    changed = true;
  }
  return changed;
}

// ------------------------- throttled logging -------------------------

let lastHeartbeatMinuteKey = '';
const lastNearDueLogAt: Record<string, number> = {};

function logHeartbeat(now: Date, activeCount: number): void {
  const minuteKey =
    `${localDateKeyFromDate(now)} ${String(now.getHours()).padStart(2, '0')}:` +
    String(now.getMinutes()).padStart(2, '0');
  if (minuteKey === lastHeartbeatMinuteKey) {
    return;
  }
  lastHeartbeatMinuteKey = minuteKey;
  console.log(
    `${LOG_PREFIX} Current local time: ${now.toLocaleString()} — ${activeCount} active reminder(s).`,
  );
}

function logNearDueCheck(
  reminder: ReminderItem,
  evaluation: OccurrenceEvaluation,
  now: Date,
): void {
  if (!evaluation.scheduledAt) {
    return;
  }
  const diffMs = evaluation.scheduledAt.getTime() - now.getTime();
  if (diffMs < 0 || diffMs > NEAR_DUE_LOG_WINDOW_MS) {
    return;
  }
  const lastLogged = lastNearDueLogAt[reminder.id] ?? 0;
  if (now.getTime() - lastLogged < 60 * 1000) {
    return;
  }
  lastNearDueLogAt[reminder.id] = now.getTime();
  console.log(
    `${LOG_PREFIX} Checking reminder: "${reminder.title}" scheduled ` +
    `${evaluation.dateKey} ${reminder.time} — due in ${Math.max(0, Math.round(diffMs / 1000))}s.`,
  );
}

// ------------------------- engine entry points -------------------------

export function getActiveDueOccurrences(): ReminderEvent[] {
  try {
    return db
      .getReminderEvents()
      .filter(e => e.status === 'DUE')
      .sort((a, b) => a.scheduledTimestamp - b.scheduledTimestamp);
  } catch {
    return [];
  }
}

export function acknowledgeReminderOccurrence(
  occurrenceKey: string,
  action: 'acknowledged' | 'completed',
): ReminderEvent | null {
  const existing = safeGetEvent(occurrenceKey);
  if (!existing || existing.status !== 'DUE') {
    return null;
  }
  const updated = db.updateReminderEventStatus(
    occurrenceKey,
    action === 'completed' ? 'COMPLETED' : 'ACKNOWLEDGED',
    { acknowledgedAt: Date.now() },
  );
  if (updated) {
    console.log(`${LOG_PREFIX} Reminder ${action}: "${updated.title}" (${updated.occurrenceKey}).`);
  }
  return updated;
}

export function runSchedulerCheck(now: Date, callbacks: ReminderSchedulerCallbacks): void {
  // Global kill switch from Settings ("Reminder alarms"). When off, the
  // scheduler ignores every reminder — nothing fires and nothing is marked.
  try {
    if (!db.getActivePreferences().reminderAlarmsEnabled) {
      return;
    }
  } catch {
    // Fail open: a broken prefs read must never silence existing alarms.
  }
  let reminders: ReminderItem[] = [];
  let events: ReminderEvent[] = [];
  try {
    reminders = db.getReminders();
  } catch {
    reminders = [];
  }
  try {
    events = db.getReminderEvents();
  } catch {
    events = [];
  }
  const active = reminders.filter(r => r && r.enabled);
  let changed = false;
  for (const reminder of active) {
    try {
      // One malformed stored record must never kill the whole tick.
      const evaluation = evaluateReminderOccurrence(reminder, now, events);
      if (!evaluation.applicable || !evaluation.scheduledAt) {
        continue; // disabled / inactive frequency / settled — silent by design
      }
      if (evaluation.action === 'pending') {
        logNearDueCheck(reminder, evaluation, now);
        continue;
      }
      if (evaluation.action === 'fire-due') {
        fireDueOccurrence(reminder, evaluation, callbacks);
        changed = true;
        continue;
      }
      if (evaluation.action === 'mark-missed') {
        markOccurrenceMissed(reminder, evaluation);
        changed = true;
      }
    } catch (err) {
      console.log(`${LOG_PREFIX} Skipping unreadable reminder ${reminder?.id ?? '?'}: ${String(err)}`);
    }
  }
  if (sweepStaleDueEvents(now, events)) {
    changed = true;
  }
  if (changed) {
    callbacks.onEventsChanged();
  }
}

// Callbacks of the currently running scheduler (if any), so UI actions such
// as Active/Disabled toggles can trigger an immediate re-check instead of
// waiting for the next tick.
let liveCallbacks: ReminderSchedulerCallbacks | null = null;

export function requestSchedulerCheckNow(): void {
  if (!liveCallbacks) {
    return;
  }
  try {
    console.log(`${LOG_PREFIX} Immediate re-check requested (reminder list changed).`);
    runSchedulerCheck(new Date(), liveCallbacks);
  } catch (err) {
    console.log(`${LOG_PREFIX} Manual re-check failed (will retry on tick): ${String(err)}`);
  }
}

export function startReminderScheduler(callbacks: ReminderSchedulerCallbacks): () => void {
  let reminders: ReminderItem[] = [];
  try {
    reminders = db.getReminders();
  } catch {
    reminders = [];
  }
  const activeCount = reminders.filter(r => r && r.enabled).length;
  console.log(`${LOG_PREFIX} Loaded reminders: ${activeCount} active of ${reminders.length} total.`);
  liveCallbacks = callbacks;
  const startedAt = new Date();
  logHeartbeat(startedAt, activeCount);
  // Immediate catch-up: fire anything currently due and mark anything missed.
  // Guarded so a corrupt store can never prevent the interval from starting.
  try {
    runSchedulerCheck(startedAt, callbacks);
  } catch (err) {
    console.log(`${LOG_PREFIX} Initial check failed (will retry on tick): ${String(err)}`);
  }

  const intervalId = window.setInterval(() => {
    try {
      const tickNow = new Date();
      let current: ReminderItem[] = [];
      try {
        current = db.getReminders();
      } catch {
        current = [];
      }
      logHeartbeat(tickNow, current.filter(r => r.enabled).length);
      runSchedulerCheck(tickNow, callbacks);
    } catch (err) {
      console.log(`${LOG_PREFIX} Tick failed (offline-safe, will retry): ${String(err)}`);
    }
  }, REMINDER_TICK_MS);

  // Browsers throttle background timers; re-check as soon as the app is
  // visible again so no occurrence is skipped.
  const recheck = () => {
    try {
      runSchedulerCheck(new Date(), callbacks);
    } catch {
      // Offline-safe: the next tick retries.
    }
  };
  document.addEventListener('visibilitychange', recheck);
  window.addEventListener('focus', recheck);

  let alarmsOn = true;
  try {
    alarmsOn = db.getActivePreferences().reminderAlarmsEnabled;
  } catch {
    alarmsOn = true;
  }
  console.log(
    `${LOG_PREFIX} Scheduler started (checks every ${REMINDER_TICK_MS / 1000}s; ` +
    `acknowledgement grace ${REMINDER_ACK_GRACE_MS / 60000} min; ` +
    `reminder alarms ${alarmsOn ? 'ENABLED' : 'PAUSED by settings'}).`,
  );

  return () => {
    window.clearInterval(intervalId);
    document.removeEventListener('visibilitychange', recheck);
    window.removeEventListener('focus', recheck);
    if (liveCallbacks === callbacks) {
      liveCallbacks = null;
    }
    console.log(`${LOG_PREFIX} Scheduler stopped.`);
  };
}
