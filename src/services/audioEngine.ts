/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioSettings, EqualizerPreset, Track } from '../types/music';

export const EQUALIZER_PRESETS: EqualizerPreset[] = [
  { name: 'Flat', bands: [0, 0, 0, 0, 0], bassBoost: 0, treble: 0 },
  { name: 'Bass Boost', bands: [7, 4, 1, 0, 1], bassBoost: 65, treble: 2 },
  { name: 'Rock', bands: [5, 3, -1, 3, 5], bassBoost: 35, treble: 4 },
  { name: 'Pop', bands: [-1, 2, 5, 2, -1], bassBoost: 20, treble: 3 },
  { name: 'Classical', bands: [4, 2, -1, 3, 4], bassBoost: 15, treble: 3 },
  { name: 'Vocal', bands: [-3, 1, 6, 3, -2], bassBoost: 0, treble: 2 },
  { name: 'Electronic', bands: [6, 4, 0, 3, 6], bassBoost: 50, treble: 5 },
];

export class AudioEngine {
  private static instance: AudioEngine;
  private audio: HTMLAudioElement;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private analyser: AnalyserNode | null = null;

  private isInitialized = false;
  private currentTrack: Track | null = null;
  private currentVolume = 0.85;
  private isMuted = false;
  private sleepTimerId: number | null = null;
  private sleepTimerFadeInterval: number | null = null;

  public onTimeUpdate?: (currentTime: number, duration: number) => void;
  public onTrackEnded?: () => void;
  public onPlayStateChange?: (isPlaying: boolean) => void;
  public onTrackChange?: (track: Track) => void;
  public onSleepTimerTick?: (remainingSeconds: number | null) => void;

  private constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.setupAudioListeners();
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  private initAudioContext() {
    if (this.isInitialized) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.currentVolume, this.audioCtx.currentTime);

      // Bass Boost filter (LowShelf at 80Hz)
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 80;
      this.bassFilter.gain.value = 0;

      // Treble filter (HighShelf at 10000Hz)
      this.trebleFilter = this.audioCtx.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.value = 10000;
      this.trebleFilter.gain.value = 0;

      // 5-band Equalizer: 60Hz, 230Hz, 910Hz, 3600Hz, 14000Hz
      const eqFrequencies = [60, 230, 910, 3600, 14000];
      this.eqFilters = eqFrequencies.map((freq) => {
        const filter = this.audioCtx!.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.4;
        filter.gain.value = 0;
        return filter;
      });

      // Chain: Source -> Bass -> Treble -> EQ 1..5 -> Gain -> Analyser -> Destination
      let lastNode: AudioNode = this.sourceNode;
      lastNode.connect(this.bassFilter);
      lastNode = this.bassFilter;

      lastNode.connect(this.trebleFilter);
      lastNode = this.trebleFilter;

      for (const eqNode of this.eqFilters) {
        lastNode.connect(eqNode);
        lastNode = eqNode;
      }

      lastNode.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      this.isInitialized = true;
    } catch {
      // Audio context might fail if restricted before user interaction
    }
  }

  private setupAudioListeners() {
    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.audio.currentTime, this.audio.duration || 0);
      }
      this.updateMediaSessionPosition();
    });

    this.audio.addEventListener('ended', () => {
      if (this.onTrackEnded) {
        this.onTrackEnded();
      }
    });

    this.audio.addEventListener('play', () => {
      if (this.onPlayStateChange) this.onPlayStateChange(true);
      this.updateMediaSessionPlaybackState('playing');
    });

    this.audio.addEventListener('pause', () => {
      if (this.onPlayStateChange) this.onPlayStateChange(false);
      this.updateMediaSessionPlaybackState('paused');
    });
  }

  public async playTrack(track: Track, startTime = 0) {
    this.initAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.currentTrack = track;
    this.audio.src = track.url;
    this.audio.currentTime = startTime;

    try {
      await this.audio.play();
      if (this.onTrackChange) this.onTrackChange(track);
      this.setupMediaSession(track);
    } catch {
      // Handle user gesture requirement or load error
    }
  }

  public async resume() {
    this.initAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    return this.audio.play();
  }

  public pause() {
    this.audio.pause();
  }

  public seek(seconds: number) {
    if (isFinite(seconds) && seconds >= 0) {
      this.audio.currentTime = seconds;
      this.updateMediaSessionPosition();
    }
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.currentVolume;
    }
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, this.audioCtx.currentTime);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.setVolume(this.currentVolume);
  }

  public setPlaybackRate(rate: number) {
    if (this.audio) {
      this.audio.playbackRate = Math.max(0.25, Math.min(2.5, rate));
      this.updateMediaSessionPosition();
    }
  }

  // Equalizer & Audio FX configuration
  public applyAudioSettings(settings: AudioSettings) {
    this.initAudioContext();
    if (!this.audioCtx) return;

    const currentTime = this.audioCtx.currentTime;

    if (!settings.equalizerEnabled) {
      this.bassFilter?.gain.setValueAtTime(0, currentTime);
      this.trebleFilter?.gain.setValueAtTime(0, currentTime);
      this.eqFilters.forEach((f) => f.gain.setValueAtTime(0, currentTime));
      return;
    }

    // Apply 5 bands
    settings.bands.forEach((gainVal, idx) => {
      if (this.eqFilters[idx]) {
        this.eqFilters[idx].gain.setTargetAtTime(gainVal, currentTime, 0.05);
      }
    });

    // Apply Bass Boost (0 - 100% -> 0 to +12dB)
    const bassGain = (settings.bassBoost / 100) * 12;
    this.bassFilter?.gain.setTargetAtTime(bassGain, currentTime, 0.05);

    // Apply Treble (-10 to +10dB)
    this.trebleFilter?.gain.setTargetAtTime(settings.treble, currentTime, 0.05);

    // Apply Playback Speed
    this.setPlaybackRate(settings.playbackSpeed);
  }

  // Visualizer spectrum data extraction
  public getVisualizerData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(32);
    }
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  // Sleep Timer with smooth fade-out
  public setSleepTimer(minutes: number | null, fadeOut = true) {
    if (this.sleepTimerId) {
      window.clearTimeout(this.sleepTimerId);
      this.sleepTimerId = null;
    }
    if (this.sleepTimerFadeInterval) {
      window.clearInterval(this.sleepTimerFadeInterval);
      this.sleepTimerFadeInterval = null;
    }

    if (minutes === null || minutes <= 0) {
      if (this.onSleepTimerTick) this.onSleepTimerTick(null);
      return;
    }

    let remainingSeconds = Math.round(minutes * 60);
    const initialVolume = this.currentVolume;
    const fadeDurationSeconds = Math.min(60, remainingSeconds * 0.4);

    const updateTick = () => {
      remainingSeconds--;
      if (this.onSleepTimerTick) this.onSleepTimerTick(remainingSeconds);

      if (fadeOut && remainingSeconds <= fadeDurationSeconds && remainingSeconds > 0) {
        const factor = remainingSeconds / fadeDurationSeconds;
        this.setVolume(initialVolume * factor);
      }

      if (remainingSeconds <= 0) {
        this.pause();
        this.setVolume(initialVolume);
        if (this.sleepTimerFadeInterval) clearInterval(this.sleepTimerFadeInterval);
        if (this.onSleepTimerTick) this.onSleepTimerTick(null);
      }
    };

    if (this.onSleepTimerTick) this.onSleepTimerTick(remainingSeconds);
    this.sleepTimerFadeInterval = window.setInterval(updateTick, 1000);
  }

  // System MediaSession API for Android Lockscreen and Background Controls
  private setupMediaSession(track: Track) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: track.artwork ? [
          { src: track.artwork, sizes: '512x512', type: 'image/png' },
          { src: track.artwork, sizes: '192x192', type: 'image/png' }
        ] : []
      });

      this.updateMediaSessionPosition();
    }
  }

  public registerMediaSessionHandlers(handlers: {
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    onSeek: (seconds: number) => void;
  }) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', handlers.onPlay);
      navigator.mediaSession.setActionHandler('pause', handlers.onPause);
      navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext);
      navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrev);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          handlers.onSeek(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        this.seek(this.audio.currentTime - (details.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        this.seek(this.audio.currentTime + (details.seekOffset || 10));
      });
    }
  }

  private updateMediaSessionPlaybackState(state: 'playing' | 'paused' | 'none') {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }

  private updateMediaSessionPosition() {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      try {
        if (isFinite(this.audio.duration) && this.audio.duration > 0) {
          navigator.mediaSession.setPositionState({
            duration: this.audio.duration,
            playbackRate: this.audio.playbackRate || 1.0,
            position: Math.min(this.audio.currentTime, this.audio.duration)
          });
        }
      } catch {
        // Ignore minor position state timing errors
      }
    }
  }

  public getCurrentTime(): number {
    return this.audio ? this.audio.currentTime : 0;
  }

  public getDuration(): number {
    return this.audio ? this.audio.duration : 0;
  }

  public isPlaying(): boolean {
    return !this.audio.paused;
  }
}
