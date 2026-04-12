import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield, Search } from 'lucide-react';

const SEARCH_STEPS = [
  "Scanning the Realm...",
  "Searching for Allies...",
  "Preparing the Arena...",
  "Initializing Trial...",
  "Opponent Found!",
  "Entering Battle..."
];

export default function MatchmakingView({ onCancel, opponentFound }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (opponentFound) {
      setStep(4);
      setTimeout(() => setStep(5), 1000);
      return;
    }

    const interval = setInterval(() => {
      setStep(prev => (prev < 3 ? prev + 1 : 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [opponentFound]);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center pointer-events-none">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-bg/80 backdrop-blur-xl pointer-events-auto"
      />

      <div className="relative z-10 w-full max-w-lg p-12 text-center pointer-events-auto">
        {/* Animated Orbs */}
        <div className="relative mb-12 flex justify-center">
            <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 rounded-full border-2 border-dashed border-accent/40 flex items-center justify-center"
            >
                <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-accent via-accent2 to-accent shadow-[0_0_50px_rgba(124,58,237,0.4)] flex items-center justify-center text-white"
                >
                    <Swords size={40} />
                </motion.div>
            </motion.div>
            
            {/* Pulse Rings */}
            {[1, 2, 3].map(i => (
                <motion.div
                    key={i}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 3, repeat: Infinity, delay: i }}
                    className="absolute inset-0 border border-accent2/30 rounded-full"
                />
            ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <h2 className="font-title text-4xl font-black mb-2 text-white">
              {SEARCH_STEPS[step]}
            </h2>
            <p className="text-text2 font-mono tracking-widest text-sm opacity-60">
                STAKE: 50 XP
            </p>
          </motion.div>
        </AnimatePresence>

        <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            className="h-1 bg-white/5 rounded-full overflow-hidden mb-12"
        >
            <motion.div 
                animate={{ left: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="relative h-full w-1/2 bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_15px_rgba(124,58,237,0.8)]"
            />
        </motion.div>

        {!opponentFound && (
            <button 
                onClick={onCancel}
                className="px-12 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-title font-bold tracking-widest hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all uppercase text-sm"
            >
                Retreat from Matchmaking
            </button>
        )}
      </div>
    </div>
  );
}

