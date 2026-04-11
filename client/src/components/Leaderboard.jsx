import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AVATARS } from '../constants/data';
import { fetchLeaderboard } from '../api';
import { motion } from 'framer-motion';

const avatarEmoji = (avatarId) => {
  const a = AVATARS.find(av => av.id === avatarId);
  return a ? a.emoji : '⚔️';
};

export default function Leaderboard({ currentUser, selectedAvatar, userData, level }) {
  const navigate = useNavigate();
  const [lbData, setLbData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard().then(data => {
      if (!cancelled) {
        setLbData(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const me = {
    _id: userData._id,
    name: currentUser || 'You',
    uid: userData.uid || '#---',
    avatar: selectedAvatar?.emoji || '⚔️',
    xp: userData.xp,
    level,
    streak: userData.streak,
    isMe: true,
  };

  const buildList = () => {
    if (lbData && lbData.length > 0) {
      const mapped = lbData.map(u => ({
        _id: u._id,
        name: u.username,
        uid: u.uid || '#---',
        avatar: avatarEmoji(u.avatarId),
        xp: u.xp,
        level: u.level,
        streak: u.streak,
        isMe: u.username === currentUser,
      }));
      const alreadyIn = mapped.some(u => u.isMe);
      const full = alreadyIn ? mapped : [...mapped, me];
      return full.sort((a, b) => b.xp - a.xp).slice(0, 10);
    }
    return [me].sort((a, b) => b.xp - a.xp);
  };

  const allLB = buildList();

  const podiumConfig = [
    { pos: 1, height: 160, color: '#94a3b8', label: '🥈 2nd', delay: 0.1 },
    { pos: 0, height: 220, color: '#f59e0b', label: '🥇 1st', delay: 0 },
    { pos: 2, height: 140, color: '#b45309', label: '🥉 3rd', delay: 0.2 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-title text-2xl sm:text-4xl font-black mb-1 text-gradient-purple tracking-tighter uppercase italic">Hall of Champions</h2>
          <p className="text-text3 text-xs font-bold tracking-[0.2em] uppercase opacity-70">The most legendary warriors of the kingdom</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full shrink-0">
           <div className={`w-2 h-2 rounded-full ${loading ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
           <span className="text-[10px] font-black text-white uppercase tracking-widest">{loading ? 'Searching...' : 'Live Data'}</span>
        </div>
      </div>

      {/* Podium */}
      <div className="podium-wrap flex justify-center items-end gap-2 md:gap-8 min-h-[280px] sm:min-h-[350px]">
        {podiumConfig.map(({ pos, height, color, label, delay }) => {
          const p = allLB[pos];
          if (!p) return null;
          return (
            <motion.div 
              key={pos}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay }}
              className="podium-col flex flex-col items-center gap-2 sm:gap-3"
              style={{ width: 'clamp(5rem, 15vw, 10rem)' }}
            >
              <div className="relative group">
                <div
                  className="podium-avatar rounded-full border-4 border-white/10 flex items-center justify-center bg-surface/40 backdrop-blur-xl shadow-2xl group-hover:scale-110 transition-transform duration-500"
                  style={{ width: 'clamp(3.5rem, 8vw, 8rem)', height: 'clamp(3.5rem, 8vw, 8rem)', fontSize: 'clamp(1.5rem, 4vw, 3.5rem)' }}
                >
                  {p.avatar}
                </div>
                {p.isMe && <div className="absolute inset-0 rounded-full animate-ping bg-accent/20" />}
              </div>
              <div className={`text-[10px] sm:text-sm font-black uppercase tracking-widest text-center ${p.isMe ? 'text-accent2' : 'text-white'}`}>
                {p.name}{p.isMe ? ' (You)' : ''}
              </div>
              <div className="font-mono text-[9px] sm:text-xs font-bold opacity-60" style={{ color }}>{p.xp.toLocaleString()} XP</div>
              
              <div 
                className="w-full relative flex items-start justify-center pt-3 font-title text-[9px] sm:text-xs font-black uppercase tracking-widest rounded-t-[1.5rem] border-x border-t shadow-2xl"
                style={{ 
                  height: `${Math.round(height * 0.65)}px`,
                  background: `linear-gradient(180deg, ${color}44 0%, transparent 100%)`, 
                  borderColor: `${color}44`, 
                  color: color 
                }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{pos === 0 ? '🥇' : pos === 1 ? '🥈' : '🥉'}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full List */}
      <div className="bg-[#0a0a20]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 divide-y divide-white/5">
          {allLB.map((p, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/dashboard/${p.name}`)}
              className={`lb-row flex items-center gap-3 sm:gap-6 px-4 sm:px-10 py-4 sm:py-6 transition-all duration-300 hover:bg-white/5 cursor-pointer ${p.isMe ? 'bg-accent/10 border-l-4 border-l-accent shadow-[inset_0_0_30px_rgba(124,58,237,0.1)]' : ''}`}
            >
              <div className={`font-title text-base sm:text-xl font-black w-7 sm:w-10 text-center font-mono ${i === 0 ? 'text-gold' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-text3 opacity-40'}`}>
                {i + 1}
              </div>
              
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-xl sm:text-3xl shrink-0">
                {p.avatar}
              </div>

              <div className="flex-1 flex flex-col min-w-0">
                <span className="font-black text-lg text-white uppercase tracking-tighter truncate leading-none mb-1">
                  {p.name}{p.isMe ? ' 👑' : ''}
                </span>
                <span className="text-[10px] font-black text-text3 uppercase tracking-[0.2em] opacity-40 truncate">
                  {p.uid}
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-8 text-right shrink-0">
                <div className="lb-stat hidden sm:block">
                  <div className="text-[9px] font-black text-text3 uppercase tracking-widest opacity-40 mb-1">Experience</div>
                  <div className="text-xs sm:text-sm font-black text-accent2 font-mono">{p.xp.toLocaleString()}</div>
                </div>
                <div className="lb-stat hidden sm:block">
                  <div className="text-[9px] font-black text-text3 uppercase tracking-widest opacity-40 mb-1">Rank</div>
                  <div className="text-xs sm:text-sm font-black text-white font-mono">Lvl.{p.level}</div>
                </div>
                {/* Always show XP on mobile */}
                <div className="sm:hidden text-xs font-black text-accent2 font-mono">{p.xp.toLocaleString()} XP</div>
                <div className="bg-orange-500/10 border border-orange-500/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl">
                  <span className="text-sm">🔥</span>
                  <span className="ml-1 sm:ml-2 font-black text-orange-400 font-mono text-xs sm:text-sm">{p.streak}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
