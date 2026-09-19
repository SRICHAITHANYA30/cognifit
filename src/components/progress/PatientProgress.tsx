import React, { useMemo } from 'react';
import { ArrowLeft, Coins, Flame, TrendingUp, Trophy, Activity } from 'lucide-react';
import type { Language } from '../../types';
import { db } from '../../services/db';

interface Props {
  language: Language;
  onBack: () => void;
}

export const PatientProgress: React.FC<Props> = ({ onBack }) => {

  const data = useMemo(() => {
    const coins = db.getCoinSummary();
    const activities = db.getActivities();
    const past7Days = db.getPast7DaysCsi();
    const todayActivities = activities.filter(
      (a) => new Date(a.timestamp).toDateString() === new Date().toDateString()
    );
    const gamesPlayed = new Set(activities.map((a) => a.gameType)).size;
    return { coins, activities, past7Days, todayActivities, gamesPlayed };
  }, []);

  const latestCsi = data.past7Days.length > 0 ? data.past7Days[data.past7Days.length - 1] : null;

  const csiColor = (score: number) => {
    if (score >= 70) return '#059669';
    if (score >= 50) return '#d97706';
    return '#dc2626';
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
        <button className="btn-back-kiosk" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
          My Progress
        </h2>
      </div>

      <div className="progress-grid">
        <div className="progress-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Trophy size={24} style={{ color: 'var(--muga-gold)' }} />
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Rewards</h3>
          </div>
          <div className="pp-stat-row" style={{ display: 'flex', gap: '30px' }}>
            <div>
              <div className="progress-stat-number">
                <Coins size={30} style={{ display: 'inline', verticalAlign: '-4px', marginRight: '6px' }} />
                {data.coins.today}
              </div>
              <div className="progress-stat-label">Coins today</div>
            </div>
            <div>
              <div className="progress-stat-number">
                <Coins size={30} style={{ display: 'inline', verticalAlign: '-4px', marginRight: '6px' }} />
                {data.coins.total}
              </div>
              <div className="progress-stat-label">Total coins</div>
            </div>
          </div>
        </div>

        <div className="progress-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Flame size={24} style={{ color: '#ea580c' }} />
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Activity</h3>
          </div>
          <div className="pp-stat-row" style={{ display: 'flex', gap: '30px' }}>
            <div>
              <div className="progress-stat-number">{data.todayActivities.length}</div>
              <div className="progress-stat-label">Games today</div>
            </div>
            <div>
              <div className="progress-stat-number">{data.activities.length}</div>
              <div className="progress-stat-label">Total sessions</div>
            </div>
            <div>
              <div className="progress-stat-number">{data.gamesPlayed}</div>
              <div className="progress-stat-label">Games played</div>
            </div>
          </div>
        </div>

        <div className="progress-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <TrendingUp size={24} style={{ color: 'var(--primary-emerald)' }} />
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Cognitive wellbeing</h3>
          </div>
          {latestCsi ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div className="progress-stat-number" style={{ color: csiColor(latestCsi.compositeCsi) }}>
                {Math.round(latestCsi.compositeCsi)}
              </div>
              <div>
                <div className="progress-stat-label">
                  Today&apos;s composite CSI score (last {data.past7Days.length} days)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  {data.past7Days
                    .slice(-7)
                    .map((day) => (
                      <span
                        key={day.date}
                        className="csi-chip"
                        style={{
                          color: csiColor(day.compositeCsi),
                          background: 'var(--bg-parchment)',
                        }}
                      >
                        {day.compositeCsi}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="progress-stat-label">Play a few games to build your wellness score.</div>
          )}
        </div>

        <div className="progress-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Activity size={24} style={{ color: '#7c3aed' }} />
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Recent sessions</h3>
          </div>
          {data.activities.length === 0 ? (
            <div className="progress-stat-label">No sessions yet. Start a game to begin.</div>
          ) : (
            data.activities.slice(0, 8).map((act) => (
              <div className="activity-row" key={act.id}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {act.gameTitle}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(act.timestamp).toLocaleString()}
                  </div>
                </div>
                <span
                  style={{
                    fontWeight: 900,
                    color: 'var(--primary-emerald)',
                    background: 'var(--emerald-surface)',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '0.95rem',
                  }}
                >
                  {act.score}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProgress;