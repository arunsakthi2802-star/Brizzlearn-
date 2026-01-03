
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { X, Send, Mic2, Sparkles, Zap, MessageSquare, Search, ExternalLink, Loader2, Youtube, FileText, Globe, GraduationCap, AlertTriangle } from 'lucide-react';
import { ChatMessage } from '../types';
import { getSageChatResponse } from '../services/geminiService';

interface SageModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLanguage: string;
}

interface ResourceLink {
  title: string;
  url: string;
  type: 'video' | 'pdf' | 'web' | 'course';
}

export default function SageModal({ isOpen, onClose, userLanguage }: SageModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Systems online. I am SAGE. Trajectory analysis complete. Transmit query for immediate vectoring." }
  ]);
  const [input, setInput] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Character Parallax & Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 150 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 150 });

  const headRotateX = useTransform(smoothY, [-200, 200], [10, -10]);
  const headRotateY = useTransform(smoothX, [-200, 200], [-10, 10]);
  const headX = useTransform(smoothX, [-200, 200], [-8, 8]);
  const visorGlow = useTransform(smoothX, [-200, 200], [0.4, 1]);

  useEffect(() => {
    if (isOpen) {
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        mouseX.set((clientX / innerWidth - 0.5) * 400);
        mouseY.set((clientY / innerHeight - 0.5) * 400);
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    const userMsg = input;
    setInput('');
    setErrorStatus(null);
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsThinking(true);

    try {
      const responseText = await getSageChatResponse(messages, userMsg, userLanguage);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      setIsThinking(false);
      
      // Briefly animate mouth visualizer when receiving response
      setIsTalking(true);
      setTimeout(() => setIsTalking(false), 2000);
    } catch (error: any) {
      setIsThinking(false);
      const isQuotaError = error?.message?.includes('429');
      setErrorStatus(isQuotaError ? "QUOTA_EXHAUSTED" : "CONNECTION_FAILURE");
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: isQuotaError 
          ? "CRITICAL: Quota exhausted. Systems require immediate cooldown. Please wait 1-2 minutes before retrying." 
          : "Uplink failure. Connection to SAGE Core disrupted. Re-initialize trajectory." 
      }]);
    }
  };

  const extractLinks = (text: string): ResourceLink[] => {
    const links: ResourceLink[] = [];
    const markdownLinkRegex = /\[(.*?)\]\((.*?)\)/g;
    let match;
    while ((match = markdownLinkRegex.exec(text)) !== null) {
      const title = match[1];
      const url = match[2];
      let type: ResourceLink['type'] = 'web';
      if (url.includes('youtube.com') || url.includes('youtu.be')) type = 'video';
      else if (url.includes('.pdf')) type = 'pdf';
      else if (url.includes('coursera') || url.includes('freecodecamp') || url.includes('edx')) type = 'course';
      links.push({ title, url, type });
    }
    return links;
  };

  const renderMessageContent = (text: string, isUser: boolean) => {
    const links = !isUser ? extractLinks(text) : [];
    const cleanDisplay = text.replace(/\[(.*?)\]\((.*?)\)/g, '$1');
    
    return (
      <div className="space-y-4">
        <div className={`whitespace-pre-wrap leading-relaxed ${isUser ? 'font-bold' : 'font-black'}`}>
          {cleanDisplay}
        </div>
        
        {!isUser && links.length > 0 && (
          <div className="flex flex-col gap-3 pt-6 mt-4 border-t border-slate-200">
            <p className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.3em]">Resource Asset Linkage</p>
            <div className="grid grid-cols-1 gap-3">
              {links.map((link, idx) => (
                <a 
                  key={idx} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-5 bg-white rounded-3xl border-2 border-slate-100 hover:border-indigo-500 hover:shadow-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                      {link.type === 'video' ? <Youtube size={18} className="text-red-500" /> : 
                       link.type === 'pdf' ? <FileText size={18} className="text-blue-500" /> : 
                       link.type === 'course' ? <GraduationCap size={18} className="text-emerald-500" /> : 
                       <ExternalLink size={18} className="text-slate-400" />}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-tighter text-slate-800 line-clamp-1">{link.title}</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-600 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="relative w-full max-w-7xl h-full md:h-[90vh] bg-white md:rounded-[60px] shadow-3xl overflow-hidden flex flex-col md:flex-row border border-indigo-500/30"
          >
            {/* Header Mobile Only */}
            <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-white/5 z-20 shrink-0">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white"><Zap size={16} /></div>
                 <span className="text-white font-black uppercase text-xs tracking-widest italic">SAGE COMMAND</span>
               </div>
               <button onClick={onClose} className="p-2 text-slate-400 hover:text-white"><X size={20}/></button>
            </div>

            {/* Iron Man Bust Side */}
            <div className="w-full md:w-[42%] bg-[#05070a] flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden shrink-0">
               <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse" />
                 <svg className="w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <pattern id="iron-grid" width="12" height="12" patternUnits="userSpaceOnUse">
                      <path d="M 12 0 L 0 0 0 12" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100" height="100" fill="url(#iron-grid)" />
                 </svg>
               </div>

               <motion.div 
                style={{ rotateX: headRotateX, rotateY: headRotateY, x: headX }}
                className="relative perspective-1000 scale-[0.5] sm:scale-75 lg:scale-110"
              >
                {/* Armored Head */}
                <div className="relative w-64 h-80 z-20">
                  <motion.div 
                    animate={{ 
                      y: isTalking ? [0, -4, 0] : [0, -8, 0],
                      scale: isThinking ? [1, 1.02, 1] : 1
                    }}
                    transition={{ duration: 0.15, repeat: isTalking ? Infinity : 0 }}
                    className={`absolute inset-0 rounded-t-[100px] rounded-b-[40px] border-[8px] flex flex-col items-center justify-center shadow-3xl transition-colors duration-500 ${errorStatus === 'QUOTA_EXHAUSTED' ? 'bg-red-950 border-red-500' : 'bg-[#1a1c25] border-slate-700'}`}
                  >
                     {/* Visor Eye Strip */}
                     <motion.div 
                        style={{ opacity: visorGlow }}
                        animate={{ 
                            backgroundColor: errorStatus ? '#ef4444' : (isThinking ? ['#4f46e5', '#818cf8', '#4f46e5'] : '#4f46e5'),
                            boxShadow: errorStatus ? '0 0 40px #ef4444' : (isThinking ? '0 0 40px #4f46e5' : '0 0 20px #4f46e5')
                        }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="w-48 h-10 rounded-full border-2 border-indigo-400/50 mb-16 overflow-hidden flex items-center justify-center"
                     >
                         <motion.div 
                            animate={{ x: [-60, 60, -60] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="w-16 h-full bg-white/20 blur-md"
                         />
                     </motion.div>
                     
                     {/* Mouth Visualizer Area */}
                     <div className="flex gap-2 items-end h-8">
                        {[...Array(12)].map((_, i) => (
                          <motion.div 
                            key={i} 
                            animate={{ height: isTalking ? [4, 32, 4] : 4 }} 
                            transition={{ duration: 0.15, repeat: Infinity, delay: i * 0.04 }} 
                            className={`w-1.5 rounded-full ${errorStatus === 'QUOTA_EXHAUSTED' ? 'bg-red-500' : 'bg-indigo-400/60'}`} 
                          />
                        ))}
                     </div>
                  </motion.div>
                </div>

                {/* Armored Body & Arc Reactor */}
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className={`w-56 h-72 mt-[-30px] rounded-[100px] border-[6px] shadow-2xl relative z-10 flex flex-col items-center pt-16 transition-colors duration-500 ${errorStatus === 'QUOTA_EXHAUSTED' ? 'bg-[#1a0505] border-red-900' : 'bg-[#12141c] border-slate-800'}`}
                >
                    {/* Arc Reactor Core */}
                    <div className="relative w-28 h-28 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center overflow-hidden">
                        <motion.div 
                            animate={{ 
                                scale: isTalking ? [1, 1.2, 1] : [1, 1.05, 1],
                                opacity: isTalking ? [0.6, 1, 0.6] : 0.4
                            }}
                            transition={{ duration: isTalking ? 0.2 : 2, repeat: Infinity }}
                            className={`absolute inset-2 rounded-full blur-xl ${errorStatus === 'QUOTA_EXHAUSTED' ? 'bg-red-600' : 'bg-indigo-500'}`}
                        />
                        <div className="relative z-10 w-16 h-16 rounded-full border border-indigo-300/30 flex items-center justify-center">
                            {errorStatus === 'QUOTA_EXHAUSTED' ? <AlertTriangle size={24} className="text-red-500" /> : <Zap size={24} className="text-white animate-pulse" />}
                        </div>
                    </div>
                </motion.div>
              </motion.div>

              {/* Status UI */}
              <div className="mt-10 md:mt-20 w-full max-w-sm text-center space-y-8 z-20">
                <div className="flex items-center justify-center gap-4">
                  <div className={`px-5 py-2 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] border transition-all ${errorStatus ? 'bg-red-600 text-white border-red-400' : (isTalking ? 'bg-indigo-600 text-white border-indigo-400 shadow-glow' : 'bg-slate-900/80 text-slate-500 border-white/5')}`}>
                    {errorStatus ? 'SYSTEM RECALIBRATING' : (isTalking ? 'UPLINKING' : 'READY')}
                  </div>
                </div>
              </div>
            </div>

            {/* Response Section */}
            <div className="flex-1 flex flex-col h-full bg-white relative">
               {/* Close Button Desktop */}
               <button 
                onClick={onClose}
                className="hidden md:flex absolute top-10 right-10 z-50 p-4 bg-slate-50 rounded-2xl hover:bg-red-50 transition-all text-slate-400 hover:text-red-500"
              >
                <X size={24} />
              </button>

               <div className="hidden md:block p-10 md:p-14 border-b border-slate-50 shrink-0 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                        <MessageSquare size={20} />
                    </div>
                    <h4 className="text-[12px] font-black uppercase text-slate-400 tracking-[0.4em]">Expert Consulting Relay</h4>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">Clarify Doubt.</h3>
               </div>

               <div className="flex-1 overflow-y-auto p-4 md:p-14 space-y-8 md:space-y-12 custom-scrollbar">
                  {messages.map((m, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[95%] md:max-w-[85%] p-6 md:p-10 rounded-[36px] text-lg md:text-2xl leading-relaxed shadow-sm relative border-l-4 md:border-l-[12px] ${
                        m.role === 'user' 
                          ? 'bg-slate-950 text-white border-indigo-600 rounded-tr-none' 
                          : 'bg-slate-50 text-slate-900 border-slate-200 rounded-tl-none shadow-indigo-100/10'
                      }`}>
                         {renderMessageContent(m.text, m.role === 'user')}
                      </div>
                    </motion.div>
                  ))}

                  {isThinking && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-slate-50 p-8 rounded-[40px] rounded-tl-none border border-slate-100 flex items-center gap-6">
                            <Loader2 size={24} className="text-indigo-600 animate-spin" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Consulting Core Modules...</span>
                        </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
               </div>

               {/* Mobile Quick Taps */}
               <div className="px-4 md:px-14 py-3 flex gap-2 overflow-x-auto no-scrollbar shrink-0 border-t border-slate-50 bg-white/80 backdrop-blur-sm">
                    {['Free Courses', 'Python YT', 'Next.js Docs', 'React PDF'].map(label => (
                        <button key={label} onClick={() => setInput(label)} className="px-5 py-3 rounded-2xl bg-slate-50 text-[10px] font-black uppercase text-slate-500 hover:bg-indigo-600 hover:text-white transition-all whitespace-nowrap border border-slate-200">
                            {label}
                        </button>
                    ))}
               </div>

               {/* Input Terminal */}
               <div className="p-4 md:p-14 border-t bg-slate-50 flex gap-3 md:gap-8 relative items-center">
                  <div className="flex-1 relative">
                    <input 
                        className={`w-full bg-white p-5 md:p-10 rounded-[28px] md:rounded-[60px] outline-none shadow-2xl text-xl md:text-3xl font-black transition-all focus:ring-8 ring-indigo-500/5 placeholder:text-slate-200 uppercase tracking-tighter italic ${errorStatus === 'QUOTA_EXHAUSTED' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder={errorStatus === 'QUOTA_EXHAUSTED' ? "COOLING DOWN..." : "Inquire..."}
                        value={input}
                        disabled={isThinking || errorStatus === 'QUOTA_EXHAUSTED'}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 opacity-20"><Search size={40} /></div>
                  </div>
                  <button 
                    onClick={handleSend}
                    disabled={isThinking || !input.trim() || errorStatus === 'QUOTA_EXHAUSTED'}
                    className="bg-slate-900 text-white p-5 md:p-10 rounded-full hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center justify-center shrink-0 disabled:opacity-40"
                  >
                    <Send size={32} className="md:scale-150 translate-x-1" />
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
