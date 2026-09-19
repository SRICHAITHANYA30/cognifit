import React from 'react';
import { Globe, ArrowRight, Check } from 'lucide-react';
import type { Language } from '../../types';
import { translations } from '../../locales/translations';
import { db } from '../../services/db';
import { audioEngine } from '../../services/audioEngine';

interface Props {
  onLanguageSelect: (language: Language) => void;
  currentLanguage?: Language;
}

const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'lus', name: 'Mizo', nativeName: 'Mizo ṭawng', flag: '🇮🇳' },
  { code: 'mni', name: 'Meitei (Manipuri)', nativeName: 'মেইতেই (মণিপুরী)', flag: '🇮🇳' },
  { code: 'kha', name: 'Khasi', nativeName: 'Khasi', flag: '🇮🇳' },
  { code: 'grt', name: 'Garo', nativeName: 'Garo', flag: '🇮🇳' },
  { code: 'trp', name: 'Kokborok', nativeName: 'Kokborok', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
];

export const LanguageSelection: React.FC<Props> = ({ onLanguageSelect, currentLanguage = 'en' }) => {
  const t = translations[currentLanguage] || translations['en'];

  const handleSelect = (language: Language) => {
    db.updateLanguage(language);
    audioEngine.setLanguage(language);
    audioEngine.playSuccessChime();
    onLanguageSelect(language);
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '480px' }}>
        {/* Brand Header */}
        <div className="login-brand">
          <div className="brand-logo-icon">
            <span style={{ fontSize: '36px' }}>⚡</span>
          </div>
          <h1 className="brand-title">{t.appName}</h1>
          <p className="brand-sub">{t.appSubtitle}</p>
        </div>

        {/* Language Selection */}
        <div className="language-selection">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Globe size={48} style={{ color: 'var(--primary-emerald)', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {t.selectLanguage}
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {t.selectLanguageSubtitle}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {languages.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  className={`language-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(lang.code)}
                  style={{
                    borderColor: isSelected ? 'var(--primary-emerald)' : 'var(--border-subtle)',
                    background: isSelected ? 'var(--emerald-surface)' : 'var(--bg-card)',
                    boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '32px' }}>{lang.flag}</span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {lang.name}
                      </div>
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {lang.nativeName}
                      </div>
                    </div>
                    {isSelected && (
                      <div style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '50%', 
                        background: 'var(--primary-emerald)', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '14px'
                      }}>
                        <Check size={18} />
                      </div>
                    )}
                    {!isSelected && <ArrowRight size={24} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Offline Badge */}
          <div className="offline-badge" style={{ marginTop: '24px' }}>
            <div className="pulse-dot" />
            <span>{t.offlineBadge}</span>
          </div>
        </div>
      </div>
    </div>
  );
};