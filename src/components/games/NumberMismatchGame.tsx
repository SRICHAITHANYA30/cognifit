import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
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
  number_mismatch: { en: 'Number Mismatch & Order', as: 'Number Mismatch (Numbers)' },
};

interface Props {
  language: Language;
  onBack: () => void;
}

type RoundPhase = 'find' | 'arrange' | 'done';

export interface MismatchRound {
  display: number[];
  corrected: number[];
  mismatchIndex: number;
  shuffled: number[];
}

export interface DifficultyConfig {
  count: number;
  timeSeconds: number;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffledCopy(values: number[]): number[] {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function arithmetic(start: number, step: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => start + i * step);
}

function squares(from: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => (from + i) * (from + i));
}

function fibonacci(count: number): number[] {
  const seq = [1, 2];
  while (seq.length < count) {
    seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
  }
  return seq.slice(0, count);
}

function alternating(start: number, first: number, second: number, count: number): number[] {
  const seq: number[] = [start];
  let toggle = true;
  while (seq.length < count) {
    seq.push(seq[seq.length - 1] + (toggle ? first : second));
    toggle = !toggle;
  }
  return seq;
}

// Difficulty bands by adaptive level:
// 1-2 Easy (5 numbers, obvious mismatch, 60s) · 3 Medium (6-7, 45s) ·
// 4 Hard (8-9, close values, 30s) · 5 Advanced (10-12, complex, 25s).
// Exported for offline verification harnesses; the component is the only
// production consumer.
export function configForLevel(level: number): DifficultyConfig {
  if (level <= 1) return { count: 5, timeSeconds: 60 };
  if (level === 2) return { count: 5, timeSeconds: 60 };
  if (level === 3) return { count: 6 + randInt(0, 1), timeSeconds: 45 };
  if (level === 4) return { count: 8 + randInt(0, 1), timeSeconds: 30 };
  return { count: 10 + randInt(0, 2), timeSeconds: 25 };
}

function correctSequence(level: number, count: number): number[] {
  const pick = Math.random();
  if (level <= 1) {
    return pick < 0.5
      ? arithmetic(randInt(1, 9), 1, count)
      : arithmetic(randInt(1, 5) * 2, 2, count);
  }
  if (level === 2) {
    if (pick < 0.4) return arithmetic(randInt(1, 12), randInt(1, 2), count);
    if (pick < 0.7) return arithmetic(randInt(1, 6) * 2 + 1, 2, count);
    return arithmetic(5, 5, count);
  }
  if (level === 3) {
    if (pick < 0.4) return arithmetic(randInt(2, 12), randInt(2, 3), count);
    if (pick < 0.7) return arithmetic(randInt(2, 5) * 3, 3, count);
    return arithmetic(randInt(16, 30), -randInt(1, 2), count);
  }
  if (level === 4) {
    if (pick < 0.4) return arithmetic(randInt(2, 10), randInt(4, 5), count);
    if (pick < 0.7) return squares(randInt(1, 3), count);
    return arithmetic(randInt(24, 40), -3, count);
  }
  if (pick < 0.35) return alternating(randInt(2, 9), 2, 3, count);
  if (pick < 0.65) return fibonacci(count);
  const seq = arithmetic(randInt(2, 4) * 3, randInt(6, 7), count);
  return Math.max(...seq) > 250 ? arithmetic(randInt(5, 15), 3, count) : seq;
}

function mismatchDelta(level: number): number {
  if (level <= 2) return randInt(3, 6);
  if (level === 3) return randInt(1, 3);
  return randInt(1, 2);
}

// Every round is generated fresh: pattern, mismatch position and value, and
// the arrangement shuffle all differ from round to round.
export function generateRound(level: number): MismatchRound {
  const { count } = configForLevel(level);
  const corrected = correctSequence(level, count);
  const mismatchIndex = randInt(0, count - 1);
  const delta = mismatchDelta(level);
  const correctValue = corrected[mismatchIndex];
  let wrong = correctValue + (Math.random() < 0.5 ? -delta : delta);
  if (wrong <= 0) {
    wrong = correctValue + delta;
  }
  let guard = 0;
  while (
    (wrong === corrected[mismatchIndex - 1] || wrong === corrected[mismatchIndex + 1]) &&
    guard < 12
  ) {
    wrong += wrong > correctValue ? 1 : -1;
    if (wrong <= 0) {
      wrong = correctValue + delta + guard + 2;
    }
    guard++;
  }
  const display = [...corrected];
  display[mismatchIndex] = wrong;
  let shuffled = shuffledCopy(corrected);
  if (shuffled.join(',') === corrected.join(',')) {
    shuffled = shuffledCopy(corrected);
  }
  return { display, corrected, mismatchIndex, shuffled };
}

const FIND_POINTS = 10;
const ARRANGE_POINTS = 10;
const POINTS_PER_ROUND = FIND_POINTS + ARRANGE_POINTS;

export const NumberMismatchGame: React.FC<Props> = ({ language, onBack }) => {
  const t = translations[language];
  const [roundNumber, setRoundNumber] = useState(0);
  const [round, setRound] = useState<MismatchRound>(() => generateRound(2));
  const [phase, setPhase] = useState<RoundPhase>('find');
  const [findPick, setFindPick] = useState<number | null>(null);
  const [findCorrect, setFindCorrect] = useState<boolean | null>(null);
  const [arrangePicks, setArrangePicks] = useState<number[]>([]);
  const [usedTiles, setUsedTiles] = useState<number[]>([]);
  const [arrangeMistakes, setArrangeMistakes] = useState(0);
  const [hintMsg, setHintMsg] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [perfectRounds, setPerfectRounds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(configForLevel(2).timeSeconds);
  const [adaptiveParams, setAdaptiveParams] = useState(() => adaptiveEngine.calculateAdaptiveParameters('number_mismatch'));
  const coins = useCoins('number_mismatch');

  const roundStartRef = useRef<number>(Date.now());
  const findLatencyRef = useRef<number>(0);
  const timeoutFiredRef = useRef<boolean>(false);

  const recordRoundTelemetry = (findScore: number, arrangeBonus: number, perfect: boolean, latencyMs: number) => {
    const telemetryRecord = db.recordTelemetry({
      timestamp: Date.now(),
      gameType: 'number_mismatch',
      difficultyLevel: adaptiveParams.currentLevel,
      decisionLatencyMs: latencyMs,
      motorLatencyMs: Math.min(latencyMs, 750),
      accuracy: (findScore + arrangeBonus) / POINTS_PER_ROUND,
      tremorHesitationCount: 0,
      completedSuccessfully: perfect,
    });
    const updated = adaptiveEngine.processTelemetry(telemetryRecord);
    setAdaptiveParams(updated);
  };

  const handleTimeout = () => {
    if (phase === 'done') {
      return;
    }
    // A round that never received a find tap still counts as played.
    if (findPick === null) {
      setRoundsPlayed(r => r + 1);
    }
    coins.recordAnswer(false);
    audioEngine.speakPrompt(t.numberMismatchTimeout, language);
    recordRoundTelemetry(findCorrect === true ? FIND_POINTS : 0, 0, false, Date.now() - roundStartRef.current);
    setPhase('done');
  };

  const handleFindTap = (index: number) => {
    if (phase !== 'find' || findPick !== null) {
      return;
    }
    findLatencyRef.current = Date.now() - roundStartRef.current;
    const correct = index === round.mismatchIndex;
    setFindPick(index);
    setFindCorrect(correct);
    setRoundsPlayed(r => r + 1);
    if (correct) {
      setScore(s => s + FIND_POINTS);
      audioEngine.playSuccessChime();
    } else {
      audioEngine.playSoftGuidance();
    }

    // The round always continues into the arrangement phase for practice;
    // scoring and coins settle once when the round ends.
    setPhase('arrange');
  };

  const handleArrangeTap = (value: number, tileIndex: number) => {
    if (phase !== 'arrange' || usedTiles.includes(tileIndex)) {
      return;
    }
    const expected = round.corrected[arrangePicks.length];
    if (value === expected) {
      const nextPicks = [...arrangePicks, value];
      const nextUsed = [...usedTiles, tileIndex];
      setArrangePicks(nextPicks);
      setUsedTiles(nextUsed);
      setHintMsg(null);
      audioEngine.playPepaNote(523.25, 0.25);
      if (nextPicks.length === round.corrected.length) {
        const mistakes = arrangeMistakes;
        const findScore = findCorrect === true ? FIND_POINTS : 0;
        const perfect = findCorrect === true && mistakes === 0;
        const bonus = Math.max(0, ARRANGE_POINTS - mistakes * 2);
        setScore(s => s + bonus);
        if (perfect) {
          setPerfectRounds(r => r + 1);
        }
        coins.recordAnswer(perfect);
        if (perfect) {
          audioEngine.playSuccessChime();
          confetti({ particleCount: 50, spread: 60 });
          audioEngine.speakPrompt(t.wellDone, language);
        } else {
          audioEngine.playSoftGuidance();
          audioEngine.speakPrompt(t.gentleEncouragement, language);
        }
        recordRoundTelemetry(findScore, bonus, perfect, findLatencyRef.current);
        setPhase('done');
      }
    } else {
      setArrangeMistakes(m => m + 1);
      setHintMsg(t.gentleEncouragement);
      audioEngine.playSoftGuidance();
    }
  };

  const handleNext = () => {
    const nextLevel = adaptiveParams.currentLevel;
    setRound(generateRound(nextLevel));
    setRoundNumber(n => n + 1);
    setPhase('find');
    setFindPick(null);
    setFindCorrect(null);
    setArrangePicks([]);
    setUsedTiles([]);
    setArrangeMistakes(0);
    setHintMsg(null);
    setTimeLeft(configForLevel(nextLevel).timeSeconds);
    timeoutFiredRef.current = false;
    roundStartRef.current = Date.now();
  };

  const resetSession = () => {
    setScore(0);
    setRoundsPlayed(0);
    setPerfectRounds(0);
    setRound(generateRound(adaptiveParams.currentLevel));
    setRoundNumber(0);
    setPhase('find');
    setFindPick(null);
    setFindCorrect(null);
    setArrangePicks([]);
    setUsedTiles([]);
    setArrangeMistakes(0);
    setHintMsg(null);
    setTimeLeft(configForLevel(adaptiveParams.currentLevel).timeSeconds);
    timeoutFiredRef.current = false;
    roundStartRef.current = Date.now();
  };

  const handleBackWithActivity = () => {
    if (roundsPlayed > 0) {
      const latency = Date.now() - roundStartRef.current;
      const accuracy = score / (roundsPlayed * POINTS_PER_ROUND);
      const profile = db.getPatientProfile();
      const gameTitle = GAME_TITLES.number_mismatch[language as keyof typeof GAME_TITLES.number_mismatch] || GAME_TITLES.number_mismatch.en;
      db.recordActivity({
        timestamp: Date.now(),
        gameType: 'number_mismatch',
        gameTitle,
        difficultyLevel: adaptiveParams.currentLevel,
        score,
        maxPossibleScore: roundsPlayed * POINTS_PER_ROUND,
        durationMs: latency,
        mistakesCount: roundsPlayed - perfectRounds,
        accuracy,
        completedSuccessfully: accuracy >= 0.5,
        patientId: profile.id,
        patientName: profile.name,
        coinsEarned: coins.getSessionCoins(),
        correctAnswers: perfectRounds,
        wrongAnswers: roundsPlayed - perfectRounds,
      });
    }
    coins.commit();
    onBack();
  };

  // Spoken instruction for the current phase of every round.
  useEffect(() => {
    if (phase === 'find') {
      audioEngine.speakPrompt(`${t.numberMismatchFind} ${round.display.join(', ')}`, language);
    } else if (phase === 'arrange') {
      audioEngine.speakPrompt(t.numberMismatchArrange, language);
    }
  }, [roundNumber, phase, language]);

  // Gentle per-round countdown; expiry ends the round via the watcher below.
  useEffect(() => {
    if (phase === 'done') {
      return undefined;
    }
    const id = window.setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, roundNumber]);

  // Timeout watcher (ref-guarded so a round can only time out once).
  useEffect(() => {
    if (timeLeft === 0 && phase !== 'done' && !timeoutFiredRef.current) {
      timeoutFiredRef.current = true;
      handleTimeout();
    }
  });

  useEffect(() => {
    gameVoiceBridge.register('number_mismatch', {
      start: () => {
        resetSession();
      },
      next: handleNext,
      repeat: () => {
        audioEngine.speakPrompt(
          phase === 'arrange' ? t.numberMismatchArrange : `${t.numberMismatchFind} ${round.display.join(', ')}`,
          language,
        );
      },
      stop: handleBackWithActivity,
      readScore: () => {
        const pts = score;
        audioEngine.speakPrompt(
          language === 'as' ? `আপোনাৰ স্কোৰ ${pts}` : `Your score is ${pts}`,
          language,
        );
      },
    });
    return () => gameVoiceBridge.unregister('number_mismatch');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, score, language, onBack, phase]);

  const accuracy = roundsPlayed > 0 ? score / (roundsPlayed * POINTS_PER_ROUND) : 0;

  return (
    <div className="game-arena-container">
      {coins.flash && <CoinFlash key={coins.flash.id} amount={coins.flash.amount} />}
      {/* Header */}
      <div className="game-arena-header">
        <button className="btn-back-kiosk" onClick={handleBackWithActivity}>
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
          <div
            className="status-pill"
            style={timeLeft <= 10 && phase !== 'done' ? { borderColor: '#f87171', color: '#dc2626' } : undefined}
          >
            <span>{timeLeft}s</span>
          </div>
          <CoinPill sessionCoins={coins.sessionCoins} label={t.coinsLabel} />
        </div>

        <div title={t.avatarEdit} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--emerald-surface)', border: '2px solid var(--emerald-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PatientAvatar config={db.getAvatar()} size={42} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '540px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#064e3b', marginBottom: '6px' }}>
            {t.game10Title}
          </h2>
          <p style={{ fontSize: '16px', color: '#475569', fontWeight: 600 }}>
            {phase === 'arrange' ? t.numberMismatchArrange : t.numberMismatchFind}
          </p>
        </div>

        {/* Find phase: tap the number that does not belong */}
        {phase === 'find' && (
          <div
            className="nm-find-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(84px, 1fr))',
              gap: '14px',
              width: '100%',
              maxWidth: '640px',
            }}
          >
            {round.display.map((value, idx) => (
              <button
                key={idx}
                className="btn-choice-option"
                style={{ minHeight: '88px', fontSize: '34px', fontWeight: 900 }}
                onClick={() => handleFindTap(idx)}
              >
                <span>{value}</span>
              </button>
            ))}
          </div>
        )}

        {/* Arrange phase: slots + shuffled tiles */}
        {phase !== 'find' && (
          <>
            <div
              className="nm-slots-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${round.corrected.length}, minmax(0, 1fr))`,
                gap: '8px',
                width: '100%',
                maxWidth: '640px',
              }}
              aria-label={t.numberMismatchArrange}
            >
              {round.corrected.map((value, idx) => {
                const filled = idx < arrangePicks.length;
                const revealed = phase === 'done' && !filled;
                return (
                  <div
                    key={idx}
                    style={{
                      minHeight: '64px',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      fontWeight: 900,
                      background: filled ? '#d1fae5' : revealed ? '#fef3c7' : 'var(--bg-card)',
                      border: filled
                        ? '3px solid #10b981'
                        : revealed
                          ? '3px dashed #f59e0b'
                          : '3px dashed var(--border-subtle)',
                      color: filled ? '#065f46' : revealed ? '#92400e' : 'var(--text-muted)',
                    }}
                  >
                    {filled ? arrangePicks[idx] : revealed ? value : '?'}
                  </div>
                );
              })}
            </div>

            {phase === 'arrange' && (
              <div
                className="nm-tiles-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(84px, 1fr))',
                  gap: '14px',
                  width: '100%',
                  maxWidth: '640px',
                }}
              >
                {round.shuffled.map((value, idx) => {
                  const used = usedTiles.includes(idx);
                  return (
                    <button
                      key={idx}
                      className="btn-choice-option"
                      style={{
                        minHeight: '84px',
                        fontSize: '32px',
                        fontWeight: 900,
                        opacity: used ? 0.35 : 1,
                      }}
                      onClick={() => handleArrangeTap(value, idx)}
                      disabled={used}
                    >
                      <span>{value}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {hintMsg && phase === 'arrange' && (
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#92400e' }}>{hintMsg}</p>
            )}

            {phase === 'done' && (
              <div style={{ marginTop: '4px', textAlign: 'center', width: '100%', maxWidth: '480px' }}>
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  backgroundColor: findCorrect && arrangeMistakes === 0 ? '#ecfdf5' : '#fef3c7',
                  border: `2px solid ${findCorrect && arrangeMistakes === 0 ? '#10b981' : '#f59e0b'}`,
                  marginBottom: '16px',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: findCorrect && arrangeMistakes === 0 ? '#065f46' : '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}>
                  {findCorrect && arrangeMistakes === 0 ? <CheckCircle2 size={24} /> : <Sparkles size={24} />}
                  <span>{findCorrect && arrangeMistakes === 0 ? t.wellDone : t.gentleEncouragement}</span>
                </div>

                <button
                  className="btn-game-play btn-play-emerald"
                  style={{ minHeight: '60px' }}
                  onClick={handleNext}
                >
                  <RotateCcw size={22} />
                  <span>{t.nextChallenge}</span>
                </button>
              </div>
            )}
          </>
        )}

        {roundsPlayed > 0 && (
          <CoinSummaryCard
            labels={t}
            score={score}
            maxScore={roundsPlayed * POINTS_PER_ROUND}
            accuracy={accuracy}
            coinsEarned={coins.sessionCoins}
            todayCoins={coins.summary.today + coins.sessionCoins}
            totalCoins={coins.summary.total + coins.sessionCoins}
          />
        )}
      </div>
    </div>
  );
};
