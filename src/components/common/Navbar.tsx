import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Globe, 
  KeyRound, 
  X, 
  Bell, 
  Palette, 
  Home, 
  Activity 
} from 'lucide-react';
import type { Language } from '../../types';
import { translations } from '../../locales/translations';
import { audioEngine } from '../../services/audioEngine';

interface Props {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currentView: string;
  onNavigate: (view: any) => void;
  onOpenDisplaySettings: () => void;
}

export const Navbar: React.FC<Props> = ({
  language,
  onLanguageChange,
  currentView,
  onNavigate,
  onOpenDisplaySettings,
}) => {
  const t = translations[language] || translations['en'];
  const [isMuted, setIsMuted] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioEngine.setMuted(next);
  };

  const handleCaregiverClick = () => {
    if (currentView === 'caregiver') {
      onNavigate('kiosk');
    } else {
      setIsPinModalOpen(true);
      setPinInput('');
      setPinError(false);
    }
  };

  const handleUnlockDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setIsPinModalOpen(false);
      onNavigate('caregiver');
      audioEngine.playSuccessChime();
    } else {
      setPinError(true);
      audioEngine.playSoftGuidance();
    }
  };

  const languagesList: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'as', name: 'অসমীয়া (Assamese)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'lus', name: 'Mizo ṭawng (Mizo)' },
  ];

  return (
    <>
      <header className="kiosk-nav">
        {/* Brand */}
        <div className="brand-badge" onClick={() => onNavigate('kiosk')}>
          <div className="brand-logo-icon">
            <span style={{ fontSize: '26px' }}>⚡</span>
          </div>
          <div>
            <div className="brand-title">
              {t.appName}
            </div>
            <div className="brand-sub">
              {t.appSubtitle}
            </div>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="nav-actions">
          {/* Offline Indicator */}
          <div className="badge-offline">
            <div className="pulse-dot" />
            <span>{t.offlineBadge}</span>
          </div>

          {/* Home Button (when in sub-views) */}
          {currentView !== 'kiosk' && (
            <button
              className="btn-lang-toggle"
              onClick={() => onNavigate('kiosk')}
              title={t.backToHome}
            >
              <Home size={18} />
              <span>{t.backToHome}</span>
            </button>
          )}

          {/* Reminders & Alarms Nav Button */}
          <button
            className="btn-lang-toggle"
            onClick={() => onNavigate('reminders')}
            style={{
              borderColor: currentView === 'reminders' ? 'var(--primary-emerald)' : 'var(--border-subtle)',
              background: currentView === 'reminders' ? 'var(--emerald-surface)' : 'var(--bg-card)'
            }}
          >
            <Bell size={18} />
            <span>{t.remindersNavBtn}</span>
          </button>

          {/* Display / Theme Customizer Button */}
          <button
            className="btn-lang-toggle"
            onClick={onOpenDisplaySettings}
            title={t.displayNavBtn}
          >
            <Palette size={18} />
            <span>{t.displayNavBtn}</span>
          </button>

          {/* Audio Mute/Unmute */}
          <button
            className="btn-lang-toggle"
            style={{ padding: '10px 12px' }}
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={20} color="#dc2626" /> : <Volume2 size={20} color="#059669" />}
          </button>

          {/* Multilingual Selector Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn-lang-toggle"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              style={{ fontWeight: 800 }}
            >
              <Globe size={18} />
              <span>{languagesList.find(l => l.code === language)?.name.split(' ')[0]}</span>
            </button>

            {isLangDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                background: 'var(--bg-card)',
                border: '2px solid var(--border-subtle)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                zIndex: 60,
                minWidth: '200px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {languagesList.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      onLanguageChange(item.code);
                      setIsLangDropdownOpen(false);
                      audioEngine.playSuccessChime();
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      background: language === item.code ? 'var(--emerald-surface)' : 'transparent',
                      color: language === item.code ? 'var(--primary-emerald)' : 'var(--text-primary)',
                      textAlign: 'left',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Caregiver Hub Switch */}
          <button
            className="btn-mode-switch"
            onClick={handleCaregiverClick}
          >
            {currentView === 'caregiver' ? (
              <>
                <Home size={18} />
                <span>{t.kioskElderlyMode}</span>
              </>
            ) : (
              <>
                <Activity size={18} />
                <span>{t.caregiverMode}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Caregiver PIN Protection Modal */}
      {isPinModalOpen && (
        <div className="pin-modal-overlay">
          <div className="pin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsPinModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <KeyRound size={32} />
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {t.pinRequiredTitle}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              PIN for Demo: <strong>1234</strong>
            </p>

            <form onSubmit={handleUnlockDashboard}>
              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="••••"
                className="pin-input"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
              />

              {pinError && (
                <p style={{ color: '#dc2626', fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>
                  {t.incorrectPin}
                </p>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  className="btn-game-play btn-play-emerald"
                  style={{ flex: 1, minHeight: '52px' }}
                >
                  <span>{t.unlockButton}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
