import React, { useState } from 'react';
import { Track, Playlist, User } from '../types';
import { Button } from './Button';
import { X, Folder, ChevronRight, Plus } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  playlists: Playlist[];
  setPlaylists: (playlists: Playlist[]) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose, user, playlists, setPlaylists }) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');

  if (!isOpen) return null;

  const handleCreatePlaylist = async () => {
    if (!user || !newPlaylistName) return;
    const { data } = await supabase.from('playlists').insert({ user_id: user.id, name: newPlaylistName }).select().single();
    if (data) {
      setPlaylists([...playlists, { id: data.id, name: data.name, trackIds: [] }]);
      setNewPlaylistName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
       <div className="bg-zinc-900 w-full max-w-md p-8 rounded-[2rem] border border-white/10 shadow-2xl relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24} /></button>
          <h2 className="text-2xl font-black text-white mb-6">New Folder</h2>
          <input autoFocus value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} placeholder="Folder Name (e.g. My Favorites)" className="w-full bg-zinc-800 border-none rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-violet-500 mb-6 placeholder:text-zinc-600" />
          <Button onClick={handleCreatePlaylist} className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs">Create Folder</Button>
       </div>
    </div>
  );
};

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  playlists: Playlist[];
  setPlaylists: (playlists: Playlist[]) => void;
  openCreateModal: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ isOpen, onClose, track, playlists, setPlaylists, openCreateModal }) => {
  if (!isOpen || !track) return null;

  const handleAddTrackToPlaylist = async (playlistId: string) => {
    if (!track) return;
    const { error } = await supabase.from('playlist_tracks').insert({ playlist_id: playlistId, track_id: track.id });
    if (!error) {
      setPlaylists(playlists.map(p => p.id === playlistId ? { ...p, trackIds: [...p.trackIds, track.id] } : p));
      onClose();
      alert("Track added to folder!");
    } else {
      alert("Track already in this folder or error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
       <div className="bg-zinc-900 w-full max-w-md p-8 rounded-[2rem] border border-white/10 shadow-2xl relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24} /></button>
          <h2 className="text-2xl font-black text-white mb-4">Add to Folder</h2>
          <p className="text-zinc-500 text-xs mb-6">Select a folder to add <span className="text-white font-bold">{track.title}</span> to.</p>
          <div className="space-y-2 max-h-64 overflow-y-auto mb-6 pr-2">
             {playlists.length > 0 ? playlists.map(p => (
                <button key={p.id} onClick={() => handleAddTrackToPlaylist(p.id)} className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold transition-colors group">
                   <div className="flex items-center gap-3"><Folder size={18} className="text-violet-400" />{p.name}</div><ChevronRight size={16} className="text-zinc-500 group-hover:text-white" />
                </button>
             )) : <div className="text-center py-4 text-zinc-500 italic text-sm">No folders created yet.</div>}
          </div>
          <Button onClick={() => { onClose(); openCreateModal(); }} variant="ghost" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs border border-white/5"><Plus size={16} className="mr-2" /> Create New Folder</Button>
       </div>
    </div>
  );
};
