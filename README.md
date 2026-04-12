# ⚔️ LevelUp Learning: RPG Gamified Education Platform

LevelUp Learning is a high-fidelity MERN stack application that transforms educational aptitude trials into an immersive RPG experience. Users embark on "Quests," earn "XP," climb global "Leaderboards," and connect with allies through a real-time "Social Nexus."

---

## 🚀 Key Technologies & Stack

### **Frontend (The Blade)**
- **React 19 & Vite**: Ultra-fast performance and modern component architecture.
- **React Router 7**: Dynamic, user-specific routing (e.g., `/dashboard/username`).
- **Framer Motion & GSAP**: Premium micro-animations and smooth UI transitions.
- **Socket.io-Client**: Real-time friendship notifications and online status tracking.
- **Vanilla CSS & Tailwind**: Custom high-fidelity "Glassmorphism" aesthetics.

### **Backend (The Engine)**
- **Node.js & Express**: Scalable RESTful API architecture.
- **MongoDB & Mongoose**: Flexible document storage with a robust User & Friend system.
- **Socket.io**: Real-time event engine for instant social interactions.
- **JWT (JSON Web Tokens)**: Secure, self-hosted custom authentication system.
- **Bcrypt.js**: High-security password hashing.

---

## 🎮 Core RPG Features

### **1. Gamification Engine**
- **XP & Leveling**: A custom algorithm (Fisher-Yates) handles progression. Users gain XP from trials to rank up.
- **Stamina (Energy)**: A time-based refill system that limits daily trials, encouraging consistent training.
- **Currency System**: Earn "Gold" from perfect quest completions to use in future updates.
- **Streaks**: Tracks daily consistency to reward the most dedicated warriors.

### **2. Social Nexus (Real-Time)**
- **Friend System**: Send, receive, accept, or reject friend requests.
- **Online Tracking**: See when your allies are "Ready for Battle" via real-time socket updates.
- **Instant Notifications**: Toast notifications appear instantly when a scroll (friend request) is received.

### **3. ⚔️ 1v1 Battle Arena (Real-Time)**
- **Matchmaking Queue**: A server-side queue pairs online warriors based on availability.
- **XP Investment**: Players bet 50 XP. The winner takes the pot (DOUBLE reward), while the loser forfeits their investment.
- **Real-Time Synergy**: Battle progress, timer synchronization, and results are handled via a dedicated Socket.io namespace (`/battles`).
- **Anticheat Engine**: Server-side validation of scores and timing to ensure every victory is earned fairly.

### **4. Dynamic Routing**
- **Personalized URLs**: Every user has a unique, aesthetic profile link (e.g., `localhost:5173/dashboard/maq_`).
- **Protected Gateways**: Advanced route guarding ensures only authenticated heroes can access the AI Tutor and private maps.

### **4. AI Tutor & Quests**
- **AI-Powered Learning**: An integrated tutor to assist with difficult aptitude questions.
- **Mastery Paths**: Specific skill trees for WebDev, Aptitude, English, and Data Science.

---

## 🛠️ Installation & Setup

### **Backend Configuration**
1. Navigate to the `server` directory.
2. Create a `.env` file with the following:
   ```env
   PORT=***
   MONGODB_URI=mongodb:******
   JWT_SECRET=***
   ```
3. Run `npm install` and `npm start`.

### **Frontend Configuration**
1. Navigate to the `client` directory.
2. Run `npm install`.
3. Start the dev portal: `npm run dev`.

---

## 🗺️ Project Structure

```text
├── client/
│   ├── src/
│   │   ├── components/    # Reusable UI (Nav, Social, Dashboard)
│   │   ├── constants/     # Data (Quests, Badges, Avatars)
│   │   ├── api.js         # Centralized Network Layer
│   │   └── App.jsx        # Root Routing & State Hub
├── server/
│   ├── models/            # Database Schemas (User, FriendRequest)
│   ├── routes/            # API Entry Points
│   ├── controllers/       # Business Logic
│   └── server.js          # Main Entry & Socket Config
```

---

## 🏆 Development Principles
- **Aesthetic Excellence**: Vibrant colors, dark modes, and interactive hover effects.
- **State-of-the-Art UX**: Micro-animations and zero placeholders.
- **Security First**: Custom JWT auth with strict route protection.

**Level up your quest for knowledge today!** ⚔️
