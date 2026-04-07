import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  COPECART_IPN_SECRET: z.string().min(1),
  TM_POSTBACK_BASE_URL: z.string().url(),
  TM_POSTBACK_KEY: z.string().min(1),
  CLICK_ID_FIELD: z.string().default("metadata"),
  AMOUNT_FIELD: z
    .enum(["transaction_amount", "earned_amount", "transaction_earned_amount"])
    .default("transaction_amount"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
