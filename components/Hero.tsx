import React from 'react';
import { Track } from '../types';

interface HeroProps {
  onFindSound: () => void;
  featuredTrack: Track | null;
}

export const Hero: React.FC<HeroProps> = ({ onFindSound, featuredTrack }) => {
  return (
    <div className="w-full max-w-sm md:max-w-2xl mx-auto mb-20 mt-4">
        <div className="bg-[#1a0b2e] border border-white/5 rounded-[3rem] p-8 pb-12 flex flex-col items-center text-center shadow-[0_0_60px_rgba(88,28,135,0.2)] relative overflow-hidden group">
           {/* Background Glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(circle,rgba(109,40,217,0.15)_0%,rgba(0,0,0,0)_70%)] pointer-events-none"></div>
  
           {/* Content */}
           <div className="relative z-10 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-700 delay-150">
               <div className="bg-[#6d28d9] text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-6 shadow-lg shadow-violet-900/50">
                  Trending Now
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-[1.1] tracking-tight">
                  Buy Exclusive <br/> African Music
               </h1>
               <p className="text-zinc-400 text-sm font-medium mb-10 max-w-[280px] leading-relaxed">
                  Discover Amapiano, Gospel and Hip Hop tracks from top creators.
               </p>
               <button 
                  onClick={onFindSound}
                  className="bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] px-10 py-5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:shadow-[0_10px_40px_rgba(255,255,255,0.25)]"
               >
                  Find My Sound
               </button>
           </div>
        </div>
    </div>
  );
};
