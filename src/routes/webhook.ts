import { Router, type Request, type Response } from "express";
import { CopecartIpnPayload } from "../types/copecart.js";
import { verifySignature } from "../middleware/verify-signature.js";
import { mapEvent } from "../services/event-mapper.js";
import { firePostback } from "../services/postback.js";
import { logger } from "../utils/logger.js";

export const webhookRouter = Router();

webhookRouter.post("/webhook/copecart", verifySignature, async (req: Request, res: Response) => {
  const parsed = CopecartIpnPayload.safeParse(req.body);

  if (!parsed.success) {
    logger.warn("Invalid IPN payload", {
      errors: parsed.error.flatten().fieldErrors,
    });
    res.status(400).send("Invalid payload");
    return;
  }

  const payload = parsed.data;
  const event = mapEvent(payload);

  logger.info("Received CopeCart IPN", {
    eventType: payload.event_type,
    orderId: payload.order_id,
    productName: payload.product_name,
    clickId: event.clickId,
    amount: event.amount,
    forward: event.forward,
    isTest: event.isTest,
  });

  if (!event.forward) {
    logger.info("Event type not configured for forwarding, skipping postback", {
      eventType: payload.event_type,
      orderId: payload.order_id,
    });
    // CopeCart requires "OK" response to acknowledge receipt
    res.status(200).send("OK");
    return;
  }

  if (!event.clickId) {
    logger.warn("No click ID found in payload, skipping postback", {
      eventType: payload.event_type,
      orderId: payload.order_id,
      field: "metadata",
    });
    res.status(200).send("OK");
    return;
  }

  await firePostback(event);

  // Always respond OK so CopeCart doesn't retry
  res.status(200).send("OK");
});
