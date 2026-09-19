import { useCallback, useRef, useState } from 'react';
import type { GameType } from '../types';
import { db } from '../services/db';

export const COIN_PER_CORRECT = 5;

export interface CoinFlashState {
  id: number;
  amount: number;
}

export interface UseCoinsResult {
  summary: { today: number; total: number };
  sessionCoins: number;
  flash: CoinFlashState | null;
  recordAnswer: (isCorrect: boolean) => void;
  getSessionCoins: () => number;
  commit: () => void;
  reset: () => void;
}

export function useCoins(gameType: GameType): UseCoinsResult {
  const [summary, setSummary] = useState(() => db.getCoinSummary());
  const [sessionCoins, setSessionCoins] = useState(0);
  const [flash, setFlash] = useState<CoinFlashState | null>(null);

  const sessionRef = useRef(0);
  const flashIdRef = useRef(0);

  const recordAnswer = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      sessionRef.current += COIN_PER_CORRECT;
      setSessionCoins(sessionRef.current);
    }
    flashIdRef.current += 1;
    setFlash({ id: flashIdRef.current, amount: isCorrect ? COIN_PER_CORRECT : 0 });
  }, []);

  const getSessionCoins = useCallback(() => sessionRef.current, []);

  const commit = useCallback(() => {
    if (sessionRef.current <= 0) {
      return;
    }
    db.recordCoins(sessionRef.current, gameType);
    sessionRef.current = 0;
    setSessionCoins(0);
    setSummary(db.getCoinSummary());
  }, [gameType]);

  const reset = useCallback(() => {
    sessionRef.current = 0;
    setSessionCoins(0);
    setFlash(null);
  }, []);

  return { summary, sessionCoins, flash, recordAnswer, getSessionCoins, commit, reset };
}
