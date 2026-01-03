import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, BrainCircuit, MessageSquare, RefreshCw, X, Send, Zap, ShieldAlert, Cpu, Award, Target, Sparkles, Binary } from 'lucide-react';
import { ChatMessage, QuizQuestion, ProblemSet } from '../types';
import { getMockInterviewResponse, getAptitudeQuiz, getProblemSolvingSet } from '../services/geminiService';

interface VaultViewProps {
  domain: string;
  onProblemSolve: (p: any) => void;
}

export default function VaultView({ domain, onProblemSolve }: VaultViewProps) {
  const [tab, setTab] = useState<'problem' | 'quiz' | 'comms'>('problem');
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState<ProblemSet[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', text: `Diagnostic Uplink active for ${domain}. Protocol initialized. Transmit response for logic verification.` }]);
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => chatRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const loadProblems = async () => {
    setLoading(true);
    try {
      const res = await getProblemSolvingSet(domain);
      setProblems(res);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const res = await getAptitudeQuiz(domain);
      setQuiz(res);
      setQuizIndex(0);
      setQuizScore(0);
      setShowQuizResult(false);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    const resp = await getMockInterviewResponse(messages, userMsg);
    setMessages(prev => [...prev, { role: 'model', text: resp }]);
  };

  const handleQuizAnswer = (answer: string) => {
    if (answer === quiz[quizIndex].correctAnswer) setQuizScore(prev => prev + 10);
    if (quizIndex < quiz.length - 1) setQuizIndex(prev => prev + 1);
    else setShowQuizResult(true);
  };

  useEffect(() => {
    if (tab === 'problem') loadProblems();
    if (tab === 'quiz' && quiz.length === 0) loadQuiz();
  }, [tab]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 h-full flex flex-col pb-24 text-left px-4">
      {/* HUD Visual Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div className="space-y-2 md:space-y-4">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.6em]">Secure Diagnostic Vault</p>
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">The Vault<span className="text-indigo-600">.</span></h2>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl border border-slate-100 shadow-xl w-full md:w-auto">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <ShieldAlert size={20} />
          </div>
          <div className="pr-4">
             <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Security Level</p>
             <p className="text-lg md:text-xl font-black text-slate-950 italic">ENCRYPTED</p>
          </div>
        </div>
      </div>

      {/* High-Speed Tab Navigation */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 overflow-hidden">
        <VaultTabBtn active={tab === 'problem'} onClick={() => setTab('problem')} icon={<Binary size={18}/>} label="Algorithm Node" color="bg-indigo-600" />
        <VaultTabBtn active={tab === 'quiz'} onClick={() => setTab('quiz')} icon={<BrainCircuit size={18}/>} label="Logic Processor" color="bg-emerald-600" />
        <VaultTabBtn active={tab === 'comms'} onClick={() => setTab('comms')} icon={<MessageSquare size={18}/>} label="Diagnostic AI" color="bg-purple-600" />
      </div>

      <AnimatePresence mode="wait">
        {tab === 'problem' && (
          <motion.div 
            key="problem" 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {loading ? <LoadingPulse label="Synthesizing Challenges..." /> : problems.map((p, idx) => (
              <motion.div 
                key={p.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-8 md:p-14 rounded-[32px] md:rounded-[56px] border-2 border-slate-50 shadow-2xl hover:shadow-3xl transition-all group relative overflow-hidden flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6 md:mb-8 relative z-10">
                  <div className={`px-4 py-1.5 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] border-2 ${p.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : p.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {p.difficulty} LEVEL
                  </div>
                  <Cpu size={24} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
                </div>
                
                <div className="flex-1 space-y-3 md:space-y-4 mb-8 md:mb-10 relative z-10">
                  <h3 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-[0.95]">{p.title}</h3>
                  <p className="text-slate-500 font-bold text-base md:text-2xl leading-tight line-clamp-2 md:line-clamp-3">{p.description}</p>
                </div>

                <button 
                  onClick={() => onProblemSolve(p)}
                  className="w-full bg-slate-950 text-white py-6 md:py-8 rounded-[24px] md:rounded-[40px] font-black text-xl md:text-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 md:gap-6 uppercase italic tracking-tighter shadow-3xl group"
                >
                  <Code2 size={24} className="group-hover:rotate-12 transition-transform" />
                  Initialize IDE
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {tab === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto w-full">
            {loading ? <LoadingPulse label="Compiling Logic Matrix..." /> : showQuizResult ? (
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-12 md:p-20 rounded-[40px] md:rounded-[80px] border-4 border-emerald-500 shadow-3xl text-center space-y-10 md:space-y-12">
                 <div className="w-32 h-32 md:w-40 md:h-40 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl animate-bounce">
                    <Award size={60} />
                 </div>
                 <div className="space-y-4">
                    <h2 className="text-4xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">Complete</h2>
                    <p className="text-xl md:text-3xl font-black text-slate-400 uppercase tracking-[0.4em]">SCORE: <span className="text-emerald-500">{quizScore} / {quiz.length * 10}</span></p>
                 </div>
                 <button onClick={loadQuiz} className="bg-slate-950 text-white px-10 py-6 md:px-16 md:py-8 rounded-[32px] md:rounded-[48px] font-black text-2xl md:text-3xl uppercase tracking-tighter italic hover:bg-emerald-600 transition-all shadow-3xl">Restart Processor</button>
              </motion.div>
            ) : quiz[quizIndex] && (
              <div className="bg-white p-8 md:p-24 rounded-[40px] md:rounded-[80px] border border-slate-100 shadow-3xl space-y-10 md:space-y-16 text-left relative overflow-hidden">
                 <div className="flex justify-between items-center relative z-10">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.6em]">Point {quizIndex + 1} of {quiz.length}</p>
                      <h4 className="text-lg md:text-2xl font-black text-indigo-600 italic">Evaluating Logic...</h4>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl text-lg md:text-xl font-black italic">
                      {quizScore} XP
                    </div>
                 </div>
                 <h3 className="text-2xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight relative z-10">{quiz[quizIndex].question}</h3>
                 <div className="grid grid-cols-1 gap-4 md:gap-6 relative z-10">
                    {quiz[quizIndex].options.map((opt, i) => (
                      <motion.button 
                        key={i} 
                        whileHover={{ x: 5, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuizAnswer(opt)} 
                        className="p-6 md:p-12 bg-slate-50 rounded-[24px] md:rounded-[40px] text-left font-black text-lg md:text-3xl hover:bg-indigo-600 hover:text-white transition-all uppercase italic tracking-tighter border border-slate-100 group flex items-center gap-6 md:gap-8 shadow-sm"
                      >
                        <span className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white text-indigo-600 flex items-center justify-center border-2 border-indigo-50 shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-colors">0{i+1}</span>
                        {opt}
                      </motion.button>
                    ))}
                 </div>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'comms' && (
          <motion.div key="comms" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-[32px] md:rounded-[80px] border-4 border-slate-50 shadow-3xl flex flex-col h-[600px] md:h-[850px] overflow-hidden relative">
             <div className="bg-slate-950 p-6 md:p-12 border-b border-white/5 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4 md:gap-6 text-left">
                   <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-600 rounded-xl md:rounded-[28px] flex items-center justify-center text-white"><ShieldAlert size={24}/></div>
                   <div className="text-left space-y-0.5 md:space-y-1">
                      <p className="text-[9px] md:text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em]">Neural Interface v8.0</p>
                      <h4 className="text-xl md:text-4xl font-black uppercase italic tracking-tighter text-white">Diagnostic Relay</h4>
                   </div>
                </div>
                <div className="hidden sm:flex items-center gap-4 bg-indigo-900/40 text-indigo-400 px-4 md:px-6 py-2 md:py-3 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">
                   Live Analysis Active
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 md:p-16 space-y-8 md:space-y-10 custom-scrollbar bg-[#f9fafb]">
                {messages.map((m, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[90%] md:max-w-[85%] p-5 md:p-12 rounded-[24px] md:rounded-[56px] font-bold text-lg md:text-3xl leading-tight shadow-lg relative ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-indigo-100/20'}`}>
                      {m.text}
                    </div>
                  </motion.div>
                ))}
                <div ref={chatRef} />
             </div>

             <div className="p-6 md:p-14 border-t bg-white flex gap-4 md:gap-6 sticky bottom-0 z-20">
                <input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyPress={e => e.key === 'Enter' && handleSend()} 
                  className="flex-1 bg-slate-50 p-6 md:p-10 rounded-[24px] md:rounded-[48px] outline-none shadow-inner text-xl md:text-4xl font-black uppercase italic placeholder:text-slate-200 border-2 border-transparent focus:border-indigo-100 transition-all" 
                  placeholder="Initiate communication vector..." 
                />
                <button onClick={handleSend} className="bg-slate-950 text-white p-6 md:p-10 rounded-full hover:bg-indigo-600 transition-all shadow-xl active:scale-90 flex items-center justify-center shrink-0">
                  <Send size={24} className="md:scale-150 translate-x-1" />
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VaultTabBtn({ active, onClick, icon, label, color }: any) {
  return (
    <button onClick={onClick} className={`flex-1 p-5 md:p-14 rounded-[24px] md:rounded-[48px] font-black text-[10px] md:text-3xl uppercase italic tracking-tighter flex items-center justify-center gap-3 md:gap-6 transition-all relative overflow-hidden group ${active ? 'text-white shadow-3xl' : 'bg-white border-2 border-slate-50 text-slate-400 hover:bg-slate-50'}`}>
      {active && <motion.div layoutId="vaultTab" className={`absolute inset-0 ${color}`} />}
      <span className={`relative z-10 transition-transform group-hover:scale-125 ${active ? 'animate-pulse' : ''}`}>{icon}</span>
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function LoadingPulse({ label }: { label: string }) {
  return (
    <div className="col-span-full py-40 md:py-60 flex flex-col items-center justify-center space-y-10 md:space-y-12 text-slate-200">
       <div className="relative">
          <RefreshCw size={80} className="animate-spin text-indigo-600/20" />
          <Sparkles size={30} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" />
       </div>
       <p className="text-xl md:text-3xl font-black uppercase tracking-[0.5em] md:tracking-[0.8em] italic animate-pulse text-center">{label}</p>
    </div>
  );
}