/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Track } from '../types/music';

// Helper to encode PCM audio buffer into a valid WAV Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * blockAlign;
  const wavBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(wavBuffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + length, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, length, true);

  // Write interleaved PCM samples
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      // Convert to 16-bit signed integer
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Generate SVG Album Art with Nothing OS dot-matrix and modern geometric aesthetics
export function createSvgAlbumArt(title: string, artist: string, style: 'matrix' | 'pixel' | 'lofi' | 'synth' | 'ambient' | 'acoustic'): string {
  const primaryColors: Record<string, { bg: string; accent: string; pattern: string }> = {
    matrix: { bg: '#09090b', accent: '#d71920', pattern: 'circle' },
    pixel: { bg: '#121214', accent: '#ffffff', pattern: 'square' },
    lofi: { bg: '#18181b', accent: '#e2e8f0', pattern: 'wave' },
    synth: { bg: '#050505', accent: '#d71920', pattern: 'grid' },
    ambient: { bg: '#111317', accent: '#94a3b8', pattern: 'circle' },
    acoustic: { bg: '#1c1917', accent: '#fafaf9', pattern: 'rings' },
  };

  const c = primaryColors[style] || primaryColors.matrix;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="${c.bg}"/>
    <defs>
      <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.2" fill="${c.accent}" opacity="0.25" />
      </pattern>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c.accent}" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.9" />
      </linearGradient>
    </defs>
    
    <rect width="400" height="400" fill="url(#dotGrid)"/>
    
    <!-- Central Geometric Motif -->
    <g transform="translate(200, 180)">
      <circle r="90" fill="none" stroke="${c.accent}" stroke-width="2" opacity="0.4" stroke-dasharray="4,6" />
      <circle r="70" fill="none" stroke="${c.accent}" stroke-width="1.5" opacity="0.6" />
      <circle r="45" fill="${c.accent}" opacity="0.15" />
      <circle r="12" fill="${c.accent}" />
      <rect x="-35" y="-35" width="70" height="70" fill="none" stroke="${c.accent}" stroke-width="1" transform="rotate(45)" opacity="0.5"/>
    </g>

    <!-- Bottom Typography (Nothing Style) -->
    <g transform="translate(32, 330)">
      <text x="0" y="0" font-family="-apple-system, Outfit, sans-serif" font-weight="700" font-size="20" fill="#ffffff" letter-spacing="1.5">${title.toUpperCase()}</text>
      <text x="0" y="24" font-family="-apple-system, Outfit, sans-serif" font-weight="400" font-size="12" fill="#a1a1aa" letter-spacing="3">${artist.toUpperCase()} · DEKU OFFLINE</text>
    </g>
    
    <!-- Top Brand Tag -->
    <g transform="translate(32, 45)">
      <text x="0" y="0" font-family="monospace" font-size="10" fill="${c.accent}" letter-spacing="2">DEKU // AUDIO</text>
      <line x1="120" y1="-4" x2="368" y2="-4" stroke="${c.accent}" stroke-width="0.5" opacity="0.3"/>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Generate melodic offline tracks using synthesized audio
export function generateSampleTracks(): Track[] {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const sampleRate = audioContext.sampleRate || 44100;

  // Track definitions
  const trackDefs = [
    {
      id: 'deku-track-1',
      title: 'Matrix Awakening',
      artist: 'DEKU Sound Lab',
      album: 'Nothing Frequency',
      durationSeconds: 28,
      tempo: 105,
      style: 'matrix' as const,
      format: 'FLAC' as const,
      bitrate: '1411 kbps (Lossless)',
      genre: 'Minimal Glitch',
      year: 2026,
      rootNote: 55, // A1
      melodyNotes: [57, 60, 64, 67, 65, 64, 60, 57],
      lyrics: `[00:00.00] (Subtle dot matrix pulse initializing)
[00:03.50] Signals humming through the silicon veins
[00:08.20] Pure offline sound, no cloud, no chains
[00:13.40] Nothing between the listener and the tone
[00:18.00] Audio engineered directly in the zone
[00:23.50] Crisp frequency, lossless and refined
[00:26.50] DEKU Audio: Sound redefined.`
    },
    {
      id: 'deku-track-2',
      title: 'Neon Horizon',
      artist: 'Kuro Synthetics',
      album: 'Midnight Tokyo',
      durationSeconds: 24,
      tempo: 120,
      style: 'synth' as const,
      format: 'MP3' as const,
      bitrate: '320 kbps',
      genre: 'Synthwave',
      year: 2026,
      rootNote: 48, // C2
      melodyNotes: [60, 63, 67, 70, 68, 67, 63, 60],
      lyrics: `[00:00.00] (Analog bassline kicks in)
[00:04.00] Gliding through the midnight avenue
[00:08.50] Digital dashboard in monochrome hue
[00:13.00] Every beat hits deep in the chest
[00:17.50] Offline clarity, no latency test
[00:21.00] Fast forward into the quiet dawn.`
    },
    {
      id: 'deku-track-3',
      title: 'Pixel Dust Dreams',
      artist: 'Shri Modular',
      album: 'Chiptune Solitude',
      durationSeconds: 22,
      tempo: 130,
      style: 'pixel' as const,
      format: 'WAV' as const,
      bitrate: '1536 kbps',
      genre: 'Chiptune / Lo-Fi',
      year: 2025,
      rootNote: 50, // D2
      melodyNotes: [62, 65, 69, 72, 74, 72, 69, 65],
      lyrics: `[00:00.00] 8-bit echoes dancing on the grid
[00:04.20] Remembering every single thing we did
[00:09.00] Pixelated warmth in a modern frame
[00:14.00] Music without a tracking name
[00:18.50] Pure play, offline freedom.`
    },
    {
      id: 'deku-track-4',
      title: 'Rain on Obsidian',
      artist: 'Aetheria Ensemble',
      album: 'Nordic Echoes',
      durationSeconds: 30,
      tempo: 75,
      style: 'ambient' as const,
      format: 'FLAC' as const,
      bitrate: '920 kbps (Lossless)',
      genre: 'Ambient Piano',
      year: 2026,
      rootNote: 45, // A0
      melodyNotes: [57, 60, 62, 65, 64, 60, 59, 57],
      lyrics: `[00:00.00] (Gentle drops falling on dark basalt stone)
[00:05.00] Soft acoustic chords linger in the space
[00:11.20] An intimate sanctuary of quiet grace
[00:17.00] No notifications, no streaming delay
[00:23.00] Just your music, exactly your way.`
    },
    {
      id: 'deku-track-5',
      title: 'Acoustic Solitude',
      artist: 'Oliver Vance',
      album: 'Local Sessions',
      durationSeconds: 26,
      tempo: 90,
      style: 'acoustic' as const,
      format: 'OGG' as const,
      bitrate: '256 kbps',
      genre: 'Acoustic Guitar',
      year: 2025,
      rootNote: 53, // F2
      melodyNotes: [65, 69, 72, 76, 74, 72, 69, 65],
      lyrics: `[00:00.00] Warm strings resonance
[00:04.00] Strummed beside an open window
[00:09.00] Every frequency breathing naturally
[00:15.00] Equalized to perfection
[00:20.00] The pure acoustic truth.`
    },
    {
      id: 'deku-track-6',
      title: 'Glyph Interface',
      artist: 'DEKU Sound Lab',
      album: 'Nothing Frequency',
      durationSeconds: 25,
      tempo: 112,
      style: 'matrix' as const,
      format: 'AAC' as const,
      bitrate: '320 kbps',
      genre: 'Electro-Acoustic',
      year: 2026,
      rootNote: 52, // E2
      melodyNotes: [64, 67, 71, 74, 72, 71, 67, 64],
      lyrics: `[00:00.00] Dot matrix sync activated
[00:03.80] Red glyph strobe on dark background
[00:08.50] Bass boost engaged at 60 Hertz
[00:13.20] Crisp treble extending to 14k
[00:18.00] Pure hardware-inspired acoustic engineering.`
    }
  ];

  const tracks: Track[] = trackDefs.map((def, trackIndex) => {
    const totalSamples = Math.floor(sampleRate * def.durationSeconds);
    const audioBuffer = audioContext.createBuffer(2, totalSamples, sampleRate);
    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = audioBuffer.getChannelData(1);

    const secondsPerBeat = 60 / def.tempo;
    const samplesPerBeat = Math.floor(sampleRate * secondsPerBeat);

    // Synthesize rich musical composition
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const beatIndex = Math.floor(i / samplesPerBeat);
      const beatProgress = (i % samplesPerBeat) / samplesPerBeat;

      // 1. Bassline (Sine + warm Sub)
      const bassFreq = midiToFreq(def.rootNote + (beatIndex % 4 === 2 ? 5 : beatIndex % 4 === 3 ? 7 : 0));
      const bassEnvelope = Math.exp(-beatProgress * 2.5);
      const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.35 * bassEnvelope;

      // 2. Melodic Arpeggio / Lead
      const melodyNote = def.melodyNotes[(beatIndex * 2 + (beatProgress > 0.5 ? 1 : 0)) % def.melodyNotes.length];
      const melodyFreq = midiToFreq(melodyNote);
      const noteProgress = (beatProgress * 2) % 1;
      const leadEnvelope = Math.exp(-noteProgress * 4.0);
      const lead = (
        Math.sin(2 * Math.PI * melodyFreq * t) * 0.2 +
        Math.sin(2 * Math.PI * melodyFreq * 2 * t) * 0.08
      ) * leadEnvelope;

      // 3. Drum beat (Kick on 1 & 3, Snare/Clap on 2 & 4, subtle hi-hats)
      let drum = 0;
      const beatNum = beatIndex % 4;
      if (beatNum === 0 || beatNum === 2) {
        // Kick: pitch drop sine
        const kickPitch = 120 * Math.exp(-beatProgress * 15) + 40;
        drum += Math.sin(2 * Math.PI * kickPitch * t) * Math.exp(-beatProgress * 6) * 0.45;
      }
      if (beatNum === 1 || beatNum === 3) {
        // Snare / Click: noise burst
        const noise = (Math.random() * 2 - 1) * Math.exp(-beatProgress * 8) * 0.22;
        drum += noise;
      }
      // Hi-hats: 16th notes
      const sixteenthProgress = (beatProgress * 4) % 1;
      const hat = (Math.random() * 2 - 1) * Math.exp(-sixteenthProgress * 25) * 0.06;

      // 4. Ambient Pad Chords (Warm stereo panning)
      const padFreq1 = midiToFreq(def.rootNote + 12);
      const padFreq2 = midiToFreq(def.rootNote + 16);
      const padFreq3 = midiToFreq(def.rootNote + 19);
      const pad = (
        Math.sin(2 * Math.PI * padFreq1 * t) * 0.06 +
        Math.sin(2 * Math.PI * padFreq2 * t) * 0.05 +
        Math.sin(2 * Math.PI * padFreq3 * t) * 0.05
      );

      // Stereo field separation
      const mixedLeft = (bass * 0.9) + (lead * 1.1) + (drum * 0.9) + (hat * 0.8) + (pad * 1.1);
      const mixedRight = (bass * 0.9) + (lead * 0.8) + (drum * 0.9) + (hat * 1.2) + (pad * 0.9);

      // Fade in and out cleanly
      let masterGain = 1.0;
      if (t < 0.8) masterGain = t / 0.8;
      if (t > def.durationSeconds - 1.2) masterGain = Math.max(0, (def.durationSeconds - t) / 1.2);

      leftChannel[i] = mixedLeft * masterGain * 0.7;
      rightChannel[i] = mixedRight * masterGain * 0.7;
    }

    const wavBlob = audioBufferToWav(audioBuffer);
    const blobUrl = URL.createObjectURL(wavBlob);
    const artwork = createSvgAlbumArt(def.title, def.artist, def.style);

    return {
      id: def.id,
      title: def.title,
      artist: def.artist,
      album: def.album,
      duration: def.durationSeconds,
      url: blobUrl,
      artwork,
      year: def.year,
      genre: def.genre,
      trackNumber: trackIndex + 1,
      bitrate: def.bitrate,
      format: def.format,
      sizeBytes: wavBlob.size,
      dateAdded: Date.now() - (trackIndex * 86400000 * 2),
      folderPath: '/Internal Storage/Music/DEKU Master',
      isFavorite: trackIndex === 0 || trackIndex === 1,
      lyrics: def.lyrics,
      sampleRate
    };
  });

  return tracks;
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
