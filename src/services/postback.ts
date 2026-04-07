import { config } from "../config.js";
import { logger } from "../utils/logger.js";
import type { MappedEvent } from "./event-mapper.js";

function buildPostbackUrl(event: MappedEvent): string {
  const base = config.TM_POSTBACK_BASE_URL.replace(/\/+$/, "");
  const params = new URLSearchParams({
    clickid: event.clickId ?? "",
    amount: String(event.amount),
    currency: event.currency,
    transaction_id: event.transactionId,
    key: config.TM_POSTBACK_KEY,
  });

  return `${base}/?${params.toString()}`;
}

export async function firePostback(event: MappedEvent): Promise<boolean> {
  const url = buildPostbackUrl(event);

  logger.info("Firing TM postback", {
    url,
    eventType: event.type,
    clickId: event.clickId,
    amount: event.amount,
    transactionId: event.transactionId,
  });

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) {
      logger.info("TM postback succeeded", {
        status: response.status,
        transactionId: event.transactionId,
      });
      return true;
    }

    const body = await response.text().catch(() => "(unreadable)");
    logger.error("TM postback failed", {
      status: response.status,
      body,
      transactionId: event.transactionId,
    });
    return false;
  } catch (err) {
    logger.error("TM postback request error", {
      error: err instanceof Error ? err.message : String(err),
      transactionId: event.transactionId,
    });
    return false;
  }
}
