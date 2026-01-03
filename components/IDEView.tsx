
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, Play, Files, Terminal as TerminalIcon, Search, Settings, 
  ChevronDown, FileCode, Trash2, X, Trophy, BookOpen, ShieldCheck, 
  Zap, Globe, Edit3, Plus, FolderPlus, Save, ChevronRight, RefreshCw
} from 'lucide-react';
import { RoadmapNode, VirtualFile, ProblemSet } from '../types';
import { simulateCodeExecution, simulateTerminal } from '../services/geminiService';

interface IDEViewProps {
  node: RoadmapNode | null;
  onComplete: () => void;
}

const DEFAULT_FILES: VirtualFile[] = [
  { id: '1', name: 'main.js', content: '// Write your code here...', language: 'javascript' },
];

const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' },
  { label: 'Rust', value: 'rust' },
  { label: 'Go', value: 'go' },
];

export default function IDEView({ node, onComplete }: IDEViewProps) {
  const [files, setFiles] = useState<VirtualFile[]>(DEFAULT_FILES);
  const [activeFileId, setActiveFileId] = useState<string>(DEFAULT_FILES[0].id);
  const [output, setOutput] = useState<string[]>(['> Orbit Kernel v6.5.0 Online', '> Awaiting vector initialization...']);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [terminalInput, setTerminalInput] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];
  const problem = node as unknown as ProblemSet;
  const isProblemMode = !!problem?.description && !!problem?.starterCode;

  useEffect(() => {
    if (node?.practiceCode) {
      const initialFile: VirtualFile = {
        id: 'mission-main',
        name: node.title.toLowerCase().includes('python') ? 'mission.py' : 'mission.js',
        content: node.practiceCode,
        language: node.title.toLowerCase().includes('python') ? 'python' : 'javascript'
      };
      setFiles([initialFile]);
      setActiveFileId(initialFile.id);
      setIsSuccess(false);
    }
  }, [node]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const handleRun = async () => {
    setIsExecuting(true);
    setOutput(prev => [...prev, `> Executing ${activeFile.name}...`]);
    try {
      const result = await simulateCodeExecution(activeFile.content, activeFile.language);
      setOutput(prev => [...prev, ...result.split('\n')]);
      if (result.toLowerCase().includes('success') || result.toLowerCase().includes('correct') || result.toLowerCase().includes('verified')) {
        setIsSuccess(true);
      }
    } catch (e) {
      setOutput(prev => [...prev, 'ERROR: Execution failed. Uplink unstable.']);
    }
    setIsExecuting(false);
  };

  const processLocalCommand = (cmd: string) => {
    const parts = cmd.trim().split(' ');
    const base = parts[0].toLowerCase();
    const arg = parts[1];

    switch (base) {
      case 'clear':
        setOutput([]);
        return true;
      case 'ls':
        setOutput(prev => [...prev, files.map(f => f.name).join('  ')]);
        return true;
      case 'pwd':
        setOutput(prev => [...prev, '/home/orbit/project']);
        return true;
      case 'cat':
        const file = files.find(f => f.name === arg);
        if (file) setOutput(prev => [...prev, file.content]);
        else setOutput(prev => [...prev, `cat: ${arg}: No such file or directory`]);
        return true;
      case 'help':
        setOutput(prev => [...prev, 'Available commands: ls, cat, pwd, clear, help, mkdir, rm']);
        return true;
      default:
        return false;
    }
  };

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    
    const cmd = terminalInput;
    setTerminalInput('');
    setOutput(prev => [...prev, `$ ${cmd}`]);
    
    if (!processLocalCommand(cmd)) {
      const result = await simulateTerminal(cmd, files.map(f => ({ name: f.name, content: f.content })));
      setOutput(prev => [...prev, ...result.split('\n')]);
    }
  };

  const createNewFile = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newFile: VirtualFile = {
      id: newId,
      name: `new_file_${files.length + 1}.js`,
      content: '',
      language: 'javascript'
    };
    setFiles([...files, newFile]);
    setActiveFileId(newId);
    startRename(newFile);
  };

  const startRename = (file: VirtualFile) => {
    setEditingFileId(file.id);
    setRenameValue(file.name);
  };

  const finishRename = () => {
    if (!editingFileId) return;
    setFiles(files.map(f => {
      if (f.id === editingFileId) {
        const ext = renameValue.split('.').pop() || 'js';
        let lang = 'javascript';
        if (ext === 'py') lang = 'python';
        if (ext === 'cpp') lang = 'cpp';
        return { ...f, name: renameValue, language: lang };
      }
      return f;
    }));
    setEditingFileId(null);
  };

  const deleteFile = (id: string) => {
    if (files.length <= 1) return;
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id) setActiveFileId(newFiles[0].id);
  };

  const highlightTerminal = (line: string) => {
    if (line.startsWith('$')) {
      const parts = line.split(' ');
      const cmd = parts[0].substring(1);
      const args = parts.slice(1).join(' ');
      return (
        <div className="flex gap-2 font-mono">
          <span className="text-emerald-500 font-bold">$</span>
          <span className="text-indigo-400 font-black">{cmd}</span>
          <span className="text-slate-300">{args}</span>
        </div>
      );
    }
    if (line.startsWith('>')) return <div className="text-slate-500 italic font-mono">{line}</div>;
    if (line.toLowerCase().includes('error') || line.toLowerCase().includes('fail')) return <div className="text-rose-500 font-bold font-mono">{line}</div>;
    if (line.toLowerCase().includes('success') || line.toLowerCase().includes('verified')) return <div className="text-emerald-400 font-bold font-mono">{line}</div>;
    return <div className="text-slate-300 font-mono">{line}</div>;
  };

  return (
    <div className="h-full flex flex-col bg-[#05070a] rounded-[48px] md:rounded-[64px] overflow-hidden border-2 border-white/5 shadow-3xl text-left">
      {/* HUD Header */}
      <div className="h-16 md:h-20 bg-slate-900/50 border-b border-white/5 flex items-center justify-between px-6 md:px-10 shrink-0">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 pr-6 border-r border-white/5">
            <Code2 className="text-indigo-500" size={24} />
            <span className="text-white font-black uppercase text-xs tracking-widest hidden sm:block">Orbit.IDE</span>
          </div>
          <div className="flex items-center gap-2">
            {files.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFileId(f.id)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  activeFileId === f.id 
                    ? 'bg-indigo-600 text-white border-indigo-400' 
                    : 'bg-white/5 text-slate-500 border-transparent hover:bg-white/10'
                }`}
              >
                {f.name}
              </button>
            ))}
            <button onClick={createNewFile} className="p-2 text-slate-500 hover:text-white transition-colors"><Plus size={18} /></button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleRun}
            disabled={isExecuting}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-8 py-3 rounded-2xl flex items-center gap-4 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 group font-black uppercase text-[10px] tracking-widest"
          >
            {/* Added RefreshCw to imports to fix line 213 */}
            {isExecuting ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} className="fill-current" />}
            {isExecuting ? 'UPLINKING...' : 'RUN VECTOR'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Explorer Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-slate-900/30 border-r border-white/5 flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Explorer</span>
                <button onClick={createNewFile} className="p-1 hover:text-indigo-400"><Plus size={16}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {files.map(f => (
                  <div key={f.id} className={`group flex items-center justify-between p-3 rounded-xl transition-all ${activeFileId === f.id ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-500 hover:bg-white/5'}`}>
                    <button 
                      onClick={() => setActiveFileId(f.id)}
                      className="flex-1 flex items-center gap-3 text-left overflow-hidden"
                    >
                      <FileCode size={16} className={f.language === 'python' ? 'text-yellow-500' : 'text-blue-400'} />
                      {editingFileId === f.id ? (
                        <input 
                          autoFocus
                          className="bg-transparent outline-none border-b border-indigo-400 text-white w-full"
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onBlur={finishRename}
                          onKeyPress={e => e.key === 'Enter' && finishRename()}
                        />
                      ) : (
                        <span className="text-[11px] font-black uppercase truncate">{f.name}</span>
                      )}
                    </button>
                    <div className="hidden group-hover:flex items-center gap-2">
                      <button onClick={() => startRename(f)} className="p-1 hover:text-white"><Edit3 size={14}/></button>
                      {files.length > 1 && <button onClick={() => deleteFile(f.id)} className="p-1 hover:text-rose-500"><Trash2 size={14}/></button>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/50">
          <div className="flex-1 flex overflow-hidden">
             <div className="py-6 bg-black/20 select-none border-r border-white/5 w-14 shrink-0">
                {activeFile.content.split('\n').map((_, i) => (
                  <div key={i} className="text-slate-800 text-right pr-4 text-[11px] font-mono h-8 leading-8 italic">{i + 1}</div>
                ))}
             </div>
             <textarea 
                value={activeFile.content}
                onChange={(e) => setFiles(files.map(f => f.id === activeFileId ? { ...f, content: e.target.value } : f))}
                spellCheck={false}
                className="flex-1 bg-transparent text-indigo-100/90 p-8 font-mono text-lg md:text-xl outline-none resize-none leading-8 custom-scrollbar placeholder:text-slate-800"
                placeholder="// CONSTRUCT MISSION LOGIC..."
             />
          </div>

          {/* Terminal */}
          <div className="h-64 md:h-80 bg-black/60 border-t border-white/5 flex flex-col">
            <div className="h-10 bg-slate-900/80 px-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <TerminalIcon size={14} className="text-emerald-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Diagnostic Terminal</span>
              </div>
              <button onClick={() => setOutput(['> Buffer Cleared.'])} className="text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-widest">Clear</button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-2">
              {output.map((line, i) => (
                <div key={i} className="leading-relaxed">{highlightTerminal(line)}</div>
              ))}
              <form onSubmit={handleTerminalSubmit} className="flex items-center gap-3 mt-2">
                <span className="text-emerald-500 font-black font-mono">$</span>
                <input 
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white font-mono font-bold text-sm"
                  autoFocus
                />
              </form>
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>

        {/* Quest Overlay */}
        <AnimatePresence>
          {isProblemMode && isSidebarOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-slate-900 border-l border-white/5 flex flex-col overflow-hidden shrink-0 hidden lg:flex"
            >
              <div className="p-8 border-b border-white/5 bg-slate-950">
                <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.5em] flex items-center gap-3">
                  <BookOpen size={16} /> Mission Log
                </h4>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar text-left">
                <div className="space-y-4">
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border ${problem.difficulty === 'Easy' ? 'bg-emerald-950 text-emerald-400 border-emerald-900' : 'bg-rose-950 text-rose-400 border-rose-900'}`}>
                    {problem.difficulty} Priority
                  </div>
                  <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{problem.title}</h3>
                  <p className="text-slate-400 font-bold leading-relaxed">{problem.description}</p>
                </div>
                <div className="space-y-6 pt-10 border-t border-white/5">
                  <h5 className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-3"><ShieldCheck size={16}/> Success Matrix</h5>
                  <div className="space-y-3">
                    {problem.testCases?.map((tc, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-[10px] font-black">{idx + 1}</div>
                        <span className="text-[11px] font-mono text-slate-300">{tc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isSuccess && (
           <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute bottom-10 right-10 bg-emerald-600 p-10 rounded-[48px] shadow-3xl text-white z-[100] border-4 border-emerald-400 max-w-sm text-center"
           >
              <div className="flex flex-col items-center gap-6">
                <Trophy size={64} className="animate-bounce" />
                <h4 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Node Secured.</h4>
                <p className="text-emerald-100 font-bold">Logic verified. Ready for next protocol.</p>
                <button 
                  onClick={onComplete}
                  className="w-full bg-slate-950 text-white py-6 rounded-[32px] font-black text-xl uppercase tracking-tighter italic hover:bg-white hover:text-emerald-600 transition-all shadow-2xl flex items-center justify-center gap-4"
                >
                  Confirm <ChevronRight size={24} />
                </button>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
