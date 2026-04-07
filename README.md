# CopeCart Webhook

Receives CopeCart IPN events and forwards them as HTTPS postbacks to Traffic Manager (WasabiZone).

## Data Flow

```
CopeCart IPN (POST JSON) → This Service → Traffic Manager Postback (GET)
```

## Event Mapping

| CopeCart Event                 | Action          | Forwards? |
|-------------------------------|-----------------|-----------|
| `payment.made`                | sale            | Yes       |
| `payment.trial`               | trial           | Yes       |
| `payment.refunded`            | refund (neg $)  | Yes       |
| `payment.charged_back`        | chargeback (neg $) | Yes    |
| `payment.failed`              | log only        | No        |
| `payment.pending`             | log only        | No        |
| `payment.recurring.cancelled` | log only        | No        |
| `payment.recurring.upcoming`  | log only        | No        |

## Setup

```bash
cp .env.example .env
# Fill in COPECART_IPN_SECRET, TM_POSTBACK_KEY, etc.
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

## Environment Variables

| Variable               | Description                                  | Default              |
|------------------------|----------------------------------------------|----------------------|
| `PORT`                 | Server port                                  | `3000`               |
| `COPECART_IPN_SECRET`  | Shared secret from CopeCart IPN settings      | (required)           |
| `TM_POSTBACK_BASE_URL` | Traffic Manager postback base URL            | (required)           |
| `TM_POSTBACK_KEY`      | Traffic Manager postback key                 | (required)           |
| `CLICK_ID_FIELD`       | IPN field containing the click ID            | `metadata`           |
| `AMOUNT_FIELD`         | IPN field for payout amount                  | `transaction_amount` |
| `LOG_LEVEL`            | `debug` / `info` / `warn` / `error`          | `info`               |

## Endpoints

- `POST /webhook/copecart` — CopeCart IPN receiver (signature-verified)
- `GET /health` — Health check

## TM Postback Format

```
GET {TM_POSTBACK_BASE_URL}/?clickid={metadata}&amount={transaction_amount}&currency={transaction_currency}&transaction_id={transaction_id}&key={TM_POSTBACK_KEY}
```

## Signature Verification

CopeCart signs every IPN with HMAC-SHA256 (Base64). The `X-Copecart-Signature` header is verified against the raw request body using the shared IPN secret.
