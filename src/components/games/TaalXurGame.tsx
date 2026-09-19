import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Sparkles, Volume2, RotateCcw } from 'lucide-react';
import type { Language } from '../../types';
import { translations } from '../../locales/translations';
import { db } from '../../services/db';
import { PatientAvatar } from '../common/PatientAvatar';
import { audioEngine } from '../../services/audioEngine';
import { gameVoiceBridge } from '../../services/gameVoiceBridge';
import { adaptiveEngine } from '../../services/adaptiveEngine';
import { useCoins } from '../../hooks/useCoins';
import { CoinFlash, CoinPill, CoinSummaryCard } from '../common/CoinReward';

const GAME_TITLES: Record<string, { en: string; as: string }> = {
  smriti_rong: { en: 'Photo Memory & Recall', as: 'স্মৃতি ৰং (Photo Memory)' },
  memory_matrix: { en: 'Memory Matrix', as: 'স্মৃতি মেট্ৰিক্স (Memory Matrix)' },
  taal_xur: { en: 'Taal & Reaction Speed', as: 'তাল আৰু সঁহাৰি (Taal & Reaction)' },
  muga_motif: { en: 'Pattern & Sequence', as: 'ক্ৰম আৰু চানেকি (Pattern & Sequence)' },
  word_scramble: { en: 'Word Scramble & Recall', as: 'শব্দ সাঁথৰ (Word Scramble)' },
  math_maze: { en: 'Math Maze & Logic', as: 'গণিত গোলকধাঁধা (Math Maze)' },
  bamboo_basket: { en: 'Bamboo Basket Builder', as: 'বাঁহ টোকৰি বুনোৱা (Bamboo Basket Builder)' },
};

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
  const [tapsCount, setTapsCount] = useState(0);
  const [perfectTaps, setPerfectTaps] = useState(0);
  const [goodTaps, setGoodTaps] = useState(0);
  const [ringScale, setRingScale] = useState(1.8);
  const [beatCount, setBeatCount] = useState(0);
  const [adaptiveParams, setAdaptiveParams] = useState(() => adaptiveEngine.calculateAdaptiveParameters('taal_xur'));
  const coins = useCoins('taal_xur');

  const animFrameRef = useRef<number | null>(null);
  const beatTargetTimeRef = useRef<number>(0);
  const beatIntervalMs = 1400;
  const tapRegisteredForCurrentBeatRef = useRef<boolean>(false);
  const sessionStartRef = useRef<number>(Date.now());

  const handleStopWithActivity = () => {
    if (tapsCount > 0) {
      const latency = Date.now() - sessionStartRef.current;
      const accuracy = (perfectTaps * 1.0 + goodTaps * 0.7) / tapsCount;
      const profile = db.getPatientProfile();
      const gameTitle = GAME_TITLES.taal_xur[language as keyof typeof GAME_TITLES.taal_xur] || GAME_TITLES.taal_xur.en;
      db.recordActivity({
        timestamp: Date.now(),
        gameType: 'taal_xur',
        gameTitle,
        difficultyLevel: adaptiveParams.currentLevel,
        score,
        maxPossibleScore: tapsCount * 20,
        durationMs: latency,
        mistakesCount: tapsCount - perfectTaps - goodTaps,
        accuracy,
        completedSuccessfully: accuracy >= 0.5,
        patientId: profile.id,
        patientName: profile.name,
        coinsEarned: coins.getSessionCoins(),
        correctAnswers: perfectTaps + goodTaps,
        wrongAnswers: tapsCount - perfectTaps - goodTaps,
      });
    }
    coins.commit();
    handleStop();
    onBack();
  };

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
    setTapsCount(0);
    setPerfectTaps(0);
    setGoodTaps(0);
    setFeedback(null);
    sessionStartRef.current = Date.now();
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

    setTapsCount(prev => prev + 1);

    const tolerance = adaptiveParams.rhythmToleranceMs; // ~140ms
    let accuracy = 0;

    if (timeDelta <= tolerance) {
      // Perfect tap!
      accuracy = 1.0;
      setPerfectTaps(prev => prev + 1);
      coins.recordAnswer(true);
      setScore(s => s + 20);
      setFeedback(t.perfectTiming);
      setFeedbackType('perfect');
      audioEngine.playDholBeat('khei');
      audioEngine.playPepaNote(587.33, 0.25); // D5 Pepa celebratory note
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
    } else if (timeDelta <= tolerance * 2) {
      // Good tap
      accuracy = 0.7;
      setGoodTaps(prev => prev + 1);
      coins.recordAnswer(true);
      setScore(s => s + 10);
      setFeedback(t.goodTiming);
      setFeedbackType('good');
      audioEngine.playDholBeat('dhum');
    } else {
      // Missed timing
      accuracy = 0.3;
      coins.recordAnswer(false);
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

  useEffect(() => {
    gameVoiceBridge.register('taal_xur', {
      start: handleStart,
      pause: handleStop,
      resume: handleStart,
      stop: handleStopWithActivity,
      repeat: () => {
        audioEngine.speakPrompt(
          language === 'as'
            ? 'ঢোলৰ বৃত্তটো সোঁমাজলৈ আহিলে স্পৰ্শ কৰক'
            : 'Tap the center drum when the outer ring shrinks into place',
          language
        );
      },
      readScore: () => {
        const pts = score;
        audioEngine.speakPrompt(
          language === 'as' ? `আপোনাৰ স্কোৰ ${pts}` : `Your score is ${pts}`,
          language
        );
      },
    });
    return () => gameVoiceBridge.unregister('taal_xur');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, score, language, onBack]);

  return (
    <div className="game-arena-container">
      {coins.flash && <CoinFlash key={coins.flash.id} amount={coins.flash.amount} />}
      {/* Header */}
      <div className="game-arena-header">
        <button className="btn-back-kiosk" onClick={handleStopWithActivity}>
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
          <CoinPill sessionCoins={coins.sessionCoins} label={t.coinsLabel} />
        </div>

        <div title={t.avatarEdit} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--emerald-surface)', border: '2px solid var(--emerald-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PatientAvatar config={db.getAvatar()} size={42} />
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

        {tapsCount > 0 && (
          <CoinSummaryCard
            labels={t}
            score={score}
            maxScore={tapsCount * 20}
            accuracy={(perfectTaps + goodTaps * 0.7) / tapsCount}
            coinsEarned={coins.sessionCoins}
            todayCoins={coins.summary.today + coins.sessionCoins}
            totalCoins={coins.summary.total + coins.sessionCoins}
          />
        )}
      </div>
    </div>
  );
};
