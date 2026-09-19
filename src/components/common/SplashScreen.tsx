import React, { useEffect, useRef, useState } from 'react';
import { Brain } from 'lucide-react';

interface SplashScreenProps {
  title?: string;
  subtitle?: string;
  loadingText?: string;
  durationMs?: number;
  fadeMs?: number;
  onFinish?: () => void;
}

// Full-screen startup splash for the Brainactiver app. Shows centered
// branding with a subtle loader, then fades out automatically and unmounts
// itself — no user interaction required. All visuals reuse the existing
// soft-glassmorphism tokens (see `.splash-*` in index.css).
export const SplashScreen: React.FC<SplashScreenProps> = ({
  title = 'Brainactiver',
  subtitle = 'Active Cognitive Wellness & Daily Brain Training',
  loadingText = 'Preparing your cognitive training...',
  durationMs = 1500,
  fadeMs = 450,
  onFinish,
}) => {
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);
  // onFinish identity may change every parent render; the timers below must
  // run exactly once per mount, so the latest callback is read via ref.
  const finishRef = useRef(onFinish);
  useEffect(() => {
    finishRef.current = onFinish;
  });

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setFading(true), durationMs);
    const doneTimer = window.setTimeout(() => {
      setGone(true);
      finishRef.current?.();
    }, durationMs + fadeMs);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [durationMs, fadeMs]);

  if (gone) {
    return null;
  }

  return (
    <div
      className={`splash-screen${fading ? ' fading' : ''}`}
      style={{ transitionDuration: `${fadeMs}ms` }}
      role="status"
      aria-live="polite"
      aria-label={loadingText}
    >
      <div className="splash-content">
        <div className="splash-logo" aria-hidden="true">
          <Brain size={46} color="#ffffff" strokeWidth={2.2} />
        </div>
        <h1 className="splash-title">{title}</h1>
        <p className="splash-subtitle">{subtitle}</p>
        <div className="splash-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="splash-loading-text">{loadingText}</p>
      </div>
    </div>
  );
};
