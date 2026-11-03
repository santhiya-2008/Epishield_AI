import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  Mic,
  X,
  FileAudio,
  Play,
  Pause,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { VoiceRecorderWidget } from './voice-recorder-widget';
import { saveVoiceRecord, type StoredVoiceRecord } from '../lib/voice-storage';
import {
  formatAudioDuration,
  formatFileSize,
  downloadAudioFile,
  type RecordingResult,
} from '../lib/offline-voice-recorder';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  audioResult?: RecordingResult;
  savedVoiceRecord?: StoredVoiceRecord;
  suggestedZone?: string;
  suggestedSeverity?: 'Low' | 'Moderate' | 'High' | 'Critical';
}

interface OfflineVoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStorageVault: () => void;
  onPopulateCaseReport?: (reportData: { zone: string; symptoms: string[]; notes: string }) => void;
}

export function OfflineVoiceChatModal({
  isOpen,
  onClose,
  onOpenStorageVault,
  onPopulateCaseReport,
}: OfflineVoiceChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: 'Hello. I am the EPISHIELD Offline Health & Environmental Assistant. You can speak into your microphone or type field observations. Your voice recordings will be saved into the Voice Storage Vault after each chat message.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [activeVoiceResult, setActiveVoiceResult] = useState<RecordingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach((a) => {
        a.pause();
        a.src = '';
      });
      audioRefs.current = {};
    };
  }, []);

  if (!isOpen) return null;

  const togglePlayAudio = (id: string, dataUrl: string) => {
    if (playingAudioId === id) {
      audioRefs.current[id]?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (playingAudioId && audioRefs.current[playingAudioId]) {
      audioRefs.current[playingAudioId].pause();
    }

    if (!audioRefs.current[id]) {
      const audio = new Audio(dataUrl);
      audio.onended = () => setPlayingAudioId(null);
      audioRefs.current[id] = audio;
    }

    audioRefs.current[id].play().then(() => {
      setPlayingAudioId(id);
    }).catch(() => setPlayingAudioId(null));
  };

  const handleVoiceRecorded = (res: RecordingResult | null) => {
    setActiveVoiceResult(res);
    if (res && (res.translatedText || res.transcript)) {
      const text = res.translatedText || res.transcript || '';
      if (text) {
        setInputText(text);
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !activeVoiceResult) return;

    const userText = inputText.trim() || activeVoiceResult?.translatedText || activeVoiceResult?.transcript || 'Voice field report recorded.';
    const currentAudio = activeVoiceResult;

    // Reset input states
    setInputText('');
    setActiveVoiceResult(null);

    // Save voice recording to storage if audio was attached
    let savedRecord: StoredVoiceRecord | undefined = undefined;
    if (currentAudio) {
      try {
        savedRecord = await saveVoiceRecord({
          title: `Voice Chat Memo · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          durationSeconds: currentAudio.durationSeconds,
          audioDataUrl: currentAudio.dataUrl,
          audioMimeType: currentAudio.mimeType,
          sizeBytes: currentAudio.sizeBytes,
          source: 'voice-chat',
          zone: 'Zone A',
          notes: userText,
        });
      } catch (err) {
        console.warn('Could not save voice chat audio to storage:', err);
      }
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      audioResult: currentAudio || undefined,
      savedVoiceRecord: savedRecord,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    // Analyze text offline using rule-based clinical intelligence
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let response = '';
      let detectedZone = 'Zone A';
      let detectedSeverity: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Moderate';
      const detectedSymptoms: string[] = [];

      if (lower.includes('zone b')) detectedZone = 'Zone B';
      if (lower.includes('zone c')) detectedZone = 'Zone C';
      if (lower.includes('zone d')) detectedZone = 'Zone D';

      if (lower.includes('diarrhea') || lower.includes('loose')) detectedSymptoms.push('Diarrhea');
      if (lower.includes('vomit') || lower.includes('nausea')) detectedSymptoms.push('Vomiting');
      if (lower.includes('fever') || lower.includes('temperature')) detectedSymptoms.push('Fever');
      if (lower.includes('stomach') || lower.includes('cramp') || lower.includes('pain')) detectedSymptoms.push('Stomach pain');
      if (lower.includes('water') || lower.includes('turbid') || lower.includes('contamination')) {
        detectedSymptoms.push('Water contamination indicator');
      }

      if (detectedSymptoms.length >= 2 || lower.includes('critical') || lower.includes('severe')) {
        detectedSeverity = 'High';
      }

      if (detectedSymptoms.length > 0) {
        response = `Sample triage assessment: Observed ${detectedSymptoms.join(', ')} in ${detectedZone}. Recommended triage: Deploy rapid oral rehydration, verify local water source readings (+38% turbidity threshold), and log an illustrative case report.`;
      } else {
        response = `Illustrative field note logged for ${detectedZone}. Health teams can cross-reference water quality telemetry and symptom cluster patterns in the surveillance dashboard.`;
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedZone: detectedZone,
        suggestedSeverity: detectedSeverity,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="epx-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="epx-chat-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="epx-chat-header">
          <div className="epx-chat-header-title">
            <span className="epx-chat-bot-icon">
              <Bot size={20} />
            </span>
            <div>
              <h3>EPISHIELD Offline Voice Assistant</h3>
              <p>
                <Radio size={11} color="#5ba098" /> 100% Offline • Voice recordings saved to Storage Vault after chat
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="epx-tool-btn"
              onClick={() => {
                onClose();
                onOpenStorageVault();
              }}
              title="Open Voice Storage Vault"
              data-testid="button-chat-open-vault"
            >
              <FolderOpen size={14} /> Voice Storage
            </button>
            <button
              type="button"
              className="epx-icon-btn"
              onClick={onClose}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="epx-chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`epx-chat-msg ${msg.sender === 'user' ? 'user-msg' : 'assistant-msg'}`}
            >
              <div className="epx-chat-avatar">
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div className="epx-chat-bubble">
                <div className="epx-chat-text">{msg.text}</div>

                {/* Stored Audio preview if message included voice */}
                {msg.audioResult && (
                  <div className="epx-chat-audio-chip">
                    <button
                      type="button"
                      className="epx-chat-play-btn"
                      onClick={() => togglePlayAudio(msg.id, msg.audioResult!.dataUrl)}
                      data-testid={`button-chat-play-${msg.id}`}
                    >
                      {playingAudioId === msg.id ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                    <span>Voice Note ({formatAudioDuration(msg.audioResult.durationSeconds)})</span>
                    <button
                      type="button"
                      className="epx-chat-dl-btn"
                      onClick={() =>
                        downloadAudioFile(
                          msg.audioResult!.dataUrl,
                          `chat_voice_${msg.id}.webm`
                        )
                      }
                      title="Download audio"
                    >
                      <Download size={12} />
                    </button>
                  </div>
                )}

                {/* Voice Storage confirmation pill */}
                {msg.savedVoiceRecord && (
                  <div className="epx-chat-saved-notice">
                    <CheckCircle2 size={12} color="#439e87" />
                    <span>
                      Audio stored in Voice Vault (<b>{msg.savedVoiceRecord.id}</b>)
                    </span>
                    <button
                      type="button"
                      className="epx-inline-vault-link"
                      onClick={() => {
                        onClose();
                        onOpenStorageVault();
                      }}
                    >
                      View in storage <ArrowRight size={10} />
                    </button>
                  </div>
                )}

                <div className="epx-chat-time">{msg.timestamp}</div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="epx-chat-msg assistant-msg">
              <div className="epx-chat-avatar"><Bot size={14} /></div>
              <div className="epx-chat-bubble processing">
                <span className="epx-typing-dot" />
                <span className="epx-typing-dot" />
                <span className="epx-typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Offline Voice Recording */}
        <div className="epx-chat-footer">
          <VoiceRecorderWidget onAudioRecorded={handleVoiceRecorded} compact />

          <form className="epx-chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder={
                activeVoiceResult
                  ? 'Voice recorded. Type optional notes or press Send...'
                  : 'Type field question or use microphone above...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              data-testid="input-chat-text"
            />
            <button
              type="submit"
              className="epx-chat-send-btn"
              disabled={!inputText.trim() && !activeVoiceResult}
              data-testid="button-chat-send"
            >
              <Send size={15} />
            </button>
          </form>
          <div className="epx-chat-disclaimer">
            <ShieldCheck size={11} /> Offline simulation: All chat audio is stored locally in your browser’s Voice Storage Vault.
          </div>
        </div>
      </div>
    </div>
  );
}
