
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, ArrowRight, Globe } from 'lucide-react';

interface OnboardingProps {
  onComplete: (name: string, language: string) => void;
}

const LANGUAGES = [
  { label: 'English', value: 'English' },
  { label: 'Tamil (தமிழ்)', value: 'Tamil' },
  { label: 'Spanish (Español)', value: 'Spanish' },
  { label: 'French (Français)', value: 'French' },
  { label: 'Hindi (हिन्दी)', value: 'Hindi' },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('English');

  return (
    <div className="h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/30 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/20 blur-[150px] rounded-full" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[48px] md:rounded-[64px] p-8 md:p-16 w-full max-w-2xl shadow-3xl relative z-10 border border-white/20"
      >
        <motion.div 
          whileHover={{ rotate: 15 }}
          className="bg-indigo-600 w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[32px] flex items-center justify-center mb-6 md:mb-10 shadow-3xl shadow-indigo-600/50"
        >
          <Rocket className="text-white" size={32} />
        </motion.div>
        
        <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-4 md:mb-8 tracking-tighter leading-[0.85] uppercase">
          Start Your <span className="text-indigo-600">Mission.</span>
        </h1>
        
        <p className="text-slate-500 mb-8 md:mb-14 text-lg md:text-2xl font-medium leading-relaxed max-w-lg">
          Initialize your career GPS. We'll architect a personalized roadmap through the stars.
        </p>
        
        <div className="space-y-4 md:space-y-6">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] mb-2 ml-4">Pilot Designation</p>
            <input 
              type="text" 
              placeholder="Your Name" 
              autoFocus 
              className="w-full bg-slate-50 p-6 md:p-8 rounded-2xl md:rounded-[36px] outline-none focus:ring-4 ring-indigo-500/5 text-xl md:text-3xl font-black text-slate-900 border-2 border-slate-100 focus:border-indigo-100 transition-all placeholder:text-slate-200" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] mb-2 ml-4">Trajectory Language</p>
            <div className="relative">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 p-6 md:p-8 rounded-2xl md:rounded-[36px] outline-none focus:ring-4 ring-indigo-500/5 text-xl md:text-3xl font-black text-slate-900 border-2 border-slate-100 focus:border-indigo-100 transition-all appearance-none cursor-pointer"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
              <Globe className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={24} />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!name} 
            onClick={() => onComplete(name, language)} 
            className="w-full bg-slate-950 text-white py-6 md:py-8 rounded-2xl md:rounded-[36px] font-black text-xl md:text-2xl shadow-3xl hover:bg-indigo-600 transition-all disabled:opacity-20 flex items-center justify-center gap-4 uppercase tracking-tighter"
          >
            Engage Console <ArrowRight size={24} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
