import { useEffect, useRef } from 'react';
import { SKILL_PATHS } from '../constants/data';

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
            <div className="text-[10px] text-accent2 font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5">
              <span>{pathMeta?.icon}</span>
              <span>{pathMeta?.name}</span>
              <span className="text-text3">•</span>
              <span>Level {activeQuest.level}</span>
            </div>
            <div className="font-title text-xl font-bold">{activeQuest.title}</div>
            <div className="flex gap-2 mt-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent2">+{activeQuest.xp} XP</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-gold">+{activeQuest.coins} 🪙</span>
            </div>
          </div>
          <button
            onClick={() => setActiveQuest(null)}
            className="bg-surface2 hover:bg-surface3 text-text2 hover:text-text1 w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-base flex-shrink-0"
          >✕</button>
        </div>

        <div className="px-7 pb-7">
          {/* Story */}
          <div className="bg-bg2 border-l-4 border-accent rounded-lg p-4 mb-5 text-sm text-text2 italic leading-relaxed">
            📜 {activeQuest.desc}
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-200 ${cls}`}
                >
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${answered && idx === activeQuest.answer ? 'bg-green-500 text-white'
                      : answered && idx === selectedOption  ? 'bg-red-500 text-white'
                      : 'bg-surface text-text2'}`}>
                    {['A','B','C','D'][idx]}
                  </span>
                  {opt}
                  {answered && idx === activeQuest.answer && <span className="ml-auto text-green-400">✓</span>}
                </button>
              );
            })}
          </div>

          {/* ── Result area ─────────────────────────────────────────── */}
          {answered && (
            <div className="animate-pop-in">
              {/* Explanation */}
              <div className={`rounded-xl px-4 py-3 mb-4 text-sm leading-relaxed border
                ${isCorrect ? 'bg-green2/5 border-green2/20 text-green-300' : 'bg-red-500/5 border-red-500/20 text-red-300'}`}>
                <strong>{isCorrect ? '✅ Correct! ' : '❌ Not quite. '}</strong>
                {activeQuest.explanation}
              </div>

              {/* Reward banner — fresh completion only */}
              {isCorrect && !alreadyCompleted && (
                <div className="bg-gradient-to-br from-accent/20 to-pink2/10 border border-accent2/30 rounded-2xl p-5 mb-4 text-center animate-count-up">
                  <div className="font-title text-sm font-semibold text-accent2 mb-3">⚡ Quest Complete!</div>
                  <div className="flex justify-center gap-8 mb-3">
                    <div>
                      <CountUp value={activeQuest.xp} prefix="+" suffix=" XP" className="font-title text-2xl font-bold text-gradient-purple" />
                      <div className="text-[10px] text-text3 mt-0.5">Experience</div>
                    </div>
                    <div>
                      <CountUp value={activeQuest.coins} prefix="+" suffix=" 🪙" className="font-title text-2xl font-bold text-gold" />
                      <div className="text-[10px] text-text3 mt-0.5">Coins</div>
                    </div>
                  </div>
                  {/* Unlock announcement */}
                  {hasNextQuest ? (
                    <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-semibold text-text1 animate-unlock">
                      🔓 Next Quest Unlocked!
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-gold animate-unlock">
                      👑 Path Complete! All quests mastered!
                    </div>
                  )}
                </div>
              )}

              {/* Already completed notice */}
              {isCorrect && alreadyCompleted && (
                <div className="bg-green2/5 border border-green2/20 rounded-xl px-4 py-3 mb-4 text-xs text-green-300 text-center">
                  ✅ Already completed — no duplicate rewards.
                </div>
              )}

              {/* Wrong answer hint */}
              {!isCorrect && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3 mb-4 text-xs text-yellow-300">
                  💡 The next quest unlocks only after a correct answer. Study the explanation and try again!
                </div>
              )}

              {/* Primary CTA */}
              <button
                onClick={() => {
                  if (isCorrect && hasNextQuest) onNextQuest();
                  else setActiveQuest(null);
                }}
                className={`w-full py-3 rounded-xl text-white font-semibold tracking-wide transition-all duration-200 hover:-translate-y-0.5
                  ${isCorrect && hasNextQuest
                    ? 'bg-gradient-to-r from-green-600 to-teal-500 hover:shadow-[0_6px_24px_rgba(16,185,129,0.45)]'
                    : isCorrect
                    ? 'bg-gradient-to-r from-accent to-accent2 hover:shadow-[0_6px_24px_rgba(124,58,237,0.45)]'
                    : 'bg-surface2 hover:bg-surface3 text-text2 hover:text-text1'}`}
              >
                {isCorrect && hasNextQuest ? '⚔️  Continue to Next Quest →'
                  : isCorrect              ? '🎉  Claim Reward'
                  :                          '↩  Try Again Later'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
