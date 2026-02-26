import React from 'react';
import { Track } from '../types';
import { Hero } from '../components/Hero';
import { TrackCard } from '../components/TrackCard';
import { APP_GENRES } from '../constants';
import { ArrowUpDown, Music } from 'lucide-react';
import { motion } from 'motion/react';

interface MarketplaceProps {
  displayedTracks: Track[];
  featuredTrack: Track | null;
  activeGenre: string;
  setActiveGenre: (genre: string) => void;
  sortOrder: 'NEWEST' | 'ASC' | 'DESC';
  setSortOrder: (order: 'NEWEST' | 'ASC' | 'DESC') => void;
  playTrack: (track: Track) => void;
  setCart: (tracks: Track[]) => void;
  setIsPaymentModalOpen: (isOpen: boolean) => void;
  handleDownload: (track: Track) => void;
  setTrackToAddToPlaylist: (track: Track) => void;
  setIsAddToPlaylistModalOpen: (isOpen: boolean) => void;
  tracksListRef: React.RefObject<HTMLDivElement>;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  displayedTracks,
  featuredTrack,
  activeGenre,
  setActiveGenre,
  sortOrder,
  setSortOrder,
  playTrack,
  setCart,
  setIsPaymentModalOpen,
  handleDownload,
  setTrackToAddToPlaylist,
  setIsAddToPlaylistModalOpen,
  tracksListRef
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
       {/* HERO SECTION */}
       <Hero onFindSound={() => tracksListRef.current?.scrollIntoView({ behavior: 'smooth' })} featuredTrack={featuredTrack} />

       {/* Header Title */}
       <h1 ref={tracksListRef} className="text-3xl font-black text-white tracking-tight mb-6 px-1">Fresh Releases</h1>
       
       {/* Sorting/Filter Toolbar */}
       <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide px-1">
          <div className="relative group shrink-0">
              <button 
                onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : sortOrder === 'DESC' ? 'NEWEST' : 'ASC')}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-white/5 text-[10px] font-black uppercase text-zinc-400 hover:text-white transition-colors"
              >
                 <ArrowUpDown size={14} /> 
                 {sortOrder === 'ASC' ? 'A - Z' : sortOrder === 'DESC' ? 'Z - A' : sortOrder === 'NEWEST' ? 'Newest' : 'Sort'}
              </button>
          </div>
          {['All', ...APP_GENRES].map(g => (
             <button key={g} onClick={() => setActiveGenre(g)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-all border ${activeGenre === g ? 'bg-violet-600 border-violet-500 text-white shadow-lg' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white hover:border-white/20'}`}>{g}</button>
          ))}
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
          {displayedTracks.length > 0 ? (
            displayedTracks.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <TrackCard 
                  track={t} 
                  isOwned={false} 
                  onPlay={() => playTrack(t)} 
                  onBuy={() => { setCart([t]); setIsPaymentModalOpen(true); }} 
                  onDownload={() => handleDownload(t)} 
                  onAddToPlaylist={() => { setTrackToAddToPlaylist(t); setIsAddToPlaylistModalOpen(true); }}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-zinc-500 border border-dashed border-white/5 rounded-[2.5rem] bg-zinc-900/30">
               <Music className="mx-auto mb-4 opacity-50" size={40} />
               <p className="font-bold">No tracks found.</p>
            </div>
          )}
       </div>
    </motion.div>
  );
};
