import React from 'react';
import { Playlist } from '../types';
import { Button } from '../components/Button';
import { FolderPlus, ListMusic } from 'lucide-react';
import { motion } from 'motion/react';
import { PlaylistCard } from '../components/PlaylistCard';

interface PlaylistsProps {
  playlists: Playlist[];
  setSelectedPlaylist: (playlist: Playlist) => void;
  setIsPlaylistModalOpen: (isOpen: boolean) => void;
}

export const Playlists: React.FC<PlaylistsProps> = ({
  playlists,
  setSelectedPlaylist,
  setIsPlaylistModalOpen
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
       <div className="flex items-center justify-between mb-8 px-1">
          <h2 className="text-3xl font-black text-white tracking-tight">Folders</h2>
          <Button onClick={() => setIsPlaylistModalOpen(true)} className="rounded-2xl h-12 px-6 text-xs font-black uppercase tracking-widest bg-zinc-800 hover:bg-zinc-700 border border-white/5">
             <FolderPlus size={18} className="mr-2"/> New Folder
          </Button>
       </div>
       
       {playlists.length === 0 ? (
         <div className="py-32 text-center bg-zinc-900/30 rounded-[3rem] border border-dashed border-white/5">
            <div className="h-20 w-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-600"><ListMusic size={32} /></div>
            <p className="text-zinc-500 font-bold">No folders yet. Create one to organize your beats.</p>
         </div>
       ) : (
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
           {playlists.map((p, i) => (
             <PlaylistCard 
               key={p.id} 
               playlist={p} 
               index={i}
               onClick={() => setSelectedPlaylist(p)}
             />
           ))}
         </div>
       )}
    </motion.div>
  );
};
