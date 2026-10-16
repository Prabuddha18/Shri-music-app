/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Smartphone, Monitor, FolderSync, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentTab: 'library' | 'playlists' | 'equalizer' | 'settings' | 'android_project';
  onTabChange: (tab: 'library' | 'playlists' | 'equalizer' | 'settings' | 'android_project') => void;
  viewMode: 'android_frame' | 'fullscreen';
  onToggleViewMode: () => void;
  onOpenScanModal: () => void;
  trackCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  viewMode,
  onToggleViewMode,
  onOpenScanModal,
  trackCount,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 md:gap-8 px-4 md:px-8 py-3.5 bg-black/90 backdrop-blur-md border-b border-zinc-800/80">
      {/* Zone 1: Brand Wordmark (Nothing OS Inspired Clean Typography) */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onTabChange('library')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center relative overflow-hidden group-hover:border-red-600 transition-colors">
            {/* Dot-matrix square emblem */}
            <div className="grid grid-cols-2 gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            </div>
          </div>
          <div>
            <div className="text-base font-bold tracking-wider text-white flex items-center gap-2">
              <span>DEKU</span>
              <span className="text-[10px] font-mono tracking-widest text-red-500 font-semibold px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800/40">
                OFFLINE
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400 hidden sm:block">
              {trackCount} tracks · 0% cloud
            </div>
          </div>
        </button>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar text-xs md:text-sm font-medium">
        <button
          onClick={() => onTabChange('library')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            currentTab === 'library'
              ? 'text-white bg-zinc-800/80 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          Library
        </button>

        <button
          onClick={() => onTabChange('playlists')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            currentTab === 'playlists'
              ? 'text-white bg-zinc-800/80 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          Playlists
        </button>

        <button
          onClick={() => onTabChange('equalizer')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            currentTab === 'equalizer'
              ? 'text-white bg-zinc-800/80 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          Equalizer
        </button>

        <button
          onClick={() => onTabChange('settings')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            currentTab === 'settings'
              ? 'text-white bg-zinc-800/80 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          Settings
        </button>

        <button
          onClick={() => onTabChange('android_project')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            currentTab === 'android_project'
              ? 'text-red-400 bg-red-950/40 border border-red-800/50 font-semibold'
              : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-900'
          }`}
        >
          <span>Android Source</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action & Display Mode Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenScanModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 border border-zinc-700/80 hover:bg-zinc-800 hover:border-zinc-600 transition-all active:scale-95 whitespace-nowrap"
          title="Import or Scan Local Audio Files"
        >
          <FolderSync className="w-3.5 h-3.5 text-red-500" />
          <span className="hidden sm:inline">Scan Music</span>
        </button>

        <button
          onClick={onToggleViewMode}
          className="p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
          title={viewMode === 'android_frame' ? 'Switch to Fullscreen Layout' : 'Switch to Android Device Frame'}
        >
          {viewMode === 'android_frame' ? (
            <Monitor className="w-4 h-4 text-zinc-300" />
          ) : (
            <Smartphone className="w-4 h-4 text-red-400" />
          )}
        </button>
      </div>
    </header>
  );
};
