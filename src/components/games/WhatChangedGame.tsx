import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Eye, Sparkles, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Language } from '../../types';
import { translations } from '../../locales/translations';
import { db } from '../../services/db';
import { PatientAvatar } from '../common/PatientAvatar';
import { audioEngine } from '../../services/audioEngine';
import { gameVoiceBridge } from '../../services/gameVoiceBridge';
import { adaptiveEngine } from '../../services/adaptiveEngine';
import { useCoins } from '../../hooks/useCoins';
import { CoinFlash, CoinPill, CoinSummaryCard } from '../common/CoinReward';

interface Props {
  language: Language;
  onBack: () => void;
}

interface SceneSlot {
  poolIdx: number;      // -1 when slot is empty or removed
  boardColor: string;
  isRemoved: boolean;   // object was removed - dashed placeholder to tap
  isChange: boolean;    // this slot is one of the answer targets
}

const OBSERVE_SECONDS = 20;
const SLOT_COUNT = 10;

// Familiar, NER-relevant objects from Assam & Northeast India
const OBJECT_POOL: { labelEn: string; labelAs: string; emoji: string }[] = [
  { labelEn: 'Kaziranga Rhino', labelAs: 'গঁড়', emoji: '🦏' },
  { labelEn: 'Elephant', labelAs: 'হাতী', emoji: '🐘' },
  { labelEn: 'Duck', labelAs: 'হাঁহ', emoji: '🦆' },
  { labelEn: 'Fish', labelAs: 'মাছ', emoji: '🐟' },
  { labelEn: 'Tea Cup', labelAs: 'চাহৰ কাপ', emoji: '🍵' },
  { labelEn: 'Bamboo', labelAs: 'বাঁহ', emoji: '🎋' },
  { labelEn: 'Banana', labelAs: 'কল', emoji: '🍌' },
  { labelEn: 'Mango', labelAs: 'আম', emoji: '🥭' },
  { labelEn: 'Rice Bowl', labelAs: 'ভাতৰ বাটি', emoji: '🍚' },
  { labelEn: 'Dhol', labelAs: 'ঢোল', emoji: '🥁' },
  { labelEn: 'Sunflower', labelAs: 'সূৰ্যমুখী ফুল', emoji: '🌻' },
  { labelEn: 'Paddy', labelAs: 'ধান', emoji: '🌾' },
  { labelEn: 'Umbrella', labelAs: 'ছাতি', emoji: '☂️' },
  { labelEn: 'Book', labelAs: 'কিতাপ', emoji: '📖' },
  { labelEn: 'Grandmother', labelAs: 'আইতা', emoji: '🧕' },
  { labelEn: 'Farmer', labelAs: 'খেতিয়ক', emoji: '👨🏽🌾' },
];

const BOARD_COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#d946ef', '#f97316', '#14b8a6', '#8b5cf6', '#0ea5e9', '#f43f5e'];

type ChangeType = 'moved' | 'removed' | 'replaced' | 'colour' | 'appeared';

const CHANGE_TYPES: ChangeType[] = ['moved', 'removed', 'replaced', 'colour', 'appeared'];

const LEVEL_CONFIG: Record<number, { objectCount: number; changeCount: number }> = {
  1: { objectCount: 6, changeCount: 1 },
  2: { objectCount: 8, changeCount: 2 },
  3: { objectCount: 10, changeCount: 3 },
  4: { objectCount: 10, changeCount: 4 },
  5: { objectCount: 10, changeCount: 5 },
};

export const WhatChangedGame: React.FC<Props> = ({ language, onBack }) => {
  const t = translations[language] || translations['en'];
  const [adaptiveParams, setAdaptiveParams] = useState(() => adaptiveEngine.calculateAdaptiveParameters('what_changed'));
  const clampedLevel = Math.min(Math.max(adaptiveParams.currentLevel, 1), 5);
  const config = useMemo(() => LEVEL_CONFIG[clampedLevel], [clampedLevel]);

  const [phase, setPhase] = useState<'start' | 'observe' | 'change' | 'done'>('start');
  const [slots, setSlots] = useState<SceneSlot[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(OBSERVE_SECONDS);
  const [foundSlots, setFoundSlots] = useState<number[]>([]);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const coins = useCoins('what_changed');

  const sessionStartRef = useRef<number>(Date.now());
  const roundStartRef = useRef<number>(Date.now());
  const changePhaseStartRef = useRef<number>(Date.now());
  const attemptsRef = useRef<number>(0);
  const lockRef = useRef<boolean>(false);

  const observeProgress = (1 - secondsLeft / OBSERVE_SECONDS) * 100;

  const buildRound = () => {
    const objectCount = config.objectCount;

    // Pick distinct familiar objects
    const shuffledPool = OBJECT_POOL.map((_, idx) => idx).sort(() => 0.5 - Math.random());
    const chosenIdx = shuffledPool.slice(0, objectCount);
    const usedColors = BOARD_COLORS.map((_, idx) => idx).sort(() => 0.5 - Math.random());

    // Original scene: objects in slots 0..objectCount-1
    const roundSlots: SceneSlot[] = Array.from({ length: SLOT_COUNT }, (_, slot) => {
      if (slot < objectCount) {
        return {
          poolIdx: chosenIdx[slot],
          boardColor: BOARD_COLORS[usedColors[slot] % BOARD_COLORS.length],
          isRemoved: false,
          isChange: false,
        };
      }
      return { poolIdx: -1, boardColor: '#e2e8f0', isRemoved: false, isChange: false };
    });

    // Apply changes one by one without reusing the same object twice
    const touchedSlots = new Set<number>();
    const tryMove = (): boolean => {
      const occupied = roundSlots.map((s, i) => (s.poolIdx >= 0 ? i : -1)).filter(i => i >= 0 && !touchedSlots.has(i));
      const empty = roundSlots.map((s, i) => (s.poolIdx === -1 && !s.isRemoved ? i : -1)).filter(i => i >= 0);
      if (occupied.length === 0 || empty.length === 0) return false;
      const i = occupied[Math.floor(Math.random() * occupied.length)];
      touchedSlots.add(i);
      const j = empty[Math.floor(Math.random() * empty.length)];
      touchedSlots.add(j);
      roundSlots[j] = { ...roundSlots[i], isChange: true };
      roundSlots[i] = { poolIdx: -1, boardColor: roundSlots[j].boardColor, isRemoved: false, isChange: false };
      return true;
    };
    const tryRemove = (): boolean => {
      const occupied = roundSlots.map((s, i) => (s.poolIdx >= 0 ? i : -1)).filter(i => i >= 0 && !touchedSlots.has(i));
      if (occupied.length === 0) return false;
      const i = occupied[Math.floor(Math.random() * occupied.length)];
      touchedSlots.add(i);
      roundSlots[i] = { poolIdx: -1, boardColor: roundSlots[i].boardColor, isRemoved: true, isChange: true };
      return true;
    };
    const tryReplace = (): boolean => {
      const occupied = roundSlots.map((s, i) => (s.poolIdx >= 0 ? i : -1)).filter(i => i >= 0 && !touchedSlots.has(i));
      if (occupied.length === 0) return false;
      const i = occupied[Math.floor(Math.random() * occupied.length)];
      touchedSlots.add(i);
      const replacement = shuffledPool[Math.floor(Math.random() * shuffledPool.length)];
      roundSlots[i] = { ...roundSlots[i], poolIdx: replacement, isChange: true };
      return true;
    };
    const tryColour = (): boolean => {
      const occupied = roundSlots.map((s, i) => (s.poolIdx >= 0 ? i : -1)).filter(i => i >= 0 && !touchedSlots.has(i));
      if (occupied.length === 0) return false;
      const i = occupied[Math.floor(Math.random() * occupied.length)];
      touchedSlots.add(i);
      const otherColor = BOARD_COLORS.find(col => col !== roundSlots[i].boardColor);
      roundSlots[i] = { ...roundSlots[i], boardColor: otherColor ?? roundSlots[i].boardColor, isChange: true };
      return true;
    };
    const tryAppear = (): boolean => {
      const empty = roundSlots.map((s, i) => (s.poolIdx === -1 && !s.isRemoved ? i : -1)).filter(i => i >= 0);
      if (empty.length === 0) return false;
      const i = empty[Math.floor(Math.random() * empty.length)];
      touchedSlots.add(i);
      roundSlots[i] = {
        poolIdx: shuffledPool[Math.floor(Math.random() * shuffledPool.length)],
        boardColor: BOARD_COLORS[Math.floor(Math.random() * BOARD_COLORS.length)],
        isRemoved: false,
        isChange: true,
      };
      return true;
    };

    const typeOrder = CHANGE_TYPES.sort(() => 0.5 - Math.random());
    const fallbacks = (['removed', 'replaced', 'colour'] as ChangeType[]).sort(() => 0.5 - Math.random());
    let produced = 0;
    let typeCursor = 0;
    let fallbackCursor = 0;
    let guard = 0;
    while (produced < config.changeCount && guard++ < 60) {
      const type = typeOrder[typeCursor % typeOrder.length];
      typeCursor += 1;
      let ok = false;
      if (type === 'moved') ok = tryMove();
      else if (type === 'removed') ok = tryRemove();
      else if (type === 'replaced') ok = tryReplace();
      else if (type === 'colour') ok = tryColour();
      else ok = tryAppear();
      if (!ok) {
        const f = fallbacks[fallbackCursor % fallbacks.length];
        fallbackCursor += 1;
        if (f === 'removed') ok = tryRemove();
        else if (f === 'replaced') ok = tryReplace();
        else ok = tryColour();
      }
      if (ok) produced += 1;
    }

    setSlots(roundSlots);
    setFoundSlots([]);
    setWrongFlash(null);
    setSecondsLeft(OBSERVE_SECONDS);
    setPhase('observe');
    attemptsRef.current = 0;
    lockRef.current = false;
    roundStartRef.current = Date.now();

    audioEngine.speakPrompt(t.whatChangedObserveInstruction, language);
  };

  useEffect(() => {
    if (phase !== 'observe') return;
    if (secondsLeft <= 0) {
      setPhase('change');
      return;
    }
    const id = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, secondsLeft]);

  useEffect(() => {
    if (phase === 'change') {
      changePhaseStartRef.current = Date.now();
      audioEngine.speakPrompt(t.whatChangedSpotInstruction, language);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishRound = () => {
    const duration = Date.now() - roundStartRef.current;
    const changeCount = config.changeCount;
    setPhase('done');
    setTimeout(() => audioEngine.speakPrompt(t.whatChangedDone, language), 350);

    const attempts = Math.max(attemptsRef.current, 1);
    const accuracy = changeCount / attempts;

    const telemetryRecord = db.recordTelemetry({
      timestamp: Date.now(),
      gameType: 'what_changed',
      difficultyLevel: clampedLevel,
      decisionLatencyMs: Date.now() - changePhaseStartRef.current,
      motorLatencyMs: Math.min(Date.now() - changePhaseStartRef.current, 800),
      accuracy,
      tremorHesitationCount: 0,
      completedSuccessfully: true,
    });

    const profile = db.getPatientProfile();
    db.recordActivity({
      timestamp: Date.now(),
      gameType: 'what_changed',
      gameTitle: translations[language]?.game9Title || 'What Changed?',
      difficultyLevel: clampedLevel,
      score: changeCount * 20,
      maxPossibleScore: changeCount * 20,
      durationMs: duration,
      mistakesCount: Math.max(0, attempts - changeCount),
      accuracy,
      completedSuccessfully: true,
      patientId: profile.id,
      patientName: profile.name,
      coinsEarned: coins.getSessionCoins(),
      correctAnswers: changeCount,
      wrongAnswers: Math.max(0, attempts - changeCount),
    });
    coins.commit();

    const updatedParams = adaptiveEngine.processTelemetry(telemetryRecord);
    setAdaptiveParams(updatedParams);
  };

  const handleTap = (slotIdx: number) => {
    if (phase !== 'change' || lockRef.current) return;
    const slot = slots[slotIdx];
    if (!slot.isChange) {
      // Gentle retry - a wrong part of the scene was tapped
      attemptsRef.current += 1;
      coins.recordAnswer(false);
      lockRef.current = true;
      setWrongFlash(slotIdx);
      audioEngine.playSoftGuidance();
      audioEngine.speakPrompt(t.whatChangedRetry, language);
      setTimeout(() => {
        setWrongFlash(null);
        lockRef.current = false;
      }, 900);
      return;
    }

    if (foundSlots.includes(slotIdx)) return;

    // Correct answer found!
    attemptsRef.current += 1;
    coins.recordAnswer(true);
    lockRef.current = true;
    const newFound = [...foundSlots, slotIdx];
    setFoundSlots(newFound);
    audioEngine.playSuccessChime();

    if (newFound.length >= config.changeCount) {
      setTimeout(() => finishRound(), 400);
      return;
    }
    audioEngine.speakPrompt(t.whatChangedCorrect, language);
    setTimeout(() => { lockRef.current = false; }, 500);
  };

  const handleStopWithActivity = () => {
    if ((attemptsRef.current > 0 || foundSlots.length > 0) && phase !== 'start') {
      const duration = Date.now() - sessionStartRef.current;
      const profile = db.getPatientProfile();
      db.recordActivity({
        timestamp: Date.now(),
        gameType: 'what_changed',
        gameTitle: translations[language]?.game9Title || 'What Changed?',
        difficultyLevel: clampedLevel,
        score: foundSlots.length * 20,
        maxPossibleScore: config.changeCount * 20,
        durationMs: duration,
        mistakesCount: Math.max(0, attemptsRef.current - foundSlots.length),
        accuracy: foundSlots.length / Math.max(attemptsRef.current, 1),
        completedSuccessfully: phase === 'done',
        patientId: profile.id,
        patientName: profile.name,
        coinsEarned: coins.getSessionCoins(),
        correctAnswers: foundSlots.length,
        wrongAnswers: Math.max(0, attemptsRef.current - foundSlots.length),
      });
    }
    coins.commit();
    onBack();
  };

  const operatorLabel = (poolIdx: number) => (language === 'as' ? OBJECT_POOL[poolIdx].labelAs : OBJECT_POOL[poolIdx].labelEn);

  useEffect(() => {
    gameVoiceBridge.register('what_changed', {
      start: buildRound,
      next: buildRound,
      repeat: () => {
        const instr = phase === 'change'
          ? t.whatChangedSpotInstruction
          : t.whatChangedObserveInstruction;
        audioEngine.speakPrompt(instr, language);
      },
      stop: handleStopWithActivity,
      readScore: () => {
        const pts = foundSlots.length * 20;
        audioEngine.speakPrompt(
          language === 'as' ? `আপোনাৰ স্কোৰ ${pts}` : `Your score is ${pts}`,
          language
        );
      },
    });
    return () => gameVoiceBridge.unregister('what_changed');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, foundSlots, language, onBack, t]);

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
            <span>{t.level}: {clampedLevel}</span>
          </div>
          <div className="status-pill">
            <span>{t.whatChangedPhaseChange}: {foundSlots.length} / {config.changeCount}</span>
          </div>
          <CoinPill sessionCoins={coins.sessionCoins} label={t.coinsLabel} />
        </div>

        <div title={t.avatarEdit} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--emerald-surface)', border: '2px solid var(--emerald-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PatientAvatar config={db.getAvatar()} size={42} />
        </div>
      </div>

      {phase === 'start' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}>
          <div style={{
            width: '110px', height: '110px', borderRadius: '50%', background: '#d1fae5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', boxShadow: 'var(--shadow-md)',
          }}>
            <Eye size={52} />
          </div>
          <div style={{ maxWidth: '520px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#065f46', marginBottom: '8px' }}>
              {t.game9Title}
            </h2>
            <p style={{ fontSize: '18px', color: '#475569', fontWeight: 600 }}>
              {t.whatChangedObserveInstruction}
            </p>
            <p style={{ fontSize: '16px', color: '#059669', fontWeight: 700, marginTop: '10px' }}>
              {t.whatChangedTapHint} · {config.changeCount}
            </p>
          </div>

          <button
            className="btn-game-play btn-play-emerald"
            onClick={buildRound}
            style={{ minHeight: '64px', fontSize: '1.2rem', maxWidth: '420px' }}
          >
            <Sparkles size={24} />
            <span>{t.tapToStart}</span>
          </button>

          <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>
            {t.gentleEncouragement}
          </p>
        </div>
      )}

      {phase !== 'start' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px' }}>
          {/* Phase Banner */}
          <div style={{
            width: '100%', maxWidth: '720px', borderRadius: '20px', padding: '18px 24px', textAlign: 'center',
            background: phase === 'observe' ? '#dbeafe' : '#d1fae5',
            border: `3px solid ${phase === 'observe' ? '#93c5fd' : '#34d399'}`,
          }}>
            {phase === 'observe' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '24px', fontWeight: 900, color: '#1e40af', marginBottom: '10px' }}>
                  <Eye size={26} />
                  <span>{t.whatChangedPhaseObserve}</span>
                  <span style={{
                    marginLeft: '6px', background: '#ffffff', border: '2px solid #93c5fd', color: '#1d4ed8',
                    borderRadius: '12px', padding: '2px 12px', fontSize: '18px',
                  }}>
                    {secondsLeft}s
                  </span>
                </div>
                <p style={{ fontSize: '16px', color: '#475569', fontWeight: 600, marginBottom: '12px' }}>
                  {t.whatChangedObserveInstruction}
                </p>
                <div style={{ height: '12px', borderRadius: '999px', background: '#ffffff', overflow: 'hidden', border: '1px solid #bfdbfe' }}>
                  <div style={{ height: '100%', width: `${observeProgress}%`, background: '#3b82f6', transition: 'width 1s linear' }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '26px', fontWeight: 900, color: '#065f46', marginBottom: '8px' }}>
                  <AlertCircle size={28} />
                  <span>{t.whatChangedPhaseChange}</span>
                </div>
                <p style={{ fontSize: '17px', color: '#047857', fontWeight: 700 }}>
                  {t.whatChangedTapHint} ({foundSlots.length} / {config.changeCount})
                </p>
              </>
            )}
          </div>

          {/* Scene Grid */}
          <div className="wc-scene-grid" style={{
            width: '100%', maxWidth: '760px',
            background: '#fffbeb',
            border: '3px solid var(--emerald-border)',
            borderRadius: '28px', padding: '24px',
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px',
          }}>
            {slots.map((slot, idx) => {
              const isFound = foundSlots.includes(idx);
              const isWrong = wrongFlash === idx;
              const hasObject = slot.poolIdx >= 0;
              const canTap = phase === 'change' && slot.isChange;

              return (
                <button
                  key={idx}
                  onClick={() => handleTap(idx)}
                  disabled={!canTap}
                  aria-label={hasObject ? operatorLabel(slot.poolIdx) : 'empty slot'}
                  style={{
                    minHeight: '104px',
                    position: 'relative',
                    borderRadius: '20px',
                    border: isFound
                      ? '4px solid #10b981'
                      : isWrong
                        ? '4px solid #fca5a5'
                        : slot.isRemoved
                          ? '3px dashed #94a3b8'
                          : hasObject
                            ? '3px solid rgba(255,255,255,0.9)'
                            : '2px dashed #d1d5db',
                    background: hasObject
                      ? slot.boardColor
                      : slot.isRemoved
                        ? '#f8fafc'
                        : '#ffffff',
                    boxShadow: isFound ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    cursor: phase === 'change' && slot.isChange ? 'pointer' : 'default',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: isFound ? 'scale(0.98)' : isWrong ? 'scale(0.97)' : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  }}
                >
                  {hasObject ? (
                    <>
                      <span style={{ fontSize: '46px', lineHeight: 1 }}>{OBJECT_POOL[slot.poolIdx].emoji}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.95)', textShadow: '0 1px 2px rgba(0,0,0,0.35)', maxWidth: '90%', lineHeight: 1.1 }}>
                        {operatorLabel(slot.poolIdx)}
                      </span>
                    </>
                  ) : slot.isRemoved ? (
                    <>
                      <span style={{ fontSize: '34px', lineHeight: 1, opacity: 0.7 }}>❓</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', maxWidth: '90%', lineHeight: 1.1 }}>
                        {t.whatChangedTapHint}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 700 }}>·</span>
                  )}

                  {isFound && (
                    <span style={{
                      position: 'absolute', top: '-8px', right: '-8px', width: '30px', height: '30px', borderRadius: '50%',
                      background: '#10b981', color: 'white', border: '2px solid white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle2 size={18} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600, textAlign: 'center', maxWidth: '480px' }}>
            {t.gentleEncouragement}
          </p>

          {/* Round Completed Card */}
          {phase === 'done' && (
            <div style={{
              textAlign: 'center', background: '#ecfdf5', border: '2px solid #10b981', borderRadius: '20px',
              padding: '22px 32px', maxWidth: '440px', width: '100%',
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#065f46', fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>
                <CheckCircle2 size={26} />
                <span>{t.whatChangedDone}</span>
              </div>
              <p style={{ color: '#047857', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                {t.whatChangedPhaseChange}: {foundSlots.length} / {config.changeCount}
              </p>
              <button className="btn-game-play btn-play-emerald" onClick={buildRound} style={{ minHeight: '60px' }}>
                <RotateCcw size={22} />
                <span>{t.playAgain}</span>
              </button>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CoinSummaryCard
                  labels={t}
                  score={config.changeCount * 20}
                  maxScore={config.changeCount * 20}
                  accuracy={config.changeCount / Math.max(attemptsRef.current, 1)}
                  coinsEarned={config.changeCount * 5}
                  todayCoins={coins.summary.today}
                  totalCoins={coins.summary.total}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};