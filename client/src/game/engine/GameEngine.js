/**
 * GameEngine.js
 * The AAA-Grade Master Orchestrator for the Rescue platform.
 * Coordinates difficulty, tension, camera, and animations.
 */
import GameLoop from './GameLoop';
import EventBus from '../core/EventBus';
import { GAME_EVENTS, GAME_STATES } from '../constants';

class GameEngine {
  constructor() {
    this.systems = {};
    this.isPaused = false;
  }

  init(systems) {
    this.systems = systems;
    this.setupListeners();
    console.warn('[GameEngine] Initialized with 6 core systems.');
  }

  setupListeners() {
    EventBus.on(GAME_EVENTS.LEVEL_START, (levelData) => this.start(levelData));
    EventBus.on(GAME_EVENTS.LEVEL_COMPLETE, () => this.stop());
    EventBus.on(GAME_EVENTS.LEVEL_FAILED, () => this.stop());
  }

  start(levelData) {
    console.log('[GameEngine] Starting Level Logic.', levelData);
    this.isPaused = false;
    GameLoop.start(
      (dt) => this.update(dt),
      () => this.render()
    );
  }

  stop() {
    this.isPaused = true;
    GameLoop.stop();
  }

  update(dt) {
    if (this.isPaused) return;

    // 1. Update Core Logic (Difficulty -> Tension -> Timer)
    if (this.systems.difficulty) this.systems.difficulty.update(dt);
    if (this.systems.tension) this.systems.tension.update(dt);
    if (this.systems.combo) this.systems.combo.update(dt);

    // 2. Update Camera & Particles
    if (this.systems.camera) this.systems.camera.update(dt);
  }

  render() {
    // This could trigger canvas redraws or 3D scene renders.
    // For React/GSAP, the AnimationController handles the heavy lifting
    // via DOM manipulation, so this remains lightweight.
  }
}

export default new GameEngine();
