/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, ListMusic, Play, Trash2, Edit2, Music, Check, X } from 'lucide-react';
import { Playlist, Track } from '../types/music';

interface PlaylistsViewProps {
  playlists: Playlist[];
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
  onCreatePlaylist: (name: string, description?: string) => void;
  onDeletePlaylist: (id: string) => void;
  onRenamePlaylist: (id: string, newName: string) => void;
  onRemoveTrackFromPlaylist: (playlistId: string, trackId: string) => void;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  playlists,
  tracks,
  onPlayTrack,
  onCreatePlaylist,
  onDeletePlaylist,
  onRenamePlaylist,
  onRemoveTrackFromPlaylist,
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    playlists[0]?.id || null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  const playlistTracks = selectedPlaylist
    ? selectedPlaylist.trackIds
        .map((id) => tracks.find((t) => t.id === id))
        .filter((t): t is Track => t !== undefined)
    : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setIsCreating(false);
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      onRenamePlaylist(id, editName.trim());
    }
    setEditingId(null);
  };

  const handlePlayAll = () => {
    if (playlistTracks.length > 0) {
      onPlayTrack(playlistTracks[0]);
    }
  };

  return (
    <div className="w-full pb-28 pt-4">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Playlists</h2>
          <p className="text-xs font-mono text-zinc-400 mt-0.5">
            {playlists.length} custom offline collections
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-black bg-white hover:bg-zinc-200 transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* New Playlist Modal Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-4 rounded-2xl bg-zinc-900 border border-zinc-700 animate-in fade-in duration-150"
        >
          <h3 className="text-sm font-semibold text-white mb-2">Create New Playlist</h3>
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="e.g. Night Drive, Workout Beats..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-black border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Playlist Tabs & Selected Playlist Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Playlists List */}
        <div className="space-y-2">
          {playlists.map((pl) => {
            const isSelected = pl.id === selectedPlaylistId;
            return (
              <div
                key={pl.id}
                onClick={() => setSelectedPlaylistId(pl.id)}
                className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-zinc-900 border border-zinc-700 shadow-md'
                    : 'bg-zinc-900/40 border border-zinc-800/80 hover:bg-zinc-900/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-red-950/60 text-red-500 border border-red-800/50' : 'bg-zinc-800 text-zinc-400'}`}>
                    <ListMusic className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    {editingId === pl.id ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-0.5 rounded bg-black border border-zinc-700 text-xs text-white"
                          autoFocus
                        />
                        <button onClick={() => handleSaveRename(pl.id)} className="text-emerald-400 p-1">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-zinc-500 p-1">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm font-semibold text-white truncate">{pl.name}</h4>
                        <p className="text-xs font-mono text-zinc-500">
                          {pl.trackIds.length} tracks
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {!pl.isSmart && (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setEditingId(pl.id);
                        setEditName(pl.name);
                      }}
                      className="p-1.5 rounded text-zinc-500 hover:text-white"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePlaylist(pl.id)}
                      className="p-1.5 rounded text-zinc-500 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Selected Playlist Tracklist */}
        <div className="md:col-span-2 bg-zinc-950 border border-zinc-800/80 rounded-3xl p-5">
          {selectedPlaylist ? (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedPlaylist.name}</h3>
                  <p className="text-xs font-mono text-zinc-500">
                    {playlistTracks.length} tracks · {calculateTotalDuration(playlistTracks)}
                  </p>
                </div>

                <button
                  onClick={handlePlayAll}
                  disabled={playlistTracks.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-black bg-white hover:bg-zinc-200 transition-colors disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Play Sequence</span>
                </button>
              </div>

              {playlistTracks.length > 0 ? (
                <div className="space-y-1">
                  {playlistTracks.map((track, idx) => (
                    <div
                      key={track.id}
                      onClick={() => onPlayTrack(track)}
                      className="group flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-zinc-900 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-zinc-500 w-5 text-center">
                          {idx + 1}
                        </span>
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                          {track.artwork && (
                            <img
                              src={track.artwork}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-semibold text-white truncate group-hover:text-red-400">
                            {track.title}
                          </h5>
                          <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs font-mono text-zinc-500 tabular-nums">
                          {formatTime(track.duration)}
                        </span>
                        <button
                          onClick={() => onRemoveTrackFromPlaylist(selectedPlaylist.id, track.id)}
                          className="p-1.5 rounded text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  <Music className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  This playlist is empty. Add songs from your Music Library.
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500 text-xs">
              Select or create a playlist to view tracks.
            </div>
          )}
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

function calculateTotalDuration(tracks: Track[]): string {
  const total = tracks.reduce((sum, t) => sum + t.duration, 0);
  const mins = Math.floor(total / 60);
  return `${mins} min`;
}
