# eUdyaan Backend

The REST API for eUdyaan, a role-aware student support and wellbeing platform that connects students, doctors, administrators, learning resources, community discussions, appointments, and an optional AI chat assistant.

The service is built with Express, Sequelize, PostgreSQL, and JWT authentication. It keeps authorization close to each route so public content, authenticated actions, student workflows, and administrator operations have explicit boundaries.

## Capabilities

- User registration, login, JWT authentication, and profile retrieval
- Student, doctor, and administrator role authorization
- Appointment booking, personal appointment history, and doctor/admin status updates
- Direct message history and optional Gemini-backed assistant conversations
- Community discussions with likes, comments, nested replies, editing, and moderation
- Resource catalogue management with student feedback
- Sequelize models and associations backed by PostgreSQL
- Central response and error-handling utilities

## Architecture

```mermaid
flowchart LR
    Client[Web or mobile client] --> API[Express REST API]
    API --> Auth[JWT and role middleware]
    Auth --> Controllers[Domain controllers]
    Controllers --> Models[Sequelize models]
    Models --> PG[(PostgreSQL)]
    Controllers --> Gemini[Gemini API - optional chat]
```

## Technology stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js, CommonJS |
| API | Express 5 |
| Database | PostgreSQL, Sequelize |
| Authentication | JSON Web Tokens, bcrypt |
| AI integration | Google Generative AI |
| Logging and middleware | Morgan, CORS, cookie-parser |

## Repository structure

```text
eUdyaan-Backend/
├── config/          database connection
├── controllers/     domain workflows
├── middleware/      authentication, authorization, errors
├── models/          Sequelize entities and relationships
├── routes/          REST route modules
├── utils/           shared response helpers
├── server.js        application bootstrap
└── package.json
```

## Local development

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL database

### Install

```bash
git clone https://github.com/Sandeshkumar0/eUdyaan-Backend.git
cd eUdyaan-Backend
npm install
```

### Configure

Create a `.env` file in the repository root:

```dotenv
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eudyaan
JWT_SECRET=replace-with-a-long-random-value

# Optional: required only for AI assistant responses
GEMINI_API_KEY=
```

Never commit the populated `.env` file.

The current Sequelize connection enables SSL for PostgreSQL. For a strictly local PostgreSQL instance, adjust `config/db.js` or use a local server configuration that accepts the connection settings.

### Run

```bash
npm start
```

The server synchronizes the Sequelize schema at startup and listens on `http://localhost:3001` unless `PORT` is set.

Check service availability:

```bash
curl http://localhost:3001/
```

## API overview

All domain routes are mounted below `/api`.

### Authentication

| Method | Route | Access |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Authenticated |
| `GET` | `/api/auth/admin` | Administrator |

### Appointments

| Method | Route | Access |
| --- | --- | --- |
| `POST` | `/api/appointments` | Student |
| `GET` | `/api/appointments` | Authenticated user; returns own scope |
| `PATCH` | `/api/appointments/:id/status` | Doctor or administrator |

### Chat

| Method | Route | Access |
| --- | --- | --- |
| `POST` | `/api/chat` | Authenticated |
| `GET` | `/api/chat/:receiverId` | Authenticated |

Use `receiverId: "bot"` for the assistant conversation path supported by the controller.

### Discussions

The discussion API supports listing and creating discussions, reading or updating individual threads, likes, comments, replies, and administrator deletion. The base route is `/api/discussion`.

### Resources

| Method | Route | Access |
| --- | --- | --- |
| `GET` | `/api/resources` | Public |
| `POST` | `/api/resources` | Administrator |
| `PUT/DELETE` | `/api/resources/:id` | Administrator |
| `GET` | `/api/resources/:id/feedback` | Public |
| `POST` | `/api/resources/:id/feedback` | Authenticated |

## Data model

The service exports models for:

- users and doctors
- appointments
- discussions, comments, replies, and likes
- chats and notifications
- resources and feedback

Sequelize relationships are declared alongside the model layer. `sequelize.sync()` currently applies the schema during startup; production deployments should move to versioned migrations before data compatibility matters.

## Error and authorization model

- `protect` validates the bearer token and attaches the authenticated user.
- Role middleware limits student, doctor, and administrator operations.
- `notFound` and `errorHandler` return centralized API errors after route resolution.
- Controllers use the shared response helper to keep success/error payloads consistent.

Clients should send authenticated requests with:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

## Current limitations

- There is no automated test suite or CI workflow yet.
- API documentation is maintained manually rather than generated from an OpenAPI schema.
- `sequelize.sync()` is convenient for development but should be replaced by migrations in production.
- The repository's `docker-compose.yml` provisions MongoDB, while the current application uses PostgreSQL; it is legacy infrastructure and is not required to run this API.
- `socket.io` is installed but realtime chat is not wired into `server.js`.
- Rate limiting, refresh tokens, password recovery, email verification, and audit logging are not implemented.

## Recommended production roadmap

- Publish and validate an OpenAPI 3 specification
- Add unit and integration tests with an isolated PostgreSQL database
- Introduce Sequelize migrations and seed commands
- Add refresh-token rotation and account recovery
- Add Socket.IO chat and notification authorization
- Add appointment reminders and conflict detection
- Add structured logs, request IDs, rate limits, and health/readiness endpoints
- Replace legacy MongoDB Compose configuration with PostgreSQL services

## License

The package currently declares the ISC license. Add a root `LICENSE` file before external distribution.
