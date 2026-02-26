
import React, { useState } from 'react';
import { Track, User } from '../types';
import { Comments } from './Comments';
import { Reorder } from 'motion/react';
import { 
  Play, Pause, SkipBack, SkipForward, Heart, 
  ChevronDown, MonitorSpeaker, PlusCircle, CheckCircle, 
  Shuffle, Repeat, MoreVertical, ListMusic, Maximize2, X, GripVertical
} from 'lucide-react';

import { WaveformVisualizer } from './WaveformVisualizer';

interface PlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLiked: boolean;
  progress: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: 'OFF' | 'ALL' | 'ONE';
  queue: Track[];
  onReorderQueue: (newQueue: Track[]) => void;
  user: User | null;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleLike: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onPlayTrack: (track: Track) => void;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

export const Player: React.FC<PlayerProps> = ({ 
  currentTrack, 
  isPlaying, 
  isLiked,
  progress,
  duration,
  isShuffle,
  repeatMode,
  queue,
  onReorderQueue,
  user,
  onPlayPause, 
  onNext, 
  onPrev,
  onSeek,
  onToggleLike,
  onToggleShuffle,
  onToggleRepeat,
  onPlayTrack
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!currentTrack) return null;

  // Calculate percentages for smooth native slider fills
  const progressPercent = (progress / (duration || 1)) * 100;

  // Common styles for native range inputs
  const sliderClass = "appearance-none bg-transparent cursor-pointer focus:outline-none focus:ring-0 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all";

  const renderRepeatIcon = (size: number) => (
    <div className="relative flex items-center justify-center">
      <Repeat size={size} />
      {repeatMode === 'ONE' && (
        <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black bg-[#BEE7FF] text-black rounded-full w-3.5 h-3.5 flex items-center justify-center border border-zinc-900">1</span>
      )}
    </div>
  );

  const handleShare = async () => {
    if (!currentTrack || isSharing) return;
    setIsSharing(true);
    const shareData = {
      title: currentTrack.title,
      text: `Check out ${currentTrack.title} by ${currentTrack.artist} on Melody Marketplace!`,
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

  return (
    <>
      {/* ========================================= */}
      {/* QUEUE / PLAYLIST SLIDE-OVER               */}
      {/* ========================================= */}
      <div className={`fixed top-0 right-0 bottom-[70px] md:bottom-[90px] w-full sm:w-80 bg-zinc-950/95 backdrop-blur-2xl border-l border-white/5 z-[45] transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${showQueue ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
          <h3 className="font-bold text-white flex items-center gap-2"><ListMusic size={18} className="text-[#BEE7FF]"/> Up Next</h3>
          <button onClick={() => setShowQueue(false)} className="text-zinc-400 hover:text-white p-1 transition-colors"><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <Reorder.Group axis="y" values={queue} onReorder={onReorderQueue} className="space-y-1">
            {queue.map(t => (
              <Reorder.Item key={t.id} value={t}>
                <div 
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all group ${currentTrack.id === t.id ? 'bg-[#BEE7FF]/10 hover:bg-[#BEE7FF]/20' : 'hover:bg-white/5'}`}
                >
                  <div className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 p-1">
                    <GripVertical size={14} />
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => onPlayTrack(t)}>
                    <img src={t.coverUrl} className="w-10 h-10 rounded-md object-cover shrink-0 shadow-sm" alt={t.title} />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className={`text-sm truncate font-medium ${currentTrack.id === t.id ? 'text-[#BEE7FF]' : 'text-zinc-100'}`}>{t.title}</span>
                      <span className="text-xs text-zinc-500 truncate">{t.artist}</span>
                    </div>
                    {currentTrack.id === t.id && <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#BEE7FF] animate-pulse mr-2" />}
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>

      {/* ========================================= */}
      {/* MOBILE MINI PLAYER                        */}
      {/* ========================================= */}
      <div 
        onClick={() => setIsExpanded(true)}
        className={`md:hidden fixed bottom-[74px] left-2 right-2 bg-[#181818] rounded-md h-[56px] flex items-center pr-3 pl-2 z-40 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out ${isExpanded ? 'translate-y-[200%]' : 'translate-y-0'}`}
      >
        <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="flex items-center gap-3 w-full h-full relative z-10 pb-[2px]">
          <img src={currentTrack.coverUrl} className="w-10 h-10 rounded-[4px] object-cover shrink-0" alt="cover" />
          <div className="flex flex-col flex-1 min-w-0 justify-center">
            <span className="text-white text-[13px] font-bold truncate leading-tight mb-0.5">{currentTrack.title}</span>
            <span className="text-zinc-400 text-[11px] font-medium truncate leading-tight">{currentTrack.artist}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-white">
            <button onClick={(e) => { e.stopPropagation(); onToggleLike(); }} className="p-1 active:scale-90 transition-transform">
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-[#BEE7FF]" : "text-zinc-400 hover:text-white"} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onPlayPause(); }} className="p-1 active:scale-90 transition-transform">
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="p-1 active:scale-90 transition-transform">
              <SkipForward size={24} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* FULL SCREEN EXPANDED PLAYER (Mobile & Desktop) */}
      {/* ========================================= */}
      <div className={`fixed inset-0 z-[100] bg-zinc-950 flex flex-col transition-transform duration-300 ease-in-out overflow-y-auto ${isExpanded ? 'translate-y-0' : 'translate-y-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0 md:max-w-4xl md:mx-auto w-full">
          <button onClick={() => setIsExpanded(false)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors group">
            <ChevronDown size={32} className="group-hover:translate-y-1 transition-transform" />
          </button>
          <div className="flex flex-col items-center">
             <span className="text-[10px] font-bold text-zinc-400 tracking-[0.15em] uppercase mb-0.5">Playing from Catalog</span>
             <span className="text-xs font-bold text-white">Melody Marketplace</span>
          </div>
          <button onClick={handleShare} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
            <MoreVertical size={24} />
          </button>
        </div>

        {/* Cover Art */}
        <div className="shrink-0 px-6 py-6 flex items-center justify-center min-h-[300px] relative">
          <img 
            src={currentTrack.coverUrl} 
            className="w-full max-w-[340px] md:max-w-[480px] aspect-square object-cover rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 relative" 
            alt="Expanded cover"
          />
          {/* Visualizer Background Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-48 opacity-30 pointer-events-none z-0">
             <WaveformVisualizer isPlaying={isPlaying} color="#BEE7FF" barCount={40} />
          </div>
        </div>

        {/* Controls Container */}
        <div className="px-6 pb-8 shrink-0 md:max-w-2xl md:mx-auto w-full border-b border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col min-w-0 pr-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white truncate">{currentTrack.title}</h2>
              <p className="text-lg md:text-xl text-zinc-400 truncate mt-1">{currentTrack.artist}</p>
            </div>
            <button onClick={onToggleLike} className="shrink-0 active:scale-90 transition-transform">
              {isLiked ? <CheckCircle size={32} className="text-[#BEE7FF]" /> : <PlusCircle size={32} className="text-zinc-400 hover:text-white" />}
            </button>
          </div>

          <div className="mb-8 group">
             <input
                type="range" min="0" max={duration || 100} value={progress} onChange={onSeek}
                className={`w-full h-1.5 rounded-full ${sliderClass}`}
                style={{ background: `linear-gradient(to right, #ffffff ${progressPercent}%, #3f3f46 ${progressPercent}%)` }}
             />
            <div className="flex justify-between text-xs text-zinc-400 mt-2 font-medium">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between max-w-[380px] mx-auto">
            <button onClick={onToggleShuffle} className={`transition-colors hover:scale-105 active:scale-95 ${isShuffle ? 'text-[#BEE7FF]' : 'text-zinc-400 hover:text-white'}`} title="Shuffle">
               <Shuffle size={24} />
            </button>
            <button onClick={onPrev} className="text-white hover:text-zinc-300 active:scale-90 transition-transform"><SkipBack size={40} fill="currentColor" /></button>
            <button onClick={onPlayPause} className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-xl">
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={onNext} className="text-white hover:text-zinc-300 active:scale-90 transition-transform"><SkipForward size={40} fill="currentColor" /></button>
            <button onClick={onToggleRepeat} className={`transition-colors hover:scale-105 active:scale-95 ${repeatMode !== 'OFF' ? 'text-[#BEE7FF]' : 'text-zinc-400 hover:text-white'}`} title="Repeat">
               {renderRepeatIcon(24)}
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <Comments trackId={currentTrack.id} user={user} />
      </div>

      {/* ========================================= */}
      {/* DESKTOP MINIMIZED FLOATING PLAYER           */}
      {/* ========================================= */}
      <div 
        onClick={() => setIsMinimized(false)}
        className={`hidden md:flex fixed bottom-6 left-6 bg-zinc-900 border border-white/10 hover:border-white/20 rounded-xl p-3 items-center gap-4 z-50 shadow-2xl cursor-pointer transition-all duration-300 ease-in-out origin-bottom-left ${isMinimized ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-90 pointer-events-none'}`}
      >
        <img src={currentTrack.coverUrl} className="w-12 h-12 rounded-md object-cover shadow-md" alt="cover" />
        <div className="flex flex-col pr-6 min-w-[120px]">
          <span className="text-white text-sm font-bold truncate">{currentTrack.title}</span>
          <span className="text-zinc-400 text-xs truncate">{currentTrack.artist}</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
          className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          title="Restore player"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* ========================================= */}
      {/* DESKTOP FULL PLAYER (Matches Screenshot Layout) */}
      {/* ========================================= */}
      <div className={`hidden md:flex fixed bottom-0 left-0 right-0 h-[90px] bg-black border-t border-white/5 z-40 px-6 items-center transition-transform duration-300 ease-in-out ${isMinimized ? 'translate-y-full' : 'translate-y-0'}`}>
        
        {/* LEFT: Info & Heart */}
        <div className="flex items-center w-[30%] min-w-[200px] gap-4">
           <img src={currentTrack.coverUrl} alt={currentTrack.title} className="h-14 w-14 rounded-md object-cover shrink-0 shadow-lg" />
          <div className="flex flex-col justify-center min-w-0 pr-2">
            <span onClick={() => setIsExpanded(true)} className="text-white text-[15px] font-bold truncate hover:underline cursor-pointer">{currentTrack.title}</span>
            <span className="text-zinc-400 text-xs truncate hover:text-white hover:underline cursor-pointer">{currentTrack.artist}</span>
          </div>
          <button onClick={onToggleLike} className="shrink-0 p-1">
             <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={`transition-colors hover:scale-105 active:scale-95 ${isLiked ? 'text-[#BEE7FF]' : 'text-zinc-400 hover:text-white'}`} />
          </button>
        </div>

        {/* CENTER: Main Controls */}
        <div className="flex flex-col items-center justify-center flex-1 max-w-[45%] relative px-4">
           <button 
             onClick={() => setIsMinimized(true)}
             className="absolute -top-[14px] bg-zinc-900 border border-zinc-800 rounded-full p-1 text-zinc-400 hover:text-white transition-colors hover:scale-110 active:scale-95 z-50 shadow-md"
             title="Minimize player"
           >
              <ChevronDown size={14} />
           </button>

           <div className="w-full relative flex items-center justify-center mb-1.5 mt-2">
              <div className="flex items-center gap-4 lg:gap-6">
                <button onClick={onToggleShuffle} className={`transition-colors hover:scale-105 active:scale-95 ${isShuffle ? 'text-[#BEE7FF]' : 'text-zinc-400 hover:text-white'}`}>
                   <Shuffle size={18} />
                </button>
                <button onClick={onPrev} className="text-zinc-400 hover:text-white transition active:scale-95 shrink-0">
                  <SkipBack size={24} />
                </button>
                <button onClick={onPlayPause} className="h-10 w-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition active:scale-95 shrink-0 text-black shadow-lg">
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                </button>
                <button onClick={onNext} className="text-zinc-400 hover:text-white transition active:scale-95 shrink-0">
                  <SkipForward size={24} />
                </button>
                <button onClick={onToggleRepeat} className={`transition-colors hover:scale-105 active:scale-95 ${repeatMode !== 'OFF' ? 'text-[#BEE7FF]' : 'text-zinc-400 hover:text-white'}`}>
                   {renderRepeatIcon(18)}
                </button>
              </div>
           </div>

           <div className="flex w-full items-center gap-3 text-xs text-zinc-400 font-medium group">
              <span className="w-10 text-right shrink-0">{formatTime(progress)}</span>
              <input
                type="range" min="0" max={duration || 100} value={progress} onChange={onSeek}
                className={`flex-1 h-1 rounded-full ${sliderClass}`}
                style={{ background: `linear-gradient(to right, #ffffff ${progressPercent}%, #3f3f46 ${progressPercent}%)` }}
              />
              <span className="w-10 shrink-0">{formatTime(duration)}</span>
           </div>
        </div>

        {/* RIGHT: Extra Actions */}
        <div className="flex items-center justify-end w-[30%] min-w-[200px] gap-4 shrink-0 text-zinc-400">
          <button onClick={() => setShowQueue(!showQueue)} className={`transition-colors ${showQueue ? 'text-[#BEE7FF]' : 'hover:text-white'}`} title="Queue">
             <ListMusic size={20} />
          </button>
          <button className="hover:text-white transition-colors"><MonitorSpeaker size={20} /></button>
          <button onClick={() => setIsExpanded(true)} className="hover:text-white transition-colors" title="Full screen">
             <Maximize2 size={20} />
          </button>
        </div>
      </div>
    </>
  );
};
