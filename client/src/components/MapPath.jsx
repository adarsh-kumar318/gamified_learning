import { motion } from 'framer-motion';

export default function MapPath({ start, end, isCompleted, color, isCurrent }) {
  const x1 = start.x;
  const y1 = start.y;
  const x2 = end.x;
  const y2 = end.y;
 
  // Control points for the road curve
  const mx = (x1 + x2) / 2;
  const cx1 = mx;
  const cy1 = y1;
  const cx2 = mx;
  const cy2 = y2;
 
  const pathStr = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
 
  return (
    <g className="relative">
      <defs>
        <linearGradient id={`grad-${start.id}-${end.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        
        <filter id="road-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Road Shadow/Depth */}
      <path
        d={pathStr}
        fill="none"
        stroke="black"
        strokeWidth="14"
        strokeLinecap="round"
        className="opacity-20 blur-[6px] translate-y-2 pointer-events-none"
      />

      {/* Main Road Track */}
      <path
        d={pathStr}
        fill="none"
        stroke="#0f172a"
        strokeWidth="10"
        strokeLinecap="round"
        className="pointer-events-none"
      />

      {/* Glowing Road Surface */}
      <path
        d={pathStr}
        fill="none"
        stroke={isCompleted ? `url(#grad-${start.id}-${end.id})` : '#1e293b'}
        strokeWidth="6"
        strokeLinecap="round"
        filter={isCompleted ? "url(#road-glow)" : "none"}
        className={`transition-all duration-1000 ease-in-out`}
      />
 
      {/* Animated Light Pulse Flow */}
      {isCompleted && (
        <motion.path
          d={pathStr}
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 1], 
            pathOffset: [0, 0, 1],
            opacity: [0, 0.6, 0] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut",
            times: [0, 0.5, 1]
          }}
          className="pointer-events-none"
        />
      )}
    </g>
  );
}
