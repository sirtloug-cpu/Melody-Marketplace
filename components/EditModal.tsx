import React, { useState, useEffect } from 'react';
import { Track, User } from '../types';
import { Button } from './Button';
import { X, Image as ImageIcon } from 'lucide-react';
import { APP_GENRES } from '../constants';
import { supabase } from '../services/supabaseClient';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  user: User | null;
  fetchTracks: () => void;
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, track, user, fetchTracks }) => {
  const [editForm, setEditForm] = useState({ title: '', artist: '', price: '', genre: '' });
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (track) {
      setEditForm({
        title: track.title,
        artist: track.artist,
        price: track.price.toString(),
        genre: track.genre
      });
      setEditCoverFile(null);
    }
  }, [track]);

  if (!isOpen || !track) return null;

  const handleUpdateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!track || !user) return;
    setIsUpdating(true);
    try {
      let coverUrl = track.coverUrl;
      if (editCoverFile) {
        const ts = Date.now();
        const ext = editCoverFile.name.split('.').pop();
        const path = `${user.id}/${ts}_updated.${ext}`;
        const { error: upErr } = await supabase.storage.from('covers').upload(path, editCoverFile, { upsert: true });
        if (upErr) {
          throw new Error(`Upload failed: ${upErr.message}`);
        }
        const { data } = supabase.storage.from('covers').getPublicUrl(path);
        coverUrl = `${data.publicUrl}?t=${ts}`;
      }
      const { error } = await supabase.from('tracks').update({
        title: editForm.title,
        artist: editForm.artist,
        price: parseFloat(editForm.price) || 0,
        genre: editForm.genre,
        cover_url: coverUrl
      }).eq('id', track.id);
      
      if (error) throw error;
      await fetchTracks();
      onClose();
    } catch (err: any) {
      alert(`Failed to update track: ${err.message || 'Unknown error'}.`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
       <div className="bg-zinc-900 w-full max-w-md p-8 rounded-[2rem] border border-white/10 shadow-2xl relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24} /></button>
          <h2 className="text-2xl font-black text-white mb-6">Edit Track</h2>
          <form onSubmit={handleUpdateTrack} className="space-y-4">
             <div className="h-32 bg-zinc-800 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-white/5 cursor-pointer hover:border-violet-500 relative overflow-hidden group">
                <input type="file" accept="image/*" onChange={e => setEditCoverFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                {editCoverFile ? <div className="absolute inset-0 bg-violet-900/50 flex items-center justify-center text-xs font-bold uppercase">New Image</div> : track.coverUrl ? <img src={track.coverUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" /> : null}
                <ImageIcon className="text-zinc-400 mb-2 relative z-0" size={24}/><span className="text-[10px] text-zinc-400 font-black uppercase relative z-0">Change Cover Art</span>
             </div>
             <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Title" className="w-full bg-zinc-800 border-none rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-violet-500 placeholder:text-zinc-600" />
             <input value={editForm.artist} onChange={e => setEditForm({...editForm, artist: e.target.value})} placeholder="Artist Name" className="w-full bg-zinc-800 border-none rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-violet-500 placeholder:text-zinc-600" />
             <div className="grid grid-cols-2 gap-4">
                <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} placeholder="Price" className="w-full bg-zinc-800 border-none rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-violet-500 placeholder:text-zinc-600" />
                <select value={editForm.genre} onChange={e => setEditForm({...editForm, genre: e.target.value})} className="w-full bg-zinc-800 border-none rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-violet-500 appearance-none">
                   <option value="" disabled>Genre</option>{APP_GENRES.map(g => <option key={g} value={g}>{g}</option>)}<option value="Other">Other</option>
                </select>
             </div>
             <Button type="submit" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs" isLoading={isUpdating}>Save Changes</Button>
          </form>
       </div>
    </div>
  );
};
