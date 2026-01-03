
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, MapPin, DollarSign, Briefcase, ChevronRight, Building2, CheckCircle2, ExternalLink, X, Zap, Search, Filter, RefreshCw, Sparkles, Globe, Tag } from 'lucide-react';
import { Job, UserProfile } from '../types';
import { searchJobsAI } from '../services/geminiService';

interface LaunchpadViewProps {
  user: UserProfile;
  jobs: Job[];
  onApply: (id: string) => void;
}

export default function LaunchpadView({ user, jobs, onApply }: LaunchpadViewProps) {
  const [activeJobs, setActiveJobs] = useState<Job[]>(jobs);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [skillInput, setSkillInput] = useState(user.knownSkills.join(', '));
  const [searchParams, setSearchParams] = useState({
    role: user.interest || 'Software Engineer',
    location: 'India & Global',
    experience: user.skillLevel,
    skills: user.knownSkills
  });

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const skillsArr = skillInput.split(',').map(s => s.trim()).filter(Boolean);
      const results = await searchJobsAI({ ...searchParams, skills: skillsArr });
      setActiveJobs(results);
    } catch (error) {
      console.error("AI Search Failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 md:space-y-24 pb-24 text-left px-4">
      {/* Visual Ticker & Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em]">Sector Vectors</p>
          <h2 className="text-6xl md:text-9xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">Launch Pad.</h2>
          <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full w-fit">
            <Globe size={14} className="animate-spin" />
            <span className="text-[9px] font-black uppercase tracking-widest">Global & India Active Nodes</span>
          </div>
        </div>
        
        <form onSubmit={handleAISearch} className="w-full xl:max-w-4xl bg-white p-6 md:p-8 rounded-[40px] border-2 border-slate-100 shadow-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
           <div className="space-y-2">
             <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Role / Category</label>
             <input value={searchParams.role} onChange={e => setSearchParams({...searchParams, role: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold text-sm uppercase border border-transparent focus:border-indigo-100 transition-all" />
           </div>
           <div className="space-y-2">
             <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Location</label>
             <input value={searchParams.location} onChange={e => setSearchParams({...searchParams, location: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold text-sm uppercase border border-transparent focus:border-indigo-100 transition-all" />
           </div>
           <div className="space-y-2">
             <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Experience</label>
             <select value={searchParams.experience} onChange={e => setSearchParams({...searchParams, experience: e.target.value as any})} className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold text-sm uppercase border border-transparent focus:border-indigo-100 transition-all appearance-none">
               <option>Beginner</option>
               <option>Intermediate</option>
               <option>Advanced</option>
             </select>
           </div>
           <div className="space-y-2">
             <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Required Skills</label>
             <div className="relative">
               <input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="React, Node..." className="w-full bg-slate-50 p-4 pr-10 rounded-2xl outline-none font-bold text-sm uppercase border border-transparent focus:border-indigo-100 transition-all" />
               <Tag size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
             </div>
           </div>
           <button disabled={isSearching} className="bg-slate-950 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-2 group">
             {isSearching ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles className="group-hover:rotate-12" size={20} />} 
             <span>Sync</span>
           </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {activeJobs.map((j, idx) => (
            <motion.div 
              key={j.id || idx} 
              layout 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-10 md:p-14 rounded-[56px] border-2 border-slate-50 hover:border-indigo-100 hover:shadow-3xl transition-all relative overflow-hidden group flex flex-col h-full"
            >
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${j.category === 'internship' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {j.category.toUpperCase()}
                  </div>
                </div>
                <h4 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase group-hover:text-indigo-600 transition-colors leading-none italic">{j.role}</h4>
                <p className="text-slate-400 font-black text-xl uppercase italic tracking-tighter">{j.company}</p>
              </div>
              
              <div className="space-y-5 mb-12 flex-1">
                <div className="flex items-center gap-4 text-slate-500 font-bold">
                   <MapPin size={20} className="text-indigo-600" />
                   <span className="text-xs md:text-sm uppercase tracking-widest">{j.location}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-500 font-bold">
                   <DollarSign size={20} className="text-emerald-600" />
                   <span className="text-xs md:text-sm uppercase tracking-widest">{j.salary}</span>
                </div>
              </div>

              <button onClick={() => setSelectedJob(j)} className="w-full bg-slate-950 text-white py-6 rounded-3xl font-black text-xl hover:bg-indigo-600 transition-all shadow-3xl uppercase tracking-tighter italic flex items-center justify-center gap-4">
                Explore Protocol <ChevronRight size={24} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedJob(null)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" />
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative bg-white w-full max-w-4xl rounded-[64px] overflow-hidden border-4 border-indigo-600/20 flex flex-col max-h-[90vh]">
                <div className="p-10 md:p-14 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-50">
                   <div className="space-y-2 text-left">
                     <p className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.4em]">{selectedJob.company} Vector</p>
                     <h3 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{selectedJob.role}</h3>
                   </div>
                   <button onClick={() => setSelectedJob(null)} className="p-5 bg-slate-50 rounded-2xl hover:text-red-500 transition-all"><X size={32} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 md:p-14 space-y-16 text-left custom-scrollbar">
                   <div className="space-y-8">
                      <h5 className="text-[14px] font-black uppercase text-slate-400 tracking-[0.6em] flex items-center gap-5">
                         <Building2 size={24} /> Mission Briefing
                      </h5>
                      <p className="text-2xl md:text-4xl font-bold text-slate-700 leading-tight">{selectedJob.description}</p>
                   </div>

                   <div className="space-y-8">
                      <h5 className="text-[14px] font-black uppercase text-slate-400 tracking-[0.6em] flex items-center gap-5">
                         <CheckCircle2 size={24} /> Eligibility Matrix
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedJob.eligibility?.map((e, idx) => (
                          <div key={idx} className="flex items-center gap-6 p-8 bg-slate-50 rounded-[32px] border-2 border-slate-100">
                             <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg"><Zap size={18}/></div>
                             <span className="text-xl font-black uppercase italic tracking-tighter text-slate-800 leading-none">{e}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="p-10 md:p-14 border-t border-slate-50 flex flex-col md:flex-row gap-6 bg-white sticky bottom-0 z-50">
                   <button onClick={() => { onApply(selectedJob.id); setSelectedJob(null); }} className="flex-1 bg-slate-950 text-white py-8 rounded-[40px] font-black text-2xl uppercase tracking-tighter italic hover:bg-indigo-600 transition-all shadow-3xl">Track in Vault</button>
                   <a href={selectedJob.applyUrl} target="_blank" className="flex-1 bg-indigo-600 text-white py-8 rounded-[40px] font-black text-2xl uppercase tracking-tighter italic hover:bg-indigo-700 transition-all shadow-3xl flex items-center justify-center gap-5">Apply Externally <ExternalLink size={32} /></a>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
