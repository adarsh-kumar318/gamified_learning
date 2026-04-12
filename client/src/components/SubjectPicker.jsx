import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Swords, ArrowRight } from 'lucide-react';

/* Helper to render Lucide icons by name */
const LucideIcon = ({ name, size = 24, className = "", color = "currentColor" }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) return <Icons.HelpCircle size={size} className={className} />;
  return <IconComponent size={size} className={className} color={color} />;
};

const SUBJECTS = [
  {
    id: 'Agentic AI',
    icon: 'Bot',
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.4)',
    topics: ['Autonomous Agents', 'LLM Agents', 'Planning', 'Multi-Agent Systems'],
    desc: 'AI that thinks, plans & acts autonomously',
  },
  {
    id: 'DSA',
    icon: 'Network',
    color: '#2563eb',
    glow: 'rgba(37,99,235,0.4)',
    topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Sorting'],
    desc: 'Data Structures & Algorithms mastery',
  },
  {
    id: 'Mathematics',
    icon: 'Calculator',
    color: '#d97706',
    glow: 'rgba(217,119,6,0.4)',
    topics: ['Algebra', 'Probability', 'Arithmetic', 'Geometry'],
    desc: 'Numbers, logic and mathematical reasoning',
  },
  {
    id: 'Science',
    icon: 'FlaskConical',
    color: '#059669',
    glow: 'rgba(5,150,105,0.4)',
    topics: ['Physics', 'Chemistry', 'Biology'],
    desc: 'Science & Biology concepts',
  },
  {
    id: null,
    icon: 'Dices',
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.4)',
    topics: ['All Subjects'],
    desc: 'Random questions from every subject',
    label: 'Mixed Mode',
  },
];

export default function SubjectPicker({ onSelect, onClose }) {
  const [hovered, setHovered] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[400] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#0a0a20] border border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-accent2 to-accent opacity-50" />
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-accent2 mb-4 flex justify-center drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <Swords size={60} />
          </div>
          <h2 className="font-title text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Choose Your <span className="text-gradient-purple">Battle Subject</span>
          </h2>
          <p className="text-text3 text-xs sm:text-sm mt-3 uppercase tracking-widest font-bold opacity-60">
            Select a subject or go mixed — your opponent gets the same
          </p>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {SUBJECTS.map((subj) => (
            <motion.button
              key={subj.id ?? 'mixed'}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onHoverStart={() => setHovered(subj.id ?? 'mixed')}
              onHoverEnd={() => setHovered(null)}
              onClick={() => onSelect(subj.id)}
              className="relative text-left p-6 rounded-3xl border transition-all duration-300 overflow-hidden group"
              style={{
                background: hovered === (subj.id ?? 'mixed')
                  ? `linear-gradient(135deg, ${subj.glow} 0%, transparent 70%)`
                  : 'rgba(255,255,255,0.03)',
                borderColor: hovered === (subj.id ?? 'mixed')
                  ? subj.color
                  : 'rgba(255,255,255,0.07)',
                boxShadow: hovered === (subj.id ?? 'mixed')
                  ? `0 0 40px ${subj.glow}`
                  : 'none',
              }}
            >
              {/* Subject icon + name */}
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                  <LucideIcon name={subj.icon} size={30} color={subj.color} />
                </div>
                <div>
                  <div
                    className="font-title font-black text-lg uppercase tracking-tight"
                    style={{ color: subj.color }}
                  >
                    {subj.label || subj.id}
                  </div>
                  <div className="text-[10px] text-text3 font-bold uppercase tracking-widest opacity-60">
                    {subj.desc}
                  </div>
                </div>
              </div>

              {/* Topic pills */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {subj.topics.map(t => (
                  <span
                    key={t}
                    className="text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border"
                    style={{ color: subj.color, borderColor: `${subj.color}40`, background: `${subj.color}15` }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Hover arrow */}
              <AnimatePresence>
                {hovered === (subj.id ?? 'mixed') && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 font-black"
                    style={{ color: subj.color }}
                  >
                    <ArrowRight size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full py-4 text-text3 hover:text-white text-xs font-black uppercase tracking-widest transition-all hover:bg-white/5 rounded-2xl border border-transparent hover:border-white/10"
        >
          Cancel — Return to Kingdom
        </button>
      </motion.div>
    </motion.div>
  );
}

