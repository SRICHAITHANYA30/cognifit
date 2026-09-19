import React from 'react';
import type { AvatarConfig } from '../../types';

export const DEFAULT_AVATAR: AvatarConfig = {
  gender: 'male',
  hair: 'short',
  skin: 'light',
  clothing: 'emerald',
  glasses: false,
  earrings: false,
};

const CLOTHING_COLORS: Record<AvatarConfig['clothing'], string> = {
  emerald: '#059669',
  maroon: '#b91c1c',
  blue: '#0284c7',
  gold: '#d97706',
};

interface Props {
  config?: AvatarConfig | null;
  size?: number;
  style?: React.CSSProperties;
}

export const PatientAvatar: React.FC<Props> = ({ config, size = 64, style }) => {
  const c = config ?? DEFAULT_AVATAR;
  const isFemale = c.gender === 'female';
  const skin = c.skin === 'warm' ? '#dda178' : '#f6cdb4';
  const darkerSkin = c.skin === 'warm' ? '#c98a5f' : '#e2b093';
  const hair = '#b6bcc6';
  const clothing = CLOTHING_COLORS[c.clothing];
  const showEarrings = isFemale && c.earrings;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={{ display: 'block', ...style }}
      role="img"
      aria-label="patient-avatar"
    >
      {/* Body / Clothing */}
      <path
        d="M 34 74 Q 34 70 38 70 L 82 70 Q 86 70 86 74 L 86 104 Q 86 112 78 112 L 42 112 Q 34 112 34 104 Z"
        fill={clothing}
      />
      {/* Collar */}
      <path d="M 48 70 L 60 84 L 72 70 L 68 70 L 60 79 L 52 70 Z" fill="#f8fafc" opacity="0.9" />
      {/* Gamosa accent at the neck */}
      <rect x="46" y="68" width="28" height="4.5" rx="2.2" fill="#f8fafc" />
      <rect x="53" y="67.7" width="3" height="5" fill="#dc2626" />
      <rect x="64" y="67.7" width="3" height="5" fill="#dc2626" />
      {/* Ears */}
      <circle cx="38" cy="45" r="4.2" fill={skin} />
      <circle cx="82" cy="45" r="4.2" fill={skin} />
      {/* Earrings */}
      {showEarrings && (
        <>
          <circle cx="36.5" cy="52" r="2.6" fill="#d9a441" />
          <circle cx="83.5" cy="52" r="2.6" fill="#d9a441" />
        </>
      )}
      {/* Head */}
      <circle cx="60" cy="44" r="24" fill={skin} />
      {/* Hair */}
      {c.hair === 'bun' && (
        <>
          <circle cx="60" cy="12" r="9.5" fill={hair} />
          <circle cx="53" cy="12" r="2.2" fill="#e2e8f0" />
        </>
      )}
      {c.hair === 'short' && (
        <path d="M 36 46 A 24 24 0 0 1 84 46 Q 84 28 60 28 Q 36 28 36 46 Z" fill={hair} />
      )}
      {c.hair === 'bald' && (
        <path d="M 36 46 A 24 24 0 0 1 84 46 L 84 38 Q 60 22 36 38 Z" fill={hair} />
      )}
      {/* Eyebrows */}
      <path d="M 44 39 Q 50 35.5 55 39" stroke={hair} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M 65 39 Q 70 35.5 76 39" stroke={hair} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      {/* Glasses */}
      {c.glasses && (
        <g stroke="#475569" strokeWidth="2.4" fill="none">
          <circle cx="50" cy="45" r="7.2" />
          <circle cx="70" cy="45" r="7.2" />
          <path d="M 57.2 45 L 62.8 45" />
          <path d="M 42.8 43 L 37.5 41.5" />
          <path d="M 77.2 43 L 82.5 41.5" />
        </g>
      )}
      {/* Eyes */}
      <circle cx="50" cy="45" r="3" fill="#3f3f46" />
      <circle cx="70" cy="45" r="3" fill="#3f3f46" />
      {/* Cheeks */}
      <circle cx="45" cy="55" r="3.4" fill="#f8a8a8" opacity="0.45" />
      <circle cx="75" cy="55" r="3.4" fill="#f8a8a8" opacity="0.45" />
      {/* Nose */}
      <path d="M 60 50 Q 57.5 54 60.5 56" stroke={darkerSkin} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* Smile */}
      <path d="M 52 63 Q 60 69 68 63" stroke="#9a3412" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    </svg>
  );
};