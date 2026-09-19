import React, { useEffect, useState } from 'react';

export const COIN_EMOJI = '🪙';

export const CoinFlash: React.FC<{ amount: number }> = ({ amount }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const positive = amount > 0;

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2000,
        pointerEvents: 'none',
        padding: '10px 24px',
        borderRadius: '999px',
        fontWeight: 900,
        fontSize: '22px',
        color: positive ? '#065f46' : '#64748b',
        background: positive ? '#d1fae5' : '#f1f5f9',
        border: `3px solid ${positive ? '#10b981' : '#cbd5e1'}`,
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      +{amount} {COIN_EMOJI}
    </div>
  );
};

export const CoinPill: React.FC<{ sessionCoins: number; label: string }> = ({ sessionCoins, label }) => (
  <div
    className="status-pill"
    title={label}
    style={{ background: '#fef9c3', borderColor: '#fde047' }}
  >
    <span>{COIN_EMOJI} {sessionCoins}</span>
  </div>
);

export interface CoinSummaryLabels {
  sessionSummary: string;
  score: string;
  accuracyLabel: string;
  coinsEarnedLabel: string;
  todayCoinsLabel: string;
  totalCoinsLabel: string;
}

interface CoinSummaryCardProps {
  labels: CoinSummaryLabels;
  score: number;
  maxScore: number;
  accuracy: number;
  coinsEarned: number;
  todayCoins: number;
  totalCoins: number;
}

export const CoinSummaryCard: React.FC<CoinSummaryCardProps> = ({
  labels,
  score,
  maxScore,
  accuracy,
  coinsEarned,
  todayCoins,
  totalCoins,
}) => {
  const rows: [string, string][] = [
    [labels.score, `${score} / ${maxScore}`],
    [labels.accuracyLabel, `${Math.round(accuracy * 100)}%`],
    [labels.coinsEarnedLabel, `${coinsEarned} ${COIN_EMOJI}`],
    [labels.todayCoinsLabel, `${todayCoins} ${COIN_EMOJI}`],
    [labels.totalCoinsLabel, `${totalCoins} ${COIN_EMOJI}`],
  ];

  return (
    <div
      style={{
        marginTop: '14px',
        padding: '14px 18px',
        borderRadius: '16px',
        background: '#fffbeb',
        border: '2px solid #fde68a',
        textAlign: 'left',
        width: '100%',
        maxWidth: '360px',
      }}
    >
      <div
        style={{
          fontSize: '13px',
          fontWeight: 800,
          color: '#92400e',
          textTransform: 'uppercase',
          marginBottom: '8px',
          letterSpacing: '0.4px',
        }}
      >
        {labels.sessionSummary}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {rows.map(([key, value]) => (
          <div
            key={key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
              fontSize: '15px',
              fontWeight: 700,
              color: '#78350f',
            }}
          >
            <span>{key}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
