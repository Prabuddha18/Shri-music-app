/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Upload,
  FolderOpen,
  Music,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileAudio,
} from 'lucide-react';
import { processLocalAudioFiles } from '../services/localScanner';
import { Track } from '../types/music';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTracks: (newTracks: Track[]) => void;
  onLoadSampleLibrary: () => void;
}

export const ScanModal: React.FC<ScanModalProps> = ({
  isOpen,
  onClose,
  onAddTracks,
  onLoadSampleLibrary,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setProgressText('Extracting metadata and embedded album artwork...');

    try {
      const tracks = await processLocalAudioFiles(files, (current, total, name) => {
        setProgressText(`Processing (${current}/${total}): ${name}`);
      });

      if (tracks.length > 0) {
        onAddTracks(tracks);
        onClose();
      } else {
        alert('No valid audio files found in selected item. Supported formats: MP3, FLAC, WAV, AAC, OGG, M4A.');
      }
    } catch (err) {
      console.error('Error processing files', err);
      alert('Error scanning audio files.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-950/50 border border-red-800/40 text-red-500">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Scan Device Music</h3>
              <p className="text-xs font-mono text-zinc-400">
                100% OFFLINE LOCAL MEDIA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Processing State */}
        {isProcessing ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-red-600 border-t-transparent animate-spin mx-auto" />
            <h4 className="text-sm font-semibold text-white">Scanning Audio Files</h4>
            <p className="text-xs font-mono text-zinc-400 max-w-xs mx-auto truncate">
              {progressText}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`p-8 text-center rounded-2xl border-2 border-dashed transition-all ${
                isDragging
                  ? 'border-red-500 bg-red-950/20'
                  : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
              }`}
            >
              <FileAudio className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <div className="text-sm font-semibold text-white">
                Drag & Drop Music Files Here
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Supports MP3, FLAC (Lossless), WAV, AAC, OGG, and M4A
              </p>
            </div>

            {/* Hidden native inputs */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="audio/*,.mp3,.flac,.wav,.ogg,.m4a,.aac,.opus"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />
            <input
              type="file"
              ref={folderInputRef}
              multiple
              {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-xs font-semibold text-white transition-colors"
              >
                <Music className="w-4 h-4 text-red-500" />
                <span>Select Audio Files</span>
              </button>

              <button
                onClick={() => folderInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-xs font-semibold text-white transition-colors"
              >
                <FolderOpen className="w-4 h-4 text-red-500" />
                <span>Scan Entire Folder</span>
              </button>
            </div>

            {/* Offline Sample Library Button */}
            <div className="pt-2 border-t border-zinc-900">
              <button
                onClick={() => {
                  onLoadSampleLibrary();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/40 border border-red-800/40 hover:bg-red-900/40 text-red-300 text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-4 h-4 text-red-400" />
                <span>Load Sample Offline Library (6 Melodic Tracks)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
