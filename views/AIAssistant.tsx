import React from 'react';
import { Track } from '../types';
import { Button } from '../components/Button';
import { Sparkles } from 'lucide-react';
import { getAIRecommendation } from '../services/geminiService';
import { motion } from 'motion/react';

interface AIAssistantProps {
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  aiResponse: string;
  setAiResponse: (response: string) => void;
  isAiLoading: boolean;
  setIsAiLoading: (isLoading: boolean) => void;
  allTracks: Track[];
  library: string[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  aiPrompt,
  setAiPrompt,
  aiResponse,
  setAiResponse,
  isAiLoading,
  setIsAiLoading,
  allTracks,
  library
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4"
    >
       <div className="text-center mb-12">
          <div className="h-20 w-20 bg-gradient-to-tr from-[#BEE7FF] to-[#A0D8FF] rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-[#BEE7FF]/50 animate-pulse"><Sparkles size={40} className="text-black" /></div>
          <h2 className="text-3xl font-black text-white mb-3">AI Music Guide</h2>
          <p className="text-zinc-500 font-bold">What are you in the mood for?</p>
       </div>
       <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
          <textarea 
            value={aiPrompt} 
            onChange={e => setAiPrompt(e.target.value)} 
            placeholder="e.g. 'I want something with a heavy Amapiano log drum...'" 
            className="w-full bg-zinc-800 border-none rounded-2xl p-6 text-sm text-white focus:ring-2 focus:ring-[#BEE7FF] min-h-[140px] resize-none mb-6 placeholder:text-zinc-600" 
          />
          <Button 
            onClick={async () => { 
                setIsAiLoading(true); 
                const r = await getAIRecommendation(allTracks.filter(t => library.includes(t.id)), aiPrompt); 
                setAiResponse(r); 
                setIsAiLoading(false); 
            }} 
            isLoading={isAiLoading} 
            className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-[#BEE7FF]/20 bg-[#BEE7FF] text-black hover:bg-[#A0D8FF]"
          >
            Analyze Vibes
          </Button>
       </div>
       {aiResponse && (
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 p-8 bg-[#BEE7FF]/10 border border-[#BEE7FF]/20 rounded-[2.5rem] relative overflow-hidden"
         >
            <p className="text-lg text-white font-medium leading-relaxed italic">"{aiResponse}"</p>
         </motion.div>
       )}
    </motion.div>
  );
};
