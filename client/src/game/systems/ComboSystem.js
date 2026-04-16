/**
 * ComboSystem.js (Momentum & Score Multiplier)
 * Reward fast correct answers with visual "Power Trails".
 */
import EventBus from '../core/EventBus';
import { GAME_EVENTS } from '../constants';

class ComboSystem {
  constructor() {
    this.comboCount = 0;
    this.comboLimit = 10;
    this.momentumMultiplier = 1.0;
    
    this.setupListeners();
  }

  setupListeners() {
    EventBus.on(GAME_EVENTS.QUESTION_CORRECT, () => {
      this.comboCount += 1;
      this.momentumMultiplier = Math.min(2.5, 1.0 + (this.comboCount * 0.1));
      
      if (this.comboCount >= 3) {
        EventBus.emit(GAME_EVENTS.COMBO_PROGRESS, { count: this.comboCount, multiplier: this.momentumMultiplier });
        console.log(`[Combo] Momentum: ${this.momentumMultiplier}x`);
      }
    });

    EventBus.on(GAME_EVENTS.QUESTION_WRONG, () => {
      this.comboCount = 0;
      this.momentumMultiplier = 1.0;
      EventBus.emit(GAME_EVENTS.COMBO_BREAK);
      console.warn('[Combo] Momentum Broken.');
    });
  }

  update(dt) {
    // If we want momentum to decay over time if the player hesitates.
  }
}

export default new ComboSystem();
