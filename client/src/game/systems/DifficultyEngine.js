/**
 * DifficultyEngine.js (DDA - Dynamic Difficulty Adjustment)
 * Tracks player performance and adjust game difficulty in real-time.
 */
import EventBus from '../core/EventBus';
import { GAME_EVENTS } from '../constants';

class DifficultyEngine {
  constructor() {
    this.accuracy = 1.0;
    this.solvingSpeed = 1.0; // Seconds per question
    this.streak = 0;
    this.difficultyIndex = 1.0; // Multiplier (0.5 to 2.0)
    
    this.setupListeners();
  }

  setupListeners() {
    EventBus.on(GAME_EVENTS.QUESTION_CORRECT, () => this.handleCorrect());
    EventBus.on(GAME_EVENTS.QUESTION_WRONG, () => this.handleWrong());
  }

  handleCorrect() {
    this.streak += 1;
    this.adjustDifficulty(0.05); // Increase challenge
    console.log('[Difficulty] Performance Up. Challenge increased.', this.difficultyIndex);
  }

  handleWrong() {
    this.streak = 0;
    this.adjustDifficulty(-0.1); // Decrease challenge (helpful mode)
    console.warn('[Difficulty] Performance Down. Challenge decreased.', this.difficultyIndex);
  }

  adjustDifficulty(delta) {
    this.difficultyIndex = Math.max(0.5, Math.min(2.0, this.difficultyIndex + delta));
    // Emit for TimerSystem & TensionSystem to listen
    EventBus.emit(GAME_EVENTS.DIFFICULTY_CHANGE, { difficultyIndex: this.difficultyIndex });
  }

  update(dt) {
    // Over-time difficulty decay or accumulation logic if needed.
    // For now, it reacts purely to user performance events.
  }
}

export default new DifficultyEngine();
