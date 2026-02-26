import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';
import { motion } from 'motion/react';
import { Button } from '../components/Button';
import { User as UserIcon, Camera, Loader2 } from 'lucide-react';

interface ProfileProps {
  user: User | null;
  setUser: (user: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, setUser }) => {
  const [isUploading, setIsUploading] = useState(false);

  if (!user) return null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const ts = Date.now();
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${ts}_avatar.${ext}`;
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const avatarUrl = `${data.publicUrl}?t=${ts}`;

      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
      if (updateError) throw updateError;

      setUser({ ...user, avatarUrl });
    } catch (error: any) {
      alert(`Failed to upload avatar: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto py-12 px-4"
    >
      <h2 className="text-3xl font-black text-white mb-8 tracking-tight">My Profile</h2>
      
      <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-center">
        
        <div className="relative group mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-zinc-800 border-4 border-zinc-700 flex items-center justify-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={48} className="text-zinc-500" />
            )}
          </div>
          
          <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
            {isUploading ? <Loader2 size={24} className="text-white animate-spin" /> : <Camera size={24} className="text-white" />}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
          </label>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">{user.name}</h3>
        <p className="text-zinc-400 mb-8">{user.email}</p>

        <div className="w-full grid grid-cols-2 gap-4">
          <div className="bg-zinc-800 p-6 rounded-2xl text-center">
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Account Type</p>
            <p className="text-white font-medium">{user.isArtist ? 'Artist' : 'Listener'}</p>
          </div>
          <div className="bg-zinc-800 p-6 rounded-2xl text-center">
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Library Size</p>
            <p className="text-white font-medium">{user.library.length} Tracks</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
