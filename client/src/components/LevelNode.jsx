import { motion } from 'framer-motion';

export default function LevelNode({ quest, status, index, onClick, isBoss }) {
  const isCompleted = status === 'completed';
  const isAvailable = status === 'available';
  const isLocked    = status === 'locked';
  
  // Progress calculation for 5 questions
  const questionsCount = 5;
  const completedCount = quest.completedCount || (isCompleted ? 5 : 0);
  const progressPercent = (completedCount / questionsCount) * 100;
  
  const radius = isBoss ? 38 : 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const orbColor = isBoss ? '#ef4444' : isCompleted ? '#22c55e' : '#7c3aed';
  const glowColor = isBoss ? 'rgba(239,68,68,0.5)' : isCompleted ? 'rgba(34,197,94,0.5)' : 'rgba(124,58,237,0.5)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={!isLocked ? { scale: 1.15, zIndex: 10 } : {}}
      onClick={() => !isLocked && onClick(quest)}
      className={`relative flex flex-col items-center group ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* The Magical Orb Container */}
      <div className="relative">
        <svg 
          className={`absolute inset-0 -rotate-90 transition-opacity duration-500 overflow-visible ${isLocked ? 'opacity-20' : 'opacity-100'}`} 
          width={isBoss ? '86' : '70'} 
          height={isBoss ? '86' : '70'}
        >
          {/* Progress Ring Background */}
          <circle
            cx={isBoss ? '43' : '35'}
            cy={isBoss ? '43' : '35'}
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="5"
          />
          {/* Progress Ring Fill */}
          <motion.circle
            cx={isBoss ? '43' : '35'}
            cy={isBoss ? '43' : '35'}
            r={radius}
            fill="transparent"
            stroke={orbColor}
            strokeWidth="5"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
          />
        </svg>

        {/* The Core Orb 🔮 */}
        <div className={`
          relative z-10 flex items-center justify-center
          ${isBoss ? 'w-16 h-16 m-3' : 'w-12 h-12 m-3'}
          rounded-full transition-all duration-500 border-2
          ${isLocked 
            ? 'bg-[#1a1a2e] border-white/10 grayscale opacity-40' 
            : `bg-gradient-to-br from-surface to-[#050510] border-${isBoss ? 'red-500' : 'accent'} shadow-[0_0_20px_${glowColor}]`
          }
        `}>
          <div className={`font-black ${isBoss ? 'text-2xl' : 'text-xl'} ${isLocked ? 'text-text3' : 'text-white'}`}>
            {isCompleted ? '⭐' : isLocked ? '🔒' : (isBoss ? '🔥' : index + 1)}
          </div>

          {/* Core Pulse for available nodes */}
          {isAvailable && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute inset-0 rounded-full ${isBoss ? 'bg-red-500/20' : 'bg-accent/20'}`}
            />
          )}
        </div>
      </div>

      {/* Progress Label */}
      <div className={`mt-4 text-center transition-all duration-300 ${isLocked ? 'opacity-30' : 'opacity-100'}`}>
        <div className="font-title text-[9px] font-black text-text1 uppercase tracking-widest truncate max-w-[120px]">
          {isBoss ? 'BOSS CHALLENGE' : quest.title.replace('WEBDEV TRIAL: ', '')}
        </div>
        
        {!isLocked && (
          <div className={`text-[10px] font-bold mt-1 font-mono ${isCompleted ? 'text-green-400' : 'text-accent2'}`}>
            {completedCount} / 5 COMPLETE
          </div>
        )}
      </div>
    </motion.div>
  );
}
