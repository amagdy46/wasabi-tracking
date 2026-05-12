import { z } from "zod";

export const CopecartEventType = z.enum([
  "payment.made",
  "payment.trial",
  "payment.failed",
  "payment.pending",
  "payment.refunded",
  "payment.charged_back",
  "payment.recurring.cancelled",
  "payment.recurring.upcoming",
]);

export type CopecartEventType = z.infer<typeof CopecartEventType>;

export const CopecartPaymentMethod = z.enum([
  "credit_card",
  "sepa",
  "sofort",
  "paypal",
  "invoice",
  "test",
]);

export const CopecartPaymentPlan = z.enum([
  "one_time_payment",
  "breakdown_payment",
  "abonnement",
]);

export const CopecartPaymentStatus = z.enum([
  "paid",
  "pending",
  "trial",
  "failed",
  "upcoming",
  "successed_refunded",
  "failed_refunded",
  "chargeback_succeeded",
  "chargeback_failed",
  "failed_as_chargeback",
  "test_paid",
  "test_trial",
  "test_successed_refunded",
]);

// CopeCart docs (v1.6.7, p.8): "sale" | "refund" | "chargeback".
export const CopecartTransactionType = z.enum([
  "sale",
  "refund",
  "chargeback",
]);

export const CopecartProductType = z.enum([
  "digital",
  "electronic_book",
  "event",
  "physical",
  "printed_book",
  "services",
]);

export const CopecartFrequency = z.enum([
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "half_yearly",
  "yearly",
]);

// CopeCart serializes JSON numbers as strings for Decimal fields.
const Decimal = z.coerce.number();
const Integer = z.coerce.number().int();

const TransactionAmountPerProduct = z.object({
  amount: Decimal,
  vat_amount: Decimal,
  slug: z.string().nullable(),
  is_addon: z.boolean(),
  name: z.string(),
  internal_name: z.string().nullable(),
});

/**
 * Full CopeCart IPN payload schema (v1.6.7).
 * See docs/IPN_CopeCart_v_1.6.7.pdf for the canonical reference.
 * Decimal/Integer fields are coerced because CopeCart sends them as JSON strings.
 */
export const CopecartIpnPayload = z.object({
  // --- Always present ---
  order_id: z.string(),
  order_date: z.string(),
  order_time: z.string().nullable(),
  order_source_identifier: z.string().nullable(),
  category_name: z.string().nullable().optional(),
  category_option_name: z.string().nullable().optional(),
  earned_amount: Decimal,
  quantity: Integer,
  total_number_of_payments: Integer.nullable(),
  payment_plan: CopecartPaymentPlan,
  payment_status: CopecartPaymentStatus,
  payment_method: CopecartPaymentMethod,
  is_cancelled_for: z.string().nullable().optional(),
  is_upsell: z.boolean(),
  is_addon: z.boolean(),
  product_id: z.string(),
  product_name: z.string(),
  product_type: CopecartProductType,
  buyer_id: z.string(),
  buyer_firstname: z.string(),
  buyer_lastname: z.string(),
  buyer_email: z.string(),
  buyer_phone_number: z.string().nullable().optional(),
  buyer_country: z.string(),
  buyer_country_code: z.string(),
  buyer_address: z.string().nullable().optional(),
  buyer_city: z.string().nullable().optional(),
  buyer_company_name: z.string().nullable().optional(),
  buyer_zipcode: z.string().nullable().optional(),
  buyer_vat_number: z.string().nullable().optional(),
  affiliate: z.string().nullable().optional(),
  shipping_price: Decimal.nullable().optional(),
  event_type: CopecartEventType,
  cash_flow_at: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  test_payment: z.boolean().optional(),
  buyer_subscribed_for_newsletter: z.boolean().optional(),
  line_item_amount: Decimal.optional(),
  line_item_vat_amount: Decimal.optional(),
  transaction_amount_per_product: z
    .array(TransactionAmountPerProduct)
    .optional(),
  transaction_vat_amount: Decimal.optional(),
  product_internal_name: z.string().nullable().optional(),
  metadata: z.string().nullable().optional(),

  // --- Recurring payment events only ---
  first_payment: Decimal.nullable().optional(),
  next_payments: Decimal.nullable().optional(),
  next_payment_at: z.string().nullable().optional(),
  frequency: CopecartFrequency.nullable().optional(),

  // --- Regular payment events only ---
  transaction_date: z.string().optional(),
  transaction_id: z.string().optional(),
  transaction_amount: Decimal.optional(),
  transaction_earned_amount: Decimal.optional(),
  transaction_currency: z.string().optional(),
  transaction_type: CopecartTransactionType.optional(),
  transaction_processed_at: z.string().optional(),
  rate_number: Integer.optional(),

  // --- payment.recurring.cancelled only ---
  subscription_state: z.string().optional(),
  cancelation_reason: z.string().optional(),
});

export type CopecartIpnPayload = z.infer<typeof CopecartIpnPayload>;
