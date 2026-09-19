import { useState, useEffect } from 'react';
import type { Language, GameType, DisplaySettings, UserRole, AuthSession } from './types';
import { DEFAULT_USER_PREFERENCES, PREFS_CHANGED_EVENT, db } from './services/db';
import { adaptiveEngine } from './services/adaptiveEngine';
import { audioEngine } from './services/audioEngine';
import type { VoiceIntent } from './services/voiceCommands';
import { SettingsPage } from './components/settings/SettingsPage';
import { Navbar } from './components/common/Navbar';
import { DisplaySettingsModal } from './components/common/DisplaySettingsModal';
import { LanguageModal } from './components/common/LanguageModal';
import { SplashScreen } from './components/common/SplashScreen';
import { ElderlyHome } from './components/kiosk/ElderlyHome';
import { ReminderManager } from './components/reminders/ReminderManager';
import { ReminderAlarmHost } from './components/reminders/ReminderAlarmHost';
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';
import { PatientProgress } from './components/progress/PatientProgress';
import { VoiceAssistant } from './components/voice/VoiceAssistant';
import { SmritiRongGame } from './components/games/SmritiRongGame';
import { MemoryMatrixGame } from './components/games/MemoryMatrixGame';
import { TaalXurGame } from './components/games/TaalXurGame';
import { MugaMotifGame } from './components/games/MugaMotifGame';
import { WordScrambleGame } from './components/games/WordScrambleGame';
import { MathMazeGame } from './components/games/MathMazeGame';
import { BambooBasketGame } from './components/games/BambooBasketGame';
import { MusicMatchGame } from './components/games/MusicMatchGame';
import { WhatChangedGame } from './components/games/WhatChangedGame';
import { NumberMismatchGame } from './components/games/NumberMismatchGame';
import { AvatarEditor } from './components/avatar/AvatarEditor';
import { LoginPage } from './components/auth/LoginPage';
import { LanguageSelection } from './components/auth/LanguageSelection';

type ActiveView =
  | 'language_select'
  | 'login'
  | 'kiosk'
  | 'reminders'
  | 'settings'
  | 'progress'
  | 'avatar_setup'
  | 'caregiver' 
  | 'game_smriti' 
  | 'game_memory' 
  | 'game_taal' 
  | 'game_muga' 
  | 'game_word' 
  | 'game_math'
  | 'game_bamboo'
  | 'game_music'
  | 'game_what_changed'
  | 'game_number';

export function App() {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const settings = db.getSettings();
      return settings.language || 'en';
    } catch {
      return 'en';
    }
  });
  const [currentView, setCurrentView] = useState<ActiveView>('language_select');
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(() => {
    try {
      if (typeof db !== 'undefined' && typeof db.getSettings === 'function') {
        return db.getSettings();
      }
    } catch {
      // fallback
    }
    return {
      theme: 'light',
      fontScale: 'large',
      highContrast: false,
      soundEnabled: true,
      language: 'en',
    };
  });
  const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [navStack, setNavStack] = useState<ActiveView[]>([]);
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  // Bumped whenever any per-user prefs snapshot is saved so live consumers
  // (voice gating, accessibility attributes) re-read the store.
  const [prefsVersion, setPrefsVersion] = useState(0);
  // Startup splash overlay: shown once on initial load, dismissed
  // automatically by SplashScreen (no user interaction required).
  const [showSplash, setShowSplash] = useState(true);

  // Check for existing auth session on mount
  useEffect(() => {
    // Clear any existing session to force fresh login flow
    db.clearSession();
    db.seedDefaultUsers();
    setAuthChecked(true);
  }, []);

  // Apply theme, font scale, contrast and master sound to document/engine
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', displaySettings.theme);
    document.documentElement.setAttribute('data-font-scale', displaySettings.fontScale);
    document.documentElement.setAttribute('data-high-contrast', displaySettings.highContrast ? 'true' : 'false');
    audioEngine.setMuted(!displaySettings.soundEnabled);
  }, [displaySettings]);

  // Live accessibility attributes driven by per-user prefs (reduced motion,
  // larger touch targets). Re-applied whenever a prefs snapshot is saved.
  useEffect(() => {
    const bump = () => setPrefsVersion(v => v + 1);
    window.addEventListener(PREFS_CHANGED_EVENT, bump);
    return () => window.removeEventListener(PREFS_CHANGED_EVENT, bump);
  }, []);

  useEffect(() => {
    try {
      const prefs = db.getActivePreferences();
      document.documentElement.setAttribute('data-reduced-motion', prefs.reducedMotion ? 'true' : 'false');
      document.documentElement.setAttribute('data-large-targets', prefs.largerTouchTargets ? 'true' : 'false');
    } catch {
      // Accessibility attributes are best-effort.
    }
  }, [prefsVersion]);

  // Sync language state with displaySettings
  useEffect(() => {
    setLanguage(displaySettings.language);
  }, [displaySettings.language]);

  const handleUpdateSettings = (newSettings: DisplaySettings) => {
    setDisplaySettings(newSettings);
    db.updateSettings(newSettings);
  };

  const handleNavigate = (view: ActiveView) => {
    if (view === currentView) return;
    if (canAccessView(view)) {
      setNavStack((s) => [...s, currentView]);
      setCurrentView(view);
    } else if (authSession?.role === 'patient' && view === 'caregiver') {
      setNavStack((s) => [...s, currentView]);
      setCurrentView(view);
    }
  };

  const handleGoBack = () => {
    if (navStack.length > 0) {
      const next = navStack[navStack.length - 1];
      setNavStack(navStack.slice(0, -1));
      setCurrentView(next);
    } else if (authSession) {
      setCurrentView('kiosk');
    }
  };

  const handleQuickLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setDisplaySettings((prev) => ({ ...prev, language: lang }));
    db.updateLanguage(lang);
    audioEngine.setLanguage(lang);
  };

  const VIEW_TO_GAME: Partial<Record<ActiveView, GameType>> = {
    game_smriti: 'smriti_rong',
    game_memory: 'memory_matrix',
    game_taal: 'taal_xur',
    game_muga: 'muga_motif',
    game_word: 'word_scramble',
    game_math: 'math_maze',
    game_bamboo: 'bamboo_basket',
    game_music: 'music_match',
    game_what_changed: 'what_changed',
    game_number: 'number_mismatch',
  };

  const activeGameId = currentView && VIEW_TO_GAME[currentView] ? VIEW_TO_GAME[currentView] : null;

  const handleVoiceIntent = (intent: VoiceIntent): boolean => {
    if (!authSession) {
      return false;
    }
    switch (intent) {
      case 'OPEN_HOME':
        handleNavigate('kiosk');
        return true;
      case 'OPEN_MEMORY_MATRIX':
        handleNavigate('game_memory');
        return true;
      case 'OPEN_MUSIC_MATCH':
        handleNavigate('game_music');
        return true;
      case 'OPEN_BAMBOO_BASKET':
        handleNavigate('game_bamboo');
        return true;
      case 'OPEN_PATTERN_SEQUENCE':
        handleNavigate('game_muga');
        return true;
      case 'OPEN_WORD_SCRAMBLE':
        handleNavigate('game_word');
        return true;
      case 'OPEN_MATH_MAZE':
        handleNavigate('game_math');
        return true;
      case 'OPEN_SMRITI_RONG':
        handleNavigate('game_smriti');
        return true;
      case 'OPEN_TAAL_XUR':
        handleNavigate('game_taal');
        return true;
      case 'OPEN_WHAT_CHANGED':
        handleNavigate('game_what_changed');
        return true;
      case 'OPEN_PROGRESS':
      case 'READ_PROGRESS':
      case 'SHOW_REWARDS':
      case 'SHOW_COINS':
        handleNavigate('progress');
        return true;
      case 'OPEN_REMINDERS':
      case 'SET_REMINDER':
        handleNavigate('reminders');
        return true;
      case 'OPEN_CAREGIVER':
        if (authSession.role !== 'caregiver') {
          return false;
        }
        handleNavigate('caregiver');
        return true;
      case 'OPEN_SETTINGS':
        setIsDisplayModalOpen(true);
        return true;
      case 'OPEN_LANGUAGE_SELECTION':
        setIsLanguageModalOpen(true);
        return true;
      case 'GO_BACK':
        handleGoBack();
        return true;
      case 'LOGOUT':
        handleLogout();
        return true;
      default:
        return false;
    }
  };

  const handleLaunchGame = (game: GameType) => {
    switch (game) {
      case 'smriti_rong': setCurrentView('game_smriti'); break;
      case 'memory_matrix': setCurrentView('game_memory'); break;
      case 'taal_xur': setCurrentView('game_taal'); break;
      case 'muga_motif': setCurrentView('game_muga'); break;
      case 'word_scramble': setCurrentView('game_word'); break;
      case 'math_maze': setCurrentView('game_math'); break;
      case 'bamboo_basket': setCurrentView('game_bamboo'); break;
      case 'music_match': setCurrentView('game_music'); break;
      case 'what_changed': setCurrentView('game_what_changed'); break;
      case 'number_mismatch': setCurrentView('game_number'); break;
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    db.updateLanguage(lang);
    setCurrentView('login');
  };

  // Applies a user's saved preferences snapshot to the live systems.
  const applyUserPreferences = (userId: string) => {
    try {
      if (!db.hasUserPreferences(userId)) {
        return;
      }
      const prefs = db.getUserPreferences(userId);
      const device: DisplaySettings = {
        theme: prefs.theme,
        fontScale: prefs.fontScale,
        highContrast: prefs.highContrast,
        soundEnabled: prefs.soundEnabled,
        language: prefs.language,
      };
      setDisplaySettings(device);
      db.updateSettings(device);
      setLanguage(prefs.language);
      audioEngine.setLanguage(prefs.language);
      audioEngine.setMuted(!prefs.soundEnabled);
      adaptiveEngine.setAdaptiveEnabled(prefs.adaptiveDifficultyEnabled);
      setPrefsVersion(v => v + 1);
    } catch {
      // Keep the current device settings when a snapshot cannot be applied.
    }
  };

  const handleLogin = (role: UserRole) => {
    const session = db.getSession();
    if (session) {
      setAuthSession(session);
      applyUserPreferences(session.userId);
      if (role === 'patient') {
        // First-time patients are asked to create a personal avatar
        const hasAvatar = !!db.getAvatar(session.userId);
        setCurrentView(hasAvatar ? 'kiosk' : 'avatar_setup');
      } else {
        setCurrentView('caregiver');
      }
    }
  };

  const handleAvatarSaved = () => {
    setCurrentView('kiosk');
  };

  const handleEditAvatar = () => {
    if (authSession?.role === 'patient') {
      setCurrentView('avatar_setup');
    }
  };

  const handleLogout = () => {
    // Preserve this user's preferences snapshot before signing out so the
    // next login restores their theme, language, voice and accessibility
    // choices on any device state.
    try {
      const session = db.getSession();
      if (session) {
        const prev = db.hasUserPreferences(session.userId)
          ? db.getUserPreferences(session.userId)
          : DEFAULT_USER_PREFERENCES;
        db.saveUserPreferences(session.userId, {
          ...prev,
          theme: displaySettings.theme,
          fontScale: displaySettings.fontScale,
          highContrast: displaySettings.highContrast,
          soundEnabled: displaySettings.soundEnabled,
          language: displaySettings.language,
        });
      }
    } catch {
      // Logout proceeds even if preferences cannot be preserved.
    }
    db.clearSession();
    db.clearLanguage();
    setAuthSession(null);
    setLanguage('en');
    setCurrentView('language_select');
  };

  const canAccessView = (view: ActiveView): boolean => {
    if (!authSession) return view === 'login' || view === 'language_select';
    
    const patientViews: ActiveView[] = ['kiosk', 'reminders', 'settings', 'progress', 'avatar_setup', 'game_smriti', 'game_memory', 'game_taal', 'game_muga', 'game_word', 'game_math', 'game_bamboo', 'game_music', 'game_what_changed', 'game_number'];
    const caregiverViews: ActiveView[] = ['caregiver', 'settings'];
    
    if (authSession.role === 'patient') {
      return patientViews.includes(view);
    } else if (authSession.role === 'caregiver') {
      return caregiverViews.includes(view) || patientViews.includes(view); // Caregiver can access patient views too
    }
    return false;
  };

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="kiosk-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 16px', width: '16px', height: '16px' }} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show language selection if no auth session
  if (!authSession && currentView === 'language_select') {
    return (
      <>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <LanguageSelection
          currentLanguage={language}
          onLanguageSelect={handleLanguageSelect}
        />
      </>
    );
  }

  // Show login page if not authenticated
  if (!authSession && currentView === 'login') {
    return (
      <>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <LoginPage
          language={language}
          onLogin={handleLogin}
        />
      </>
    );
  }

  // Voice gating from per-user Settings (fail-open when prefs unreadable).
  const voicePrefs = (() => {
    try {
      const prefs = db.getActivePreferences();
      return { assistant: prefs.voiceAssistantEnabled, commands: prefs.voiceCommandsEnabled };
    } catch {
      return { assistant: true, commands: true };
    }
  })();

  return (
    <div className="kiosk-container">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {/* Top Navbar */}
      <Navbar
        language={language}
        onLanguageChange={handleQuickLanguageChange}
        currentView={currentView}
        onNavigate={(view: ActiveView) => {
          if (canAccessView(view)) {
            setCurrentView(view);
          } else if (authSession?.role === 'patient' && view === 'caregiver') {
            // Patient trying to access caregiver view - show PIN modal (existing behavior)
            setCurrentView(view);
          }
        }}
        onOpenDisplaySettings={() => setIsDisplayModalOpen(true)}
        authSession={authSession}
        onLogout={handleLogout}
        onEditAvatar={handleEditAvatar}
        settings={displaySettings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Main Content Area */}
      <main className="kiosk-main">
        {canAccessView(currentView) && currentView === 'avatar_setup' && (
          <AvatarEditor
            language={language}
            initialConfig={db.getAvatar(authSession?.userId)}
            onSave={(config) => {
              db.saveAvatar(config, authSession?.userId);
              handleAvatarSaved();
            }}
            onClose={() => setCurrentView('kiosk')}
          />
        )}

        {canAccessView(currentView) && currentView === 'kiosk' && (
          <ElderlyHome
            language={language}
            onLaunchGame={handleLaunchGame}
            onOpenCaregiver={() => setCurrentView('caregiver')}
            onOpenReminders={() => setCurrentView('reminders')}
            onOpenVoiceAssistant={() => {
              if (voicePrefs.assistant) {
                setIsVoiceOpen(true);
              }
            }}
            onEditAvatar={handleEditAvatar}
          />
        )}

        {canAccessView(currentView) && currentView === 'reminders' && (
          <ReminderManager
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {canAccessView(currentView) && currentView === 'settings' && (
          <SettingsPage
            language={language}
            settings={displaySettings}
            onUpdateSettings={handleUpdateSettings}
            onLanguageChange={handleQuickLanguageChange}
            onNavigate={handleNavigate}
            onBack={handleGoBack}
            onLogout={handleLogout}
            authSession={authSession}
            onProfileNameChanged={(name) => setAuthSession(prev => (prev ? { ...prev, name } : prev))}
          />
        )}

        {canAccessView(currentView) && currentView === 'progress' && (
          <PatientProgress
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {canAccessView(currentView) && currentView === 'caregiver' && (
          <CaregiverDashboard
            language={language}
            onBackToKiosk={() => setCurrentView('kiosk')}
          />
        )}

        {/* Cognitive Games */}
        {canAccessView(currentView) && currentView === 'game_smriti' && (
          <SmritiRongGame
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {canAccessView(currentView) && currentView === 'game_memory' && (
          <MemoryMatrixGame
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {canAccessView(currentView) && currentView === 'game_taal' && (
          <TaalXurGame
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {canAccessView(currentView) && currentView === 'game_muga' && (
          <MugaMotifGame
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {canAccessView(currentView) && currentView === 'game_word' && (
          <WordScrambleGame
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {canAccessView(currentView) && currentView === 'game_math' && (
          <MathMazeGame
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {canAccessView(currentView) && currentView === 'game_bamboo' && (
          <BambooBasketGame
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {canAccessView(currentView) && currentView === 'game_music' && (
          <MusicMatchGame
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {canAccessView(currentView) && currentView === 'game_what_changed' && (
          <WhatChangedGame
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {canAccessView(currentView) && currentView === 'game_number' && (
          <NumberMismatchGame
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}
      </main>

      {/* Display & Theme Customizer Modal */}
      <DisplaySettingsModal
        language={language}
        isOpen={isDisplayModalOpen}
        onClose={() => setIsDisplayModalOpen(false)}
        settings={displaySettings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* In-Session Language Quick-Select Modal (open via voice command) */}
      {isLanguageModalOpen && (
        <LanguageModal
          currentLanguage={language}
          onSelect={handleQuickLanguageChange}
          onClose={() => setIsLanguageModalOpen(false)}
        />
      )}

      {/* Exact-time reminder scheduler + alarm host (runs while the app is open) */}
      {authSession && <ReminderAlarmHost language={language} />}

      {/* Multilingual Voice Assistant (gated by Settings voice switches) */}
      <VoiceAssistant
        open={isVoiceOpen && voicePrefs.assistant}
        onOpen={() => setIsVoiceOpen(true)}
        onClose={() => setIsVoiceOpen(false)}
        language={language}
        currentView={currentView}
        activeGameId={activeGameId}
        showFab={!!authSession && currentView !== 'login' && currentView !== 'language_select' && voicePrefs.assistant}
        commandsEnabled={voicePrefs.commands}
        onIntent={handleVoiceIntent}
      />

      {/* Modern Brainactiver Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 20px',
        borderTop: '2px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        fontWeight: 700,
        marginTop: 'auto'
      }}>
        <div>
          <strong style={{ color: 'var(--primary-emerald)' }}>Brainactiver</strong> • Active Cognitive Training & Brain Wellness Platform
        </div>
        <div style={{ marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Multilingual Support • 100% Offline-First Architecture • Adaptive Cognitive Health Telemetry
        </div>
      </footer>
    </div>
  );
}

export default App;
