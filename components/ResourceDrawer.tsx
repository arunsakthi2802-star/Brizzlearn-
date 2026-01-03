import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle, Code2, Youtube, GraduationCap, FileText, Sparkles, Layers, Box, Zap, RefreshCw, Globe, ChevronDown, Download, Lock } from 'lucide-react';
import { RoadmapNode, Resource } from '../types';
import { getLocalizedResources } from '../services/geminiService';

interface ResourceDrawerProps {
  node: RoadmapNode;
  onClose: () => void;
  onStartCoding: () => void;
  onLaunchLab: (res: Resource) => void;
  isCompleted: boolean;
  onToggleComplete: () => void;
}

const LANGUAGES = [
  { label: 'English', value: 'English' },
  { label: 'Hindi (हिन्दी)', value: 'Hindi' },
  { label: 'Tamil (தமிழ்)', value: 'Tamil' },
  { label: 'Telugu (తెలుగు)', value: 'Telugu' },
  { label: 'Kannada (ಕನ್ನಡ)', value: 'Kannada' },
  { label: 'Malayalam (മലയാളം)', value: 'Malayalam' },
  { label: 'Marathi (మరాठी)', value: 'Marathi' },
  { label: 'Bengali (বাংলা)', value: 'Bengali' },
  { label: 'Gujarati (ગુજરાતી)', value: 'Gujarati' },
  { label: 'Punjabi (ಪੰਜਾਬี)', value: 'Punjabi' }
];

const renderResourceIcon = (type: string) => {
  switch (type) {
    case 'youtube': return <Youtube size={20} className="text-red-500" />;
    case 'pdf': return <FileText size={20} className="text-blue-500" />;
    case 'course': return <GraduationCap size={20} className="text-indigo-500" />;
    default: return <Zap size={20} className="text-slate-500" />;
  }
};

export default function ResourceDrawer({ node, onClose, onStartCoding, onLaunchLab, isCompleted, onToggleComplete }: ResourceDrawerProps) {
  const [activeVideos, setActiveVideos] = useState<Resource[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(node.topics?.[0] || null);
  const debounceTimer = useRef<number | null>(null);

  const counts = useMemo(() => {
    return {
      youtube: activeVideos.filter(v => v.type === 'youtube').length,
      pdf: activeVideos.filter(v => v.type === 'pdf').length,
      course: activeVideos.filter(v => v.type === 'course').length
    };
  }, [activeVideos]);

  useEffect(() => {
    let isMounted = true;
    
    // Clear previous timer
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);

    const fetch = async () => {
      setIsAnalyzing(true);
      try {
        const query = `${node.title} ${expandedTopic || ''}`;
        const res = await getLocalizedResources(query, selectedLanguage, 10);
        if (isMounted) setActiveVideos(res);
      } catch (e) {
        console.error("Resource fetch failed", e);
      } finally {
        if (isMounted) setIsAnalyzing(false);
      }
    };

    // Debounce for 800ms
    debounceTimer.current = window.setTimeout(() => {
      fetch();
    }, 800);

    return () => { 
      isMounted = false; 
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [node.title, expandedTopic, selectedLanguage]);

  const handleMore = async () => {
    setIsAnalyzing(true);
    try {
      const more = await getLocalizedResources(node.title + " advanced deep dive", selectedLanguage, 10);
      setActiveVideos(prev => [...prev, ...more]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      className="fixed inset-y-0 right-0 w-full md:w-[650px] lg:w-[800px] bg-white shadow-3xl z-[200] flex flex-col border-l-[6px] border-slate-950"
    >
      <div className="p-6 md:p-10 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="text-left">
           <h3 className="font-black text-2xl md:text-5xl text-slate-900 tracking-tighter leading-none uppercase italic">{node.title}</h3>
           <div className="flex items-center gap-4 mt-3">
             <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <Globe size={14} className="text-slate-400" />
                <select 
                  value={selectedLanguage} 
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase outline-none"
                >
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
             </div>
             <div className="flex gap-2">
               {counts.youtube > 0 && <span className="text-[8px] font-black bg-red-50 text-red-600 px-2 py-1 rounded-md">{counts.youtube} VIDEO</span>}
               {counts.pdf > 0 && <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{counts.pdf} PDF</span>}
               {counts.course > 0 && <span className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">{counts.course} COURSE</span>}
             </div>
           </div>
        </div>
        <button onClick={onClose} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all shadow-xl group">
          <X size={24} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12 custom-scrollbar">
        <div className="space-y-6">
           <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.6em] flex items-center gap-3">
             <Layers size={14} /> Milestones
           </h4>
           <div className="grid grid-cols-1 gap-4">
             {node.topics?.map((topic, i) => (
               <div key={topic} className={`rounded-[32px] border-2 transition-all ${expandedTopic === topic ? 'border-indigo-600 bg-indigo-50/10' : 'border-slate-50 bg-white'}`}>
                 <button onClick={() => setExpandedTopic(topic)} className="w-full p-6 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${expandedTopic === topic ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {i + 1}
                      </div>
                      <span className="font-black uppercase italic tracking-tighter text-xl sm:text-2xl text-left leading-none">{topic}</span>
                    </div>
                    <ChevronDown className={`transition-transform ${expandedTopic === topic ? 'rotate-180 text-indigo-600' : 'text-slate-300'}`} />
                 </button>
                 
                 <AnimatePresence>
                   {expandedTopic === topic && (
                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 space-y-6 overflow-hidden">
                        <div className="h-px bg-slate-100 mb-2" />
                        <div className="grid grid-cols-1 gap-4">
                          {isAnalyzing && activeVideos.length === 0 ? (
                            <div className="py-20 text-center animate-pulse space-y-4">
                              <RefreshCw className="mx-auto animate-spin text-indigo-600" size={40} />
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Architecting Resource Vectors...</p>
                            </div>
                          ) : (
                            activeVideos.map((res, rid) => (
                              <motion.div key={rid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-[28px] border-2 border-slate-50 hover:border-indigo-200 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-sm">
                                <div className="p-4 bg-slate-50 rounded-2xl shrink-0">{renderResourceIcon(res.type)}</div>
                                <div className="flex-1 text-left min-w-0">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{res.provider}</p>
                                   <h5 className="font-black text-slate-900 text-lg uppercase italic tracking-tighter truncate">{res.title}</h5>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                   <button onClick={() => onLaunchLab(res)} className="flex-1 sm:flex-none bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg">Lab</button>
                                   <a href={res.url} target="_blank" className="p-3 bg-slate-950 text-white rounded-xl hover:bg-slate-800"><Zap size={16} /></a>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                        <button onClick={handleMore} disabled={isAnalyzing} className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3">
                           {isAnalyzing ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                           Analyze More Available Resources
                        </button>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             ))}
           </div>
        </div>

        <div className="bg-slate-950 p-10 rounded-[64px] text-white shadow-3xl relative overflow-hidden group">
          <div className="relative z-10 space-y-8 text-left">
            <h4 className="font-black text-3xl flex items-center gap-6 text-indigo-400 leading-none uppercase italic tracking-tighter">
              <Code2 size={40} /> Operational IDE
            </h4>
            <p className="text-xl md:text-2xl text-slate-400 font-bold leading-tight">Initialize the virtual simulation to verify proficiency for this milestone.</p>
            <button onClick={onStartCoding} className="w-full bg-white text-slate-950 py-6 rounded-[32px] font-black text-2xl hover:bg-indigo-100 transition-all uppercase tracking-tighter italic">Execute Command</button>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full" />
        </div>
      </div>
      
      <div className="p-8 md:p-12 border-t-2 border-slate-50 bg-white sticky bottom-0 z-50">
        <button onClick={onToggleComplete} className={`w-full py-8 rounded-[48px] font-black text-3xl transition-all shadow-3xl uppercase tracking-tighter italic ${isCompleted ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
          {isCompleted ? "Protocol Verified ✓" : "Commit Mastery Protocol"}
        </button>
      </div>
    </motion.div>
  );
}
