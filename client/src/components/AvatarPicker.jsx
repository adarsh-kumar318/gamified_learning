import { useState } from 'react';
import { AVATARS } from '../constants/data';

export default function AvatarPicker({ onAvatarSelect }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a1a]">
      <div className="w-full max-w-2xl text-center relative z-10">
        
        {/* Header */}
        <div className="mb-10">
          <div className="text-6xl mb-4 animate-bounce-alt inline-block">🎭</div>
          <h1 className="font-title text-4xl font-bold text-gradient-purple mb-3">Choose Your Hero</h1>
          <p className="text-text2 text-sm max-w-md mx-auto opacity-70">
            Pick an identity that represents your journey in the LevelUp Kingdom. 
            All heroes are welcome here!
          </p>
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 p-2">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => onAvatarSelect(avatar)}
              onMouseEnter={() => setHovered(avatar.id)}
              onMouseLeave={() => setHovered(null)}
              className="relative aspect-square bg-surface/40 hover:bg-surface/80 border border-white/5 hover:border-accent2/50 rounded-3xl transition-all duration-300 group flex flex-col items-center justify-center gap-2 overflow-hidden hover:-translate-y-1 shadow-lg hover:shadow-accent/20"
            >
              <span className="text-5xl group-hover:scale-125 transition-transform duration-500">
                {avatar.emoji}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-text3 opacity-0 group-hover:opacity-100 transition-opacity">
                {avatar.name}
              </span>
              
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          ))}
        </div>

        <p className="mt-12 text-[10px] text-text3 uppercase tracking-[4px] font-bold opacity-30">
          Selection is final for today
        </p>
      </div>
    </div>
  );
}
