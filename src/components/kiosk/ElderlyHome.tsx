import React, { useState } from 'react';
import { 
  Mic, 
  PhoneCall, 
  Image as ImageIcon, 
  Sparkles, 
  Music, 
  Check, 
  Volume2, 
  Clock, 
  Grid3X3, 
  Type, 
  Calculator, 
  BellRing,
  ArrowRight
} from 'lucide-react';
import type { GameType, Language, ReminderItem } from '../../types';
import { translations } from '../../locales/translations';
import { db } from '../../services/db';
import { audioEngine } from '../../services/audioEngine';

interface Props {
  language: Language;
  onLaunchGame: (game: GameType) => void;
  onOpenCaregiver: () => void;
  onOpenReminders: () => void;
}

export const ElderlyHome: React.FC<Props> = ({ 
  language, 
  onLaunchGame, 
  onOpenReminders 
}) => {
  const t = translations[language] || translations['en'];
  const profile = db.getPatientProfile();
  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    try {
      return typeof db?.getReminders === 'function' ? db.getReminders() : [];
    } catch {
      return [];
    }
  });
  const [sosModalOpen, setSosModalOpen] = useState(false);

  const handleVoiceHelp = () => {
    const greeting = language === 'as'
      ? 'নমস্কাৰ প্ৰণৱ ডাঙৰীয়া! মই আপোনাৰ ব্ৰেইনএক্টিভাৰ সহায়িকা। আপোনাৰ দিনটো শান্তিপূৰ্ণ আৰু সক্ৰিয় হওক। আজিৰ খেল খেলিলে আপোনাৰ মগজুৰ সক্ৰিয়তা বৃদ্ধি পাব।'
      : 'Hello! I am your Brainactiver cognitive wellness companion. Wishing you an active, sharp, and peaceful day.';
    audioEngine.speakPrompt(greeting, language);
  };

  const handleEmergencyCall = () => {
    audioEngine.playSoftGuidance();
    setSosModalOpen(true);
    const alertSpeech = language === 'as'
      ? 'আপোনাৰ পৰিয়াল আৰু স্বাস্থ্য কৰ্মীক জাননী প্ৰেৰণ কৰা হৈছে।'
      : 'Alerting your designated family caregiver.';
    audioEngine.speakPrompt(alertSpeech, language);
  };

  const handleToggleReminder = (id: string) => {
    const updated = db.toggleReminderEnabled(id);
    setReminders(updated);
    audioEngine.playSuccessChime();
  };

  const handlePlayReminderAudio = (item: ReminderItem) => {
    const text = language === 'as' 
      ? `মনত পেলাই দিছোঁ: ${item.title}। ${item.note}`
      : `Reminder: ${item.title}. ${item.note}`;
    audioEngine.speakPrompt(text, language);
  };

  return (
    <div>
      {/* Patient Hero Welcome Card */}
      <section className="patient-hero-banner">
        <div>
          <h1 className="patient-greeting-title">
            {t.welcomePatient}
          </h1>
          <p className="patient-greeting-sub">
            {t.dailyRoutineGreeting} • {profile.location}
          </p>
        </div>

        <div className="hero-quick-actions">
          <button
            className="btn-large-voice-help"
            onClick={handleVoiceHelp}
            aria-label={t.voiceHelpButton}
          >
            <Mic size={26} />
            <span>{t.voiceHelpButton}</span>
          </button>

          <button
            className="btn-large-sos"
            onClick={handleEmergencyCall}
            aria-label={t.emergencyCallButton}
          >
            <PhoneCall size={26} />
            <span>{t.emergencyCallButton}</span>
          </button>
        </div>
      </section>

      {/* Routine & Reminder Alarms Bar */}
      <section className="routine-section">
        <div className="routine-section-header">
          <h2 className="section-headline">
            <Clock size={28} />
            <span>{t.todaysRoutine}</span>
          </h2>

          <button
            className="btn-routine-action"
            onClick={onOpenReminders}
            style={{ padding: '8px 18px', border: '2px solid var(--emerald-accent)' }}
          >
            <BellRing size={18} />
            <span>{t.remindersNavBtn}</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="routine-timeline-grid">
          {reminders.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className={`routine-card ${item.enabled ? 'active-time' : 'completed'}`}
            >
              <div>
                <span className="routine-time-badge">{item.time}</span>
                <h3 className="routine-item-title">{item.title}</h3>
                <p className="routine-item-desc">{item.note}</p>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  className="btn-routine-action"
                  style={{ flex: 1 }}
                  onClick={() => handlePlayReminderAudio(item)}
                  title={t.listenReminder}
                >
                  <Volume2 size={16} />
                  <span>{t.listenReminder}</span>
                </button>

                <button
                  className={`btn-routine-action ${!item.enabled ? 'done' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => handleToggleReminder(item.id)}
                >
                  <Check size={16} />
                  <span>{!item.enabled ? t.completedBadge : t.markCompleted}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Expanded 6 Cognitive Games Suite */}
      <section>
        <h2 className="section-headline" style={{ marginBottom: '18px' }}>
          <Sparkles size={28} />
          <span>{t.playGameTitle}</span>
        </h2>

        <div className="games-grid">
          {/* Game 1: Smriti Rong (Photo Reminiscence & Memory) */}
          <div
            className="game-launch-card"
            onClick={() => onLaunchGame('smriti_rong')}
          >
            <div>
              <div className="game-card-icon-wrapper icon-emerald">
                <ImageIcon size={34} />
              </div>
              <h3 className="game-card-title">{t.game1Title}</h3>
              <p className="game-card-sub">{t.game1Subtitle}</p>
            </div>

            <button className="btn-game-play btn-play-emerald">
              <span>{t.tapToStart}</span>
            </button>
          </div>

          {/* Game 2: Memory Matrix (Working Memory & Spatial Recall) */}
          <div
            className="game-launch-card"
            onClick={() => onLaunchGame('memory_matrix')}
          >
            <div>
              <div className="game-card-icon-wrapper icon-purple">
                <Grid3X3 size={34} />
              </div>
              <h3 className="game-card-title">{t.game2Title}</h3>
              <p className="game-card-sub">{t.game2Subtitle}</p>
            </div>

            <button className="btn-game-play btn-play-purple">
              <span>{t.tapToStart}</span>
            </button>
          </div>

          {/* Game 3: Taal & Reflex (Attention & Reaction Speed) */}
          <div
            className="game-launch-card"
            onClick={() => onLaunchGame('taal_xur')}
          >
            <div>
              <div className="game-card-icon-wrapper icon-blue">
                <Music size={34} />
              </div>
              <h3 className="game-card-title">{t.game3Title}</h3>
              <p className="game-card-sub">{t.game3Subtitle}</p>
            </div>

            <button className="btn-game-play btn-play-blue">
              <span>{t.tapToStart}</span>
            </button>
          </div>

          {/* Game 4: Pattern & Sequence (Logic & Problem Solving) */}
          <div
            className="game-launch-card"
            onClick={() => onLaunchGame('muga_motif')}
          >
            <div>
              <div className="game-card-icon-wrapper icon-amber">
                <Sparkles size={34} />
              </div>
              <h3 className="game-card-title">{t.game4Title}</h3>
              <p className="game-card-sub">{t.game4Subtitle}</p>
            </div>

            <button className="btn-game-play btn-play-amber">
              <span>{t.tapToStart}</span>
            </button>
          </div>

          {/* Game 5: Word Scramble (Word & Language Skills) */}
          <div
            className="game-launch-card"
            onClick={() => onLaunchGame('word_scramble')}
          >
            <div>
              <div className="game-card-icon-wrapper icon-indigo">
                <Type size={34} />
              </div>
              <h3 className="game-card-title">{t.game5Title}</h3>
              <p className="game-card-sub">{t.game5Subtitle}</p>
            </div>

            <button className="btn-game-play btn-play-emerald">
              <span>{t.tapToStart}</span>
            </button>
          </div>

          {/* Game 6: Math Maze (Calculation & Logical Thinking) */}
          <div
            className="game-launch-card"
            onClick={() => onLaunchGame('math_maze')}
          >
            <div>
              <div className="game-card-icon-wrapper icon-rose">
                <Calculator size={34} />
              </div>
              <h3 className="game-card-title">{t.game6Title}</h3>
              <p className="game-card-sub">{t.game6Subtitle}</p>
            </div>

            <button className="btn-game-play btn-play-blue">
              <span>{t.tapToStart}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Emergency Call Modal */}
      {sosModalOpen && (
        <div className="pin-modal-overlay">
          <div className="pin-modal-box" style={{ borderTop: '6px solid #ef4444' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <PhoneCall size={32} />
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#991b1b', marginBottom: '8px' }}>
              {t.emergencyCallButton}
            </h3>

            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Primary Contact: Daughter Jonali Baruah ({profile.caregiverContact})<br />
              Helpline: 108 (Health Emergency)
            </p>

            <button
              className="btn-game-play"
              style={{ background: '#ef4444', color: 'white', minHeight: '54px', marginBottom: '12px' }}
              onClick={() => alert(`Calling: ${profile.caregiverContact}`)}
            >
              <PhoneCall size={20} />
              <span>Direct Call Now</span>
            </button>

            <button
              className="btn-back-kiosk"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setSosModalOpen(false)}
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
