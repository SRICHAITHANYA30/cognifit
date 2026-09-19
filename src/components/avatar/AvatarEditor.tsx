import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import type { AvatarConfig, AvatarGender, AvatarHair, AvatarClothing, Language } from '../../types';
import { translations } from '../../locales/translations';
import { PatientAvatar, DEFAULT_AVATAR } from '../common/PatientAvatar';
import { audioEngine } from '../../services/audioEngine';

interface Props {
  language: Language;
  initialConfig?: AvatarConfig | null;
  onSave: (config: AvatarConfig) => void;
  onClose?: () => void;
}

type AccessoryOption = 'none' | 'glasses' | 'earrings';

const CLOTHING_COLOR: Record<AvatarClothing, string> = {
  emerald: '#059669',
  maroon: '#b91c1c',
  blue: '#0284c7',
  gold: '#d97706',
};

const CLOTHING_PRESETS = [
  { value: 'emerald' as AvatarClothing, labelKey: 'avatarClothingEmerald' as const },
  { value: 'maroon' as AvatarClothing, labelKey: 'avatarClothingMaroon' as const },
  { value: 'blue' as AvatarClothing, labelKey: 'avatarClothingBlue' as const },
  { value: 'gold' as AvatarClothing, labelKey: 'avatarClothingGold' as const },
];

const normalizeHair = (c: AvatarConfig): AvatarConfig['hair'] =>
  c.gender === 'female' ? (c.hair === 'bald' ? 'bun' : c.hair) : c.hair === 'bun' ? 'short' : c.hair;

export const AvatarEditor: React.FC<Props> = ({ language, initialConfig, onSave, onClose }) => {
  const t = translations[language] || translations['en'];
  const [config, setConfig] = useState<AvatarConfig>(() =>
    initialConfig ? { ...initialConfig, hair: normalizeHair(initialConfig) } : DEFAULT_AVATAR
  );

  const preview = (patch: Partial<AvatarConfig>): AvatarConfig => {
    const merged = { ...config, ...patch };
    return { ...merged, hair: normalizeHair(merged) };
  };

  const accessoryOf = (c: AvatarConfig): AccessoryOption =>
    c.glasses ? 'glasses' : c.earrings ? 'earrings' : 'none';

  const setGender = (gender: AvatarGender) => {
    setConfig(preview({ gender }));
    audioEngine.playSoftGuidance();
  };

  const setHair = (hair: AvatarHair) => {
    setConfig(prev => ({ ...prev, hair }));
    audioEngine.playSoftGuidance();
  };

  const setClothing = (clothing: AvatarClothing) => {
    setConfig(prev => ({ ...prev, clothing }));
    audioEngine.playSoftGuidance();
  };

  const setAccessory = (accessory: AccessoryOption) => {
    setConfig(prev => ({
      ...prev,
      glasses: accessory === 'glasses',
      earrings: accessory === 'earrings',
    }));
    audioEngine.playSoftGuidance();
  };

  const handleSave = () => {
    onSave({ ...config, hair: normalizeHair(config) });
    audioEngine.playSuccessChime();
  };

  const hairOptions: { value: AvatarHair; label: string }[] =
    config.gender === 'female'
      ? [
          { value: 'short', label: t.avatarHairShort },
          { value: 'bun', label: t.avatarHairBun },
        ]
      : [
          { value: 'short', label: t.avatarHairShort },
          { value: 'bald', label: t.avatarHairBald },
        ];

  const currentAccessory = accessoryOf(config);

  return (
    <div style={{ maxWidth: '660px', margin: '0 auto' }}>
      <div className="avatar-editor-card">
        <div className="avatar-editor-header">
          <div>
            <h1 className="avatar-editor-title">{t.avatarCreateTitle}</h1>
            <p className="avatar-editor-subtitle">{t.avatarCreateSubtitle}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label={t.closeButton}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }}
            >
              <X size={26} />
            </button>
          )}
        </div>

        <div className="avatar-preview-ring">
          <PatientAvatar config={config} size={150} />
        </div>

        <div className="avatar-option-group">
          <div className="avatar-option-label">{t.avatarGenderLabel}</div>
          <div className="avatar-option-row">
            <button
              className={`avatar-option-btn ${config.gender === 'male' ? 'active' : ''}`}
              onClick={() => setGender('male')}
            >
              <PatientAvatar config={preview({ gender: 'male' })} size={40} />
              <span>{t.avatarMaleLabel}</span>
            </button>
            <button
              className={`avatar-option-btn ${config.gender === 'female' ? 'active' : ''}`}
              onClick={() => setGender('female')}
            >
              <PatientAvatar config={preview({ gender: 'female' })} size={40} />
              <span>{t.avatarFemaleLabel}</span>
            </button>
          </div>
        </div>

        <div className="avatar-option-group">
          <div className="avatar-option-label">{t.avatarHairLabel}</div>
          <div className="avatar-option-row">
            {hairOptions.map(h => (
              <button
                key={h.value}
                className={`avatar-option-btn ${config.hair === h.value ? 'active' : ''}`}
                onClick={() => setHair(h.value)}
              >
                <PatientAvatar config={preview({ hair: h.value })} size={40} />
                <span>{h.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="avatar-option-group">
          <div className="avatar-option-label">{t.avatarClothingLabel}</div>
          <div className="avatar-option-row">
            {CLOTHING_PRESETS.map(cl => (
              <button
                key={cl.value}
                className={`avatar-swatch ${config.clothing === cl.value ? 'active' : ''}`}
                onClick={() => setClothing(cl.value)}
                title={t[cl.labelKey]}
                aria-label={t[cl.labelKey]}
                style={{ background: CLOTHING_COLOR[cl.value] }}
              />
            ))}
          </div>
        </div>

        <div className="avatar-option-group">
          <div className="avatar-option-label">{t.avatarAccessoryLabel}</div>
          <div className="avatar-option-row">
            <button
              className={`avatar-option-btn ${currentAccessory === 'none' ? 'active' : ''}`}
              onClick={() => setAccessory('none')}
            >
              <PatientAvatar config={preview({ glasses: false, earrings: false })} size={40} />
              <span>{t.avatarAccessoryNone}</span>
            </button>
            <button
              className={`avatar-option-btn ${currentAccessory === 'glasses' ? 'active' : ''}`}
              onClick={() => setAccessory('glasses')}
            >
              <PatientAvatar config={preview({ glasses: true, earrings: false })} size={40} />
              <span>{t.avatarAccessoryGlasses}</span>
            </button>
            {config.gender === 'female' && (
              <button
                className={`avatar-option-btn ${currentAccessory === 'earrings' ? 'active' : ''}`}
                onClick={() => setAccessory('earrings')}
              >
                <PatientAvatar config={preview({ glasses: false, earrings: true })} size={40} />
                <span>{t.avatarAccessoryEarrings}</span>
              </button>
            )}
          </div>
        </div>

        <button
          className="btn-game-play btn-play-emerald"
          onClick={handleSave}
          style={{ minHeight: '64px', fontSize: '1.25rem', marginTop: '8px' }}
        >
          <CheckCircle2 size={26} />
          <span>{t.avatarSaveButton}</span>
        </button>
      </div>
    </div>
  );
};