<div align="center">

# ⚡ LinkPulse

### Scalable URL Shortener & Real-Time Analytics Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17+-336791.svg)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7.4+-dc382d.svg)](https://redis.io)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-6+-2d3748.svg)](https://prisma.io)

**Engineered by [Arjun Awasthi](https://github.com/arjunawasthi07)**

</div>

---

## 🚀 Overview

**LinkPulse** is a production-grade link management and traffic intelligence platform. It turns lengthy URLs into ultra-fast short links while capturing deep visitor analytics—including geographic location, device hardware, operating system, browser engine, and referrer source—completely asynchronously without adding latency to the redirect.

Designed with modern full-stack best practices: **sub-millisecond Redis caching**, **Prisma ORM**, **PostgreSQL**, **JWT authentication**, **role-based access control (RBAC)**, and an interactive **React + Vite** dashboard.

---

## ✨ Features

| Feature | Description |
|---|---|
| ⚡ **Lightning Redirects** | In-memory Redis slug cache for sub-millisecond 302 redirects |
| 📊 **Deep Click Intelligence** | Asynchronous tracking of Country, City, Device type, OS, Browser, and Referrer |
| 🔒 **Passcode Protected Links** | Secure Bcrypt-hashed gate requiring visitor passcode before destination redirect |
| 🎯 **Custom Slugs & Aliases** | Generate random 6-character Nanoid slugs or brand-tailored aliases |
| 📱 **Built-in QR Code Generator** | Instant QR code preview and 1-click PNG download for every link |
| ⏳ **Link Expiration & Pausing** | Set automatic expiration timestamps or toggle links active/paused on demand |
| 📈 **Interactive Visual Dashboard** | Visual line charts (24h, 7d, 30d timelines), device donuts, and geographic distributions |
| 🛡️ **Rate Limiting & Security** | Endpoint brute-force protection, Helmet security headers, sanitized CORS |
| 🔑 **Stateless JWT & Admin Panel** | User registration/login with RBAC (User / Admin) and platform-wide moderation tools |

---

## 🏛️ System Architecture

```
┌─────────────────┐       ┌────────────────────────────────────────────────────────┐
│  React + Vite   │──────▶│                 Express API Server                      │
│ (Modern Web UI) │       │                                                        │
└─────────────────┘       │  /api/auth       JWT Registration & Login               │
                          │  /api/links      Create, manage, and toggle links       │
                          │  /api/analytics  Aggregated visitor & click stats       │
                          │  /api/admin      Platform moderation & metrics          │
                          │  /:slug          Sub-millisecond redirect engine        │
                          └──────────────┬────────────────────────┬────────────────┘
                                         │                        │
                              ┌──────────▼──────────┐   ┌─────────▼──────────┐
                              │  PostgreSQL (v17)   │   │   Redis (v7.4)     │
                              │  Prisma Database    │   │ In-Memory Slug Hit │
                              └─────────────────────┘   └────────────────────┘
```

### High-Speed Redirect & Analytics Flow

```
GET /:slug
    │
    ├──▶ 1. Check Redis Cache
    │         ├── Hit & Active ──▶ Send immediate 302 Redirect!
    │         │                          │
    │         │                    [Async Worker]
    │         │                    Log IP, GeoIP, Device, Browser & Referrer
    │         │
    │         └── Miss ──────────▶ 2. Query PostgreSQL Database
    │                                    │
    │                                    ├── Has Password? ──▶ Redirect to /p/:slug (Passcode Gate)
    │                                    ├── Expired / Paused ──▶ Return 410 Status Page
    │                                    └── Valid ──▶ Warm Redis Cache (24h) ──▶ Send 302 Redirect
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6, Lucide Icons, Canvas-Confetti, Vanilla CSS Tokens
- **Backend**: Node.js, Express, Helmet, CORS, Express-Rate-Limit
- **Database & ORM**: PostgreSQL 17, Prisma ORM
- **Cache**: Redis 7.4 (`ioredis` client with graceful fallback)
- **Security**: JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`)
- **Intelligence**: `geoip-lite`, `ua-parser-js`, `qrcode`, `nanoid`
- **Containers**: Docker, Docker Compose

---

## 🚦 Quickstart Guide

### Option 1: Run with Docker Compose (Recommended)

Run the entire stack with a single command:

```bash
docker compose up -d --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

---

### Option 2: Run Locally (Development Mode)

#### 1. Clone the repository
```bash
git clone https://github.com/arjunawasthi07/Linkpulse.git
cd linkpulse
```

#### 2. Start PostgreSQL & Redis
If you have Docker installed:
```bash
docker compose up -d postgres redis
```

#### 3. Setup Server
```bash
cd server
cp .env.example .env
npm install
npx prisma db push
npm run dev
```

#### 4. Setup Client
Open a second terminal window:
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Environment Variables

### Server (`server/.env`)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://appuser:localdevpassword@localhost:5432/shortener?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="linkpulse_secure_jwt_secret_token_key_2026"
CLIENT_URL="http://localhost:5173"
BASE_URL="http://localhost:5000"
```

---

## 📜 API Reference

### Links
- `POST /api/links` — Shorten a destination URL (supports custom slug, title, password, expiration)
- `GET /api/links` — Retrieve user's shortened links with pagination & search
- `GET /api/links/:id` — Get link details and QR code
- `PUT /api/links/:id` — Update link status, title, expiration, or password
- `DELETE /api/links/:id` — Permanently delete a link and its analytics
- `GET /api/links/qr/:slug` — Retrieve QR code for link

### Analytics
- `GET /api/analytics/summary` — User portfolio-level click metrics and 7-day trend
- `GET /api/analytics/:id?range=30d` — Deep-dive analytics (timeline, devices, browsers, OS, countries, referrers, raw stream)

### Redirect Engine
- `GET /:slug` — High-speed 302 redirect with asynchronous click ingestion
- `GET /api/gate-info/:slug` — Password protection status check
- `POST /api/verify-password/:slug` — Verify passcode and receive target destination

---

## 👤 Author

**Arjun Awasthi**
- GitHub: [@arjunawasthi07](https://github.com/arjunawasthi07)
- Email: arjunawasthiaj07@gmail.com

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
