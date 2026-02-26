import React from 'react';
import { Search, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface HomeHeaderProps {
  onSearch: () => void;
  onProfile: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
  user: User | null;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ onSearch, onProfile, onSignIn, onSignUp, user }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#BEE7FF] rounded-full flex items-center justify-center">
          <span className="text-black font-black text-xs">MM</span>
        </div>
        <h1 className="text-lg font-bold text-white tracking-tight hidden sm:block">Melody Marketplace</h1>
        <h1 className="text-lg font-bold text-white tracking-tight sm:hidden">Melody</h1>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onSearch} className="text-white hover:text-[#BEE7FF] transition-colors">
          <Search size={22} />
        </button>
        {user ? (
          <button onClick={onProfile} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors overflow-hidden border border-white/10">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={18} />
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={onSignIn} className="text-xs font-bold text-white hover:text-[#BEE7FF] transition-colors">
              Sign In
            </button>
            <button onClick={onSignUp} className="text-xs font-bold bg-[#BEE7FF] text-black px-3 py-1.5 rounded-full hover:bg-[#A0D8FF] transition-colors">
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
