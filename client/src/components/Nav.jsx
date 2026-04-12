import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { calcLevelProgress } from '../constants/data';
import { 
  Home, 
  Swords, 
  Users, 
  Trophy, 
  Brain, 
  Zap, 
  Coins, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { id: "dashboard", icon: <Home className="w-4 h-4" />, label: "Home" },
  { id: "quests",    icon: <Swords className="w-4 h-4" />, label: "Quests" },
  { id: "social",   icon: <Users className="w-4 h-4" />, label: "Social" },
  { id: "leaderboard", icon: <Trophy className="w-4 h-4" />, label: "Ranks" },
  { id: "tutor",    icon: <Brain className="w-4 h-4" />, label: "AI Tutor" },
];

export default function Nav({ 
  activeNav, 
  setActiveNav, 
  userData, 
  currentUser, 
  selectedAvatar, 
  level, 
  onLogout, 
  onProfileClick, 
  onRefill, 
  socialNotification, 
  setSocialNotification,
  onStartBattle 
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef(null);
  const progress = calcLevelProgress(userData?.xp || 0);

  const goTo = (id) => {
    if (id === 'dashboard') {
      navigate(`/dashboard/${userData.username}`);
    } else {
      navigate(`/${id}`);
    }
    if (id === 'social' && setSocialNotification) setSocialNotification(false);
    setMenuOpen(false);
  };

  /* Close drawer on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (menuOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        const hamburger = document.getElementById('nav-hamburger');
        if (!hamburger?.contains(e.target)) setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [menuOpen]);

  /* Lock body scroll when menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      {/* ─── Main Sticky Navbar ──────────────────────────────────────────── */}
      <nav className="bg-surface/80 border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl" style={{ height: 'var(--nav-height)' }}>
        <div className="flex items-center justify-between h-full px-4 lg:px-6 max-w-[1400px] mx-auto">

          {/* Brand */}
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-2">
              <span className="icon text-accent"><Swords size={20} /></span>
              <span className="nav-brand text-gradient-purple">LevelUp</span>
            </div>
            <span className="text-[8px] text-text3 font-bold uppercase tracking-[0.2em] -mt-0.5 opacity-60 hidden sm:block">
              Warrior's Journey
            </span>
          </div>

          {/* ─── Desktop Nav Links ──────────────────────────────────────── */}
          <div className="desktop-nav-links flex gap-0.5 bg-surface2/50 p-1 rounded-xl border border-white/5 mx-4">
            {NAV_ITEMS.map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => goTo(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-300 relative btn-touch
                  ${activeNav === id
                    ? 'bg-accent text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                    : 'text-text2 hover:text-text1 hover:bg-white/5'}`}
              >
                <span className="icon">{icon}</span>
                <span className="hidden xl:inline">{label}</span>
                {id === 'social' && socialNotification && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#050510] animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* ─── Desktop Right Controls ─────────────────────────────────── */}
          <div className="flex items-center gap-3">

            {/* XP Bar — desktop only */}
            <div className="desktop-xp-bar hidden lg:flex flex-col w-36 xl:w-48 gap-1.5">
              <div className="flex justify-between items-end px-1">
                <span className="text-[9px] font-black text-accent2 uppercase tracking-widest">Level {level}</span>
                <span className="text-[9px] font-black text-text3 uppercase tracking-widest">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                   className="h-full bg-gradient-to-r from-accent to-accent2 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                   style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Battle button — desktop only */}
            <button
              onClick={onStartBattle}
              className="desktop-battle-btn hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 rounded-xl font-title font-black text-[10px] uppercase tracking-[0.1em] text-white shadow-[0_5px_15px_rgba(220,38,38,0.3)] hover:scale-105 active:scale-95 transition-all border border-red-400/30 btn-touch"
            >
              <span className="icon"><Swords size={12} /></span> Battle
            </button>

            {/* Energy — desktop only */}
            <div className="desktop-energy-bar hidden sm:flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-sm rotate-45 border ${i < (userData?.energy / 2)
                      ? 'bg-blue-500 border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                      : 'bg-white/5 border-white/10'}`}
                  />
                ))}
              </div>
              <button
                onClick={onRefill}
                disabled={userData?.energy >= 10}
                className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all btn-touch ${
                  userData?.energy < 10
                    ? 'bg-accent/10 border-accent/30 text-accent hover:bg-accent hover:text-white'
                    : 'opacity-40 cursor-not-allowed border-white/10 text-text3'
                }`}
                title="Refill Energy"
              >
                <span className="icon"><Zap size={10} /></span>
              </button>
            </div>

            {/* Coins — desktop only */}
            <div className="desktop-coin-display hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 border border-gold/30 rounded-xl text-sm font-black text-gold">
              <span className="icon"><Coins size={14} /></span> <span className="font-mono">{userData?.coins || 0}</span>
            </div>

            {/* Avatar / Profile — always visible */}
            <div
              onClick={onProfileClick}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-surface2/80 border border-white/10 rounded-xl cursor-pointer hover:border-accent2 transition-all group relative overflow-hidden btn-touch"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-xl group-hover:scale-110 transition-transform z-10">{selectedAvatar?.emoji || <Swords size={18} />}</span>
              <div className="flex-col z-10 hidden sm:flex">
                <span className="text-[11px] font-black text-text1 leading-tight group-hover:text-accent2 transition-colors uppercase tracking-tight truncate max-w-[80px]">{currentUser}</span>
                <span className="text-[8px] text-text3 font-mono opacity-60">RANK: MASTER</span>
              </div>
            </div>

            {/* Logout — always visible */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all btn-touch"
                title="Logout"
              >
                <span className="icon"><LogOut size={16} /></span>
              </button>
            )}

            {/* ─── Hamburger (mobile/tablet) ──────────────────────────── */}
            <button
              id="nav-hamburger"
              className={`hamburger btn-touch ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Overlay ──────────────────────────────────────────────── */}
      <div
        className={`mobile-menu-overlay ${menuOpen ? 'visible' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ─── Mobile Drawer ───────────────────────────────────────────────── */}
      <aside
        ref={drawerRef}
        className={`mobile-menu-drawer ${menuOpen ? 'open' : ''}`}
        aria-label="Navigation menu"
      >
        {/* Drawer Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <span className="text-3xl">{selectedAvatar?.emoji || <Swords size={24} />}</span>
          <div>
            <div className="font-black text-sm text-text1 uppercase tracking-tight truncate">{currentUser}</div>
            <div className="text-[10px] text-text3 font-bold uppercase tracking-widest">Level {level} Warrior</div>
          </div>
        </div>

        {/* XP Bar in drawer */}
        <div className="mb-4 px-1">
          <div className="flex justify-between text-[9px] font-black text-text3 uppercase tracking-widest mb-1.5">
            <span>Experience</span><span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent2 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Coin + Energy row */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 flex items-center gap-1.5 px-3 py-2 bg-gold/10 border border-gold/30 rounded-xl text-xs font-black text-gold">
            <span className="icon"><Coins size={12} /></span> <span className="font-mono">{userData?.coins || 0}</span>
          </div>
          <button
            onClick={() => { onRefill(); setMenuOpen(false); }}
            disabled={userData?.energy >= 10}
            className={`flex-1 py-2 px-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all btn-touch ${
              userData?.energy < 10
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'opacity-40 cursor-not-allowed border-white/10 text-text3'
            }`}
          >
            <span className="icon-inline"><Zap size={10} /></span> Refill
          </button>
        </div>

        {/* Nav Items */}
        {NAV_ITEMS.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => goTo(id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider transition-all duration-200 btn-touch relative
              ${activeNav === id
                ? 'bg-accent/20 text-accent border border-accent/30 shadow-[0_0_15px_rgba(124,58,237,0.15)]'
                : 'text-text2 hover:bg-white/5 hover:text-text1 border border-transparent'}`}
          >
            <span className="icon text-xl">{icon}</span>
            {label}
            {id === 'social' && socialNotification && (
              <span className="ml-auto w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        ))}

        <div className="h-px bg-white/5 my-4" />

        {/* Battle button in drawer */}
        <button
          onClick={() => { onStartBattle(); setMenuOpen(false); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-red-600 to-red-500 rounded-2xl font-title font-black text-xs uppercase tracking-[0.1em] text-white shadow-[0_5px_15px_rgba(220,38,38,0.3)] btn-touch border border-red-400/30"
        >
          <span className="icon"><Swords size={16} /></span> Enter Battle Arena
        </button>

        {/* Logout */}
        <button
          onClick={() => { onLogout(); setMenuOpen(false); }}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-400 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all btn-touch"
        >
          <span className="icon"><LogOut size={14} /></span> Logout
        </button>
      </aside>
    </>
  );
}

