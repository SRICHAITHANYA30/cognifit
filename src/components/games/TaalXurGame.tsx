import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Sparkles, Volume2, RotateCcw } from 'lucide-react';
import type { Language } from '../../types';
import { translations } from '../../locales/translations';
import { db } from '../../services/db';
import { audioEngine } from '../../services/audioEngine';
import { adaptiveEngine } from '../../services/adaptiveEngine';

interface Props {
  language: Language;
  onBack: () => void;
}

export const TaalXurGame: React.FC<Props> = ({ language, onBack }) => {
  const t = translations[language];
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'perfect' | 'good' | 'miss' | null>(null);
  const [score, setScore] = useState(0);
  const [ringScale, setRingScale] = useState(1.8);
  const [beatCount, setBeatCount] = useState(0);
  const [adaptiveParams, setAdaptiveParams] = useState(() => adaptiveEngine.calculateAdaptiveParameters('taal_xur'));

  const animFrameRef = useRef<number | null>(null);
  const beatTargetTimeRef = useRef<number>(0);
  const beatIntervalMs = 1400; // Calibrated comfortable 42-45 BPM tempo for elderly MCI motor pace
  const tapRegisteredForCurrentBeatRef = useRef<boolean>(false);

  useEffect(() => {
    // Gentle intro voice prompt
    audioEngine.speakPrompt(
      language === 'as' 
        ? 'ঢোলৰ বৃত্তটো সোঁমাজলৈ আহিলে স্পৰ্শ কৰক' 
        : 'Tap the center drum when the outer ring shrinks into place',
      language
    );
  }, [language]);

  // Rhythm loop
  useEffect(() => {
    if (!isPlaying) return;

    let startTime = performance.now();
    beatTargetTimeRef.current = startTime + beatIntervalMs;
    tapRegisteredForCurrentBeatRef.current = false;

    // Start with a foundational Dhol bass beat
    audioEngine.playDholBeat('dhum');

    const loop = (now: number) => {
      const timeUntilBeat = beatTargetTimeRef.current - now;

      if (timeUntilBeat <= 0) {
        // Target beat hit! Play sound
        const currentBeat = (beatCount + 1) % 4;
        setBeatCount(prev => prev + 1);

        if (currentBeat === 0) {
          // Downbeat - Dhol Dhum
          audioEngine.playDholBeat('dhum');
        } else if (currentBeat === 2) {
          // Sharp Pepa fanfare
          audioEngine.playPepaNote(440, 0.3);
        } else {
          audioEngine.playDholBeat('khei');
        }

        // Check if user completely missed this beat without tapping
        if (!tapRegisteredForCurrentBeatRef.current && isPlaying) {
          // Gently record slow reaction
        }

        // Schedule next beat
        beatTargetTimeRef.current = now + beatIntervalMs;
        tapRegisteredForCurrentBeatRef.current = false;
      }

      // Calculate smooth ring contraction (from 2.2 down to 1.0)
      const progress = 1 - Math.max(0, Math.min(1, (beatTargetTimeRef.current - now) / beatIntervalMs));
      const scale = 2.2 - (progress * 1.2);
      setRingScale(scale);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, beatCount]);

  const handleStart = () => {
    setIsPlaying(true);
    setScore(0);
    setFeedback(null);
  };

  const handleStop = () => {
    setIsPlaying(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  const handleDrumTap = () => {
    if (!isPlaying) {
      handleStart();
      return;
    }

    const now = performance.now();
    const timeDelta = Math.abs(beatTargetTimeRef.current - now);
    tapRegisteredForCurrentBeatRef.current = true;

    const tolerance = adaptiveParams.rhythmToleranceMs; // ~140ms
    let accuracy = 0;

    if (timeDelta <= tolerance) {
      // Perfect tap!
      accuracy = 1.0;
      setScore(s => s + 20);
      setFeedback(t.perfectTiming);
      setFeedbackType('perfect');
      audioEngine.playDholBeat('khei');
      audioEngine.playPepaNote(587.33, 0.25); // D5 Pepa celebratory note
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
    } else if (timeDelta <= tolerance * 2) {
      // Good tap
      accuracy = 0.7;
      setScore(s => s + 10);
      setFeedback(t.goodTiming);
      setFeedbackType('good');
      audioEngine.playDholBeat('dhum');
    } else {
      // Missed timing
      accuracy = 0.3;
      setFeedback(t.missedTiming);
      setFeedbackType('miss');
      audioEngine.playSoftGuidance();
    }

    // Record Telemetry
    const telemetryRecord = db.recordTelemetry({
      timestamp: Date.now(),
      gameType: 'taal_xur',
      difficultyLevel: adaptiveParams.currentLevel,
      decisionLatencyMs: Math.round(timeDelta),
      motorLatencyMs: Math.round(timeDelta * 0.7),
      accuracy: accuracy,
      tremorHesitationCount: timeDelta > tolerance * 2.5 ? 1 : 0,
      completedSuccessfully: accuracy >= 0.7,
    });

    const updatedParams = adaptiveEngine.processTelemetry(telemetryRecord);
    setAdaptiveParams(updatedParams);
  };

  return (
    <div className="game-arena-container">
      {/* Header */}
      <div className="game-arena-header">
        <button className="btn-back-kiosk" onClick={() => { handleStop(); onBack(); }}>
          <ArrowLeft size={24} />
          <span>{t.backToHome}</span>
        </button>

        <div className="game-status-pills">
          <div className="status-pill highlight">
            <span>{t.level}: {adaptiveParams.currentLevel}</span>
          </div>
          <div className="status-pill">
            <span>{t.score}: {score}</span>
          </div>
        </div>
      </div>

      <div className="rhythm-stage">
        <div style={{ textAlign: 'center', maxWidth: '540px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0369a1', marginBottom: '6px' }}>
            {t.game3Title}
          </h2>
          <p style={{ fontSize: '17px', color: '#334155', fontWeight: 600 }}>
            {t.rhythmInstructions}
          </p>
        </div>

        {/* Drum and Pulse Visualizer */}
        <div className="drum-arena-visual">
          {/* Synchronized concentric rhythm pulse ring */}
          {isPlaying && (
            <div
              className="rhythm-pulse-ring"
              style={{
                transform: `scale(${ringScale})`,
                borderColor: feedbackType === 'perfect' ? '#10b981' : '#0284c7',
                borderWidth: ringScale <= 1.1 ? '6px' : '3px',
                transition: 'border-color 0.1s ease',
              }}
            />
          )}

          {/* Central Assamese Dhol Tap Target */}
          <button
            className="dhol-center-button"
            onClick={handleDrumTap}
            aria-label="Assamese Dhol Drum"
          >
            <span style={{ fontSize: '42px', marginBottom: '4px' }}>🥁</span>
            <span style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {isPlaying ? (language === 'as' ? 'স্পৰ্শ কৰক' : 'TAP!') : (language === 'as' ? 'আৰম্ভ কৰক' : 'START')}
            </span>
          </button>
        </div>

        {/* Real-time Feedback Banner */}
        <div className="rhythm-feedback-banner">
          {feedback && (
            <span style={{
              color: feedbackType === 'perfect' ? '#059669' : feedbackType === 'good' ? '#d97706' : '#dc2626',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={24} />
              {feedback}
            </span>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', width: '100%', maxWidth: '420px' }}>
          {!isPlaying ? (
            <button
              className="btn-game-play btn-play-blue"
              onClick={handleStart}
              style={{ minHeight: '64px' }}
            >
              <Volume2 size={24} />
              <span>{language === 'as' ? 'ছন্দ আৰম্ভ কৰক 🥁' : 'Start Rhythm Beat 🥁'}</span>
            </button>
          ) : (
            <button
              className="btn-game-play"
              style={{ minHeight: '64px', background: '#e2e8f0', color: '#334155' }}
              onClick={handleStop}
            >
              <RotateCcw size={22} />
              <span>{language === 'as' ? 'বিৰতি লওক' : 'Pause Activity'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
