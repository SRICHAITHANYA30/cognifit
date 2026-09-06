import React from 'react';
import { Palette, Type, X, Check, Sun, Moon, Sparkles, Trees, Waves } from 'lucide-react';
import type { DisplaySettings, FontScale, Language, ThemeMode } from '../../types';
import { translations } from '../../locales/translations';

interface Props {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  settings: DisplaySettings;
  onUpdateSettings: (newSettings: DisplaySettings) => void;
}

export const DisplaySettingsModal: React.FC<Props> = ({
  language,
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const t = translations[language];
  if (!isOpen) return null;

  const themes: { id: ThemeMode; label: string; icon: React.ReactNode; bgPreview: string }[] = [
    { id: 'light', label: t.themeLight, icon: <Sun size={20} />, bgPreview: '#ffffff' },
    { id: 'dark', label: t.themeDark, icon: <Moon size={20} />, bgPreview: '#0f172a' },
    { id: 'comfort', label: t.themeComfort, icon: <Sparkles size={20} />, bgPreview: '#fef3c7' },
    { id: 'forest', label: t.themeForest, icon: <Trees size={20} />, bgPreview: '#064e3b' },
    { id: 'azure', label: t.themeAzure, icon: <Waves size={20} />, bgPreview: '#0369a1' },
  ];

  const fontScales: { id: FontScale; label: string }[] = [
    { id: 'normal', label: t.fontScaleNormal },
    { id: 'large', label: t.fontScaleLarge },
    { id: 'xlarge', label: t.fontScaleXLarge },
  ];

  const handleSelectTheme = (mode: ThemeMode) => {
    onUpdateSettings({ ...settings, theme: mode });
  };

  const handleSelectFontScale = (scale: FontScale) => {
    onUpdateSettings({ ...settings, fontScale: scale });
  };

  return (
    <div className="pin-modal-overlay">
      <div className="pin-modal-box" style={{ maxWidth: '540px', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Palette size={24} color="var(--primary-emerald)" />
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {t.displaySettingsTitle}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={24} />
          </button>
        </div>

        {/* Theme Selectors */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', display: 'block' }}>
            {t.themeTitle}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {themes.map((th) => {
              const active = settings.theme === th.id;
              return (
                <button
                  key={th.id}
                  onClick={() => handleSelectTheme(th.id)}
                  style={{
                    padding: '14px',
                    borderRadius: '16px',
                    border: active ? '3px solid var(--emerald-accent)' : '2px solid #cbd5e1',
                    background: active ? 'var(--emerald-surface)' : 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '14px',
                    boxShadow: active ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: th.bgPreview,
                    border: '1px solid #94a3b8',
                    display: 'inline-block'
                  }} />
                  <span>{th.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Scale Selectors */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Type size={18} />
            <span>{t.fontScaleTitle}</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {fontScales.map((fs) => {
              const active = settings.fontScale === fs.id;
              return (
                <button
                  key={fs.id}
                  onClick={() => handleSelectFontScale(fs.id)}
                  style={{
                    padding: '14px',
                    borderRadius: '16px',
                    border: active ? '3px solid var(--emerald-accent)' : '2px solid #cbd5e1',
                    background: active ? 'var(--emerald-surface)' : 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: fs.id === 'xlarge' ? '16px' : fs.id === 'large' ? '14px' : '13px',
                    boxShadow: active ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {fs.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Apply & Close Button */}
        <button
          className="btn-game-play btn-play-emerald"
          style={{ minHeight: '52px' }}
          onClick={onClose}
        >
          <Check size={20} />
          <span>{t.savePreferences}</span>
        </button>
      </div>
    </div>
  );
};
