import React from 'react';
import { Home, Search, Library, User, Zap } from 'lucide-react';
import { View } from '../types';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onSearch: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView, onSearch }) => {
  const navItems = [
    { view: View.MARKETPLACE, icon: Home, label: 'Home', onClick: () => setCurrentView(View.MARKETPLACE) },
    { view: View.BEAT_FEED, icon: Zap, label: 'Feed', onClick: () => setCurrentView(View.BEAT_FEED) },
    { view: View.SEARCH, icon: Search, label: 'Search', onClick: onSearch },
    { view: View.LIBRARY, icon: Library, label: 'Library', onClick: () => setCurrentView(View.LIBRARY) },
    { view: View.PROFILE, icon: User, label: 'Profile', onClick: () => setCurrentView(View.PROFILE) },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/5 px-6 py-4 flex justify-between items-center z-50 md:hidden">
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className={`flex flex-col items-center gap-1 transition-colors ${
            (currentView === item.view && item.view !== View.SEARCH) || (item.view === View.SEARCH && false) ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <item.icon size={24} strokeWidth={currentView === item.view ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};
