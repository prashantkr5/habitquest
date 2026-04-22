HabitQuest
Turn your life into a game. Build habits, earn XP, and compete globally.

HabitQuest is a full-stack gamified productivity platform that helps users build consistency through streaks, rewards, journaling, and social competition.

Why HabitQuest?

Most habit trackers are boring → users quit.

HabitQuest solves this by:

Adding gamification (XP, streaks, levels)
Introducing leaderboards & social interaction
Providing data-driven insights (sleep, habits, tasks)
Automating consistency via cron-based systems
Core Features
Productivity & Tracking
Habit tracking with streak system
Daily task manager (auto-reset after 24h)
Sleep tracker with analytics
Daily journaling system
Gamification Layer
XP-based reward system
Streak tracking
Global leaderboard
Social Features
Friend system
Compare streaks & progress
Notifications
Advanced Systems
Focus mode (Pomodoro-style)

Cron jobs for:
streak resets
expired tasks cleanup

Secure authentication (JWT + cookies)

Tech Stack
Frontend
React + Vite
React Router DOM
Framer Motion (animations)
Recharts (data visualization)
Lucide Icons
Backend
Node.js + Express
MongoDB + Mongoose
JWT Authentication
bcrypt (password hashing)
node-cron (automation)

Project Structure
habitquest/
│
├── Backend/
│   ├── Config/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Models/
│   ├── Routes/
│   ├── Utils/
│   └── Server.js
│
├── Frontend/
│   └── src/
│       ├── Components/
│       ├── Context/
│       ├── Pages/
│       └── App.jsx
│
└── README.md
Installation & Setup

Clone Repository
git clone https://github.com/prashantkr5/habitquest.git
cd habitquest

Backend Setup
cd Backend
npm install

Create .env file:

PORT=5001
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173

Run server:

npm run dev

Frontend Setup
cd Frontend
npm install
npm run dev

API Highlights
Method	Endpoint	Description
POST	/api/auth/register	Register user
POST	/api/auth/login	Login user
GET	/api/habits	Fetch habits
POST	/api/habits	Create habit
GET	/api/tasks	Daily tasks
POST	/api/sleep	Log sleep
GET	/api/social/leaderboard	Leaderboard

Security
JWT-based authentication
HTTP-only cookies
Rate limiting on auth routes
Password hashing with bcrypt

Deployment
Layer	Platform
Frontend	Vercel
Backend	Render

Future Improvements
Mobile app (React Native)
AI-based habit suggestions
Advanced analytics dashboard
Plugin system

Author
Keshav (Prashant Kumar)

Full-stack developer
Focus: scalable apps + design
License

This project is licensed under the MIT License.

Support
If you like this project:
Star the repo
Fork it
Share it

“Consistency beats motivation. HabitQuest makes consistency addictive.”
