import { motion } from "framer-motion";

export default function BackgroundLayer() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#050510] pointer-events-none select-none">
      {/* Animated Landscape Background 🖼️ */}
      <motion.div
        animate={{ 
          scale: [1.1, 1.15, 1.1],
          x: ['-2%', '2%', '-2%'],
          y: ['-1%', '1%', '-1%']
        }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute inset-0 z-0 opacity-50"
      >
        <img 
          src="/rpg-bg.png" 
          alt="RPG Landscape"
          className="w-full h-full object-cover filter brightness-75 contrast-125 saturate-[0.8]"
        />
      </motion.div>

      {/* Deep Gradient Overlays for Readability 🌫️ */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/80 via-transparent to-[#050510] z-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.15),transparent_80%)] z-10" />
      <div className="absolute inset-0 bg-black/20 z-15" />

      {/* Floating Embers / Sparks */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: "110%",
            opacity: 0,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            y: "-10%",
            opacity: [0, 0.8, 0],
            x: `${(Math.random() - 0.5) * 20 + 50}%`,
          }}
          transition={{ 
            duration: Math.random() * 15 + 15, 
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-gold rounded-full blur-[1px] shadow-[0_0_15px_rgba(245,158,11,0.6)] z-30"
        />
      ))}

      {/* Fog Layers */}
      <motion.div 
        animate={{ x: ["-5%", "5%"] }}
        transition={{ duration: 40, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        className="absolute bottom-[-10%] left-[-10%] right-[-10%] h-[50%] opacity-20 bg-[url('https://www.transparenttextures.com/patterns/foggy-birds.png')] mix-blend-screen z-15 filter blur-xl"
      />

      {/* Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-40" />

      {/* Radiant Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent2/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
    </div>
  );
}
