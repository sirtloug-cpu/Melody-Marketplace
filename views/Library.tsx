import React from 'react';
import { Track, View } from '../types';
import { TrackCard } from '../components/TrackCard';
import { Button } from '../components/Button';
import { Trash2, Library as LibraryIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface LibraryProps {
  library: string[];
  allTracks: Track[];
  playTrack: (track: Track) => void;
  handleDownload: (track: Track) => void;
  setTrackToAddToPlaylist: (track: Track) => void;
  setIsAddToPlaylistModalOpen: (isOpen: boolean) => void;
  handleRemoveFromLibrary: (trackId: string) => void;
  handleClearLibrary: () => void;
  setCurrentView: (view: View) => void;
}

export const Library: React.FC<LibraryProps> = ({
  library,
  allTracks,
  playTrack,
  handleDownload,
  setTrackToAddToPlaylist,
  setIsAddToPlaylistModalOpen,
  handleRemoveFromLibrary,
  handleClearLibrary,
  setCurrentView
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
       <div className="flex items-center justify-between mb-8 px-1">
          <h2 className="text-3xl font-black text-white tracking-tight">Your Collection</h2>
          {library.length > 0 && (
             <Button onClick={handleClearLibrary} className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-none transition-colors">
                <Trash2 size={16} className="mr-2"/> Clear All
             </Button>
          )}
       </div>
       {library.length === 0 ? (
         <div className="py-32 text-center bg-zinc-900/30 rounded-[3rem] border border-dashed border-white/5">
            <div className="h-20 w-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-600"><LibraryIcon size={32}/></div>
            <p className="text-zinc-500 font-bold mb-6">Your crate is empty.</p>
            <Button variant="ghost" onClick={() => setCurrentView(View.MARKETPLACE)} className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-xs border border-white/10">Start Digging</Button>
         </div>
       ) : (
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
           {allTracks.filter(t => library.includes(t.id)).map(t => (
             <TrackCard 
               key={t.id} 
               track={t} 
               isOwned={true} 
               onPlay={() => playTrack(t)} 
               onBuy={() => {}} 
               onDownload={() => handleDownload(t)} 
               onAddToPlaylist={() => { setTrackToAddToPlaylist(t); setIsAddToPlaylistModalOpen(true); }} 
               onRemove={() => handleRemoveFromLibrary(t.id)}
             />
           ))}
         </div>
       )}
    </motion.div>
  );
};
