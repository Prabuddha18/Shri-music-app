/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Palette,
  Sliders,
  ShieldCheck,
  FolderMinus,
  RefreshCw,
  Trash2,
  Check,
  Info,
  Radio,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';
import { AccentColor, AppTheme, AudioSettings, UserPreferences } from '../types/music';

interface SettingsViewProps {
  preferences: UserPreferences;
  audioSettings: AudioSettings;
  onUpdatePreferences: (pref: Partial<UserPreferences>) => void;
  onUpdateAudioSettings: (audio: Partial<AudioSettings>) => void;
  onRescanLibrary: () => void;
  onClearLibrary: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  audioSettings,
  onUpdatePreferences,
  onUpdateAudioSettings,
  onRescanLibrary,
  onClearLibrary,
}) => {
  const [newExcludedFolder, setNewExcludedFolder] = useState('');
  const [resetConfirmed, setResetConfirmed] = useState(false);

  const handleAddExcludedFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExcludedFolder.trim()) return;
    const current = preferences.excludedFolders || [];
    if (!current.includes(newExcludedFolder.trim())) {
      onUpdatePreferences({
        excludedFolders: [...current, newExcludedFolder.trim()],
      });
    }
    setNewExcludedFolder('');
  };

  const handleRemoveExcludedFolder = (folder: string) => {
    onUpdatePreferences({
      excludedFolders: preferences.excludedFolders.filter((f) => f !== folder),
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto pb-28 pt-4 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-xs font-mono text-zinc-400 mt-0.5">
          DEKU // LOCAL ENGINE PREFERENCES
        </p>
      </div>

      {/* 1. Appearance & Theme */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800/80 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-900">
          <Palette className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-semibold text-white">Visual Design & Theme</h3>
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-2 font-medium">Display Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'amoled', label: 'AMOLED Black', desc: '0% Battery OLED' },
              { id: 'dark', label: 'Charcoal Dark', desc: 'Nothing Minimal' },
              { id: 'light', label: 'Pixel Light', desc: 'High Daylight' },
            ].map((theme) => {
              const isSelected = preferences.theme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onUpdatePreferences({ theme: theme.id as AppTheme })}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-red-600 shadow-md'
                      : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-semibold text-white">{theme.label}</div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{theme.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-2 font-medium">Accent Glyph Color</label>
          <div className="flex gap-2">
            {[
              { id: 'red', name: 'Nothing Red', color: '#d71920' },
              { id: 'white', name: 'Monochrome', color: '#ffffff' },
              { id: 'blue', name: 'Pixel Blue', color: '#4285f4' },
              { id: 'emerald', name: 'Android Mint', color: '#10b981' },
            ].map((acc) => {
              const isSelected = preferences.accentColor === acc.id;
              return (
                <button
                  key={acc.id}
                  onClick={() => onUpdatePreferences({ accentColor: acc.id as AccentColor })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-colors ${
                    isSelected
                      ? 'border-white bg-zinc-900 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: acc.color }}
                  />
                  <span>{acc.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Playback & Audio Engine */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800/80 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-900">
          <SlidersHorizontal className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-semibold text-white">Audio Playback & Transitions</h3>
        </div>

        {/* Gapless Playback */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <div>
            <div className="text-xs font-semibold text-white">Gapless Playback</div>
            <div className="text-[11px] text-zinc-400">
              Eliminate silence between consecutive live and concept album tracks
            </div>
          </div>
          <button
            onClick={() =>
              onUpdateAudioSettings({ gaplessPlayback: !audioSettings.gaplessPlayback })
            }
            className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
              audioSettings.gaplessPlayback ? 'bg-red-600' : 'bg-zinc-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                audioSettings.gaplessPlayback ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Crossfade */}
        <div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="text-xs font-semibold text-white">Track Crossfade</div>
              <div className="text-[11px] text-zinc-400">
                Smoothly fade out previous track while fading in the next track
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-red-500 tabular-nums">
              {audioSettings.crossfadeDuration}s
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={audioSettings.crossfadeDuration}
            onChange={(e) =>
              onUpdateAudioSettings({ crossfadeDuration: parseInt(e.target.value, 10) })
            }
            className="w-full h-1.5 bg-zinc-800 rounded accent-red-600"
          />
        </div>
      </div>

      {/* 3. Local Library & Excluded Folders */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800/80 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-900">
          <FolderMinus className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-semibold text-white">Excluded Storage Folders</h3>
        </div>

        <p className="text-xs text-zinc-400">
          Prevent voice notes, ringtones, WhatsApp media, and podcast recordings from cluttering your music player.
        </p>

        <form onSubmit={handleAddExcludedFolder} className="flex gap-2">
          <input
            type="text"
            value={newExcludedFolder}
            onChange={(e) => setNewExcludedFolder(e.target.value)}
            placeholder="e.g. /WhatsApp/Voice Notes or /Recordings"
            className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700"
          >
            Add
          </button>
        </form>

        <div className="space-y-1.5">
          {preferences.excludedFolders.map((folder, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-300 font-mono"
            >
              <span>{folder}</span>
              <button
                onClick={() => handleRemoveExcludedFolder(folder)}
                className="text-zinc-500 hover:text-red-400 p-1"
                title="Remove exclusion"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2 flex flex-wrap gap-2">
          <button
            onClick={onRescanLibrary}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Force Rescan Library</span>
          </button>

          <button
            onClick={() => {
              if (resetConfirmed) {
                onClearLibrary();
                setResetConfirmed(false);
              } else {
                setResetConfirmed(true);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
              resetConfirmed
                ? 'bg-red-600 text-white'
                : 'bg-zinc-900 text-red-400 border border-red-950 hover:bg-red-950/40'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{resetConfirmed ? 'Confirm Reset All Data?' : 'Clear Storage Cache'}</span>
          </button>
        </div>
      </div>

      {/* 4. Privacy & Offline Integrity Guarantee */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800/80 space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-900 text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-sm font-semibold text-white">Privacy & Offline Guarantee</h3>
        </div>

        <div className="space-y-2 text-xs text-zinc-400 leading-relaxed">
          <p>
            • <strong className="text-zinc-200">Zero Network Permission</strong>: DEKU Music operates with zero internet permissions in the AndroidManifest. No tracking, analytics, ads, or network telemetry exist in the binary.
          </p>
          <p>
            • <strong className="text-zinc-200">100% On-Device Processing</strong>: Your audio tracks, ID3 tags, embedded album art, playlists, and listening history remain strictly on your local device.
          </p>
          <p>
            • <strong className="text-zinc-200">Full Audio Codec Support</strong>: Supports MP3, FLAC (Lossless), WAV (PCM), AAC, OGG Vorbis, and Opus audio formats.
          </p>
        </div>

        <div className="pt-2 text-[11px] font-mono text-zinc-400 border-t border-zinc-900/80 flex items-center justify-between">
          <span>DEKU Music v1.0.0 (Release Build 2026)</span>
          <span>Engine: Media3 ExoPlayer</span>
        </div>
      </div>
    </div>
  );
};
