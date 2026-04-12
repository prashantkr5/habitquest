require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectDB = require('./Config/db');
const userRoutes = require('./Routes/UserRoutes');
const authRoutes = require('./Routes/authRoutes');

const app = express();

// middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// DB connect
connectDB();

const habitRoutes = require('./Routes/habitRoutes');
const taskRoutes = require('./Routes/taskRoutes');
const journalRoutes = require('./Routes/journalRoutes');
const notificationRoutes = require('./Routes/notificationRoutes');
const activityRoutes = require('./Routes/activityRoutes');
const sleepRoutes = require('./Routes/sleepRoutes');
const socialRoutes = require('./Routes/socialRoutes');

// routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/social', socialRoutes);

// start scheduled jobs
const startCronJobs = require('./Utils/cronJobs');
startCronJobs();

// test route
app.get('/', (req, res) => {
  res.send("API running");
});

// server start
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});



