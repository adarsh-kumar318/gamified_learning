import gsap from 'gsap';
import EventBus from '../core/EventBus';
import { GAME_EVENTS, GAME_STATES } from '../constants';

class AnimationController {
  constructor() {
    this.masterTimeline = gsap.timeline();
    this.layers = {
      character: null,
      environment: null,
      effects: null,
      ui: null,
    };
  }

  init(layers) {
    this.layers = layers;
    this.setupListeners();
    console.log('[AnimationController] Initialized with layers', layers);
  }

  setupListeners() {
    EventBus.on(GAME_EVENTS.ANSWER_CORRECT, () => this.playSuccessPulse());
    EventBus.on(GAME_EVENTS.ANSWER_WRONG, () => this.playFailureShake());
    EventBus.on(GAME_EVENTS.PROGRESS_UPDATE, ({ progress }) => this.updateProgression(progress));
    EventBus.on(GAME_EVENTS.TIME_LOW, () => this.startPressureEffects());
    EventBus.on(GAME_EVENTS.LEVEL_COMPLETE, () => this.playVictoryCinematic());
    EventBus.on(GAME_EVENTS.LEVEL_FAILED, () => this.playDefeatCinematic());
  }

  playSuccessPulse() {
    if (!this.layers.character) return;
    gsap.to(this.layers.character, {
      scale: 1.2,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
    });
    
    if (this.layers.effects) {
      gsap.fromTo(this.layers.effects, 
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 2, duration: 0.5, ease: 'expo.out', onComplete: () => {
          gsap.to(this.layers.effects, { opacity: 0, duration: 0.3 });
        }}
      );
    }
  }

  playFailureShake() {
    if (!this.layers.character) return;
    gsap.to(this.layers.character, {
      x: 'random(-10, 10)',
      duration: 0.1,
      repeat: 5,
      yoyo: true,
      ease: 'none',
      onComplete: () => gsap.to(this.layers.character, { x: 0, duration: 0.2 })
    });
  }

  updateProgression(progress) {
    console.log(`[AnimationController] Progression: ${progress * 100}%`);
    // Character struggle gets more intense as progress increases? 
    // Actually, progress should make character LOOK MORE FREE.
    if (this.layers.environment) {
      const threatHeight = 70 - (progress * 60);
      gsap.to(this.layers.environment, {
        height: `${threatHeight}%`,
        duration: 1,
        ease: 'power1.inOut'
      });
    }
  }

  startPressureEffects() {
    if (this.layers.ui) {
      gsap.to(this.layers.ui, {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
    // High-speed pulsing character
    if (this.layers.character) {
      gsap.to(this.layers.character, {
        scale: 1.05,
        duration: 0.4,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    }
  }

  playVictoryCinematic() {
    const tl = gsap.timeline();
    tl.to(this.layers.character, {
      y: -500,
      scale: 2,
      rotation: 360,
      duration: 1.5,
      ease: 'back.in(1.7)'
    })
    .to(this.layers.ui, {
      opacity: 1,
      display: 'flex',
      duration: 0.5,
      backgroundColor: 'rgba(52, 211, 153, 0.1)'
    }, '-=0.5');
  }

  playDefeatCinematic() {
    const tl = gsap.timeline();
    tl.to(this.layers.environment, {
      height: '100%',
      duration: 1,
      ease: 'power4.in'
    })
    .to(this.layers.character, {
      opacity: 0,
      scale: 0.5,
      y: 100,
      duration: 0.8,
      ease: 'power2.in'
    }, '-=0.5');
  }
}

export default new AnimationController();
