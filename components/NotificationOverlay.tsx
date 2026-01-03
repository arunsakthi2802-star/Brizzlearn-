
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Zap, X } from 'lucide-react';

interface NotificationOverlayProps {
  notification: { type: 'motivation' | 'achievement'; message: string } | null;
  onClear: () => void;
}

export default function NotificationOverlay({ notification, onClear }: NotificationOverlayProps) {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(onClear, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClear]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
          exit={{ opacity: 0, scale: 0.5, y: 50, transition: { duration: 0.3 } }}
          className="fixed bottom-12 left-1/2 z-[500] w-full max-w-lg px-6"
        >
          <div className={`relative overflow-hidden p-10 rounded-[48px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-4 flex items-center gap-8 ${
            notification.type === 'achievement' 
              ? 'bg-indigo-600 border-indigo-400 text-white' 
              : 'bg-white border-slate-50 text-slate-900'
          }`}>
            <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center shrink-0 shadow-2xl ${
              notification.type === 'achievement' ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'
            }`}>
              {notification.type === 'achievement' ? <Trophy size={40} className="animate-bounce" /> : <Zap size={40} className="animate-pulse" />}
            </div>
            
            <div className="flex-1 text-left">
              <p className={`text-[11px] font-black uppercase tracking-[0.5em] mb-3 ${
                notification.type === 'achievement' ? 'text-indigo-200' : 'text-indigo-600'
              }`}>
                {notification.type === 'achievement' ? 'Protocol Secured 🏆' : 'Neural Impulse ✨'}
              </p>
              <h4 className="text-2xl md:text-3xl font-black tracking-tighter leading-[1.1] uppercase italic">
                {notification.message}
              </h4>
            </div>

            <button onClick={onClear} className="p-3 bg-black/5 hover:bg-black/10 rounded-2xl transition-all">
              <X size={20} />
            </button>

            {/* Background Graphic */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
