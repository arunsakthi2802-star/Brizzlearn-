
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, LayoutDashboard, Code2, ShieldCheck, Box, Activity, 
  Rocket, Network, LogOut, MessageCircle, Sparkles
} from 'lucide-react';
import { ViewState, UserProfile } from '../types';

interface SidebarProps {
  view: ViewState;
  setView: (v: ViewState) => void;
  user: UserProfile | null;
  onLogout: () => void;
  onOpenSage: () => void;
}

export default function Sidebar({ view, setView, user, onLogout, onOpenSage }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', disabled: false },
    { id: 'roadmap', icon: <Network size={20} />, label: 'Path Schematic', disabled: !user?.interest },
    { id: 'editor', icon: <Code2 size={20} />, label: 'Orbit IDE', disabled: !user?.interest },
    { id: 'projects', icon: <Box size={20} />, label: 'Project Matrix', disabled: !user?.interest },
    { id: 'news', icon: <Activity size={20} />, label: 'Market Pulse', disabled: !user?.interest },
    { id: 'vault', icon: <ShieldCheck size={20} />, label: 'Asset Vault', disabled: !user?.interest },
    { id: 'launchpad', icon: <Rocket size={20} />, label: 'Launch Pad', disabled: !user?.interest },
  ];

  return (
    <nav className="w-full h-full bg-slate-950 text-slate-300 flex flex-col p-6 shrink-0 border-r border-white/5 z-30 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 mb-10 px-2 mt-4">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 10 }}
          className="bg-indigo-600 p-2.5 rounded-xl shadow-2xl shadow-indigo-600/30 ring-1 ring-white/20"
        >
          <Compass className="w-6 h-6 text-white" />
        </motion.div>
        <span className="text-2xl font-black text-white tracking-tighter">Brizzlearn</span>
      </div>

      <div className="space-y-1.5 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewState)}
            disabled={item.disabled}
            className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
              item.disabled 
                ? 'opacity-20 cursor-not-allowed' 
                : view === item.id 
                  ? 'text-white' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {view === item.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-indigo-600 shadow-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 transition-transform group-hover:scale-110">{item.icon}</span>
            <span className="relative z-10 font-black text-sm tracking-tight">{item.label}</span>
          </button>
        ))}

        {/* AI SAGE Specialist Button */}
        <div className="pt-6 mt-6 border-t border-white/5">
          <button 
            onClick={onOpenSage}
            disabled={!user?.interest}
            className={`w-full p-6 rounded-[32px] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-2xl shadow-indigo-600/20 flex flex-col items-center gap-4 group transition-all relative overflow-hidden active:scale-95 disabled:opacity-20 disabled:grayscale`}
          >
             <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="bg-white/20 p-3 rounded-2xl">
               <Sparkles className="animate-pulse" size={24} />
             </div>
             <div className="text-center">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1">AI SPECIALIST</p>
               <p className="text-lg font-black uppercase tracking-tighter italic leading-none">Summon SAGE</p>
             </div>
          </button>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 space-y-4 mt-8 pb-4">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-sm font-black shadow-lg">
            {user?.name?.[0] || 'V'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-black text-white truncate">{user?.name}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Orbit Voyager</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-4 p-4 w-full text-left rounded-2xl hover:bg-red-500/10 text-red-400/80 transition-colors group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform"/>
          <span className="text-xs font-black uppercase tracking-widest">Abort Orbit</span>
        </button>
      </div>
    </nav>
  );
}
