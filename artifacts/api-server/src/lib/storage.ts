import fs from 'fs';
import path from 'path';

export interface BackendVoiceRecord {
  id: string;
  title: string;
  createdAt: string;
  durationSeconds: number;
  audioDataUrl: string;
  audioMimeType: string;
  sizeBytes: number;
  source: 'case-reporting' | 'voice-chat' | 'quick-memo';
  linkedCaseId?: string;
  zone?: string;
  symptoms?: string[];
  transcript?: string;
  language?: 'ta' | 'en' | string;
  translatedText?: string;
  translationTarget?: string;
  notes?: string;
}

export interface BackendCaseReport {
  id: string;
  zone: string;
  symptoms: string[];
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  notes: string;
  status: 'Review needed' | 'Reviewed' | 'Follow-up required';
  reportedAt: string;
  inputMode: 'manual' | 'voice' | 'sample';
  voiceRecordId?: string;
  audioDataUrl?: string;
  voiceDurationSeconds?: number;
}

const DATA_DIR = path.resolve(import.meta.dirname, '../../data');
const VOICE_FILE = path.join(DATA_DIR, 'voice-records.json');
const CASES_FILE = path.join(DATA_DIR, 'cases.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// In-memory cache + persistent disk storage
let voiceCache: BackendVoiceRecord[] | null = null;
let casesCache: BackendCaseReport[] | null = null;

export function loadVoiceRecords(): BackendVoiceRecord[] {
  if (voiceCache) return voiceCache;
  ensureDataDir();
  try {
    if (fs.existsSync(VOICE_FILE)) {
      const raw = fs.readFileSync(VOICE_FILE, 'utf-8');
      voiceCache = JSON.parse(raw);
      return voiceCache!;
    }
  } catch (e) {
    console.warn('Could not read voice records from file:', e);
  }
  voiceCache = [];
  return voiceCache;
}

export function saveVoiceRecordsToDisk(records: BackendVoiceRecord[]): void {
  voiceCache = records;
  ensureDataDir();
  try {
    fs.writeFileSync(VOICE_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write voice records to disk:', e);
  }
}

export function loadCaseReports(): BackendCaseReport[] {
  if (casesCache) return casesCache;
  ensureDataDir();
  try {
    if (fs.existsSync(CASES_FILE)) {
      const raw = fs.readFileSync(CASES_FILE, 'utf-8');
      casesCache = JSON.parse(raw);
      return casesCache!;
    }
  } catch (e) {
    console.warn('Could not read case reports from file:', e);
  }
  casesCache = [];
  return casesCache;
}

export function saveCaseReportsToDisk(reports: BackendCaseReport[]): void {
  casesCache = reports;
  ensureDataDir();
  try {
    fs.writeFileSync(CASES_FILE, JSON.stringify(reports, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write cases to disk:', e);
  }
}
