import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import type { Language } from '../../types';
import { translations } from '../../locales/translations';
import { db } from '../../services/db';
import { audioEngine } from '../../services/audioEngine';
import { adaptiveEngine } from '../../services/adaptiveEngine';

interface Props {
  language: Language;
  onBack: () => void;
}

interface CardItem {
  uid: number;
  icon: string;
  labelEn: string;
  labelAs: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOL_POOL = [
  { icon: '🪷', labelEn: 'Lotus', labelAs: 'পদ্মফুল' },
  { icon: '🐘', labelEn: 'Elephant', labelAs: 'হাতী' },
  { icon: '☀️', labelEn: 'Sun', labelAs: 'সূৰ্য' },
  { icon: '🌿', labelEn: 'Tea Leaf', labelAs: 'চাহ পাত' },
  { icon: '🔔', labelEn: 'Bell', labelAs: 'ঘণ্টা' },
  { icon: '⭐', labelEn: 'Star', labelAs: 'তৰা' },
  { icon: '🕊️', labelEn: 'Dove', labelAs: 'কপৌ' },
  { icon: '🌾', labelEn: 'Paddy', labelAs: 'ধানৰ থোক' },
];

export const MemoryMatrixGame: React.FC<Props> = ({ language, onBack }) => {
  const t = translations[language];
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchesCount, setMatchesCount] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [adaptiveParams, setAdaptiveParams] = useState(() => adaptiveEngine.calculateAdaptiveParameters('memory_matrix'));

  const startTimeRef = useRef<number>(Date.now());
  const tremorCountRef = useRef<number>(0);

  // Pair count based on adaptive difficulty: Level 1-2: 3 pairs (6 cards), Level 3-4: 4 pairs (8 cards), Level 5: 6 pairs (12 cards)
  const pairCount = adaptiveParams.currentLevel <= 2 ? 3 : adaptiveParams.currentLevel <= 4 ? 4 : 6;

  const initGame = () => {
    startTimeRef.current = Date.now();
    tremorCountRef.current = 0;
    setFlippedIndices([]);
    setMatchesCount(0);
    setMovesCount(0);
    setIsGameOver(false);

    const selectedSymbols = SYMBOL_POOL.slice(0, pairCount);
    const cardPairs: CardItem[] = [];

    selectedSymbols.forEach((sym, idx) => {
      cardPairs.push({
        uid: idx * 2,
        icon: sym.icon,
        labelEn: sym.labelEn,
        labelAs: sym.labelAs,
        isFlipped: false,
        isMatched: false,
      });
      cardPairs.push({
        uid: (idx * 2) + 1,
        icon: sym.icon,
        labelEn: sym.labelEn,
        labelAs: sym.labelAs,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle
    setCards(cardPairs.sort(() => 0.5 - Math.random()));

    audioEngine.speakPrompt(
      language === 'as'
        ? 'কাৰ্ডবোৰ লুটিয়াই একে ফটোৰ জোৰা মিলাওক'
        : 'Flip cards and find all matching pairs',
      language
    );
  };

  useEffect(() => {
    initGame();
  }, [pairCount, language]);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    audioEngine.playDholBeat('khei');
    const newFlipped = [...flippedIndices, index];
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMovesCount(m => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.icon === secondCard.icon) {
        // Match found!
        audioEngine.playSuccessChime();
        firstCard.isMatched = true;
        secondCard.isMatched = true;
        setCards([...newCards]);
        setFlippedIndices([]);
        const updatedMatches = matchesCount + 1;
        setMatchesCount(updatedMatches);

        if (updatedMatches === pairCount) {
          // Game Completed!
          const latency = Date.now() - startTimeRef.current;
          setIsGameOver(true);
          confetti({ particleCount: 60, spread: 70 });
          audioEngine.speakPrompt(t.wellDone, language);

          const telemetryRecord = db.recordTelemetry({
            timestamp: Date.now(),
            gameType: 'memory_matrix',
            difficultyLevel: adaptiveParams.currentLevel,
            decisionLatencyMs: latency,
            motorLatencyMs: Math.min(latency, 800),
            accuracy: Math.max(0.4, Number((pairCount / Math.max(movesCount + 1, pairCount)).toFixed(2))),
            tremorHesitationCount: tremorCountRef.current,
            completedSuccessfully: true,
          });

          const updatedParams = adaptiveEngine.processTelemetry(telemetryRecord);
          setAdaptiveParams(updatedParams);
        }
      } else {
        // No match - flip back gently
        setTimeout(() => {
          firstCard.isFlipped = false;
          secondCard.isFlipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
          audioEngine.playSoftGuidance();
        }, 900);
      }
    }
  };

  return (
    <div className="game-arena-container">
      {/* Header */}
      <div className="game-arena-header">
        <button className="btn-back-kiosk" onClick={onBack}>
          <ArrowLeft size={24} />
          <span>{t.backToHome}</span>
        </button>

        <div className="game-status-pills">
          <div className="status-pill highlight">
            <span>{t.level}: {adaptiveParams.currentLevel}</span>
          </div>
          <div className="status-pill">
            <span>{t.matchesFound}: {matchesCount} / {pairCount}</span>
          </div>
          <div className="status-pill">
            <span>{t.movesCount}: {movesCount}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '520px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#064e3b', marginBottom: '6px' }}>
            {t.game2Title}
          </h2>
          <p style={{ fontSize: '16px', color: '#475569', fontWeight: 600 }}>
            {t.matrixInstruction}
          </p>
        </div>

        {/* Card Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${pairCount <= 3 ? 3 : 4}, 1fr)`,
          gap: '16px',
          width: '100%',
          maxWidth: pairCount <= 3 ? '420px' : '560px',
        }}>
          {cards.map((card, idx) => (
            <button
              key={card.uid}
              onClick={() => handleCardClick(idx)}
              disabled={card.isFlipped || card.isMatched}
              style={{
                minHeight: '100px',
                height: '110px',
                borderRadius: '20px',
                border: card.isMatched ? '3px solid #10b981' : card.isFlipped ? '3px solid #3b82f6' : '3px solid #cbd5e1',
                background: card.isMatched ? '#ecfdf5' : card.isFlipped ? '#eff6ff' : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: card.isMatched ? 'default' : 'pointer',
                boxShadow: card.isFlipped ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: card.isFlipped ? 'scale(1.02)' : 'none',
              }}
            >
              {card.isFlipped || card.isMatched ? (
                <>
                  <span style={{ fontSize: '38px', lineHeight: 1 }}>{card.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {language === 'as' ? card.labelAs : card.labelEn}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '28px', color: '#94a3b8' }}>❓</span>
              )}
            </button>
          ))}
        </div>

        {/* Victory Card */}
        {isGameOver && (
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            background: '#ecfdf5',
            border: '2px solid #10b981',
            borderRadius: '20px',
            padding: '24px 32px',
            maxWidth: '480px',
            width: '100%'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#065f46', fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
              <CheckCircle2 size={28} />
              <span>{t.wellDone}</span>
            </div>
            <p style={{ color: '#047857', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
              Completed in {movesCount} moves! Your spatial memory is sharp.
            </p>

            <button
              className="btn-game-play btn-play-emerald"
              onClick={initGame}
              style={{ minHeight: '60px' }}
            >
              <RotateCcw size={22} />
              <span>{t.playAgain}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
