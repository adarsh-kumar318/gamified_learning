/**
 * CameraController.js
 * High-performance cinematic camera effects (shake, zoom, tilt)
 * Simulated using CSS/GSAP transforms on the master viewport.
 */
import gsap from 'gsap';
import EventBus from '../core/EventBus';
import { GAME_EVENTS } from '../constants';

class CameraController {
  constructor() {
    this.target = null;
    this.baseScale = 1.0;
    this.isShaking = false;
    this.shakeIntensity = 0;
    
    this.setupListeners();
  }

  init(target) {
    this.target = target;
    console.log('[CameraController] Initialized on master target.', target);
  }

  setupListeners() {
    EventBus.on(GAME_EVENTS.QUESTION_WRONG, () => this.shake(1.5, 0.4));
    EventBus.on(GAME_EVENTS.QUESTION_CORRECT, () => this.pulse(1.05, 0.3));
    EventBus.on(GAME_EVENTS.TENSION_UPDATE, ({ tension }) => this.handleTension(tension));
    EventBus.on(GAME_EVENTS.LEVEL_COMPLETE, () => this.victoryZoom());
    EventBus.on(GAME_EVENTS.LEVEL_FAILED, () => this.defeatShake());
  }

  handleTension(tension) {
    if (tension > 70) {
      this.shakeIntensity = (tension - 70) / 10; // 0-3 range
    } else {
      this.shakeIntensity = 0;
    }
  }

  shake(intensity = 1, duration = 0.5) {
    if (!this.target) return;
    gsap.to(this.target, {
      x: `random(-${intensity * 10}, ${intensity * 10})`,
      y: `random(-${intensity * 10}, ${intensity * 10})`,
      duration: 0.1,
      repeat: Math.floor(duration / 0.1),
      yoyo: true,
      onComplete: () => gsap.to(this.target, { x: 0, y: 0, duration: 0.2 })
    });
  }

  pulse(scale = 1.05, duration = 0.3) {
    if (!this.target) return;
    gsap.to(this.target, {
      scale,
      duration: duration / 2,
      yoyo: true,
      repeat: 1,
      ease: 'power1.inOut'
    });
  }

  victoryZoom() {
    gsap.to(this.target, {
      scale: 1.5,
      y: -200,
      duration: 2.5,
      ease: 'power2.inOut'
    });
  }

  defeatShake() {
    this.shake(4, 1.5);
  }

  update(dt) {
    // 1. Procedural Tension Shake (if any)
    if (this.shakeIntensity > 0 && this.target) {
      const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
      const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
      this.target.style.transform = `scale(${this.baseScale}) translate(${offsetX}px, ${offsetY}px)`;
    }
  }
}

export default new CameraController();
