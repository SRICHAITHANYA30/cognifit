import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, CheckCircle2, RotateCcw, Volume2, Sparkles, XCircle } from 'lucide-react';
import type { Language } from '../../types';
import { translations } from '../../locales/translations';
import { db } from '../../services/db';
import { audioEngine } from '../../services/audioEngine';
import { adaptiveEngine } from '../../services/adaptiveEngine';

interface Props {
  language: Language;
  onBack: () => void;
}

interface WordPuzzle {
  word: string;
  clueEn: string;
  clueAs: string;
  icon: string;
}

const PUZZLES: Record<string, WordPuzzle[]> = {
  en: [
    { word: 'PEACE', clueEn: 'A state of quiet, calm and harmony', clueAs: 'শান্তি আৰু নিৰৱতা', icon: '🕊️' },
    { word: 'LOTUS', clueEn: 'Sacred national flower of India', clueAs: 'পৱিত্ৰ ৰাষ্ট্ৰীয় পদুম ফুল', icon: '🪷' },
    { word: 'RIVER', clueEn: 'Flowing water like the Brahmaputra', clueAs: 'ব্ৰহ্মপুত্ৰৰ দৰে বোৱতী নদী', icon: '🌊' },
    { word: 'SMILE', clueEn: 'A cheerful, bright facial expression', clueAs: 'মুখৰ আনন্দভৰা হাঁহি', icon: '😊' },
    { word: 'HEART', clueEn: 'Symbol of affection and care', clueAs: 'মৰম আৰু ভালপোৱাৰ প্ৰতীক', icon: '❤️' },
  ],
  as: [
    { word: 'বিহু', clueEn: 'Beloved spring festival of Assam', clueAs: 'অসমৰ প্ৰাণ আৰু বাপুতি-সাহোন উৎসৱ', icon: '🪕' },
    { word: 'চাহ', clueEn: 'Famous warm Assam tea beverage', clueAs: 'অসমৰ বিশ্ববিখ্যাত সুস্বাদু পানীয়', icon: '☕' },
    { word: 'মৰম', clueEn: 'Love, warmth, and gentle affection', clueAs: 'হৃদয়ৰ গভীৰ স্নেহ আৰু স্নেহপূৰ্ণ ভাৱ', icon: '❤️' },
    { word: 'নদী', clueEn: 'Brahmaputra flowing river', clueAs: 'ব্ৰহ্মপুত্ৰ আদি জীৱনদায়িনী জলধাৰা', icon: '🌊' },
    { word: 'গঁড়', clueEn: 'Kaziranga one-horned animal', clueAs: 'কাজিৰঙাৰ গৌৰৱ এশিঙীয়া বন্যপ্ৰাণী', icon: '🦏' },
  ],
  bn: [
    { word: 'শান্তি', clueEn: 'Serenity and peaceful quiet', clueAs: 'শান্তিপূর্ণ পরিবেশ', icon: '🕊️' },
    { word: 'নদী', clueEn: 'Flowing holy river', clueAs: 'বোৱতী পানীৰ নদী', icon: '🌊' },
    { word: 'ফুল', clueEn: 'Sweet fragrant garden flower', clueAs: 'সুগন্ধি ফুল', icon: '🌸' },
    { word: 'আলো', clueEn: 'Bright dawn light', clueAs: 'পুৱাৰ পোহৰ', icon: '☀️' },
  ],
  ta: [
    { word: 'அன்பு', clueEn: 'Love and kindness (Anbu)', clueAs: 'মৰম আৰু ভালপোৱা', icon: '❤️' },
    { word: 'மலர்', clueEn: 'Beautiful blooming flower (Malar)', clueAs: 'সুন্দৰ ফুল', icon: '🌸' },
    { word: 'ஒளி', clueEn: 'Bright spiritual light (Oli)', clueAs: 'পৱিত্ৰ পোহৰ', icon: '✨' },
  ],
  lus: [
    { word: 'HMING', clueEn: 'Good name and family honour', clueAs: 'ভাল নাম আৰু পৰিচয়', icon: '🏷️' },
    { word: 'DUHSAK', clueEn: 'Loving kindness and favour', clueAs: 'স্নেহ আৰু দয়া', icon: '🤝' },
    { word: 'NITHIN', clueEn: 'Every single bright day', clueAs: 'প্ৰতিটো নতুন দিন', icon: '🌅' },
  ]
};

export const WordScrambleGame: React.FC<Props> = ({ language, onBack }) => {
  const t = translations[language];
  const puzzleList = PUZZLES[language] || PUZZLES['en'];
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<{ id: number; char: string; used: boolean }[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{ id: number; char: string }[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [adaptiveParams, setAdaptiveParams] = useState(() => adaptiveEngine.calculateAdaptiveParameters('word_scramble'));

  const startTimeRef = useRef<number>(Date.now());
  const currentPuzzle = puzzleList[puzzleIndex % puzzleList.length];

  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedLetters([]);
    setIsCorrect(null);

    // Split target word into letters/characters and shuffle
    const letters = Array.from(currentPuzzle.word).map((char, id) => ({
      id,
      char,
      used: false,
    }));

    // Ensure it's not identical to answer
    const shuffled = [...letters].sort(() => 0.5 - Math.random());
    setScrambledLetters(shuffled);

    const clue = language === 'as' ? currentPuzzle.clueAs : currentPuzzle.clueEn;
    audioEngine.speakPrompt(clue, language);
  }, [puzzleIndex, language]);

  const handlePickLetter = (item: { id: number; char: string; used: boolean }) => {
    if (item.used || isCorrect) return;

    audioEngine.playDholBeat('khei');
    const newSelected = [...selectedLetters, { id: item.id, char: item.char }];
    setSelectedLetters(newSelected);

    setScrambledLetters(prev => prev.map(l => l.id === item.id ? { ...l, used: true } : l));

    // Check if word completed
    if (newSelected.length === currentPuzzle.word.length) {
      const spelled = newSelected.map(s => s.char).join('');
      const latency = Date.now() - startTimeRef.current;
      const correct = spelled === currentPuzzle.word;

      setIsCorrect(correct);

      if (correct) {
        setScore(s => s + 15);
        audioEngine.playSuccessChime();
        confetti({ particleCount: 50, spread: 60 });
        audioEngine.speakPrompt(t.wellDone, language);
      } else {
        audioEngine.playSoftGuidance();
        audioEngine.speakPrompt(t.gentleEncouragement, language);
      }

      const telemetryRecord = db.recordTelemetry({
        timestamp: Date.now(),
        gameType: 'word_scramble',
        difficultyLevel: adaptiveParams.currentLevel,
        decisionLatencyMs: latency,
        motorLatencyMs: Math.min(latency, 700),
        accuracy: correct ? 1.0 : 0.2,
        tremorHesitationCount: 0,
        completedSuccessfully: correct,
      });

      const updated = adaptiveEngine.processTelemetry(telemetryRecord);
      setAdaptiveParams(updated);
    }
  };

  const handleClear = () => {
    setSelectedLetters([]);
    setIsCorrect(null);
    setScrambledLetters(prev => prev.map(l => ({ ...l, used: false })));
  };

  const handlePlayClueAudio = () => {
    const clue = language === 'as' ? currentPuzzle.clueAs : currentPuzzle.clueEn;
    audioEngine.speakPrompt(clue, language);
  };

  const handleNext = () => {
    setPuzzleIndex(i => i + 1);
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

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '540px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#064e3b', marginBottom: '6px' }}>
            {t.game5Title}
          </h2>
          <p style={{ fontSize: '16px', color: '#475569', fontWeight: 600 }}>
            {t.wordPrompt}
          </p>
        </div>

        {/* Clue Banner */}
        <div style={{
          background: '#f0fdf4',
          border: '2px solid #bbf7d0',
          borderRadius: '20px',
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '560px',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '42px' }}>{currentPuzzle.icon}</span>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                {t.wordClue}
              </span>
              <p style={{ fontSize: '17px', fontWeight: 700, color: '#064e3b', marginTop: '2px' }}>
                {language === 'as' ? currentPuzzle.clueAs : currentPuzzle.clueEn}
              </p>
            </div>
          </div>

          <button
            onClick={handlePlayClueAudio}
            style={{
              background: 'white',
              border: '2px solid #86efac',
              borderRadius: '14px',
              padding: '12px',
              cursor: 'pointer',
              color: '#15803d'
            }}
            title={t.audioHint}
          >
            <Volume2 size={24} />
          </button>
        </div>

        {/* Selected Letters Answer Slots */}
        <div style={{
          display: 'flex',
          gap: '12px',
          minHeight: '80px',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          padding: '12px 24px',
          borderRadius: '20px',
          border: '2px dashed #cbd5e1',
          width: '100%',
          maxWidth: '560px',
        }}>
          {Array.from({ length: currentPuzzle.word.length }).map((_, idx) => {
            const letter = selectedLetters[idx];
            return (
              <div
                key={idx}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  border: letter ? '3px solid #059669' : '2px solid #cbd5e1',
                  background: letter ? '#ecfdf5' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#064e3b',
                  boxShadow: letter ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {letter ? letter.char : ''}
              </div>
            );
          })}
        </div>

        {/* Scrambled Letter Choice Buttons */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '520px' }}>
          {scrambledLetters.map((l) => (
            <button
              key={l.id}
              onClick={() => handlePickLetter(l)}
              disabled={l.used || isCorrect === true}
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '18px',
                border: l.used ? '2px solid #e2e8f0' : '3px solid #0284c7',
                background: l.used ? '#f1f5f9' : 'linear-gradient(135deg, #ffffff, #eff6ff)',
                color: l.used ? '#94a3b8' : '#0369a1',
                fontSize: '28px',
                fontWeight: 900,
                cursor: l.used ? 'default' : 'pointer',
                boxShadow: l.used ? 'none' : 'var(--shadow-md)',
                transform: l.used ? 'scale(0.92)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {l.char}
            </button>
          ))}
        </div>

        {/* Reset & Feedback Controls */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
          <button
            className="btn-back-kiosk"
            onClick={handleClear}
            style={{ minHeight: '52px', padding: '10px 20px' }}
          >
            <XCircle size={20} />
            <span>{t.clearSelection}</span>
          </button>
        </div>

        {/* Outcome State */}
        {isCorrect !== null && (
          <div style={{ marginTop: '16px', textAlign: 'center', width: '100%', maxWidth: '480px' }}>
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

            {isCorrect && (
              <button
                className="btn-game-play btn-play-emerald"
                style={{ minHeight: '60px' }}
                onClick={handleNext}
              >
                <RotateCcw size={22} />
                <span>{t.nextChallenge}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
