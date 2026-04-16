import EventBus from './EventBus';
import { GAME_STATES, GAME_EVENTS } from '../constants';

class GameStateManager {
  constructor() {
    this.state = GAME_STATES.LOADING;
    this.levelData = null;
    this.progress = 0;
    this.timeLeft = 0;
  }

  init(levelData) {
    this.levelData = levelData;
    this.setState(GAME_STATES.READY);
    EventBus.emit(GAME_EVENTS.LEVEL_START, levelData);
  }

  setState(newState) {
    if (this.state === newState) return;
    const oldState = this.state;
    this.state = newState;
    console.warn(`[GameState] ${oldState} -> ${newState}`);
    EventBus.emit('state_change', { oldState, newState });
  }

  updateProgress(newProgress) {
    this.progress = newProgress;
    EventBus.emit(GAME_EVENTS.PROGRESS_UPDATE, { progress: newProgress });
    if (newProgress >= 1) {
      this.setState(GAME_STATES.SUCCESS);
      EventBus.emit(GAME_EVENTS.LEVEL_COMPLETE);
    }
  }

  updateTime(newTime) {
    this.timeLeft = newTime;
    EventBus.emit(GAME_EVENTS.TIME_UPDATE, { timeLeft: newTime });
    if (newTime <= 20 && newTime > 0 && this.state !== GAME_STATES.DANGER) {
      this.setState(GAME_STATES.DANGER);
      EventBus.emit(GAME_EVENTS.TIME_LOW);
    }
    if (newTime === 0) {
      this.setState(GAME_STATES.FAILED);
      EventBus.emit(GAME_EVENTS.TIME_UP);
      EventBus.emit(GAME_EVENTS.LEVEL_FAILED);
    }
  }

  handleAnswer(isCorrect) {
    if (isCorrect) {
      EventBus.emit(GAME_EVENTS.ANSWER_CORRECT);
    } else {
      EventBus.emit(GAME_EVENTS.ANSWER_WRONG);
    }
  }
}

export default new GameStateManager();
