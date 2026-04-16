import { useParams, useNavigate } from 'react-router-dom';
import { SKILL_PATHS, BADGES } from '../constants/data';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import * as Icons from 'lucide-react';
import { 
  Swords, 
  Zap, 
  Coins, 
  Flame, 
  Trophy, 
  Star 
} from 'lucide-react';

/* Helper to render Lucide icons by name from our data.js */
const LucideIcon = ({ name, size = 24, className = "" }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) return <Icons.HelpCircle size={size} className={className} />;
  return <IconComponent size={size} className={className} />;
};

export default function Dashboard({ userData, currentUser, selectedAvatar, level, levelProgress, xpToNext, completedCount, setActiveNav, setActiveQuestPath, questsList }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const isOwnDashboard = username === userData.username;

  useEffect(() => {
    if (username && username.match(/^[0-9a-fA-F]{24}$/) && isOwnDashboard) {
      navigate(`/dashboard/${userData.username}`, { replace: true });
    }
  }, [username, userData.username, isOwnDashboard, navigate]);

  const earnedBadges = BADGES.filter(b => userData.earnedBadges.includes(b.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-10"
    >
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <div className="relative group overflow-hidden rounded-[2rem] sm:rounded-[3rem] border border-white/5 bg-[#0a0a20]/40 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent2/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="hero-inner relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-10">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="hero-avatar w-28 h-28 sm:w-40 sm:h-40 rounded-full border-4 border-accent/30 flex items-center justify-center text-5xl sm:text-7xl bg-surface/50 shadow-[0_0_50px_rgba(124,58,237,0.3)] relative z-10">
              {selectedAvatar?.emoji}
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gold px-3 py-1 rounded-full text-black font-black text-[10px] uppercase tracking-widest shadow-xl border-2 border-white/20 whitespace-nowrap flex items-center gap-1.5">
              <Star size={10} fill="currentColor" /> Level {level}
            </div>
          </div>

          {/* Text Block */}
          <div className="flex-1 text-center md:text-left w-full">
            <h2 className="font-title font-black mb-3 text-white tracking-tighter uppercase italic"
                style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)' }}>
              Greeting, <span className="text-gradient-purple">{currentUser}!</span>
            </h2>
            <p className="text-text3 text-xs sm:text-sm font-bold tracking-[0.15em] uppercase max-w-lg mx-auto md:mx-0 leading-relaxed opacity-70">
              {completedCount === 0
                ? "Your destiny is unwritten. Step into the arena and claim your glory."
                : `You have conquered ${completedCount} legendary quests. The Kingdom sings your praise!`}
            </p>

            {/* CTA Buttons */}
            <div className="hero-btns mt-6 flex flex-wrap justify-center md:justify-start gap-3">
              <button
                onClick={() => setActiveNav("quests")}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-accent text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_10px_30px_rgba(124,58,237,0.4)] hover:scale-105 active:scale-95 transition-all btn-touch flex items-center gap-2"
              >
                Enter the Map <Swords size={14} />
              </button>
              <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-2xl">
                <span className="icon text-accent2"><Zap size={20} /></span>
                <div>
                  <div className="text-[9px] font-black text-text3 uppercase leading-none">Stamina</div>
                  <div className="text-lg sm:text-xl font-black text-white font-mono">{userData.energy} / 5</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RPG Stats Grid ────────────────────────────────────────────────── */}
      <div className="stats-grid grid gap-4">
        {/* XP Card */}
        <div className="bg-[#101025]/60 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 hover:border-accent/30 transition-all group overflow-hidden relative">
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap size={100} />
          </div>
          <div className="text-[9px] sm:text-[10px] font-black text-accent2 uppercase tracking-[0.3em] mb-3">Battle Experience</div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-2 font-mono tracking-tighter">{userData.xp.toLocaleString()}</div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[9px] font-black text-text3 uppercase">Mastery {Math.round(levelProgress)}%</span>
            <span className="text-[9px] font-black text-text3 uppercase">{xpToNext} XP Next</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-to-r from-accent to-accent2 shadow-[0_0_10px_rgba(124,58,237,0.5)]" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>

        {/* Gold Card */}
        <div className="bg-[#101025]/60 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 hover:border-gold/30 transition-all group overflow-hidden relative">
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Coins size={100} />
          </div>
          <div className="text-[9px] sm:text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-3">Gold Vault</div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-1 font-mono tracking-tighter">{userData.coins.toLocaleString()}</div>
          <div className="text-[9px] text-text3 uppercase font-bold tracking-widest opacity-60">Wealth from trials</div>
        </div>

        {/* Streak Card */}
        <div className="bg-[#101025]/60 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 hover:border-orange-500/30 transition-all group overflow-hidden relative">
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Flame size={100} />
          </div>
          <div className="text-[9px] sm:text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] mb-3">Training Streak</div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-1 font-mono tracking-tighter">{userData.streak} Days</div>
          <div className="text-[9px] text-text3 uppercase font-bold tracking-widest opacity-60">Consistency is your blade</div>
        </div>
      </div>

      {/* ─── Path Progressions ─────────────────────────────────────────────── */}
      <div>
        <div className="font-title text-base sm:text-xl font-bold text-text2 uppercase tracking-[0.3em] mb-5 sm:mb-8 px-2">
          Path Progressions
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {SKILL_PATHS.map(path => {
            const pathQuests = (questsList || []).filter(q => q.pathId === path.id);
            const done = pathQuests.filter(q => q.isCompleted).length;
            const pct = pathQuests.length > 0 ? Math.round((done / pathQuests.length) * 100) : 0;
            return (
              <div
                key={path.id}
                onClick={() => { setActiveNav("quests"); setActiveQuestPath(path.id); }}
                className="bg-surface/30 border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 cursor-pointer hover:bg-surface/50 hover:border-white/20 transition-all group overflow-hidden relative"
              >
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform text-accent">
                      <LucideIcon name={path.icon} size={28} />
                    </div>
                    <div>
                      <div className="font-title text-sm sm:text-lg font-bold text-white group-hover:text-accent2 transition-colors uppercase tracking-tight">{path.name}</div>
                      <div className="text-[9px] font-bold text-text3 uppercase tracking-widest">{pathQuests.length} Challenges</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-black text-white font-mono">{pct}%</div>
                    <div className="text-[9px] font-black text-text3 uppercase tracking-widest">Mastery</div>
                  </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, background: path.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Trophy Room ───────────────────────────────────────────────────── */}
      <div className="pb-20">
        <div className="font-title text-base sm:text-xl font-bold text-text2 uppercase tracking-[0.3em] mb-5 sm:mb-8 px-2 flex justify-between items-center">
          <span>Trophy Room</span>
          <span className="text-xs text-text3 font-bold">{earnedBadges.length}/{BADGES.length}</span>
        </div>
        <div className="badge-grid grid gap-3 sm:gap-6">
          {BADGES.map(badge => {
            const earned = userData.earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                title={badge.desc}
                className={`group relative bg-[#0a0a20]/40 border rounded-[1.25rem] sm:rounded-[2rem] p-4 sm:p-6 text-center transition-all duration-500 overflow-hidden flex flex-col items-center justify-center
                  ${earned
                    ? 'border-gold/30 shadow-[0_0_40px_rgba(245,158,11,0.1)] hover:shadow-[0_0_60px_rgba(245,158,11,0.2)]'
                    : 'border-white/5 opacity-30 grayscale saturate-0'}`}
              >
                {earned && <div className="absolute inset-0 bg-gradient-to-t from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
                <div className="mb-2 sm:mb-4 group-hover:scale-125 transition-transform duration-500 text-gold">
                  <LucideIcon name={badge.icon} size={40} className="sm:hidden" />
                  <LucideIcon name={badge.icon} size={50} className="hidden sm:block" />
                </div>
                <div className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${earned ? 'text-gold' : 'text-text3'}`}>
                  {badge.name}
                </div>
                {earned && (
                  <div className="absolute top-1.5 right-1.5 text-[7px] font-black text-gold/60">
                    <Icons.CheckCircle2 size={10} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

