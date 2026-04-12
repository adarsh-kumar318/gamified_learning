import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { 
  Swords, 
  RefreshCw, 
  Zap, 
  AlertTriangle, 
  X, 
  Star, 
  Map as MapIcon, 
  LogOut, 
  CircleX 
} from "lucide-react";

import ProtectedRoute   from "./components/ProtectedRoute";
import Layout           from "./components/Layout";
import Auth             from "./components/Auth";
import AvatarPicker     from "./components/AvatarPicker";
import Dashboard        from "./components/Dashboard";
import Quests           from "./components/Quests";
import QuestPanel       from "./components/QuestPanel";
import Leaderboard      from "./components/Leaderboard";
import Tutor            from "./components/Tutor";
import Social           from "./components/Social";
import BackgroundLayer  from "./components/BackgroundLayer";
import MatchmakingView  from "./components/MatchmakingView";
import BattleArena      from "./components/BattleArena";
import SubjectPicker    from "./components/SubjectPicker";

import {
  fetchProfile,
  updateAvatar,
  fetchQuestsList,
  fetchQuestDetail,
  submitAnswerToQuest,
  restartQuest,
  refillUserEnergy,
} from "./api";
import { AVATARS, calcLevel, calcXpToNext, calcLevelProgress } from "./constants/data";
import "./styles/index.css";

/* ─── Constants ────────────────────────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const INITIAL_USER = {
  xp: 0, coins: 0, totalCoins: 0, level: 1, streak: 1, energy: 5,
  completedQuests: [], earnedBadges: [], perfectAnswers: 0,
  weeklyXp: [0, 0, 0, 0, 0, 0, 0], totalQuestsCompleted: 0,
};

/* ─── App ───────────────────────────────────────────────────────────────────── */
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  /* User & UI state */
  const [screen,             setScreen]             = useState("loading");
  const [currentUser,        setCurrentUser]        = useState(null);
  const [userData,           setUserData]           = useState(INITIAL_USER);
  const [selectedAvatar,     setSelectedAvatar]     = useState(null);
  const [activeNav,          setActiveNav]          = useState("dashboard");
  const [activeQuestPath,    setActiveQuestPath]    = useState("webdev");
  const [activeQuestsList,   setActiveQuestsList]   = useState([]);
  const [activeQuest,        setActiveQuest]        = useState(null);
  const [xpPopup,            setXpPopup]            = useState(null);
  const [showProfile,        setShowProfile]        = useState(false);

  /* Socket & battle state */
  const [socket,            setSocket]            = useState(null);
  const [battleSocket,      setBattleSocket]      = useState(null);
  const [isSearching,       setIsSearching]       = useState(false);
  const [battleData,        setBattleData]        = useState(null);
  const [socialNotification, setSocialNotification] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  /* Ref to always have the latest userData without stale closures */
  const latestUD = useRef(INITIAL_USER);
  const setUD = (next) => {
    const resolved = typeof next === "function" ? next(latestUD.current) : next;
    latestUD.current = resolved;
    setUserData(resolved);
  };

  /* ── Helpers ──────────────────────────────────────────────────────────────── */
  const showXpPopup = (text, icon = null) => {
    setXpPopup({ text, icon });
    setTimeout(() => setXpPopup(null), 2100);
  };

  const resolveAvatar = (avatarId) =>
    AVATARS.find((a) => a.id === avatarId) || null;

  /* ── Socket setup (called once; guarded by !socket check) ─────────────────── */
  const initSockets = (userId) => {
    const mainSocket = io(API_BASE);
    mainSocket.emit("register_user", userId);
    mainSocket.on("new_friend_request",    () => setSocialNotification(true));
    mainSocket.on("friend_request_accepted", () => setSocialNotification(true));
    setSocket(mainSocket);

    const bSocket = io(`${API_BASE}/battles`);
    bSocket.on("match_found", (data) => {
      setBattleData(data);
      setIsSearching(false);
      bSocket.emit("join_battle_room", data.battleId);
      navigate("/battle");
    });
    setBattleSocket(bSocket);
  };

  /* ── Sync all app state from server ─────────────────────────────────────── */
  const syncApp = async () => {
    const token = localStorage.getItem("token");
    if (!token) { setScreen("auth"); return; }

    try {
      const [profile, quests] = await Promise.all([fetchProfile(), fetchQuestsList()]);

      if (!profile) {
        localStorage.removeItem("token");
        navigate("/auth");
        return;
      }

      if (!socket) initSockets(profile._id);

      setUD({ ...INITIAL_USER, ...profile });
      setCurrentUser(profile.username);
      setActiveQuestsList(quests);
      setScreen("main");

      // Restore avatar on every refresh
      if (profile.avatarId) {
        setSelectedAvatar(resolveAvatar(profile.avatarId));
        if (location.pathname === "/" || location.pathname === "/auth") {
          navigate(`/dashboard/${profile.username}`);
        }
      } else {
        navigate("/avatar");
      }
    } catch (err) {
      console.error("❌ Sync error:", err);
      if (err.message?.toLowerCase().includes("unauthorized")) {
        localStorage.removeItem("token");
        navigate("/auth");
      } else {
        setScreen("error");
      }
    }
  };

  useEffect(() => { syncApp(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Auth handlers ────────────────────────────────────────────────────────── */
  const handleAuthLogin = (user, token) => {
    localStorage.setItem("token", token);
    setUD({ ...INITIAL_USER, ...user });
    setCurrentUser(user.username);

    if (user.avatarId) {
      setSelectedAvatar(resolveAvatar(user.avatarId));
      navigate(`/dashboard/${user.username}`);
    } else {
      navigate("/avatar");
    }
    // Kick off a full sync to hydrate quests, sockets, etc.
    syncApp();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth"; // full reload to clear all socket state
  };

  const handleAvatarSelect = async (avatar) => {
    setSelectedAvatar(avatar);
    try {
      await updateAvatar(avatar.id);
    } catch (err) {
      console.error("Failed to update avatar:", err);
    }
    setUD((prev) => ({ ...prev, avatarId: avatar.id }));
    navigate(`/dashboard/${latestUD.current.username}`);
  };

  /* ── Battle handlers ─────────────────────────────────────────────────────── */
  // Step 1: Show subject picker
  const handleStartMatchmaking = () => {
    if (!battleSocket) return;
    if (userData.xp < 50) {
      showXpPopup("MINIMUM 50 XP REQUIRED FOR BATTLE", <AlertTriangle className="w-4 h-4" />);
      return;
    }
    setShowSubjectPicker(true);
  };

  // Step 2: Subject chosen → enter queue
  const handleSubjectSelected = (subject) => {
    setShowSubjectPicker(false);
    battleSocket.emit("start_matchmaking", {
      userId: userData._id,
      username: userData.username,
      subject, // null = mixed mode
    });
    setIsSearching(true);
  };

  const handleCancelMatchmaking = () => {
    battleSocket?.emit("cancel_matchmaking", userData._id);
    setIsSearching(false);
    setShowSubjectPicker(false);
  };

  /* ── Quest handlers ──────────────────────────────────────────────────────── */
  const openQuest = async (questMetadata) => {
    try {
      const fullQuest = await fetchQuestDetail(questMetadata.id);
      setActiveQuest(fullQuest);
    } catch (err) {
      console.error("Failed to fetch quest:", err);
    }
  };

  const handleQuestAnswer = async (questionIndex, selectedOption) => {
    try {
      const result = await submitAnswerToQuest(activeQuest.id, questionIndex, selectedOption);

      if (result.correct) {
        setUD((prev) => ({
          ...prev,
          xp: result.user.xp,
          coins: result.user.coins,
          energy: result.energy,
          earnedBadges: result.user.earnedBadges,
        }));
        if (result.isCompleted) {
          showXpPopup("TRIAL MASTERED! +100 XP", <Swords className="w-4 h-4" />);
          syncApp();
        }
      } else {
        setUD((prev) => ({ ...prev, energy: result.energy }));
      }
      return result;
    } catch (err) {
      if (err.message?.includes("energy")) return { correct: false, outOfEnergy: true };
      return { correct: false };
    }
  };

  const handleQuestRestart = async () => {
    try {
      await restartQuest(activeQuest.id);
      showXpPopup("RESETTING TRIAL...", <RefreshCw className="w-4 h-4" />);
      await syncApp();
      await openQuest(activeQuest);
    } catch (err) {
      console.error("Restart failed:", err);
    }
  };

  const handleRefillEnergy = async () => {
    try {
      const { user, message } = await refillUserEnergy();
      setUD((prev) => ({ ...prev, coins: user.coins, energy: user.energy }));
      showXpPopup(message, <Zap className="w-4 h-4" />);
    } catch (err) {
      showXpPopup(err.message, <CircleX className="w-4 h-4" />);
    }
  };

  const getQuestStatus = (quest) => {
    if (quest.isCompleted) return "completed";
    const path = activeQuestsList.filter((q) => q.pathId === activeQuestPath);
    const idx  = path.findIndex((q) => q.id === quest.id);
    if (idx === 0) return "available";
    const prev = path[idx - 1];
    return prev?.isCompleted || prev?.percentage >= 80 ? "available" : "locked";
  };

  /* ── Derived values ──────────────────────────────────────────────────────── */
  const level          = calcLevel(userData.xp);
  const levelProgress  = calcLevelProgress(userData.xp);
  const xpToNext       = calcXpToNext(userData.xp);
  const completedCount = userData.completedQuests?.length || 0;

  /* ── Shared layout wrapper ───────────────────────────────────────────────── */
  const AppLayout = ({ children, navId }) => (
    <ProtectedRoute>
      <Layout
        activeNav={navId}         setActiveNav={setActiveNav}
        userData={userData}       currentUser={currentUser}
        selectedAvatar={selectedAvatar} level={level}
        onLogout={handleLogout}
        onProfileClick={() => setShowProfile(true)}
        onRefill={handleRefillEnergy}
        socialNotification={socialNotification}
        setSocialNotification={setSocialNotification}
        onStartBattle={handleStartMatchmaking}
      >
        {children}
      </Layout>
    </ProtectedRoute>
  );

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ─── Subject Picker Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showSubjectPicker && (
          <SubjectPicker
            onSelect={handleSubjectSelected}
            onClose={() => setShowSubjectPicker(false)}
          />
        )}
      </AnimatePresence>
      {/* ─── Profile Modal ──────────────────────────────────────────────── */}
      {showProfile && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[500] animate-fade-in"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="bg-surface border border-white/10 rounded-3xl p-8 max-w-md w-11/12 animate-pop-in relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-accent2 to-accent" />
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-4 right-4 text-text3 hover:text-text1 transition-colors text-xl"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-6">
              <span className="text-7xl block mb-3 drop-shadow-[0_0_20px_rgba(124,58,237,0.5)]">
                {selectedAvatar?.emoji}
              </span>
              <h3 className="font-title text-3xl font-bold text-text1 leading-tight">{currentUser}</h3>
              <div className="text-[10px] font-mono text-white/40 mb-1 tracking-widest">
                {userData.uid || "#LVL-UNSET"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-bg2/50 border border-white/5 rounded-2xl p-4 text-center">
                <div className="flex justify-center text-2xl mb-1 text-gold">
                  <span className="icon"><Star size={24} /></span>
                </div>
                <div className="font-title text-2xl font-bold text-white">LVL {level}</div>
              </div>
              <div className="bg-bg2/50 border border-white/5 rounded-2xl p-4 text-center">
                <div className="flex justify-center text-2xl mb-1 text-accent2">
                  <span className="icon"><Zap size={24} /></span>
                </div>
                <div className="font-title text-2xl font-bold text-white">{userData.energy}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={14} /> Retire from Kingdom
            </button>
          </div>
        </div>
      )}

      {/* ─── XP Toast ───────────────────────────────────────────────────── */}
      {xpPopup && (
        <div className="fixed top-24 right-4 sm:right-8 bg-gradient-to-r from-accent to-accent2 text-white px-6 py-3 rounded-2xl font-black text-xs z-[300] animate-pop-in pointer-events-none shadow-[0_10px_30px_rgba(124,58,237,0.4)] uppercase tracking-widest flex items-center gap-3">
          {xpPopup.icon && <span className="icon">{xpPopup.icon}</span>}
          {xpPopup.text}
        </div>
      )}

      {/* ─── Quest Panel Overlay ─────────────────────────────────────────── */}
      {activeQuest && (
        <QuestPanel
          quest={activeQuest}
          energy={userData.energy}
          onClose={() => { setActiveQuest(null); syncApp(); }}
          onAnswer={handleQuestAnswer}
          onRestart={handleQuestRestart}
          onRefill={handleRefillEnergy}
          userData={userData}
        />
      )}

      {/* ─── Routes ─────────────────────────────────────────────────────── */}
      <Routes>
        <Route path="/auth" element={
          <div className="bg-[#050510] min-h-screen">
            <BackgroundLayer />
            <Auth onLogin={handleAuthLogin} />
          </div>
        } />

        <Route path="/avatar" element={
          <ProtectedRoute>
            <div className="bg-[#050510] min-h-screen">
              <BackgroundLayer />
              <AvatarPicker onAvatarSelect={handleAvatarSelect} />
            </div>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/:username" element={
          <AppLayout navId="dashboard">
            <Dashboard
              userData={userData}         currentUser={currentUser}
              selectedAvatar={selectedAvatar} level={level}
              levelProgress={levelProgress}   xpToNext={xpToNext}
              completedCount={completedCount}
              setActiveNav={(id) => {
                if (id === "dashboard") navigate(`/dashboard/${userData.username}`);
                else navigate(`/${id}`);
              }}
              setActiveQuestPath={setActiveQuestPath}
              questsList={activeQuestsList}
            />
          </AppLayout>
        } />

        <Route path="/quests" element={
          <AppLayout navId="quests">
            <Quests
              activeQuestPath={activeQuestPath}
              setActiveQuestPath={setActiveQuestPath}
              questsList={activeQuestsList}
              openQuest={openQuest}
              getQuestStatus={getQuestStatus}
              userData={userData}
              username={currentUser}
              avatarEmoji={selectedAvatar?.emoji}
            />
          </AppLayout>
        } />

        <Route path="/social" element={
          <AppLayout navId="social">
            <Social userData={userData} socket={socket} />
          </AppLayout>
        } />

        <Route path="/leaderboard" element={
          <AppLayout navId="leaderboard">
            <Leaderboard
              currentUser={currentUser}
              selectedAvatar={selectedAvatar}
              userData={userData}
              level={level}
            />
          </AppLayout>
        } />

        <Route path="/tutor" element={
          <AppLayout navId="tutor">
            <Tutor userData={userData} />
          </AppLayout>
        } />

        <Route path="/battle" element={
          <ProtectedRoute>
            {battleData ? (
              <BattleArena
                battleId={battleData.battleId}
                opponentName={battleData.opponent}
                questions={battleData.questions}
                socket={battleSocket}
                userData={userData}
                onResult={() => setBattleData(null)}
              />
            ) : (
              <Navigate to="/" replace />
            )}
          </ProtectedRoute>
        } />

        <Route path="/" element={
          <Navigate to={currentUser ? `/dashboard/${userData.username}` : "/auth"} replace />
        } />

        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-[#050510] text-[#f8fafc]">
            <BackgroundLayer />
            <div className="text-center z-10 p-8 border border-white/10 bg-white/5 rounded-3xl">
              <div className="text-6xl mb-4 flex justify-center text-accent/50">
                <MapIcon size={64} />
              </div>
              <h2 className="font-title text-2xl mb-2">Lost in the Realm</h2>
              <p className="text-text2 mb-6">This route does not exist on your map.</p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-accent hover:bg-accent2 rounded-xl font-bold transition-all"
              >
                Back to Safety
              </button>
            </div>
          </div>
        } />
      </Routes>

      {/* ─── Matchmaking Overlay ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isSearching && (
          <MatchmakingView
            onCancel={handleCancelMatchmaking}
            opponentFound={!!battleData}
          />
        )}
      </AnimatePresence>
    </>
  );
}

