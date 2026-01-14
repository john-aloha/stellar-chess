// Audio Manager - Web Audio API Sound Effects Generator
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.sfxEnabled = true;
        this.musicEnabled = true;
        this.volume = 0.7;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    setVolume(vol) {
        this.volume = vol;
        if (this.masterGain) {
            this.masterGain.gain.value = vol;
        }
    }

    setSfxEnabled(enabled) { this.sfxEnabled = enabled; }
    setMusicEnabled(enabled) { this.musicEnabled = enabled; }

    playTone(freq, duration, type = 'sine', attack = 0.01, decay = 0.1) {
        if (!this.sfxEnabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + attack);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
    }

    playNoise(duration, filterFreq = 1000) {
        if (!this.sfxEnabled || !this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = filterFreq;
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        noise.start();
    }

    // Sound Effects
    playMove() {
        this.init();
        this.playTone(800, 0.1, 'sine');
        setTimeout(() => this.playTone(1200, 0.08, 'sine'), 50);
    }

    playCapture() {
        this.init();
        this.playNoise(0.15, 2000);
        this.playTone(300, 0.2, 'sawtooth');
        setTimeout(() => this.playTone(200, 0.15, 'sawtooth'), 100);
    }

    playCheck() {
        this.init();
        this.playTone(880, 0.15, 'square');
        setTimeout(() => this.playTone(1100, 0.15, 'square'), 100);
        setTimeout(() => this.playTone(880, 0.2, 'square'), 200);
    }

    playCheckmate() {
        this.init();
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'sine'), i * 150);
        });
    }

    playGameStart() {
        this.init();
        this.playTone(440, 0.2, 'sine');
        setTimeout(() => this.playTone(550, 0.2, 'sine'), 150);
        setTimeout(() => this.playTone(660, 0.3, 'sine'), 300);
    }

    playSelect() {
        this.init();
        this.playTone(600, 0.08, 'sine');
    }

    playError() {
        this.init();
        this.playTone(200, 0.15, 'sawtooth');
        setTimeout(() => this.playTone(150, 0.2, 'sawtooth'), 100);
    }

    playVictory() {
        this.init();
        const melody = [523, 659, 784, 1047, 784, 1047];
        melody.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.25, 'sine'), i * 200);
        });
    }

    playDefeat() {
        this.init();
        const melody = [400, 350, 300, 250];
        melody.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'sawtooth'), i * 250);
        });
    }

    playPromotion() {
        this.init();
        this.playTone(800, 0.15, 'sine');
        setTimeout(() => this.playTone(1000, 0.15, 'sine'), 100);
        setTimeout(() => this.playTone(1200, 0.2, 'sine'), 200);
    }

    playButtonClick() {
        this.init();
        this.playTone(1000, 0.05, 'sine');
    }

    playButtonHover() {
        this.init();
        this.playTone(700, 0.03, 'sine');
    }

    playCastle() {
        this.init();
        this.playTone(500, 0.1, 'sine');
        setTimeout(() => this.playTone(600, 0.1, 'sine'), 80);
        setTimeout(() => this.playTone(700, 0.15, 'sine'), 160);
    }
}

// Global audio instance
const audioManager = new AudioManager();
