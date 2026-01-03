
import React from 'react';
import { Trophy, User, Plus } from 'lucide-react';
import { ViewState, UserProfile, CareerPath } from '../types';

interface HeaderProps {
  view: ViewState;
  user: UserProfile | null;
  activePath: CareerPath | null;
  handleResetMission: () => void;
}

export default function Header({ view, user, activePath, handleResetMission }: HeaderProps) {
  const title = view === 'dashboard' 
    ? (user?.interest ? 'Commander' : 'Selection') 
    : view.replace('-', ' ').toUpperCase();

  return (
    <header className="h-20 md:h-24 border-b bg-white/70 backdrop-blur-3xl flex items-center justify-between px-6 md:px-16 shrink-0 z-20">
      <div>
        <h2 className="text-xl md:text-3xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">
          {title}.
        </h2>
        {activePath && (
          <p className="text-[8px] md:text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] md:tracking-[0.6em] mt-1 line-clamp-1">
            {activePath.title}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-4 md:gap-10">
        {user?.interest && view === 'dashboard' && (
          <button 
            onClick={handleResetMission}
            className="text-[8px] md:text-[10px] font-black text-slate-300 hover:text-indigo-600 uppercase tracking-[0.4em] md:tracking-[0.6em] transition-colors flex items-center gap-2 group whitespace-nowrap"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform" /> NEW
          </button>
        )}
        
        <div className="hidden lg:flex items-center gap-4 bg-slate-950 px-6 py-3 rounded-2xl text-[10px] font-black text-white shadow-xl uppercase tracking-[0.2em]">
          <Trophy size={16} className="text-yellow-400" /> {user?.completedNodes.length || 0} SECURED
        </div>
        
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-white border-2 border-slate-50 flex items-center justify-center text-slate-300 hover:border-indigo-100 hover:text-indigo-600 transition-all cursor-pointer shadow-sm group">
          <User size={20} className="md:scale-[1.4] group-hover:scale-110 transition-transform" />
        </div>
      </div>
    </header>
  );
}
