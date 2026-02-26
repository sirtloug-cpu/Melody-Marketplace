import React, { useState } from 'react';
import { Track } from '../types';
import { Play, Plus, Pencil, Trash2, Download, Wand2, Share2, MessageCircle, UserPlus } from 'lucide-react';
import { LOGO_URL } from '../constants';

interface TrackCardProps {
  track: Track;
  onPlay: () => void;
  onBuy: () => void;
  onDownload: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onAddToPlaylist: () => void;
  onRemove?: () => void;
  isOwned: boolean;
  isArtistOwner?: boolean;
  compact?: boolean;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, onPlay, onBuy, onDownload, onDelete, onEdit, onAddToPlaylist, onRemove, isOwned, isArtistOwner, compact }) => {
  const [isMastered, setIsMastered] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleMasteringPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMastered(!isMastered);
    // In a real app, this would switch the audio source or apply a filter
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSharing) return;
    setIsSharing(true);
    const shareData = {
      title: track.title,
      text: `Check out ${track.title} by ${track.artist} on Melody Marketplace!`,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      // Fallback
      alert("Link copied to clipboard!"); 
      setIsSharing(false);
    }
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
  };

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phoneNumber = "27671252828";
    const message = encodeURIComponent(`Hi, I'm interested in your track "${track.title}" by ${track.artist}.`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div 
      className={`group relative bg-[#181818] hover:bg-[#282828] rounded-md p-4 transition-all duration-300 cursor-pointer ${compact ? 'w-40 p-3' : 'w-full'}`}
      onClick={onPlay}
    >
      {/* Cover Image */}
      <div className="relative aspect-square mb-4 shadow-lg rounded-md overflow-hidden">
        <img 
          src={track.coverUrl || 'https://via.placeholder.com/150'} 
          alt={track.title} 
          className={`w-full h-full object-cover transition-all duration-500 ${isMastered ? 'saturate-150 contrast-125' : ''}`}
        />
        
        {/* AI Mastering Badge/Button */}
        <button 
          onClick={handleMasteringPreview}
          className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-md transition-all z-20 ${isMastered ? 'bg-[#BEE7FF] text-black shadow-[0_0_15px_rgba(190,231,255,0.6)]' : 'bg-black/50 text-white hover:bg-black/70'}`}
          title={isMastered ? "AI Mastered Preview ON" : "AI Mastering Preview"}
        >
          <Wand2 size={14} />
        </button>

        {/* Logo Overlay */}
        <div className="absolute top-2 right-2 z-30 w-5 h-5 rounded-full overflow-hidden border border-white/20 shadow-md bg-white">
           <img 
             src={LOGO_URL} 
             alt="Logo" 
             className="w-full h-full object-cover" 
             referrerPolicy="no-referrer"
           />
        </div>

        {/* Social Actions (Top Right - Moved down) */}
        <div className="absolute top-12 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
           <button onClick={handleShare} className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md" title="Share">
             <Share2 size={14} />
           </button>
           {!isArtistOwner && (
             <>
               <button onClick={handleFollow} className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${isFollowing ? 'bg-[#BEE7FF] text-black' : 'bg-black/50 text-white hover:bg-black/70'}`} title="Follow Artist">
                 <UserPlus size={14} />
               </button>
               <button onClick={handleChat} className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md" title="Message Seller">
                 <MessageCircle size={14} />
               </button>
             </>
           )}
        </div>
        
        {/* Spotify-style Play Button */}
        <div className="absolute bottom-2 right-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-xl z-10">
           <button 
             onClick={(e) => { e.stopPropagation(); onPlay(); }}
             className="h-12 w-12 bg-[#BEE7FF] text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
           >
              <Play size={24} fill="currentColor" className="ml-1" />
           </button>
        </div>
      </div>

      {/* Info */}
      <div className="min-h-[50px]">
         <h3 className="font-bold text-white truncate text-base mb-1">{track.title}</h3>
         <p className="text-[#b3b3b3] text-sm truncate">{track.artist}</p>
      </div>
      
      {/* Actions */}
      <div className="mt-1 flex items-center justify-between" onClick={e => e.stopPropagation()}>
         {isArtistOwner ? (
             <div className="flex gap-2">
                <button onClick={onEdit} className="text-[#b3b3b3] hover:text-white"><Pencil size={16}/></button>
                <button onClick={onDelete} className="text-[#b3b3b3] hover:text-red-500"><Trash2 size={16}/></button>
             </div>
         ) : isOwned ? (
             <button onClick={onDownload} className="text-[#BEE7FF] hover:text-[#A0D8FF] text-xs font-bold flex items-center gap-1">
                <Download size={14} /> Saved
             </button>
         ) : (
            <button 
                onClick={onBuy}
                className="text-xs font-black text-black bg-[#BEE7FF] px-3 py-1.5 rounded-full hover:bg-[#A0D8FF] hover:scale-105 transition-all shadow-lg shadow-[#BEE7FF]/20"
            >
                R{track.price}
            </button>
         )}
         
         <button onClick={onAddToPlaylist} className="text-[#b3b3b3] hover:text-white transition-colors">
            <Plus size={20} />
         </button>
      </div>
    </div>
  );
};
