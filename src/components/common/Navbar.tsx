import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Globe,
  KeyRound,
  X,
  Bell,
  Palette,
  Settings,
  Home,
  Activity,
  LogOut,
  User,
  Shield,
  Pencil,
  Menu
} from 'lucide-react';
import type { DisplaySettings, Language, AuthSession } from '../../types';
import { translations } from '../../locales/translations';
import { audioEngine } from '../../services/audioEngine';
import { db } from '../../services/db';
import { PatientAvatar } from './PatientAvatar';

interface Props {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currentView: string;
  onNavigate: (view: any) => void;
  onOpenDisplaySettings: () => void;
  authSession: AuthSession | null;
  onLogout: () => void;
  onEditAvatar?: () => void;
  settings: DisplaySettings;
  onUpdateSettings: (settings: DisplaySettings) => void;
}

export const Navbar: React.FC<Props> = ({
  language,
  onLanguageChange,
  currentView,
  onNavigate,
  onOpenDisplaySettings,
  authSession,
  onLogout,
  onEditAvatar,
  settings,
  onUpdateSettings,
}) => {
  const t = translations[language] || translations['en'];
  const patientAvatarConfig = authSession?.role === 'patient' ? db.getAvatar(authSession.userId) : null;
  // Master sound switch: persisted in Settings (App applies it to the engine).
  const isMuted = !settings.soundEnabled;
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  // Mobile hamburger menu (pure UI state — collapses the nav actions into a
  // compact dropdown on small screens; no app logic is affected).
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-close the mobile menu whenever the active view changes.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView]);

  const toggleMute = () => {
    onUpdateSettings({ ...settings, soundEnabled: isMuted });
  };

  const handleCaregiverClick = () => {
    if (currentView === 'caregiver') {
      onNavigate('kiosk');
    } else if (authSession?.role === 'caregiver') {
      onNavigate('caregiver');
    } else {
      // For patients or unauthenticated, show PIN modal (legacy support)
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

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    onLogout();
    audioEngine.playSuccessChime();
  };

  const languagesList: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'as', name: 'অসমীয়া (Assamese)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'lus', name: 'Mizo ṭawng (Mizo)' },
    { code: 'mni', name: 'মেইতেই (Meitei/Manipuri)' },
    { code: 'kha', name: 'Khasi' },
    { code: 'grt', name: 'Garo' },
    { code: 'trp', name: 'Kokborok' },
    { code: 'ne', name: 'नेपाली (Nepali)' },
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

        {/* Hamburger toggle — visible on mobile only (see responsive CSS) */}
        <button
          className="nav-hamburger btn-lang-toggle"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          style={{ padding: '10px 12px' }}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Navigation & Controls */}
        <div className={`nav-actions${isMobileMenuOpen ? ' nav-open' : ''}`}>
          {/* Offline Indicator */}
          <div className="badge-offline">
            <div className="pulse-dot" />
            <span>{t.offlineBadge}</span>
          </div>

          {/* Home Button (when in sub-views) */}
          {currentView !== 'kiosk' && currentView !== 'login' && (
            <button
              className="btn-lang-toggle"
              onClick={() => onNavigate('kiosk')}
              title={t.backToHome}
            >
              <Home size={18} />
              <span>{t.backToHome}</span>
            </button>
          )}

          {/* Reminders & Alarms Nav Button - Only for patient views */}
          {(authSession?.role === 'patient' || !authSession) && currentView !== 'login' && (
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
          )}

          {/* Display / Theme Customizer Button */}
          {currentView !== 'login' && (
            <button
              className="btn-lang-toggle"
              onClick={onOpenDisplaySettings}
              title={t.displayNavBtn}
            >
              <Palette size={18} />
              <span>{t.displayNavBtn}</span>
            </button>
          )}

          {/* Settings Page Button */}
          {authSession && currentView !== 'login' && (
            <button
              className="btn-lang-toggle"
              onClick={() => onNavigate('settings')}
              title={t.settingsNavBtn}
              style={{
                borderColor: currentView === 'settings' ? 'var(--primary-emerald)' : 'var(--border-subtle)',
                background: currentView === 'settings' ? 'var(--emerald-surface)' : 'var(--bg-card)'
              }}
            >
              <Settings size={18} />
              <span>{t.settingsNavBtn}</span>
            </button>
          )}

          {/* Audio Mute/Unmute */}
          {currentView !== 'login' && (
            <button
              className="btn-lang-toggle"
              style={{ padding: '10px 12px' }}
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={20} color="#dc2626" /> : <Volume2 size={20} color="#059669" />}
            </button>
          )}

          {/* Multilingual Selector Dropdown */}
          {currentView !== 'login' && (
            <div className="nav-dropdown-wrap" style={{ position: 'relative' }}>
              <button
                className="btn-lang-toggle"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                style={{ fontWeight: 800 }}
              >
                <Globe size={18} />
                <span>{languagesList.find(l => l.code === language)?.name.split(' ')[0]}</span>
              </button>

              {isLangDropdownOpen && (
                <div className="nav-dropdown-panel" style={{
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
          )}

          {/* User Menu / Caregiver Hub Switch */}
          {authSession ? (
            <div className="nav-dropdown-wrap" style={{ position: 'relative' }}>
              <button
                className="btn-mode-switch"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{ 
                  background: authSession.role === 'caregiver' ? 'var(--emerald-surface)' : 'var(--muga-gold-bg)',
                  borderColor: authSession.role === 'caregiver' ? 'var(--emerald-border)' : 'var(--muga-gold-border)',
                  color: authSession.role === 'caregiver' ? 'var(--primary-emerald)' : 'var(--muga-gold)',
                }}
              >
                {authSession.role === 'caregiver' ? (
                  <>
                    <Shield size={18} />
                    <span>{authSession.name}</span>
                  </>
                ) : (
                  <>
                    {patientAvatarConfig ? (
                      <PatientAvatar config={patientAvatarConfig} size={24} />
                    ) : (
                      <User size={18} />
                    )}
                    <span>{authSession.name}</span>
                  </>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="nav-dropdown-panel" style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border-subtle)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '8px',
                  zIndex: 60,
                  minWidth: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {authSession.role === 'caregiver' ? 'Caregiver / ASHA' : 'Patient / Elderly'}
                  </div>
                  <div style={{ padding: '8px 14px', fontSize: '13px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                    {authSession.phoneNumber}
                  </div>
                  {authSession.role === 'patient' && onEditAvatar && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onEditAvatar();
                        audioEngine.playSoftGuidance();
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '2px solid var(--emerald-border)',
                        background: 'var(--emerald-surface)',
                        color: 'var(--primary-emerald)',
                        textAlign: 'left',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      {patientAvatarConfig ? (
                        <PatientAvatar config={patientAvatarConfig} size={24} />
                      ) : (
                        <User size={18} />
                      )}
                      <span>{t.avatarEdit}</span>
                      <Pencil size={16} style={{ marginLeft: 'auto' }} />
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '2px solid #ef4444',
                      background: 'transparent',
                      color: '#dc2626',
                      textAlign: 'left',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <LogOut size={18} />
                    <span>{t.backToHome}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn-mode-switch"
              onClick={handleCaregiverClick}
            >
              <Activity size={18} />
              <span>{t.caregiverMode}</span>
            </button>
          )}
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
