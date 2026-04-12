import { useState } from 'react';
import { SKILL_PATHS } from '../constants/data';
import LevelMap from './LevelMap';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Compass } from 'lucide-react';

/* Helper to render Lucide icons by name from our data.js */
const LucideIcon = ({ name, size = 24, className = "" }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) return <Icons.HelpCircle size={size} className={className} />;
  return <IconComponent size={size} className={className} />;
};

const PATH_COLORS = {
  webdev:      '#3b82f6',
  aptitude:    '#8b5cf6',
  english:     '#10b981',
  datascience: '#f59e0b',
  agenticai:   '#ec4899',
  dsa:         '#f43f5e',
  mathematics: '#fbbf24',
  chemistry:   '#06b6d4',
  physics:     '#6366f1',
  others:      '#a855f7',
};

import { generateAIQuiz } from '../api';

export default function Quests({ activeQuestPath, setActiveQuestPath, openQuest, getQuestStatus, userData, questsList, username, avatarEmoji }) {
  const [isSummoning, setIsSummoning] = useState(false);
  const [summonSubject, setSummonSubject] = useState('');
  const [summonLevel, setSummonLevel] = useState('intermediate');
  const [error, setError] = useState(null);

  // Filter the master list by the current active path
  const quests = questsList.filter(q => q.pathId === activeQuestPath);
  const color  = PATH_COLORS[activeQuestPath] || '#7c3aed';

  // Progress for current path
  const done = quests.filter(q => q.isCompleted).length;
  const pct  = quests.length > 0 ? Math.round((done / quests.length) * 100) : 0;

  const handleSummon = async (e) => {
    e.preventDefault();
    if (!summonSubject.trim()) return;
    
    setIsSummoning(true);
    setError(null);
    try {
      const newQuest = await generateAIQuiz(summonSubject, summonLevel);
      await openQuest(newQuest);
      setSummonSubject('');
    } catch (err) {
      setError(err.message || 'The summoning spell failed. Try again!');
    } finally {
      setIsSummoning(false);
    }
  };

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
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border backdrop-blur-xl shrink-0
                ${activeQuestPath === path.id
                  ? 'text-white border-transparent shadow-[0_10px_30px_rgba(0,0,0,0.5)] scale-105'
                  : 'bg-surface2/50 border-white/5 text-text3 hover:border-white/20 hover:text-text1 hover:bg-surface'}`}
              style={activeQuestPath === path.id ? { background: `linear-gradient(135deg, ${PATH_COLORS[path.id]}, ${PATH_COLORS[path.id]}aa)`, boxShadow: `0 0 25px ${PATH_COLORS[path.id]}44` } : {}}
            >
              <span className="icon"><LucideIcon name={path.icon} size={20} /></span> {path.name}
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

      {/* The Progression Map OR Summoner UI */}
      <div className="flex-1 mt-4 pb-24">
        {activeQuestPath === 'others' ? (
          <div className="flex flex-col gap-12">
            {/* Summoner Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface2/30 border-2 border-dashed border-accent/20 rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
              
              <div className="relative z-10 max-w-xl mx-auto">
                <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center text-accent mx-auto mb-6 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                  <Icons.Sparkles size={40} className={isSummoning ? 'animate-spin' : 'animate-pulse'} />
                </div>
                
                <h3 className="font-title text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">Summoner's Circle</h3>
                <p className="text-text3 text-sm font-bold uppercase tracking-widest mb-10">Cast a spell to generate a custom AI trial on any subject.</p>

                <form onSubmit={handleSummon} className="space-y-6">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-accent uppercase tracking-[0.3em] ml-2">Trial Subject</label>
                    <input 
                      type="text"
                      value={summonSubject}
                      onChange={(e) => setSummonSubject(e.target.value)}
                      placeholder="e.g. Ancient Greek Philosophy, React Patterns, Pokemon Trivia..."
                      className="w-full bg-[#050510] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-accent focus:outline-none transition-all placeholder:text-text3/30 placeholder:font-normal"
                      disabled={isSummoning}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 space-y-2 text-left">
                      <label className="text-[10px] font-black text-accent uppercase tracking-[0.3em] ml-2">Level of Mastery</label>
                      <select 
                        value={summonLevel}
                        onChange={(e) => setSummonLevel(e.target.value)}
                        className="w-full bg-[#050510] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-accent focus:outline-none transition-all appearance-none cursor-pointer"
                        disabled={isSummoning}
                      >
                        <option value="beginner">Beginner Apprentice</option>
                        <option value="intermediate">Skillful Warrior</option>
                        <option value="advanced">Legendary Master</option>
                      </select>
                    </div>
                    
                    <div className="flex-none flex items-end">
                      <button 
                        type="submit"
                        disabled={isSummoning || !summonSubject.trim()}
                        className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
                          ${isSummoning 
                            ? 'bg-accent/20 text-accent/50 cursor-not-allowed' 
                            : 'bg-accent text-white hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(124,58,237,0.4)]'}`}
                      >
                        {isSummoning ? (
                          <>
                            <Icons.RefreshCw size={18} className="animate-spin" /> Summoning...
                          </>
                        ) : (
                          <>
                            <Icons.Wand2 size={18} /> Cast Spell
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-400 text-xs font-bold uppercase tracking-widest mt-4"
                    >
                      ⚠️ {error}
                    </motion.div>
                  )}
                </form>
              </div>

              {/* Background Magic */}
              {isSummoning && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        y: [-20, -500], 
                        opacity: [0, 1, 0],
                        scale: [0.5, 1.5, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                      className="absolute text-accent/30"
                      style={{ left: `${Math.random() * 100}%`, bottom: '0' }}
                    >
                      <Icons.Flame size={20} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Previously Summoned Map */}
            {quests.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-white/5" />
                  <h3 className="text-[10px] font-black text-text3 uppercase tracking-[0.4em]">Previously Summoned</h3>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <LevelMap 
                  quests={quests} 
                  getQuestStatus={getQuestStatus} 
                  openQuest={openQuest} 
                  color={color}
                  username={username}
                  avatarEmoji={avatarEmoji}
                />
              </div>
            )}
          </div>
        ) : quests.length > 0 ? (
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
            <div className="text-6xl mb-4 opacity-20 text-accent2">
              <Compass size={64} />
            </div>
            <p className="text-text3 font-bold uppercase tracking-widest">This territory is yet to be discovered...</p>
          </div>
        )}
      </div>
    </div>
  );
}

