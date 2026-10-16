/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  FolderSync,
  Heart,
  MoreVertical,
  Play,
  Music,
  Disc,
  Mic2,
  Folder,
  Clock,
  ArrowUpDown,
  Upload,
  Plus,
} from 'lucide-react';
import { Track, Playlist } from '../types/music';

interface LibraryViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  onOpenScanModal: () => void;
  onRefreshLibrary: () => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, trackId: string) => void;
  onCreatePlaylistWithTrack: (trackId: string) => void;
}

type LibraryTab = 'songs' | 'albums' | 'artists' | 'folders' | 'favorites' | 'history';
type SortOption = 'title' | 'artist' | 'duration' | 'date' | 'album';

export const LibraryView: React.FC<LibraryViewProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onToggleFavorite,
  onOpenScanModal,
  onRefreshLibrary,
  playlists,
  onAddToPlaylist,
  onCreatePlaylistWithTrack,
}) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('songs');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [menuOpenTrackId, setMenuOpenTrackId] = useState<string | null>(null);

  // Filtered tracks based on search
  const filteredTracks = useMemo(() => {
    let list = [...tracks];

    // Tab filter
    if (activeTab === 'favorites') {
      list = list.filter((t) => t.isFavorite);
    } else if (activeTab === 'folders' && selectedFolder) {
      list = list.filter((t) => t.folderPath === selectedFolder);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          t.folderPath.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'title') comparison = a.title.localeCompare(b.title);
      else if (sortBy === 'artist') comparison = a.artist.localeCompare(b.artist);
      else if (sortBy === 'album') comparison = a.album.localeCompare(b.album);
      else if (sortBy === 'duration') comparison = a.duration - b.duration;
      else if (sortBy === 'date') comparison = b.dateAdded - a.dateAdded;

      return sortAsc ? comparison : -comparison;
    });

    return list;
  }, [tracks, activeTab, selectedFolder, searchQuery, sortBy, sortAsc]);

  // Aggregate Albums
  const albums = useMemo(() => {
    const map = new Map<string, { title: string; artist: string; count: number; duration: number; artwork?: string }>();
    tracks.forEach((t) => {
      const key = `${t.album}---${t.artist}`;
      if (!map.has(key)) {
        map.set(key, { title: t.album, artist: t.artist, count: 1, duration: t.duration, artwork: t.artwork });
      } else {
        const item = map.get(key)!;
        item.count += 1;
        item.duration += t.duration;
      }
    });
    return Array.from(map.values());
  }, [tracks]);

  // Aggregate Artists
  const artists = useMemo(() => {
    const map = new Map<string, { name: string; count: number; artwork?: string }>();
    tracks.forEach((t) => {
      if (!map.has(t.artist)) {
        map.set(t.artist, { name: t.artist, count: 1, artwork: t.artwork });
      } else {
        map.get(t.artist)!.count += 1;
      }
    });
    return Array.from(map.values());
  }, [tracks]);

  // Aggregate Folders
  const folders = useMemo(() => {
    const map = new Map<string, number>();
    tracks.forEach((t) => {
      map.set(t.folderPath, (map.get(t.folderPath) || 0) + 1);
    });
    return Array.from(map.entries()).map(([path, count]) => ({ path, count }));
  }, [tracks]);

  return (
    <div className="w-full pb-28 pt-4">
      {/* Top Search & Scan Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists, albums, or local folders..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 hover:text-white"
            >
              CLEAR
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="title" className="bg-zinc-900">Title</option>
              <option value="artist" className="bg-zinc-900">Artist</option>
              <option value="album" className="bg-zinc-900">Album</option>
              <option value="duration" className="bg-zinc-900">Duration</option>
              <option value="date" className="bg-zinc-900">Recently Added</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="ml-1 text-[10px] font-mono font-bold text-red-500"
              title="Toggle sort direction"
            >
              {sortAsc ? 'ASC' : 'DESC'}
            </button>
          </div>

          {/* Rescan Button */}
          <button
            onClick={onRefreshLibrary}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors"
            title="Rescan Local Library"
          >
            <FolderSync className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Library Tabs (Segmented Control) */}
      <div className="flex items-center gap-1 p-1 mb-6 bg-zinc-900/70 border border-zinc-800/80 rounded-xl overflow-x-auto no-scrollbar">
        {[
          { id: 'songs', label: 'All Songs', icon: Music, count: tracks.length },
          { id: 'albums', label: 'Albums', icon: Disc, count: albums.length },
          { id: 'artists', label: 'Artists', icon: Mic2, count: artists.length },
          { id: 'folders', label: 'Folders', icon: Folder, count: folders.length },
          { id: 'favorites', label: 'Favorites', icon: Heart, count: tracks.filter((t) => t.isFavorite).length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as LibraryTab);
                setSelectedFolder(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-500' : ''}`} />
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono text-zinc-500 tabular-nums">
                ({tab.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Rendering based on Tab */}
      {activeTab === 'songs' || activeTab === 'favorites' ? (
        <div className="space-y-1">
          {filteredTracks.length > 0 ? (
            filteredTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  className={`group relative flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-zinc-900/90 border border-zinc-700/80'
                      : 'hover:bg-zinc-900/50 border border-transparent'
                  }`}
                  onClick={() => onPlayTrack(track)}
                >
                  {/* Left: Track Index / Playing Indicator & Art */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-6 text-center text-xs font-mono text-zinc-500 shrink-0">
                      {isCurrent && isPlaying ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="w-1 h-3 bg-red-500 animate-pulse" />
                          <span className="w-1 h-4 bg-red-500 animate-pulse delay-75" />
                          <span className="w-1 h-2 bg-red-500 animate-pulse delay-150" />
                        </div>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900">
                      {track.artwork && (
                        <img
                          src={track.artwork}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-semibold truncate ${
                            isCurrent ? 'text-red-500' : 'text-white group-hover:text-zinc-200'
                          }`}
                        >
                          {track.title}
                        </h4>
                        {track.format && (
                          <span className="text-[9px] font-mono text-zinc-500 border border-zinc-800 px-1 py-0.2 rounded shrink-0">
                            {track.format}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
                        <span>{track.artist}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{track.album}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Duration, Favorite, & More Menu */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-zinc-500 tabular-nums hidden sm:block">
                      {formatTime(track.duration)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(track.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        track.isFavorite
                          ? 'text-red-500 hover:text-red-400'
                          : 'text-zinc-500 hover:text-white'
                      }`}
                      title={track.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                    >
                      <Heart className={`w-4 h-4 ${track.isFavorite ? 'fill-red-500' : ''}`} />
                    </button>

                    {/* Dropdown Menu for Playlists */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenTrackId(menuOpenTrackId === track.id ? null : track.id);
                        }}
                        className="p-2 rounded-lg text-zinc-500 hover:text-white transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {menuOpenTrackId === track.id && (
                        <div
                          className="absolute right-0 top-full mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-20 py-1.5 text-xs text-zinc-300 animate-in fade-in zoom-in-95 duration-150"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-3 py-1 font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                            Add to Playlist
                          </div>
                          {playlists.map((pl) => (
                            <button
                              key={pl.id}
                              onClick={() => {
                                onAddToPlaylist(pl.id, track.id);
                                setMenuOpenTrackId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 hover:text-white flex items-center justify-between truncate"
                            >
                              <span className="truncate">{pl.name}</span>
                              <Plus className="w-3 h-3 text-zinc-500" />
                            </button>
                          ))}
                          <div className="border-t border-zinc-800 my-1" />
                          <button
                            onClick={() => {
                              onCreatePlaylistWithTrack(track.id);
                              setMenuOpenTrackId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 text-red-400 hover:text-red-300 font-medium"
                          >
                            + New Playlist with Song
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyLibraryState onOpenScanModal={onOpenScanModal} />
          )}
        </div>
      ) : null}

      {/* Albums Grid */}
      {activeTab === 'albums' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.map((album, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSearchQuery(album.title);
                setActiveTab('songs');
              }}
              className="group p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all cursor-pointer"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 mb-3 relative">
                {album.artwork && (
                  <img
                    src={album.artwork}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </div>
                </div>
              </div>
              <h4 className="text-sm font-semibold text-white truncate">{album.title}</h4>
              <p className="text-xs text-zinc-400 truncate mt-0.5">{album.artist}</p>
              <p className="text-[11px] font-mono text-zinc-500 mt-1">
                {album.count} {album.count === 1 ? 'track' : 'tracks'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Artists Grid */}
      {activeTab === 'artists' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {artists.map((artist, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSearchQuery(artist.name);
                setActiveTab('songs');
              }}
              className="group p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all cursor-pointer text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-zinc-900 border border-zinc-700 mb-3 relative">
                {artist.artwork && (
                  <img
                    src={artist.artwork}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <h4 className="text-sm font-semibold text-white truncate">{artist.name}</h4>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                {artist.count} {artist.count === 1 ? 'song' : 'songs'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Folders View */}
      {activeTab === 'folders' && (
        <div className="space-y-2">
          {folders.map((folder, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedFolder(folder.path);
                setActiveTab('songs');
              }}
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-zinc-800/80 text-red-500 shrink-0">
                  <Folder className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">{folder.path}</h4>
                  <p className="text-xs font-mono text-zinc-500">
                    {folder.count} audio {folder.count === 1 ? 'file' : 'files'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-400">OPEN</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EmptyLibraryState: React.FC<{ onOpenScanModal: () => void }> = ({ onOpenScanModal }) => (
  <div className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/40 my-6">
    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-red-500">
      <Music className="w-7 h-7" />
    </div>
    <h3 className="text-base font-semibold text-white">No Audio Files Found</h3>
    <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-5">
      DEKU works 100% offline. Scan your phone or computer storage to load your MP3, FLAC, WAV, and AAC music collection.
    </p>
    <button
      onClick={onOpenScanModal}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-black bg-white hover:bg-zinc-200 transition-colors shadow-lg"
    >
      <Upload className="w-4 h-4" />
      <span>Scan Device Storage</span>
    </button>
  </div>
);

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
