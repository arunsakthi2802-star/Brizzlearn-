
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, CheckCircle2, Search, Sparkles, Rocket, Cpu, Globe, Zap, RefreshCw, X } from 'lucide-react';
import { PROJECTS } from '../constants';
import { getProjectRoadmap } from '../services/geminiService';
import { Project } from '../types';

export default function ProjectsView() {
  const [tier, setTier] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiProject, setAiProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const handleArchitect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const roadmap = await getProjectRoadmap(searchQuery);
      setAiProject(roadmap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentProjects = aiProject ? [aiProject] : PROJECTS.filter(p => p.tier === tier);

  return (
    <div className="max-w-7xl mx-auto space-y-12 md:space-y-24 pb-24 text-left">
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Blueprint Repository</p>
          <h2 className="text-6xl md:text-9xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">Matrix.</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <form onSubmit={handleArchitect} className="flex-1 lg:w-[400px] bg-white border-2 border-slate-100 rounded-[32px] p-2 flex items-center shadow-xl">
            <Search className="ml-4 text-slate-300" size={24} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="PROJECT ARCHITECT..." 
              className="flex-1 bg-transparent outline-none p-4 font-black uppercase italic text-lg tracking-tighter"
            />
            <button disabled={loading} className="bg-slate-950 text-white p-4 rounded-2xl hover:bg-indigo-600 transition-all">
              {loading ? <RefreshCw className="animate-spin" size={24}/> : <Sparkles size={24} />}
            </button>
          </form>

          <div className="flex gap-2 p-2 bg-white border-2 border-slate-100 rounded-[32px] shadow-xl">
            {[1, 2, 3].map(t => (
              <button key={t} onClick={() => { setTier(t); setAiProject(null); }} className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest relative transition-all ${tier === t && !aiProject ? 'text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                {tier === t && !aiProject && <motion.div layoutId="projTier" className="absolute inset-0 bg-slate-950 rounded-2xl" />}
                <span className="relative z-10">Tier {t}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {aiProject && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-600 p-6 rounded-3xl text-white flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Sparkles className="animate-pulse" />
              <span className="font-black uppercase tracking-widest text-[10px]">AI-Generated Blueprint Active</span>
           </div>
           <button onClick={() => setAiProject(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
        <AnimatePresence mode="popLayout">
          {currentProjects.map((p, idx) => (
            <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-[64px] p-10 md:p-16 border-2 border-slate-50 hover:border-indigo-100 hover:shadow-3xl transition-all group flex flex-col relative overflow-hidden h-full">
              <div className="mb-12">
                <div className="flex flex-wrap gap-2 mb-6">
                  {p.tech.map(t => (
                    <span key={t} className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">{t}</span>
                  ))}
                </div>
                <h3 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase group-hover:text-indigo-600 transition-colors leading-none italic">{p.title}</h3>
                <p className="text-slate-500 font-bold leading-tight text-xl md:text-2xl">{p.description}</p>
              </div>
              
              <div className="space-y-8 flex-1">
                {p.phases.map((ph, pi) => (
                  <div key={ph.id} className="bg-slate-50 p-8 rounded-[48px] border-2 border-transparent hover:border-indigo-100 transition-all">
                    <div className="flex items-center justify-between mb-8">
                       <h4 className="font-black text-[12px] uppercase tracking-[0.4em] text-indigo-600 flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm ${pi === 0 ? 'bg-emerald-500' : pi === 1 ? 'bg-amber-500' : 'bg-rose-500'}`}>{pi + 1}</div>
                        {ph.title}
                       </h4>
                    </div>
                    <ul className="space-y-4 mb-6">
                      {ph.tasks.map(t => (
                        <li key={t} className="text-sm md:text-lg font-black text-slate-700 flex items-center gap-4 uppercase tracking-tighter">
                          <CheckCircle2 size={20} className="text-emerald-500 shrink-0"/> {t}
                        </li>
                      ))}
                    </ul>
                    {ph.details && (
                      <div className="bg-white/50 p-6 rounded-3xl text-sm font-bold text-slate-500 leading-relaxed border border-white">
                         <p className="text-[10px] font-black uppercase text-indigo-400 mb-2">Technical Insight</p>
                         {ph.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button className="w-full mt-14 bg-slate-950 text-white py-8 rounded-[40px] font-black flex items-center justify-center gap-6 hover:bg-indigo-600 transition-all text-2xl shadow-3xl uppercase tracking-tighter italic">
                <Github size={32}/> Initialize Repo
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
