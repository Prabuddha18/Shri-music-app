/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  FolderTree,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, generateAndroidProjectZip } from '../services/androidProjectGenerator';

export const AndroidCodeExplorer: React.FC = () => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    ANDROID_PROJECT_FILES[0].path
  );
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedFile = ANDROID_PROJECT_FILES.find((f) => f.path === selectedFilePath) || ANDROID_PROJECT_FILES[0];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const zipBlob = await generateAndroidProjectZip();
      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'deku-music-android-studio-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to create zip', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full pb-28 pt-4 space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-500 uppercase tracking-widest mb-1">
            <Cpu className="w-4 h-4" />
            <span>Native Android Studio Architecture</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            DEKU Music Native Android Project
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Complete production-ready Kotlin + Jetpack Compose + Media3 ExoPlayer codebase. Includes foreground playback service, lock-screen MediaSession, Room database, and MediaStore local scanner.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black hover:bg-zinc-200 active:scale-95 text-xs font-bold transition-all shadow-xl whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Packing Project...' : 'Download Project (.ZIP)'}</span>
        </button>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: Project File Tree */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 px-2 pb-2 border-b border-zinc-900 uppercase">
            <FolderTree className="w-4 h-4 text-red-500" />
            <span>Project Explorer ({ANDROID_PROJECT_FILES.length} Files)</span>
          </div>

          <div className="space-y-1 max-h-[550px] overflow-y-auto no-scrollbar pt-1">
            {ANDROID_PROJECT_FILES.map((file) => {
              const isSelected = file.path === selectedFilePath;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2 transition-colors ${
                    isSelected
                      ? 'bg-zinc-900 text-white font-semibold border border-zinc-700 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-red-500' : 'text-zinc-600'}`} />
                  <span className="truncate">{file.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-3 bg-zinc-950 border border-zinc-800/80 rounded-3xl overflow-hidden flex flex-col">
          {/* File Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-900/80 border-b border-zinc-800">
            <div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <span>{selectedFile.path}</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {selectedFile.language}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                {selectedFile.description}
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Content */}
          <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto font-mono text-xs text-zinc-300 leading-relaxed bg-black/60">
            <pre>
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* APK Compilation & Android Studio Steps */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800/80 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Terminal className="w-4 h-4 text-red-500" />
          <span>Quick Instructions: Build & Test on Android Device</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-400">
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
            <div className="font-bold text-white mb-1">1. Open in Android Studio</div>
            <p>Download the ZIP, extract it, and select "Open Existing Project" in Android Studio Ladybug or newer. Wait for Gradle sync to complete.</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
            <div className="font-bold text-white mb-1">2. Run on Device</div>
            <p>Connect your Android phone via USB with USB Debugging enabled. Press Shift+F10 (Run) to install and test the offline player directly.</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
            <div className="font-bold text-white mb-1">3. Generate Signed APK</div>
            <p>Go to Build &gt; Generate Signed Bundle / APK. Select Release variant and V1/V2 signatures to create an optimized production APK with ProGuard.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
