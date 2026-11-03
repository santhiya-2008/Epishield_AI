import { Router, type IRouter } from "express";
import healthRouter from "./health";
import voiceRecordsRouter from "./voice-records";
import casesRouter from "./cases";

const router: IRouter = Router();

router.use(healthRouter);
router.use(voiceRecordsRouter);
router.use(casesRouter);

export default router;
