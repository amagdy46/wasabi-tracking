import express, { type Request } from "express";
import { config } from "./config.js";
import { webhookRouter } from "./routes/webhook.js";
import { logger } from "./utils/logger.js";

const app = express();

// Parse JSON and capture raw body for HMAC signature verification
app.use(
  express.json({
    verify: (req: Request & { rawBody?: Buffer }, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(webhookRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(config.PORT, () => {
  logger.info(`Wasabi tracking service listening on port ${config.PORT}`);
});
