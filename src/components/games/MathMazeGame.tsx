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

interface MathProblem {
  num1: number;
  num2: number;
  operator: '+' | '-' | '×';
  answer: number;
  options: number[];
  visualIcon: string;
}

const GENERATE_PROBLEMS = (): MathProblem[] => [
  { num1: 5, num2: 3, operator: '+', answer: 8, options: [7, 8, 9, 6], visualIcon: '🍎' },
  { num1: 10, num2: 4, operator: '-', answer: 6, options: [5, 6, 7, 4], visualIcon: '🪙' },
  { num1: 4, num2: 2, operator: '×', answer: 8, options: [6, 8, 10, 12], visualIcon: '🌿' },
  { num1: 12, num2: 5, operator: '+', answer: 17, options: [16, 17, 18, 15], visualIcon: '🌸' },
  { num1: 15, num2: 6, operator: '-', answer: 9, options: [8, 9, 10, 11], visualIcon: '⭐' },
  { num1: 3, num2: 3, operator: '×', answer: 9, options: [6, 8, 9, 12], visualIcon: '🪷' },
  { num1: 20, num2: 8, operator: '-', answer: 12, options: [11, 12, 13, 10], visualIcon: '🕊️' },
];

export const MathMazeGame: React.FC<Props> = ({ language, onBack }) => {
  const t = translations[language];
  const [problems] = useState<MathProblem[]>(GENERATE_PROBLEMS);
  const [problemIndex, setProblemIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [adaptiveParams, setAdaptiveParams] = useState(() => adaptiveEngine.calculateAdaptiveParameters('math_maze'));
  const coins = useCoins('math_maze');

  const startTimeRef = useRef<number>(Date.now());
  const currentProblem = problems[problemIndex % problems.length];

  const handleBackWithActivity = () => {
    if (questionsAnswered > 0) {
      const latency = Date.now() - startTimeRef.current;
      const accuracy = correctAnswers / questionsAnswered;
      const profile = db.getPatientProfile();
      const gameTitle = GAME_TITLES.math_maze[language as keyof typeof GAME_TITLES.math_maze] || GAME_TITLES.math_maze.en;
      db.recordActivity({
        timestamp: Date.now(),
        gameType: 'math_maze',
        gameTitle,
        difficultyLevel: adaptiveParams.currentLevel,
        score,
        maxPossibleScore: questionsAnswered * 10,
        durationMs: latency,
        mistakesCount: questionsAnswered - correctAnswers,
        accuracy,
        completedSuccessfully: accuracy >= 0.5,
        patientId: profile.id,
        patientName: profile.name,
        coinsEarned: coins.getSessionCoins(),
        correctAnswers,
        wrongAnswers: questionsAnswered - correctAnswers,
      });
    }
    coins.commit();
    onBack();
  };

  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedAnswer(null);
    setIsCorrect(null);

    const questionVoice = language === 'as'
      ? `${currentProblem.num1} আৰু ${currentProblem.num2} যোগ বা বিয়োগ কৰিলে কিমান হয়?`
      : `What is ${currentProblem.num1} ${currentProblem.operator} ${currentProblem.num2}?`;
    audioEngine.speakPrompt(questionVoice, language);
  }, [problemIndex, language]);

  const handleSelectOption = (option: number) => {
    if (selectedAnswer !== null) return;

    const latency = Date.now() - startTimeRef.current;
    const correct = option === currentProblem.answer;

    setSelectedAnswer(option);
    setIsCorrect(correct);
    setQuestionsAnswered(prev => prev + 1);
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
    coins.recordAnswer(correct);

    if (correct) {
      setScore(s => s + 10);
      audioEngine.playSuccessChime();
      confetti({ particleCount: 50, spread: 60 });
      audioEngine.speakPrompt(t.wellDone, language);
    } else {
      audioEngine.playSoftGuidance();
      audioEngine.speakPrompt(t.gentleEncouragement, language);
    }

    const telemetryRecord = db.recordTelemetry({
      timestamp: Date.now(),
      gameType: 'math_maze',
      difficultyLevel: adaptiveParams.currentLevel,
      decisionLatencyMs: latency,
      motorLatencyMs: Math.min(latency, 750),
      accuracy: correct ? 1.0 : 0.0,
      tremorHesitationCount: 0,
      completedSuccessfully: correct,
    });

    const updated = adaptiveEngine.processTelemetry(telemetryRecord);
    setAdaptiveParams(updated);
  };

  const handleNext = () => {
    setProblemIndex(i => i + 1);
  };

  useEffect(() => {
    gameVoiceBridge.register('math_maze', {
      start: () => {
        setProblemIndex(0);
      },
      next: handleNext,
      repeat: () => {
        const questionVoice = language === 'as'
          ? `${currentProblem.num1} আৰু ${currentProblem.num2} যোগ বা বিয়োগ কৰিলে কিমান হয়?`
          : `What is ${currentProblem.num1} ${currentProblem.operator} ${currentProblem.num2}?`;
        audioEngine.speakPrompt(questionVoice, language);
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
    return () => gameVoiceBridge.unregister('math_maze');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProblem, score, language, onBack]);

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
          <CoinPill sessionCoins={coins.sessionCoins} label={t.coinsLabel} />
        </div>

        <div title={t.avatarEdit} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--emerald-surface)', border: '2px solid var(--emerald-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PatientAvatar config={db.getAvatar()} size={42} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '540px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#064e3b', marginBottom: '6px' }}>
            {t.game6Title}
          </h2>
          <p style={{ fontSize: '16px', color: '#475569', fontWeight: 600 }}>
            {t.mathPrompt}
          </p>
        </div>

        {/* Calculation Stage Banner */}
        <div style={{
          background: '#ecfdf5',
          border: '3px solid #a7f3d0',
          borderRadius: '24px',
          padding: '32px',
          textAlign: 'center',
          maxWidth: '520px',
          width: '100%',
          boxShadow: 'var(--shadow-md)',
        }}>
          {/* Visual icon count representation */}
          <div style={{ fontSize: '32px', letterSpacing: '4px', marginBottom: '16px' }}>
            {Array.from({ length: Math.min(currentProblem.num1, 10) }).map((_, i) => (
              <span key={i}>{currentProblem.visualIcon}</span>
            ))}
          </div>

          <div className="math-equation" style={{
            fontSize: '48px',
            fontWeight: 900,
            color: '#064e3b',
            letterSpacing: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px'
          }}>
            <span>{currentProblem.num1}</span>
            <span style={{ color: '#059669' }}>{currentProblem.operator}</span>
            <span>{currentProblem.num2}</span>
            <span>=</span>
            <span style={{
              display: 'inline-block',
              minWidth: '60px',
              borderBottom: '4px solid #059669',
              color: selectedAnswer !== null ? '#047857' : '#94a3b8'
            }}>
              {selectedAnswer !== null ? selectedAnswer : '?'}
            </span>
          </div>
        </div>

        {/* Answer Choice Grid (Large 72px buttons) */}
        <div className="options-choice-grid">
          {currentProblem.options.map((opt, idx) => {
            let stateClass = '';
            if (selectedAnswer !== null) {
              if (opt === currentProblem.answer) stateClass = 'correct';
              else if (opt === selectedAnswer) stateClass = 'incorrect';
            }

            return (
              <button
                key={idx}
                className={`btn-choice-option ${stateClass}`}
                style={{
                  minHeight: '80px',
                  fontSize: '32px',
                  fontWeight: 900,
                }}
                onClick={() => handleSelectOption(opt)}
                disabled={selectedAnswer !== null}
              >
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Outcome State */}
        {selectedAnswer !== null && (
          <div style={{ marginTop: '20px', textAlign: 'center', width: '100%', maxWidth: '480px' }}>
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
              style={{ minHeight: '60px' }}
              onClick={handleNext}
            >
              <RotateCcw size={22} />
              <span>{t.nextChallenge}</span>
            </button>
          </div>
        )}

        {questionsAnswered > 0 && (
          <CoinSummaryCard
            labels={t}
            score={score}
            maxScore={questionsAnswered * 10}
            accuracy={correctAnswers / questionsAnswered}
            coinsEarned={coins.sessionCoins}
            todayCoins={coins.summary.today + coins.sessionCoins}
            totalCoins={coins.summary.total + coins.sessionCoins}
          />
        )}
      </div>
    </div>
  );
};
