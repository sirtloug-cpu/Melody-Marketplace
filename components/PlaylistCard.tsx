import React from 'react';
import { Playlist } from '../types';
import { Folder } from 'lucide-react';
import { motion } from 'motion/react';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
  index?: number;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick, index = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group bg-zinc-900/40 hover:bg-zinc-800/60 p-6 rounded-3xl border border-white/5 hover:border-[#BEE7FF]/30 transition-all cursor-pointer relative overflow-hidden flex flex-col items-center text-center hover:shadow-xl hover:shadow-[#BEE7FF]/10 active:scale-95"
    >
       <div className="h-24 w-24 bg-gradient-to-tr from-zinc-800 to-zinc-700 rounded-2xl flex items-center justify-center mb-5 text-zinc-400 group-hover:text-[#BEE7FF] group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-[#BEE7FF]/20 border border-white/5">
          <Folder size={40} strokeWidth={1.5} />
       </div>
       <h3 className="text-lg font-bold text-white truncate w-full mb-1 group-hover:text-[#BEE7FF] transition-colors">{playlist.name}</h3>
       <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest group-hover:text-zinc-400 transition-colors">{playlist.trackIds.length} Tracks</p>
       
       {/* Hover Glow Effect */}
       <div className="absolute inset-0 bg-gradient-to-t from-[#BEE7FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
};
