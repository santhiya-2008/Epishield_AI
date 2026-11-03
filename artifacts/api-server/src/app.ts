import express, { type Express } from "express";
import path from "node:path";
import fs from "node:fs";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api", router);

// Serve the built website (so one link serves both the site and the API)
const webDir = path.resolve(process.cwd(), "artifacts/epishield/dist/public");
if (fs.existsSync(webDir)) {
  app.use(express.static(webDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(webDir, "index.html"));
  });
}

export default app;
