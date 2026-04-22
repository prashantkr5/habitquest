
<h1 align="center">
  ⚔️ HabitQuest
</h1>

<p align="center">
  <b>Gamified habit tracking — turn your daily routine into an adventure.</b><br/>
  Build streaks, log sleep, complete tasks, journal your progress, and compete on the global leaderboard.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | JWT-based register / login with HTTP-only cookies |
| ✅ **Habits** | Create, track, and streak habits with a visual heatmap |
| 📝 **Tasks** | Daily to-do list — completed tasks auto-expire after 24 h |
| 😴 **Sleep Tracker** | Log sleep sessions and visualize trends with Recharts |
| 📓 **Journal** | Private daily journal entries |
| 🏆 **Leaderboard** | Global streak ranking across all registered users |
| 👤 **Profile** | Upload avatar, view XP, streaks, and activity stats |
| 🔔 **Notifications** | In-app notification system |
| ⏱️ **Focus Mode** | Dedicated focus / Pomodoro page |
| 🤝 **Social** | Friend system and social interactions |
| 🤖 **Cron Jobs** | Automated background tasks (streak resets, cleanup) |

---

## 🗂️ Project Structure

```
habit-quest/
├── Backend/
│   ├── Config/          # MongoDB connection
│   ├── Controllers/     # Route handler logic
│   ├── Middleware/      # Auth & validation middleware
│   ├── Models/          # Mongoose schemas (User, Habit, Task, Sleep, Journal, Activity, Notification)
│   ├── Routes/          # Express routers
│   ├── Utils/           # Cron jobs & helpers
│   ├── Server.js        # App entry point
│   └── .env.example     # Environment variable template
│
└── Frontend/
    └── src/
        ├── Components/  # Reusable UI (Sidebar, TopNav, Layout, Footer…)
        ├── Context/     # React Context for global state
        ├── Pages/       # Dashboard, Habits, Tasks, Sleep, Journal, Social, Profile, Focus
        └── App.jsx      # Routing
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **Vite 7**
- **React Router DOM v7** — client-side routing
- **Framer Motion** — animations & transitions
- **Recharts** — sleep & activity charts
- **Lucide React** — icon set
- Deployed on **Vercel**

### Backend
- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose 9**
- **JWT** + **bcryptjs** — authentication
- **node-cron** — scheduled background jobs
- **express-rate-limit** — DDoS / brute-force protection
- **compression** — GZIP response compression
- Deployed on **Render**

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- A MongoDB Atlas cluster (or local MongoDB)

### 1 — Clone the repo

```bash
git clone https://github.com/prashantkr5/habitquest.git
cd habitquest
```

### 2 — Backend setup

```bash
cd Backend
cp .env.example .env      # fill in your values (see below)
npm install
npm run dev               # starts on http://localhost:5001
```

#### Required environment variables (`Backend/.env`)

```env
PORT=5001
NODE_ENV=development

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>

# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_super_secret_key_here

# Your frontend origin (no trailing slash)
FRONTEND_URL=http://localhost:5173
```

### 3 — Frontend setup

```bash
cd Frontend
cp .env.example .env      # set VITE_API_URL
npm install
npm run dev               # starts on http://localhost:5173
```

---

## 🌐 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login & receive JWT cookie |
| GET | `/api/habits` | Get user habits |
| POST | `/api/habits` | Create a habit |
| GET | `/api/tasks` | Get today's tasks |
| POST | `/api/sleep` | Log a sleep entry |
| GET | `/api/journal` | Get journal entries |
| GET | `/api/social/leaderboard` | Global streak leaderboard |
| GET | `/api/notifications` | Fetch notifications |

> Auth routes are rate-limited to **10 requests / 15 min** per IP. All other API routes allow **200 requests / min**.

---

## ☁️ Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Frontend | **Vercel** | `vercel.json` already configured with SPA rewrites |
| Backend | **Render** | Set all `.env` vars in the Render dashboard |

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

<p align="center">Made with ❤️ by <b>Keshav</b></p>
