require("dotenv").config();
const express   = require("express");
const path      = require("path");
const http      = require("http");
const cors      = require("cors");
const morgan    = require("morgan");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const connectDB    = require("./utils/db");
const battleSocket = require("./services/battleSocket");
const friendSocket = require("./services/friendSocket");
const cronJobs     = require("./services/cronJobs");

// Route imports
const authRoutes        = require("./routes/auth");
const userRoutes        = require("./routes/users");
const questRoutes       = require("./routes/quests");
const xpRoutes          = require("./routes/xp");
const badgeRoutes       = require("./routes/badges");
const leaderboardRoutes = require("./routes/leaderboard");
const tutorRoutes       = require("./routes/tutor");
const battleRoutes      = require("./routes/battles");
const streakRoutes      = require("./routes/streaks");
const profileRoutes     = require("./routes/profile");
const progressRoutes    = require("./routes/progress");
const friendRoutes      = require("./routes/friends");

/* ─── CORS origin list ─────────────────────────────────────────────────────── */
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
].filter(Boolean);

const corsOriginFn = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
    callback(null, true);
  } else {
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  }
};

/* ─── App & server setup ───────────────────────────────────────────────────── */
const app    = express();
const server = http.createServer(app);

// Socket.io — reuse the same CORS origin function
const io = new Server(server, {
  cors: {
    origin: corsOriginFn,
    methods: ["GET", "POST"],
  },
  pingTimeout:  Number(process.env.SOCKET_PING_TIMEOUT)  || 5000,
  pingInterval: Number(process.env.SOCKET_PING_INTERVAL) || 10000,
});

app.set("io", io);

/* ─── Middleware ────────────────────────────────────────────────────────────── */
app.use(cors({ origin: corsOriginFn, credentials: true }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { error: "Too many requests, slow down hero! ⚔️" },
  })
);

/* ─── Health check ──────────────────────────────────────────────────────────── */
app.get("/health", (_req, res) =>
  res.json({ status: "ok", message: "LevelUp Learning API is alive ⚔️" })
);

/* ─── Routes ────────────────────────────────────────────────────────────────── */
app.use("/api/auth",        authRoutes);
app.use("/api/users",       userRoutes);
app.use("/api/quests",      questRoutes);
app.use("/api/progress",    progressRoutes);
app.use("/api/xp",          xpRoutes);
app.use("/api/badges",      badgeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/tutor",       tutorRoutes);
app.use("/api/battles",     battleRoutes);
app.use("/api/streaks",     streakRoutes);
app.use("/api/profile",     profileRoutes);
app.use("/api/friends",     friendRoutes);

/* ─── Static files (production only) ───────────────────────────────────────── */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
  });
}

/* ─── 404 & global error handler ───────────────────────────────────────────── */
app.use((_req, res) =>
  res.status(404).json({ error: "Route not found. Check your map! 🗺️" })
);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

/* ─── Sockets & cron ────────────────────────────────────────────────────────── */
battleSocket(io);
friendSocket(io);
cronJobs();

/* ─── Start ─────────────────────────────────────────────────────────────────── */
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => {
    console.log(`\n⚔️  LevelUp Learning Backend running on port ${PORT}`);
    console.log(`🌍  ENV: ${process.env.NODE_ENV || "development"}`);
    console.log(`📡  Client: ${process.env.CLIENT_URL || "*"}`);
  });
};

startServer();

module.exports = { app, server };
