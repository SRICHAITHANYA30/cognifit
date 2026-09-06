import { useState, useEffect } from 'react';
import type { Language, GameType, DisplaySettings } from './types';
import { db } from './services/db';
import { Navbar } from './components/common/Navbar';
import { DisplaySettingsModal } from './components/common/DisplaySettingsModal';
import { ElderlyHome } from './components/kiosk/ElderlyHome';
import { ReminderManager } from './components/reminders/ReminderManager';
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';
import { SmritiRongGame } from './components/games/SmritiRongGame';
import { MemoryMatrixGame } from './components/games/MemoryMatrixGame';
import { TaalXurGame } from './components/games/TaalXurGame';
import { MugaMotifGame } from './components/games/MugaMotifGame';
import { WordScrambleGame } from './components/games/WordScrambleGame';
import { MathMazeGame } from './components/games/MathMazeGame';

type ActiveView = 
  | 'kiosk' 
  | 'reminders'
  | 'caregiver' 
  | 'game_smriti' 
  | 'game_memory' 
  | 'game_taal' 
  | 'game_muga' 
  | 'game_word' 
  | 'game_math';

export function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<ActiveView>('kiosk');
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
    };
  });
  const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false);

  // Apply theme and font scale to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', displaySettings.theme);
    document.documentElement.setAttribute('data-font-scale', displaySettings.fontScale);
  }, [displaySettings]);

  const handleUpdateSettings = (newSettings: DisplaySettings) => {
    setDisplaySettings(newSettings);
    db.updateSettings(newSettings);
  };

  const handleLaunchGame = (game: GameType) => {
    switch (game) {
      case 'smriti_rong': setCurrentView('game_smriti'); break;
      case 'memory_matrix': setCurrentView('game_memory'); break;
      case 'taal_xur': setCurrentView('game_taal'); break;
      case 'muga_motif': setCurrentView('game_muga'); break;
      case 'word_scramble': setCurrentView('game_word'); break;
      case 'math_maze': setCurrentView('game_math'); break;
    }
  };

  return (
    <div className="kiosk-container">
      {/* Top Navbar */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenDisplaySettings={() => setIsDisplayModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="kiosk-main">
        {currentView === 'kiosk' && (
          <ElderlyHome
            language={language}
            onLaunchGame={handleLaunchGame}
            onOpenCaregiver={() => setCurrentView('caregiver')}
            onOpenReminders={() => setCurrentView('reminders')}
          />
        )}

        {currentView === 'reminders' && (
          <ReminderManager
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {currentView === 'caregiver' && (
          <CaregiverDashboard
            language={language}
            onBackToKiosk={() => setCurrentView('kiosk')}
          />
        )}

        {/* Cognitive Games */}
        {currentView === 'game_smriti' && (
          <SmritiRongGame
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {currentView === 'game_memory' && (
          <MemoryMatrixGame
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {currentView === 'game_taal' && (
          <TaalXurGame
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {currentView === 'game_muga' && (
          <MugaMotifGame
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {currentView === 'game_word' && (
          <WordScrambleGame
            language={language}
            onBack={() => setCurrentView('kiosk')}
          />
        )}

        {currentView === 'game_math' && (
          <MathMazeGame
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
