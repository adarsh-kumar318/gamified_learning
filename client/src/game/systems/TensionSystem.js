/**
 * TensionSystem.js (Psychological Tension Hub)
 * Tracks tension, hope, and danger levels for a real-time reactive atmosphere.
 */
import EventBus from '../core/EventBus';
import { GAME_EVENTS } from '../constants';

class TensionSystem {
  constructor() {
    this.tensionLevel = 0; // 0-100
    this.hopeLevel = 50; // 0-100 (Balanced start)
    this.dangerLevel = 0; // 0-100 (Trap progress)
    
    this.setupListeners();
  }

  setupListeners() {
    EventBus.on(GAME_EVENTS.QUESTION_CORRECT, () => {
      this.hopeLevel = Math.min(100, this.hopeLevel + 15);
      this.tensionLevel = Math.max(0, this.tensionLevel - 10);
    });

    EventBus.on(GAME_EVENTS.QUESTION_WRONG, () => {
      this.tensionLevel = Math.min(100, this.tensionLevel + 20);
      this.hopeLevel = Math.max(0, this.hopeLevel - 15);
    });

    EventBus.on(GAME_EVENTS.TIME_LOW, () => {
      this.tensionLevel = Math.min(100, this.tensionLevel + 10);
    });
  }

  update(dt) {
    // 1. Natural Tension Accumulation
    // Tension slowly rises over time if hope is low.
    const tensionGrowth = (100 - this.hopeLevel) / 500 * dt;
    this.tensionLevel = Math.min(100, this.tensionLevel + tensionGrowth);
    
    // 2. Broadcast Tension Status for Visuals & Shakes
    EventBus.emit(GAME_EVENTS.TENSION_UPDATE, {
      tension: this.tensionLevel,
      hope: this.hopeLevel,
      danger: this.dangerLevel
    });
  }
}

export default new TensionSystem();
