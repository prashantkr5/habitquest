require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./Config/db');

const app = express();

// ─── 1. GZIP COMPRESS all responses (cuts bandwidth ~70%) ────────────────────
app.use(compression());

// ─── 2. CORS ─────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  // FRONTEND_URL can be comma-separated: "https://a.vercel.app,https://b.vercel.app"
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(u => u.trim().replace(/\/$/, ''))
    : [])
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));


// ─── 3. Body parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// ─── 4. RATE LIMITING ────────────────────────────────────────────────────────
// Global: max 200 requests per minute per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please slow down.' }
});

// Auth routes: stricter — 10 login attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, try again later.' }
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── 5. Connect DB ───────────────────────────────────────────────────────────
connectDB();

// ─── Routes ──────────────────────────────────────────────────────────────────
const userRoutes          = require('./Routes/UserRoutes');
const authRoutes          = require('./Routes/authRoutes');
const habitRoutes         = require('./Routes/habitRoutes');
const taskRoutes          = require('./Routes/taskRoutes');
const journalRoutes       = require('./Routes/journalRoutes');
const notificationRoutes  = require('./Routes/notificationRoutes');
const activityRoutes      = require('./Routes/activityRoutes');
const sleepRoutes         = require('./Routes/sleepRoutes');
const socialRoutes        = require('./Routes/socialRoutes');

app.use('/api/users',         userRoutes);
app.use('/api/auth',          authRoutes);
app.use('/api/habits',        habitRoutes);
app.use('/api/tasks',         taskRoutes);
app.use('/api/journal',       journalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity',      activityRoutes);
app.use('/api/sleep',         sleepRoutes);
app.use('/api/social',        socialRoutes);

// ─── Cron jobs ───────────────────────────────────────────────────────────────
const startCronJobs = require('./Utils/cronJobs');
startCronJobs();

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', uptime: Math.floor(process.uptime()) + 's' });
});

// ─── 6. GLOBAL ERROR HANDLER — stops unhandled errors from crashing the server
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack || err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

// ─── Catch unhandled Promise rejections (don't crash the process) ────────────
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  // Don't call process.exit() — nodemon will restart if needed
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
