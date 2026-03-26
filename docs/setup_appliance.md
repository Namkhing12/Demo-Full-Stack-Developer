# 📦 Appliance Deployment Guide

This guide is for deploying LogVault on a standalone server or VM using Docker Compose.

## Prerequisites
- Docker Engine installed
- Docker Compose v2+ installed
- Open Ports: 80 (HTTP), 3001 (API), 514 (Syslog UDP/TCP)

## Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/logvault.git
   cd logvault
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and change default secrets if desired
   ```

3. **Start the Stack**
   ```bash
   docker compose up -d
   ```
   This will bring up PostgreSQL, Backend (API & Syslog), and Frontend containers.

4. **Initialize Database and Seed Data**
   ```bash
   docker compose exec backend npx prisma migrate deploy
   docker compose exec backend npx prisma db seed
   ```

5. **Access the Application**
   Open your browser and navigate to `http://localhost` (or your server's IP address).
   - Use the seeded Admin credentials to log in.

6. **Send Test Logs**
   ```bash
   sh ./samples/send_syslog.sh "<134>Mar 17 20:00:00 fw01 action=deny src=10.0.1.10 dst=8.8.8.8"
   ```
