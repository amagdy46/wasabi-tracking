import type { CopecartEventType, CopecartIpnPayload } from "../types/copecart.js";
import { config } from "../config.js";

export interface MappedEvent {
  forward: boolean;
  type: "sale" | "trial" | "refund" | "chargeback" | "cancelled" | "upcoming" | "failed" | "pending";
  clickId: string | null;
  amount: number;
  currency: string;
  transactionId: string;
  orderId: string;
  productId: string;
  productName: string;
  isTest: boolean;
  raw: CopecartIpnPayload;
}

interface EventAction {
  forward: boolean;
  type: MappedEvent["type"];
  negateAmount?: boolean;
}

const EVENT_CONFIG: Record<CopecartEventType, EventAction> = {
  "payment.made":                { forward: true,  type: "sale" },
  "payment.trial":               { forward: true,  type: "trial" },
  "payment.refunded":            { forward: true,  type: "refund",     negateAmount: true },
  "payment.charged_back":        { forward: true,  type: "chargeback", negateAmount: true },
  "payment.failed":              { forward: false, type: "failed" },
  "payment.pending":             { forward: false, type: "pending" },
  "payment.recurring.cancelled": { forward: false, type: "cancelled" },
  "payment.recurring.upcoming":  { forward: false, type: "upcoming" },
};

function extractClickId(payload: CopecartIpnPayload): string | null {
  const field = config.CLICK_ID_FIELD as keyof CopecartIpnPayload;
  const value = payload[field];
  if (typeof value === "string" && value.length > 0) return value;
  return null;
}

function extractAmount(payload: CopecartIpnPayload, negate: boolean): number {
  const field = config.AMOUNT_FIELD as keyof CopecartIpnPayload;
  const raw = payload[field];
  const value = typeof raw === "number" ? raw : 0;
  return negate ? Math.abs(value) * -1 : Math.abs(value);
}

export function mapEvent(payload: CopecartIpnPayload): MappedEvent {
  const action = EVENT_CONFIG[payload.event_type];

  return {
    forward: action.forward,
    type: action.type,
    clickId: extractClickId(payload),
    amount: extractAmount(payload, action.negateAmount ?? false),
    currency: payload.transaction_currency ?? "EUR",
    transactionId: payload.transaction_id ?? payload.order_id,
    orderId: payload.order_id,
    productId: payload.product_id,
    productName: payload.product_name,
    isTest: payload.test_payment ?? false,
    raw: payload,
  };
}
