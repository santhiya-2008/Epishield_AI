import { Router, type IRouter, type Request, type Response } from "express";
import {
  loadVoiceRecords,
  saveVoiceRecordsToDisk,
  type BackendVoiceRecord,
} from "../lib/storage";

const router: IRouter = Router();

// GET /api/voice-records - List all voice records
router.get("/voice-records", (_req: Request, res: Response) => {
  try {
    const records = loadVoiceRecords();
    res.json({
      success: true,
      count: records.length,
      records: [...records].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to load voice records" });
  }
});

// GET /api/voice-records/:id - Get a single voice record
router.get("/voice-records/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const records = loadVoiceRecords();
    const found = records.find((r) => r.id === id);
    if (!found) {
      res.status(404).json({ success: false, error: "Voice record not found" });
      return;
    }
    res.json({ success: true, record: found });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve voice record" });
  }
});

// POST /api/voice-records - Save or update a voice record
router.post("/voice-records", (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<BackendVoiceRecord>;
    if (!body || !body.id) {
      res.status(400).json({ success: false, error: "Record id is required" });
      return;
    }

    const record: BackendVoiceRecord = {
      id: body.id,
      title: body.title || `Voice Note ${new Date().toLocaleTimeString()}`,
      createdAt: body.createdAt || new Date().toISOString(),
      durationSeconds: Number(body.durationSeconds) || 0,
      audioDataUrl: body.audioDataUrl || "",
      audioMimeType: body.audioMimeType || "audio/webm",
      sizeBytes: Number(body.sizeBytes) || (body.audioDataUrl ? Math.round(body.audioDataUrl.length * 0.75) : 0),
      source: body.source || "quick-memo",
      linkedCaseId: body.linkedCaseId,
      zone: body.zone,
      symptoms: Array.isArray(body.symptoms) ? body.symptoms : [],
      transcript: body.transcript || "",
      language: body.language || "en",
      translatedText: body.translatedText || "",
      translationTarget: body.translationTarget || (body.language === 'ta' ? 'en' : 'ta'),
      notes: body.notes || "",
    };

    const currentRecords = loadVoiceRecords();
    const existingIndex = currentRecords.findIndex((r) => r.id === record.id);
    let updatedList: BackendVoiceRecord[];

    if (existingIndex >= 0) {
      updatedList = [...currentRecords];
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...record };
    } else {
      updatedList = [record, ...currentRecords];
    }

    saveVoiceRecordsToDisk(updatedList);
    res.status(201).json({ success: true, record });
  } catch (err) {
    console.error("Error saving voice record:", err);
    res.status(500).json({ success: false, error: "Failed to save voice record" });
  }
});

// DELETE /api/voice-records/:id - Delete a voice record
router.delete("/voice-records/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentRecords = loadVoiceRecords();
    const filtered = currentRecords.filter((r) => r.id !== id);

    if (filtered.length === currentRecords.length) {
      res.status(404).json({ success: false, error: "Record not found" });
      return;
    }

    saveVoiceRecordsToDisk(filtered);
    res.json({ success: true, deletedId: id, remainingCount: filtered.length });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete voice record" });
  }
});

export default router;
