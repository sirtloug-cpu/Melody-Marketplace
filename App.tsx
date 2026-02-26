import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Track, User, View, Playlist } from './types';
import { Player } from './components/Player';
import { PaymentModal } from './components/PaymentModal';
import { AuthModal } from './components/AuthModal';
import { EditModal } from './components/EditModal';
import { CreatePlaylistModal, AddToPlaylistModal } from './components/PlaylistModals';
import { Sidebar } from './components/Sidebar';
import { TrackCard } from './components/TrackCard';
import { supabase } from './services/supabaseClient';
import { 
  Menu,
  User as UserIcon,
  ChevronRight,
  Search
} from 'lucide-react';

// Views
import { Marketplace } from './views/Marketplace';
import { Home } from './views/Home';
import { Library } from './views/Library';
import { Playlists } from './views/Playlists';
import { ArtistDashboard } from './views/ArtistDashboard';
import { Upload } from './views/Upload';
import { AIAssistant } from './views/AIAssistant';
import { Profile } from './views/Profile';
import { BeatFeed } from './views/BeatFeed';
import { BottomNav } from './components/BottomNav';
import { SearchModal } from './components/SearchModal';
import { HomeHeader } from './components/HomeHeader';

export default function App() {
  // Main State
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.MARKETPLACE);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  
  // Library & Content State
  const [library, setLibrary] = useState<string[]>([]);
  const [cart, setCart] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState(new Set<string>());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  
  // Sorting & Filtering
  const [activeGenre, setActiveGenre] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'ASC' | 'DESC'>('ASC');
  
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  
  // Player State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  
  // Playlist / Rotation State
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'OFF' | 'ALL' | 'ONE'>('OFF');
  const [queue, setQueue] = useState<Track[]>([]);

  // Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<Track | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Edit State
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({ title: '', artist: '', album: '', price: '', genre: '', duration: '', featuredArtist: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null); 
  const [isUploading, setIsUploading] = useState(false);

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Scroll ref
  const tracksListRef = useRef<HTMLDivElement>(null);

  // -- Derived Data with Sorting --
  const displayedTracks = useMemo(() => {
    let filtered = activeGenre === 'All' 
      ? allTracks 
      : allTracks.filter(t => t.genre?.toLowerCase() === activeGenre.toLowerCase());
    
    // Sort logic
    const sorted = [...filtered];
    switch (sortOrder) {
      case 'ASC':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'DESC':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'NEWEST':
      default:
        // Already sorted by created_at in fetchTracks
        break;
    }
    return sorted;
  }, [allTracks, activeGenre, sortOrder]);

  // Determine featured track for Hero (Prefer 'Empini', otherwise use newest)
  const featuredTrack = useMemo(() => {
      // Try to find a track with 'Empini' in the title (case insensitive)
      const empiniTrack = allTracks.find(t => t.title.toLowerCase().includes('empini'));
      if (empiniTrack) return empiniTrack;
      // Fallback to the first track in the list (newest)
      return allTracks.length > 0 ? allTracks[0] : null;
  }, [allTracks]);

  // Mock data for Home Sections
  const recentlyPlayed = useMemo(() => allTracks.slice(0, 8), [allTracks]);
  const recommendedTracks = useMemo(() => allTracks.slice(8, 16), [allTracks]);
  const trendingTracks = useMemo(() => [...allTracks].sort(() => 0.5 - Math.random()).slice(0, 8), [allTracks]);

  // -- Effects --
  useEffect(() => {
    checkSession();
    fetchTracks();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.play().catch(e => {}); } 
      else { audioRef.current.pause(); }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // -- Supabase Data --
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      fetchProfile(session.user.id);
      setIsAuthModalOpen(false);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) return;
    if (!data) {
       const { data: { user: authUser } } = await supabase.auth.getUser();
       if (authUser) {
          const { data: newProfile } = await supabase.from('profiles').insert({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || 'New User',
              is_artist: true 
          }).select().single();
          if (newProfile) {
             setUser({
               id: newProfile.id,
               name: newProfile.full_name || 'User',
               email: newProfile.email,
               balance: parseFloat(newProfile.balance) || 0,
               library: [],
               isArtist: true,
               avatarUrl: newProfile.avatar_url
             });
             fetchUserData(userId);
          }
       }
       return;
    }
    setUser({
      id: data.id,
      name: data.full_name || 'User',
      email: data.email,
      balance: parseFloat(data.balance) || 0,
      library: [], 
      isArtist: true,
      avatarUrl: data.avatar_url
    });
    fetchUserData(userId);
  };

  const fetchUserData = async (userId: string) => {
     const { data: libData } = await supabase.from('user_library').select('track_id').eq('user_id', userId);
     if (libData) setLibrary(libData.map((l: any) => l.track_id));
     const { data: likeData } = await supabase.from('likes').select('track_id').eq('user_id', userId);
     if (likeData) setLikedTracks(new Set(likeData.map((l: any) => l.track_id)));
     fetchPlaylists(userId);
  };

  const fetchPlaylists = async (userId: string) => {
     const { data: pData } = await supabase.from('playlists').select('*').eq('user_id', userId);
     if (pData) {
        const playlistsWithTracks = await Promise.all(pData.map(async (p: any) => {
           const { data: ptData } = await supabase.from('playlist_tracks').select('track_id').eq('playlist_id', p.id);
           return {
              id: p.id,
              name: p.name,
              trackIds: ptData ? ptData.map((pt: any) => pt.track_id) : []
           };
        }));
        setPlaylists(playlistsWithTracks);
     }
  };

  const fetchTracks = async () => {
    setIsLoadingTracks(true);
    const { data } = await supabase.from('tracks').select('*').order('created_at', { ascending: false });
    if (data) {
      setAllTracks(data.map((t: any) => ({
        id: t.id, title: t.title, artist: t.artist, artistId: t.artist_id, album: t.album,
        price: parseFloat(t.price), coverUrl: t.cover_url, duration: t.duration,
        genre: t.genre, audioUrl: t.audio_url
      })));
    }
    setIsLoadingTracks(false);
  };

  // Logic functions
  const handleRemoveTrackFromPlaylist = async (playlistId: string, trackId: string) => { const { error } = await supabase.from('playlist_tracks').delete().eq('playlist_id', playlistId).eq('track_id', trackId); if (!error) { setPlaylists(playlists.map(p => p.id === playlistId ? { ...p, trackIds: p.trackIds.filter(id => id !== trackId) } : p)); if (selectedPlaylist?.id === playlistId) { setSelectedPlaylist({ ...selectedPlaylist, trackIds: selectedPlaylist.trackIds.filter(id => id !== trackId) }); } } };
  const handleDownload = async (track: Track) => { try { const response = await fetch(track.audioUrl); const blob = await response.blob(); const url = window.URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.setAttribute('download', `${track.artist} - ${track.title}.mp3`); document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(url); } catch (error) { console.error("Download failed", error); window.open(track.audioUrl, '_blank'); } };
  const onPaymentSuccess = async () => { if (!user) return; const tracksToBuy = [...cart]; if (tracksToBuy.length === 0) return; try { const libraryInserts = tracksToBuy.map(t => ({ user_id: user.id, track_id: t.id })); const { error: libError } = await supabase.from('user_library').insert(libraryInserts); if (libError) throw libError; tracksToBuy.forEach(track => handleDownload(track)); setCart([]); await fetchUserData(user.id); setCurrentView(View.LIBRARY); for (const track of tracksToBuy) { if (track.artistId) { const { data: art } = await supabase.from('profiles').select('balance').eq('id', track.artistId).maybeSingle(); if (art) { const newBal = (parseFloat(art.balance) || 0) + track.price; await supabase.from('profiles').update({ balance: newBal }).eq('id', track.artistId); } } } } catch (err) { alert("Authorization passed but library sync failed. Retrying..."); fetchUserData(user.id); } setIsPaymentModalOpen(false); };
  const handleToggleLike = async (trackId?: string) => {
    const targetTrackId = trackId || currentTrack?.id;
    if (!targetTrackId || !user) {
      if (!user) setIsAuthModalOpen(true);
      return;
    }
    
    const isLiked = likedTracks.has(targetTrackId);
    const newLikedTracks = new Set(likedTracks);
    if (isLiked) newLikedTracks.delete(targetTrackId);
    else newLikedTracks.add(targetTrackId);
    setLikedTracks(newLikedTracks);
    
    if (isLiked) await supabase.from('likes').delete().eq('user_id', user.id).eq('track_id', targetTrackId);
    else await supabase.from('likes').insert({ user_id: user.id, track_id: targetTrackId });
  };
  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setIsAuthModalOpen(true); };
  const onTimeUpdate = () => setTrackProgress(audioRef.current?.currentTime || 0);
  const onLoadedMetadata = () => setTrackDuration(audioRef.current?.duration || 0);
  const playTrack = (track: Track, contextTracks?: Track[]) => { 
    if (contextTracks) {
      setQueue(contextTracks);
    }
    if (currentTrack?.id !== track.id) setCurrentTrack(track); 
    setIsPlaying(true); 
  };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => { if(audioRef.current) { audioRef.current.currentTime = Number(e.target.value); setTrackProgress(audioRef.current.currentTime); } };
  const handleTrackEnd = () => { if (repeatMode === 'ONE' && audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); } else { handleNext(); } };
  const handleNext = () => { 
    if (!currentTrack || queue.length === 0) return; 
    if (isShuffle) { 
      const randomIndex = Math.floor(Math.random() * queue.length); 
      playTrack(queue[randomIndex]); 
      return; 
    } 
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id); 
    const nextIndex = (currentIndex + 1) % queue.length; 
    playTrack(queue[nextIndex]); 
  };
  const handlePrev = () => { 
    if (!currentTrack || queue.length === 0) return; 
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id); 
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length; 
    playTrack(queue[prevIndex]); 
  };
  const handleToggleRepeat = () => { setRepeatMode(prev => prev === 'OFF' ? 'ALL' : prev === 'ALL' ? 'ONE' : 'OFF'); };
  const handleEditClick = (track: Track) => { setEditingTrack(track); setIsEditModalOpen(true); };
  const handleDeleteTrack = async (trackId: string) => { if (window.confirm("Delete this track completely?")) { const { error } = await supabase.from('tracks').delete().eq('id', trackId); if (!error) setAllTracks(allTracks.filter(t => t.id !== trackId)); } };
  const handleRemoveFromLibrary = async (trackId: string) => { if (!user) return; if (window.confirm("Remove this song from your library?")) { if (currentTrack?.id === trackId) { setIsPlaying(false); setCurrentTrack(null); } setLibrary(prev => prev.filter(id => id !== trackId)); const { error } = await supabase.from('user_library').delete().eq('user_id', user.id).eq('track_id', trackId); if (error) { console.error("Failed to delete from DB:", error); alert("Song removed from view. (Warning: Database delete failed. Check RLS policies.)"); } } };
  const handleClearLibrary = async () => { if (!user) return; if (window.confirm("Are you sure you want to remove all songs from your library?")) { setIsPlaying(false); setCurrentTrack(null); setLibrary([]); const { error } = await supabase.from('user_library').delete().eq('user_id', user.id); if (error) { console.error("Failed to clear DB:", error); alert("Library view cleared. (Warning: Database delete failed. Check RLS policies.)"); } } };

  // -- Background Playback (Media Session API) --
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || 'Single',
        artwork: [
          { src: currentTrack.coverUrl || 'https://via.placeholder.com/96', sizes: '96x96', type: 'image/jpeg' },
          { src: currentTrack.coverUrl || 'https://via.placeholder.com/128', sizes: '128x128', type: 'image/jpeg' },
          { src: currentTrack.coverUrl || 'https://via.placeholder.com/192', sizes: '192x192', type: 'image/jpeg' },
          { src: currentTrack.coverUrl || 'https://via.placeholder.com/256', sizes: '256x256', type: 'image/jpeg' },
          { src: currentTrack.coverUrl || 'https://via.placeholder.com/384', sizes: '384x384', type: 'image/jpeg' },
          { src: currentTrack.coverUrl || 'https://via.placeholder.com/512', sizes: '512x512', type: 'image/jpeg' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
         setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
         setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', handleNext);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (audioRef.current && details.seekTime !== undefined) {
           audioRef.current.currentTime = details.seekTime;
           setTrackProgress(details.seekTime);
        }
      });
    }
  }, [currentTrack, displayedTracks, isShuffle, selectedPlaylist]);

  return (
    <div className="flex h-screen bg-black overflow-hidden relative font-sans text-zinc-100 selection:bg-violet-500/30">
      <audio 
        ref={audioRef} 
        src={currentTrack?.audioUrl} 
        onTimeUpdate={onTimeUpdate} 
        onLoadedMetadata={onLoadedMetadata} 
        onEnded={handleTrackEnd} 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Modals */}
      <CreatePlaylistModal 
        isOpen={isPlaylistModalOpen} 
        onClose={() => setIsPlaylistModalOpen(false)} 
        user={user} 
        playlists={playlists} 
        setPlaylists={setPlaylists} 
      />

      <AddToPlaylistModal 
        isOpen={isAddToPlaylistModalOpen} 
        onClose={() => setIsAddToPlaylistModalOpen(false)} 
        track={trackToAddToPlaylist} 
        playlists={playlists} 
        setPlaylists={setPlaylists} 
        openCreateModal={() => { setIsAddToPlaylistModalOpen(false); setIsPlaylistModalOpen(true); }}
      />

      <EditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        track={editingTrack} 
        user={user} 
        fetchTracks={fetchTracks} 
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        fetchProfile={fetchProfile} 
        initialMode={authInitialMode}
      />
      
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        allTracks={allTracks} 
        playTrack={playTrack} 
        onDownload={handleDownload} 
        onAddToPlaylist={(t) => { setTrackToAddToPlaylist(t); setIsAddToPlaylistModalOpen(true); }} 
        library={library} 
      />

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        amount={(cart.reduce((a, t) => a + t.price, 0))} 
        onConfirm={onPaymentSuccess}
      />

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm transition-opacity md:hidden ${isMobileNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileNavOpen(false)}>
         <div className={`absolute top-0 left-0 w-72 h-full bg-zinc-950 p-6 transition-transform duration-300 shadow-2xl ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
            <Sidebar 
              currentView={currentView} 
              setCurrentView={setCurrentView} 
              setIsMobileNavOpen={setIsMobileNavOpen} 
              setSelectedPlaylist={setSelectedPlaylist} 
              user={user} 
              handleLogout={handleLogout} 
              onSignIn={() => { setAuthInitialMode('LOGIN'); setIsAuthModalOpen(true); setIsMobileNavOpen(false); }}
              onSignUp={() => { setAuthInitialMode('SIGNUP'); setIsAuthModalOpen(true); setIsMobileNavOpen(false); }}
            />
         </div>
      </div>

      <aside className="hidden md:flex flex-col w-64 bg-zinc-950 h-full border-r border-white/5 pt-8">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          setIsMobileNavOpen={setIsMobileNavOpen} 
          setSelectedPlaylist={setSelectedPlaylist} 
          user={user} 
          handleLogout={handleLogout} 
          onSignIn={() => { setAuthInitialMode('LOGIN'); setIsAuthModalOpen(true); }}
          onSignUp={() => { setAuthInitialMode('SIGNUP'); setIsAuthModalOpen(true); }}
        />
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* HEADER (Mobile) */}
        <div className="md:hidden">
           <HomeHeader 
             onSearch={() => setIsSearchOpen(true)} 
             onProfile={() => setCurrentView(View.PROFILE)} 
             onSignIn={() => { setAuthInitialMode('LOGIN'); setIsAuthModalOpen(true); }}
             onSignUp={() => { setAuthInitialMode('SIGNUP'); setIsAuthModalOpen(true); }}
             user={user}
           />
        </div>

        {/* HEADER (Desktop) */}
        <header className="hidden md:flex h-24 items-center justify-between px-6 md:px-8 absolute top-0 w-full z-20 bg-black/50 backdrop-blur-md border-b border-white/5 md:border-none">
          <div className="flex-1">
             <button onClick={() => setIsSearchOpen(true)} className="flex items-center gap-3 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white px-4 py-3 rounded-full border border-white/5 transition-all w-full max-w-md group">
                <Search size={20} className="group-hover:text-[#BEE7FF] transition-colors" />
                <span className="text-sm font-medium">Search for artists, songs, or albums...</span>
             </button>
          </div>
          
          {user ? (
            <button onClick={() => setCurrentView(View.PROFILE)} className="flex items-center gap-4 bg-[#1c1c1e] p-2 pl-6 rounded-full border border-white/5 shadow-xl hover:bg-[#2c2c2e] transition-colors cursor-pointer">
              <div className="flex flex-col items-end mr-1">
                  <span className="text-sm font-black text-white uppercase tracking-wider">{user.name}</span>
              </div>
              <div className="h-14 w-14 bg-zinc-800 rounded-full flex items-center justify-center border border-white/10 shadow-inner overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={32} className="text-[#BEE7FF]" />
                  )}
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setAuthInitialMode('LOGIN'); setIsAuthModalOpen(true); }} 
                className="text-white font-bold text-sm hover:text-[#BEE7FF] transition-colors px-4 py-3"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setAuthInitialMode('SIGNUP'); setIsAuthModalOpen(true); }} 
                className="bg-[#BEE7FF] text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-[#A0D8FF] transition-colors shadow-lg shadow-[#BEE7FF]/20"
              >
                Sign Up
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto pt-4 md:pt-24 px-4 md:px-12 pb-32 scrollbar-hide">
           {selectedPlaylist ? (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                   <button onClick={() => setSelectedPlaylist(null)} className="p-3 bg-zinc-900 rounded-2xl hover:bg-zinc-800 transition">
                      <ChevronRight className="rotate-180" size={20} />
                   </button>
                   <div>
                      <h2 className="text-4xl font-black text-white tracking-tight">{selectedPlaylist.name}</h2>
                      <p className="text-zinc-500 text-sm font-bold">{selectedPlaylist.trackIds.length} tracks</p>
                   </div>
                </div>
                {/* Grid View for Playlist */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allTracks.filter(t => selectedPlaylist.trackIds.includes(t.id)).map(t => (
                      <TrackCard 
                        key={t.id} 
                        track={t} 
                        isOwned={library.includes(t.id)} 
                        onPlay={() => playTrack(t, allTracks.filter(tr => selectedPlaylist.trackIds.includes(tr.id)))} 
                        onBuy={() => { setCart([t]); setIsPaymentModalOpen(true); }} 
                        onDownload={() => handleDownload(t)} 
                        onAddToPlaylist={() => { setTrackToAddToPlaylist(t); setIsAddToPlaylistModalOpen(true); }} 
                        onDelete={() => handleRemoveTrackFromPlaylist(selectedPlaylist.id, t.id)}
                      />
                    ))}
                  </div>
             </div>
           ) : currentView === View.MARKETPLACE ? (
             <Home 
               recentlyPlayed={recentlyPlayed}
               recommendedTracks={recommendedTracks}
               trendingTracks={trendingTracks}
               playTrack={(t) => playTrack(t, displayedTracks)} 
               setCart={setCart} 
               setIsPaymentModalOpen={setIsPaymentModalOpen} 
               handleDownload={handleDownload} 
               setTrackToAddToPlaylist={setTrackToAddToPlaylist} 
               setIsAddToPlaylistModalOpen={setIsAddToPlaylistModalOpen} 
             />
           ) : currentView === View.LIBRARY ? (
             <Library 
               library={library} 
               allTracks={allTracks} 
               playTrack={(t) => playTrack(t, allTracks.filter(tr => library.includes(tr.id)))} 
               handleDownload={handleDownload} 
               setTrackToAddToPlaylist={setTrackToAddToPlaylist} 
               setIsAddToPlaylistModalOpen={setIsAddToPlaylistModalOpen} 
               handleRemoveFromLibrary={handleRemoveFromLibrary} 
               handleClearLibrary={handleClearLibrary} 
               setCurrentView={setCurrentView} 
             />
           ) : currentView === View.PLAYLISTS ? (
             <Playlists 
               playlists={playlists} 
               setSelectedPlaylist={setSelectedPlaylist} 
               setIsPlaylistModalOpen={setIsPlaylistModalOpen} 
             />
           ) : currentView === View.ARTIST_DASHBOARD ? (
             <ArtistDashboard 
               allTracks={allTracks} 
               user={user} 
               handleEditClick={handleEditClick} 
               handleDeleteTrack={handleDeleteTrack} 
               playTrack={(t) => playTrack(t, allTracks.filter(tr => tr.artistId === user?.id))} 
               handleDownload={handleDownload} 
               setTrackToAddToPlaylist={setTrackToAddToPlaylist} 
               setIsAddToPlaylistModalOpen={setIsAddToPlaylistModalOpen} 
               setCurrentView={setCurrentView} 
             />
           ) : currentView === View.AI_ASSISTANT ? (
             <AIAssistant 
               aiPrompt={aiPrompt} 
               setAiPrompt={setAiPrompt} 
               aiResponse={aiResponse} 
               setAiResponse={setAiResponse} 
               isAiLoading={isAiLoading} 
               setIsAiLoading={setIsAiLoading} 
               allTracks={allTracks} 
               library={library} 
             />
           ) : currentView === View.UPLOADS ? (
             <Upload 
               user={user} 
               uploadFile={uploadFile} 
               setUploadFile={setUploadFile} 
               uploadForm={uploadForm} 
               setUploadForm={setUploadForm} 
               coverFile={coverFile} 
               setCoverFile={setCoverFile} 
               isUploading={isUploading} 
               setIsUploading={setIsUploading} 
               fetchTracks={fetchTracks} 
               setCurrentView={setCurrentView} 
             />
           ) : currentView === View.PROFILE ? (
             <Profile user={user} setUser={setUser} />
           ) : currentView === View.BEAT_FEED ? (
             <BeatFeed 
               tracks={allTracks} 
               currentTrack={currentTrack} 
               isPlaying={isPlaying} 
               onPlay={(t) => playTrack(t, allTracks)} 
               onPause={() => setIsPlaying(false)} 
               onToggleLike={handleToggleLike}
               isLiked={(id) => likedTracks.has(id)} 
               onAddToCart={(t) => { setCart([t]); setIsPaymentModalOpen(true); }} 
               user={user}
             />
           ) : null}
        </div>
        <BottomNav currentView={currentView} setCurrentView={setCurrentView} onSearch={() => setIsSearchOpen(true)} />
      </main>

      <Player 
        currentTrack={currentTrack} 
        isPlaying={isPlaying} 
        isLiked={!!currentTrack && likedTracks.has(currentTrack.id)}
        progress={trackProgress} 
        duration={trackDuration}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        queue={queue}
        onReorderQueue={setQueue}
        user={user}
        onPlayPause={() => setIsPlaying(!isPlaying)} 
        onNext={handleNext} 
        onPrev={handlePrev}
        onSeek={handleSeek} 
        onToggleLike={handleToggleLike}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleRepeat={handleToggleRepeat}
        onPlayTrack={(t) => playTrack(t)}
      />
    </div>
  );
}
