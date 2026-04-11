import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050510]">
      {/* Deep Nebula Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(60,20,120,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(30,50,150,0.12),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(80,40,160,0.08),transparent_80%)]" />

      {/* Fog/Mist Layers */}
      <motion.div 
        initial={{ x: '-10%', opacity: 0.3 }}
        animate={{ x: '10%' }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-[#0a0a20] to-transparent opacity-40 blur-3xl"
      />
      
      {/* Floating Embers/Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: Math.random() * 100 + '%', 
            opacity: 0,
            scale: Math.random() * 0.5 + 0.5 
          }}
          animate={{ 
            y: [null, '-20%', '0%'],
            opacity: [0, 0.4, 0],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: Math.random() * 10 + 10, 
            repeat: Infinity, 
            delay: Math.random() * 20,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-accent/40 rounded-full blur-[1px]"
        />
      ))}

      {/* Mountain Silhouettes (CSS shapes) */}
      <div className="absolute bottom-0 w-full h-[20vh] opacity-20 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full scale-110 translate-y-10 fill-[#000]">
          <path d="M0,160L80,186.7C160,213,320,267,480,240C640,213,800,107,960,112C1120,117,1280,235,1360,293.3L1440,352L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </div>

      {/* Glowing Sparks */}
      <div className="absolute inset-0 pointer-events-none backdrop-brightness-[0.8] mix-blend-overlay" />
    </div>
  );
}
