# ☁️ SaaS / Cloud Deployment Guide

This guide covers deploying LogVault on an AWS EC2 instance.

## 1. Provision EC2 Instance
- **Instance Type**: Recommend `t3.medium` or higher.
- **OS**: Ubuntu 22.04 LTS.
- **Security Group Rules (Inbound)**:
  - SSH (TCP 22)
  - HTTP (TCP 80)
  - HTTPS (TCP 443)
  - Syslog UDP (UDP 514)
  - Syslog TCP (TCP 514)

## 2. Server Preparation
SSH into your new instance and install dependencies:
```bash
sudo apt update && sudo apt install docker.io -y
sudo snap install docker
sudo usermod -aG docker ubuntu
# Log out and log back in to apply docker group permissions
```

## 3. Deployment Flow
Clone the repo and configure your environment:
```bash
git clone https://github.com/your-org/logvault.git
cd logvault
cp .env.example .env
```
Edit `.env` to ensure `DOMAIN` is set (e.g., `logs.yourcompany.com`).

Run the deployment leveraging the compose override file:
```bash
docker compose -f docker-compose.yml -f docker-compose.saas.yml up -d --build
```

*(Note: Production SaaS should integrate a sidecar Let's Encrypt / Certbot container next to Nginx for automatic HTTPS termination based on the `DOMAIN` env variable).*
