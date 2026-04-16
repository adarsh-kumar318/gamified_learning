import gsap from 'gsap';

export const EnvironmentAnimator = {
  // Mapping threat height to progression
  updateThreat: (element, progress) => {
    if (!element) return;
    
    // threat decreases as progress increases
    const heightPercentage = Math.max(5, 70 - (progress * 65));
    gsap.to(element, { 
      height: `${heightPercentage}%`, 
      duration: 1.2, 
      ease: 'power2.inOut' 
    });

    // Color shift as danger increases?
    if (progress < 0.3) {
      gsap.to(element, { 
        filter: 'brightness(1.5)', 
        duration: 2, 
        repeat: -1, 
        yoyo: true 
      });
    } else {
      gsap.to(element, { 
        filter: 'brightness(1)', 
        duration: 1 
      });
    }
  }
};
