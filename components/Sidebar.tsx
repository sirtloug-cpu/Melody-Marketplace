import React from 'react';
import { View, User } from '../types';
import { 
  Home, 
  Library, 
  ListMusic, 
  Sparkles, 
  TrendingUp, 
  UploadCloud, 
  LogOut, 
  Music,
  User as UserIcon,
  Zap
} from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  setIsMobileNavOpen: (isOpen: boolean) => void;
  setSelectedPlaylist: (playlist: any) => void;
  user: User | null;
  handleLogout: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
}

const NavItem = ({ icon: Icon, label, isActive, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 px-4 py-3 w-full transition-all duration-200 rounded-xl ${isActive ? 'text-black bg-[#BEE7FF] shadow-lg shadow-[#BEE7FF]/20 font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 font-medium'}`}
  >
    <Icon size={20} />
    <span className="truncate text-sm">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, setIsMobileNavOpen, setSelectedPlaylist, user, handleLogout, onSignIn, onSignUp }) => {
  return (
    <>
      <div className="px-6 mb-10 flex items-center gap-3">
         <div className="h-10 w-10 bg-[#BEE7FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#BEE7FF]/30"><Music size={22} className="text-black" /></div>
         <span className="text-white font-black text-xl tracking-tight">Melody</span>
      </div>
      <nav className="flex-1 space-y-1.5 px-3 overflow-y-auto min-h-0">
        <NavItem icon={Home} label="Marketplace" isActive={currentView === View.MARKETPLACE} onClick={() => { setCurrentView(View.MARKETPLACE); setIsMobileNavOpen(false); setSelectedPlaylist(null); }} />
        <NavItem icon={Zap} label="Beat Feed" isActive={currentView === View.BEAT_FEED} onClick={() => { setCurrentView(View.BEAT_FEED); setIsMobileNavOpen(false); setSelectedPlaylist(null); }} />
        <NavItem icon={Library} label="My Library" isActive={currentView === View.LIBRARY} onClick={() => { setCurrentView(View.LIBRARY); setIsMobileNavOpen(false); setSelectedPlaylist(null); }} />
        <NavItem icon={ListMusic} label="My Folders" isActive={currentView === View.PLAYLISTS} onClick={() => { setCurrentView(View.PLAYLISTS); setIsMobileNavOpen(false); setSelectedPlaylist(null); }} />
        <NavItem icon={Sparkles} label="AI Guide" isActive={currentView === View.AI_ASSISTANT} onClick={() => { setCurrentView(View.AI_ASSISTANT); setIsMobileNavOpen(false); setSelectedPlaylist(null); }} />
        {user && <NavItem icon={UserIcon} label="Profile" isActive={currentView === View.PROFILE} onClick={() => { setCurrentView(View.PROFILE); setIsMobileNavOpen(false); setSelectedPlaylist(null); }} />}
        <div className="pt-6 pb-2 pl-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Creator Tools</div>
        <NavItem icon={TrendingUp} label="Dashboard" isActive={currentView === View.ARTIST_DASHBOARD} onClick={() => { setCurrentView(View.ARTIST_DASHBOARD); setIsMobileNavOpen(false); setSelectedPlaylist(null); }} />
        <NavItem icon={UploadCloud} label="Upload" isActive={currentView === View.UPLOADS} onClick={() => { setCurrentView(View.UPLOADS); setIsMobileNavOpen(false); setSelectedPlaylist(null); }} />
      </nav>
      <div className="p-4 border-t border-white/5 space-y-2 shrink-0">
        {user ? (
          <button onClick={handleLogout} className="flex items-center gap-3 text-zinc-500 hover:text-white px-4 py-3 text-xs font-bold transition-colors w-full rounded-xl hover:bg-zinc-800/50">
            <LogOut size={16} />
            Sign Out
          </button>
        ) : (
          <>
            <button onClick={onSignIn} className="w-full py-3 bg-zinc-800 text-white rounded-xl text-xs font-bold hover:bg-zinc-700 transition-colors">
              Sign In
            </button>
            <button onClick={onSignUp} className="w-full py-3 bg-[#BEE7FF] text-black rounded-xl text-xs font-bold hover:bg-[#A0D8FF] transition-colors shadow-lg shadow-[#BEE7FF]/20">
              Sign Up
            </button>
          </>
        )}
      </div>
    </>
  );
};
