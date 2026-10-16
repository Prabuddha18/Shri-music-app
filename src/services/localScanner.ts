/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Track } from '../types/music';
import { createSvgAlbumArt } from './sampleLibrary';

// Helper to extract ID3 tags and album art from File buffer
async function parseId3Metadata(file: File): Promise<{
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
  artwork?: string;
  lyrics?: string;
}> {
  try {
    // Read the first 256KB to inspect ID3v2 header and tags
    const slice = file.slice(0, 256 * 1024);
    const arrayBuffer = await slice.arrayBuffer();
    const data = new DataView(arrayBuffer);

    // Check "ID3" identifier at byte 0
    if (data.getUint8(0) === 0x49 && data.getUint8(1) === 0x44 && data.getUint8(2) === 0x33) {
      const version = data.getUint8(3); // 3 for ID3v2.3, 4 for ID3v2.4
      let offset = 10;
      const meta: { title?: string; artist?: string; album?: string; year?: number; artwork?: string; lyrics?: string } = {};

      while (offset < arrayBuffer.byteLength - 10) {
        // Read 4-character frame ID
        const frameId = String.fromCharCode(
          data.getUint8(offset),
          data.getUint8(offset + 1),
          data.getUint8(offset + 2),
          data.getUint8(offset + 3)
        );

        if (!/^[A-Z0-9]{4}$/.test(frameId)) break;

        // In ID3v2.3: size is standard 32-bit int. In ID3v2.4: synchsafe integer
        let frameSize = 0;
        if (version === 4) {
          frameSize =
            (data.getUint8(offset + 4) << 21) |
            (data.getUint8(offset + 5) << 14) |
            (data.getUint8(offset + 6) << 7) |
            data.getUint8(offset + 7);
        } else {
          frameSize = data.getUint32(offset + 4);
        }

        if (frameSize <= 0 || offset + 10 + frameSize > arrayBuffer.byteLength) break;

        const frameDataOffset = offset + 10;

        // TIT2 = Title
        if (frameId === 'TIT2') {
          meta.title = readStringFrame(data, frameDataOffset, frameSize);
        }
        // TPE1 = Artist / Lead Performer
        else if (frameId === 'TPE1') {
          meta.artist = readStringFrame(data, frameDataOffset, frameSize);
        }
        // TALB = Album
        else if (frameId === 'TALB') {
          meta.album = readStringFrame(data, frameDataOffset, frameSize);
        }
        // TYER / TDRC = Year
        else if (frameId === 'TYER' || frameId === 'TDRC') {
          const yr = parseInt(readStringFrame(data, frameDataOffset, frameSize), 10);
          if (!isNaN(yr)) meta.year = yr;
        }
        // USLT = Lyrics
        else if (frameId === 'USLT') {
          meta.lyrics = readStringFrame(data, frameDataOffset, frameSize);
        }
        // APIC = Attached Picture (Album Art)
        else if (frameId === 'APIC' && !meta.artwork) {
          try {
            const picture = extractApicPicture(data, frameDataOffset, frameSize);
            if (picture) meta.artwork = picture;
          } catch {
            // Ignore corrupted APIC
          }
        }

        offset += 10 + frameSize;
      }

      return meta;
    }
  } catch {
    // Graceful fallback if reading fails
  }

  return {};
}

function readStringFrame(data: DataView, offset: number, size: number): string {
  const encoding = data.getUint8(offset);
  let str = '';

  if (encoding === 0 || encoding === 3) {
    // ISO-8859-1 or UTF-8
    for (let i = 1; i < size; i++) {
      const b = data.getUint8(offset + i);
      if (b === 0) break;
      str += String.fromCharCode(b);
    }
  } else if (encoding === 1 || encoding === 2) {
    // UTF-16
    for (let i = 1; i < size - 1; i += 2) {
      const charCode = data.getUint16(offset + i, true);
      if (charCode === 0) break;
      str += String.fromCharCode(charCode);
    }
  }
  return str.trim();
}

function extractApicPicture(data: DataView, offset: number, size: number): string | null {
  // encoding (1 byte)
  let pos = offset + 1;
  // mime type (null-terminated string)
  let mimeType = '';
  while (pos < offset + size) {
    const b = data.getUint8(pos++);
    if (b === 0) break;
    mimeType += String.fromCharCode(b);
  }
  if (!mimeType) mimeType = 'image/jpeg';

  // picture type (1 byte)
  pos++;

  // description (null terminated)
  while (pos < offset + size) {
    const b = data.getUint8(pos++);
    if (b === 0) break;
  }

  // Remainder is binary image data
  const imgLength = offset + size - pos;
  if (imgLength <= 0) return null;

  const imgBytes = new Uint8Array(data.buffer, pos, imgLength);
  let binary = '';
  for (let i = 0; i < imgBytes.byteLength; i++) {
    binary += String.fromCharCode(imgBytes[i]);
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
}

// Get duration using temporary audio element
async function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.src = url;
    audio.onloadedmetadata = () => {
      resolve(isFinite(audio.duration) ? audio.duration : 180);
    };
    audio.onerror = () => {
      resolve(180); // Default estimate
    };
  });
}

// Determine file format
function getFileFormat(filename: string): 'MP3' | 'FLAC' | 'WAV' | 'AAC' | 'OGG' | 'M4A' {
  const ext = filename.split('.').pop()?.toUpperCase() || '';
  if (ext === 'FLAC') return 'FLAC';
  if (ext === 'WAV') return 'WAV';
  if (ext === 'OGG' || ext === 'OGA') return 'OGG';
  if (ext === 'AAC') return 'AAC';
  if (ext === 'M4A') return 'M4A';
  return 'MP3';
}

export async function processLocalAudioFiles(
  files: FileList | File[],
  onProgress?: (processed: number, total: number, currentName: string) => void
): Promise<Track[]> {
  const audioFiles = Array.from(files).filter((file) => {
    const isAudioType = file.type.startsWith('audio/') || file.type === 'video/ogg';
    const hasAudioExt = /\.(mp3|flac|wav|ogg|m4a|aac|opus|wma|aiff)$/i.test(file.name);
    return isAudioType || hasAudioExt;
  });

  const parsedTracks: Track[] = [];

  for (let index = 0; index < audioFiles.length; index++) {
    const file = audioFiles[index];
    if (onProgress) {
      onProgress(index + 1, audioFiles.length, file.name);
    }

    const objectUrl = URL.createObjectURL(file);
    const duration = await getAudioDuration(objectUrl);
    const metadata = await parseId3Metadata(file);

    // Derive readable title and artist from filename if metadata tags are absent
    let fallbackTitle = file.name.replace(/\.[^/.]+$/, '');
    let fallbackArtist = 'Unknown Artist';
    let fallbackAlbum = 'Unknown Album';

    // Handle common "Artist - Title" filename pattern
    if (fallbackTitle.includes(' - ')) {
      const parts = fallbackTitle.split(' - ');
      fallbackArtist = parts[0].trim();
      fallbackTitle = parts.slice(1).join(' - ').trim();
    }

    const title = metadata.title || fallbackTitle;
    const artist = metadata.artist || fallbackArtist;
    const album = metadata.album || fallbackAlbum;

    // Relative directory folder path from webkitRelativePath
    const relPath = (file as unknown as { webkitRelativePath?: string }).webkitRelativePath || file.name;
    const folderPath = relPath.includes('/')
      ? `/Storage/${relPath.substring(0, relPath.lastIndexOf('/'))}`
      : '/Storage/Music';

    // Generate artistic SVG cover if no embedded image
    const artwork = metadata.artwork || createSvgAlbumArt(title, artist, 'matrix');

    parsedTracks.push({
      id: `local-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 6)}`,
      title,
      artist,
      album,
      duration: Math.round(duration),
      url: objectUrl,
      artwork,
      year: metadata.year || new Date().getFullYear(),
      genre: 'Local Music',
      trackNumber: index + 1,
      bitrate: '320 kbps',
      format: getFileFormat(file.name),
      sizeBytes: file.size,
      dateAdded: Date.now(),
      folderPath,
      isFavorite: false,
      lyrics: metadata.lyrics,
      sampleRate: 44100
    });
  }

  return parsedTracks;
}
