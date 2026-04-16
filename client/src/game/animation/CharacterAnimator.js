import gsap from 'gsap';

export const CharacterAnimator = {
  // Mapping progression (0-1) to specific visual states
  updateState: (element, progress) => {
    if (!element) return;
    
    // Scale character based on freedom
    const scale = 1 + (progress * 0.5);
    gsap.to(element, { scale, duration: 0.5, ease: 'power2.out' });
    
    // Shake if still trapped (progress < 0.5)
    if (progress < 0.5) {
      gsap.to(element, { 
        x: 'random(-5, 5)', 
        rotation: 'random(-2, 2)',
        duration: 2, 
        repeat: -1, 
        yoyo: true, 
        ease: 'sine.inOut' 
      });
    } else {
      gsap.to(element, { x: 0, rotation: 0, duration: 2 });
    }
  },

  playJump: (element) => {
    gsap.fromTo(element, 
      { y: 0 },
      { y: -30, duration: 0.2, yoyo: true, repeat: 1, ease: 'power1.out' }
    );
  }
};
