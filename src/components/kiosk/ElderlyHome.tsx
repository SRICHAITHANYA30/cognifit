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
  ArrowRight,
  Heart,
  AudioLines,
  Eye,
  ListOrdered,
  Pencil,
  GitBranch,
  Puzzle
} from 'lucide-react';
import type { GameType, Language, ReminderItem } from '../../types';
import { translations } from '../../locales/translations';
import { db } from '../../services/db';
import { audioEngine } from '../../services/audioEngine';
import { PatientAvatar } from '../common/PatientAvatar';

interface Props {
  language: Language;
  onLaunchGame: (game: GameType) => void;
  onOpenCaregiver: () => void;
  onOpenReminders: () => void;
  onOpenVoiceAssistant: () => void;
  onEditAvatar: () => void;
}

export const ElderlyHome: React.FC<Props> = ({ 
  language, 
  onLaunchGame, 
  onOpenReminders,
  onOpenVoiceAssistant,
  onEditAvatar 
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
    const greeting = t.voiceHelpGreeting;
    audioEngine.speakPrompt(greeting, language);
    onOpenVoiceAssistant();
  };

  const handleEmergencyCall = () => {
    audioEngine.playSoftGuidance();
    setSosModalOpen(true);
    const alertSpeech = t.emergencyCallAlert;
    audioEngine.speakPrompt(alertSpeech, language);
  };

  const handleToggleReminder = (id: string) => {
    const updated = db.toggleReminderEnabled(id);
    setReminders(updated);
    audioEngine.playSuccessChime();
  };

  const handlePlayReminderAudio = (item: ReminderItem) => {
    const text = t.reminderAudioPrefix.replace('{title}', item.title).replace('{note}', item.note);
    audioEngine.speakPrompt(text, language);
  };

  return (
    <div>
      {/* Patient Hero Welcome Card */}
      <section className="patient-hero-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', zIndex: 2 }}>
          <button
            onClick={onEditAvatar}
            title={t.avatarEdit}
            aria-label={t.avatarEdit}
            style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.16)',
              border: '3px solid rgba(255,255,255,0.6)',
              borderRadius: '50%',
              padding: '6px',
              cursor: 'pointer',
              lineHeight: 0,
              flexShrink: 0,
            }}
          >
            <PatientAvatar config={db.getAvatar()} size={76} />
            <span
              style={{
                position: 'absolute',
                right: '-2px',
                bottom: '-2px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'var(--muga-gold)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
              }}
            >
              <Pencil size={13} />
            </span>
          </button>
          <div>
            <h1 className="patient-greeting-title">
              {t.welcomePatient}
            </h1>
            <p className="patient-greeting-sub">
              {t.dailyRoutineGreeting} • {profile.location}
            </p>
          </div>
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
                <Heart size={16} className="routine-card-icon" />
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
                <GitBranch size={34} />
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

          {/* Game 7: Bamboo Basket Builder (Sequencing & Spatial Logic) */}
          <div
            className="game-launch-card"
            onClick={() => onLaunchGame('bamboo_basket')}
          >
            <div>
              <div className="game-card-icon-wrapper icon-amber">
                <Puzzle size={34} />
              </div>
              <h3 className="game-card-title">{t.game7Title}</h3>
              <p className="game-card-sub">{t.game7Subtitle}</p>
            </div>

            <button className="btn-game-play btn-play-amber">
              <span>{t.tapToStart}</span>
            </button>
          </div>

          {/* Game 8: Music Match (Relaxing Sound Pairs) */}
          <div
            className="game-launch-card"
            onClick={() => onLaunchGame('music_match')}
          >
            <div>
              <div className="game-card-icon-wrapper icon-emerald">
                <AudioLines size={34} />
              </div>
              <h3 className="game-card-title">{t.game8Title}</h3>
              <p className="game-card-sub">{t.game8Subtitle}</p>
            </div>

            <button className="btn-game-play btn-play-emerald">
              <span>{t.tapToStart}</span>
            </button>
          </div>

          {/* Game 9: What Changed? (Attention & Observation) */}
          <div
            className="game-launch-card"
            onClick={() => onLaunchGame('what_changed')}
          >
            <div>
              <div className="game-card-icon-wrapper icon-teal">
                <Eye size={34} />
              </div>
              <h3 className="game-card-title">{t.game9Title}</h3>
              <p className="game-card-sub">{t.game9Subtitle}</p>
            </div>

            <button className="btn-game-play btn-play-teal">
              <span>{t.tapToStart}</span>
            </button>
          </div>

          {/* Game 10: Number Mismatch (Number Order & Mismatch Detection) */}
          <div
            className="game-launch-card"
            onClick={() => onLaunchGame('number_mismatch')}
          >
            <div>
              <div className="game-card-icon-wrapper icon-indigo">
                <ListOrdered size={34} />
              </div>
              <h3 className="game-card-title">{t.game10Title}</h3>
              <p className="game-card-sub">{t.game10Subtitle}</p>
            </div>

            <button className="btn-game-play btn-play-emerald">
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
              {t.primaryContact}: {t.daughterJonali} ({profile.caregiverContact})<br />
              {t.helpline}: 108 ({t.healthEmergency})
            </p>

            <button
              className="btn-game-play"
              style={{ background: '#ef4444', color: 'white', minHeight: '54px', marginBottom: '12px' }}
              onClick={() => alert(`Calling: ${profile.caregiverContact}`)}
            >
              <PhoneCall size={20} />
              <span>{t.directCallNow}</span>
            </button>

            <button
              className="btn-back-kiosk"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setSosModalOpen(false)}
            >
              <span>{t.closeButton}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};