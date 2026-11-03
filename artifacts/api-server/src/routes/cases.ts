import { Router, type IRouter, type Request, type Response } from "express";
import {
  loadCaseReports,
  saveCaseReportsToDisk,
  type BackendCaseReport,
} from "../lib/storage";

const router: IRouter = Router();

// GET /api/cases - List all cases
router.get("/cases", (_req: Request, res: Response) => {
  try {
    const cases = loadCaseReports();
    res.json({
      success: true,
      count: cases.length,
      cases: [...cases].sort(
        (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
      ),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to load case reports" });
  }
});

// GET /api/cases/:id - Get a single case
router.get("/cases/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cases = loadCaseReports();
    const found = cases.find((c) => c.id === id);
    if (!found) {
      res.status(404).json({ success: false, error: "Case not found" });
      return;
    }
    res.json({ success: true, caseReport: found });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve case report" });
  }
});

// POST /api/cases - Save or update a case report
router.post("/cases", (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<BackendCaseReport>;
    if (!body || !body.id) {
      res.status(400).json({ success: false, error: "Case id is required" });
      return;
    }

    const report: BackendCaseReport = {
      id: body.id,
      zone: body.zone || "Zone Central",
      symptoms: Array.isArray(body.symptoms) ? body.symptoms : [],
      severity: body.severity || "Moderate",
      notes: body.notes || "",
      status: body.status || "Review needed",
      reportedAt: body.reportedAt || new Date().toISOString(),
      inputMode: body.inputMode || "manual",
      voiceRecordId: body.voiceRecordId,
      audioDataUrl: body.audioDataUrl,
      voiceDurationSeconds: body.voiceDurationSeconds,
    };

    const currentCases = loadCaseReports();
    const existingIndex = currentCases.findIndex((c) => c.id === report.id);
    let updatedList: BackendCaseReport[];

    if (existingIndex >= 0) {
      updatedList = [...currentCases];
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...report };
    } else {
      updatedList = [report, ...currentCases];
    }

    saveCaseReportsToDisk(updatedList);
    res.status(201).json({ success: true, caseReport: report });
  } catch (err) {
    console.error("Error saving case report:", err);
    res.status(500).json({ success: false, error: "Failed to save case report" });
  }
});

export default router;
