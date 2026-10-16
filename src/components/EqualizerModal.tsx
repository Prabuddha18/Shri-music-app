/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, RotateCcw, Zap, Sliders, Volume2, Gauge } from 'lucide-react';
import { AudioSettings } from '../types/music';
import { EQUALIZER_PRESETS } from '../services/audioEngine';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioSettings;
  onUpdateSettings: (newSettings: AudioSettings) => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const frequencies = ['60 Hz', '230 Hz', '910 Hz', '3.6 kHz', '14 kHz'];

  const handleBandChange = (index: number, value: number) => {
    const newBands = [...settings.bands] as [number, number, number, number, number];
    newBands[index] = value;
    onUpdateSettings({
      ...settings,
      preset: 'Custom',
      bands: newBands,
    });
  };

  const handlePresetChange = (presetName: string) => {
    const found = EQUALIZER_PRESETS.find((p) => p.name === presetName);
    if (found) {
      onUpdateSettings({
        ...settings,
        preset: found.name,
        bands: [...found.bands],
        bassBoost: found.bassBoost,
        treble: found.treble,
      });
    }
  };

  const handleReset = () => {
    handlePresetChange('Flat');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Subtle dot matrix background */}
        <div className="absolute inset-0 bg-dot-matrix-subtle pointer-events-none opacity-40" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-950/50 border border-red-800/40 text-red-500">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                5-Band Hardware Equalizer
              </h3>
              <p className="text-xs font-mono text-zinc-400">
                DEKU // AUDIO EFFECT DSP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors"
              title="Reset to Flat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Master EQ Power Switch */}
        <div className="relative z-10 mt-5 flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Zap className={`w-4 h-4 ${settings.equalizerEnabled ? 'text-red-500' : 'text-zinc-600'}`} />
            <div>
              <div className="text-xs font-semibold text-white">Equalizer Processing</div>
              <div className="text-[11px] font-mono text-zinc-400">
                {settings.equalizerEnabled ? 'ACTIVE DSP' : 'BYPASSED'}
              </div>
            </div>
          </div>
          <button
            onClick={() =>
              onUpdateSettings({ ...settings, equalizerEnabled: !settings.equalizerEnabled })
            }
            className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
              settings.equalizerEnabled ? 'bg-red-600' : 'bg-zinc-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.equalizerEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Presets Segmented Selector */}
        <div className="relative z-10 mt-4">
          <div className="text-xs font-mono text-zinc-400 mb-2 uppercase tracking-wider">
            Audio Presets
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EQUALIZER_PRESETS.map((preset) => {
              const isSelected = settings.preset === preset.name;
              return (
                <button
                  key={preset.name}
                  onClick={() => handlePresetChange(preset.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
            {settings.preset === 'Custom' && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/60 text-red-400 border border-red-800/50">
                Custom
              </span>
            )}
          </div>
        </div>

        {/* 5-Band Vertical Equalizer Sliders */}
        <div className="relative z-10 mt-6 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mb-2">
            <span>+12 dB</span>
            <span>0 dB</span>
            <span>-12 dB</span>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-2 pb-1">
            {settings.bands.map((bandVal, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[11px] font-mono text-zinc-400 tabular-nums font-semibold mb-2">
                  {bandVal > 0 ? `+${bandVal}` : bandVal}dB
                </span>
                <div className="h-32 flex items-center justify-center">
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={bandVal}
                    disabled={!settings.equalizerEnabled}
                    onChange={(e) => handleBandChange(idx, parseInt(e.target.value, 10))}
                    className="vertical-slider accent-red-600 disabled:opacity-30 cursor-pointer"
                  />
                </div>
                <span className="text-[10px] font-mono text-zinc-400 mt-2 text-center whitespace-nowrap">
                  {frequencies[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bass Boost, Treble & Playback Speed Controls */}
        <div className="relative z-10 mt-5 space-y-4">
          {/* Bass Boost */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="flex items-center gap-2 min-w-0">
              <Volume2 className="w-4 h-4 text-red-500 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">Bass Boost (80 Hz LowShelf)</div>
                <div className="text-[10px] font-mono text-zinc-500">Hardware Sub-bass amplifier</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                disabled={!settings.equalizerEnabled}
                value={settings.bassBoost}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    preset: 'Custom',
                    bassBoost: parseInt(e.target.value, 10),
                  })
                }
                className="w-28 accent-red-600 disabled:opacity-30"
              />
              <span className="text-xs font-mono text-white tabular-nums w-8 text-right font-bold">
                {settings.bassBoost}%
              </span>
            </div>
          </div>

          {/* Treble Boost */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="flex items-center gap-2 min-w-0">
              <Sliders className="w-4 h-4 text-zinc-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">Treble (10 kHz HighShelf)</div>
                <div className="text-[10px] font-mono text-zinc-500">High frequency air & clarity</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={-10}
                max={10}
                step={1}
                disabled={!settings.equalizerEnabled}
                value={settings.treble}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    preset: 'Custom',
                    treble: parseInt(e.target.value, 10),
                  })
                }
                className="w-28 accent-red-600 disabled:opacity-30"
              />
              <span className="text-xs font-mono text-white tabular-nums w-8 text-right font-bold">
                {settings.treble > 0 ? `+${settings.treble}` : settings.treble}dB
              </span>
            </div>
          </div>

          {/* Playback Speed */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-zinc-400" />
              <div>
                <div className="text-xs font-semibold text-white">Playback Speed</div>
                <div className="text-[10px] font-mono text-zinc-500">Audio playback rate</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onUpdateSettings({ ...settings, playbackSpeed: speed })}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                    settings.playbackSpeed === speed
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Done Button */}
        <div className="relative z-10 mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-lg"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
