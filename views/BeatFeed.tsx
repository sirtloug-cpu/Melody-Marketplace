import React, { useEffect, useRef, useState } from 'react';
import { Track, User } from '../types';
import { Heart, MessageCircle, Share2, MoreHorizontal, Disc, Play, Pause, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Comments } from '../components/Comments';

interface BeatFeedProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
  onPause: () => void;
  onToggleLike: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;
  onAddToCart: (track: Track) => void;
  user: User | null;
}

const CheckBadge = () => (
  <svg className="w-4 h-4 text-[#BEE7FF]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

interface BeatSlideProps {
  track: Track;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onToggleLike: () => void;
  isLiked: boolean;
  onAddToCart: () => void;
  user: User | null;
}

const BeatSlide: React.FC<BeatSlideProps> = ({ 
  track, 
  isActive, 
  isPlaying, 
  onPlay, 
  onPause, 
  onToggleLike, 
  isLiked, 
  onAddToCart,
  user
}) => {
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const handleLike = () => {
    onToggleLike();
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 1000);
  };

  const handleShare = async () => {
    const shareData = {
      title: track.title,
      text: `Check out ${track.title} by ${track.artist} on Melody Marketplace!`,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Ignore abort errors
      }
    } else {
      alert("Link copied to clipboard!");
    }
  };

  const handleComment = () => {
    setShowComments(true);
  };

  const handleMore = () => {
    setShowMore(true);
  };

  return (
    <div className="w-full h-full snap-start relative flex items-center justify-center bg-black shrink-0 overflow-hidden">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover opacity-30 blur-2xl scale-125" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md h-full flex flex-col justify-end pb-36 px-4 md:pb-32 mx-auto">
        
        {/* Center Album Art (Vinyl Style) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-32 md:pb-40">
           <div 
             className={`w-56 h-56 md:w-80 md:h-80 rounded-full border-4 border-zinc-800/50 shadow-2xl overflow-hidden relative transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-50 scale-90'}`}
           >
              <div 
                className="w-full h-full animate-[spin_8s_linear_infinite]"
                style={{ animationPlayState: isActive && isPlaying ? 'running' : 'paused' }}
              >
                <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-900 rounded-full border-4 border-zinc-800 shadow-inner" />
              </div>
           </div>
        </div>

        {/* Right Side Actions */}
        <div className="absolute right-2 bottom-40 md:bottom-36 flex flex-col items-center gap-4 md:gap-5 z-20">
          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={handleLike}
              className="w-10 h-10 md:w-12 md:h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center transition-transform active:scale-90 border border-white/10"
            >
              <Heart size={20} className={isLiked ? "fill-[#BEE7FF] text-[#BEE7FF]" : "text-white"} />
            </button>
            <span className="text-[9px] md:text-[10px] font-bold text-white drop-shadow-md">Like</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={handleComment}
              className="w-10 h-10 md:w-12 md:h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center transition-transform active:scale-90 border border-white/10"
            >
              <MessageCircle size={20} className="text-white" />
            </button>
            <span className="text-[9px] md:text-[10px] font-bold text-white drop-shadow-md">Comment</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={handleShare}
              className="w-10 h-10 md:w-12 md:h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center transition-transform active:scale-90 border border-white/10"
            >
              <Share2 size={20} className="text-white" />
            </button>
            <span className="text-[9px] md:text-[10px] font-bold text-white drop-shadow-md">Share</span>
          </div>

          <div className="flex flex-col items-center gap-1">
             <button 
               onClick={handleMore}
               className="w-10 h-10 md:w-12 md:h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center transition-transform active:scale-90 border border-white/10"
             >
                <MoreHorizontal size={20} className="text-white" />
             </button>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="flex flex-col gap-2 md:gap-3 max-w-[80%] md:max-w-[85%] mb-2 relative z-20">
          <div className="flex items-center gap-2 mb-1">
             <div className="px-2 py-1 bg-white/10 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                {track.genre}
             </div>
             <div className="px-2 py-1 bg-[#BEE7FF] text-black rounded-md text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(190,231,255,0.4)]">
                R{track.price}
             </div>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white leading-tight drop-shadow-lg line-clamp-2">{track.title}</h2>
          <h3 className="text-base md:text-lg font-bold text-zinc-200 drop-shadow-md flex items-center gap-2">
            <span className="truncate">{track.artist}</span>
            <CheckBadge />
          </h3>

          <div className="flex items-center gap-2 mt-1 md:mt-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 md:py-2 rounded-full w-fit border border-white/5">
             <Disc size={14} className={`text-zinc-300 md:w-4 md:h-4 ${isActive && isPlaying ? 'animate-spin' : ''}`} />
             <div className="text-[10px] md:text-xs text-zinc-300 font-medium truncate max-w-[120px] md:max-w-[150px]">
                Original Audio - {track.artist}
             </div>
          </div>
          
          <div className="flex gap-2 md:gap-3 mt-2 md:mt-4">
             <button 
               onClick={isActive && isPlaying ? onPause : onPlay}
               className="w-12 h-12 md:w-14 md:h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shrink-0"
             >
               {isActive && isPlaying ? <Pause size={20} fill="currentColor" className="md:w-6 md:h-6"/> : <Play size={20} fill="currentColor" className="ml-1 md:w-6 md:h-6"/>}
             </button>
             <button 
               onClick={onAddToCart}
               className="flex-1 bg-[#BEE7FF] text-black h-12 md:h-14 rounded-full font-black uppercase tracking-wider text-[10px] md:text-xs flex items-center justify-center gap-2 hover:bg-[#A0D8FF] transition-colors shadow-[0_0_20px_rgba(190,231,255,0.3)] hover:scale-[1.02] active:scale-[0.98]"
             >
               <ShoppingBag size={16} className="md:w-[18px] md:h-[18px]" />
               Buy R{track.price}
             </button>
          </div>
        </div>
      </div>

      {/* Floating Like Animation */}
      <AnimatePresence>
        {isLikeAnimating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 0, rotate: -15 }}
            animate={{ opacity: 1, scale: 1.5, y: -100, rotate: 0 }}
            exit={{ opacity: 0, scale: 2, y: -200 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <Heart size={120} className="fill-[#BEE7FF] text-[#BEE7FF] drop-shadow-[0_0_30px_rgba(190,231,255,0.8)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Sheet */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 h-[70vh] bg-zinc-900 rounded-t-3xl z-50 overflow-hidden flex flex-col border-t border-white/10 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mt-3 mb-2 shrink-0" />
              <div className="flex-1 overflow-y-auto">
                 <Comments trackId={track.id} user={user} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* More Options Sheet */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl z-50 p-6 border-t border-white/10 shadow-2xl pb-12"
            >
              <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto -mt-3 mb-6" />
              <h3 className="text-white font-bold text-lg mb-4 px-2">More Options</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl text-white font-medium transition-colors">
                  <Share2 size={20} /> Share
                </button>
                <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl text-white font-medium transition-colors">
                   <Disc size={20} /> View Artist Profile
                </button>
                <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl text-red-400 font-medium transition-colors">
                   Report Content
                </button>
              </div>
              <button 
                onClick={() => setShowMore(false)}
                className="w-full mt-4 py-4 bg-zinc-800 text-white rounded-xl font-bold"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export const BeatFeed: React.FC<BeatFeedProps> = ({ 
  tracks, 
  currentTrack, 
  isPlaying, 
  onPlay, 
  onPause, 
  onToggleLike, 
  isLiked, 
  onAddToCart,
  user
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const index = Math.round(container.scrollTop / container.clientHeight);
      if (index !== activeIndex && index >= 0 && index < tracks.length) {
        setActiveIndex(index);
      }
    };

    // Debounce scroll handler slightly to avoid rapid firing
    let timeoutId: any;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 50);
    };

    container.addEventListener('scroll', debouncedScroll);
    return () => {
      container.removeEventListener('scroll', debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [activeIndex, tracks.length]);

  // Auto-play when active index changes
  useEffect(() => {
    if (tracks.length > 0 && activeIndex >= 0 && activeIndex < tracks.length) {
      const track = tracks[activeIndex];
      // Only play if it's not already playing
      if (currentTrack?.id !== track.id) {
        onPlay(track);
      }
    }
  }, [activeIndex, tracks]); // Removed onPlay/currentTrack dependency to avoid loops, relying on index change

  return (
    <div 
      ref={containerRef} 
      className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar bg-black"
    >
      {tracks.map((track, index) => (
        <BeatSlide
          key={track.id}
          track={track}
          isActive={index === activeIndex}
          isPlaying={isPlaying && currentTrack?.id === track.id}
          onPlay={() => onPlay(track)}
          onPause={onPause}
          onToggleLike={() => onToggleLike(track.id)}
          isLiked={isLiked(track.id)}
          onAddToCart={() => onAddToCart(track)}
          user={user}
        />
      ))}
    </div>
  );
};
