# eUdyaan backend

Secure Express/PostgreSQL API for the eUdyaan Android mental-wellness app.

## Development

1. Copy `.env.example` to `.env` and replace every secret.
2. Set a strong `POSTGRES_PASSWORD`, then run `docker compose up -d`.
3. Install Python classifier requirements:
   `python3 -m pip install -r mental_health_ml/requirements.txt`.
4. Run `npm install`, `npm run check`, `npm test`, then `npm start`.

`DB_SYNC=true` is provided only for a new local development database. Production
deployments must use reviewed migrations and leave `DB_SYNC` disabled.

## Android-facing API

- `POST /api/auth/signup`, `POST /api/auth/login`, `GET/PATCH /api/auth/me`
- `GET /api/doctors`, doctor availability under `/api/doctors/:id/slots`
- appointments under `/api/appointments`
- community posts under `/api/discussion`
- resources and feedback under `/api/resources`
- mood journal under `/api/moods`
- notifications under `/api/notifications`
- chatbot/direct care chat under `/api/chat`

Protected routes require `Authorization: Bearer <token>`.

## Chatbot response

Send a bot message by omitting `receiverId`:

```json
{
  "message": "exam ka pressure handle nahi ho raha"
}
```

The response contains the stored user message, bot reply, and a `support` object
with a support topic, confidence, support level, and human-review flag. Topics
are routing hints, never diagnoses. Explicit self-harm language bypasses ML and
activates the crisis response.

The shipped training set contains 8,640 synthetic, non-identifiable messages in
15 categories. Its independent synthetic evaluation is recorded in
`mental_health_ml/artifacts/metrics.json`. The score must not be described as
clinical validation. Before real deployment, obtain clinical/ethics review,
test consented local data across languages and demographic groups, implement a
staff escalation queue, publish retention/deletion policies, and configure
location-appropriate emergency resources.
