/**
 * GameLoop.js
 * Implements a high-precision requestAnimationFrame loop with deltaTime.
 * Targets 60 FPS but handles variable frame-rates gracefully.
 */
class GameLoop {
  constructor() {
    this.lastTime = 0;
    this.accumulator = 0;
    this.isRunning = false;
    this.onUpdate = null;
    this.onRender = null;
  }

  start(onUpdate, onRender) {
    this.onUpdate = onUpdate;
    this.onRender = onRender;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
    console.log('[GameLoop] Started at 60 FPS target.');
  }

  stop() {
    this.isRunning = false;
    console.log('[GameLoop] Stopped.');
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (this.onUpdate) this.onUpdate(deltaTime);
    if (this.onRender) this.onRender();

    requestAnimationFrame(this.loop.bind(this));
  }
}

export default new GameLoop();
