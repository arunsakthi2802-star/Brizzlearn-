
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Rocket, ArrowRight, Compass, ShieldCheck, Zap, Globe, Cpu, Users } from 'lucide-react';

interface HomeProps {
  onStart: () => void;
}

export default function Home({ onStart }: HomeProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "circOut" } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-xl shadow-indigo-600/30">
            <Compass className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter">Brizzlearn</span>
        </div>
        <button 
          onClick={onStart}
          className="bg-white text-slate-950 px-6 py-2.5 md:px-8 md:py-3 rounded-full text-xs md:text-sm font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all"
        >
          Launch
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 md:pt-24 pb-32 md:pb-48 px-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center space-y-8 md:space-y-12"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 backdrop-blur-md">
            <Rocket size={14} className="animate-bounce" /> AI Career GPS
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
            Map Your Path <br className="hidden md:block" /> <span className="text-indigo-600">Through The Stars.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed px-4">
            Brizzlearn architectures high-fidelity trajectories, simulates coding missions, and navigates you to verified technical mastery.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-8">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-6 md:px-12 md:py-8 rounded-[28px] md:rounded-[36px] font-black text-xl md:text-2xl shadow-3xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-tighter"
            >
              Initialize <ArrowRight size={24} />
            </button>
            <button className="w-full sm:w-auto px-10 py-6 md:px-12 md:py-8 rounded-[28px] md:rounded-[36px] border-2 border-white/10 font-black text-xl md:text-2xl hover:bg-white/5 transition-all uppercase tracking-tighter">
              Trajectories
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Tighter Features Grid */}
      <section className="py-24 md:py-40 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <FeatureCard icon={<Cpu size={32}/>} title="AI Logic" desc="Adaptive paths that adjust to your progress in real-time." />
            <FeatureCard icon={<ShieldCheck size={32}/>} title="Verification" desc="Integrated simulations confirm mastery before advancing." />
            <FeatureCard icon={<Zap size={32}/>} title="Velocity" desc="Direct matching to high-priority global technical roles." />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-10 md:p-12 rounded-[40px] md:rounded-[56px] hover:bg-white/10 transition-all group text-left">
      <div className="text-indigo-500 mb-8 group-hover:scale-110 transition-transform">{icon}</div>
      <h4 className="text-2xl md:text-3xl font-black mb-4 uppercase italic tracking-tighter">{title}</h4>
      <p className="text-slate-400 font-bold leading-tight">{desc}</p>
    </div>
  );
}
