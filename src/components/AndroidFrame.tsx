/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  enabled: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children, enabled }) => {
  if (!enabled) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex flex-col">
        {children}
      </div>
    );
  }

  // Current real-time clock
  const now = new Date();
  const timeString = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

  return (
    <div className="w-full min-h-screen bg-zinc-950 flex items-center justify-center p-2 sm:p-6 bg-dot-matrix">
      {/* Phone Hardware Mockup Body (Nothing Phone / Pixel Aesthetic) */}
      <div className="relative w-full max-w-[420px] h-[870px] max-h-[96vh] rounded-[48px] bg-black border-[7px] border-zinc-800 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Hardware Antenna Lines & Rim Details */}
        <div className="absolute top-12 left-0 w-1.5 h-10 bg-zinc-800 rounded-r -ml-[7px]" />
        <div className="absolute top-28 left-0 w-1.5 h-14 bg-zinc-800 rounded-r -ml-[7px]" />
        <div className="absolute top-24 right-0 w-1.5 h-16 bg-zinc-800 rounded-l -mr-[7px]" />

        {/* Android Status Bar */}
        <div className="relative z-30 h-10 bg-black/90 px-6 flex items-center justify-between text-[11px] font-mono text-zinc-300 shrink-0">
          <span className="font-bold">{timeString}</span>
          
          {/* Central Camera Punch-Hole */}
          <div className="absolute left-1/2 top-2.5 -translate-x-1/2 w-4 h-4 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
          </div>

          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4 text-zinc-300" />
          </div>
        </div>

        {/* Screen Content Viewport */}
        <div className="relative flex-1 overflow-y-auto no-scrollbar flex flex-col bg-black">
          {children}
        </div>

        {/* Android Gesture Navigation Bar Pill */}
        <div className="h-6 bg-black flex items-center justify-center shrink-0 relative z-30">
          <div className="w-32 h-1 bg-zinc-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
