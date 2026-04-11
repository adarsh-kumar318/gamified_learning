import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

// Engine Architecture Imports
import GameEngine from '../game/engine/GameEngine';
import EventBus from '../game/core/EventBus';
import { GAME_EVENTS } from '../game/constants';
import AnimationController from '../game/animation/AnimationController';
import CameraController from '../game/camera/CameraController';
import AudioEngine from '../game/core/AudioEngine';

// Logic System Imports
import DifficultyEngine from '../game/systems/DifficultyEngine';
import TensionSystem from '../game/systems/TensionSystem';
import ComboSystem from '../game/systems/ComboSystem';
import ProgressSystem from '../game/systems/ProgressSystem';
import TimerSystem from '../game/systems/TimerSystem';

// ============================================================
// THEME CONFIGURATIONS (Narrative Themes)
// ============================================================
const THEMES = {
  water: {
    bg: "from-[#050a20] via-[#071428] to-[#050510]",
    liquid: "bg-blue-600/30 border-blue-400/50 shadow-[0_-20px_50px_rgba(37,99,235,0.4)]",
    waveBg: "bg-blue-500/10",
    bubbleColor: "bg-white/40",
    particle: "💧",
    smallParticle: "💦",
    emergencyColor: "bg-red-600/10 shadow-[inset_0_0_100px_rgba(239,68,68,0.3)]",
    failBg: "bg-blue-950/90",
    failIcon: "🌊",
    failMsg: "The tides have consumed the chamber.",
    successBg: "bg-cyan-500/10",
    accentGlow: "drop-shadow-[0_0_30px_rgba(59,130,246,0.7)]",
    label: "RISING TIDE CHALLENGE",
    labelColor: "text-cyan-400",
  },
  lava: {
    bg: "from-[#1a0500] via-[#200800] to-[#100200]",
    liquid: "bg-orange-700/50 border-orange-500/60 shadow-[0_-20px_60px_rgba(234,88,12,0.6)]",
    waveBg: "bg-orange-500/15",
    bubbleColor: "bg-orange-300/50",
    particle: "🔥",
    smallParticle: "💢",
    emergencyColor: "bg-orange-700/20 shadow-[inset_0_0_100px_rgba(234,88,12,0.4)]",
    failBg: "bg-red-950/90",
    failIcon: "🌋",
    failMsg: "The molten core has consumed the platform.",
    successBg: "bg-orange-500/10",
    accentGlow: "drop-shadow-[0_0_30px_rgba(234,88,12,0.7)]",
    label: "MOLTEN CRATER CHALLENGE",
    labelColor: "text-orange-400",
  },
  jail: {
    bg: "from-[#111111] via-[#1a1a1a] to-[#050505]",
    liquid: "bg-slate-700/60 border-slate-500/50 shadow-[0_-20px_60px_rgba(15,23,42,0.9)]",
    waveBg: "bg-slate-600/10",
    bubbleColor: "bg-slate-300/30",
    particle: "⛓️",
    smallParticle: "🔩",
    emergencyColor: "bg-slate-900/50 shadow-[inset_0_0_100px_rgba(0,0,0,0.7)]",
    failBg: "bg-slate-900/95",
    failIcon: "🔒",
    failMsg: "The iron gates have locked forever.",
    successBg: "bg-slate-400/10",
    accentGlow: "drop-shadow-[0_0_30px_rgba(100,116,139,0.5)]",
    label: "IRON CAGE CHALLENGE",
    labelColor: "text-slate-400",
  },
  void: {
    bg: "from-[#0d0020] via-[#100028] to-[#050010]",
    liquid: "bg-purple-900/50 border-purple-500/30 shadow-[0_-20px_60px_rgba(147,51,234,0.5)]",
    waveBg: "bg-purple-500/10",
    bubbleColor: "bg-purple-300/40",
    particle: "✦",
    smallParticle: "🌑",
    emergencyColor: "bg-purple-800/30 shadow-[inset_0_0_100px_rgba(147,51,234,0.4)]",
    failBg: "bg-purple-950/95",
    failIcon: "🕳️",
    failMsg: "The digital abyss has claimed another soul.",
    successBg: "bg-purple-500/10",
    accentGlow: "drop-shadow-[0_0_30px_rgba(167,139,250,0.7)]",
    label: "DIGITAL ABYSS CHALLENGE",
    labelColor: "text-purple-400",
  },
  forest: {
    bg: "from-[#051a05] via-[#082008] to-[#021002]",
    liquid: "bg-green-900/60 border-green-700/50 shadow-[0_-20px_60px_rgba(20,83,45,0.7)]",
    waveBg: "bg-green-500/10",
    bubbleColor: "bg-green-400/30",
    particle: "🌿",
    smallParticle: "🍃",
    emergencyColor: "bg-green-900/40 shadow-[inset_0_0_100px_rgba(20,83,45,0.5)]",
    failBg: "bg-green-950/95",
    failIcon: "🎋",
    failMsg: "The ancient vines have reclaimed the chamber.",
    successBg: "bg-green-500/10",
    accentGlow: "drop-shadow-[0_0_30px_rgba(34,197,94,0.6)]",
    label: "VERDANT VINE CHALLENGE",
    labelColor: "text-green-400",
  },
  desert: {
    bg: "from-[#1a150a] via-[#201a08] to-[#100c05]",
    liquid: "bg-amber-700/60 border-amber-600/50 shadow-[0_-20px_60px_rgba(180,83,9,0.7)]",
    waveBg: "bg-amber-500/10",
    bubbleColor: "bg-amber-200/40",
    particle: "⏳",
    smallParticle: "✨",
    emergencyColor: "bg-amber-900/40 shadow-[inset_0_0_100px_rgba(180,83,9,0.5)]",
    failBg: "bg-amber-950/95",
    failIcon: "⌛",
    failMsg: "The sands of time have run out.",
    successBg: "bg-amber-500/10",
    accentGlow: "drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]",
    label: "SINKING SAND CHALLENGE",
    labelColor: "text-amber-400",
  },
};

export default function RescueScene({ progress, status, timeLeft, avatarEmoji = "🧙", themeType = 'water' }) {
  const theme = THEMES[themeType] || THEMES.water;
  
  // Master Refs
  const viewportRef = useRef(null);
  const characterRef = useRef(null);
  const environmentRef = useRef(null);
  const effectsRef = useRef(null);
  const uiOverlayRef = useRef(null);

  // Initialize and Boot the Engine
  useEffect(() => {
    // 1. Initialize Visual Layer
    AnimationController.init({
      character: characterRef.current,
      environment: environmentRef.current,
      effects: effectsRef.current,
      ui: uiOverlayRef.current,
    });

    // 2. Initialize Camera Controller
    CameraController.init(viewportRef.current);

    // 3. Initialize Audio Engine (requires interaction to start AudioContext)
    const handleFirstClick = () => {
        AudioEngine.init();
        window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);

    // 4. Initialize Game Engine with Systems
    GameEngine.init({
      difficulty: DifficultyEngine,
      tension: TensionSystem,
      combo: ComboSystem,
      timer: TimerSystem,
      camera: CameraController,
    });

    return () => {
        GameEngine.stop();
        window.removeEventListener('click', handleFirstClick);
    };
  }, []);

  // Sync React state updates to the EventBus
  useEffect(() => {
    if (status === 'success') EventBus.emit(GAME_EVENTS.LEVEL_COMPLETE);
    if (status === 'failed') EventBus.emit(GAME_EVENTS.LEVEL_FAILED);
  }, [status]);

  useEffect(() => {
    EventBus.emit(GAME_EVENTS.PROGRESS_UPDATE, { progress });
  }, [progress]);

  return (
    <div 
        ref={viewportRef}
        className={`absolute inset-0 z-0 overflow-hidden bg-gradient-to-b ${theme.bg}`}
    >
      
      {/* LAYER 1: Background Layer (Environment) */}
      <div className="absolute inset-0 flex justify-around opacity-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-8 h-full bg-white blur-sm" />
        ))}
      </div>

      <div 
        ref={environmentRef}
        className={`absolute bottom-0 left-0 right-0 z-10 backdrop-blur-md border-t transition-all ${theme.liquid}`}
        style={{ height: `${70 - (progress * 62)}%` }}
      >
        <motion.div
          animate={{ x: ['-50%', '0%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className={`absolute -top-6 left-0 w-[200%] h-12 ${theme.waveBg} pointer-events-none`}
          style={{ borderRadius: '50%' }}
        />
        
        {/* Particle mapping */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '100%', x: `${Math.random() * 100}%` }}
            animate={{ y: '-20%', opacity: [0, 0.8, 0] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 5 }}
            className={`absolute w-1.5 h-1.5 rounded-full ${theme.bubbleColor} blur-[1px]`}
          />
        ))}
      </div>

      {/* LAYER 2: Character Layer */}
      <div 
        ref={characterRef}
        className="absolute left-1/2 bottom-36 -translate-x-1/2 z-20 flex flex-col items-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <span className={`text-8xl block select-none ${theme.accentGlow}`}>
            {status === 'success' ? '🕊️' : avatarEmoji}
          </span>
          <div ref={effectsRef} className="absolute inset-0 rounded-full bg-white opacity-0" />
        </motion.div>
        
        <div className="w-36 h-5 bg-white/10 rounded-full blur-[2px] mt-4 shadow-[0_0_30px_rgba(255,255,255,0.1)]" />
      </div>

      {/* LAYER 3: Effects Layer (Dynamic Overlays) */}
      <div ref={uiOverlayRef} className="absolute inset-0 z-40 pointer-events-none opacity-0" />

      {/* LAYER 4: UI / HUD Overlay */}
      <div className={`absolute top-6 right-6 z-40 text-[10px] font-black uppercase tracking-[0.3em] ${theme.labelColor} opacity-60`}>
        {theme.label}
      </div>

      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 z-50 flex flex-col items-center justify-start pt-80 backdrop-blur-sm ${theme.successBg}`}
          >
             <div className="text-center relative">
              <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-8xl mb-4 drop-shadow-[0_0_50px_rgba(245,158,11,0.5)]">🏆</motion.div>
              <h2 className="text-7xl font-black text-white uppercase tracking-tighter italic drop-shadow-2xl">RESCUED!</h2>
              <p className="text-green-400 font-mono mt-2 text-sm font-bold uppercase tracking-[0.4em] opacity-80 decoration-double">Trial Conquered — Freedom Restored</p>
            </div>
          </motion.div>
        )}

        {status === 'failed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 z-50 flex flex-col items-center justify-start pt-32 backdrop-blur-md ${theme.failBg}`}
          >
            <div className="text-center">
              <div className="text-9xl mb-6 grayscale opacity-80">{theme.failIcon}</div>
              <h2 className="text-7xl font-black text-white uppercase tracking-tighter italic">TRIAL FAILED</h2>
              <p className={`font-mono mt-4 text-sm font-bold uppercase tracking-[0.3em] ${theme.labelColor} opacity-70`}>{theme.failMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
