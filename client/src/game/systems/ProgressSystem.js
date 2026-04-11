import GameStateManager from '../core/GameStateManager';

class ProgressSystem {
  constructor() {
    this.totalSteps = 0;
    this.currentStep = 0;
  }

  init(totalSteps) {
    this.totalSteps = totalSteps;
    this.currentStep = 0;
    GameStateManager.updateProgress(0);
  }

  increment() {
    this.currentStep += 1;
    this.calculate();
  }

  decrement() {
    if (this.currentStep > 0) this.currentStep -= 1;
    this.calculate();
  }

  calculate() {
    const progress = this.currentStep / this.totalSteps;
    GameStateManager.updateProgress(progress);
  }
}

export default new ProgressSystem();
