/**
 * Persistent Offline Voice Storage for EPISHIELD
 * Stores offline voice recordings in browser IndexedDB with LocalStorage fallback.
 * Enables review, playback, and export of voice recordings after chat and case reporting.
 */

import { generateDemoVoiceTone } from './offline-voice-recorder';

export interface StoredVoiceRecord {
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
  translationTarget?: 'en' | 'ta' | string;
  notes?: string;
}

const DB_NAME = 'epishield_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'voice_recordings';
const LOCAL_STORAGE_FALLBACK_KEY = 'epishield_voice_recordings_fallback';

function createVoiceId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `VR-${num}`;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('linkedCaseId', 'linkedCaseId', { unique: false });
        store.createIndex('zone', 'zone', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function notifyStorageChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('epishield:voice-storage-change'));
  }
}

// Fallback functions for environments without IndexedDB
function getLocalStorageRecords(): StoredVoiceRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStorageRecords(records: StoredVoiceRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('LocalStorage voice storage save failed:', e);
  }
}

export async function getAllVoiceRecords(): Promise<StoredVoiceRecord[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result as StoredVoiceRecord[];
        // Sort newest first
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // If completely empty on first launch, initialize with a sample demo recording
        if (results.length === 0) {
          initializeSampleRecord().then((seeded) => {
            if (seeded) {
              resolve([seeded]);
            } else {
              resolve([]);
            }
          });
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        resolve(getLocalStorageRecords());
      };
    });
  } catch {
    const records = getLocalStorageRecords();
    if (records.length === 0) {
      const sample = await initializeSampleRecord();
      return sample ? [sample] : [];
    }
    return records;
  }
}

async function initializeSampleRecord(): Promise<StoredVoiceRecord | null> {
  try {
    const sampleAudio = await generateDemoVoiceTone(2);
    const sampleRecord: StoredVoiceRecord = {
      id: 'VR-1082',
      title: 'Sample Field Audio Note · Zone A Monitoring',
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      durationSeconds: 14,
      audioDataUrl: sampleAudio || 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
      audioMimeType: 'audio/wav',
      sizeBytes: 42100,
      source: 'case-reporting',
      linkedCaseId: 'CS-1048',
      zone: 'Zone A',
      symptoms: ['Fever', 'Diarrhea'],
      language: 'ta',
      transcript: 'மண்டலம் A-ல் காய்ச்சல் மற்றும் வயிற்றுப்போக்கு அறிகுறி உடைய வழக்குகள் பதிவாகியுள்ளன.',
      translatedText: 'Cases with symptoms of fever and diarrhea have been reported in Zone A near central water station.',
      translationTarget: 'en',
      notes: 'Initial offline verification memo stored for public health team review.',
    };

    await saveVoiceRecord(sampleRecord);
    return sampleRecord;
  } catch {
    return null;
  }
}

export async function saveVoiceRecord(
  input: Omit<StoredVoiceRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<StoredVoiceRecord> {
  const record: StoredVoiceRecord = {
    ...input,
    id: input.id || createVoiceId(),
    createdAt: input.createdAt || new Date().toISOString(),
  };

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Saving to IndexedDB failed, using localStorage fallback:', err);
    const existing = getLocalStorageRecords().filter((r) => r.id !== record.id);
    saveLocalStorageRecords([record, ...existing]);
  }

  notifyStorageChange();

  // Dual-tier sync: Asynchronously send to backend persistent storage
  syncRecordToBackend(record).catch(() => {});

  return record;
}

export async function deleteVoiceRecord(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Deleting from IndexedDB failed, using localStorage fallback:', err);
    const existing = getLocalStorageRecords().filter((r) => r.id !== id);
    saveLocalStorageRecords(existing);
  }

  notifyStorageChange();

  // Dual-tier sync: Delete from backend persistent storage
  syncDeleteFromBackend(id).catch(() => {});
}

export async function clearAllVoiceRecords(): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Clearing IndexedDB failed, using localStorage fallback:', err);
    saveLocalStorageRecords([]);
  }

  notifyStorageChange();
}

export async function getVoiceStorageStats(): Promise<{
  count: number;
  totalDurationSeconds: number;
  totalSizeBytes: number;
}> {
  const records = await getAllVoiceRecords();
  const count = records.length;
  const totalDurationSeconds = records.reduce((acc, r) => acc + (r.durationSeconds || 0), 0);
  const totalSizeBytes = records.reduce((acc, r) => acc + (r.sizeBytes || 0), 0);
  return { count, totalDurationSeconds, totalSizeBytes };
}

/**
 * Backend API Synchronization Helpers
 */
async function syncRecordToBackend(record: StoredVoiceRecord): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/voice-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
  } catch {
    // Non-blocking: Offline-first architecture works even if network/backend is unavailable
  }
}

async function syncDeleteFromBackend(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(`/api/voice-records/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch {
    // Non-blocking
  }
}

