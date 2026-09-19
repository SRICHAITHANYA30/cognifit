import React from 'react';
import { UserCheck, Stethoscope, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Language, UserRole } from '../../types';
import { translations } from '../../locales/translations';
import { audioEngine } from '../../services/audioEngine';

interface Props {
  language: Language;
  onSelectRole: (role: UserRole) => void;
  onBack: () => void;
}

export const UserTypeSelection: React.FC<Props> = ({ language, onSelectRole, onBack }) => {
  const t = translations[language];

  const handleRoleSelect = (role: UserRole) => {
    audioEngine.playSuccessChime();
    onSelectRole(role);
  };

  const roleOptions = [
    { 
      role: 'patient' as UserRole, 
      icon: UserCheck, 
      title: t.patientLoginTitle, 
      subtitle: t.patientLoginSubtitle,
      color: 'emerald',
      description: t.patientRoleDescription
    },
    { 
      role: 'caregiver' as UserRole, 
      icon: Stethoscope, 
      title: t.caregiverLoginTitle, 
      subtitle: t.caregiverLoginSubtitle,
      color: 'amber',
      description: t.caregiverRoleDescription
    }
  ];

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '480px' }}>
        {/* Brand Header */}
        <div className="login-brand">
          <button 
            className="back-button" 
            onClick={onBack}
            aria-label={t.backToHome}
          >
            <ArrowLeft size={24} />
          </button>
          <div className="brand-logo-icon">
            <span style={{ fontSize: '36px' }}>⚡</span>
          </div>
          <h1 className="brand-title">{t.appName}</h1>
          <p className="brand-sub">{t.appSubtitle}</p>
        </div>

        {/* User Type Selection */}
        <div className="user-type-selection">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {t.selectUserType}
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {t.selectUserTypeSubtitle}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {roleOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.role}
                  className={`role-option-large role-${option.color}`}
                  onClick={() => handleRoleSelect(option.role)}
                >
                  <div className="role-option-icon-large" style={{ background: `var(--${option.color}-surface)` }}>
                    <Icon size={36} style={{ color: `var(--${option.color})` }} />
                  </div>
                  <div className="role-option-content">
                    <div className="role-option-title">{option.title}</div>
                    <div className="role-option-subtitle">{option.subtitle}</div>
                    <div className="role-option-description">{option.description}</div>
                  </div>
                  <div className="role-option-arrow">
                    <ArrowRight size={24} style={{ color: `var(--${option.color})` }} />
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