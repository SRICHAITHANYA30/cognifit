import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  BellRing, 
  Plus, 
  Trash2, 
  Check, 
  Volume2, 
  X, 
  Edit3,
  Brain,
  Pill,
  Droplet,
  Footprints,
  Moon
} from 'lucide-react';
import type { Language, ReminderFrequency, ReminderItem } from '../../types';
import { translations } from '../../locales/translations';
import { db } from '../../services/db';
import { audioEngine } from '../../services/audioEngine';

interface Props {
  language: Language;
  onBack: () => void;
}

export const ReminderManager: React.FC<Props> = ({ language, onBack }) => {
  const t = translations[language];
  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    try {
      return typeof db?.getReminders === 'function' ? db.getReminders() : [];
    } catch {
      return [];
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [time, setTime] = useState('08:30');
  const [category, setCategory] = useState<ReminderItem['category']>('brain');
  const [frequency, setFrequency] = useState<ReminderFrequency>('daily');
  const [voiceAlarm, setVoiceAlarm] = useState(true);

  // Active triggered alarm state for preview/simulation
  const [simulatedActiveAlarm, setSimulatedActiveAlarm] = useState<ReminderItem | null>(null);

  const handleOpenNewModal = () => {
    setEditingId(null);
    setTitle('');
    setNote('');
    setTime('08:30');
    setCategory('brain');
    setFrequency('daily');
    setVoiceAlarm(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ReminderItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setNote(item.note);
    setTime(item.time);
    setCategory(item.category);
    setFrequency(item.frequency);
    setVoiceAlarm(item.voiceAlarm);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      const updated: ReminderItem = {
        id: editingId,
        title,
        note,
        time,
        category,
        frequency,
        enabled: true,
        voiceAlarm,
      };
      db.updateReminder(updated);
      setReminders(db.getReminders());
    } else {
      db.addReminder({
        title,
        note,
        time,
        category,
        frequency,
        enabled: true,
        voiceAlarm,
      });
      setReminders(db.getReminders());
    }

    setIsModalOpen(false);
    audioEngine.playSuccessChime();
  };

  const handleToggle = (id: string) => {
    const updated = db.toggleReminderEnabled(id);
    setReminders(updated);
    audioEngine.playSuccessChime();
  };

  const handleDelete = (id: string) => {
    const updated = db.deleteReminder(id);
    setReminders(updated);
  };

  const handleTestAlarm = (item: ReminderItem) => {
    setSimulatedActiveAlarm(item);
    audioEngine.startAlarmRingtone(8);
    if (item.voiceAlarm) {
      const prompt = language === 'as'
        ? `মনত পেলাই দিছোঁ: ${item.title} কৰাৰ সময় হৈছে।`
        : `Reminder alarm: Time for ${item.title}.`;
      audioEngine.speakPrompt(prompt, language);
    }
  };

  const handleDismissAlarm = () => {
    audioEngine.stopAlarmChime();
    setSimulatedActiveAlarm(null);
  };

  const getCategoryIcon = (cat: ReminderItem['category']) => {
    switch (cat) {
      case 'brain': return <Brain size={24} color="#059669" />;
      case 'medicine': return <Pill size={24} color="#dc2626" />;
      case 'water': return <Droplet size={24} color="#0284c7" />;
      case 'walk': return <Footprints size={24} color="#d97706" />;
      case 'rest': return <Moon size={24} color="#7c3aed" />;
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'var(--bg-card)',
        padding: '20px 28px',
        borderRadius: '24px',
        border: '2px solid var(--emerald-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-back-kiosk" onClick={onBack}>
            <ArrowLeft size={24} />
            <span>{t.backToHome}</span>
          </button>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary-emerald)' }}>
              {t.remindersTitle}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Active Alarms & Cognitive Activity Scheduling
            </p>
          </div>
        </div>

        <button
          className="btn-large-voice-help"
          style={{ minHeight: '52px', minWidth: 'unset', padding: '12px 24px' }}
          onClick={handleOpenNewModal}
        >
          <Plus size={22} />
          <span>{t.addReminderBtn}</span>
        </button>
      </div>

      {/* Simulated Active Alarm Banner */}
      {simulatedActiveAlarm && (
        <div style={{
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          padding: '24px 32px',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          animation: 'pulse-ring 1.5s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ background: 'white', color: '#dc2626', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BellRing size={32} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {t.alarmActiveBanner}
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 900 }}>{simulatedActiveAlarm.title}</h3>
              <p style={{ fontSize: '15px', opacity: 0.95 }}>{simulatedActiveAlarm.note}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleDismissAlarm}
              style={{
                background: 'white',
                color: '#991b1b',
                border: 'none',
                padding: '12px 22px',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {t.dismissAlarm}
            </button>
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {reminders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg-card)', borderRadius: '24px', border: '2px solid #e2e8f0' }}>
            <Bell size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {t.noRemindersScheduled}
            </p>
          </div>
        ) : (
          reminders.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-card)',
                border: item.enabled ? '2px solid var(--emerald-border)' : '2px solid #e2e8f0',
                borderRadius: '24px',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: 'var(--shadow-sm)',
                opacity: item.enabled ? 1 : 0.65,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '18px',
                  background: 'var(--bg-parchment)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getCategoryIcon(item.category)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--primary-emerald)' }}>
                      {item.time}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: 'var(--emerald-surface)',
                      color: 'var(--primary-emerald)',
                      border: '1px solid var(--emerald-border)'
                    }}>
                      {item.frequency === 'daily' ? t.freqDaily : item.frequency === 'weekdays' ? t.freqWeekdays : t.freqOnce}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {item.title}
                  </h3>
                  {item.note && (
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {item.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Test Voice Alarm Sound */}
                <button
                  className="btn-routine-action"
                  style={{ minHeight: '44px', padding: '8px 14px' }}
                  onClick={() => handleTestAlarm(item)}
                  title={t.testAlarmSound}
                >
                  <Volume2 size={18} />
                  <span>{t.testAlarmSound}</span>
                </button>

                {/* Edit */}
                <button
                  className="btn-routine-action"
                  style={{ minHeight: '44px', padding: '8px 14px' }}
                  onClick={() => handleOpenEditModal(item)}
                  title="Edit Reminder"
                >
                  <Edit3 size={18} />
                </button>

                {/* Enable/Disable Toggle */}
                <button
                  className={`btn-routine-action ${item.enabled ? 'done' : ''}`}
                  style={{ minHeight: '44px', padding: '8px 16px' }}
                  onClick={() => handleToggle(item.id)}
                >
                  <Check size={18} />
                  <span>{item.enabled ? 'Active' : 'Disabled'}</span>
                </button>

                {/* Delete */}
                <button
                  className="btn-routine-action"
                  style={{ borderColor: '#f87171', color: '#dc2626', minHeight: '44px', padding: '8px 12px' }}
                  onClick={() => handleDelete(item.id)}
                  title="Delete Reminder"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="pin-modal-overlay">
          <div className="pin-modal-box" style={{ maxWidth: '520px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-emerald)' }}>
                {editingId ? 'Edit Scheduled Activity' : t.addReminderBtn}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{t.reminderTitleLabel}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Memory Matrix Training"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '16px', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{t.reminderTimeLabel}</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '16px', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{t.reminderFreqLabel}</label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as ReminderFrequency)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '15px', marginTop: '4px' }}
                  >
                    <option value="daily">{t.freqDaily}</option>
                    <option value="weekdays">{t.freqWeekdays}</option>
                    <option value="weekly">{t.freqWeekly}</option>
                    <option value="once">{t.freqOnce}</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{t.categoryLabel}</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ReminderItem['category'])}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '15px', marginTop: '4px' }}
                >
                  <option value="brain">{t.catBrain}</option>
                  <option value="medicine">{t.catMedicine}</option>
                  <option value="water">{t.catWater}</option>
                  <option value="walk">{t.catWalk}</option>
                  <option value="rest">{t.catRest}</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{t.reminderNoteLabel}</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Complete 10 minutes of Memory games."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '15px', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="voiceAlarmCheck"
                  checked={voiceAlarm}
                  onChange={e => setVoiceAlarm(e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                <label htmlFor="voiceAlarmCheck" style={{ fontSize: '14px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                  {t.voiceAlarmLabel}
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  className="btn-game-play btn-play-emerald"
                  style={{ flex: 1, minHeight: '52px', fontSize: '16px' }}
                >
                  <span>Save Activity</span>
                </button>
                <button
                  type="button"
                  className="btn-back-kiosk"
                  style={{ minHeight: '52px' }}
                  onClick={() => setIsModalOpen(false)}
                >
                  <span>{t.cancel}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
