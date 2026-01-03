
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Database, ShieldAlert, Cpu, ArrowRight, X, Sparkles, Activity, Zap, Search, Layers, ChevronDown } from 'lucide-react';
import { Recommendation } from '../types';
import { getCareerRecommendations } from '../services/geminiService';

interface MissionSetupProps {
  onSelectPath: (p: Recommendation) => void;
  userLanguage: string;
}

const SKILL_POOL = [
  'React', 'Next.js', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Django', 'Flask', 'FastAPI', 
  'Java', 'Spring Boot', 'C++', 'C#', '.NET', 'Ruby', 'Rails', 'PHP', 'Laravel', 'SQL', 'PostgreSQL', 
  'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform', 'Git', 'Figma', 'GraphQL', 
  'Tailwind CSS', 'Redux', 'TensorFlow', 'PyTorch', 'Data Science', 'Machine Learning', 
  'Cybersecurity', 'Linux', 'Shell Scripting', 'Swift', 'Kotlin', 'Flutter', 'React Native',
  'Rust', 'Go', 'Solidity', 'Web3', 'Blockchain', 'UI/UX Design', 'Product Management', 'DevOps', 'Data Engineering'
].sort();

export default function MissionSetup({ onSelectPath, userLanguage }: MissionSetupProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recs, setRecs] = useState<Recommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState<'domains' | 'skills'>('domains');
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = SKILL_POOL.filter(s => 
        s.toLowerCase().includes(inputValue.toLowerCase()) && !skills.includes(s)
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, skills]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDomainSelect = async (domain: typeof FEATURED_DOMAINS[0]) => {
    setLoading(true);
    const results = await getCareerRecommendations(domain.skills, userLanguage);
    if (results) setRecs(results);
    setLoading(false);
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const fetchRecs = async () => {
    if (skills.length === 0) return;
    setLoading(true);
    const results = await getCareerRecommendations(skills, userLanguage);
    setRecs(results);
    setLoading(false);
  };

  const FEATURED_DOMAINS = [
    { id: 'web', title: 'WEB INFRA', icon: <Globe />, skills: ['React', 'Node.js', 'PostgreSQL'], desc: 'Architect robust digital experiences across the continuum.' },
    { id: 'ai', title: 'NEURAL ARCH', icon: <Cpu />, skills: ['Python', 'TensorFlow', 'Data Science'], desc: 'Engineer intelligence layers and machine learning models.' },
    { id: 'sec', title: 'PERIMETER', icon: <ShieldAlert />, skills: ['Linux', 'Networking', 'Pentesting'], desc: 'Safeguard global data against advanced cyber threats.' },
    { id: 'data', title: 'DATA ENGINE', icon: <Database />, skills: ['SQL', 'BigQuery', 'Tableau'], desc: 'Convert raw information into operational insights.' },
  ];

  if (recs) return <PathResults recs={recs} onSelectPath={onSelectPath} onBack={() => setRecs(null)} />;

  return (
    <div className="max-w-7xl mx-auto py-12 md:py-20 px-4 md:px-10 text-left">
      <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-4">
          <p className="text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-[0.5em]">Trajectory Initialization</p>
          <h2 className="text-5xl md:text-8xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">Selection.</h2>
        </div>
        
        <div className="flex bg-white border border-slate-100 rounded-3xl p-2 shadow-xl">
          <button 
            onClick={() => setSetupMode('domains')}
            className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${setupMode === 'domains' ? 'bg-slate-950 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Sectors
          </button>
          <button 
            onClick={() => setSetupMode('skills')}
            className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${setupMode === 'skills' ? 'bg-slate-950 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Vector
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {setupMode === 'domains' ? (
          <motion.div 
            key="domains"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10"
          >
            {FEATURED_DOMAINS.map((domain, idx) => (
              <motion.button 
                key={domain.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleDomainSelect(domain)}
                className="bg-white p-12 md:p-16 rounded-t-full rounded-b-[48px] border border-slate-100 shadow-2xl hover:shadow-3xl transition-all text-left flex flex-col items-center group relative overflow-hidden h-[550px] md:h-[650px]"
              >
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-12 shadow-inner shrink-0 ring-4 ring-white">
                  {React.cloneElement(domain.icon as React.ReactElement<any>, { size: 48 })}
                </div>
                
                <div className="flex-1 flex flex-col items-start w-full text-center sm:text-left">
                  <h3 className="text-4xl md:text-6xl font-black text-slate-950 mb-8 tracking-tighter uppercase leading-[0.8] italic w-full">{domain.title}</h3>
                  <p className="text-slate-500 text-lg md:text-xl font-bold leading-tight mb-10">{domain.desc}</p>
                </div>

                <div className="w-full pt-10 border-t border-slate-50 flex items-center justify-between text-indigo-600 font-black text-xs uppercase tracking-[0.2em] group-hover:text-indigo-800">
                  <span>ENGAGE CORE</span>
                  <ArrowRight size={24} className="group-hover:translate-x-3 transition-transform" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="skills"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-10 md:p-24 rounded-[64px] md:rounded-[100px] border border-slate-100 shadow-3xl max-w-5xl mx-auto relative overflow-visible"
          >
            <div className="space-y-12">
              <div className="relative" ref={suggestionRef}>
                <div className="flex flex-wrap gap-4 p-8 md:p-12 bg-slate-50 rounded-[48px] md:rounded-[64px] border border-slate-100 shadow-inner min-h-[200px] items-center">
                  <AnimatePresence>
                    {skills.map(s => (
                      <motion.span 
                        key={s} 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-white text-indigo-700 border-2 border-indigo-100 px-8 py-4 rounded-3xl text-sm font-black flex items-center gap-4 shadow-xl"
                      >
                        {s} <button onClick={() => setSkills(skills.filter(i => i !== s))} className="hover:text-red-500"><X size={18}/></button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  <input 
                    className="flex-1 min-w-[200px] outline-none text-3xl md:text-5xl p-6 font-black bg-transparent text-slate-950 placeholder:text-slate-200 uppercase italic tracking-tighter" 
                    placeholder="DEFINE STACK..." 
                    value={inputValue} 
                    onChange={e => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(inputValue.trim() !== '')}
                    onKeyPress={e => e.key === 'Enter' && handleAddSkill(inputValue)}
                  />
                </div>

                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 right-0 top-full mt-4 bg-white rounded-[40px] border-4 border-slate-50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] z-50 overflow-hidden"
                    >
                      {suggestions.map((s, idx) => (
                        <button 
                          key={s} 
                          onClick={() => handleAddSkill(s)}
                          className={`w-full text-left p-8 font-black text-2xl uppercase italic tracking-tighter transition-all flex items-center justify-between border-b border-slate-50 last:border-0 hover:bg-indigo-600 hover:text-white`}
                        >
                          {s} <Zap size={24} className="opacity-20" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button 
                disabled={skills.length === 0 || loading}
                onClick={fetchRecs}
                className="w-full bg-slate-950 text-white py-12 rounded-[48px] md:rounded-[64px] font-black text-3xl md:text-6xl hover:bg-indigo-600 transition-all disabled:opacity-20 flex items-center justify-center gap-8 shadow-3xl uppercase tracking-tighter italic"
              >
                GENERATE TRAJECTORY <Sparkles size={48} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {loading && <TrajectoryStoryteller skills={skills} language={userLanguage} />}
      </AnimatePresence>
    </div>
  );
}

function TrajectoryStoryteller({ skills, language }: { skills: string[], language: string }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setProgress(p => Math.min(p + 1, 99)), 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950 z-[200] flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl w-full text-center space-y-16">
        <Activity size={100} className="text-indigo-500 mx-auto animate-pulse" />
        <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none">Mapping.</h2>
        <div className="w-full h-6 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1.5">
          <motion.div animate={{ width: `${progress}%` }} className="h-full bg-indigo-600 rounded-full shadow-[0_0_40px_rgba(79,70,229,0.8)]" />
        </div>
        <div className="space-y-4">
           <p className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.8em] animate-pulse">Architecting Potential Vectors</p>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Based on stack: {skills.join(', ')}</p>
        </div>
      </div>
    </motion.div>
  );
}

function PathResults({ recs, onSelectPath, onBack }: { recs: Recommendation[], onSelectPath: (p: Recommendation) => void, onBack: () => void }) {
  return (
    <div className="space-y-16 py-16 px-6 max-w-7xl mx-auto text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.6em]">Recommended Paths</p>
          <h2 className="text-6xl md:text-9xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">Uplink.</h2>
        </div>
        <button onClick={onBack} className="px-12 py-5 bg-slate-100 border-2 border-slate-200 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-950 hover:text-white transition-all shadow-xl">← Change Matrix</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {recs.slice(0, 3).map((rec, idx) => (
          <motion.div 
            key={rec.pathId} 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
            className="bg-white p-12 md:p-16 rounded-[64px] md:rounded-[80px] border border-slate-100 shadow-3xl hover:shadow-4xl transition-all flex flex-col h-full group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-12">
               <div className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-indigo-100">
                {rec.matchScore}% Match
               </div>
               <Sparkles className="text-slate-200 group-hover:text-indigo-400 transition-colors" size={32} />
            </div>
            
            <h3 className="text-4xl md:text-5xl font-black text-slate-950 mb-6 tracking-tighter uppercase italic leading-[0.85]">{rec.title}</h3>
            
            <div className="flex-1 space-y-6 mb-12">
               <p className="text-slate-500 font-bold text-lg md:text-xl leading-snug">{rec.reason}</p>
               <div className="pt-6 border-t border-slate-50 space-y-3">
                  <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Initial Objective</p>
                  <p className="text-sm font-bold text-slate-400 line-clamp-2 italic">{rec.starterGuide}</p>
               </div>
            </div>

            <button 
              onClick={() => onSelectPath(rec)} 
              className="w-full py-8 bg-slate-950 text-white rounded-[32px] font-black text-2xl flex items-center justify-center gap-6 hover:bg-indigo-600 transition-all uppercase tracking-tighter italic shadow-3xl group"
            >
              ENGAGE VECTOR <ArrowRight size={28} className="group-hover:translate-x-3 transition-transform" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
