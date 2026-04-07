import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

/**
 * Express middleware that verifies the CopeCart HMAC-SHA256 signature.
 *
 * Expects `req.rawBody` to be set by the JSON parser's `verify` callback
 * (see index.ts). The signature is Base64-encoded HMAC-SHA256 of the raw
 * request body using the shared IPN secret.
 */
export function verifySignature(req: Request, res: Response, next: NextFunction): void {
  const signature = req.headers["x-copecart-signature"] as string | undefined;

  if (!signature) {
    logger.warn("Missing X-Copecart-Signature header", {
      ip: req.ip,
    });
    res.status(401).send("Missing signature");
    return;
  }

  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody) {
    logger.error("Raw body not captured — check express.json verify config");
    res.status(500).send("Internal error");
    return;
  }

  const generated = crypto
    .createHmac("sha256", config.COPECART_IPN_SECRET)
    .update(rawBody)
    .digest("base64");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(generated))) {
    logger.warn("Invalid CopeCart signature", {
      ip: req.ip,
      expected: generated,
      received: signature,
    });
    res.status(401).send("Invalid signature");
    return;
  }

  next();
}
