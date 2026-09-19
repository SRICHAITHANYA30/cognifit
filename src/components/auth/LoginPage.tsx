import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Shield,
  UserCheck,
  Stethoscope
} from 'lucide-react';
import type { Language, UserRole } from '../../types';
import { translations } from '../../locales/translations';
import { db } from '../../services/db';
import { audioEngine } from '../../services/audioEngine';

interface Props {
  language: Language;
  onLogin: (role: UserRole) => void;
}

export const LoginPage: React.FC<Props> = ({ language, onLogin }) => {
  const t = translations[language];
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    const greeting = language === 'as'
      ? 'নমস্কাৰ! ব্ৰেইনএক্টিভাৰত আপোনাক সুস্বাগতম। আপোনাৰ ফোন নম্বৰ আৰু পিন দি লগইন কৰক।'
      : 'Welcome to Brainactiver! Please enter your phone number and PIN to login.';
    audioEngine.speakPrompt(greeting, language);
  }, [language]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    setPhoneNumber('');
    setPin('');
    audioEngine.playSuccessChime();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhoneNumber(value.slice(0, 10));
    setPinError(false);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPin(value.slice(0, 4));
    setPinError(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPinError(false);

    if (phoneNumber.length !== 10) {
      setError(language === 'as' ? 'সঠিক ১০ অঙ্কৰ ফোন নম্বৰ লিখক' : 'Please enter a valid 10-digit phone number');
      setPinError(true);
      audioEngine.playSoftGuidance();
      return;
    }

    if (pin.length !== 4) {
      setError(language === 'as' ? '৪ অঙ্কৰ পিন লিখক' : 'Please enter a 4-digit PIN');
      setPinError(true);
      audioEngine.playSoftGuidance();
      return;
    }

    setIsLoading(true);
    
    try {
      const user = await db.loginUser(phoneNumber, pin, selectedRole);
      
      if (user) {
        db.createSession(user);
        audioEngine.playSuccessChime();
        onLogin(selectedRole);
      } else {
        setError(language === 'as' 
          ? 'ভুল ফোন নম্বৰ বা পিন। অনুগ্ৰহ কৰি পুনৰপ্ৰযাস কৰক।' 
          : 'Invalid phone number or PIN. Please try again.');
        setPinError(true);
        audioEngine.playSoftGuidance();
      }
    } catch {
      setError(language === 'as' 
        ? 'লগইন কৰিবলৈ অসমৰ্থ। অনুগ্ৰহ কৰি পুনৰপ্ৰযাস কৰক।' 
        : 'Login failed. Please try again.');
      setPinError(true);
      audioEngine.playSoftGuidance();
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { 
      role: 'patient' as UserRole, 
      icon: UserCheck, 
      title: t.patientLoginTitle, 
      subtitle: t.patientLoginSubtitle,
      color: 'emerald'
    },
    { 
      role: 'caregiver' as UserRole, 
      icon: Stethoscope, 
      title: t.caregiverLoginTitle, 
      subtitle: t.caregiverLoginSubtitle,
      color: 'amber'
    }
  ];

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand">
          <div className="brand-logo-icon">
            <span style={{ fontSize: '36px' }}>⚡</span>
          </div>
          <h1 className="brand-title">{t.appName}</h1>
          <p className="brand-sub">{t.appSubtitle}</p>
        </div>

        {/* Role Selection */}
        <div className="role-selector">
          <p className="role-selector-label">{t.selectRole}</p>
          <div className="role-options">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedRole === option.role;
              return (
                <button
                  key={option.role}
                  className={`role-option ${isSelected ? 'selected' : ''} role-${option.color}`}
                  onClick={() => handleRoleSelect(option.role)}
                  style={{ 
                    borderColor: isSelected ? `var(--${option.color}-accent)` : 'var(--border-subtle)',
                    background: isSelected ? `var(--${option.color}-surface)` : 'var(--bg-card)'
                  }}
                >
                  <div className="role-option-icon" style={{ background: isSelected ? `var(--${option.color}-accent)` : 'var(--bg-parchment)' }}>
                    <Icon size={28} style={{ color: isSelected ? 'white' : `var(--${option.color})` }} />
                  </div>
                  <div className="role-option-text">
                    <div className="role-option-title">{option.title}</div>
                    <div className="role-option-subtitle">{option.subtitle}</div>
                  </div>
                  {isSelected && <Shield size={24} style={{ color: `var(--${option.color}-accent)` }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="login-error" style={{ borderColor: pinError ? '#ef4444' : '#f59e0b' }}>
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="phoneNumber" className="input-label">
              <Phone size={18} />
              <span>{t.phoneNumberLabel}</span>
            </label>
            <input
              id="phoneNumber"
              type="tel"
              className={`input-field ${pinError && !phoneNumber ? 'error' : ''}`}
              placeholder={t.phoneNumberPlaceholder}
              value={phoneNumber}
              onChange={handlePhoneChange}
              maxLength={10}
              inputMode="numeric"
              autoComplete="tel"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="input-group">
            <label htmlFor="pin" className="input-label">
              <Lock size={18} />
              <span>{t.pinLabel}</span>
            </label>
            <div className="pin-input-wrapper">
              <input
                id="pin"
                type={showPin ? 'text' : 'password'}
                className={`input-field ${pinError ? 'error' : ''}`}
                placeholder={t.loginPinPlaceholder}
                value={pin}
                onChange={handlePinChange}
                maxLength={4}
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={isLoading}
              />
              <button
                type="button"
                className="pin-toggle"
                onClick={() => setShowPin(!showPin)}
                aria-label={showPin ? t.hidePin : t.showPin}
              >
                {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner" />
                <span>{t.loggingIn}</span>
              </>
            ) : (
              <>
                <span>{t.loginButton}</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Hint */}
        <div className="demo-credentials">
          <details>
            <summary>{t.demoCredentialsTitle}</summary>
            <div className="demo-credential-list">
              <div className="demo-credential">
                <span className="demo-role patient">{t.patientRole}</span>
                <div className="demo-details">
                  <div>{t.phoneLabel}: <strong>9435012345</strong></div>
                  <div>{t.pinLabel}: <strong>1234</strong></div>
                </div>
              </div>
              <div className="demo-credential">
                <span className="demo-role caregiver">{t.caregiverRole}</span>
                <div className="demo-details">
                  <div>{t.phoneLabel}: <strong>9435012346</strong></div>
                  <div>{t.pinLabel}: <strong>1234</strong></div>
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* Offline Badge */}
        <div className="offline-badge">
          <div className="pulse-dot" />
          <span>{t.offlineBadge}</span>
        </div>
      </div>
    </div>
  );
};