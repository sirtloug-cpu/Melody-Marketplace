import React from 'react';
import { Track, User, View } from '../types';
import { TrackCard } from '../components/TrackCard';
import { Button } from '../components/Button';
import { UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';

interface ArtistDashboardProps {
  allTracks: Track[];
  user: User | null;
  handleEditClick: (track: Track) => void;
  handleDeleteTrack: (trackId: string) => void;
  playTrack: (track: Track) => void;
  handleDownload: (track: Track) => void;
  setTrackToAddToPlaylist: (track: Track) => void;
  setIsAddToPlaylistModalOpen: (isOpen: boolean) => void;
  setCurrentView: (view: View) => void;
}

export const ArtistDashboard: React.FC<ArtistDashboardProps> = ({
  allTracks,
  user,
  handleEditClick,
  handleDeleteTrack,
  playTrack,
  handleDownload,
  setTrackToAddToPlaylist,
  setIsAddToPlaylistModalOpen,
  setCurrentView
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
       <div className="flex items-center justify-between px-1">
          <h2 className="text-3xl font-black text-white tracking-tight">Dashboard</h2>
          <div className="flex gap-4">
             <Button onClick={() => setCurrentView(View.UPLOADS)} className="rounded-2xl h-12 px-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-violet-900/20">
                <UploadCloud size={18} className="mr-2"/> Post Track
             </Button>
          </div>
       </div>

       <div className="space-y-4">
          <h4 className="text-xl font-black text-white tracking-tight px-1">Your Uploads</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allTracks.filter(t => t.artistId === user?.id).map(t => (
               <TrackCard 
                  key={t.id} 
                  track={t} 
                  isOwned={false} 
                  isArtistOwner={true} 
                  onEdit={() => handleEditClick(t)} 
                  onDelete={() => handleDeleteTrack(t.id)} 
                  onPlay={() => playTrack(t)} 
                  onBuy={() => {}} 
                  onDownload={() => handleDownload(t)} 
                  onAddToPlaylist={() => { setTrackToAddToPlaylist(t); setIsAddToPlaylistModalOpen(true); }} 
               />
            ))}
          </div>
       </div>
    </motion.div>
  );
};
