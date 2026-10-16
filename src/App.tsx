/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayer } from './components/FullPlayer';
import { LibraryView } from './components/LibraryView';
import { EqualizerModal } from './components/EqualizerModal';
import { PlaylistsView } from './components/PlaylistsView';
import { SleepTimerModal } from './components/SleepTimerModal';
import { SettingsView } from './components/SettingsView';
import { AndroidCodeExplorer } from './components/AndroidCodeExplorer';
import { ScanModal } from './components/ScanModal';
import { AndroidFrame } from './components/AndroidFrame';
import { AudioEngine } from './services/audioEngine';
import { generateSampleTracks } from './services/sampleLibrary';
import {
  AudioSettings,
  Playlist,
  RepeatMode,
  Track,
  UserPreferences,
} from './types/music';

const STORAGE_KEY_PREFS = 'deku_music_preferences_v1';
const STORAGE_KEY_PLAYLISTS = 'deku_music_playlists_v1';
const STORAGE_KEY_SETTINGS = 'deku_music_audio_settings_v1';

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  equalizerEnabled: true,
  preset: 'Flat',
  bands: [0, 0, 0, 0, 0],
  bassBoost: 15,
  treble: 0,
  playbackSpeed: 1.0,
  crossfadeDuration: 2,
  gaplessPlayback: true,
  replayGain: false,
  sleepTimerMinutes: null,
  sleepTimerEndTimestamp: null,
  sleepTimerFadeOut: true,
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'amoled',
  accentColor: 'red',
  viewMode: 'fullscreen',
  lastTrackId: null,
  lastPosition: 0,
  volume: 0.85,
  isMuted: false,
  isShuffle: false,
  repeatMode: 'all',
  excludedFolders: ['/Storage/WhatsApp/Media', '/Storage/Recordings'],
};

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(DEFAULT_PREFERENCES.volume);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // Navigation and Modals
  const [currentTab, setCurrentTab] = useState<'library' | 'playlists' | 'equalizer' | 'settings' | 'android_project'>('library');
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);
  const [isEqualizerModalOpen, setIsEqualizerModalOpen] = useState<boolean>(false);
  const [isSleepTimerModalOpen, setIsSleepTimerModalOpen] = useState<boolean>(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);

  const audioEngineRef = useRef<AudioEngine>(AudioEngine.getInstance());

  // Ref to hold latest tracks and currentTrack for playback callbacks without re-subscribing
  const stateRef = useRef({
    tracks,
    currentTrack,
    isShuffle,
    repeatMode,
  });
  useEffect(() => {
    stateRef.current = { tracks, currentTrack, isShuffle, repeatMode };
  }, [tracks, currentTrack, isShuffle, repeatMode]);

  // Load preferences, playlists, and initialize sample library on boot
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem(STORAGE_KEY_PREFS);
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        setPreferences((prev) => ({ ...prev, ...parsed }));
        setVolume(parsed.volume ?? 0.85);
        setIsMuted(parsed.isMuted ?? false);
        setIsShuffle(parsed.isShuffle ?? false);
        setRepeatMode(parsed.repeatMode ?? 'all');
      }

      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        setAudioSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));
      }

      const savedPlaylists = localStorage.getItem(STORAGE_KEY_PLAYLISTS);
      if (savedPlaylists) {
        setPlaylists(JSON.parse(savedPlaylists));
      } else {
        // Initial smart playlists
        const initialPlaylists: Playlist[] = [
          {
            id: 'smart-favorites',
            name: 'Starred & Favorites',
            description: 'Favorite offline tracks',
            trackIds: ['deku-track-1', 'deku-track-2'],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isSmart: true,
          },
          {
            id: 'smart-matrix',
            name: 'Nothing Dot Matrix',
            description: 'Acoustic and minimal glitch beats',
            trackIds: ['deku-track-1', 'deku-track-6'],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isSmart: false,
          },
        ];
        setPlaylists(initialPlaylists);
        localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(initialPlaylists));
      }
    } catch (e) {
      console.error('Storage load failed', e);
    }

    // Generate initial synthesized offline music library
    const sampleTracks = generateSampleTracks();
    setTracks(sampleTracks);
    setCurrentTrack(sampleTracks[0]);
    audioEngineRef.current.setVolume(DEFAULT_PREFERENCES.volume);
  }, []);

  // Save preferences changes to localStorage
  useEffect(() => {
    const dataToSave = {
      ...preferences,
      volume,
      isMuted,
      isShuffle,
      repeatMode,
      lastTrackId: currentTrack?.id || null,
      lastPosition: currentTime,
    };
    localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(dataToSave));
  }, [preferences, volume, isMuted, isShuffle, repeatMode, currentTrack, currentTime]);

  // Save Audio Settings to localStorage & apply to DSP
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(audioSettings));
    audioEngineRef.current.applyAudioSettings(audioSettings);
  }, [audioSettings]);

  // Audio Playback Handler: Next Track
  const handleNext = useCallback(() => {
    const { tracks: currentTracks, currentTrack: active, isShuffle: shuffle, repeatMode: repeat } = stateRef.current;
    if (currentTracks.length === 0) return;

    if (repeat === 'one' && active) {
      audioEngineRef.current.seek(0);
      audioEngineRef.current.resume();
      return;
    }

    let nextTrack: Track;
    if (shuffle) {
      const candidates = currentTracks.filter((t) => t.id !== active?.id);
      nextTrack = candidates[Math.floor(Math.random() * candidates.length)] || currentTracks[0];
    } else {
      const currentIndex = currentTracks.findIndex((t) => t.id === active?.id);
      if (currentIndex === -1 || currentIndex === currentTracks.length - 1) {
        if (repeat === 'off') {
          audioEngineRef.current.pause();
          return;
        }
        nextTrack = currentTracks[0];
      } else {
        nextTrack = currentTracks[currentIndex + 1];
      }
    }

    setCurrentTrack(nextTrack);
    audioEngineRef.current.playTrack(nextTrack);
  }, []);

  // Audio Playback Handler: Previous Track
  const handlePrev = useCallback(() => {
    const { tracks: currentTracks, currentTrack: active } = stateRef.current;
    if (currentTracks.length === 0) return;

    // If more than 3 seconds in, restart track
    if (audioEngineRef.current.getCurrentTime() > 3) {
      audioEngineRef.current.seek(0);
      return;
    }

    const currentIndex = currentTracks.findIndex((t) => t.id === active?.id);
    const prevIndex = currentIndex <= 0 ? currentTracks.length - 1 : currentIndex - 1;
    const prevTrack = currentTracks[prevIndex];

    setCurrentTrack(prevTrack);
    audioEngineRef.current.playTrack(prevTrack);
  }, []);

  // Setup AudioEngine event listeners
  useEffect(() => {
    const engine = audioEngineRef.current;

    engine.onTimeUpdate = (curr, dur) => {
      setCurrentTime(curr);
      setDuration(dur);
    };

    engine.onPlayStateChange = (playing) => {
      setIsPlaying(playing);
    };

    engine.onTrackEnded = () => {
      handleNext();
    };

    engine.onSleepTimerTick = (remaining) => {
      setSleepTimerRemaining(remaining);
    };

    // System MediaSession registration for Lock Screen & Bluetooth
    engine.registerMediaSessionHandlers({
      onPlay: () => engine.resume(),
      onPause: () => engine.pause(),
      onNext: () => handleNext(),
      onPrev: () => handlePrev(),
      onSeek: (seconds) => engine.seek(seconds),
    });
  }, [handleNext, handlePrev]);

  // Global Keyboard Shortcuts (Space: Play/Pause, Left/Right: Seek, M: Mute, N: Next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (audioEngineRef.current.isPlaying()) {
          audioEngineRef.current.pause();
        } else {
          audioEngineRef.current.resume();
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        audioEngineRef.current.seek(audioEngineRef.current.getCurrentTime() + 5);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        audioEngineRef.current.seek(Math.max(0, audioEngineRef.current.getCurrentTime() - 5));
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => {
          const nextVal = !prev;
          audioEngineRef.current.setMuted(nextVal);
          return nextVal;
        });
      } else if (e.key === 'n' || e.key === 'N') {
        handleNext();
      } else if (e.key === 'p' || e.key === 'P') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Play Specific Track
  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
    audioEngineRef.current.playTrack(track);
  };

  // Toggle Play / Pause
  const handlePlayPause = () => {
    if (audioEngineRef.current.isPlaying()) {
      audioEngineRef.current.pause();
    } else {
      if (!currentTrack && tracks.length > 0) {
        handlePlayTrack(tracks[0]);
      } else {
        audioEngineRef.current.resume();
      }
    }
  };

  // Seek
  const handleSeek = (seconds: number) => {
    audioEngineRef.current.seek(seconds);
    setCurrentTime(seconds);
  };

  // Volume
  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    audioEngineRef.current.setVolume(vol);
    if (isMuted) {
      setIsMuted(false);
      audioEngineRef.current.setMuted(false);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextVal = !isMuted;
    setIsMuted(nextVal);
    audioEngineRef.current.setMuted(nextVal);
  };

  // Toggle Favorite
  const handleToggleFavorite = (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, isFavorite: !t.isFavorite } : t))
    );
    if (currentTrack?.id === trackId) {
      setCurrentTrack((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  // Cycle Repeat Mode: off -> all -> one
  const handleCycleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  // Add Local Tracks from File/Folder Scanner
  const handleAddScannedTracks = (newTracks: Track[]) => {
    setTracks((prev) => {
      // Deduplicate by file path / title
      const existingTitles = new Set(prev.map((t) => `${t.title}-${t.artist}`));
      const uniqueNew = newTracks.filter((t) => !existingTitles.has(`${t.title}-${t.artist}`));
      return [...uniqueNew, ...prev];
    });

    if (newTracks.length > 0) {
      handlePlayTrack(newTracks[0]);
    }
  };

  // Reload built-in sample offline library
  const handleLoadSampleLibrary = () => {
    const samples = generateSampleTracks();
    setTracks(samples);
    handlePlayTrack(samples[0]);
  };

  // Create Playlist
  const handleCreatePlaylist = (name: string, description?: string) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      trackIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...playlists, newPl];
    setPlaylists(updated);
    localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(updated));
  };

  // Delete Playlist
  const handleDeletePlaylist = (id: string) => {
    const updated = playlists.filter((p) => p.id !== id);
    setPlaylists(updated);
    localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(updated));
  };

  // Rename Playlist
  const handleRenamePlaylist = (id: string, newName: string) => {
    const updated = playlists.map((p) => (p.id === id ? { ...p, name: newName } : p));
    setPlaylists(updated);
    localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(updated));
  };

  // Add Track to Playlist
  const handleAddToPlaylist = (playlistId: string, trackId: string) => {
    const updated = playlists.map((p) => {
      if (p.id === playlistId && !p.trackIds.includes(trackId)) {
        return { ...p, trackIds: [...p.trackIds, trackId], updatedAt: Date.now() };
      }
      return p;
    });
    setPlaylists(updated);
    localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(updated));
  };

  // Remove Track from Playlist
  const handleRemoveTrackFromPlaylist = (playlistId: string, trackId: string) => {
    const updated = playlists.map((p) => {
      if (p.id === playlistId) {
        return { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) };
      }
      return p;
    });
    setPlaylists(updated);
    localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(updated));
  };

  // Create Playlist with Track
  const handleCreatePlaylistWithTrack = (trackId: string) => {
    const t = tracks.find((track) => track.id === trackId);
    handleCreatePlaylist(`Mix: ${t?.title || 'New Playlist'}`);
  };

  // Theme style classes
  const themeBgClass =
    preferences.theme === 'amoled'
      ? 'bg-black text-white'
      : preferences.theme === 'dark'
      ? 'bg-[#121214] text-white'
      : 'bg-[#f5f5f7] text-zinc-900';

  return (
    <div className={`min-h-screen ${themeBgClass} antialiased transition-colors duration-200 flex flex-col font-sans`}>
      <AndroidFrame enabled={preferences.viewMode === 'android_frame'}>
        <div className="flex-1 flex flex-col relative w-full h-full">
          {/* Top Bar Contract Compliant Header */}
          <Header
            currentTab={currentTab}
            onTabChange={(tab) => {
              if (tab === 'equalizer') {
                setIsEqualizerModalOpen(true);
              } else {
                setCurrentTab(tab);
              }
            }}
            viewMode={preferences.viewMode}
            onToggleViewMode={() =>
              setPreferences((prev) => ({
                ...prev,
                viewMode: prev.viewMode === 'android_frame' ? 'fullscreen' : 'android_frame',
              }))
            }
            onOpenScanModal={() => setIsScanModalOpen(true)}
            trackCount={tracks.length}
          />

          {/* Main Body Viewport */}
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8">
            {currentTab === 'library' && (
              <LibraryView
                tracks={tracks}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayTrack}
                onToggleFavorite={handleToggleFavorite}
                onOpenScanModal={() => setIsScanModalOpen(true)}
                onRefreshLibrary={handleLoadSampleLibrary}
                playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist}
                onCreatePlaylistWithTrack={handleCreatePlaylistWithTrack}
              />
            )}

            {currentTab === 'playlists' && (
              <PlaylistsView
                playlists={playlists}
                tracks={tracks}
                onPlayTrack={handlePlayTrack}
                onCreatePlaylist={handleCreatePlaylist}
                onDeletePlaylist={handleDeletePlaylist}
                onRenamePlaylist={handleRenamePlaylist}
                onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                preferences={preferences}
                audioSettings={audioSettings}
                onUpdatePreferences={(pref) => setPreferences((prev) => ({ ...prev, ...pref }))}
                onUpdateAudioSettings={(aud) => setAudioSettings((prev) => ({ ...prev, ...aud }))}
                onRescanLibrary={() => setIsScanModalOpen(true)}
                onClearLibrary={() => {
                  setTracks([]);
                  setCurrentTrack(null);
                  audioEngineRef.current.pause();
                }}
              />
            )}

            {currentTab === 'android_project' && <AndroidCodeExplorer />}
          </main>

          {/* Bottom Mini Player */}
          <MiniPlayer
            track={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onToggleFavorite={handleToggleFavorite}
            onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
            onOpenEqualizer={() => setIsEqualizerModalOpen(true)}
          />

          {/* Full Screen Immersive Player Overlay */}
          {isFullPlayerOpen && (
            <FullPlayer
              track={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              isShuffle={isShuffle}
              repeatMode={repeatMode}
              queue={tracks}
              onClose={() => setIsFullPlayerOpen(false)}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrev={handlePrev}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
              onToggleShuffle={() => setIsShuffle(!isShuffle)}
              onCycleRepeat={handleCycleRepeat}
              onToggleFavorite={handleToggleFavorite}
              onOpenEqualizer={() => setIsEqualizerModalOpen(true)}
              onOpenSleepTimer={() => setIsSleepTimerModalOpen(true)}
              onSelectTrack={handlePlayTrack}
            />
          )}

          {/* 5-Band Equalizer & Bass Boost Modal */}
          <EqualizerModal
            isOpen={isEqualizerModalOpen}
            onClose={() => setIsEqualizerModalOpen(false)}
            settings={audioSettings}
            onUpdateSettings={(newSettings) => setAudioSettings(newSettings)}
          />

          {/* Sleep Timer Modal */}
          <SleepTimerModal
            isOpen={isSleepTimerModalOpen}
            onClose={() => setIsSleepTimerModalOpen(false)}
            remainingSeconds={sleepTimerRemaining}
            onSetTimer={(mins, fadeOut) => {
              audioEngineRef.current.setSleepTimer(mins, fadeOut);
            }}
          />

          {/* Scan & Import Local Audio Files Modal */}
          <ScanModal
            isOpen={isScanModalOpen}
            onClose={() => setIsScanModalOpen(false)}
            onAddTracks={handleAddScannedTracks}
            onLoadSampleLibrary={handleLoadSampleLibrary}
          />
        </div>
      </AndroidFrame>
    </div>
  );
}
