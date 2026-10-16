/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Pause, SkipForward, Heart, Sliders, ChevronUp } from 'lucide-react';
import { Track } from '../types/music';

interface MiniPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onToggleFavorite: (trackId: string) => void;
  onOpenFullPlayer: () => void;
  onOpenEqualizer: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  track,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onToggleFavorite,
  onOpenFullPlayer,
  onOpenEqualizer,
}) => {
  if (!track) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 shadow-2xl transition-all">
      {/* Real-time mini progress strip */}
      <div className="w-full h-1 bg-zinc-800/80 cursor-pointer relative group">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Track Info (Click to open full player) */}
        <div
          onClick={onOpenFullPlayer}
          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1 group"
        >
          <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900 group-hover:border-zinc-700 transition-colors">
            {track.artwork ? (
              <img
                src={track.artwork}
                alt={track.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-mono text-zinc-500">
                DEKU
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                {track.title}
              </h4>
              {track.format && (
                <span className="text-[10px] font-mono text-zinc-400 border border-zinc-800 px-1 py-0.2 rounded shrink-0">
                  {track.format}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
              <span>{track.artist}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-zinc-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => onToggleFavorite(track.id)}
            className={`p-2 rounded-lg transition-colors ${
              track.isFavorite
                ? 'text-red-500 hover:text-red-400'
                : 'text-zinc-400 hover:text-white'
            }`}
            title={track.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            <Heart className={`w-4 h-4 ${track.isFavorite ? 'fill-red-500' : ''}`} />
          </button>

          <button
            onClick={onOpenEqualizer}
            className="p-2 rounded-lg text-zinc-400 hover:text-white transition-colors hidden sm:block"
            title="Open Equalizer"
            aria-label="Equalizer"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayPause}
            className="w-10 h-10 rounded-xl bg-white text-black hover:bg-zinc-200 active:scale-95 flex items-center justify-center transition-transform shadow-md"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-2 rounded-lg text-zinc-400 hover:text-white active:scale-95 transition-colors"
            title="Next Track"
            aria-label="Next"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenFullPlayer}
            className="p-2 rounded-lg text-zinc-400 hover:text-white transition-colors"
            title="Open Full Player"
            aria-label="Expand Player"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
