# Wasabi Tracking

Webhook service for WasabiZone Traffic Manager. Receives IPN/webhook events from affiliate platforms and forwards them as HTTPS postbacks to Traffic Manager.

## Supported Platforms

### CopeCart (`POST /webhook/copecart`)

Receives CopeCart IPN events (v1.6.7), verifies HMAC-SHA256 signature, and maps events to TM postbacks.

| CopeCart Event                 | Action             | Forwards? |
|-------------------------------|--------------------|-----------|
| `payment.made`                | sale               | Yes       |
| `payment.trial`               | trial              | Yes       |
| `payment.refunded`            | refund (neg $)     | Yes       |
| `payment.charged_back`        | chargeback (neg $) | Yes       |
| `payment.failed`              | log only           | No        |
| `payment.pending`             | log only           | No        |
| `payment.recurring.cancelled` | log only           | No        |
| `payment.recurring.upcoming`  | log only           | No        |

## Setup

```bash
cp .env.example .env
# Fill in required values
npm install
```

## Run

```bash
# Development (auto-reload)
npm run dev

# Production
npm run build
npm start
```

## Endpoints

| Method | Path                | Description                        |
|--------|---------------------|------------------------------------|
| POST   | `/webhook/copecart` | CopeCart IPN receiver               |
| GET    | `/health`           | Health check                        |

## Environment Variables

| Variable               | Description                              | Default              |
|------------------------|------------------------------------------|----------------------|
| `PORT`                 | Server port                              | `3000`               |
| `COPECART_IPN_SECRET`  | Shared secret from CopeCart IPN settings  | (required)           |
| `TM_POSTBACK_BASE_URL` | Traffic Manager postback base URL       | (required)           |
| `TM_POSTBACK_KEY`      | Traffic Manager postback key            | (required)           |
| `CLICK_ID_FIELD`       | IPN field containing the click ID       | `metadata`           |
| `AMOUNT_FIELD`         | IPN field for payout amount             | `transaction_amount` |
| `LOG_LEVEL`            | `debug` / `info` / `warn` / `error`     | `info`               |

## TM Postback Format

```
GET {TM_POSTBACK_BASE_URL}/?clickid={metadata}&amount={transaction_amount}&currency={transaction_currency}&transaction_id={transaction_id}&key={TM_POSTBACK_KEY}
```
