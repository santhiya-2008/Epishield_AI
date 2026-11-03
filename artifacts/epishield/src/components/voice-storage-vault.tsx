import { useEffect, useRef, useState } from 'react';
import {
  Download,
  FileAudio,
  HardDrive,
  Headphones,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Clock,
  MapPin,
  Activity,
  PlusCircle,
  X,
  ArrowRightLeft,
  Languages,
} from 'lucide-react';
import {
  getAllVoiceRecords,
  deleteVoiceRecord,
  clearAllVoiceRecords,
  saveVoiceRecord,
  type StoredVoiceRecord,
} from '../lib/voice-storage';
import {
  formatAudioDuration,
  formatFileSize,
  downloadAudioFile,
  type RecordingResult,
} from '../lib/offline-voice-recorder';
import { VoiceRecorderWidget } from './voice-recorder-widget';

interface VoiceStorageVaultProps {
  onSelectCase?: (caseId: string) => void;
  compact?: boolean;
}

export function VoiceStorageVault({ onSelectCase, compact = false }: VoiceStorageVaultProps) {
  const [records, setRecords] = useState<StoredVoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'case-reporting' | 'voice-chat' | 'quick-memo'>('all');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState<Record<string, number>>({});
  const [currentTimes, setCurrentTimes] = useState<Record<string, number>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showQuickRecorder, setShowQuickRecorder] = useState(false);
  const [quickMemoTitle, setQuickMemoTitle] = useState('');
  const [quickMemoZone, setQuickMemoZone] = useState('Zone A');
  const [quickAudioResult, setQuickAudioResult] = useState<RecordingResult | null>(null);
  const [quickMemoNote, setQuickMemoNote] = useState('');

  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const loadRecords = async () => {
    try {
      const data = await getAllVoiceRecords();
      setRecords(data);
    } catch (e) {
      console.warn('Failed to load voice records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();

    const handleStorageChange = () => {
      loadRecords();
    };

    window.addEventListener('epishield:voice-storage-change', handleStorageChange);
    return () => {
      window.removeEventListener('epishield:voice-storage-change', handleStorageChange);
      // Stop all active audios
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
      audioRefs.current = {};
    };
  }, []);

  const totalDuration = records.reduce((acc, r) => acc + (r.durationSeconds || 0), 0);
  const totalBytes = records.reduce((acc, r) => acc + (r.sizeBytes || 0), 0);

  const filteredRecords = records.filter((r) => {
    const matchesSource = sourceFilter === 'all' || r.source === sourceFilter;
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      r.title.toLowerCase().includes(query) ||
      (r.zone && r.zone.toLowerCase().includes(query)) ||
      (r.linkedCaseId && r.linkedCaseId.toLowerCase().includes(query)) ||
      (r.notes && r.notes.toLowerCase().includes(query)) ||
      (r.transcript && r.transcript.toLowerCase().includes(query)) ||
      (r.symptoms && r.symptoms.join(' ').toLowerCase().includes(query));
    return matchesSource && matchesSearch;
  });

  const togglePlay = (record: StoredVoiceRecord) => {
    const id = record.id;
    const isCurrentlyPlaying = activePlayingId === id;

    // Pause any other playing audio
    if (activePlayingId && activePlayingId !== id && audioRefs.current[activePlayingId]) {
      audioRefs.current[activePlayingId].pause();
    }

    if (!audioRefs.current[id]) {
      const audio = new Audio(record.audioDataUrl);
      audio.muted = isMuted;

      audio.ontimeupdate = () => {
        const current = audio.currentTime;
        const dur = audio.duration || record.durationSeconds || 1;
        setCurrentTimes((prev) => ({ ...prev, [id]: current }));
        setPlayProgress((prev) => ({ ...prev, [id]: (current / dur) * 100 }));
      };

      audio.onended = () => {
        setActivePlayingId(null);
        setPlayProgress((prev) => ({ ...prev, [id]: 0 }));
        setCurrentTimes((prev) => ({ ...prev, [id]: 0 }));
      };

      audioRefs.current[id] = audio;
    }

    const currentAudio = audioRefs.current[id];

    if (isCurrentlyPlaying) {
      currentAudio.pause();
      setActivePlayingId(null);
    } else {
      currentAudio.play().then(() => {
        setActivePlayingId(id);
      }).catch((e) => {
        console.warn('Playback error:', e);
        setActivePlayingId(null);
      });
    }
  };

  const handleSeek = (record: StoredVoiceRecord, value: number) => {
    const id = record.id;
    setPlayProgress((prev) => ({ ...prev, [id]: value }));
    const audio = audioRefs.current[id];
    if (audio) {
      const dur = audio.duration || record.durationSeconds;
      const target = (value / 100) * dur;
      audio.currentTime = target;
      setCurrentTimes((prev) => ({ ...prev, [id]: target }));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this recorded offline voice file from local storage?')) {
      if (audioRefs.current[id]) {
        audioRefs.current[id].pause();
        delete audioRefs.current[id];
      }
      if (activePlayingId === id) setActivePlayingId(null);
      await deleteVoiceRecord(id);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Delete all offline voice recordings from this browser? This cannot be undone.')) {
      Object.values(audioRefs.current).forEach((audio) => audio.pause());
      audioRefs.current = {};
      setActivePlayingId(null);
      await clearAllVoiceRecords();
    }
  };

  const handleDownload = (record: StoredVoiceRecord) => {
    const safeTitle = record.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const filename = `${record.id}_${safeTitle}.webm`;
    downloadAudioFile(record.audioDataUrl, filename);
  };

  const handleCopy = (record: StoredVoiceRecord) => {
    let text = `${record.title}\n`;
    if (record.transcript) {
      text += `Spoken Voice (${record.language === 'ta' ? 'Tamil' : 'English'}): ${record.transcript}\n`;
    }
    if (record.translatedText) {
      text += `Translated Sentence: ${record.translatedText}\n`;
    }
    if (record.notes && record.notes !== record.transcript && record.notes !== record.translatedText) {
      text += `Notes: ${record.notes}\n`;
    }
    navigator.clipboard?.writeText(text.trim());
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveQuickMemo = async () => {
    if (!quickAudioResult) return;
    const title = quickMemoTitle.trim() || `Field Audio Note · ${quickMemoZone}`;
    await saveVoiceRecord({
      title,
      durationSeconds: quickAudioResult.durationSeconds,
      audioDataUrl: quickAudioResult.dataUrl,
      audioMimeType: quickAudioResult.mimeType,
      sizeBytes: quickAudioResult.sizeBytes,
      source: 'quick-memo',
      zone: quickMemoZone,
      language: quickAudioResult.language || 'ta',
      transcript: quickAudioResult.transcript || '',
      translatedText: quickAudioResult.translatedText || '',
      translationTarget: quickAudioResult.language === 'ta' ? 'en' : 'ta',
      notes: quickMemoNote.trim() || quickAudioResult.translatedText || 'Offline voice note saved directly in storage vault.',
    });

    // Reset
    setShowQuickRecorder(false);
    setQuickMemoTitle('');
    setQuickMemoNote('');
    setQuickAudioResult(null);
  };

  const timeAgo = (dateStr: string) => {
    const mins = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`epx-voice-vault ${compact ? 'compact' : ''}`} data-testid="voice-storage-vault">
      {/* Vault Header / Storage Stats */}
      <div className="epx-vault-header-card">
        <div className="epx-vault-summary">
          <div className="epx-vault-kpi">
            <span className="epx-kpi-icon"><Headphones size={20} /></span>
            <div>
              <div className="epx-kpi-val">{records.length}</div>
              <div className="epx-kpi-label">Stored Voice Records</div>
            </div>
          </div>
          <div className="epx-vault-kpi">
            <span className="epx-kpi-icon"><Clock size={20} /></span>
            <div>
              <div className="epx-kpi-val">{formatAudioDuration(totalDuration)}</div>
              <div className="epx-kpi-label">Total Audio Time</div>
            </div>
          </div>
          <div className="epx-vault-kpi">
            <span className="epx-kpi-icon"><HardDrive size={20} /></span>
            <div>
              <div className="epx-kpi-val">{formatFileSize(totalBytes)}</div>
              <div className="epx-kpi-label">Browser Storage Used</div>
            </div>
          </div>
        </div>

        <div className="epx-vault-badge-row">
          <span className="epx-offline-secure-pill">
            <ShieldCheck size={14} /> 100% Offline Storage • Stored in Browser • Zero Cloud Uploads
          </span>
          <button
            type="button"
            className="epx-button epx-quick-record-btn"
            onClick={() => setShowQuickRecorder(!showQuickRecorder)}
            data-testid="button-open-quick-memo"
          >
            {showQuickRecorder ? <X size={14} /> : <PlusCircle size={14} />}
            {showQuickRecorder ? 'Close recorder' : 'Record voice note'}
          </button>
        </div>
      </div>

      {/* Quick Voice Memo Drawer / Box */}
      {showQuickRecorder && (
        <div className="epx-quick-memo-panel page-enter">
          <div className="epx-panel-head">
            <div>
              <h3 style={{ margin: 0, color: '#27586b', fontSize: 13, fontWeight: 700 }}>
                Record new offline voice note
              </h3>
              <p style={{ margin: '3px 0 0', color: '#74929a', fontSize: 10 }}>
                Audio is saved directly into local voice storage without submitting a case report.
              </p>
            </div>
            <button
              type="button"
              className="epx-icon-btn"
              onClick={() => setShowQuickRecorder(false)}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="epx-quick-memo-fields">
            <div className="epx-field-row">
              <label>
                Note title
                <input
                  type="text"
                  placeholder="e.g. Field observations in Zone A"
                  value={quickMemoTitle}
                  onChange={(e) => setQuickMemoTitle(e.target.value)}
                />
              </label>
              <label>
                Zone
                <select value={quickMemoZone} onChange={(e) => setQuickMemoZone(e.target.value)}>
                  <option>Zone A</option>
                  <option>Zone B</option>
                  <option>Zone C</option>
                  <option>Zone D</option>
                </select>
              </label>
            </div>

            <label>
              Optional text notes / context
              <textarea
                placeholder="Add fictional memo description..."
                value={quickMemoNote}
                onChange={(e) => setQuickMemoNote(e.target.value)}
                rows={2}
              />
            </label>

            <div style={{ marginTop: 8 }}>
              <VoiceRecorderWidget onAudioRecorded={setQuickAudioResult} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button
                type="button"
                className="epx-voice-text-btn"
                onClick={() => setShowQuickRecorder(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-blue"
                disabled={!quickAudioResult}
                onClick={handleSaveQuickMemo}
                data-testid="button-save-quick-memo"
              >
                Save to Voice Storage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="epx-vault-filter-bar">
        <div className="epx-search-box">
          <Search size={14} className="epx-search-icon" />
          <input
            type="search"
            placeholder="Search voice recordings by note, zone, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-voice-records"
          />
        </div>

        <div className="epx-source-tabs">
          {[
            { key: 'all', label: `All (${records.length})` },
            { key: 'case-reporting', label: 'Case Reports' },
            { key: 'voice-chat', label: 'Voice Chat' },
            { key: 'quick-memo', label: 'Field Memos' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`epx-tab-btn ${sourceFilter === tab.key ? 'active' : ''}`}
              onClick={() => setSourceFilter(tab.key as typeof sourceFilter)}
              data-testid={`tab-filter-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {records.length > 0 && (
          <button
            type="button"
            className="epx-voice-text-btn epx-danger-btn"
            onClick={handleClearAll}
            title="Clear all local recordings"
            data-testid="button-clear-all-voice"
          >
            <Trash2 size={12} /> Clear vault
          </button>
        )}
      </div>

      {/* Recordings List */}
      <div className="epx-vault-list">
        {loading && (
          <div className="epx-vault-empty">
            <p>Loading stored offline voice recordings...</p>
          </div>
        )}

        {!loading && filteredRecords.length === 0 && (
          <div className="epx-vault-empty">
            <span className="epx-empty-icon"><FileAudio size={28} /></span>
            <h3>No voice recordings found</h3>
            <p>
              {records.length === 0
                ? 'Recordings from case reports, voice chat, and field memos will be stored here in your browser.'
                : 'No recordings match your search filter.'}
            </p>
            <button
              type="button"
              className="button button-aqua"
              onClick={() => setShowQuickRecorder(true)}
              style={{ marginTop: 8 }}
            >
              <Mic size={14} /> Record your first voice note
            </button>
          </div>
        )}

        {!loading &&
          filteredRecords.map((record) => {
            const isPlaying = activePlayingId === record.id;
            const progress = playProgress[record.id] || 0;
            const currentTime = currentTimes[record.id] || 0;

            return (
              <article
                className={`epx-record-card ${isPlaying ? 'playing' : ''}`}
                key={record.id}
                data-testid={`card-voice-record-${record.id}`}
              >
                <div className="epx-record-head">
                  <div className="epx-record-title-box">
                    <span className="epx-record-id-badge">{record.id}</span>
                    <h3 className="epx-record-title">{record.title}</h3>
                    <span className="epx-record-time">
                      <Clock size={11} /> {timeAgo(record.createdAt)}
                    </span>
                  </div>

                  <div className="epx-record-tags">
                    {record.zone && (
                      <span className="epx-pill epx-pill-zone">
                        <MapPin size={11} /> {record.zone}
                      </span>
                    )}
                    {record.linkedCaseId && (
                      <button
                        type="button"
                        className="epx-pill epx-pill-case"
                        onClick={() => onSelectCase?.(record.linkedCaseId!)}
                        title="View linked case report"
                      >
                        <Activity size={11} /> {record.linkedCaseId}
                      </button>
                    )}
                    <span className="epx-pill epx-pill-source">
                      {record.source === 'case-reporting'
                        ? 'Case Report'
                        : record.source === 'voice-chat'
                        ? 'Voice Chat'
                        : 'Field Memo'}
                    </span>
                    <span className="epx-pill epx-pill-lang">
                      <Languages size={10} /> {record.language === 'ta' ? 'தமிழ் (Tamil)' : 'English'}
                    </span>
                  </div>
                </div>

                {/* Symptoms pills if present */}
                {record.symptoms && record.symptoms.length > 0 && (
                  <div className="epx-symptoms-pills">
                    {record.symptoms.map((s) => (
                      <span key={s} className="epx-symptom-tag">{s}</span>
                    ))}
                  </div>
                )}

                {/* Spoken Voice Transcript */}
                {record.transcript && (
                  <div className="epx-vault-transcript-row">
                    <span className="epx-vault-text-badge original">
                      {record.language === 'ta' ? 'குரல் உரை (Tamil Voice):' : 'Spoken Voice (English):'}
                    </span>
                    <p className="epx-vault-transcript-text">“{record.transcript}”</p>
                  </div>
                )}

                {/* Translated Sentence */}
                {record.translatedText && (
                  <div className="epx-vault-translation-row">
                    <span className="epx-vault-text-badge translated">
                      <ArrowRightLeft size={10} />
                      {record.language === 'ta'
                        ? 'மொழிபெயர்ப்பு (Translated English Sentence):'
                        : 'மொழிபெயர்ப்பு (Translated Tamil Sentence):'}
                    </span>
                    <p className="epx-vault-translation-text">“{record.translatedText}”</p>
                  </div>
                )}

                {/* Additional Clinical Notes */}
                {record.notes &&
                  record.notes !== record.transcript &&
                  record.notes !== record.translatedText && (
                    <div className="epx-record-notes-box">
                      <p>“{record.notes}”</p>
                    </div>
                  )}

                {/* Built-in Audio Player Bar */}
                <div className="epx-record-player-row">
                  <button
                    type="button"
                    className="epx-play-button"
                    onClick={() => togglePlay(record)}
                    aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                    data-testid={`button-play-${record.id}`}
                  >
                    {isPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: 2 }} />}
                  </button>

                  <div className="epx-player-track">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={progress}
                      onChange={(e) => handleSeek(record, parseFloat(e.target.value))}
                      className="epx-seek-slider"
                      aria-label="Seek audio"
                    />
                    <div className="epx-track-time">
                      <span>{formatAudioDuration(Math.floor(currentTime))}</span>
                      <span>{formatAudioDuration(record.durationSeconds)}</span>
                    </div>
                  </div>

                  <span className="epx-record-size">
                    {formatFileSize(record.sizeBytes)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="epx-record-footer">
                  <span className="epx-storage-stamp">
                    Saved in browser storage (offline)
                  </span>

                  <div className="epx-action-buttons">
                    <button
                      type="button"
                      className="epx-tool-btn"
                      onClick={() => handleCopy(record)}
                      title="Copy notes to clipboard"
                      data-testid={`button-copy-${record.id}`}
                    >
                      {copiedId === record.id ? <Check size={13} color="#439e87" /> : <Copy size={13} />}
                      {copiedId === record.id ? 'Copied' : 'Copy notes'}
                    </button>

                    <button
                      type="button"
                      className="epx-tool-btn"
                      onClick={() => handleDownload(record)}
                      title="Download audio file to computer"
                      data-testid={`button-download-${record.id}`}
                    >
                      <Download size={13} /> Download .webm
                    </button>

                    <button
                      type="button"
                      className="epx-tool-btn epx-danger-btn"
                      onClick={() => handleDelete(record.id)}
                      title="Delete recording from storage"
                      data-testid={`button-delete-${record.id}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
      </div>
    </div>
  );
}
