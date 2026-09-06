import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Volume2, Sparkles, Eye, CheckCircle2, RotateCcw } from 'lucide-react';
import type { Language, MemoryVaultItem } from '../../types';
import { translations } from '../../locales/translations';
import { db } from '../../services/db';
import { audioEngine } from '../../services/audioEngine';
import { adaptiveEngine } from '../../services/adaptiveEngine';

interface Props {
  language: Language;
  onBack: () => void;
}

export const SmritiRongGame: React.FC<Props> = ({ language, onBack }) => {
  const t = translations[language];
  const [vaultItems] = useState<MemoryVaultItem[]>(() => db.getMemoryVault());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [adaptiveParams, setAdaptiveParams] = useState(() => adaptiveEngine.calculateAdaptiveParameters('smriti_rong'));

  const startTimeRef = useRef<number>(Date.now());
  const tremorTapsRef = useRef<number>(0);

  const currentItem = vaultItems[currentIndex % vaultItems.length];

  // Generate multi-choice options
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    tremorTapsRef.current = 0;
    setIsRevealed(false);
    setSelectedAnswer(null);
    setIsCorrect(null);

    const correct = (language === 'as' ? currentItem.titleAssamese : currentItem.title) || currentItem.title;
    const others: string[] = vaultItems
      .filter(item => item.id !== currentItem.id)
      .map(item => (language === 'as' ? item.titleAssamese : item.title) || item.title);

    // Shuffle & limit based on adaptive difficulty (2 or 4 options)
    const count = adaptiveParams.recommendedGridSize >= 4 ? 3 : 1;
    const pool = others.sort(() => 0.5 - Math.random()).slice(0, count);
    const combined: string[] = [correct, ...pool].sort(() => 0.5 - Math.random());
    setOptions(combined);

    // Gentle verbal cue
    const promptText = language === 'as' 
      ? 'ছবিখন মন দি চাওক, এয়া কোন হয়?' 
      : 'Look closely at this picture, who or what is this?';
    audioEngine.speakPrompt(promptText, language);

  }, [currentIndex, language, adaptiveParams.recommendedGridSize]);

  const handleRevealClue = () => {
    setIsRevealed(true);
    const hint = language === 'as' 
      ? currentItem.cluesAssamese[0] 
      : currentItem.cluesEnglish[0];
    audioEngine.speakPrompt(hint, language);
  };

  const handlePlayVoice = () => {
    const audioText = language === 'as' 
      ? currentItem.audioPromptAssamese 
      : currentItem.audioPromptEnglish;
    audioEngine.speakPrompt(audioText, language);
  };

  const handleSelectOption = (option: string) => {
    if (selectedAnswer !== null) return; // Prevent double taps

    const now = Date.now();
    const latency = now - startTimeRef.current;
    const correctAnswer = language === 'as' ? currentItem.titleAssamese : currentItem.title;
    const correct = option === correctAnswer;

    setSelectedAnswer(option);
    setIsCorrect(correct);
    setIsRevealed(true);

    if (correct) {
      setScore(prev => prev + 10);
      audioEngine.playSuccessChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      const cheer = language === 'as' ? t.wellDone : 'Wonderful! That is correct!';
      audioEngine.speakPrompt(cheer, language);
    } else {
      audioEngine.playSoftGuidance();
      const encouragement = language === 'as' ? t.gentleEncouragement : "It's alright, let us try again!";
      audioEngine.speakPrompt(encouragement, language);
    }

    // Record Telemetry
    const telemetryRecord = db.recordTelemetry({
      timestamp: now,
      gameType: 'smriti_rong',
      difficultyLevel: adaptiveParams.currentLevel,
      decisionLatencyMs: latency,
      motorLatencyMs: Math.min(latency, 800),
      accuracy: correct ? 1.0 : 0.0,
      tremorHesitationCount: tremorTapsRef.current,
      completedSuccessfully: correct,
    });

    // Feed back into Adaptive ML Engine
    const updatedParams = adaptiveEngine.processTelemetry(telemetryRecord);
    setAdaptiveParams(updatedParams);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
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
            <span>{t.score}: {score}</span>
          </div>
        </div>
      </div>

      {/* Main Stage */}
      <div className="reminiscence-photo-stage">
        <h2 style={{ fontSize: '26px', fontWeight: 800, textAlign: 'center', color: '#064e3b' }}>
          {language === 'as' ? currentItem.relationshipAssamese || currentItem.titleAssamese : t.whoOrWhatIsThis}
        </h2>

        {/* Photo Frame */}
        <div className="photo-frame-wrapper">
          <img
            src={currentItem.imageUrl}
            alt={currentItem.title}
            className={`photo-frame-img ${isRevealed ? 'photo-revealed' : 'photo-blur-overlay'}`}
          />
        </div>

        {/* Audio Clue Bars */}
        <div className="audio-hint-bar">
          <button className="btn-audio-hint" onClick={handlePlayVoice}>
            <Volume2 size={24} />
            <span>{t.audioHint}</span>
          </button>
          {!isRevealed && (
            <button className="btn-reveal-hint" onClick={handleRevealClue}>
              <Eye size={24} />
              <span>{t.revealHint}</span>
            </button>
          )}
        </div>

        {/* Options */}
        <div className="options-choice-grid">
          {options.map((opt, idx) => {
            let stateClass = '';
            if (selectedAnswer !== null) {
              const correctAnswer = language === 'as' ? currentItem.titleAssamese : currentItem.title;
              if (opt === correctAnswer) stateClass = 'correct';
              else if (opt === selectedAnswer) stateClass = 'incorrect';
            }

            return (
              <button
                key={idx}
                className={`btn-choice-option ${stateClass}`}
                style={{ minHeight: `${adaptiveParams.touchTargetSizePx}px` }}
                onClick={() => handleSelectOption(opt)}
                disabled={selectedAnswer !== null}
              >
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Result & Next Action */}
        {selectedAnswer !== null && (
          <div style={{ marginTop: '24px', textAlign: 'center', width: '100%', maxWidth: '480px' }}>
            <div style={{
              padding: '16px 20px',
              borderRadius: '16px',
              backgroundColor: isCorrect ? '#ecfdf5' : '#fef3c7',
              border: `2px solid ${isCorrect ? '#10b981' : '#f59e0b'}`,
              marginBottom: '16px',
              fontSize: '18px',
              fontWeight: 800,
              color: isCorrect ? '#065f46' : '#92400e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              {isCorrect ? <CheckCircle2 size={24} /> : <Sparkles size={24} />}
              <span>{isCorrect ? t.wellDone : t.gentleEncouragement}</span>
            </div>

            <button
              className="btn-game-play btn-play-emerald"
              style={{ minHeight: '64px' }}
              onClick={handleNext}
            >
              <RotateCcw size={22} />
              <span>{t.nextChallenge}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
