import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import type { Language } from '../../types';
import { speak, stopSpeaking } from '../../services/tts';
import { detectIntent } from '../../services/voiceCommands';
import type { VoiceIntent } from '../../services/voiceCommands';
import { runGameIntent } from '../../services/gameVoiceBridge';
import { SpeechSession } from '../../services/speechRecognition';
import type { SpeechErrorCode, SpeechState } from '../../services/speechRecognition';
import { isSpeechRecognitionSupported } from '../../services/speechRecognition';
import { voiceTranslations } from '../../locales/voiceTranslations';
import { translations } from '../../locales/translations';

const GAME_INTENTS: VoiceIntent[] = [
  'START_GAME',
  'PAUSE_GAME',
  'RESUME_GAME',
  'NEXT',
  'REPEAT',
  'STOP',
];

interface Props {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  language: Language;
  currentView: string;
  activeGameId: string | null;
  showFab: boolean;
  onIntent: (intent: VoiceIntent) => boolean;
  // Master switch from Settings: when false the assistant still opens for
  // reading help text, but never listens and never runs voice commands.
  commandsEnabled?: boolean;
}

interface ListenCallbacks {
  onInterim: (text: string) => void;
  onResult: (text: string) => void;
  onStateChange: (state: SpeechState) => void;
  onError: (code: SpeechErrorCode) => void;
}

export const VoiceAssistant: React.FC<Props> = ({
  open,
  onOpen,
  onClose,
  language,
  activeGameId,
  showFab,
  onIntent,
  commandsEnabled = true,
}) => {
  const ui = voiceTranslations[language] || voiceTranslations.en;
  const t = translations[language] || translations['en'];
  const [phase, setPhase] = useState<SpeechState>('idle');
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const sessionRef = useRef<SpeechSession | null>(null);
  const languageRef = useRef(language);
  languageRef.current = language;

  const handleRecognitionError = (code: SpeechErrorCode) => {
    const lng = languageRef.current;
    const uiLocal = voiceTranslations[lng] || voiceTranslations.en;
    let message = uiLocal.notRecognized;
    if (code === 'not-supported') {
      message = uiLocal.notSupportedTitle;
    } else if (code === 'no-speech') {
      message = uiLocal.noSpeech;
    } else if (code === 'not-allowed') {
      message = uiLocal.microphoneError;
    } else if (code === 'network') {
      message = uiLocal.notSupportedMessage;
    }
    setErrorMsg(message);
    setPhase('idle');
    speak(message, lng);
  };

  const handleTranscript = async (text: string) => {
    const lng = languageRef.current;
    const uiLocal = voiceTranslations[lng] || voiceTranslations.en;
    if (!commandsEnabled) {
      // Voice commands are switched off in Settings: keep the transcript
      // visible but never interpret or act on it.
      setTranscript(text);
      setPhase('idle');
      return;
    }
    const intent = detectIntent(text, lng);

    if (!intent) {
      setErrorMsg(uiLocal.notRecognized);
      setPhase('idle');
      speak(uiLocal.notRecognized, lng);
      return;
    }

    const isGameIntent = GAME_INTENTS.includes(intent);

    if (isGameIntent) {
      const handled = runGameIntent(activeGameId, intent);
      if (handled) {
        onClose();
      } else {
        setErrorMsg(uiLocal.notRecognized);
        setPhase('idle');
        speak(uiLocal.tryVoiceHelp, lng);
      }
      return;
    }

    const acted = onIntent(intent);
    if (!acted) {
      setErrorMsg(uiLocal.notRecognized);
      setPhase('idle');
      speak(uiLocal.notRecognized, lng);
      return;
    }

    const confirmText = uiLocal.confirmed[intent];
    if (confirmText) {
      speak(confirmText, lng);
    }
    setTimeout(() => {
      setTranscript('');
      setPhase('idle');
    }, 600);
    onClose();
  };

  const createCallbacks = (): ListenCallbacks => ({
    onInterim: (text) => {
      setTranscript(text);
    },
    onResult: (text) => {
      setTranscript(text);
      void handleTranscript(text);
    },
    onStateChange: (state) => {
      setPhase(state);
    },
    onError: (code) => {
      handleRecognitionError(code);
    },
  });

  const startListening = () => {
    if (!commandsEnabled) {
      return;
    }
    stopSpeaking();
    setErrorMsg(null);
    setTranscript('');
    const lng = languageRef.current;
    const callbacks = createCallbacks();
    const session = new SpeechSession(lng, callbacks);
    sessionRef.current = session;
    session.start();
  };

  const stopAndClose = () => {
    sessionRef.current?.stop();
    sessionRef.current = null;
    stopSpeaking();
    setPhase('idle');
    setErrorMsg(null);
    setTranscript('');
    onClose();
  };

  useEffect(() => {
    if (open && !commandsEnabled) {
      // Commands switched off while open: stop any session, stay quiet.
      sessionRef.current?.stop();
      sessionRef.current = null;
      setPhase('idle');
      return undefined;
    }
    if (open && commandsEnabled) {
      const supported = isSpeechRecognitionSupported();
      if (!supported) {
        setErrorMsg(ui.notSupportedTitle);
        setPhase('idle');
        return;
      }
      speak(ui.listeningHint, language);
      const delay = window.setTimeout(() => {
        startListening();
      }, 900);
      return () => window.clearTimeout(delay);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, commandsEnabled]);

  useEffect(() => {
    return () => {
      sessionRef.current?.stop();
      sessionRef.current = null;
    };
  }, []);

  return (
    <>
      {showFab && (
        <button
          className="voice-fab"
          onClick={() => {
            if (!open) onOpen();
          }}
          aria-label="Voice assistant"
          title="Voice assistant"
        >
          <Mic size={30} />
        </button>
      )}

      {open && (
        <div className="voice-overlay">
          <div className="voice-overlay-card">
            <button className="voice-close-btn" onClick={stopAndClose} aria-label="Close">
              <X size={26} />
            </button>

            <div className="voice-mic-orb">
              {phase === 'listening' ? <Mic size={44} /> : <MicOff size={44} />}
            </div>

            {phase === 'listening' && (
              <>
                <div className="voice-status-label">{ui.listening}</div>
                <div className="voice-hint">{ui.listeningHint}</div>
              </>
            )}

            {phase === 'processing' && (
              <>
                <div className="voice-status-label">{ui.processing}</div>
                <div className="voice-hint">{transcript}</div>
              </>
            )}

            {errorMsg && (
              <>
                <div className="voice-status-label">{errorMsg}</div>
                <div className="voice-hint">{ui.tryVoiceHelp}</div>
              </>
            )}

            {!commandsEnabled && (
              <div className="voice-hint">{t.voiceCommandsOffNote}</div>
            )}

            {transcript && phase !== 'processing' && !errorMsg && (
              <div className="voice-transcript">"{transcript}"</div>
            )}

            {(errorMsg || phase === 'idle') && !errorMsg && (
              <div className="voice-hint">{ui.tryVoiceHelp}</div>
            )}

            <div className="voice-actions">
              {errorMsg ? (
                <button className="btn-game-play btn-play-emerald" onClick={startListening} style={{ minWidth: '200px' }}>
                  <Mic size={20} />
                  <span>{ui.listening}</span>
                </button>
              ) : (
                <button className="btn-back-kiosk" onClick={stopAndClose} style={{ minWidth: '200px', justifyContent: 'center' }}>
                  <span>{ui.close}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;