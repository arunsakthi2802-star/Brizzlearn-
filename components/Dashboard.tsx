
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, ShieldCheck, Sparkles, Rocket, ChevronRight, 
  ArrowRight, PlayCircle, BookOpen, GraduationCap, FileText, 
  Youtube, CheckCircle2, Layers, Zap, ExternalLink, Activity,
  Calendar, Clock, Plus, Trash2, Bell, AlertCircle, X
} from 'lucide-react';
import { UserProfile, CareerPath, ViewState, RoadmapNode, Resource, Reminder } from '../types';

interface DashboardProps {
  user: UserProfile;
  path: CareerPath | null;
  setView: (v: ViewState) => void;
  onNodeClick: (node: RoadmapNode) => void;
  aiAdvice: string;
  loading: boolean;
  onAddReminder: (text: string, dueDate: string, priority: 'low' | 'medium' | 'high') => void;
  onToggleReminder: (id: string) => void;
  onRemoveReminder: (id: string) => void;
}

const sanitizeAdvice = (text: string) => {
  return text
    .replace(/\*\*/g, '')
    .replace(/###/g, '')
    .replace(/#/g, '')
    .replace(/\*\//g, '')
    .trim();
};

export default function Dashboard({ 
  user, path, setView, onNodeClick, aiAdvice, loading, 
  onAddReminder, onToggleReminder, onRemoveReminder 
}: DashboardProps) {
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderPriority, setNewReminderPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const completedCount = user.completedNodes.length;
  const totalCount = path?.nodes.length || 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAdd = () => {
    if (!newReminderText || !newReminderDate) return;
    onAddReminder(newReminderText, newReminderDate, newReminderPriority);
    setNewReminderText('');
    setNewReminderDate('');
    setShowAddReminder(false);
  };

  const renderResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'youtube': return <Youtube size={16} />;
      case 'video': return <PlayCircle size={16} />;
      case 'pdf': return <FileText size={16} />;
      case 'course': return <GraduationCap size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  return (
    <div className="space-y-8 md:space-y-16 pb-24 text-left px-2 sm:px-4">
      {/* HUD & Top Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 items-stretch">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-8 bg-white p-8 sm:p-12 md:p-20 rounded-[40px] md:rounded-[80px] border border-slate-100 shadow-2xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 md:mb-16 gap-6">
              <div className="space-y-2 md:space-y-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em]">
                  <Activity size={10} className="animate-pulse" /> Orbital Status
                </span>
                <h4 className="text-3xl sm:text-5xl md:text-8xl font-black text-slate-950 tracking-tighter uppercase leading-[0.85] italic">
                  {path?.title || 'Mapping...'}
                </h4>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <motion.p className="text-5xl sm:text-7xl md:text-[140px] font-black text-slate-950 tracking-tighter leading-none">
                  {progress}%
                </motion.p>
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-1 md:mt-2">Uplink Synced</p>
              </div>
            </div>
            
            <div className="h-8 sm:h-12 md:h-16 w-full bg-slate-50 rounded-[16px] sm:rounded-[32px] overflow-hidden p-1.5 md:p-2.5 ring-1 ring-slate-100 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="h-full bg-indigo-600 rounded-[10px] sm:rounded-[22px] shadow-[0_0_40px_rgba(79,70,229,0.5)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="xl:col-span-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6 md:gap-8">
          <DashboardSmallCard 
            title="Proficiency" 
            desc={user.skillLevel} 
            icon={<Target className="text-emerald-600" />} 
          />
          <DashboardSmallCard 
            title="Milestones" 
            desc={`${completedCount} / ${totalCount}`} 
            icon={<ShieldCheck className="text-indigo-600" />} 
          />
          <motion.div 
            whileHover={{ scale: 1.02 }}
            onClick={() => setView('editor')}
            className="sm:col-span-2 xl:col-span-1 bg-slate-950 p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden group cursor-pointer border border-white/5"
          >
             <h3 className="text-white font-black text-3xl md:text-4xl mb-2 md:mb-4 tracking-tighter uppercase italic leading-none">Execute Lab</h3>
             <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-6 md:mb-10">Verification Protocol Required</p>
             <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-600 rounded-2xl md:rounded-[20px] flex items-center justify-center text-white group-hover:rotate-12 transition-all">
                <Rocket size={24} />
             </div>
          </motion.div>
        </div>
      </div>

      {/* Trajectories Summary */}
      <div className="grid grid-cols-1 gap-6 md:gap-10">
        <div className="flex items-center justify-between px-4">
           <h3 className="text-3xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">Trajectories.</h3>
           <button onClick={() => setView('roadmap')} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-3">View Full Schematic <ArrowRight size={16} /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {path?.nodes.slice(0, 3).map((node, i) => (
             <motion.div 
                key={node.id} 
                whileHover={{ y: -5 }}
                className={`p-8 md:p-12 rounded-[40px] border-2 bg-white flex flex-col justify-between h-[350px] md:h-[450px] transition-all relative overflow-hidden ${node.status === 'locked' ? 'opacity-40 grayscale border-slate-50' : 'border-slate-100 shadow-xl'}`}
              >
                <div className="relative z-10">
                   <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Level 0{i}</p>
                   <h4 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-[0.9] mb-4">{node.title}</h4>
                   <p className="text-slate-500 font-bold text-sm md:text-lg line-clamp-3">{node.description}</p>
                </div>
                <button 
                  disabled={node.status === 'locked'}
                  onClick={() => onNodeClick(node)}
                  className="w-full py-4 md:py-6 bg-slate-950 text-white rounded-2xl md:rounded-3xl font-black text-sm md:text-lg uppercase tracking-tighter italic hover:bg-indigo-600 transition-all z-10"
                >
                   {node.status === 'completed' ? 'Protocol Secured' : 'Initialize Node'}
                </button>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}

function DashboardSmallCard({ title, desc, icon }: any) {
  return (
    <div className="bg-white p-6 md:p-12 rounded-[30px] md:rounded-[56px] border border-slate-100 shadow-xl flex items-center gap-4 md:gap-8 hover:shadow-2xl transition-all group">
      <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-xl md:rounded-[24px] flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div className="text-left">
        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{title}</p>
        <p className="text-xl md:text-4xl font-black text-slate-950 leading-none tracking-tighter uppercase italic">{desc}</p>
      </div>
    </div>
  );
}
