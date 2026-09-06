import type { DailyCsiScore, GameType, TelemetryRecord } from '../types';

export interface AdaptiveProfile {
  currentLevel: number; // 1 to 5
  recommendedGridSize: number; // 2, 4, 6
  hintPersistenceSeconds: number;
  rhythmToleranceMs: number;
  touchTargetSizePx: number;
  consecutiveSuccessStreak: number;
  consecutiveErrorStreak: number;
  triggerVoiceAssistance: boolean;
}

class AdaptiveEngine {
  private rollingWindowSize: number = 6;
  private recentTelemetry: TelemetryRecord[] = [];

  // Default baseline configuration
  private baselineLatencyMs: number = 2200; // Expected baseline for early-moderate dementia patient

  public setBaseline(latencyMs: number) {
    this.baselineLatencyMs = Math.max(800, latencyMs);
  }

  // Record a trial and update difficulty model
  public processTelemetry(record: TelemetryRecord): AdaptiveProfile {
    this.recentTelemetry.push(record);
    if (this.recentTelemetry.length > this.rollingWindowSize) {
      this.recentTelemetry.shift();
    }

    return this.calculateAdaptiveParameters(record.gameType);
  }

  // Dynamic Difficulty Adjustment (DDA) State Machine
  public calculateAdaptiveParameters(gameType: GameType): AdaptiveProfile {
    const relevant = this.recentTelemetry.filter(t => t.gameType === gameType);
    
    // Default safe level for elderly patients (Level 2)
    if (relevant.length === 0) {
      return {
        currentLevel: 2,
        recommendedGridSize: 2,
        hintPersistenceSeconds: 7,
        rhythmToleranceMs: 140,
        touchTargetSizePx: 64,
        consecutiveSuccessStreak: 0,
        consecutiveErrorStreak: 0,
        triggerVoiceAssistance: false,
      };
    }

    const last = relevant[relevant.length - 1];
    let level = last.difficultyLevel;
    let streak = 0;
    let errorStreak = 0;

    // Count streaks backwards
    for (let i = relevant.length - 1; i >= 0; i--) {
      if (relevant[i].completedSuccessfully && relevant[i].accuracy >= 0.8) {
        if (errorStreak === 0) streak++;
      } else {
        if (streak === 0) errorStreak++;
      }
    }

    // Adaptive promotion / demotion logic
    const avgLatency = relevant.reduce((acc, cur) => acc + cur.decisionLatencyMs, 0) / relevant.length;
    let triggerHelp = false;

    if (errorStreak >= 2 || avgLatency > this.baselineLatencyMs * 1.6) {
      // Demote to relieve cognitive friction
      level = Math.max(1, level - 1);
      triggerHelp = true;
    } else if (streak >= 3 && avgLatency < this.baselineLatencyMs * 0.9) {
      // Promote if clearly mastering with rapid reaction
      level = Math.min(5, level + 1);
    }

    // Map level to tactile & UI ergonomics
    // Level 1: 2 items, large 72px buttons, 8s hints, 160ms rhythm window
    // Level 2: 2-3 items, 64px buttons, 7s hints, 140ms rhythm window
    // Level 3: 4 items, 60px buttons, 5s hints, 110ms rhythm window
    // Level 4: 4-6 items, 56px buttons, 4s hints, 90ms rhythm window
    // Level 5: 6 items, 52px buttons, 3s hints, 70ms rhythm window
    const gridMap = [2, 2, 4, 4, 6];
    const hintMap = [8, 7, 5, 4, 3];
    const rhythmToleranceMap = [160, 140, 110, 90, 70];
    const buttonSizeMap = [72, 64, 60, 56, 52];

    const idx = Math.min(Math.max(level - 1, 0), 4);

    return {
      currentLevel: level,
      recommendedGridSize: gridMap[idx],
      hintPersistenceSeconds: hintMap[idx],
      rhythmToleranceMs: rhythmToleranceMap[idx],
      touchTargetSizePx: buttonSizeMap[idx],
      consecutiveSuccessStreak: streak,
      consecutiveErrorStreak: errorStreak,
      triggerVoiceAssistance: triggerHelp,
    };
  }

  // Calculate Daily Cognitive Stability Index (CSI) from all telemetry
  public calculateDailyCsi(records: TelemetryRecord[], targetDate: string): DailyCsiScore {
    const dayRecords = records.filter(r => {
      const d = new Date(r.timestamp).toISOString().split('T')[0];
      return d === targetDate;
    });

    if (dayRecords.length === 0) {
      return {
        date: targetDate,
        compositeCsi: 76, // Standard baseline initialization
        memoryScore: 78,
        executiveScore: 75,
        attentionScore: 76,
        motorStabilityScore: 80,
        sessionCount: 0,
        clinicalNote: 'No game sessions recorded for this day.',
      };
    }

    const memoryRecords = dayRecords.filter(r => r.gameType === 'smriti_rong');
    const executiveRecords = dayRecords.filter(r => r.gameType === 'muga_motif');
    const attentionRecords = dayRecords.filter(r => r.gameType === 'taal_xur');

    const calcDomain = (group: TelemetryRecord[], defaultScore: number) => {
      if (group.length === 0) return defaultScore;
      const acc = group.reduce((sum, r) => sum + r.accuracy, 0) / group.length;
      const latencyRatio = group.reduce((sum, r) => sum + (this.baselineLatencyMs / Math.max(r.decisionLatencyMs, 400)), 0) / group.length;
      // Clamped normalized score
      const normScore = (acc * 65) + (Math.min(latencyRatio, 1.5) * 25);
      return Math.min(100, Math.max(30, Math.round(normScore)));
    };

    const memoryScore = calcDomain(memoryRecords, 75);
    const executiveScore = calcDomain(executiveRecords, 72);
    const attentionScore = calcDomain(attentionRecords, 78);

    // Motor tremor penalty (jitter taps & high motor latency)
    const avgTremors = dayRecords.reduce((sum, r) => sum + r.tremorHesitationCount, 0) / dayRecords.length;
    const motorStabilityScore = Math.max(40, Math.min(100, Math.round(92 - (avgTremors * 6))));

    // Composite CSI weighted formula: 35% Memory, 30% Executive, 25% Attention, 10% Motor
    const compositeCsi = Math.round(
      (0.35 * memoryScore) +
      (0.30 * executiveScore) +
      (0.25 * attentionScore) +
      (0.10 * motorStabilityScore)
    );

    let clinicalNote = 'Cognitive metrics are stable. Regular routine adherence observed.';
    if (compositeCsi < 65) {
      clinicalNote = 'Alert: Notable drop in motor accuracy and decision speed. Recommended for ASHA home check.';
    } else if (memoryScore < 60) {
      clinicalNote = 'Specific decline in facial recognition recall. Caregiver advised to practice family vault photos.';
    }

    return {
      date: targetDate,
      compositeCsi,
      memoryScore,
      executiveScore,
      attentionScore,
      motorStabilityScore,
      sessionCount: dayRecords.length,
      clinicalNote,
    };
  }
}

export const adaptiveEngine = new AdaptiveEngine();
