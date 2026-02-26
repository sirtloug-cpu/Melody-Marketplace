import React, { useState, useMemo } from 'react';
import { Track } from '../types';
import { TrackCard } from './TrackCard';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTracks: Track[];
  playTrack: (track: Track, contextTracks: Track[]) => void;
  onDownload: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  library: string[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  allTracks,
  playTrack,
  onDownload,
  onAddToPlaylist,
  library
}) => {
  const [query, setQuery] = useState('');

  const filteredTracks = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return allTracks.filter(t => 
      t.title.toLowerCase().includes(lowerQuery) || 
      t.artist.toLowerCase().includes(lowerQuery) ||
      t.album?.toLowerCase().includes(lowerQuery)
    );
  }, [query, allTracks]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col"
        >
          <div className="flex items-center gap-4 p-6 border-b border-white/10">
             <Search className="text-zinc-400" size={24} />
             <input 
               autoFocus
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               placeholder="What do you want to listen to?"
               className="flex-1 bg-transparent border-none text-xl font-bold text-white placeholder:text-zinc-500 focus:ring-0"
             />
             <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-full">
                <X size={24} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
             {query.trim() === '' ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                   <p className="font-bold text-lg">Search for artists, songs, or albums</p>
                </div>
             ) : filteredTracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                   <p className="font-bold">No results found for "{query}"</p>
                </div>
             ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                   {filteredTracks.map(t => (
                      <TrackCard 
                        key={t.id} 
                        track={t} 
                        isOwned={library.includes(t.id)} 
                        onPlay={() => playTrack(t, filteredTracks)} 
                        onBuy={() => {}} // Search doesn't support buy directly for now, or add callback
                        onDownload={() => onDownload(t)} 
                        onAddToPlaylist={() => onAddToPlaylist(t)} 
                      />
                   ))}
                </div>
             )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
