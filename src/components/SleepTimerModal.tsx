/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Moon, X, Clock, VolumeX } from 'lucide-react';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingSeconds: number | null;
  onSetTimer: (minutes: number | null, fadeOut: boolean) => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  remainingSeconds,
  onSetTimer,
}) => {
  const [customMinutes, setCustomMinutes] = useState(45);
  const [fadeOut, setFadeOut] = useState(true);

  if (!isOpen) return null;

  const presets = [15, 30, 45, 60, 90];

  const handleSelectPreset = (mins: number) => {
    onSetTimer(mins, fadeOut);
    onClose();
  };

  const handleCancel = () => {
    onSetTimer(null, false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-950/50 border border-red-800/40 text-red-500">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sleep Timer</h3>
              <p className="text-[11px] font-mono text-zinc-400">
                AUTOMATIC SHUTOFF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Countdown */}
        {remainingSeconds !== null && remainingSeconds > 0 && (
          <div className="mt-4 p-4 rounded-2xl bg-red-950/30 border border-red-800/40 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-red-400">
                Active Timer Running
              </div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums mt-0.5">
                {formatRemaining(remainingSeconds)}
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 bg-red-950/80 hover:bg-red-900/80 border border-red-800/60"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Presets */}
        <div className="mt-5">
          <div className="text-xs font-mono text-zinc-400 mb-2 uppercase tracking-wider">
            Quick Timer Presets
          </div>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((mins) => (
              <button
                key={mins}
                onClick={() => handleSelectPreset(mins)}
                className="py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-xs font-semibold text-white transition-colors"
              >
                {mins} min
              </button>
            ))}
            <button
              onClick={() => handleSelectPreset(customMinutes)}
              className="py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-xs font-semibold text-white transition-colors"
            >
              Custom
            </button>
          </div>
        </div>

        {/* Custom Slider */}
        <div className="mt-5 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex justify-between items-center text-xs text-white mb-2 font-medium">
            <span>Custom Duration</span>
            <span className="font-mono text-red-400 font-bold">{customMinutes} minutes</span>
          </div>
          <input
            type="range"
            min={5}
            max={180}
            step={5}
            value={customMinutes}
            onChange={(e) => setCustomMinutes(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-zinc-800 rounded accent-red-600"
          />
        </div>

        {/* Gradual Fade Out Option */}
        <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-zinc-900/30 border border-zinc-800/80">
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 text-zinc-400" />
            <div>
              <div className="text-xs font-semibold text-white">Gradual Volume Fade-Out</div>
              <div className="text-[10px] text-zinc-500">Gently lowers sound before stop</div>
            </div>
          </div>
          <button
            onClick={() => setFadeOut(!fadeOut)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
              fadeOut ? 'bg-red-600' : 'bg-zinc-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                fadeOut ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          <button
            onClick={() => handleSelectPreset(customMinutes)}
            className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-lg"
          >
            Start Sleep Timer ({customMinutes} min)
          </button>
        </div>
      </div>
    </div>
  );
};

function formatRemaining(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
