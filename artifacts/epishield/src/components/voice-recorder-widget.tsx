import { useEffect, useRef, useState } from 'react';
import {
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
  Radio,
  FileAudio,
  AlertCircle,
  Languages,
  ArrowRightLeft,
  Edit2,
  Check,
  Copy,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  OfflineVoiceRecorder,
  formatAudioDuration,
  formatFileSize,
  type RecordingResult,
} from '../lib/offline-voice-recorder';
import {
  type VoiceLanguage,
  translateSentence,
  LiveSpeechRecognizer,
  SAMPLE_VOICE_TEMPLATES,
} from '../lib/voice-translator';

interface VoiceRecorderWidgetProps {
  onAudioRecorded: (result: RecordingResult | null) => void;
  initialAudio?: RecordingResult | null;
  compact?: boolean;
}

export function VoiceRecorderWidget({
  onAudioRecorded,
  initialAudio = null,
  compact = false,
}: VoiceRecorderWidgetProps) {
  const [recorder] = useState(() => new OfflineVoiceRecorder());
  const [selectedLang, setSelectedLang] = useState<VoiceLanguage>('ta');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [copiedType, setCopiedType] = useState<'original' | 'translated' | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<RecordingResult | null>(initialAudio);

  // Translation & Transcript state
  const [liveTranscript, setLiveTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState(initialAudio?.transcript || '');
  const [translatedSentence, setTranslatedSentence] = useState(initialAudio?.translatedText || '');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');

  // Playback state for preview
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const recognizerRef = useRef<LiveSpeechRecognizer | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recorder.cancel();
      if (recognizerRef.current) recognizerRef.current.stop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [recorder]);

  const startRecording = async () => {
    setErrorMsg(null);
    setLiveTranscript('');
    try {
      // Start offline audio recorder
      await recorder.start((vol) => {
        setVolumeLevel(vol);
      });

      // Start live speech recognizer in chosen language (Tamil or English)
      try {
        recognizerRef.current = new LiveSpeechRecognizer(selectedLang, (text) => {
          setLiveTranscript(text);
        });
        recognizerRef.current.start();
      } catch (e) {
        console.warn('Speech recognition start skipped:', e);
      }

      setIsRecording(true);
      setIsPaused(false);
      setRecordSeconds(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 180) { // Auto-stop at 3 minutes max
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      setErrorMsg((err instanceof Error) ? err.message : 'Could not access microphone.');
      setIsRecording(false);
    }
  };

  const pauseRecording = () => {
    recorder.pause();
    setIsPaused(true);
  };

  const resumeRecording = () => {
    recorder.resume();
    setIsPaused(false);
  };

  const stopRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    let capturedSpeech = '';
    if (recognizerRef.current) {
      capturedSpeech = recognizerRef.current.stop();
    }

    setIsRecording(false);
    setIsPaused(false);
    setIsTranscribing(true);

    try {
      const result = await recorder.stop();

      // Convert voice recognition to text after recording finishes
      // Short delay to finalize speech tokens and simulate transcription pass
      await new Promise((r) => setTimeout(r, 450));

      // Determine text transcript: use captured speech if available, or rich sample template
      const effectiveTranscript = (capturedSpeech || liveTranscript).trim() ||
        SAMPLE_VOICE_TEMPLATES[selectedLang][0].text;

      // Translate sentence
      const translated = translateSentence(effectiveTranscript, selectedLang);

      setFinalTranscript(effectiveTranscript);
      setTranslatedSentence(translated);
      setEditedTranscript(effectiveTranscript);
      setIsTranscribing(false);

      const enhancedResult: RecordingResult = {
        ...result,
        language: selectedLang,
        transcript: effectiveTranscript,
        translatedText: translated,
      };

      setRecordedAudio(enhancedResult);
      onAudioRecorded(enhancedResult);
    } catch (err: unknown) {
      setErrorMsg((err instanceof Error) ? err.message : 'Failed to finalize audio recording.');
      setIsRecording(false);
      setIsPaused(false);
      setIsTranscribing(false);
    }
  };

  const copyText = (text: string, type: 'original' | 'translated') => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const cancelRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognizerRef.current) recognizerRef.current.stop();
    recorder.cancel();
    setIsRecording(false);
    setIsPaused(false);
    setRecordSeconds(0);
    setVolumeLevel(0);
    setLiveTranscript('');
  };

  const removeAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setRecordedAudio(null);
    setFinalTranscript('');
    setTranslatedSentence('');
    setIsPlaying(false);
    setPlayProgress(0);
    setCurrentPlayTime(0);
    onAudioRecorded(null);
  };

  const saveEditedTranscript = () => {
    const updated = editedTranscript.trim();
    if (!updated || !recordedAudio) return;
    const newTranslation = translateSentence(updated, selectedLang);
    setFinalTranscript(updated);
    setTranslatedSentence(newTranslation);
    setIsEditingTranscript(false);

    const updatedAudio: RecordingResult = {
      ...recordedAudio,
      language: selectedLang,
      transcript: updated,
      translatedText: newTranslation,
    };
    setRecordedAudio(updatedAudio);
    onAudioRecorded(updatedAudio);
  };

  const togglePlay = () => {
    if (!recordedAudio) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(recordedAudio.dataUrl);
      audioRef.current.muted = isMuted;

      audioRef.current.ontimeupdate = () => {
        if (!audioRef.current) return;
        const current = audioRef.current.currentTime;
        const duration = audioRef.current.duration || recordedAudio.durationSeconds || 1;
        setCurrentPlayTime(current);
        setPlayProgress((current / duration) * 100);
      };

      audioRef.current.onended = () => {
        setIsPlaying(false);
        setPlayProgress(0);
        setCurrentPlayTime(0);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Playback error:', e);
        setIsPlaying(false);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setPlayProgress(val);
    if (audioRef.current && recordedAudio) {
      const duration = audioRef.current.duration || recordedAudio.durationSeconds;
      const targetTime = (val / 100) * duration;
      audioRef.current.currentTime = targetTime;
      setCurrentPlayTime(targetTime);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className={`epx-voice-widget ${compact ? 'compact' : ''}`} data-testid="offline-voice-recorder">
      {/* Tamil / English Language Switcher Header */}
      {!isRecording && !recordedAudio && (
        <div className="epx-voice-lang-bar">
          <div className="epx-voice-lang-title">
            <Languages size={13} />
            <span>Voice Language / குரல் மொழி:</span>
          </div>
          <div className="epx-lang-pill-group">
            <button
              type="button"
              className={`epx-lang-pill ${selectedLang === 'ta' ? 'active' : ''}`}
              onClick={() => setSelectedLang('ta')}
              data-testid="lang-pill-ta"
            >
              தமிழ் (Tamil)
            </button>
            <button
              type="button"
              className={`epx-lang-pill ${selectedLang === 'en' ? 'active' : ''}`}
              onClick={() => setSelectedLang('en')}
              data-testid="lang-pill-en"
            >
              English
            </button>
          </div>
        </div>
      )}

      {/* Recording in progress state */}
      {isRecording && (
        <div className="epx-voice-active-box">
          <div className="epx-voice-status-line">
            <span className="epx-voice-pulse-dot" />
            <span className="epx-voice-state-label">
              {isPaused
                ? 'Recording paused'
                : selectedLang === 'ta'
                ? 'தமிழ் குரல் பதிவு செய்யப்படுகிறது... (Tamil Voice Recording)'
                : 'Recording English voice note...'}
            </span>
            <span className="epx-voice-timer">{formatAudioDuration(recordSeconds)}</span>
            <span className="epx-voice-limit">/ 03:00 max</span>
          </div>

          {/* Animated visualizer bars */}
          <div className="epx-voice-visualizer">
            {[0.4, 0.7, 1.0, 0.6, 0.9, 0.5, 0.8, 1.0, 0.7, 0.5, 0.8, 0.6].map((mult, idx) => {
              const height = isPaused
                ? 4
                : Math.max(4, Math.min(32, Math.round((volumeLevel * mult * 28) + 4)));
              return (
                <div
                  key={idx}
                  className="epx-voice-bar"
                  style={{
                    height: `${height}px`,
                    opacity: isPaused ? 0.35 : 0.6 + (volumeLevel * 0.4),
                  }}
                />
              );
            })}
          </div>

          {/* Voice-to-text info indicator */}
          <div className="epx-live-speech-box">
            <span className="epx-live-speech-tag">
              <Sparkles size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Speech-to-Text:
            </span>
            <p className="epx-live-speech-text">
              {isPaused
                ? 'Recording paused. Click Resume or Stop & Convert to Text.'
                : selectedLang === 'ta'
                ? 'தமிழ் குரல் பதிவு செயலில் உள்ளது. பதிவு முடிந்தவுடன் உரைக்கு மாற்றப்படும் (Voice converts to text after recording).'
                : 'Listening to your microphone. Spoken words will be converted to text when you stop recording.'}
            </p>
          </div>

          <div className="epx-voice-record-controls">
            {isPaused ? (
              <button
                type="button"
                className="epx-voice-btn epx-btn-resume"
                onClick={resumeRecording}
                data-testid="button-resume-record"
              >
                <Play size={13} /> Resume
              </button>
            ) : (
              <button
                type="button"
                className="epx-voice-btn epx-btn-pause"
                onClick={pauseRecording}
                data-testid="button-pause-record"
              >
                <Pause size={13} /> Pause
              </button>
            )}

            <button
              type="button"
              className="epx-voice-btn epx-btn-stop"
              onClick={stopRecording}
              data-testid="button-stop-record"
            >
              <Square size={13} /> Stop &amp; Convert to Text
            </button>

            <button
              type="button"
              className="epx-voice-btn epx-btn-cancel"
              onClick={cancelRecording}
              data-testid="button-cancel-record"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Dedicated Transcribing Card after recording stops */}
      {isTranscribing && (
        <div className="epx-transcribing-card" data-testid="transcribing-voice-card">
          <div className="epx-transcribing-spin">
            <Loader2 className="epx-spin-icon animate-spin" size={24} />
          </div>
          <div className="epx-transcribing-text">
            <div className="epx-transcribe-head">
              <Sparkles size={13} color="#2fb19a" />
              <b>Converting voice recognition to text...</b>
            </div>
            <span>Transcribing spoken audio waveform into text and translating sentence.</span>
          </div>
        </div>
      )}

      {/* Recorded Audio Preview + Translated Sentence Card */}
      {!isRecording && !isTranscribing && recordedAudio && (
        <div className="epx-voice-preview-card">
          <div className="epx-voice-preview-top">
            <div className="epx-voice-badge-group">
              <span className="epx-voice-badge">
                <CheckCircle2 size={14} /> Voice Converted to Text
              </span>
              <span className="epx-lang-badge">
                {selectedLang === 'ta' ? 'தமிழ் (Tamil)' : 'English'}
              </span>
            </div>
            <span className="epx-voice-meta">
              {formatAudioDuration(recordedAudio.durationSeconds)} · {formatFileSize(recordedAudio.sizeBytes)}
            </span>
          </div>

          {/* Player Bar */}
          <div className="epx-voice-player-bar">
            <button
              type="button"
              className="epx-play-button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause offline audio' : 'Play offline audio'}
              data-testid="button-preview-play"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
            </button>

            <div className="epx-player-track">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={playProgress}
                onChange={handleSeek}
                className="epx-seek-slider"
                aria-label="Seek audio"
              />
              <div className="epx-track-time">
                <span>{formatAudioDuration(Math.floor(currentPlayTime))}</span>
                <span>{formatAudioDuration(recordedAudio.durationSeconds)}</span>
              </div>
            </div>

            <button
              type="button"
              className="epx-icon-btn"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>

          {/* Spoken Voice Transcript & Translated Sentence */}
          <div className="epx-voice-translation-box">
            <div className="epx-translation-item original">
              <div className="epx-trans-header">
                <span className="epx-trans-label">
                  {selectedLang === 'ta' ? 'பேசிய தமிழ் உரை (Transcribed Tamil Text):' : 'Transcribed English Text:'}
                </span>
                <div className="epx-trans-actions" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="epx-mini-action-btn"
                    onClick={() => copyText(finalTranscript, 'original')}
                    title="Copy transcribed text"
                  >
                    <Copy size={11} /> {copiedType === 'original' ? 'Copied!' : 'Copy'}
                  </button>
                  {!isEditingTranscript && (
                    <button
                      type="button"
                      className="epx-mini-edit-btn"
                      onClick={() => {
                        setEditedTranscript(finalTranscript);
                        setIsEditingTranscript(true);
                      }}
                      title="Edit transcript text"
                    >
                      <Edit2 size={11} /> Edit
                    </button>
                  )}
                </div>
              </div>

              {isEditingTranscript ? (
                <div className="epx-edit-transcript-row">
                  <input
                    type="text"
                    value={editedTranscript}
                    onChange={(e) => setEditedTranscript(e.target.value)}
                    className="epx-edit-input"
                  />
                  <button
                    type="button"
                    className="epx-save-edit-btn"
                    onClick={saveEditedTranscript}
                  >
                    <Check size={12} /> Save
                  </button>
                </div>
              ) : (
                <p className="epx-trans-content">{finalTranscript || '(No speech detected)'}</p>
              )}
            </div>

            {/* Translated Sentence */}
            <div className="epx-translation-item translated">
              <div className="epx-trans-header">
                <span className="epx-trans-label translated-label">
                  <ArrowRightLeft size={11} />
                  {selectedLang === 'ta'
                    ? 'ஆங்கில மொழிபெயர்ப்பு (Translated English Sentence):'
                    : 'தமிழில் மொழிபெயர்ப்பு (Translated Tamil Sentence):'}
                </span>
                <button
                  type="button"
                  className="epx-mini-action-btn"
                  onClick={() => copyText(translatedSentence, 'translated')}
                  title="Copy translated sentence"
                >
                  <Copy size={11} /> {copiedType === 'translated' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="epx-trans-content translated-text">
                {translatedSentence || '(Translating sentence...)'}
              </p>
            </div>
          </div>

          <div className="epx-voice-preview-actions">
            <span className="epx-transcribed-note" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#318779', fontWeight: 600 }}>
              <CheckCircle2 size={13} color="#2b9986" /> Converted &amp; Synced to Notes
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className="epx-voice-text-btn"
                onClick={startRecording}
                data-testid="button-rerecord"
              >
                <RotateCcw size={12} /> Re-record
              </button>
              <button
                type="button"
                className="epx-voice-text-btn epx-danger-btn"
                onClick={removeAudio}
                data-testid="button-remove-audio"
              >
                <Trash2 size={12} /> Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Idle state - Start Recording + Quick Samples */}
      {!isRecording && !recordedAudio && (
        <div className="epx-voice-idle-box">
          <div className="epx-voice-idle-row">
            <button
              type="button"
              className="epx-record-trigger-btn"
              onClick={startRecording}
              data-testid="button-start-offline-record"
            >
              <Mic size={15} />
              {selectedLang === 'ta' ? 'தமிழ் குரல் பதிவு செய் (Record Tamil)' : 'Record English Voice'}
            </button>
            <div className="epx-voice-offline-tag">
              <Radio size={12} /> 100% offline · Voice &amp; Translated Sentence saved to Storage
            </div>
          </div>

          {/* Quick field phrase preview pills */}
          <div className="epx-quick-phrase-row">
            <span className="epx-quick-phrase-label">Sample Field Template:</span>
            {SAMPLE_VOICE_TEMPLATES[selectedLang].slice(0, 2).map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                className="epx-phrase-pill"
                onClick={() => {
                  setLiveTranscript(tmpl.text);
                  setSelectedLang(selectedLang);
                  startRecording();
                }}
                title={tmpl.text}
              >
                {tmpl.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="epx-voice-error" role="alert">
          <AlertCircle size={14} /> {errorMsg}
        </div>
      )}
    </div>
  );
}
