# 🏗️ LogVault Architecture

LogVault uses a modular, containerized architecture optimized for scalability in both Appliance (on-premise) and SaaS (cloud) deployments.

## 1. Core Components

### Frontend (React + Vite)
- **Role**: Provides the web interface for log searching, analytics, and alert management.
- **Tech**: React 18, Tailwind CSS, Recharts, Zustand.
- **Network**: Served by Vite dev server locally, or built statically and served via Nginx in Prod.

### Backend (Node.js + Express)
- **Role**: Handles the heavy lifting of ingestion, normalization, querying, and chron jobs for alerts.
- **Tech**: Express.js, TypeScript, node-cron.
- **Listeners**:
  - `HTTP POST /api/ingest`: Listens for structured JSON logs.
  - `UDP/TCP 514`: Native `dgram` and `net` sockets for raw syslog streams.

### Storage Engine (PostgreSQL 16)
- **Role**: Primary datastore leveraging relational structures combined with JSONB columns.
- **Schema**: A unified log schema that accommodates all sources (Firewall, Network, M365, AWS, AD).

## 2. Data Flow
1. **Ingest**: Logs hit the Backend (via Syslog or HTTP API).
2. **Normalize**: The data is routed to the correct parser module matching its source. It is enriched with a `severity` score and unified standard fields.
3. **Store**: Inserted into Postgres `logs` table. Raw payload preserved in `raw` JSONB field.
4. **Evaluate**: Node-cron (`alert.service.ts`) queries recent logs against active rules. Matches trigger alerts.
5. **View**: React Dashboard fetches filtered stats directly from the DB via Prisma grouping.
