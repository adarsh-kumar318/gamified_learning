import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveQuestProgress, fetchQuestProgress, finalizeQuest, restartQuest, fetchQuestDetail, submitAnswerToQuest, fetchAIExplanation } from '../api';
import { AVATARS } from '../constants/data';
import RescueScene from './RescueScene';
import EventBus from '../game/core/EventBus';
import { GAME_EVENTS } from '../game/constants';
import ProgressSystem from '../game/systems/ProgressSystem';
import TimerSystem from '../game/systems/TimerSystem';
import { 
  ArrowLeft, 
  Trophy, 
  Skull, 
  Zap, 
  Map as MapIcon, 
  RefreshCw, 
  ScrollText, 
  Swords, 
  CircleX, 
  Star, 
  Timer, 
  Brain
} from 'lucide-react';

export default function QuestPanel({ quest, onClose, onAnswer, onRestart, onRefill, energy, userData }) {
  const isChallenge = quest.questions.length === 5;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading', 'idle', 'correct', 'wrong', 'complete', 'failed', 'out-of-energy'
  const [timeLeft, setTimeLeft] = useState(quest.isBoss ? 300 : (isChallenge ? 90 : null));
  const [earnedXp, setEarnedXp] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isResumed, setIsResumed] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const selectedAvatar = AVATARS.find(a => a.id === userData.avatarId) || AVATARS[0];

  // 1. Fetch Progress on Mount
  useEffect(() => {
    const initQuest = async () => {
      try {
        const { progress: savedProgress } = await fetchQuestProgress(quest.id);
        if (savedProgress && !savedProgress.isCompleted) {
          setCurrentIndex(savedProgress.currentQuestionIndex);
          setAnswers(savedProgress.answers || []);
          setIsResumed(true);
          
          // Sync with Game Systems
          ProgressSystem.init(quest.questions.length);
          for(let i=0; i<savedProgress.answers.length; i++) ProgressSystem.increment();
        } else {
          ProgressSystem.init(quest.questions.length);
        }

        if (isChallenge || quest.isBoss) {
            TimerSystem.start(timeLeft);
        }

        setStatus('idle');
        EventBus.emit(GAME_EVENTS.LEVEL_START, quest);
      } catch (err) {
        console.error("Failed to fetch resume state:", err);
        setStatus('idle');
      }
    };
    initQuest();
  }, [quest.id]);

  useEffect(() => {
    // Sync UI with TimerSystem updates
    const unsubscribeTime = EventBus.on(GAME_EVENTS.TIME_UPDATE, ({ timeLeft: newTime }) => {
      setTimeLeft(newTime);
    });

    const unsubscribeTimeUp = EventBus.on(GAME_EVENTS.TIME_UP, () => {
      setStatus('failed');
    });

    return () => {
      unsubscribeTime();
      unsubscribeTimeUp();
    };
  }, []);

  const handleRestartClick = async () => {
    setStatus('loading');
    await onRestart();
    setStatus('idle');
  };

  const handleOptionClick = async (idx) => {
    if (status !== 'idle') return;
    setSelectedOpt(idx);
    
    const result = await onAnswer(currentIndex, idx);
    
    if (result.correct) {
      setStatus('correct');
      EventBus.emit(GAME_EVENTS.QUESTION_CORRECT);
      ProgressSystem.increment();
      
      setEarnedXp(prev => prev + (result.xpEarned || 20));
      
      const updatedAnswers = [...answers, { questionIndex: currentIndex, selectedOption: idx }];
      setAnswers(updatedAnswers);

      if (result.newBadges && result.newBadges.length > 0) {
        setUnlockedBadges(prev => [...prev, ...result.newBadges]);
        setTimeout(() => setUnlockedBadges([]), 5000);
      }

      setTimeout(async () => {
        if (currentIndex < quest.questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setSelectedOpt(null);
          setStatus('idle');
        } else {
          setStatus('complete');
          EventBus.emit(GAME_EVENTS.LEVEL_COMPLETE);
          TimerSystem.stop();
        }
      }, 1200);
    } else if (result.outOfEnergy) {
      setStatus('out-of-energy');
    } else {
      setStatus('wrong');
      EventBus.emit(GAME_EVENTS.QUESTION_WRONG);
      
      // Fetch AI explanation
      setIsExplaining(true);
      try {
        const question = quest.questions[currentIndex];
        const data = await fetchAIExplanation(
          question.question,
          question.options,
          question.answer,
          quest.type,
          quest.isAI ? "Custom" : "Path"
        );
        setAiExplanation(data.explanation);
      } catch (err) {
        console.error("AI Explanation failed:", err);
      } finally {
        setIsExplaining(false);
      }
    }
  };

  const progressValue = (answers.length / quest.questions.length) * 100;

  if (status === 'loading') return (
    <div className="fixed inset-0 z-[100] bg-[#050510] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-accent2 animate-spin"><RefreshCw size={40} /></div>
        <div className="text-accent2 font-black uppercase tracking-widest text-xs">Resuming Trial State...</div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed inset-0 z-[100] bg-[#050510] flex flex-col font-mono transition-colors duration-500 ${
        status === 'wrong' ? 'bg-red-950/20' : 
        status === 'correct' ? 'bg-green-950/20' : 
        'bg-[#050510]'
      }`}
    >
      {/* Background: Cinematic Rescue or Standard Dark */}
      {isChallenge ? (
        <RescueScene 
          progress={answers.length / quest.questions.length} 
          status={status === 'complete' ? 'success' : (status === 'failed' ? 'failed' : status)}
          timeLeft={timeLeft}
          avatarEmoji={selectedAvatar?.emoji}
          themeType={
            (() => {
              const id = quest.id.toLowerCase();
              const levelMatch = id.match(/\d+$/);
              const levelNum = levelMatch ? parseInt(levelMatch[0]) : 1;
              
              if (id.includes('aptitude')) return levelNum % 2 === 0 ? 'water' : 'void';
              if (id.includes('webdev')) return levelNum % 2 !== 0 ? 'lava' : 'jail';
              if (id.includes('english')) return levelNum % 2 === 0 ? 'forest' : 'jail';
              if (id.includes('datascience')) return levelNum % 2 !== 0 ? 'void' : 'desert';
              return 'water';
            })()
          }
        />
      ) : (
        <div className="absolute inset-0 bg-[#050510]" />
      )}

      {/* Cinematic Pulse Overlays */}
      <AnimatePresence>
        {status === 'correct' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] pointer-events-none bg-green-500/10 shadow-[inset_0_0_100px_rgba(34,197,94,0.3)]"
          />
        )}
        {status === 'wrong' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] pointer-events-none bg-red-500/10 shadow-[inset_0_0_100px_rgba(239,68,68,0.3)]"
          />
        )}
      </AnimatePresence>

      {/* Badge Unlocked Notification */}
      <AnimatePresence>
        {unlockedBadges.map((badge, idx) => (
          <motion.div
            key={`badge-${badge.id}-${idx}`}
            initial={{ y: 50, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.5 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-gradient-to-br from-gold to-amber-600 p-0.5 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.5)]"
          >
            <div className="bg-[#050510] px-6 py-4 rounded-2xl flex items-center gap-4">
              <div className="text-gold animate-bounce"><Trophy size={40} /></div>
              <div>
                <div className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Badge Unlocked!</div>
                <div className="font-title text-xl text-white font-bold">{badge.name}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* RPG Header */}
      <div className="h-16 md:h-20 border-b border-white/5 bg-surface/50 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={onClose} className="px-4 h-10 rounded-xl bg-white/5 flex items-center gap-2 hover:bg-white/10 transition-colors group">
            <ArrowLeft className="text-text3 group-hover:text-white group-hover:-translate-x-1 transition-all" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Return to Map</span>
          </button>
          <div className="min-w-0">
            <div className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${isChallenge ? 'text-red-500 animate-pulse' : 'text-accent2'}`}>
              {isChallenge ? "EMERGENCY RESCUE" : `${quest.type} Trial`} {isResumed && "• RESUMED"}
            </div>
            <div className="font-title text-sm md:text-xl font-bold text-white leading-none truncate max-w-[120px] md:max-w-none">{quest.title}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-8">
          {/* Challenge Timer */}
          {(isChallenge || quest.isBoss) && (
            <div className={`flex flex-col items-end px-3 md:px-4 py-1 md:py-1.5 rounded-xl border ${timeLeft < 20 ? 'bg-red-500/20 border-red-500 animate-pulse' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-black text-text3 uppercase">
                <Timer size={10} /> Time
              </div>
              <div className={`text-sm md:text-xl font-black tabular-nums ${timeLeft < 20 ? 'text-red-500' : 'text-white'}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          )}

          {/* Energy */}
          <div className="flex flex-col items-end">
            <div className="text-[9px] font-black text-text3 uppercase">Energy</div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm rotate-45 border ${i < energy ? 'bg-blue-500 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/5 border-white/10'}`} />
              ))}
            </div>
          </div>

          {/* XP Gained */}
          <div className="hidden sm:flex flex-col items-end">
            <div className="text-[9px] font-black text-text3 uppercase">XP Earned</div>
            <div className="text-xl font-black text-gold flex items-center gap-1">
              <Star size={14} fill="currentColor" /> {earnedXp}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
        {status === 'out-of-energy' ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center z-20 px-8"
          >
            <div className="text-red-500 mb-6 flex justify-center"><Zap size={80} fill="currentColor" className="animate-pulse" /></div>
            <h2 className="font-title text-4xl font-black text-red-500 mb-4 italic uppercase tracking-tighter shadow-glow">STAMINA DEPLETED</h2>
            <p className="text-text3 font-bold uppercase tracking-widest mb-10 max-w-md mx-auto">Your physical and mental strength has faded. You must rest at the Inn before continuing this trial.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={async () => {
                  try {
                    await onRefill();
                    setStatus('idle');
                  } catch (err) {}
                }}
                className="px-8 py-4 bg-accent text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(124,58,237,0.4)] flex items-center justify-center gap-3"
              >
                <Zap size={18} fill="currentColor" /> Rest & Recover (10 Gold)
              </button>
              <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onClose}
                className="px-8 py-4 bg-white/5 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all border border-white/10 hover:scale-105 flex items-center justify-center gap-3"
              >
                <MapIcon size={18} /> Return to Map
              </button>
              <button 
                onClick={handleRestartClick}
                className="px-8 py-4 bg-red-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] flex items-center justify-center gap-3"
              >
                <RefreshCw size={18} /> Retry Attempt
              </button>
            </div>
            </div>
          </motion.div>
        ) : status === 'complete' ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-center z-[100] px-8 flex flex-col items-center ${isChallenge ? 'mt-[34rem]' : ''}`}
          >
            {!isChallenge && (
              <>
                <div className="text-gold mb-6"><Trophy size={80} fill="currentColor" /></div>
                <h2 className="font-title text-5xl font-black text-white mb-4 italic uppercase tracking-tighter">TRIAL CONQUERED</h2>
              </>
            )}
            <p className="text-text3 font-bold uppercase tracking-widest mb-10 text-sm md:text-base bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-3">
              You survived the trial and gained <span className="text-gold font-black">+{earnedXp} XP</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onClose}
                className="px-10 py-4 bg-gold text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3"
              >
                <MapIcon size={18} /> Return to Map
              </button>
              <button 
                onClick={handleRestartClick}
                className="px-10 py-4 bg-white/5 text-gold font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all border border-gold/30 hover:scale-105 flex items-center justify-center gap-3"
              >
                <RefreshCw size={18} /> Replay Level
              </button>
            </div>
          </motion.div>
        ) : status === 'failed' ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-center z-[100] px-8 flex flex-col items-center ${isChallenge ? 'mt-[34rem]' : ''}`}
          >
            {!isChallenge && (
              <>
                <div className="text-red-600 mb-6"><Skull size={80} /></div>
                <h2 className="font-title text-5xl font-black text-red-600 mb-4 italic uppercase tracking-tighter">RESCUE FAILED</h2>
              </>
            )}
            <p className="text-text3 font-bold uppercase tracking-widest mb-10 max-w-md mx-auto bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg">
              {isChallenge ? "The chamber has been submerged. You were too slow for this challenge." : "Your skills were not yet sufficient for this trial."}
            </p>
            <button 
              onClick={onClose}
              className="px-12 py-4 bg-white/10 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/20 transition-all border border-white/20 hover:scale-105 flex items-center justify-center gap-3"
            >
              <MapIcon size={18} /> Return to Map
            </button>
          </motion.div>
        ) : (
          <div className="w-full max-w-3xl px-8 z-10">
            {/* Progress Bar */}
            <div className="mb-8 md:mb-12">
              <div className="flex justify-between text-[11px] font-black text-text3 uppercase tracking-tighter mb-2">
                <span>Phase: {currentIndex + 1} / {quest.questions.length}</span>
                <span className="text-accent2">{Math.round(progressValue)}% Mastery</span>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                   animate={{ width: `${progressValue}%` }}
                   className="h-full bg-gradient-to-r from-accent via-accent2 to-accent shadow-[0_0_15px_rgba(124,58,237,0.5)] relative" 
                >
                  <motion.div 
                    animate={{ opacity: [0, 0.5, 0], x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-white/30"
                  />
                </motion.div>
              </div>
            </div>

            {(() => {
              const currentQuestion = quest.questions[currentIndex];
              return (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ x: 50, opacity: 0, rotateY: 45 }}
                    animate={{ x: 0, opacity: 1, rotateY: 0 }}
                    exit={{ x: -50, opacity: 0, rotateY: -45 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className={`p-6 md:p-12 rounded-[2rem] border-2 transition-all duration-300 relative overflow-hidden ${
                      status === 'correct' ? 'bg-green-500/10 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.2)]' :
                      status === 'wrong' ? 'bg-red-500/10 border-red-500 shake-ui' :
                      'bg-surface/50 border-white/10 backdrop-blur-3xl'
                    }`}
                  >
                    <div className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-4 opacity-70 text-center flex items-center justify-center gap-2">
                      <Swords size={12} /> TRIAL OBJECTIVE {currentIndex + 1}
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold text-white mb-8 md:mb-12 leading-relaxed text-center font-title tracking-tight">
                      {currentQuestion?.question}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {currentQuestion?.options.map((opt, idx) => (
                        <button
                          key={idx}
                          disabled={status !== 'idle'}
                          onClick={() => handleOptionClick(idx)}
                          className={`
                            relative p-5 md:p-7 rounded-2xl border-2 text-left font-bold transition-all group overflow-hidden active:scale-95
                            ${selectedOpt === idx 
                              ? (status === 'correct' ? 'bg-green-500 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 
                                 status === 'wrong' ? 'bg-red-500 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 
                                 'bg-accent border-accent2 text-white')
                              : 'bg-white/5 border-white/5 hover:border-accent/40 text-text2 hover:text-white hover:bg-white/10'
                            }
                          `}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center text-xs font-black ${selectedOpt === idx ? 'text-white' : 'text-accent2'}`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <div className="flex-1">{opt}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              );
            })()}

            {/* AI Explanation Overlay / Card */}
            <AnimatePresence>
              {status === 'wrong' && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="mt-8 bg-surface2/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-3xl shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent2/20 flex items-center justify-center text-accent2 shrink-0">
                      <Brain size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-accent2 uppercase tracking-[0.2em] mb-1">Sage Insight</div>
                      {isExplaining ? (
                        <div className="flex items-center gap-2 text-text3 font-bold italic py-2">
                          <RefreshCw className="animate-spin" size={12} />
                          Consulting the archives...
                        </div>
                      ) : (
                        <p className="text-text1 font-bold leading-relaxed">
                          {aiExplanation || "Review the sacred texts, warrior. Focus your mind and try again."}
                        </p>
                      )}
                      
                      <button 
                        onClick={() => {
                          setStatus('idle');
                          setAiExplanation(null);
                        }}
                        className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-text3 hover:text-white transition-all border border-white/5"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -200], 
                opacity: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 100]
              }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
              className="absolute w-1 h-1 bg-accent rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: '100%' }}
            />
          ))}
        </div>
      </div>

      {/* RPG Footer */}
      <div className="h-24 bg-surface/80 border-t border-white/5 backdrop-blur-xl flex items-center justify-center gap-6 md:gap-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold"><ScrollText size={20} /></div>
          <div>
            <div className="text-[10px] font-black text-text3 uppercase">Guardian Tip</div>
            <div className="text-[10px] md:text-xs font-bold text-text1">Patience is the warrior's shield.</div>
          </div>
        </div>
        <div className="w-px h-8 bg-white/5" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent"><Swords size={20} /></div>
          <div>
            <div className="text-[10px] font-black text-text3 uppercase">Focus</div>
            <div className="text-[10px] md:text-xs font-bold text-text1">Precision over Speed.</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
