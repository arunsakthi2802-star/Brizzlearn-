
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Lock, Activity, PlayCircle, Map, 
  ChevronRight, Target, Sparkles, Zap, Award, 
  Terminal, ShieldCheck, Database, Globe,
  Youtube, FileText, GraduationCap, BrainCircuit, X,
  RefreshCw
} from 'lucide-react';
import { CareerPath, RoadmapNode, QuizQuestion } from '../types';
import { getAptitudeQuiz } from '../services/geminiService';

interface RoadmapViewProps {
  path: CareerPath | null;
  onNodeClick: (n: RoadmapNode) => void;
}

export default function RoadmapView({ path, onNodeClick }: RoadmapViewProps) {
  const [activeQuizNode, setActiveQuizNode] = useState<RoadmapNode | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!path) return null;

  const handleStartQuiz = async (node: RoadmapNode) => {
    setQuizLoading(true);
    setActiveQuizNode(node);
    try {
      const questions = await getAptitudeQuiz(node.title);
      setQuizQuestions(questions.slice(0, 5));
      setCurrentQuizIndex(0);
      setScore(0);
      setQuizFinished(false);
    } catch (e) {
      console.error(e);
      setActiveQuizNode(null);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizAnswer = (answer: string) => {
    if (answer === quizQuestions[currentQuizIndex].correctAnswer) {
      setScore(score + 1);
    }
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const getTierInfo = (index: number, total: number) => {
    const ratio = index / total;
    if (ratio < 0.2) return { label: 'Level 01: Initiation', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <Terminal size={14}/> };
    if (ratio < 0.4) return { label: 'Level 02: Core logic', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', icon: <Database size={14}/> };
    if (ratio < 0.6) return { label: 'Level 03: Architecture', color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: <Zap size={14}/> };
    if (ratio < 0.8) return { label: 'Level 04: Production', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100', icon: <Award size={14}/> };
    return { label: 'Level 05: Apex Mastery', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', icon: <Sparkles size={14}/> };
  };

  const totalSteps = path.nodes.length;
  const completedSteps = path.nodes.filter(n => n.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto py-12 md:py-24 px-6 md:px-12 relative text-left min-h-screen">
      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none grid grid-cols-4 md:grid-cols-8 gap-0 opacity-[0.05] z-0 px-12">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="schematic-column h-full" />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24 items-end relative z-10"
      >
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-4">
            <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-lg shadow-indigo-200">
              Deep-Tree Schematic
            </span>
            <div className="h-px flex-1 bg-indigo-100/50" />
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85] italic">
            SELECTION<span className="text-indigo-600">.</span>
          </h2>
          <p className="text-xl md:text-3xl text-slate-400 font-bold max-w-3xl tracking-tight leading-tight">
            Follow the serialized vector nodes from Level 0 to Level 5. Every module includes a Video, Manual, and Course.
          </p>
        </div>
        
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white p-8 rounded-[40px] border-2 border-slate-50 shadow-xl flex items-center justify-between group hover:border-indigo-100 transition-all">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Progress</p>
              <p className="text-4xl font-black text-slate-950 italic">{Math.round((completedSteps / totalSteps) * 100)}%</p>
            </div>
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <Target size={32} />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative flex flex-col items-center gap-24 md:gap-32 z-10">
        {path.nodes.map((node, i) => {
          const tier = getTierInfo(i, path.nodes.length);
          const isUnlocked = node.status !== 'locked';
          const isDone = node.status === 'completed';
          const isNext = !isDone && isUnlocked;
          
          return (
            <motion.div 
              key={node.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative w-full max-w-5xl flex items-center justify-center group"
            >
              <div 
                onClick={() => isUnlocked && onNodeClick(node)}
                className={`w-full bg-white border-2 rounded-[48px] md:rounded-[80px] p-8 md:p-16 flex flex-col lg:grid lg:grid-cols-12 gap-10 md:gap-16 transition-all duration-700 relative cursor-pointer
                  ${isDone ? 'border-emerald-500 shadow-3xl bg-emerald-50/5' : 
                    isNext ? 'border-indigo-600 shadow-[0_40px_80px_-20px_rgba(79,70,229,0.15)] scale-105 ring-4 ring-indigo-500/10' : 
                    'border-slate-100 opacity-30 grayscale pointer-events-none'}
                `}
              >
                {/* Visual Flow Animation for Next Step */}
                {isNext && (
                   <motion.div 
                    layoutId="nextGlow"
                    className="absolute inset-0 rounded-[48px] md:rounded-[80px] border-4 border-indigo-400/30 blur-md pointer-events-none"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                   />
                )}

                <div className="lg:col-span-8 space-y-8">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${tier.bg} ${tier.color} ${tier.border} border-2`}>
                        {tier.icon} {tier.label}
                      </div>
                      {isDone && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStartQuiz(node); }}
                          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-all"
                        >
                          <BrainCircuit size={14}/> Take Quiz
                        </button>
                      )}
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{node.title}</h3>
                    <p className="text-slate-500 font-bold text-lg md:text-xl leading-tight tracking-tight max-w-2xl">{node.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-slate-50">
                    <div className="col-span-full mb-2 text-left">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Sub-Milestone Checklist</p>
                    </div>
                    {node.topics?.map((topic, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 group-hover:bg-white transition-all border border-transparent group-hover:border-slate-100"
                      >
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 shrink-0 ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                           {isDone ? <CheckCircle2 size={16}/> : <span className="text-[10px] font-black">{idx + 1}</span>}
                         </div>
                         <span className={`text-[11px] font-black uppercase tracking-widest ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 space-y-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Module Resources</p>
                    <div className="grid grid-cols-3 gap-3">
                       <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-red-500 shadow-sm group-hover:bg-red-50 group-hover:border-red-200 transition-all">
                             <Youtube size={20}/>
                          </div>
                          <span className="text-[7px] font-black uppercase tracking-tighter">Video</span>
                       </div>
                       <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-500 shadow-sm group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
                             <FileText size={20}/>
                          </div>
                          <span className="text-[7px] font-black uppercase tracking-tighter">Manual</span>
                       </div>
                       <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-500 shadow-sm group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-all">
                             <GraduationCap size={20}/>
                          </div>
                          <span className="text-[7px] font-black uppercase tracking-tighter">Course</span>
                       </div>
                    </div>
                  </div>

                  <div className="flex-1 bg-slate-950 rounded-[40px] md:rounded-[60px] p-8 md:p-12 flex flex-col items-center justify-center text-center group-hover:bg-indigo-600 transition-all shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`w-20 h-20 md:w-28 md:h-28 rounded-[32px] flex items-center justify-center mb-8 shadow-xl transition-all bg-white text-slate-950 group-hover:scale-110`}>
                        {isDone ? <Award size={48} className="text-emerald-500"/> : <PlayCircle size={48} className="text-indigo-600"/>}
                      </div>
                      <p className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">
                        {isDone ? 'Verified' : 'Initialize'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schematic Connector Line & Circle */}
              <div className={`absolute -left-4 md:-left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-[32px] bg-slate-100 border-2 flex items-center justify-center shadow-2xl z-30 transition-all
                ${isDone ? 'border-emerald-500 text-emerald-500 bg-white' : isNext ? 'border-indigo-600 text-indigo-600 bg-white animate-pulse' : 'border-slate-200 text-slate-300'}
              `}>
                <span className="text-xl md:text-3xl font-black italic">{i + 1}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mini Quiz Modal */}
      <AnimatePresence>
        {activeQuizNode && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveQuizNode(null)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[48px] p-10 md:p-16 border-4 border-indigo-500/20 overflow-hidden shadow-3xl">
              {quizLoading ? (
                <div className="py-20 flex flex-col items-center gap-8 text-slate-400">
                  {/* Fixed: Added RefreshCw import in lucide-react list above */}
                  <RefreshCw className="animate-spin text-indigo-600" size={48}/>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em]">Generating Mastery Assessment...</p>
                </div>
              ) : quizFinished ? (
                <div className="text-center space-y-10">
                  <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl animate-bounce">
                    <Award size={48} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter">Quiz Complete</h3>
                    <p className="text-xl font-bold text-slate-500">Node: {activeQuizNode.title}</p>
                    <p className="text-6xl font-black text-indigo-600 italic leading-none">{score} / {quizQuestions.length}</p>
                  </div>
                  <button onClick={() => setActiveQuizNode(null)} className="w-full bg-slate-950 text-white py-6 rounded-[32px] font-black text-xl uppercase tracking-tighter italic shadow-xl">Close Console</button>
                </div>
              ) : (
                <div className="space-y-12">
                   <div className="flex justify-between items-center">
                     <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Question {currentQuizIndex + 1} / {quizQuestions.length}</p>
                     <button onClick={() => setActiveQuizNode(null)} className="p-3 bg-slate-50 rounded-xl text-slate-400"><X size={20}/></button>
                   </div>
                   <h3 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tighter leading-tight uppercase italic">{quizQuestions[currentQuizIndex]?.question}</h3>
                   <div className="grid grid-cols-1 gap-4">
                      {quizQuestions[currentQuizIndex]?.options.map((opt, idx) => (
                        <button key={idx} onClick={() => handleQuizAnswer(opt)} className="w-full p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 text-left font-black text-lg transition-all flex items-center gap-6 group">
                          <span className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all text-sm">{idx + 1}</span>
                          {opt}
                        </button>
                      ))}
                   </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
