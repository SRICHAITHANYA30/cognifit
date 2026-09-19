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

interface BambooPiece {
  id: number;
  type: 'straight' | 'curved' | 'cross' | 'corner';
  color: string;
  rotation: number;
  targetPosition: number;
}

interface BasketPattern {
  name: string;
  pieces: BambooPiece[];
  preview: string;
}

const BASKET_PATTERNS: BasketPattern[] = [
  {
    name: 'Simple Weave',
    preview: '┌─┐\n│ │\n└─┘',
    pieces: [
      { id: 0, type: 'straight', color: '#8B7355', rotation: 0, targetPosition: 0 },
      { id: 1, type: 'straight', color: '#8B7355', rotation: 90, targetPosition: 1 },
      { id: 2, type: 'straight', color: '#8B7355', rotation: 0, targetPosition: 2 },
      { id: 3, type: 'straight', color: '#8B7355', rotation: 90, targetPosition: 3 },
    ],
  },
  {
    name: 'Diamond Pattern',
    preview: '  ┌┐  \n  ││  \n ┌┘└┐ \n │  │ \n └┐┌┘ \n  ││  \n  └┘  ',
    pieces: [
      { id: 0, type: 'corner', color: '#8B7355', rotation: 0, targetPosition: 0 },
      { id: 1, type: 'corner', color: '#8B7355', rotation: 90, targetPosition: 1 },
      { id: 2, type: 'corner', color: '#8B7355', rotation: 180, targetPosition: 2 },
      { id: 3, type: 'corner', color: '#8B7355', rotation: 270, targetPosition: 3 },
      { id: 4, type: 'straight', color: '#8B7355', rotation: 0, targetPosition: 4 },
      { id: 5, type: 'straight', color: '#8B7355', rotation: 90, targetPosition: 5 },
    ],
  },
  {
    name: 'Traditional Jaapi',
    preview: '   ╱╲   \n  ╱┌┐╲  \n ╱ ││ ╲ \n│  └┘  │\n ╲      ╱\n  ╲____╱ ',
    pieces: [
      { id: 0, type: 'curved', color: '#8B7355', rotation: 0, targetPosition: 0 },
      { id: 1, type: 'curved', color: '#8B7355', rotation: 90, targetPosition: 1 },
      { id: 2, type: 'curved', color: '#8B7355', rotation: 180, targetPosition: 2 },
      { id: 3, type: 'curved', color: '#8B7355', rotation: 270, targetPosition: 3 },
      { id: 4, type: 'cross', color: '#8B7355', rotation: 0, targetPosition: 4 },
      { id: 5, type: 'cross', color: '#8B7355', rotation: 45, targetPosition: 5 },
      { id: 6, type: 'straight', color: '#8B7355', rotation: 0, targetPosition: 6 },
      { id: 7, type: 'straight', color: '#8B7355', rotation: 90, targetPosition: 7 },
    ],
  },
];

const PIECE_ICONS: Record<string, string> = {
  straight: '═',
  curved: '╱',
  cross: '╳',
  corner: '┌',
};

const PIECE_LABELS_EN: Record<string, string> = {
  straight: 'Straight Bamboo',
  curved: 'Curved Bamboo',
  cross: 'Cross Weave',
  corner: 'Corner Joint',
};

const PIECE_LABELS_AS: Record<string, string> = {
  straight: 'সিঁজুলি বাঁহ',
  curved: 'বাঁকো বাঁহ',
  cross: 'ক্রষ্ট বুনি',
  corner: 'কণৰ সংযোগ',
};

const PIECE_LABELS_BN: Record<string, string> = {
  straight: 'সরল বাঁশ',
  curved: 'বাঁকানো বাঁশ',
  cross: 'ক্রস বুনন',
  corner: 'কোণাঙ্কুর সংযোগ',
};

export const BambooBasketGame: React.FC<Props> = ({ language, onBack }) => {
  const t = translations[language];
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [placedPieces, setPlacedPieces] = useState<(BambooPiece | null)[]>([]);
  const [availablePieces, setAvailablePieces] = useState<BambooPiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [patternsCompleted, setPatternsCompleted] = useState(0);
  const [adaptiveParams, setAdaptiveParams] = useState(() => adaptiveEngine.calculateAdaptiveParameters('bamboo_basket'));
  const coins = useCoins('bamboo_basket');

  const startTimeRef = useRef<number>(Date.now());
  const attemptsRef = useRef<number>(0);
  const streakRef = useRef<number>(0);
  const correctPlacementsRef = useRef<number>(0);

  const currentPattern = BASKET_PATTERNS[currentPatternIndex];
  const maxPatterns = adaptiveParams.currentLevel <= 2 ? 1 : adaptiveParams.currentLevel <= 4 ? 2 : 3;

  const handleBackWithActivity = () => {
    if (patternsCompleted > 0 || attemptsRef.current > 0) {
      const latency = Date.now() - startTimeRef.current;
      const accuracy = patternsCompleted > 0 ? 1.0 : Math.max(0.3, 1 - (attemptsRef.current) * 0.1);
      const profile = db.getPatientProfile();
      const gameTitle = GAME_TITLES.bamboo_basket[language as keyof typeof GAME_TITLES.bamboo_basket] || GAME_TITLES.bamboo_basket.en;
      db.recordActivity({
        timestamp: Date.now(),
        gameType: 'bamboo_basket',
        gameTitle,
        difficultyLevel: adaptiveParams.currentLevel,
        score,
        maxPossibleScore: maxPatterns * 10,
        durationMs: latency,
        mistakesCount: attemptsRef.current,
        accuracy,
        completedSuccessfully: patternsCompleted > 0,
        patientId: profile.id,
        patientName: profile.name,
        coinsEarned: coins.getSessionCoins(),
        correctAnswers: correctPlacementsRef.current,
        wrongAnswers: Math.max(0, attemptsRef.current - correctPlacementsRef.current),
      });
    }
    coins.commit();
    onBack();
  };

  const getPieceLabel = (type: string): string => {
    switch (language) {
      case 'as':
        return PIECE_LABELS_AS[type] || type;
      case 'bn':
        return PIECE_LABELS_BN[type] || type;
      default:
        return PIECE_LABELS_EN[type] || type;
    }
  };

  const initGame = () => {
    startTimeRef.current = Date.now();
    attemptsRef.current = 0;
    streakRef.current = 0;
    correctPlacementsRef.current = 0;
    coins.reset();
    setScore(0);
    setIsComplete(false);
    setShowPreview(false);
    setCurrentPatternIndex(0);
    loadPattern(0);
  };

  const loadPattern = (patternIndex: number) => {
    const pattern = BASKET_PATTERNS[patternIndex];
    const gridSize = pattern.pieces.length;
    
    setPlacedPieces(new Array(gridSize).fill(null));
    setAvailablePieces([...pattern.pieces].sort(() => Math.random() - 0.5));
    setSelectedPieceId(null);
    setShowPreview(false);
    setIsComplete(false);

    const promptText = language === 'as'
      ? `নতুন বাঁহ টোকৰি: ${pattern.name}. টুকৰাবোৰ সাজাওক।`
      : `New basket pattern: ${pattern.name}. Arrange the pieces.`;
    audioEngine.speakPrompt(promptText, language);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handlePieceSelect = (pieceId: number) => {
    if (isComplete) return;
    audioEngine.playDholBeat('khei');
    setSelectedPieceId(pieceId);
  };

  const handleSlotClick = (slotIndex: number) => {
    if (isComplete || selectedPieceId === null) return;
    if (placedPieces[slotIndex] !== null) return;

    const piece = availablePieces.find(p => p.id === selectedPieceId);
    if (!piece) return;

    const isCorrectPosition = piece.targetPosition === slotIndex;
    attemptsRef.current++;

    if (isCorrectPosition) {
      // Correct placement
      const newPlaced = [...placedPieces];
      newPlaced[slotIndex] = piece;
      setPlacedPieces(newPlaced);
      
      const newAvailable = availablePieces.filter(p => p.id !== selectedPieceId);
      setAvailablePieces(newAvailable);
      setSelectedPieceId(null);
      
      setScore(prev => prev + 10);
      streakRef.current++;
      correctPlacementsRef.current++;
      coins.recordAnswer(true);
      audioEngine.playSuccessChime();
      confetti({ particleCount: 20, spread: 30, origin: { y: 0.7 } });
      
      const encouragement = language === 'as' ? t.wellDone : 'Correct! Well done!';
      audioEngine.speakPrompt(encouragement, language);

      // Check if pattern complete
      if (newPlaced.every(p => p !== null)) {
        setIsComplete(true);
        handlePatternComplete();
      }
    } else {
      // Incorrect placement
      streakRef.current = 0;
      coins.recordAnswer(false);
      audioEngine.playSoftGuidance();
      const encouragement = language === 'as' ? t.gentleEncouragement : 'Not quite, try again gently';
      audioEngine.speakPrompt(encouragement, language);
    }
  };

  const handlePatternComplete = () => {
    const latency = Date.now() - startTimeRef.current;
    const accuracy = Math.max(0.3, 1 - (attemptsRef.current - currentPattern.pieces.length) * 0.1);
    
    const telemetryRecord = db.recordTelemetry({
      timestamp: Date.now(),
      gameType: 'bamboo_basket',
      difficultyLevel: adaptiveParams.currentLevel,
      decisionLatencyMs: latency,
      motorLatencyMs: Math.min(latency, 800),
      accuracy: Math.min(1, accuracy),
      tremorHesitationCount: Math.max(0, attemptsRef.current - currentPattern.pieces.length),
      completedSuccessfully: true,
    });

    const updatedParams = adaptiveEngine.processTelemetry(telemetryRecord);
    setAdaptiveParams(updatedParams);
    
    setPatternsCompleted(prev => prev + 1);

    // Check if all patterns for this level are done
    if (currentPatternIndex >= maxPatterns - 1) {
      // Record activity for caregiver dashboard when all patterns complete
      const profile = db.getPatientProfile();
      const gameTitle = GAME_TITLES.bamboo_basket[language as keyof typeof GAME_TITLES.bamboo_basket] || GAME_TITLES.bamboo_basket.en;
      db.recordActivity({
        timestamp: Date.now(),
        gameType: 'bamboo_basket',
        gameTitle,
        difficultyLevel: adaptiveParams.currentLevel,
        score,
        maxPossibleScore: maxPatterns * 10,
        durationMs: latency,
        mistakesCount: attemptsRef.current,
        accuracy,
        completedSuccessfully: true,
        patientId: profile.id,
        patientName: profile.name,
        coinsEarned: coins.getSessionCoins(),
        correctAnswers: correctPlacementsRef.current,
        wrongAnswers: Math.max(0, attemptsRef.current - correctPlacementsRef.current),
      });
      coins.commit();
      
      setTimeout(() => {
        confetti({ particleCount: 60, spread: 70 });
        audioEngine.speakPrompt(t.wellDone, language);
      }, 500);
    } else {
      setTimeout(() => {
        const nextIndex = currentPatternIndex + 1;
        setCurrentPatternIndex(nextIndex);
        loadPattern(nextIndex);
      }, 1500);
    }
  };

  const handlePlayAgain = () => {
    initGame();
  };

  const handleNextPattern = () => {
    if (currentPatternIndex < maxPatterns - 1) {
      const nextIndex = currentPatternIndex + 1;
      setCurrentPatternIndex(nextIndex);
      loadPattern(nextIndex);
    }
  };

  const handlePreviewToggle = () => {
    setShowPreview(prev => !prev);
    audioEngine.playDholBeat('khei');
  };

  const progress = ((currentPatternIndex) / maxPatterns) * 100;
  const currentProgress = ((placedPieces.filter(p => p !== null).length) / currentPattern.pieces.length) * 100;

  useEffect(() => {
    gameVoiceBridge.register('bamboo_basket', {
      start: initGame,
      next: handleNextPattern,
      repeat: () => {
        const promptText = language === 'as'
          ? `নতুন বাঁহ টোকৰি: ${currentPattern.name}. টুকৰাবোৰ সাজাওক।`
          : `New basket pattern: ${currentPattern.name}. Arrange the pieces.`;
        audioEngine.speakPrompt(promptText, language);
      },
      stop: handleBackWithActivity,
      readScore: () => {
        const pts = score;
        audioEngine.speakPrompt(
          language === 'as' ? `আপোনাৰ স্কোৰ ${pts}` : `Your score is ${pts}`,
          language
        );
      },
    });
    return () => gameVoiceBridge.unregister('bamboo_basket');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPatternIndex, currentPattern, score, language, onBack]);

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
          <div className="status-pill">
            <span>{t.movesCount}: {attemptsRef.current}</span>
          </div>
          <CoinPill sessionCoins={coins.sessionCoins} label={t.coinsLabel} />
        </div>

        <div title={t.avatarEdit} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--emerald-surface)', border: '2px solid var(--emerald-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PatientAvatar config={db.getAvatar()} size={42} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '0 16px' }}>
        {/* Game Title & Progress */}
        <div style={{ textAlign: 'center', maxWidth: '520px', width: '100%' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#064e3b', marginBottom: '6px' }}>
            {t.game7Title || 'Bamboo Basket Builder'}
          </h2>
          <p style={{ fontSize: '16px', color: '#475569', fontWeight: 600 }}>
            {t.game7Subtitle || 'Weave traditional bamboo baskets by arranging pieces in sequence'}
          </p>
          
          {/* Overall Progress */}
          <div style={{ marginTop: '12px', width: '100%', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>
              <span>{t.game7PatternProgress || 'Pattern'}: {currentPatternIndex + 1} / {maxPatterns}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${progress}%`, 
                background: '#10b981',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '600px' }}>
          
          {/* Target Pattern Preview */}
          <div style={{
            background: showPreview ? '#f0fdf4' : '#f8fafc',
            border: `2px solid ${showPreview ? '#10b981' : '#cbd5e1'}`,
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#064e3b' }}>
                {currentPattern.name}
              </h3>
              <button
                className="btn-game-play"
                style={{ minHeight: '40px', padding: '0 16px', fontSize: '14px' }}
                onClick={handlePreviewToggle}
              >
                <Sparkles size={18} />
                <span>{showPreview ? (language === 'as' ? 'লুকাবক' : 'Hide') : (language === 'as' ? 'দেখাওক' : 'Show')}</span>
              </button>
            </div>
            
            <div style={{
              fontFamily: 'monospace',
              fontSize: showPreview ? '18px' : '24px',
              lineHeight: 1.4,
              color: showPreview ? '#065f46' : '#94a3b8',
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              minHeight: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {showPreview ? currentPattern.preview : (language === 'as' ? 'টোকৰিৰ নকশা দেখিবলৈ চুই দিয়ক' : 'Tap to reveal basket pattern')}
            </div>
            
            {/* Current pattern progress */}
            <div style={{ marginTop: '12px', width: '100%', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px', color: '#475569' }}>
                <span>{language === 'as' ? 'পূৰ্ণতা' : 'Completion'}</span>
                <span>{Math.round(currentProgress)}%</span>
              </div>
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${currentProgress}%`, 
                  background: currentProgress === 100 ? '#10b981' : '#3b82f6',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Available Pieces */}
          <div style={{ width: '100%' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#334155', marginBottom: '12px', textAlign: 'center' }}>
              {language === 'as' ? 'বাঁহৰ টুকৰাবোৰ' : 'Bamboo Pieces'}
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              minHeight: '100px',
            }}>
              {availablePieces.map((piece) => (
                <button
                  key={piece.id}
                  onClick={() => handlePieceSelect(piece.id)}
                  disabled={isComplete}
                  style={{
                    minWidth: '90px',
                    minHeight: '90px',
                    padding: '12px',
                    borderRadius: '16px',
                    border: `3px solid ${selectedPieceId === piece.id ? '#10b981' : '#cbd5e1'}`,
                    background: selectedPieceId === piece.id ? '#ecfdf5' : '#fffbeb',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isComplete ? 'default' : 'pointer',
                    boxShadow: selectedPieceId === piece.id ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                    transform: selectedPieceId === piece.id ? 'scale(1.05)' : 'none',
                  }}
                >
                  <span style={{ 
                    fontSize: '36px', 
                    lineHeight: 1,
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    color: piece.color,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    {PIECE_ICONS[piece.type]}
                  </span>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    color: '#334155', 
                    marginTop: '6px',
                    textAlign: 'center',
                    maxWidth: '80px'
                  }}>
                    {getPieceLabel(piece.type)}
                  </span>
                </button>
              ))}
              
              {availablePieces.length === 0 && !isComplete && (
                <div style={{ 
                  width: '100%', 
                  textAlign: 'center', 
                  color: '#10b981', 
                  fontWeight: 700,
                  padding: '20px',
                  fontSize: '16px'
                }}>
                  {language === 'as' ? 'সকলো টুকৰা সঠিকত চিনিছে!' : 'All pieces placed correctly!'}
                </div>
              )}
            </div>
          </div>

          {/* Basket Grid / Slots */}
          <div style={{ width: '100%' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#334155', marginBottom: '12px', textAlign: 'center' }}>
              {language === 'as' ? 'টোকৰিৰ কাঠামো' : 'Basket Structure'}
            </h3>
            <div className="bamboo-slots-grid" style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(currentPattern.pieces.length, 4)}, 1fr)`,
              gap: '12px',
              justifyContent: 'center',
              maxWidth: '480px',
              margin: '0 auto',
            }}>
              {currentPattern.pieces.map((_targetPiece, slotIndex) => {
                const placedPiece = placedPieces[slotIndex];
                const isCorrect = placedPiece !== null;
                
                return (
                  <button
                    key={slotIndex}
                    onClick={() => handleSlotClick(slotIndex)}
                    disabled={isComplete || isCorrect}
                    style={{
                      minHeight: '90px',
                      height: '100px',
                      borderRadius: '16px',
                      border: isCorrect 
                        ? '3px solid #10b981' 
                        : selectedPieceId !== null && placedPiece === null 
                          ? '3px dashed #3b82f6' 
                          : '3px solid #cbd5e1',
                      background: isCorrect 
                        ? '#ecfdf5' 
                        : selectedPieceId !== null && placedPiece === null
                          ? '#eff6ff'
                          : '#f1f5f9',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: (isComplete || isCorrect) ? 'default' : 'pointer',
                      boxShadow: selectedPieceId !== null && !isCorrect ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      transform: selectedPieceId !== null && !isCorrect ? 'scale(1.02)' : 'none',
                    }}
                  >
                    {isCorrect && placedPiece ? (
                      <>
                        <span style={{ 
                          fontSize: '36px', 
                          lineHeight: 1,
                          fontFamily: 'monospace',
                          fontWeight: 900,
                          color: placedPiece.color,
                        }}>
                          {PIECE_ICONS[placedPiece.type]}
                        </span>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          color: '#065f46', 
                          marginTop: '6px'
                        }}>
                          {getPieceLabel(placedPiece.type)}
                        </span>
                        <CheckCircle2 size={18} style={{ color: '#10b981', marginTop: '4px' }} />
                      </>
                    ) : (
                      <span style={{ 
                        fontSize: '28px', 
                        color: '#94a3b8',
                        fontFamily: 'monospace'
                      }}>
                        {'▢'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Friendly Avatar */}
          <div style={{ 
            textAlign: 'center', 
            padding: '16px',
            background: '#fffbeb',
            borderRadius: '16px',
            border: '2px solid #f59e0b',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🧺</div>
            <p style={{ 
              fontSize: '14px', 
              color: '#92400e', 
              fontWeight: 600,
              fontStyle: 'italic'
            }}>
              {language === 'as' 
                ? 'বুঢ়া বাঁহ মিৰি: "ধৈৰ্য্য ধৰক, সুন্দৰ টোকৰি বুনিব পাব!"' 
                : 'Elder Bamboo Weaver: "Be patient, a beautiful basket will emerge!"'}
            </p>
          </div>

          {/* Victory / Complete Card */}
          {isComplete && (
            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              background: '#ecfdf5',
              border: '2px solid #10b981',
              borderRadius: '20px',
              padding: '24px 32px',
              maxWidth: '480px',
              width: '100%',
              animation: 'fadeIn 0.5s ease',
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#065f46', fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
                <CheckCircle2 size={28} />
                <span>{t.wellDone}</span>
              </div>
              <p style={{ color: '#047857', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                {currentPatternIndex >= maxPatterns - 1 
                  ? (language === 'as' ? 'সকলো টোকৰি পূৰ্ণ হৈছিলে! আপুনি একজন দক্ষ বাঁহ বুনিহাঁতি!' : 'All baskets completed! You are a master bamboo weaver!')
                  : (language === 'as' ? `${currentPattern.name} পূৰ্ণ হৈছে! পৰৱৰ্তীত লগত जাওক।` : `${currentPattern.name} complete! Ready for the next.`)
                }
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {currentPatternIndex < maxPatterns - 1 ? (
                  <button
                    className="btn-game-play btn-play-emerald"
                    onClick={handleNextPattern}
                    style={{ minHeight: '60px' }}
                  >
                    <Sparkles size={22} />
                    <span>{t.nextChallenge}</span>
                  </button>
                ) : null}
                <button
                  className="btn-game-play"
                  onClick={handlePlayAgain}
                  style={{ minHeight: '60px', background: '#e2e8f0', color: '#334155' }}
                >
                  <RotateCcw size={22} />
                  <span>{t.playAgain}</span>
                </button>
              </div>

              {currentPatternIndex >= maxPatterns - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <CoinSummaryCard
                    labels={t}
                    score={score}
                    maxScore={maxPatterns * 10}
                    accuracy={correctPlacementsRef.current / Math.max(attemptsRef.current, 1)}
                    coinsEarned={correctPlacementsRef.current * 5}
                    todayCoins={coins.summary.today}
                    totalCoins={coins.summary.total}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};