
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: { full_name: string } | null;
}

interface CommentsProps {
  trackId: string;
  user: User | null;
}

export const Comments: React.FC<CommentsProps> = ({ trackId, user }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchComments();
    
    // Subscribe to new comments for this track
    const channel = supabase
      .channel('public:comments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `track_id=eq.${trackId}` }, (payload) => {
          fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trackId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(full_name)')
      .eq('track_id', trackId)
      .order('created_at', { ascending: false });
    
    if (data) setComments(data);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    setIsLoading(true);

    const { error } = await supabase
      .from('comments')
      .insert({
        track_id: trackId,
        user_id: user.id,
        content: newComment.trim()
      });
    
    if (!error) {
      setNewComment('');
      // Optimistic update or wait for realtime
      fetchComments(); 
    }
    setIsLoading(false);
  };

  return (
    <div className="mt-8 px-6 pb-24 md:max-w-2xl md:mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
       <div className="flex items-center gap-2 mb-4 text-white">
          <MessageSquare size={18} className="text-violet-400" />
          <h3 className="font-bold text-lg">Vibe Check</h3>
          <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-zinc-400 font-medium">{comments.length}</span>
       </div>
       
       {/* Input */}
       <form onSubmit={handlePost} className="relative mb-8 group">
         <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
         <input 
            type="text" 
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder={user ? "Share your thoughts..." : "Login to join the conversation"}
            disabled={!user || isLoading}
            className="relative w-full bg-zinc-900 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-violet-500 focus:bg-zinc-900/80 transition-all placeholder:text-zinc-600 shadow-xl"
         />
         <button 
            type="submit" 
            disabled={!user || !newComment.trim() || isLoading}
            className="absolute right-2 top-2 p-1.5 text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-0 disabled:scale-75 transition-all shadow-lg active:scale-95"
         >
            <Send size={16} />
         </button>
       </form>

       {/* List */}
       <div className="space-y-4">
          {comments.length === 0 ? (
             <div className="text-zinc-600 text-sm font-medium text-center py-8 border border-dashed border-white/5 rounded-2xl bg-white/5">
                No comments yet.<br/>Be the first to hype this track!
             </div>
          ) : (
             comments.map(c => (
                <div key={c.id} className="flex gap-3 group">
                   <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center shrink-0 border border-white/10 shadow-md">
                      <span className="text-[10px] font-black text-white">{c.profiles?.full_name?.charAt(0) || 'U'}</span>
                   </div>
                   <div className="flex-1 min-w-0 bg-white/5 p-3 rounded-tr-2xl rounded-bl-2xl rounded-br-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                         <span className="text-violet-200 text-xs font-bold">{c.profiles?.full_name || 'Music Fan'}</span>
                         <span className="text-zinc-600 text-[10px] font-medium">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed break-words font-medium">{c.content}</p>
                   </div>
                </div>
             ))
          )}
       </div>
    </div>
  );
};
