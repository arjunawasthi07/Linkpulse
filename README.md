# ⚡ LinkPulse

### Scalable URL Shortener & Real-Time Analytics Engine

**LinkPulse** is a full-stack URL shortener with link management, secure authentication, Redis caching, and click analytics.

**[Live Demo](https://linkpulse-hazel.vercel.app/)** · **[GitHub Repository](https://github.com/arjunawasthi07/Linkpulse)** · **[API Health Check](https://linkpulse-api-9w2r.onrender.com/health)**

## ✨ Features

- ⚡ **Fast redirects:** Redis caching for frequently accessed links.
- 📊 **Click analytics:** Track clicks and available visitor information.
- 🔒 **Secure authentication:** JWT-based login and registration with bcrypt password hashing.
- 🎯 **Custom short links:** Generate short URLs and custom slugs, where supported.
- 📱 **QR codes:** Generate QR codes for sharing links.
- ⏳ **Link management:** Manage links and their active status and expiration, where supported.
- 📈 **Analytics dashboard:** View click totals and traffic trends.
- 🛡️ **Security:** Role-based access control and rate limiting.

## 🏗️ Architecture

```text
React + Vite Frontend
        |
        v
Express.js REST API
   |           |
   v           v
PostgreSQL    Redis
(Prisma ORM)  (Caching)
```

## 🛠️ Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Caching:** Redis, ioredis
- **Authentication:** JWT, bcryptjs
- **Deployment:** Vercel (frontend), Render (backend)
- **Containers:** Docker, Docker Compose

## 🚀 Live Deployment

| Service | URL |
|---|---|
| Frontend | https://linkpulse-hazel.vercel.app/ |
| Backend API | https://linkpulse-api-9w2r.onrender.com/ |
| Health Check | https://linkpulse-api-9w2r.onrender.com/health |

> The backend runs on Render's free instance, so the first request after inactivity may take longer.

## 💻 Run Locally

### Prerequisites

- Node.js and npm
- PostgreSQL
- Redis, if using caching locally
- Git

### 1. Clone the repository

```bash
git clone https://github.com/arjunawasthi07/Linkpulse.git
cd Linkpulse
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/` using your local configuration:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="your_local_postgresql_connection_string"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="replace_with_a_long_random_secret"
CLIENT_URL="http://localhost:5173"
BASE_URL="http://localhost:5000"
```

Use your actual local database settings. Never commit `.env` files or real secrets to GitHub.

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Start the backend

```bash
npm run dev
```

### 5. Start the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

> If you use Docker Compose instead, follow the configuration provided in the repository.

## 🔐 Security Notes

- Passwords are hashed with bcryptjs before storage.
- JWTs are used for authenticated requests.
- Public registrations are assigned the `USER` role.
- Store secrets in environment variables and deployment settings, not in source code.
- Configure administrator access through a controlled process.

## 👤 Author

**Arjun Awasthi**

- GitHub: [@arjunawasthi07](https://github.com/arjunawasthi07)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
