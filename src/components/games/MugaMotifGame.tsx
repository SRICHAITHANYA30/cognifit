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

interface RoutineStep {
  id: string;
  order: number;
  titleAssamese: string;
  titleEnglish: string;
  icon: string;
  timeContext: string;
}

const ROUTINE_SEQUENCE: RoutineStep[] = [
  { id: 's1', order: 1, titleAssamese: '১. পুৱাৰ ৰঙা চাহ খোৱা', titleEnglish: '1. Drink Morning Red Tea', icon: '☕', timeContext: '07:00 AM' },
  { id: 's2', order: 2, titleAssamese: '২. প্ৰেচাৰৰ সেউজীয়া ঔষধ', titleEnglish: '2. Take BP Morning Medicine', icon: '💊', timeContext: '08:30 AM' },
  { id: 's3', order: 3, titleAssamese: '৩. গা ধোৱা আৰু দুপৰীয়াৰ ভাত', titleEnglish: '3. Bath & Have Lunch', icon: '🍚', timeContext: '12:30 PM' },
  { id: 's4', order: 4, titleAssamese: '৪. চোতালত জিৰণি আৰু খোজ', titleEnglish: '4. Courtyard Stroll & Rest', icon: '🚶‍♂️', timeContext: '04:30 PM' },
];

const MUGA_MOTIFS = [
  { id: 'm1', nameAssamese: 'কিংখাপ (Kingkhap)', nameEnglish: 'Kingkhap (Royal Motif)', symbol: '👑', desc: 'আহোম স্বৰ্গদেউসকলৰ ৰাজকীয় কাপোৰৰ চানেকি' },
  { id: 'm2', nameAssamese: 'গছ বুটা (Gos Buta)', nameEnglish: 'Gos Buta (Tree of Life)', symbol: '🌿', desc: 'প্ৰকৃতি আৰু সেউজীয়া গছৰ ফুল' },
  { id: 'm3', nameAssamese: 'কলকা (Kalka Paisley)', nameEnglish: 'Kalka Paisley', symbol: '🪷', desc: 'পদ্মফুলৰ আকৃতিৰ চানেকি' },
  { id: 'm4', nameAssamese: 'ফুলাম জাপি (Japi)', nameEnglish: 'Japi (Conical Sunshade)', symbol: '👒', desc: 'অসমৰ কৃষিজীৱী সমাজৰ গৌৰৱ' },
];

export const MugaMotifGame: React.FC<Props> = ({ language, onBack }) => {
  const t = translations[language];
  const [gameMode, setGameMode] = useState<'sequence' | 'motif'>('sequence');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<RoutineStep[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [adaptiveParams, setAdaptiveParams] = useState(() => adaptiveEngine.calculateAdaptiveParameters('muga_motif'));
  const coins = useCoins('muga_motif');

  // Motif mode state
  const [targetMotif, setTargetMotif] = useState(MUGA_MOTIFS[0]);
  const [motifOptions, setMotifOptions] = useState(MUGA_MOTIFS);

  const startTimeRef = useRef<number>(Date.now());

  const handleBackWithActivity = () => {
    if (questionsAnswered > 0) {
      const latency = Date.now() - startTimeRef.current;
      const accuracy = correctAnswers / questionsAnswered;
      const profile = db.getPatientProfile();
      const gameTitle = GAME_TITLES.muga_motif[language as keyof typeof GAME_TITLES.muga_motif] || GAME_TITLES.muga_motif.en;
      db.recordActivity({
        timestamp: Date.now(),
        gameType: 'muga_motif',
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

  // Setup round
  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedOptionId(null);
    setIsCorrect(null);

    if (gameMode === 'sequence') {
      const correctStep = ROUTINE_SEQUENCE[currentStepIndex % ROUTINE_SEQUENCE.length];
      const otherSteps = ROUTINE_SEQUENCE.filter(s => s.id !== correctStep.id);
      const pool = [correctStep, ...otherSteps.sort(() => 0.5 - Math.random()).slice(0, 2)];
      setShuffledOptions(pool.sort(() => 0.5 - Math.random()));

      const promptText = language === 'as' 
        ? `ক্ৰম অনুসৰি এতিয়া কি কৰিব লাগে বাচি লওক` 
        : `Select which routine step comes in order.`;
      audioEngine.speakPrompt(promptText, language);
    } else {
      const randTarget = MUGA_MOTIFS[Math.floor(Math.random() * MUGA_MOTIFS.length)];
      setTargetMotif(randTarget);
      setMotifOptions([...MUGA_MOTIFS].sort(() => 0.5 - Math.random()));

      const promptText = language === 'as'
        ? `মুগা কাপোৰৰ চানেকি: ${randTarget.nameAssamese} চিনি পাওক`
        : `Identify the motif: ${randTarget.nameEnglish}`;
      audioEngine.speakPrompt(promptText, language);
    }
  }, [gameMode, currentStepIndex, language]);

  const handleSelectSequenceStep = (step: RoutineStep) => {
    if (selectedOptionId !== null) return;

    const now = Date.now();
    const latency = now - startTimeRef.current;
    const correctStep = ROUTINE_SEQUENCE[currentStepIndex % ROUTINE_SEQUENCE.length];
    const correct = step.id === correctStep.id;

    setSelectedOptionId(step.id);
    setIsCorrect(correct);
    setQuestionsAnswered(prev => prev + 1);
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
    coins.recordAnswer(correct);

    if (correct) {
      setScore(s => s + 10);
      audioEngine.playSuccessChime();
      confetti({ particleCount: 40, spread: 50 });
      audioEngine.speakPrompt(language === 'as' ? 'সুন্দৰ! ক্ৰমটো একদম সঠিক হৈছে!' : 'Great! Perfect routine order!', language);
    } else {
      audioEngine.playSoftGuidance();
      audioEngine.speakPrompt(language === 'as' ? 'অলপ ভাবি আকৌ চেষ্টা কৰক' : 'Think gently and try once more', language);
    }

    const telemetryRecord = db.recordTelemetry({
      timestamp: now,
      gameType: 'muga_motif',
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

  const handleSelectMotif = (motif: typeof MUGA_MOTIFS[0]) => {
    if (selectedOptionId !== null) return;

    const now = Date.now();
    const latency = now - startTimeRef.current;
    const correct = motif.id === targetMotif.id;

    setSelectedOptionId(motif.id);
    setIsCorrect(correct);
    setQuestionsAnswered(prev => prev + 1);
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
    coins.recordAnswer(correct);

    if (correct) {
      setScore(s => s + 10);
      audioEngine.playSuccessChime();
      confetti({ particleCount: 40, spread: 50 });
      audioEngine.speakPrompt(language === 'as' ? 'সঠিক চানেকি বাছি লৈছে!' : 'Correct motif selected!', language);
    } else {
      audioEngine.playSoftGuidance();
      audioEngine.speakPrompt(language === 'as' ? 'আকৌ চেষ্টা কৰক' : 'Please try again', language);
    }

    const telemetryRecord = db.recordTelemetry({
      timestamp: now,
      gameType: 'muga_motif',
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
    setCurrentStepIndex(i => i + 1);
  };

  useEffect(() => {
    gameVoiceBridge.register('muga_motif', {
      start: () => {
        setCurrentStepIndex(0);
      },
      next: handleNext,
      repeat: () => {
        const promptText =
          gameMode === 'sequence'
            ? language === 'as'
              ? 'ক্ৰম অনুসৰি এতিয়া কি কৰিব লাগে বাচি লওক'
              : 'Select which routine step comes in order.'
            : language === 'as'
              ? `মুগা কাপোৰৰ চানেকি: ${targetMotif.nameAssamese} চিনি পাওক`
              : `Identify the motif: ${targetMotif.nameEnglish}`;
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
    return () => gameVoiceBridge.unregister('muga_motif');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameMode, targetMotif, score, language, onBack]);

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
          <button
            className={`status-pill ${gameMode === 'sequence' ? 'highlight' : ''}`}
            onClick={() => setGameMode('sequence')}
          >
            {language === 'as' ? 'দৈনন্দিন ক্ৰম' : 'Daily Routine'}
          </button>
          <button
            className={`status-pill ${gameMode === 'motif' ? 'highlight' : ''}`}
            onClick={() => setGameMode('motif')}
          >
            {language === 'as' ? 'মুগা চানেকি' : 'Muga Motifs'}
          </button>
          <div className="status-pill">
            <span>{t.score}: {score}</span>
          </div>
          <CoinPill sessionCoins={coins.sessionCoins} label={t.coinsLabel} />
        </div>

        <div title={t.avatarEdit} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--emerald-surface)', border: '2px solid var(--emerald-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PatientAvatar config={db.getAvatar()} size={42} />
        </div>
      </div>

      {gameMode === 'sequence' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{
            background: '#fffbeb',
            border: '2px solid #fde68a',
            borderRadius: '20px',
            padding: '20px 28px',
            textAlign: 'center',
            maxWidth: '560px',
            width: '100%'
          }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#92400e', marginBottom: '8px' }}>
              {language === 'as' ? 'প্ৰশ্ন: ইয়াৰ পিছত কি কৰিব লাগে?' : 'Question: What is next in your routine?'}
            </h3>
            <p style={{ fontSize: '16px', color: '#78350f', fontWeight: 600 }}>
              {language === 'as' 
                ? `পূৰ্বৱৰ্তী কাম: ${ROUTINE_SEQUENCE[(currentStepIndex + 3) % 4].titleAssamese}`
                : `Previous Task: ${ROUTINE_SEQUENCE[(currentStepIndex + 3) % 4].titleEnglish}`}
            </p>
          </div>

          {/* Sequence Choice Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '560px' }}>
            {shuffledOptions.map((step) => {
              const correctStep = ROUTINE_SEQUENCE[currentStepIndex % ROUTINE_SEQUENCE.length];
              let stateClass = '';
              if (selectedOptionId !== null) {
                if (step.id === correctStep.id) stateClass = 'correct';
                else if (step.id === selectedOptionId) stateClass = 'incorrect';
              }

              return (
                <button
                  key={step.id}
                  className={`btn-choice-option ${stateClass}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '18px',
                    padding: '18px 24px',
                    minHeight: '74px'
                  }}
                  onClick={() => handleSelectSequenceStep(step)}
                  disabled={selectedOptionId !== null}
                >
                  <span style={{ fontSize: '32px' }}>{step.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>
                      {language === 'as' ? step.titleAssamese : step.titleEnglish}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                      {step.timeContext}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Motif Mode */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{
            background: '#fffbeb',
            border: '2px solid #fde68a',
            borderRadius: '20px',
            padding: '24px',
            textAlign: 'center',
            maxWidth: '560px',
            width: '100%'
          }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '8px' }}>{targetMotif.symbol}</span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#92400e' }}>
              {language === 'as' ? targetMotif.nameAssamese : targetMotif.nameEnglish}
            </h3>
            <p style={{ fontSize: '15px', color: '#78350f', marginTop: '6px' }}>{targetMotif.desc}</p>
          </div>

          <div className="options-choice-grid">
            {motifOptions.map((m) => {
              let stateClass = '';
              if (selectedOptionId !== null) {
                if (m.id === targetMotif.id) stateClass = 'correct';
                else if (m.id === selectedOptionId) stateClass = 'incorrect';
              }

              return (
                <button
                  key={m.id}
                  className={`btn-choice-option ${stateClass}`}
                  style={{ minHeight: '80px', gap: '8px' }}
                  onClick={() => handleSelectMotif(m)}
                  disabled={selectedOptionId !== null}
                >
                  <span style={{ fontSize: '28px' }}>{m.symbol}</span>
                  <span>{language === 'as' ? m.nameAssamese : m.nameEnglish}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Result feedback */}
      {selectedOptionId !== null && (
        <div style={{ marginTop: '28px', textAlign: 'center', width: '100%', maxWidth: '480px', margin: '28px auto 0' }}>
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
            className="btn-game-play btn-play-amber"
            style={{ minHeight: '64px' }}
            onClick={handleNext}
          >
            <RotateCcw size={22} />
            <span>{t.nextChallenge}</span>
          </button>
        </div>
      )}

      {questionsAnswered > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <CoinSummaryCard
            labels={t}
            score={score}
            maxScore={questionsAnswered * 10}
            accuracy={correctAnswers / questionsAnswered}
            coinsEarned={coins.sessionCoins}
            todayCoins={coins.summary.today + coins.sessionCoins}
            totalCoins={coins.summary.total + coins.sessionCoins}
          />
        </div>
      )}
    </div>
  );
};
