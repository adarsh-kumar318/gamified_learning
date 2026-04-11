/**
 * AudioEngine.js (Web Audio API Synthesizer)
 * Create psychological tension using procedural sound effects.
 * No external MP3 files required.
 */
import EventBus from '../core/EventBus';
import { GAME_EVENTS } from '../constants';

class AudioEngine {
  constructor() {
    this.context = null;
    this.heartbeatTimer = null;
    this.tensionLevel = 0;
    this.isMuted = false;
    
    this.setupListeners();
  }

  init() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    console.warn('[AudioEngine] Web Audio Context Started.');
  }

  setupListeners() {
    EventBus.on(GAME_EVENTS.TENSION_UPDATE, ({ tension }) => this.handleTension(tension));
    EventBus.on(GAME_EVENTS.QUESTION_CORRECT, () => this.playSuccessTone());
    EventBus.on(GAME_EVENTS.QUESTION_WRONG, () => this.playFailTone());
  }

  handleTension(tension) {
    this.tensionLevel = tension;
    if (tension > 50 && !this.heartbeatTimer) {
      this.startHeartbeat();
    } else if (tension <= 50 && this.heartbeatTimer) {
      this.stopHeartbeat();
    }
  }

  startHeartbeat() {
    const playTick = () => {
      const rate = 1000 - (this.tensionLevel * 5); // Faster pulse at high tension
      this.playTone(60, 0.1, 'sine');
      setTimeout(() => this.playTone(50, 0.1, 'sine'), 150);
      
      this.heartbeatTimer = setTimeout(playTick, Math.max(300, rate));
    };
    playTick();
  }

  stopHeartbeat() {
    clearTimeout(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  playTone(freq, duration, type = 'sine') {
    if (!this.context || this.isMuted) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.context.currentTime);
    
    gain.gain.setValueAtTime(0.1, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + duration);
  }

  playSuccessTone() {
    this.playTone(880, 0.3, 'triangle');
    setTimeout(() => this.playTone(1320, 0.5, 'triangle'), 100);
  }

  playFailTone() {
    this.playTone(220, 0.6, 'sawtooth');
  }
}

export default new AudioEngine();
