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

### **3. 🪄 AI Summoner's Circle**
- **Dynamic Quiz Generation**: Input any subject and difficulty level to instantly manifest custom MCQ trials.
- **Provider Agnostic**: Integrated support for **Google Gemini**, **OpenAI**, and **NVIDIA NIM** models.
- **Sage Insights**: Real-time AI explanations for every missed phase, turning failures into teaching moments.

### **4. ⚔️ Battle Arena & Subject Paths**
- **Expanded Curriculum**: Specific mastery paths for **Agentic AI, DSA, Mathematics, Chemistry, and Physics**.
- **Real-Time Matchmaking**: Queue-based 1v1 battles with XP wagers and real-time score syncing.

### **5. 🏰 Production Architecture**
- **Monolithic Deployment**: Optimized to run on **Render.com** as a single service.
- **Portable Networking**: Relative API paths ensure the app works on any production domain without reconfiguration.

---

## 🛠️ Deployment & Production

### **Backend Configuration & Setup**
1. Run `npm install` in both `client` and `server` directories.
2. Create a `.env` file in the `server` directory with the following:
   ```env
   PORT=5001
   FIREBASE_PROJECT_ID=your_id
   FIREBASE_CLIENT_EMAIL=your_email
   FIREBASE_PRIVATE_KEY=your_key
   JWT_SECRET=your_jwt_secret
   ```
3. Create a `.env` file in the `client` directory with the following:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```
4. Start dev portals: `npm run dev` in client, `npm start` in server.### **One-Click Production Build**
Run the following from the root to verify the monolithic bundle:
```bash
npm run build
```

---

## 🗺️ Project Structure

```text
├── client/                # React Frontend (Vite)
├── server/                # Node.js Backend (Express)
│   ├── controllers/       # AI Generation & Trial Logic
│   ├── services/          # Real-time Sockets & Cron
├── package.json           # Monolithic Build & Deployment Scripts
```

---

## 🏆 Development Principles
- **Aesthetic Excellence**: Premium glassmorphism and micro-animations.
- **Scalable Intelligence**: Modular LLM integration for quizzes and tutoring.
- **Pedagogical Gamification**: Adaptive feedback via AI Sage.

**Level up your quest for knowledge today!** ⚔️
