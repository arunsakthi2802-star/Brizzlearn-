import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, RefreshCw, Activity, Clock, AlertCircle } from 'lucide-react';
import { getMarketPulseNews } from '../services/geminiService';
import { Article } from '../types';

const REFRESH_INTERVAL_SEC = 300; // 5 minutes refresh for rate limit safety

export default function NewsView({ filter }: { filter?: string }) {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_SEC); 

  const fetchPulse = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMarketPulseNews(filter);
      setNews(data);
      setCountdown(REFRESH_INTERVAL_SEC);
    } catch (err: any) {
      console.error("Pulse Link Failed", err);
      if (err?.message?.includes('429')) {
        setError("Rate limit reached. Auto-refreshing soon...");
      } else {
        setError("Uplink failed. Check connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPulse();
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          fetchPulse();
          return REFRESH_INTERVAL_SEC;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [filter]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 pb-24 text-left px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <p className="text-[8px] md:text-[10px] font-black text-red-500 uppercase tracking-[0.6em]">Ultra-Fast Market Pulse</p>
           </div>
           <h2 className="text-4xl md:text-9xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">News Vector.</h2>
        </div>
        
        <div className="flex items-center gap-6 bg-white p-4 md:p-6 rounded-2xl md:rounded-[32px] border border-slate-100 shadow-xl w-full md:w-auto justify-between">
           {error && (
             <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase">
                <AlertCircle size={14} /> {error}
             </div>
           )}
           <div className="space-y-1 pr-6 border-r">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Next Uplink</p>
              <p className="text-xl md:text-2xl font-black text-indigo-600 italic tabular-nums">{countdown}s</p>
           </div>
           <button 
             onClick={fetchPulse}
             disabled={loading}
             className="p-3 md:p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl transition-all"
           >
             <RefreshCw size={20} className={loading ? 'animate-spin text-indigo-600' : 'text-slate-400'} />
           </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading && news.length === 0 ? (
           <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 md:py-40 flex flex-col items-center justify-center space-y-6 md:space-y-10 text-slate-200">
              <Activity size={80} className="animate-pulse" />
              <p className="text-lg md:text-2xl font-black uppercase tracking-[0.5em] md:tracking-[1em] italic text-center">Synchronizing Signals...</p>
           </motion.div>
        ) : (
          <motion.div key="news" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 md:space-y-12">
            {news.length > 0 && (
              <div className="bg-slate-950 p-8 md:p-20 rounded-[32px] md:rounded-[64px] text-white relative overflow-hidden group border border-white/5 shadow-3xl">
                <div className="relative z-10 space-y-6 md:space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="px-3 py-1 bg-red-600 rounded-full text-[8px] font-black uppercase tracking-widest">FLASH SIGNAL</div>
                      <span className="text-slate-500 font-black uppercase text-[9px] tracking-widest">{news[0].source}</span>
                    </div>
                    <h3 className="text-2xl md:text-7xl font-black tracking-tighter uppercase italic leading-none group-hover:text-indigo-400 transition-colors">{news[0].title}</h3>
                    <p className="text-base md:text-3xl text-slate-400 font-bold max-w-4xl leading-tight">{news[0].summary}</p>
                    <a href={news[0].url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-white text-slate-950 px-6 py-4 md:px-10 md:py-6 rounded-2xl md:rounded-3xl font-black text-lg md:text-xl hover:bg-indigo-100 transition-all uppercase italic tracking-tighter shadow-xl">Explore Vector <ExternalLink size={18} /></a>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-indigo-600/10 blur-[80px] md:blur-[120px] rounded-full" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {news.slice(1).map((a, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 md:p-10 rounded-[24px] md:rounded-[56px] border border-slate-100 hover:shadow-3xl transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden">
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em]">{a.tag}</span>
                      <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase flex items-center gap-2"><Clock size={12}/> {a.date}</span>
                    </div>
                    <h4 className="text-xl md:text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tighter leading-tight uppercase italic">{a.title}</h4>
                    <p className="text-sm md:text-base text-slate-400 font-bold line-clamp-2">{a.summary}</p>
                  </div>
                  <div className="mt-8 pt-6 md:mt-10 md:pt-8 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest">{a.source}</span>
                    <a href={a.url} target="_blank" className="p-3 bg-slate-50 rounded-xl hover:bg-slate-950 hover:text-white transition-all"><ExternalLink size={20}/></a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}