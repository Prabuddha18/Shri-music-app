/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  url: string; // Object URL or synthetic audio buffer source
  artwork?: string; // base64 or SVG data URI or image URL
  year?: number;
  genre?: string;
  trackNumber?: number;
  bitrate?: string;
  format?: 'MP3' | 'FLAC' | 'WAV' | 'AAC' | 'OGG' | 'M4A';
  sizeBytes?: number;
  dateAdded: number;
  folderPath: string;
  isFavorite: boolean;
  lyrics?: string; // plain text or LRC format
  sampleRate?: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year?: number;
  trackCount: number;
  duration: number;
  artwork?: string;
}

export interface Artist {
  id: string;
  name: string;
  trackCount: number;
  albumCount: number;
  artwork?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
  coverArtwork?: string;
  isSmart?: boolean;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface EqualizerPreset {
  name: string;
  bands: [number, number, number, number, number]; // 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz (in dB, -12 to +12)
  bassBoost: number; // 0 to 100%
  treble: number; // -10 to +10 dB
}

export interface AudioSettings {
  equalizerEnabled: boolean;
  preset: string;
  bands: [number, number, number, number, number];
  bassBoost: number;
  treble: number;
  playbackSpeed: number;
  crossfadeDuration: number; // in seconds (0 to 10)
  gaplessPlayback: boolean;
  replayGain: boolean;
  sleepTimerMinutes: number | null;
  sleepTimerEndTimestamp: number | null;
  sleepTimerFadeOut: boolean;
}

export type AppTheme = 'amoled' | 'dark' | 'light';
export type AccentColor = 'red' | 'white' | 'blue' | 'emerald';

export interface UserPreferences {
  theme: AppTheme;
  accentColor: AccentColor;
  viewMode: 'android_frame' | 'fullscreen';
  lastTrackId: string | null;
  lastPosition: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  excludedFolders: string[];
}
