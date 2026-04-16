import { useEffect, useRef } from 'react';
import { SKILL_PATHS } from '../constants/data';
import { 
  X, 
  ScrollText, 
  Coins, 
  Check, 
  AlertCircle, 
  Zap, 
  Lock, 
  Crown, 
  Lightbulb,
  PartyPopper,
  Swords,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import * as Icons from 'lucide-react';

/* Helper to render Lucide icons by name */
const LucideIcon = ({ name, size = 16, className = "" }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} />;
};

// Counts up from 0 → value when mounted
function CountUp({ value, prefix = '', suffix = '', className = '' }) {
  const spanRef = useRef(null);
  useEffect(() => {
    let cur = 0;
    const step = Math.max(1, Math.ceil(value / 18));
    const timer = setInterval(() => {
      cur = Math.min(cur + step, value);
      if (spanRef.current) spanRef.current.textContent = prefix + cur + suffix;
      if (cur >= value) clearInterval(timer);
    }, 28);
    return () => clearInterval(timer);
  }, [value, prefix, suffix]);
  return <span ref={spanRef} className={className}>{prefix}0{suffix}</span>;
}

export default function QuestModal({
  activeQuest,
  activeQuestPath,
  setActiveQuest,
  handleAnswer,
  selectedOption,
  answered,
  userData,
  onNextQuest,
  hasNextQuest,
}) {
  if (!activeQuest) return null;

  const isCorrect        = answered && selectedOption === activeQuest.answer;
  const alreadyCompleted = !!userData.completedQuests.find(q => q.id === activeQuest.id);
  const pathMeta         = SKILL_PATHS.find(p => p.id === activeQuestPath);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={e => e.target === e.currentTarget && setActiveQuest(null)}
    >
      <div className="bg-surface border border-white/20 rounded-2xl w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(124,58,237,0.15)]">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex justify-between items-start px-7 pt-7 pb-0 mb-5">
          <div>
            <div className="text-[10px] text-accent2 font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5 focus:outline-none">
              <LucideIcon name={pathMeta?.icon} size={14} className="text-accent2" />
              <span>{pathMeta?.name}</span>
              <span className="text-text3">•</span>
              <span>Level {activeQuest.level}</span>
            </div>
            <div className="font-title text-xl font-bold">{activeQuest.title}</div>
            <div className="flex gap-2 mt-1.5">
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-accent/20 text-accent2 flex items-center gap-1">
                <Zap size={10} fill="currentColor" /> +{activeQuest.xp} XP
              </span>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-yellow-500/15 text-gold flex items-center gap-1">
                <Coins size={10} fill="currentColor" /> +{activeQuest.coins}
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveQuest(null)}
            className="bg-surface2 hover:bg-surface3 text-text2 hover:text-text1 w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
          ><X size={18} /></button>
        </div>

        <div className="px-7 pb-7">
          {/* Story */}
          <div className="bg-bg2 border-l-4 border-accent rounded-lg p-4 mb-5 text-sm text-text2 italic leading-relaxed flex gap-3">
            <ScrollText size={18} className="shrink-0 text-accent opacity-60" />
            <div>{activeQuest.desc}</div>
          </div>

          {/* Question */}
          <div className="text-[15px] font-semibold text-text1 mb-4 leading-relaxed">
            {activeQuest.question}
          </div>

          {/* Options — exactly mirrors reference, plus color coding */}
          <div className="flex flex-col gap-2 mb-4">
            {activeQuest.options.map((opt, idx) => {
              let cls = 'bg-bg2 border-white/10 text-text1 hover:border-white/20 hover:bg-surface2 cursor-pointer';
              if (answered) {
                if (idx === activeQuest.answer)    cls = 'bg-green2/15 border-green2 text-green-300';
                else if (idx === selectedOption)   cls = 'bg-red-500/10 border-red-500 text-red-300';
                else                               cls = 'bg-bg2 border-white/5 text-text3 opacity-50';
              }
              return (
                <button
                  key={idx}
                  disabled={answered}
                  onClick={() => handleAnswer(idx)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-200 ${cls} font-bold`}
                >
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black flex-shrink-0
                    ${answered && idx === activeQuest.answer ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                      : answered && idx === selectedOption  ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                      : 'bg-surface text-text2 border border-white/10'}`}>
                    {['A','B','C','D'][idx]}
                  </span>
                  {opt}
                  {answered && idx === activeQuest.answer && <Check size={16} className="ml-auto text-green-400" />}
                </button>
              );
            })}
          </div>

          {/* ── Result area ─────────────────────────────────────────── */}
          {answered && (
            <div className="animate-pop-in">
              {/* Explanation */}
              <div className={`rounded-xl px-4 py-3 mb-4 text-sm leading-relaxed border flex gap-3
                ${isCorrect ? 'bg-green2/5 border-green2/20 text-green-300' : 'bg-red-500/5 border-red-500/20 text-red-300'}`}>
                <div className="shrink-0 mt-0.5">
                  {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </div>
                <div>
                  <strong>{isCorrect ? 'Correct! ' : 'Not quite. '}</strong>
                  {activeQuest.explanation}
                </div>
              </div>

              {/* Reward banner — fresh completion only */}
              {isCorrect && !alreadyCompleted && (
                <div className="bg-gradient-to-br from-accent/20 to-pink2/10 border border-accent2/30 rounded-2xl p-5 mb-4 text-center animate-count-up relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-accent/30 rounded-full" />
                  <div className="font-title text-sm font-black text-accent2 mb-4 uppercase tracking-widest flex items-center justify-center gap-2">
                    <Zap size={14} fill="currentColor" /> Quest Complete!
                  </div>
                  <div className="flex justify-center gap-10 mb-5">
                    <div>
                      <CountUp value={activeQuest.xp} prefix="+" suffix=" XP" className="font-title text-3xl font-black text-gradient-purple" />
                      <div className="text-[10px] text-text3 mt-1 uppercase font-bold tracking-widest">Experience</div>
                    </div>
                    <div>
                      <CountUp value={activeQuest.coins} prefix="+" suffix="" className="font-title text-3xl font-black text-gold" />
                      <div className="text-[10px] text-text3 mt-1 uppercase font-bold tracking-widest flex items-center justify-center gap-1">
                        <Coins size={10} fill="currentColor" /> Coins
                      </div>
                    </div>
                  </div>
                  {/* Unlock announcement */}
                  {hasNextQuest ? (
                    <div className="flex items-center justify-center gap-2 bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-xs font-black text-white uppercase tracking-widest animate-unlock">
                      <Lock size={14} className="text-accent2" /> Next Quest Unlocked!
                    </div>
                  ) : (
                    <div className="text-xs font-black text-gold animate-unlock uppercase tracking-widest flex items-center justify-center gap-2">
                      <Crown size={16} fill="currentColor" /> Path Complete! All quests mastered!
                    </div>
                  )}
                </div>
              )}

              {/* Already completed notice */}
              {isCorrect && alreadyCompleted && (
                <div className="bg-green2/5 border border-green2/20 rounded-xl px-4 py-3 mb-4 text-[10px] font-black uppercase tracking-widest text-green-300 text-center flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} /> Already completed — no duplicate rewards.
                </div>
              )}

              {/* Wrong answer hint */}
              {!isCorrect && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3 mb-4 text-[10px] font-black uppercase tracking-widest text-yellow-300 flex items-center gap-3">
                  <Lightbulb size={18} className="shrink-0" /> 
                  <div>The next quest unlocks only after a correct answer. Study the explanation and try again!</div>
                </div>
              )}

              {/* Primary CTA */}
              <button
                onClick={() => {
                  if (isCorrect && hasNextQuest) onNextQuest();
                  else setActiveQuest(null);
                }}
                className={`w-full py-4 rounded-xl text-white font-black uppercase tracking-widest transition-all duration-300 hover:-translate-y-1 active:scale-95 text-xs
                  ${isCorrect && hasNextQuest
                    ? 'bg-gradient-to-r from-green-600 to-teal-500 shadow-lg shadow-green-600/20 hover:shadow-green-600/40'
                    : isCorrect
                    ? 'bg-gradient-to-r from-accent to-accent2 shadow-lg shadow-accent/20 hover:shadow-accent/40'
                    : 'bg-surface2 hover:bg-surface3 text-text2 hover:text-text1 border border-white/10'}`}
              >
                <span className="flex items-center justify-center gap-3">
                  {isCorrect && hasNextQuest ? (
                    <><Swords size={16} /> Continue to Next Quest</>
                  ) : isCorrect ? (
                    <><PartyPopper size={16} /> Claim Reward</>
                  ) : (
                    <>Try Again Later</>
                  )}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

