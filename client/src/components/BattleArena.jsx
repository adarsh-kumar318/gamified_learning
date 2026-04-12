import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Skull, 
  Timer, 
  Swords, 
  Target, 
  Zap, 
  Flame 
} from 'lucide-react';

export default function BattleArena({ 
  battleId, 
  opponentName, 
  questions, 
  onResult, 
  socket, 
  userData 
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [oppProgress, setOppProgress] = useState({ score: 0, index: 0, completed: false });
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState(null);
  
  const startTime = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('opponent_progress', (data) => {
      setOppProgress({ score: data.score, index: data.questionIndex, completed: data.completed });
    });

    socket.on('battle_result', (res) => {
      setResult(res);
      setGameOver(true);
      if (timerRef.current) clearInterval(timerRef.current);
    });

    // Start Timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          socket.emit('battle_timeout', battleId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      socket.off('opponent_progress');
      socket.off('battle_result');
    };
  }, [socket, battleId]);

  const handleAnswer = (optionIdx) => {
    if (gameOver) return;

    const isCorrect = optionIdx === questions[currentIdx].correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    const timeTaken = (Date.now() - startTime.current) / 1000;

    setScore(newScore);

    socket.emit('submit_answer', {
      battleId,
      userId: userData._id,
      questionIndex: currentIdx,
      isCorrect,
      totalTime: currentIdx === 4 ? timeTaken : 0
    });

    if (currentIdx < 4) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  if (gameOver && result) {
    const isWinner = result.winnerId === userData._id;
    return (
      <div className="fixed inset-0 z-[700] bg-bg flex items-center justify-center p-6">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl bg-surface border border-white/10 rounded-[2.5rem] p-12 text-center relative overflow-hidden"
        >
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${isWinner ? 'from-gold via-yellow-400 to-gold' : 'from-red-500 via-red-600 to-red-500'}`} />
            
            <div className={`text-8xl mb-6 flex justify-center ${isWinner ? 'text-gold' : 'text-red-500'}`}>
              {isWinner ? <Trophy size={120} fill="currentColor" /> : <Skull size={120} />}
            </div>
            <h2 className={`font-title text-5xl font-black mb-2 uppercase tracking-tighter ${isWinner ? 'text-gold' : 'text-red-500'}`}>
                {isWinner ? 'Victory Path' : 'Defeat'}
            </h2>
            <p className="text-text2 font-mono tracking-widest mb-12 opacity-60">
                {isWinner ? `XP REWARDED: +50` : `XP LOST: -50`}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="bg-bg2/40 rounded-3xl p-6 border border-white/5">
                    <div className="text-xs text-text3 uppercase mb-1 font-black flex items-center justify-center gap-2">
                      <Swords size={12} /> You
                    </div>
                    <div className="font-title text-3xl font-bold text-white">{score} / 5</div>
                </div>
                <div className="bg-bg2/40 rounded-3xl p-6 border border-white/5">
                    <div className="text-xs text-text3 uppercase mb-1 font-black flex items-center justify-center gap-2">
                       <Target size={12} /> {opponentName}
                    </div>
                    <div className="font-title text-3xl font-bold text-white">{oppProgress.score} / 5</div>
                </div>
            </div>

            <button 
                onClick={() => onResult()}
                className="w-full py-5 rounded-2xl bg-accent text-white font-title font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(124,58,237,0.4)] hover:scale-[1.02] transition-all"
            >
                Return to Realm
            </button>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="min-h-screen bg-bg p-4 sm:p-6 lg:p-12 font-main text-text1 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent2 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── Mobile Sidebar (top strip) / Desktop sidebar (left col) ── */}
        <div className="battle-layout grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
          <div className="lg:col-span-3">
            {/* Battle sidebar — row on mobile, column on desktop */}
            <div className="battle-sidebar grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:space-y-8">
              {/* Timer */}
              <div className="bg-surface/40 backdrop-blur-md border border-white/10 p-4 sm:p-8 rounded-2xl sm:rounded-[2rem]">
                <div className="flex items-center justify-between mb-3 sm:mb-6">
                  <span className="font-title font-black text-[10px] sm:text-sm uppercase tracking-widest opacity-60 flex items-center gap-2">
                    <Timer size={16} /> Timer
                  </span>
                  <span className={`font-mono font-bold text-xl sm:text-2xl ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-accent2'}`}>
                    00:{timeLeft.toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 60) * 100}%` }}
                    className={`h-full bg-gradient-to-r ${timeLeft < 10 ? 'from-red-500 to-red-400' : 'from-accent to-accent2'}`}
                  />
                </div>
              </div>

              {/* Progress Cards */}
              <div className="space-y-2 sm:space-y-4">
                <div className="bg-surface/40 border border-accent/20 p-3 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[8px] sm:text-[10px] font-black uppercase text-accent tracking-[0.2em] mb-0.5 flex items-center gap-1.5">
                        <Swords size={10} /> You
                      </div>
                      <div className="font-title text-sm sm:text-xl font-bold">{currentIdx + 1}/5</div>
                    </div>
                    <div className="text-base sm:text-2xl font-black text-white">{score}</div>
                  </div>
                </div>
                <div className="bg-surface/40 border border-white/5 p-3 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-text3/20" />
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[8px] sm:text-[10px] font-black uppercase text-text3/40 tracking-[0.2em] mb-0.5 flex items-center gap-1.5">
                        <Target size={10} /> Rival
                      </div>
                      <div className="font-title text-sm sm:text-xl font-bold text-text2 opacity-60 truncate max-w-[80px]">{opponentName}</div>
                    </div>
                    <div className="text-base sm:text-2xl font-black text-white/40">{oppProgress.index + 1}/5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentIdx}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="bg-surface border border-white/10 rounded-3xl sm:rounded-[3rem] p-6 sm:p-12 lg:p-20 shadow-2xl relative"
              >
                <div className="absolute top-8 left-8 font-title text-6xl sm:text-8xl opacity-[0.03] pointer-events-none select-none">Q{currentIdx + 1}</div>
                <h1 className="font-title text-2xl sm:text-3xl lg:text-5xl font-black mb-8 sm:mb-16 leading-tight text-white/90">
                  {q.question}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {q.options.map((opt, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(i)}
                      className="group relative text-left bg-white/5 border border-white/10 p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] hover:bg-white/[0.08] hover:border-accent/40 transition-all overflow-hidden btn-touch"
                    >
                      <div className="flex items-center gap-3 sm:gap-6">
                        <span className="w-9 h-9 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl bg-bg border border-white/10 font-title font-black text-text3 group-hover:text-accent group-hover:border-accent/30 transition-all text-sm">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm sm:text-xl font-bold text-text2 group-hover:text-white transition-all">{opt}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

