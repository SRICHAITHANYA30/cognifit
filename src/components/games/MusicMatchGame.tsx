import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, RotateCcw, CheckCircle2, Music4 } from 'lucide-react';
import type { Language } from '../../types';
import { translations } from '../../locales/translations';
import { db } from '../../services/db';
import { PatientAvatar } from '../common/PatientAvatar';
import { audioEngine } from '../../services/audioEngine';
import { gameVoiceBridge } from '../../services/gameVoiceBridge';
import { adaptiveEngine } from '../../services/adaptiveEngine';
import { useCoins } from '../../hooks/useCoins';
import { CoinFlash, CoinPill, CoinSummaryCard } from '../common/CoinReward';

type SoundType = 'flute' | 'chime' | 'bird' | 'heartbeat';

interface SoundMeta {
  labelEn: string;
  labelAs: string;
  icon: string;
}

const SOUND_POOL: Record<SoundType, SoundMeta> = {
  flute: { labelEn: 'Bamboo Flute', labelAs: 'বাঁহী', icon: '🎋' },
  chime: { labelEn: 'Wind Chimes', labelAs: 'ঘণ্টা', icon: '🔔' },
  bird: { labelEn: 'Birdsong', labelAs: 'চৰাইৰ সুৰ', icon: '🕊️' },
  heartbeat: { labelEn: 'Gentle Drum', labelAs: 'কোমল ঢোল', icon: '🥁' },
};

type SoundBox = {
  uid: number;
  type: SoundType;
  variant: number;
  matched: boolean;
};

interface Props {
  language: Language;
  onBack: () => void;
}

const TOTAL_PAIRS = 2;

export const MusicMatchGame: React.FC<Props> = ({ language, onBack }) => {
  const t = translations[language] || translations['en'];
  const [boxes, setBoxes] = useState<SoundBox[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [mismatchIdx, setMismatchIdx] = useState<number | null>(null);
  const [matchesCount, setMatchesCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [adaptiveParams, setAdaptiveParams] = useState(() => adaptiveEngine.calculateAdaptiveParameters('music_match'));
  const coins = useCoins('music_match');

  const sessionStartRef = useRef<number>(Date.now());
  const roundStartRef = useRef<number>(Date.now());
  const attemptStartRef = useRef<number>(Date.now());
  const attemptsRef = useRef<number>(0);
  const correctRef = useRef<number>(0);
  const lockRef = useRef<boolean>(false);

  const buildRound = () => {
    const types: SoundType[] = ['flute', 'chime', 'bird', 'heartbeat'];
    // Pick two distinct soothing sound types for this round
    const shuffled = [...types].sort(() => 0.5 - Math.random());
    const chosen = [shuffled[0], shuffled[1]];

    const roundBoxes: SoundBox[] = [];
    chosen.forEach((type, idx) => {
      roundBoxes.push({ uid: idx * 10, type, variant: idx, matched: false });
      roundBoxes.push({ uid: idx * 10 + 1, type, variant: idx, matched: false });
    });

    setBoxes(roundBoxes.sort(() => 0.5 - Math.random()));
    setSelectedIdx(null);
    setMismatchIdx(null);
    setMatchesCount(0);
    setIsGameOver(false);
    attemptsRef.current = 0;
    correctRef.current = 0;
    roundStartRef.current = Date.now();
    attemptStartRef.current = Date.now();
    lockRef.current = false;

    audioEngine.speakPrompt(
      t.musicMatchInstruction || 'Listen to the gentle melodies and tap the two boxes that play the same sound',
      language
    );
  };

  useEffect(() => {
    buildRound();
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTap = (index: number) => {
    if (lockRef.current || isGameOver) return;
    const box = boxes[index];
    if (!box || box.matched) return;
    if (selectedIdx === index) return;

    // Play the gentle local melody for this box
    audioEngine.playRelaxingSound(box.type, box.variant);

    if (selectedIdx === null) {
      attemptStartRef.current = Date.now();
      setSelectedIdx(index);
      return;
    }

    const first = boxes[selectedIdx];
    const decisionLatency = Date.now() - attemptStartRef.current;
    const accuracy = first.type === box.type ? 1 : 0;
    attemptsRef.current += 1;
    if (accuracy === 1) correctRef.current += 1;

    const lockTime = 700;

    if (first.type === box.type) {
      // Matching gentle sounds found
      const updated = boxes.map((b, i) => (i === selectedIdx || i === index ? { ...b, matched: true } : b));
      setBoxes(updated);
      setSelectedIdx(null);
      setMismatchIdx(null);
      lockRef.current = true;
      coins.recordAnswer(true);
      audioEngine.playSuccessChime();

      const newMatched = matchesCount + 1;
      setMatchesCount(newMatched);

      const telemetryRecord = db.recordTelemetry({
        timestamp: Date.now(),
        gameType: 'music_match',
        difficultyLevel: adaptiveParams.currentLevel,
        decisionLatencyMs: decisionLatency,
        motorLatencyMs: Math.min(decisionLatency, 800),
        accuracy,
        tremorHesitationCount: 0,
        completedSuccessfully: true,
      });

      if (newMatched === TOTAL_PAIRS) {
        // Round complete!
        const duration = Date.now() - roundStartRef.current;
        setIsGameOver(true);
        setTimeout(() => audioEngine.speakPrompt(t.wellDone, language), 350);

        const profile = db.getPatientProfile();
        db.recordActivity({
          timestamp: Date.now(),
          gameType: 'music_match',
          gameTitle: translations[language]?.game8Title || 'Music Match',
          difficultyLevel: adaptiveParams.currentLevel,
          score: TOTAL_PAIRS * 10,
          maxPossibleScore: TOTAL_PAIRS * 10,
          durationMs: duration,
          mistakesCount: Math.max(0, attemptsRef.current - correctRef.current),
          accuracy: correctRef.current / Math.max(attemptsRef.current, 1),
          completedSuccessfully: true,
          patientId: profile.id,
          patientName: profile.name,
          coinsEarned: coins.getSessionCoins(),
          correctAnswers: TOTAL_PAIRS,
          wrongAnswers: Math.max(0, attemptsRef.current - correctRef.current),
        });
        coins.commit();

        const updatedParams = adaptiveEngine.processTelemetry(telemetryRecord);
        setAdaptiveParams(updatedParams);
      }
      setTimeout(() => { lockRef.current = false; }, lockTime);
    } else {
      // Different sounds - gentle retry cue, no pressure
      setSelectedIdx(null);
      setMismatchIdx(index);
      lockRef.current = true;
      coins.recordAnswer(false);
      audioEngine.playSoftGuidance();

      db.recordTelemetry({
        timestamp: Date.now(),
        gameType: 'music_match',
        difficultyLevel: adaptiveParams.currentLevel,
        decisionLatencyMs: decisionLatency,
        motorLatencyMs: Math.min(decisionLatency, 800),
        accuracy,
        tremorHesitationCount: 0,
        completedSuccessfully: false,
      });

      setTimeout(() => {
        setMismatchIdx(null);
        lockRef.current = false;
      }, lockTime);
    }
  };

  const handleStopWithActivity = () => {
    if (attemptsRef.current > 0) {
      const duration = Date.now() - sessionStartRef.current;
      const profile = db.getPatientProfile();
      db.recordActivity({
        timestamp: Date.now(),
        gameType: 'music_match',
        gameTitle: translations[language]?.game8Title || 'Music Match',
        difficultyLevel: adaptiveParams.currentLevel,
        score: matchesCount * 10,
        maxPossibleScore: TOTAL_PAIRS * 10,
        durationMs: duration,
        mistakesCount: Math.max(0, attemptsRef.current - correctRef.current),
        accuracy: correctRef.current / Math.max(attemptsRef.current, 1),
        completedSuccessfully: isGameOver,
        patientId: profile.id,
        patientName: profile.name,
        coinsEarned: coins.getSessionCoins(),
        correctAnswers: correctRef.current,
        wrongAnswers: Math.max(0, attemptsRef.current - correctRef.current),
      });
    }
    coins.commit();
    onBack();
  };

  useEffect(() => {
    gameVoiceBridge.register('music_match', {
      start: buildRound,
      next: () => {
        if (isGameOver) {
          buildRound();
          return true;
        }
        return false;
      },
      repeat: () => {
        audioEngine.speakPrompt(
          t.musicMatchInstruction || 'Listen to the gentle melodies and tap the two boxes that play the same sound',
          language
        );
      },
      stop: handleStopWithActivity,
      readScore: () => {
        const pts = matchesCount * 10;
        audioEngine.speakPrompt(
          language === 'as' ? `আপোনাৰ স্কোৰ ${pts}` : `Your score is ${pts}`,
          language
        );
      },
    });
    return () => gameVoiceBridge.unregister('music_match');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver, matchesCount, language, onBack, t]);

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
            <span>{t.matchesFound}: {matchesCount} / {TOTAL_PAIRS}</span>
          </div>
          <CoinPill sessionCoins={coins.sessionCoins} label={t.coinsLabel} />
        </div>

        <div title={t.avatarEdit} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--emerald-surface)', border: '2px solid var(--emerald-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PatientAvatar config={db.getAvatar()} size={42} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '560px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#065f46', marginBottom: '6px' }}>
            {t.game8Title}
          </h2>
          <p style={{ fontSize: '17px', color: '#475569', fontWeight: 600 }}>
            {t.musicMatchInstruction}
          </p>
        </div>

        {/* 4 Audio Boxes (2 matching pairs) */}
        <div className="music-match-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          width: '100%',
          maxWidth: '560px',
        }}>
          {boxes.map((box, idx) => {
            const meta = SOUND_POOL[box.type];
            const isSelected = selectedIdx === idx;
            const isMismatch = mismatchIdx === idx;
            const isMatched = box.matched;

            return (
              <button
                key={box.uid}
                onClick={() => handleTap(idx)}
                disabled={box.matched}
                style={{
                  minHeight: '170px',
                  borderRadius: '24px',
                  border: isMatched
                    ? '4px solid #34d399'
                    : isMismatch
                      ? '4px solid #fca5a5'
                      : isSelected
                        ? '4px solid #10b981'
                        : '3px solid #d1fae5',
                  background: isMatched
                    ? '#d1fae5'
                    : isMismatch
                      ? '#fef2f2'
                      : isSelected
                        ? '#a7f3d0'
                        : '#f0fdf4',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isMatched ? 'default' : 'pointer',
                  boxShadow: isSelected || isMatched ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isSelected ? 'scale(1.03)' : 'none',
                }}
                aria-label={isMatched ? meta.labelEn : `${meta.labelEn} - tap to listen`}
              >
                {isMatched ? (
                  <>
                    <span style={{ fontSize: '52px', lineHeight: 1 }}>{meta.icon}</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#047857', marginTop: '10px' }}>
                      {language === 'as' ? meta.labelAs : meta.labelEn}
                    </span>
                    <CheckCircle2 size={26} color="#10b981" style={{ marginTop: '8px' }} />
                  </>
                ) : (
                  <>
                    <span style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '50%',
                      background: isSelected ? '#10b981' : 'rgba(16, 185, 129, 0.12)',
                      color: isSelected ? '#ffffff' : '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.25s ease',
                    }}>
                      <Volume2 size={38} />
                    </span>
                    <span style={{ fontSize: '17px', fontWeight: 700, color: '#047857', marginTop: '12px' }}>
                      {isSelected
                        ? (language === 'as' ? 'শুনি আছে...' : 'Listening...')
                        : (language === 'as' ? 'স্পৰ্শ কৰক' : 'Tap to Listen')}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Gentle Encouragement Footnote */}
        <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600, textAlign: 'center', maxWidth: '460px' }}>
          {t.gentleEncouragement}
        </p>

        {/* Round Completed Card */}
        {isGameOver && (
          <div style={{
            marginTop: '8px',
            textAlign: 'center',
            background: '#ecfdf5',
            border: '2px solid #10b981',
            borderRadius: '20px',
            padding: '24px 32px',
            maxWidth: '480px',
            width: '100%'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#065f46', fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
              <Music4 size={28} />
              <span>{t.wellDone}</span>
            </div>
            <p style={{ color: '#047857', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
              {t.matchesFound}: {TOTAL_PAIRS} / {TOTAL_PAIRS}
            </p>

            <button
              className="btn-game-play btn-play-emerald"
              onClick={buildRound}
              style={{ minHeight: '60px' }}
            >
              <RotateCcw size={22} />
              <span>{t.playAgain}</span>
            </button>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CoinSummaryCard
                labels={t}
                score={TOTAL_PAIRS * 10}
                maxScore={TOTAL_PAIRS * 10}
                accuracy={correctRef.current / Math.max(attemptsRef.current, 1)}
                coinsEarned={TOTAL_PAIRS * 5}
                todayCoins={coins.summary.today}
                totalCoins={coins.summary.total}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};