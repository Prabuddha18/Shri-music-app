/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Sliders,
  Moon,
  ListMusic,
  ChevronDown,
  Volume2,
  VolumeX,
  FileText,
  Sparkles,
} from 'lucide-react';
import { AudioEngine } from '../services/audioEngine';
import { RepeatMode, Track } from '../types/music';

interface FullPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  onClose: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onToggleFavorite: (trackId: string) => void;
  onOpenEqualizer: () => void;
  onOpenSleepTimer: () => void;
  onSelectTrack: (track: Track) => void;
}

export const FullPlayer: React.FC<FullPlayerProps> = ({
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
  queue,
  onClose,
  onPlayPause,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onCycleRepeat,
  onToggleFavorite,
  onOpenEqualizer,
  onOpenSleepTimer,
  onSelectTrack,
}) => {
  const [activeTab, setActiveTab] = useState<'art' | 'lyrics' | 'queue'>('art');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  if (!track) return null;

  // Real-time canvas spectrum visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const audioEngine = AudioEngine.getInstance();

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      const data = audioEngine.getVisualizerData();
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const numBars = 36;
      const barWidth = (width / numBars) - 2;

      for (let i = 0; i < numBars; i++) {
        const val = data[i * 2] || 0;
        const barHeight = Math.max(3, (val / 255) * height * 0.9);
        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Nothing OS accent red / white visualizer
        if (i % 6 === 0) {
          ctx.fillStyle = '#d71920';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        }

        ctx.fillRect(x, y, barWidth, barHeight);
      }
    };

    if (isPlaying) {
      draw();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Parse synchronized lyrics or plain text
  const parsedLyrics = parseLyrics(track.lyrics || '');
  const activeLyricIndex = parsedLyrics.findIndex((line, idx) => {
    const nextLine = parsedLyrics[idx + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between overflow-y-auto no-scrollbar animate-in fade-in duration-200">
      {/* Background ambient subtle glow from Nothing aesthetic */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-950/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-900">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
          title="Minimize Player"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            NOW PLAYING
          </div>
          <div className="text-xs font-medium text-white truncate max-w-[200px]">
            {track.album}
          </div>
        </div>

        <div className="flex items-center gap-1 -mr-2">
          <button
            onClick={() => setActiveTab(activeTab === 'lyrics' ? 'art' : 'lyrics')}
            className={`p-2 rounded-xl transition-colors ${
              activeTab === 'lyrics'
                ? 'text-red-400 bg-red-950/40 border border-red-800/40'
                : 'text-zinc-400 hover:text-white bg-zinc-900/50'
            }`}
            title="Lyrics"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab(activeTab === 'queue' ? 'art' : 'queue')}
            className={`p-2 rounded-xl transition-colors ${
              activeTab === 'queue'
                ? 'text-red-400 bg-red-950/40 border border-red-800/40'
                : 'text-zinc-400 hover:text-white bg-zinc-900/50'
            }`}
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Body: Artwork, Lyrics, or Queue */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-4 max-w-md mx-auto w-full">
        {activeTab === 'art' && (
          <div className="w-full flex flex-col items-center">
            {/* Square Album Artwork */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-900 group">
              {track.artwork ? (
                <img
                  src={track.artwork}
                  alt={track.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <Sparkles className="w-12 h-12 text-zinc-600 mb-2" />
                  <span className="text-xs font-mono text-zinc-500">DEKU AUDIO</span>
                </div>
              )}
            </div>

            {/* Audio Spectrum Visualizer */}
            <div className="w-full mt-4 h-10 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={280}
                height={40}
                className="opacity-80"
              />
            </div>
          </div>
        )}

        {activeTab === 'lyrics' && (
          <div className="w-full h-80 overflow-y-auto no-scrollbar py-6 text-center space-y-4">
            {parsedLyrics.length > 0 ? (
              parsedLyrics.map((item, idx) => {
                const isActive = idx === activeLyricIndex;
                return (
                  <p
                    key={idx}
                    className={`text-sm md:text-base font-medium transition-all duration-300 ${
                      isActive
                        ? 'text-white font-bold scale-105 drop-shadow'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {item.text}
                  </p>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm">
                <FileText className="w-8 h-8 mb-2 opacity-50" />
                <p>No offline lyrics available for this track.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="w-full h-80 overflow-y-auto no-scrollbar space-y-2 py-2">
            <div className="text-xs font-mono text-zinc-400 mb-2 uppercase">
              Up Next ({queue.length} Tracks)
            </div>
            {queue.map((qTrack, idx) => {
              const isCurrent = qTrack.id === track.id;
              return (
                <div
                  key={qTrack.id}
                  onClick={() => onSelectTrack(qTrack)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-zinc-800/90 border border-zinc-700'
                      : 'hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <span className="text-xs font-mono text-zinc-500 w-4">
                    {idx + 1}
                  </span>
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                    {qTrack.artwork && (
                      <img
                        src={qTrack.artwork}
                        alt={qTrack.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-medium truncate ${isCurrent ? 'text-red-400 font-semibold' : 'text-white'}`}>
                      {qTrack.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      {qTrack.artist}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-zinc-500 tabular-nums">
                    {formatTime(qTrack.duration)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Track Title, Artist, & Favorite */}
        <div className="w-full mt-4 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-white truncate">{track.title}</h2>
            <p className="text-sm text-zinc-400 truncate mt-0.5">{track.artist}</p>
          </div>
          <button
            onClick={() => onToggleFavorite(track.id)}
            className={`p-3 rounded-full transition-colors ${
              track.isFavorite
                ? 'text-red-500 bg-red-950/40'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60'
            }`}
            title={track.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
          >
            <Heart className={`w-5 h-5 ${track.isFavorite ? 'fill-red-500' : ''}`} />
          </button>
        </div>

        {/* Format / Lossless Audio Spec */}
        <div className="w-full mt-2 flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
            {track.format || 'AUDIO'}
          </span>
          <span>{track.bitrate || 'Standard Bitrate'}</span>
          <span aria-hidden="true">·</span>
          <span>{track.year || 2026}</span>
        </div>

        {/* Seek Bar */}
        <div className="w-full mt-6">
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg accent-red-600 cursor-pointer"
            />
          </div>
          <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mt-2 tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
          </div>
        </div>

        {/* Primary Playback Controls */}
        <div className="w-full mt-4 flex items-center justify-between">
          <button
            onClick={onToggleShuffle}
            className={`p-3 rounded-xl transition-colors ${
              isShuffle ? 'text-red-400 bg-red-950/40' : 'text-zinc-500 hover:text-white'
            }`}
            title={`Shuffle: ${isShuffle ? 'ON' : 'OFF'}`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={onPrev}
            className="p-3 rounded-xl text-zinc-300 hover:text-white active:scale-90 transition-transform"
            title="Previous Track"
          >
            <SkipBack className="w-6 h-6 fill-zinc-300" />
          </button>

          <button
            onClick={onPlayPause}
            className="w-16 h-16 rounded-2xl bg-white text-black hover:bg-zinc-200 active:scale-95 flex items-center justify-center transition-transform shadow-xl"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black" />
            ) : (
              <Play className="w-7 h-7 fill-black ml-1" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-3 rounded-xl text-zinc-300 hover:text-white active:scale-90 transition-transform"
            title="Next Track"
          >
            <SkipForward className="w-6 h-6 fill-zinc-300" />
          </button>

          <button
            onClick={onCycleRepeat}
            className={`p-3 rounded-xl transition-colors ${
              repeatMode !== 'off' ? 'text-red-400 bg-red-950/40' : 'text-zinc-500 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode.toUpperCase()}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5 text-red-500" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Volume & Bottom Utility Bar */}
        <div className="w-full mt-6 flex items-center justify-between gap-4 pt-4 border-t border-zinc-900">
          <div className="flex items-center gap-2 flex-1 max-w-[160px]">
            <button
              onClick={onToggleMute}
              className="text-zinc-400 hover:text-white p-1"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded accent-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSleepTimer}
              className="p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
              title="Sleep Timer"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenEqualizer}
              className="p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
              title="5-Band Equalizer & Bass Boost"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
};

// Helper: Parse LRC timestamped lyrics
function parseLyrics(lrcString: string): { time: number; text: string }[] {
  if (!lrcString) return [];
  const lines = lrcString.split('\n');
  const result: { time: number; text: string }[] = [];

  const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{2,3})?\]/;

  lines.forEach((line) => {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const fraction = match[3] ? parseFloat(`0.${match[3]}`) : 0;
      const time = minutes * 60 + seconds + fraction;
      const text = line.replace(timeRegex, '').trim();
      if (text) {
        result.push({ time, text });
      }
    } else if (line.trim()) {
      // Non-timestamped lyric line
      result.push({ time: 0, text: line.trim() });
    }
  });

  return result.sort((a, b) => a.time - b.time);
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
