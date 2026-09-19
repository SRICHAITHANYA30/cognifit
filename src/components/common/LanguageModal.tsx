import React from 'react';
import { Globe, Check, X } from 'lucide-react';
import type { Language } from '../../types';
import { LANGUAGES } from '../../locales/languages';

interface Props {
  currentLanguage: Language;
  onSelect: (language: Language) => void;
  onClose: () => void;
}

export const LanguageModal: React.FC<Props> = ({ currentLanguage, onSelect, onClose }) => {
  return (
    <div className="pin-modal-overlay">
      <div className="pin-modal-box" style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Globe size={42} style={{ color: 'var(--primary-emerald)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Select your language
          </h3>
        </div>

        <div className="language-modal-grid">
          {LANGUAGES.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                className="language-option"
                onClick={() => {
                  onSelect(lang.code);
                  onClose();
                }}
                style={{
                  borderColor: isSelected ? 'var(--primary-emerald)' : 'var(--border-subtle)',
                  background: isSelected ? 'var(--emerald-surface)' : 'var(--bg-card)',
                  boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <span style={{ fontSize: '26px' }}>{lang.flag}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {lang.name}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {lang.nativeName}
                  </div>
                </div>
                {isSelected && (
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--primary-emerald)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={16} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;