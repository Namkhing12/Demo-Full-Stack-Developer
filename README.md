# 📋 LogVault — Demo Log Management System

> Full-Stack Log Management ที่รองรับแหล่งข้อมูลหลากหลาย พร้อม Normalize, Search, Visualize, Alert  
> Deploy ได้ทั้งแบบ Appliance (Docker Compose) และ SaaS/Cloud (AWS EC2 + HTTPS)

---

## 1. Tech Stack

| Layer | Technology | เหตุผล |
|---|---|---|
| **Runtime** | Node.js 20 LTS + TypeScript | Type-safe, ecosystem ใหญ่ |
| **Backend** | Express.js | Lightweight, รองรับ middleware chain, จัดการ Syslog + HTTP ใน process เดียว |
| **ORM** | Prisma | Auto-generate types, migration ง่าย, JSONB support |
| **Database** | PostgreSQL 16 (JSONB + GIN Index) | Full-text search, JSONB flexible schema, partition by time |
| **Frontend** | React 18 (Vite) + Tailwind CSS | Fast HMR, utility-first styling |
| **Charts** | Recharts | Composable, React-native, รองรับ Timeline/Bar/Pie |
| **Auth** | JWT (Access 15m + Refresh 7d) + bcrypt | Stateless, multi-tenant claim ใน token |
| **Syslog** | Node.js `dgram` (UDP) + `net` (TCP) | รันรวมใน Express process, ไม่ต้องแยก service |
| **Alert** | node-cron (ทุก 1 นาที) + Nodemailer | Lightweight, ไม่ต้อง message queue |
| **Reverse Proxy** | Nginx | TLS termination, static file serving |
| **Container** | Docker + Docker Compose | Appliance mode 1 คำสั่ง |
| **Cloud** | AWS EC2 (Ubuntu 22.04) | SaaS mode + Let's Encrypt HTTPS |
| **CI/CD** | GitHub Actions | Auto test + deploy on push |

---

## 2. Timeline (10 วัน)

### Phase 1 — Foundation (Day 1–2)

| Day | Task | Output |
|---|---|---|
| 1 | Init repo, Docker Compose (Node + PostgreSQL + Nginx), Prisma schema + migration, `.env.example` | `docker-compose up` รันได้ |
| 2 | Auth module: Register/Login, JWT issue/verify, RBAC middleware (Admin/Viewer), Tenant isolation middleware | `POST /auth/login` + `POST /auth/register` พร้อมใช้ |

### Phase 2 — Ingestion & Normalization (Day 3–4)

| Day | Task | Output |
|---|---|---|
| 3 | Syslog listener (UDP 514 + TCP 514), HTTP ingest endpoint (`POST /api/ingest`), Normalizer service: Syslog parser (Firewall + Network) | ส่ง Syslog → เห็นใน DB ภายใน 1 นาที |
| 4 | JSON batch import (`POST /api/ingest/batch`), Normalizer: CrowdStrike / AWS CloudTrail / M365 / AD mapper, Seed scripts + sample files | รองรับ 6 sources ทั้งหมด |

### Phase 3 — Dashboard & Search (Day 5–7)

| Day | Task | Output |
|---|---|---|
| 5 | React setup (Vite + Tailwind + React Router), Login page, Layout (Sidebar + Header) | Frontend skeleton พร้อม Auth flow |
| 6 | Dashboard page: Top 10 IP / User / EventType (Bar chart), Event Timeline (Line chart), Filter bar (tenant, source, severity, date range) | Dashboard ทำงานครบ |
| 7 | Log Search page: Full-text search + table with pagination, Log detail modal (raw JSON), Export CSV | ค้นหา + ดู log ได้ |

### Phase 4 — Alert & Security (Day 8)

| Day | Task | Output |
|---|---|---|
| 8 | Alert engine: node-cron ทุก 1 นาที ตรวจ rules, Default rule: login failed ≥ 5 ครั้ง จาก IP เดียว ใน 5 นาที, Alert page (list triggered alerts), Webhook/Email notification, Retention cron: auto-delete logs > 7 วัน | Alert rule ทำงาน + แจ้งเตือนสำเร็จ |

### Phase 5 — Deploy & Docs (Day 9–10)

| Day | Task | Output |
|---|---|---|
| 9 | Deploy SaaS: EC2 + Nginx + Let's Encrypt HTTPS, Test Acceptance Checklist ทุกข้อ, Fix bugs | URL เดโมพร้อมใช้ |
| 10 | เขียน docs: `architecture.md`, `setup_appliance.md`, `setup_saas.md`, Record demo video 30 นาที, Postman collection, Final cleanup + tag release | ส่งมอบครบ |

---

## 3. Project Structure

```
log-management/
│
├── docker-compose.yml          # Appliance: node + postgres + nginx
├── docker-compose.saas.yml     # SaaS overrides (TLS, domain)
├── .env.example                # Required env vars
├── Makefile                    # dev, build, seed, test shortcuts
│
├── docs/
│   ├── architecture.md         # Diagram + data flow + tenant model
│   ├── setup_appliance.md      # Step-by-step appliance install
│   └── setup_saas.md           # AWS EC2 + HTTPS setup guide
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── prisma/
│   │   ├── schema.prisma       # Unified log schema + User + AlertRule
│   │   ├── migrations/
│   │   └── seed.ts             # Default admin user + sample alert rule
│   │
│   └── src/
│       ├── server.ts           # Express + Syslog listener bootstrap
│       │
│       ├── config/
│       │   └── env.ts          # Validated env variables
│       │
│       ├── routes/
│       │   ├── auth.routes.ts      # POST /auth/login, /auth/register
│       │   ├── ingest.routes.ts    # POST /api/ingest, /api/ingest/batch
│       │   ├── logs.routes.ts      # GET  /api/logs, /api/logs/stats
│       │   └── alerts.routes.ts    # CRUD /api/alerts, GET /api/alerts/triggered
│       │
│       ├── services/
│       │   ├── syslog.service.ts       # UDP/TCP 514 listener → normalizer
│       │   ├── normalizer.service.ts   # Source-specific parsers → unified schema
│       │   ├── parsers/
│       │   │   ├── firewall.parser.ts      # Syslog key=value parser
│       │   │   ├── network.parser.ts       # Router syslog parser
│       │   │   ├── crowdstrike.parser.ts   # JSON → normalized
│       │   │   ├── aws.parser.ts           # CloudTrail JSON → normalized
│       │   │   ├── m365.parser.ts          # M365 audit JSON → normalized
│       │   │   └── ad.parser.ts            # Windows Security EventID → normalized
│       │   ├── alert.service.ts        # Cron job: evaluate rules → trigger
│       │   └── retention.service.ts    # Cron job: delete logs > 7 days
│       │
│       ├── middleware/
│       │   ├── auth.middleware.ts       # JWT verify + role check
│       │   └── tenant.middleware.ts     # Extract tenant from token/header
│       │
│       ├── utils/
│       │   ├── jwt.ts
│       │   └── logger.ts
│       │
│       └── types/
│           └── log.types.ts        # NormalizedLog interface
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   ├── index.html
│   │
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                 # React Router setup
│       │
│       ├── api/
│       │   └── client.ts          # Axios instance + JWT interceptor
│       │
│       ├── hooks/
│       │   ├── useAuth.ts         # Login/logout/token refresh
│       │   └── useLogs.ts         # Fetch logs + stats
│       │
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── Dashboard.tsx      # Charts + filters
│       │   ├── LogSearch.tsx      # Search + table + detail modal
│       │   └── Alerts.tsx         # Alert rules CRUD + triggered list
│       │
│       ├── components/
│       │   ├── Layout.tsx         # Sidebar + Header + Outlet
│       │   ├── FilterBar.tsx      # Tenant, source, severity, date range
│       │   ├── TopNChart.tsx      # Bar chart: top IP/User/EventType
│       │   ├── TimelineChart.tsx  # Line chart: events over time
│       │   ├── LogTable.tsx       # Paginated log table
│       │   └── ProtectedRoute.tsx # Role-based route guard
│       │
│       └── utils/
│           └── constants.ts
│
├── nginx/
│   ├── default.conf            # Reverse proxy → backend:3001, frontend:5173
│   └── ssl/                    # Self-signed certs (or Let's Encrypt)
│
├── samples/
│   ├── firewall.syslog         # Sample syslog messages
│   ├── network.syslog          # Router syslog samples
│   ├── crowdstrike.json        # CrowdStrike sample events
│   ├── aws_cloudtrail.json     # AWS CloudTrail sample
│   ├── m365_audit.json         # Microsoft 365 audit sample
│   ├── ad_security.json        # Windows Security EventID samples
│   ├── send_syslog.sh          # Bash: send syslog via nc/logger
│   └── post_logs.py            # Python: batch POST to /api/ingest
│
├── tests/
│   ├── ingest.test.ts          # Ingest endpoint + normalization
│   ├── auth.test.ts            # Login/register + RBAC
│   └── alert.test.ts           # Alert rule evaluation
│
└── .github/
    └── workflows/
        └── ci.yml              # Lint + test + build + deploy
```

---

## 4. Use Cases

### UC1: Ingest Firewall/Network Syslog

| Item | Detail |
|---|---|
| **Actor** | Firewall, Router, หรือ `send_syslog.sh` |
| **Trigger** | ส่ง Syslog UDP/TCP ไปยัง port 514 |
| **Flow** | 1) `syslog.service.ts` รับ raw message → 2) `firewall.parser.ts` หรือ `network.parser.ts` parse key=value → 3) `normalizer.service.ts` map เป็น unified schema → 4) Prisma `create()` insert เข้า PostgreSQL |
| **Result** | Log ปรากฏใน Dashboard/Search ภายใน < 1 นาที |
| **Error** | Parse ล้มเหลว → เก็บใน `raw` field + tag `_parse_error` |

### UC2: Ingest via HTTP API

| Item | Detail |
|---|---|
| **Actor** | External application, CrowdStrike simulator, script |
| **Trigger** | `POST /api/ingest` พร้อม JSON body (single) หรือ `POST /api/ingest/batch` (array) |
| **Flow** | 1) Auth middleware ตรวจ JWT → 2) Validate required fields (`tenant`, `source`, `@timestamp`) → 3) Route ไปยัง parser ตาม `source` field → 4) Normalize + store |
| **Result** | `201 Created` + log ID |
| **Error** | Invalid JSON → `400`, Unauthorized → `401`, Wrong tenant → `403` |

### UC3: Batch Import Sample Files

| Item | Detail |
|---|---|
| **Actor** | Admin |
| **Trigger** | `POST /api/ingest/batch` พร้อม JSON array หรือ ใช้ `post_logs.py` script |
| **Flow** | 1) รับ array of log objects → 2) Loop: detect source → parse → normalize → 3) Prisma `createMany()` bulk insert |
| **Result** | `201` + count of inserted logs |
| **Supported** | AWS CloudTrail, M365 Audit, AD Security, CrowdStrike (JSON format) |

### UC4: Search & Filter Logs

| Item | Detail |
|---|---|
| **Actor** | Admin, Viewer |
| **Trigger** | `GET /api/logs?q=keyword&tenant=demoA&source=firewall&from=...&to=...&page=1` |
| **Flow** | 1) Tenant middleware กรอง tenant ตาม JWT claim → 2) Build Prisma query (GIN index full-text + filters) → 3) Return paginated results |
| **Result** | JSON: `{ data: [...], total, page, pageSize }` |
| **Frontend** | LogSearch page: table + detail modal + export CSV |

### UC5: View Dashboard

| Item | Detail |
|---|---|
| **Actor** | Admin, Viewer |
| **Trigger** | เปิดหน้า Dashboard + เลือก filter (tenant, source, date range) |
| **API** | `GET /api/logs/stats?tenant=...&from=...&to=...` |
| **Widgets** | 1) **Top 10 Source IP** — Bar chart 2) **Top 10 Users** — Bar chart 3) **Top Event Types** — Pie chart 4) **Event Timeline** — Line chart (group by hour) 5) **Severity Breakdown** — Stacked bar |
| **Result** | Real-time dashboard ที่ filter ตาม tenant/time ได้ |

### UC6: Create & Trigger Alert Rule

| Item | Detail |
|---|---|
| **Actor** | Admin |
| **Trigger** | `POST /api/alerts` สร้าง rule |
| **Example Rule** | `{ name: "Brute Force", condition: { event_type: "LogonFailed", threshold: 5, window_minutes: 5, group_by: "src_ip" } }` |
| **Flow** | 1) node-cron ทุก 1 นาที → 2) Query logs ใน time window → 3) GROUP BY `src_ip` → HAVING count ≥ threshold → 4) Insert triggered alert → 5) ส่ง Webhook/Email (Nodemailer) |
| **Frontend** | Alerts page: แสดง rule list + triggered alerts + status |

### UC7: RBAC & Multi-Tenant

| Item | Detail |
|---|---|
| **Actor** | Admin, Viewer |
| **Roles** | **Admin**: CRUD alert rules, ดู logs ทุก tenant, จัดการ users / **Viewer**: ดู logs เฉพาะ tenant ตัวเอง, read-only dashboard |
| **Flow** | 1) Login → JWT มี `{ userId, role, tenant }` → 2) `auth.middleware.ts` ตรวจ role → 3) `tenant.middleware.ts` inject tenant filter เข้า query อัตโนมัติ |
| **Result** | Viewer เห็นเฉพาะข้อมูล tenant ตัวเอง, Admin เห็นทั้งหมด |

### UC8: Deploy Appliance

| Item | Detail |
|---|---|
| **Actor** | DevOps / กรรมการ |
| **Command** | `cp .env.example .env && docker-compose up -d` |
| **Result** | ระบบพร้อมใช้: Frontend (80), Backend API (3001), Syslog (514 UDP/TCP) |
| **Requirement** | Ubuntu 22.04+, 4 vCPU, 8 GB RAM, 40 GB Disk |

### UC9: Deploy SaaS (AWS)

| Item | Detail |
|---|---|
| **Actor** | DevOps |
| **Flow** | 1) Provision EC2 (t3.medium) → 2) Install Docker + Compose → 3) Clone repo → 4) `docker-compose -f docker-compose.saas.yml up -d` → 5) Nginx + Let's Encrypt auto-HTTPS |
| **Result** | กรรมการเข้าใช้ผ่าน `https://demo.example.com` |
| **CI/CD** | GitHub Actions: push to `main` → SSH deploy to EC2 |

### UC10: Auto Retention

| Item | Detail |
|---|---|
| **Trigger** | node-cron ทุกวัน 02:00 |
| **Flow** | `DELETE FROM logs WHERE timestamp < NOW() - INTERVAL '7 days'` (แบ่ง batch 1000 rows ป้องกัน lock) |
| **Result** | ข้อมูลเก่ากว่า 7 วันถูกลบอัตโนมัติ |

---

## 5. Data Flow

```
╔══════════════════════════════════════════════════════════════════════╗
║                        LOG SOURCES                                  ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  🔥 Firewall ──► Syslog UDP 514 ──┐                                ║
║  🌐 Network  ──► Syslog TCP 514 ──┤                                ║
║  📱 App/API  ──► POST /api/ingest ─┤                                ║
║  🛡️ CrowdStrike ► POST (JSON) ────┤                                ║
║  ☁️ AWS       ──► POST (batch) ────┤                                ║
║  📧 M365      ──► POST (batch) ────┤                                ║
║  🖥️ AD/Win    ──► POST (batch) ────┘                                ║
║                                                                      ║
╚════════════════════════════╦═════════════════════════════════════════╝
                             ▼
╔══════════════════════════════════════════════════════════════════════╗
║                   INGESTION LAYER (Express.js)                       ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ┌─────────────┐    ┌──────────────────────────────────────┐        ║
║  │ Syslog      │    │         Normalizer Service           │        ║
║  │ Listener    │───►│                                      │        ║
║  │ (UDP+TCP)   │    │  firewall.parser ─┐                  │        ║
║  └─────────────┘    │  network.parser  ──┤                  │        ║
║                      │  crowdstrike ─────┤  ► Unified       │        ║
║  ┌─────────────┐    │  aws.parser ──────┤    Schema        │        ║
║  │ HTTP Ingest │───►│  m365.parser ─────┤    (NormalizedLog)│        ║
║  │ Routes      │    │  ad.parser ───────┘                  │        ║
║  └─────────────┘    └──────────────┬───────────────────────┘        ║
║                                     │                                ║
║                      ┌──────────────▼───────────────┐               ║
║                      │     Validate + Enrich        │               ║
║                      │  (optional: GeoIP, rDNS)     │               ║
║                      └──────────────┬───────────────┘               ║
║                                     │                                ║
╚═════════════════════════════════════╪════════════════════════════════╝
                                      ▼
╔══════════════════════════════════════════════════════════════════════╗
║              STORAGE LAYER (PostgreSQL 16 + Prisma)                  ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ┌──────────────────────────────────────────────────────────┐       ║
║  │                    Table: logs                            │       ║
║  │  ─────────────────────────────────────────────────────   │       ║
║  │  id (UUID PK)                                            │       ║
║  │  timestamp (TIMESTAMPTZ) ◄── GIN INDEX                   │       ║
║  │  tenant (VARCHAR)        ◄── INDEX (tenant isolation)    │       ║
║  │  source (ENUM: firewall|crowdstrike|aws|m365|ad|api|net) │       ║
║  │  vendor, product (VARCHAR)                               │       ║
║  │  event_type, event_subtype (VARCHAR) ◄── GIN INDEX       │       ║
║  │  severity (INT 0-10) ◄── INDEX                           │       ║
║  │  action (ENUM: allow|deny|create|delete|login|logout)    │       ║
║  │  src_ip, dst_ip (INET) ◄── GIN INDEX                    │       ║
║  │  src_port, dst_port (INT)                                │       ║
║  │  protocol, user, host, process (VARCHAR)                 │       ║
║  │  url, http_method, status_code                           │       ║
║  │  rule_name, rule_id                                      │       ║
║  │  cloud (JSONB: account_id, region, service)              │       ║
║  │  raw (JSONB) ◄── Original payload preserved              │       ║
║  │  tags (TEXT[])                                            │       ║
║  │  created_at (TIMESTAMPTZ)                                │       ║
║  └──────────────────────────────────────────────────────────┘       ║
║                                                                      ║
║  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐       ║
║  │ Table: users   │  │ Table: alerts  │  │ Table: triggered│       ║
║  │ id, email,     │  │ id, name,      │  │ _alerts         │       ║
║  │ password_hash, │  │ condition,     │  │ id, alert_id,   │       ║
║  │ role, tenant,  │  │ tenant,        │  │ matched_logs,   │       ║
║  │ created_at     │  │ active,        │  │ notified,       │       ║
║  └────────────────┘  │ created_at     │  │ created_at      │       ║
║                       └────────────────┘  └─────────────────┘       ║
║                                                                      ║
╚════════════╦═══════════════════╦══════════════════╦══════════════════╝
             │                   │                  │
             ▼                   ▼                  ▼
╔════════════════════╗ ╔══════════════════╗ ╔═══════════════════╗
║   REST API Layer   ║ ║  Alert Engine    ║ ║ Retention Cron    ║
╠════════════════════╣ ╠══════════════════╣ ╠═══════════════════╣
║                    ║ ║                  ║ ║                   ║
║ GET  /api/logs     ║ ║ Every 1 min:    ║ ║ Daily 02:00:      ║
║   → search+filter  ║ ║ 1. Load active  ║ ║ DELETE WHERE      ║
║   → pagination     ║ ║    rules        ║ ║ timestamp < 7d    ║
║                    ║ ║ 2. Query logs   ║ ║ (batch 1000)      ║
║ GET  /api/logs/    ║ ║    in window    ║ ║                   ║
║   stats            ║ ║ 3. GROUP BY     ║ ╚═══════════════════╝
║   → aggregations   ║ ║    + HAVING     ║
║                    ║ ║ 4. Insert       ║
║ Auth middleware:   ║ ║    triggered    ║
║   JWT verify       ║ ║ 5. Notify       ║
║   + tenant filter  ║ ║    (Webhook/    ║
║                    ║ ║     Email)      ║
╚════════╦═══════════╝ ╚════════╦═════════╝
         │                      │
         ▼                      ▼
╔══════════════════════════════════════════════════════════════════════╗
║                    FRONTEND (React 18 + Vite)                        ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  ┌────────────┐ ║
║  │   Login     │  │  Dashboard  │  │ Log Search │  │   Alerts   │ ║
║  │             │  │             │  │            │  │            │ ║
║  │ email/pass  │  │ Top 10 IP   │  │ Full-text  │  │ Rule CRUD  │ ║
║  │ → JWT token │  │ Top 10 User │  │ search     │  │ Triggered  │ ║
║  │ → redirect  │  │ Top Events  │  │ Filter bar │  │ list       │ ║
║  │             │  │ Timeline    │  │ Pagination │  │ Status     │ ║
║  │             │  │ Severity    │  │ Detail     │  │            │ ║
║  │             │  │ Filter bar  │  │ modal      │  │            │ ║
║  │             │  │             │  │ Export CSV │  │            │ ║
║  └─────────────┘  └─────────────┘  └────────────┘  └────────────┘ ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
                             ▼
╔══════════════════════════════════════════════════════════════════════╗
║                    DEPLOYMENT                                        ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Appliance (Docker Compose)        SaaS (AWS EC2)                   ║
║  ┌───────────────────────┐        ┌───────────────────────────┐    ║
║  │ docker-compose up -d  │        │ EC2 t3.medium (Ubuntu)    │    ║
║  │                       │        │ + Docker Compose           │    ║
║  │ nginx    :80/:443     │        │ + Nginx + Let's Encrypt   │    ║
║  │ backend  :3001        │        │ + Security Group:          │    ║
║  │ frontend :5173        │        │   80/443/514 (UDP+TCP)    │    ║
║  │ postgres :5432        │        │                           │    ║
║  │ syslog   :514 UDP/TCP │        │ GitHub Actions → SSH      │    ║
║  └───────────────────────┘        │ auto-deploy on push       │    ║
║                                    └───────────────────────────┘    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## Quick Start (Appliance)

```bash
# 1. Clone
git clone https://github.com/your-repo/log-management.git
cd log-management

# 2. Config
cp .env.example .env

# 3. Run
docker-compose up -d

# 4. Seed (admin user + sample data)
docker-compose exec backend npx prisma db seed

# 5. Test syslog
echo '<134>Mar 17 20:00:00 fw01 action=deny src=10.0.1.10 dst=8.8.8.8' | nc -u localhost 514

# 6. Test HTTP ingest
curl -X POST http://localhost:3001/api/ingest \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tenant":"demoA","source":"api","event_type":"test","@timestamp":"2026-03-17T20:00:00Z"}'

# 7. Open UI
open http://localhost
# Admin: admin@demo.com / admin123
# Viewer: viewer@demo.com / viewer123
```
---

## License

MIT
