import { useEffect, useRef, useState } from 'react';
import LevelNode from './LevelNode';
import MapPath from './MapPath';
import PlayerAvatar from './PlayerAvatar';
import { motion, useScroll, useTransform } from 'framer-motion';



export default function LevelMap({ quests, getQuestStatus, openQuest, color, username, avatarEmoji }) {
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const [mapWidth, setMapWidth] = useState(600);
  
  // Parallax logic using Framer Motion
  const { scrollY } = useScroll({ container: scrollRef });
  const bgY = useTransform(scrollY, [0, 5000], [0, -1000]);

  // Handle Responsiveness
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setMapWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const spacingY = window.innerWidth < 768 ? 140 : 180;
  const hMargin = window.innerWidth < 768 ? 40 : 80;

  // Layout calculation
  const getPosition = (index) => {
    const y = index * spacingY + 120;
    const x = mapWidth / 2 + Math.sin(index * 0.8) * (mapWidth / 2 - hMargin);
    return { x, y };
  };

  const nodes = quests.map((q, i) => ({
    ...q,
    ...getPosition(i),
    status: getQuestStatus(q),
    isBoss: (i + 1) % 5 === 0 
  }));

  // Find user's current position (Available node)
  const currentIdx = quests.findIndex(q => getQuestStatus(q) === 'available');
  const playerPos = currentIdx !== -1 ? getPosition(currentIdx) : getPosition(0);

  // Auto-scroll to current position
  useEffect(() => {
    if (currentIdx !== -1 && scrollRef.current) {
      const pos = getPosition(currentIdx);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: pos.y - 300,
            behavior: 'smooth'
          });
        }
      }, 800);
    }
  }, [currentIdx, quests]);

  return (
    <div 
      ref={scrollRef}
      className="relative w-full max-w-3xl mx-auto h-[70vh] overflow-y-auto no-scrollbar bg-[#0f172a]/40 rounded-[3rem] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-md px-4"
    >
      <div 
        ref={containerRef}
        className="relative w-full" 
        style={{ height: quests.length * spacingY + 300 }}
      >
        {/* Parallax Background Parallax 🌫️ */}
        <motion.div 
          style={{ y: bgY }}
          className="absolute inset-0 pointer-events-none opacity-20"
        >
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-96 h-96 bg-accent/40 rounded-full blur-[150px] animate-pulse"
              style={{ top: i * 600, left: i % 2 === 0 ? '-20%' : '70%' }}
            />
          ))}
        </motion.div>

        {/* SVG Path Layer 🗺️ */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {nodes.map((node, i) => {
            if (i === 0) return null;
            const prev = nodes[i - 1];
            return (
              <MapPath 
                key={`path-${i}`} 
                start={prev} 
                end={node} 
                isCompleted={node.status !== 'locked'} 
                color={color}
              />
            );
          })}
        </svg>

        {/* Adventure Ahead Zones & Labels 🏔️ */}
        {nodes.map((node, i) => {
          if (i === 0 || i % 4 !== 0) return null;
          const pos = getPosition(i - 2);
          return (
            <motion.div
              key={`zone-${i}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.3 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: mapWidth / 2, top: pos.y + spacingY / 2 }}
            >
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-black text-accent2 uppercase tracking-[1em] mb-2">Adventure Ahead</div>
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-accent2 to-transparent" />
              </div>
            </motion.div>
          );
        })}

        {/* Player Avatar 🛡️ */}
        <PlayerAvatar 
          position={playerPos} 
          emoji={avatarEmoji} 
          username={username} 
        />

        {/* Level Nodes (Magic Orbs) 🔮 */}
        {nodes.map((node, i) => (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: node.x, top: node.y }}
          >
            <LevelNode 
              quest={node} 
              status={node.status} 
              index={i} 
              isBoss={node.isBoss}
              onClick={openQuest}
            />
          </div>
        ))}
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none animate-bounce-alt opacity-40">
        <div className="text-[10px] font-black text-text3 uppercase tracking-[0.3em]">Adventure Ahead</div>
      </div>
    </div>
  );
}
