import type { VoiceIntent } from './voiceCommands';

export interface GameVoiceActions {
  start?: () => boolean | void;
  next?: () => boolean | void;
  repeat?: () => boolean | void;
  stop?: () => boolean | void;
  pause?: () => boolean | void;
  resume?: () => boolean | void;
  readScore?: () => boolean | void;
  hint?: () => boolean | void;
}

const registry = new Map<string, GameVoiceActions>();

const GAME_INTENT_MAP: Partial<Record<VoiceIntent, keyof GameVoiceActions>> = {
  START_GAME: 'start',
  NEXT: 'next',
  REPEAT: 'repeat',
  STOP: 'stop',
  PAUSE_GAME: 'pause',
  RESUME_GAME: 'resume',
  READ_SCORE: 'readScore',
};

export const gameVoiceBridge = {
  register(gameId: string, actions: GameVoiceActions): void {
    registry.set(gameId, actions || {});
  },
  unregister(gameId: string): void {
    registry.delete(gameId);
  },
  get(gameId: string): GameVoiceActions | undefined {
    return registry.get(gameId);
  },
  has(gameId: string): boolean {
    return registry.has(gameId);
  },
  getRegisteredGameId(): string | null {
    if (registry.size === 0) return null;
    return Array.from(registry.keys())[0];
  },
};

export function runGameIntent(gameId: string | null, intent: VoiceIntent): boolean {
  if (!gameId) return false;
  const actions = registry.get(gameId);
  if (!actions) return false;
  const key = GAME_INTENT_MAP[intent];
  if (!key) return false;
  const handler = actions[key];
  if (typeof handler !== 'function') return false;
  const result = handler();
  return result !== false;
}