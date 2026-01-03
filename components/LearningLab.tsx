
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Download, FileText, Sparkles, Terminal, Headphones, Layout, Zap, Trash2, RefreshCw, Trophy, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { Resource } from '../types';
import { suggestAlternativeVideos } from '../services/geminiService';

interface LearningLabProps {
  resource: Resource;
  userLanguage: string;
  onBack: () => void;
}

export default function LearningLab({ resource, userLanguage, onBack }: LearningLabProps) {
  const [hints, setHints] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [activeRes, setActiveRes] = useState<Resource>(resource);
  const [activeVideos, setActiveVideos] = useState<Resource[]>([resource]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleRepairUplink = async () => {
    setIsRegenerating(true);
    // Fetch a pool of embeddable alternatives
    const alternatives = await suggestAlternativeVideos(activeRes.title, userLanguage);
    if (alternatives && alternatives.length > 0) {
      // Prioritize videos that are embeddable (enforced by service)
      setActiveVideos(alternatives);
      setActiveRes(alternatives[0]);
      setCurrentIndex(0);
    }
    setIsRegenerating(false);
  };

  const switchSignal = (direction: 'next' | 'prev') => {
    if (activeVideos.length <= 1) return;
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= activeVideos.length) newIndex = 0;
    if (newIndex < 0) newIndex = activeVideos.length - 1;
    
    setCurrentIndex(newIndex);
    setActiveRes(activeVideos[newIndex]);
  };

  const handleExportText = () => {
    const element = document.createElement("a");
    const file = new Blob([`Brizzlearn Mastery Hints\nResource: ${activeRes.title}\n\n${hints}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `BrizzHints_${activeRes.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const handleExportPdf = () => window.print();

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const videoId = getYoutubeId(activeRes.url);

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-8 pb-12 print:p-0">
      {/* Learning Lab Header */}
      <div className="flex items-center justify-between no-print px-4 py-2 border-b border-slate-100">
        <div className="text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Learning Lab.</h1>
          <p className="text-[8px] md:text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] md:tracking-[0.6em] mt-1">
            ELITE MISSION SPECIALIST TRAJECTORY
          </p>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden sm:flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl text-[10px] font-black text-white shadow-lg uppercase tracking-widest">
            <Trophy size={14} className="text-yellow-400" /> 0 SECURED
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 shadow-sm">
            <User size={20} />
          </div>
        </div>
      </div>

      {/* Main Controls Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 no-print px-4">
        <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
          <button 
            onClick={onBack}
            className="p-3 md:p-4 bg-white rounded-2xl border border-slate-100 shadow-xl text-slate-400 hover:text-indigo-600 transition-all group shrink-0"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="text-left overflow-hidden">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1 block">Learning Lab Uplink</span>
            <h2 className="text-xl md:text-4xl font-black text-slate-950 tracking-tighter italic uppercase truncate">{activeRes.title}</h2>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleSave}
            className="flex-1 sm:flex-none px-6 py-3 md:px-8 md:py-4 bg-white border border-slate-100 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
          >
            {isSaved ? "Synced" : "Sync Draft"} <Save size={14} className={isSaved ? "text-emerald-500" : ""} />
          </button>
          <div className="flex gap-2">
            <button onClick={handleExportText} className="p-3 md:p-4 bg-slate-950 text-white rounded-xl md:rounded-2xl hover:bg-indigo-600 transition-all shadow-xl group">
              <FileText size={18} />
            </button>
            <button onClick={handleExportPdf} className="p-3 md:p-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl hover:bg-indigo-700 transition-all shadow-xl group">
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-12 min-h-0 no-print px-4">
        {/* Visual Terminal */}
        <div className="xl:col-span-8 flex flex-col h-full bg-slate-950 rounded-[32px] md:rounded-[56px] border border-white/5 shadow-3xl overflow-hidden relative">
          <div className="bg-slate-900 px-6 py-4 md:px-8 md:py-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Visual Stream v4.2</span>
            </div>
            
            <div className="flex items-center gap-4">
              {activeVideos.length > 1 && (
                <div className="flex items-center gap-2 mr-4 border-r border-white/10 pr-4">
                  <button onClick={() => switchSignal('prev')} className="p-1 text-slate-500 hover:text-white transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-[9px] font-black text-indigo-400 w-16 text-center uppercase tracking-tighter italic">
                    Signal {currentIndex + 1}/{activeVideos.length}
                  </span>
                  <button onClick={() => switchSignal('next')} className="p-1 text-slate-500 hover:text-white transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
              <button 
                onClick={handleRepairUplink}
                disabled={isRegenerating}
                className="flex items-center gap-2 text-[8px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors disabled:opacity-30"
              >
                <RefreshCw size={12} className={isRegenerating ? "animate-spin" : ""} /> {isRegenerating ? "Re-vectoring..." : "Signal Lost? Repair Uplink"}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-black relative">
            {videoId ? (
              <iframe 
                key={activeRes.id} // Forces re-mount when switching signals
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&hl=${userLanguage.toLowerCase().substring(0, 2)}`}
                title={activeRes.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-6">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-full flex items-center justify-center">
                   <Layout size={32} />
                </div>
                <p className="font-black uppercase tracking-widest text-xs">Waiting for signal uplink...</p>
                <button 
                  onClick={handleRepairUplink}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest"
                >
                  Force Signal Sync
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Note Capture Terminal */}
        <div className="xl:col-span-4 flex flex-col h-full bg-white rounded-[32px] md:rounded-[56px] border border-slate-100 shadow-2xl overflow-hidden relative group">
          <div className="bg-slate-50 px-6 py-4 md:px-8 md:py-6 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <Terminal size={14} /> Hint Console
            </h4>
            <button onClick={() => setHints('')} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="flex-1 flex flex-col p-6 md:p-10 relative">
            <div className="absolute top-10 left-10 pointer-events-none opacity-[0.03] select-none">
              <FileText size={200} />
            </div>
            
            <textarea 
              className="flex-1 bg-transparent text-slate-900 font-bold text-base md:text-xl outline-none resize-none leading-relaxed placeholder:text-slate-200 custom-scrollbar z-10"
              placeholder="CAPTURE MISSION HINTS HERE..."
              value={hints}
              onChange={(e) => setHints(e.target.value)}
              spellCheck={false}
            />

            <div className="mt-6 md:mt-8 pt-4 md:pt-8 border-t border-slate-50 flex items-center gap-4 md:gap-6 z-10">
              <div className="flex-1 space-y-1">
                <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Sync Status</p>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div animate={{ width: hints.length > 0 ? "100%" : "0%" }} className="h-full bg-indigo-600" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <Headphones size={18} />
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-400">
                  <Sparkles size={18} className="animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only View for PDF Export */}
      <div className="hidden print:block p-10 md:p-20 space-y-12 bg-white text-slate-900">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Brizzlearn Mastery Hints</h1>
        <div className="space-y-4">
          <p className="text-xl font-black uppercase text-indigo-600">Resource:</p>
          <p className="text-2xl md:text-4xl font-black italic">{activeRes.title}</p>
        </div>
        <div className="pt-10 space-y-6">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight border-b-2 border-slate-100 pb-4">Hints Captured</h2>
          <div className="text-xl md:text-2xl font-medium leading-relaxed whitespace-pre-wrap text-slate-800">
            {hints || "No hints captured."}
          </div>
        </div>
      </div>
    </div>
  );
}
