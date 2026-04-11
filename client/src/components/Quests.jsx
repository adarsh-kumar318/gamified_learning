import { SKILL_PATHS } from '../constants/data';
import LevelMap from './LevelMap';
import { motion } from 'framer-motion';

const PATH_COLORS = {
  webdev:      '#3b82f6',
  aptitude:    '#8b5cf6',
  english:     '#10b981',
  datascience: '#f59e0b',
};

export default function Quests({ activeQuestPath, setActiveQuestPath, openQuest, getQuestStatus, userData, questsList, username, avatarEmoji }) {
  // Filter the master list by the current active path
  const quests = questsList.filter(q => q.pathId === activeQuestPath);
  const color  = PATH_COLORS[activeQuestPath] || '#7c3aed';

  // Progress for current path
  const done = quests.filter(q => q.isCompleted).length;
  const pct  = quests.length > 0 ? Math.round((done / quests.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      {/* Header & Tabs */}
      <div className="sticky top-0 z-20 bg-[#050510]/60 backdrop-blur-xl pb-6 pt-2">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="font-title text-4xl font-black mb-1 text-gradient-purple tracking-tighter uppercase">Adventure Map</h2>
            <p className="text-text3 text-xs font-bold tracking-[0.2em] uppercase opacity-70">Current Path: {activeQuestPath}</p>
          </div>
          <div className="hidden md:flex gap-4">
             <div className="text-right">
               <div className="text-[10px] font-black text-text3 uppercase">Total XP</div>
               <div className="text-lg font-bold text-white">{userData.xp.toLocaleString()}</div>
             </div>
          </div>
        </div>

        {/* Path Tabs */}
        <div className="flex gap-3 mb-8 no-scrollbar overflow-x-auto pb-2">
          {SKILL_PATHS.map(path => (
            <button
              key={path.id}
              onClick={() => setActiveQuestPath(path.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border backdrop-blur-xl
                ${activeQuestPath === path.id
                  ? 'text-white border-transparent shadow-[0_10px_30px_rgba(0,0,0,0.5)] scale-105'
                  : 'bg-surface2/50 border-white/5 text-text3 hover:border-white/20 hover:text-text1 hover:bg-surface'}`}
              style={activeQuestPath === path.id ? { background: `linear-gradient(135deg, ${PATH_COLORS[path.id]}, ${PATH_COLORS[path.id]}aa)`, boxShadow: `0 0 25px ${PATH_COLORS[path.id]}44` } : {}}
            >
              <span className="text-xl">{path.icon}</span> {path.name}
            </button>
          ))}
        </div>

        {/* Path progress bar */}
        <div className="px-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] mb-3 px-1">
            <span className="text-text3">{done} / {quests.length} Levels Conquered</span>
            <span style={{ color }}>{pct}% Mastery</span>
          </div>
          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full relative overflow-hidden"
              style={{ background: `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 15px ${color}66` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:25px_25px] animate-[shimmer_3s_linear_infinite]" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* The Progression Map */}
      <div className="flex-1 mt-4 pb-24">
        {quests.length > 0 ? (
          <LevelMap 
            quests={quests} 
            getQuestStatus={getQuestStatus} 
            openQuest={openQuest} 
            color={color}
            username={username}
            avatarEmoji={avatarEmoji}
          />
        ) : (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4 opacity-20">🌫️</div>
            <p className="text-text3 font-bold uppercase tracking-widest">This territory is yet to be discovered...</p>
          </div>
        )}
      </div>
    </div>
  );
}
