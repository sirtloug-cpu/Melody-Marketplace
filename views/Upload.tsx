import React, { useState } from 'react';
import { User, View } from '../types';
import { Button } from '../components/Button';
import { Music, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { APP_GENRES } from '../constants';
import { supabase } from '../services/supabaseClient';
import { motion } from 'motion/react';
import { suggestPrice } from '../services/geminiService';

interface UploadProps {
  user: User | null;
  uploadFile: File | null;
  setUploadFile: (file: File | null) => void;
  uploadForm: { title: string; artist: string; album: string; price: string; genre: string; duration: string; featuredArtist: string; };
  setUploadForm: (form: any) => void;
  coverFile: File | null;
  setCoverFile: (file: File | null) => void;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  fetchTracks: () => void;
  setCurrentView: (view: View) => void;
}

export const Upload: React.FC<UploadProps> = ({
  user,
  uploadFile,
  setUploadFile,
  uploadForm,
  setUploadForm,
  coverFile,
  setCoverFile,
  isUploading,
  setIsUploading,
  fetchTracks,
  setCurrentView
}) => {
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  
  const handleSuggestPrice = async () => {
    if (!uploadForm.title || !uploadForm.genre) {
      alert("Please enter a title and select a genre first.");
      return;
    }
    setIsSuggestingPrice(true);
    try {
      const suggested = await suggestPrice(uploadForm.title, uploadForm.genre, user?.name || "Unknown Artist");
      setUploadForm({ ...uploadForm, price: suggested.toString() });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggestingPrice(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!user || !uploadFile) return; 
    setIsUploading(true);
    try {
       const ts = Date.now();
       const { data: aud, error: audError } = await supabase.storage.from('audio').upload(`${user.id}/${ts}.mp3`, uploadFile);
       if (audError) throw audError;

       let cov = null;
       if (coverFile) { 
         const { data, error: covError } = await supabase.storage.from('covers').upload(`${user.id}/${ts}_c.jpg`, coverFile); 
         if (covError) throw covError;
         const { data: publicUrlData } = supabase.storage.from('covers').getPublicUrl(data.path);
         cov = publicUrlData.publicUrl; 
       }

       const mainArtist = uploadForm.artist || user.name;
       const artistName = uploadForm.featuredArtist ? `${mainArtist} ft. ${uploadForm.featuredArtist}` : mainArtist;
       
       const { data: audioUrlData } = supabase.storage.from('audio').getPublicUrl(aud.path);

       const { error: dbError } = await supabase.from('tracks').insert({ 
         title: uploadForm.title, 
         artist: artistName, 
         artist_id: user.id, 
         album: uploadForm.album, 
         price: parseFloat(uploadForm.price), 
         cover_url: cov, 
         duration: uploadForm.duration, 
         genre: uploadForm.genre, 
         audio_url: audioUrlData.publicUrl 
       });

       if (dbError) throw dbError;

       fetchTracks(); 
       setCurrentView(View.ARTIST_DASHBOARD);
    } catch(e: any) { 
      alert("Upload error: " + e.message); 
    } finally { 
      setIsUploading(false); 
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4"
    >
       <h2 className="text-3xl font-black text-white mb-8 tracking-tight">Publish Music</h2>
       <form onSubmit={handleUpload} className="space-y-4 bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div className="grid grid-cols-2 gap-4">
             <div className="h-32 bg-zinc-800 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-white/5 cursor-pointer hover:border-[#BEE7FF] relative transition-colors">
               <input type="file" accept="audio/*" onChange={e => { setUploadFile(e.target.files?.[0] || null); setUploadForm({...uploadForm, title: e.target.files?.[0]?.name.split('.')[0] || ''}); }} className="absolute inset-0 opacity-0 cursor-pointer" />
               <Music className="text-zinc-500 mb-2" size={24}/><span className="text-[10px] text-zinc-500 font-black uppercase">{uploadFile ? 'Loaded' : 'Audio File'}</span>
             </div>
             <div className="h-32 bg-zinc-800 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-white/5 cursor-pointer hover:border-[#BEE7FF] relative transition-colors">
               <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
               <ImageIcon className="text-zinc-500 mb-2" size={24}/><span className="text-[10px] text-zinc-500 font-black uppercase">{coverFile ? 'Loaded' : 'Artwork'}</span>
             </div>
          </div>
          <input required value={uploadForm.title} onChange={e => setUploadForm({...uploadForm, title: e.target.value})} placeholder="Track Title" className="w-full bg-zinc-800 border-none rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-[#BEE7FF] placeholder:text-zinc-600" />
          <input value={uploadForm.artist} onChange={e => setUploadForm({...uploadForm, artist: e.target.value})} placeholder={`Artist Name (Default: ${user?.name})`} className="w-full bg-zinc-800 border-none rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-[#BEE7FF] placeholder:text-zinc-600" />
          <input value={uploadForm.featuredArtist} onChange={e => setUploadForm({...uploadForm, featuredArtist: e.target.value})} placeholder="Extra/Featured Artists (Optional)" className="w-full bg-zinc-800 border-none rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-[#BEE7FF] placeholder:text-zinc-600" />
          <div className="grid grid-cols-2 gap-4">
             <div className="relative">
                <input required type="number" value={uploadForm.price} onChange={e => setUploadForm({...uploadForm, price: e.target.value})} placeholder="Price (R)" className="w-full bg-zinc-800 border-none rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-[#BEE7FF] placeholder:text-zinc-600" />
                <button 
                  type="button"
                  onClick={handleSuggestPrice}
                  disabled={isSuggestingPrice}
                  className="absolute right-2 top-2 bottom-2 px-3 bg-[#BEE7FF]/10 hover:bg-[#BEE7FF]/20 text-[#BEE7FF] rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  {isSuggestingPrice ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  AI Price
                </button>
             </div>
             <select required value={uploadForm.genre} onChange={e => setUploadForm({...uploadForm, genre: e.target.value})} className="w-full bg-zinc-800 border-none rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-[#BEE7FF] appearance-none">
                <option value="" disabled>Genre</option>{APP_GENRES.map(g => <option key={g} value={g}>{g}</option>)}<option value="Other">Other</option>
             </select>
          </div>
          <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 bg-[#BEE7FF] text-black hover:bg-[#A0D8FF]" isLoading={isUploading}>Publish Now</Button>
       </form>
    </motion.div>
  );
};
