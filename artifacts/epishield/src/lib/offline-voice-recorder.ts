/**
 * Offline Voice Recorder for EPISHIELD
 * Fully client-side voice recording using native MediaRecorder & Web Audio API.
 * Operates 100% offline with zero cloud API dependencies.
 */

export interface RecordingResult {
  blob: Blob;
  dataUrl: string;
  durationSeconds: number;
  sizeBytes: number;
  mimeType: string;
  language?: 'ta' | 'en';
  transcript?: string;
  translatedText?: string;
}

export class OfflineVoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number | null = null;
  private startTime: number = 0;
  private pausedDuration: number = 0;
  private pauseStartTime: number = 0;
  private isPaused: boolean = false;
  private isRecording: boolean = false;

  static isSupported(): boolean {
    return typeof window !== 'undefined' &&
      !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) &&
      typeof window.MediaRecorder !== 'undefined';
  }

  static getBestMimeType(): string {
    if (typeof MediaRecorder === 'undefined') return 'audio/webm';
    const candidateTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac',
    ];
    for (const type of candidateTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }

  async start(onVolumeChange?: (volume: number) => void): Promise<void> {
    if (!OfflineVoiceRecorder.isSupported()) {
      throw new Error('Offline voice recording is not supported on this browser or platform.');
    }

    // Reset chunks and state
    this.audioChunks = [];
    this.isPaused = false;
    this.pausedDuration = 0;

    try {
      try {
        this.audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (micErr) {
        // Fallback to basic audio constraint for restrictive mobile devices (iOS Safari / budget Android)
        this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      // Set up Web Audio API analyser for live volume & waveform
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.audioContext = new AudioCtx();
          if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
          }
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 64;
          this.sourceNode = this.audioContext.createMediaStreamSource(this.audioStream);
          this.sourceNode.connect(this.analyser);

          if (onVolumeChange) {
            const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            const checkVolume = () => {
              if (!this.isRecording) return;
              if (this.analyser && !this.isPaused) {
                this.analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const average = sum / dataArray.length;
                const normalized = Math.min(1, average / 128);
                onVolumeChange(normalized);
              } else {
                onVolumeChange(0);
              }
              this.animationFrameId = requestAnimationFrame(checkVolume);
            };
            this.animationFrameId = requestAnimationFrame(checkVolume);
          }
        } catch (audioCtxErr) {
          console.warn('Web Audio Analyser setup skipped:', audioCtxErr);
        }
      }

      const mimeType = OfflineVoiceRecorder.getBestMimeType();
      const options = mimeType ? { mimeType } : undefined;
      this.mediaRecorder = new MediaRecorder(this.audioStream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      try {
        this.mediaRecorder.start(250); // collect chunks every 250ms
      } catch {
        this.mediaRecorder.start(); // fallback for mobile browsers that disallow timeslice
      }
      this.startTime = Date.now();
      this.isRecording = true;
    } catch (err: unknown) {
      this.cleanup();
      const errorMsg = (err instanceof Error) ? err.message : String(err);
      if (errorMsg.includes('Permission') || errorMsg.includes('NotAllowedError')) {
        throw new Error('Microphone permission denied. Please allow microphone access to record offline voice.');
      }
      throw new Error(`Could not start offline recording: ${errorMsg}`);
    }
  }

  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.pauseStartTime = Date.now();
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;
      this.pausedDuration += Date.now() - this.pauseStartTime;
    }
  }

  getDurationSeconds(): number {
    if (!this.isRecording || this.startTime === 0) return 0;
    const now = this.isPaused ? this.pauseStartTime : Date.now();
    const elapsed = now - this.startTime - this.pausedDuration;
    return Math.max(0, Math.floor(elapsed / 1000));
  }

  async stop(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanup();
        reject(new Error('No active offline recording to stop.'));
        return;
      }

      const mimeType = this.mediaRecorder.mimeType || OfflineVoiceRecorder.getBestMimeType() || 'audio/webm';
      const durationSeconds = this.getDurationSeconds();

      this.mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(this.audioChunks, { type: mimeType });
          const sizeBytes = blob.size;
          const dataUrl = await blobToDataUrl(blob);

          this.cleanup();
          resolve({
            blob,
            dataUrl,
            durationSeconds: Math.max(1, durationSeconds),
            sizeBytes,
            mimeType,
          });
        } catch (err) {
          this.cleanup();
          reject(err);
        }
      };

      try {
        this.mediaRecorder.stop();
      } catch (err) {
        this.cleanup();
        reject(err);
      }
    });
  }

  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore on cancel
      }
    }
    this.cleanup();
  }

  private cleanup(): void {
    this.isRecording = false;
    this.isPaused = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {}
      this.sourceNode = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    this.analyser = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert recorded audio blob to base64 data URL'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function formatAudioDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function downloadAudioFile(dataUrl: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Generates an offline audio data URL containing an illustrative health beep/chime tone
 * using the Web Audio API offline context, so initial demo records have real playable audio!
 */
export async function generateDemoVoiceTone(durationSec = 2): Promise<string> {
  try {
    const sampleRate = 22050;
    const numFrames = sampleRate * durationSec;
    const OfflineCtx = window.OfflineAudioContext || (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
    if (!OfflineCtx) return '';

    const ctx = new OfflineCtx(1, numFrames, sampleRate);
    
    // Create tone oscillators
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440, 0); // A4
    osc1.frequency.exponentialRampToValueAtTime(880, durationSec * 0.5);
    osc1.frequency.exponentialRampToValueAtTime(587.33, durationSec); // D5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(220, 0);
    osc2.frequency.exponentialRampToValueAtTime(440, durationSec);

    gain.gain.setValueAtTime(0.01, 0);
    gain.gain.linearRampToValueAtTime(0.3, 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, durationSec);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(0);
    osc2.start(0);
    osc1.stop(durationSec);
    osc2.stop(durationSec);

    const renderedBuffer = await ctx.startRendering();

    // Convert audio buffer to WAV blob
    const wavBlob = audioBufferToWav(renderedBuffer);
    return await blobToDataUrl(wavBlob);
  } catch (e) {
    console.warn('Could not synthesize sample voice audio tone:', e);
    return '';
  }
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF identifier
  out.setUint8(pos++, 'R'.charCodeAt(0));
  out.setUint8(pos++, 'I'.charCodeAt(0));
  out.setUint8(pos++, 'F'.charCodeAt(0));
  out.setUint8(pos++, 'F'.charCodeAt(0));
  setUint32(length - 8);
  out.setUint8(pos++, 'W'.charCodeAt(0));
  out.setUint8(pos++, 'A'.charCodeAt(0));
  out.setUint8(pos++, 'V'.charCodeAt(0));
  out.setUint8(pos++, 'E'.charCodeAt(0));

  // fmt subchunk
  out.setUint8(pos++, 'f'.charCodeAt(0));
  out.setUint8(pos++, 'm'.charCodeAt(0));
  out.setUint8(pos++, 't'.charCodeAt(0));
  out.setUint8(pos++, ' '.charCodeAt(0));
  setUint32(16); // SubChunk1Size (16 for PCM)
  setUint16(1); // AudioFormat (1 = PCM)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // ByteRate
  setUint16(numOfChan * 2); // BlockAlign
  setUint16(16); // BitsPerSample

  // data subchunk
  out.setUint8(pos++, 'd'.charCodeAt(0));
  out.setUint8(pos++, 'a'.charCodeAt(0));
  out.setUint8(pos++, 't'.charCodeAt(0));
  out.setUint8(pos++, 'a'.charCodeAt(0));
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}
