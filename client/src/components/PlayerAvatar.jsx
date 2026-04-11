import { motion } from 'framer-motion';

export default function PlayerAvatar({ position, emoji = "⚔️", username }) {
  if (!position) return null;

  return (
    <motion.div
      initial={false}
      animate={{ 
        left: position.x, 
        top: position.y - 40 
      }}
      transition={{ 
        type: "spring", 
        stiffness: 40, 
        damping: 12,
        mass: 0.8
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
    >
      <div className="relative group">
        {/* Floating Animation Wrapper */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Movement Trail Glow 💫 */}
          <motion.div 
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-accent rounded-full blur-2xl -z-10"
          />

          {/* Avatar Sprite 🛡️ */}
          <div className="w-14 h-14 flex items-center justify-center text-3xl bg-surface/60 rounded-2xl border-2 border-accent/80 shadow-[0_15px_35px_rgba(124,58,237,0.6)] backdrop-blur-xl relative overflow-hidden">
            <div className="relative z-10">{emoji}</div>
            {/* Inner Sparkle */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
          </div>

          {/* Name Plate */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#050510]/90 border border-accent/40 px-3 py-1 rounded-lg shadow-2xl whitespace-nowrap">
            <div className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{username}</div>
          </div>
        </motion.div>
        
        {/* Feet Glow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-accent/30 blur-md rounded-full" />
      </div>
    </motion.div>
  );
}
