import EventBus from '../core/EventBus';
import GameStateManager from '../core/GameStateManager';
import { GAME_EVENTS } from '../constants';

class TimerSystem {
  constructor() {
    this.timerInterval = null;
    this.timeLeft = 0;
  }

  start(seconds) {
    this.timeLeft = seconds;
    this.stop();
    this.timerInterval = setInterval(() => {
      this.timeLeft -= 1;
      GameStateManager.updateTime(this.timeLeft);
      if (this.timeLeft <= 0) this.stop();
    }, 1000);
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  reset(seconds) {
    this.start(seconds);
  }
}

export default new TimerSystem();
