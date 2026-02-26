import React from 'react';
import { Track } from '../types';
import { TrackCard } from '../components/TrackCard';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface HomeProps {
  recentlyPlayed: Track[];
  recommendedTracks: Track[];
  trendingTracks: Track[];
  playTrack: (track: Track) => void;
  setCart: (tracks: Track[]) => void;
  setIsPaymentModalOpen: (isOpen: boolean) => void;
  handleDownload: (track: Track) => void;
  setTrackToAddToPlaylist: (track: Track) => void;
  setIsAddToPlaylistModalOpen: (isOpen: boolean) => void;
}

const SectionHeader = ({ title, onViewAll }: { title: string; onViewAll?: () => void }) => (
  <div className="flex items-center justify-between mb-4 px-1">
    <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
    {onViewAll && (
      <button onClick={onViewAll} className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-wider flex items-center gap-1 transition-colors">
        View All <ChevronRight size={14} />
      </button>
    )}
  </div>
);

export const Home: React.FC<HomeProps> = ({
  recentlyPlayed,
  recommendedTracks,
  trendingTracks,
  playTrack,
  setCart,
  setIsPaymentModalOpen,
  handleDownload,
  setTrackToAddToPlaylist,
  setIsAddToPlaylistModalOpen,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-32 space-y-10"
    >
      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section>
          <SectionHeader title="Recently Played" />
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
            {recentlyPlayed.map((track) => (
              <div key={track.id} className="snap-start shrink-0 w-40">
                <TrackCard
                  track={track}
                  isOwned={false}
                  onPlay={() => playTrack(track)}
                  onBuy={() => { setCart([track]); setIsPaymentModalOpen(true); }}
                  onDownload={() => handleDownload(track)}
                  onAddToPlaylist={() => { setTrackToAddToPlaylist(track); setIsAddToPlaylistModalOpen(true); }}
                  compact
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended for You */}
      <section>
        <SectionHeader title="Recommended for You" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommendedTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isOwned={false}
              onPlay={() => playTrack(track)}
              onBuy={() => { setCart([track]); setIsPaymentModalOpen(true); }}
              onDownload={() => handleDownload(track)}
              onAddToPlaylist={() => { setTrackToAddToPlaylist(track); setIsAddToPlaylistModalOpen(true); }}
            />
          ))}
        </div>
      </section>

      {/* Trending Songs */}
      <section>
        <SectionHeader title="Trending Songs" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trendingTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isOwned={false}
              onPlay={() => playTrack(track)}
              onBuy={() => { setCart([track]); setIsPaymentModalOpen(true); }}
              onDownload={() => handleDownload(track)}
              onAddToPlaylist={() => { setTrackToAddToPlaylist(track); setIsAddToPlaylistModalOpen(true); }}
            />
          ))}
        </div>
      </section>
    </motion.div>
  );
};
