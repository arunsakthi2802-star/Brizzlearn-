
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ViewState, UserProfile, CareerPath, RoadmapNode, Difficulty, Recommendation, Resource, Reminder } from './types';
import { INITIAL_PATHS, JOBS } from './constants';
import { getGeminiAdvice, getCareerRecommendations, getMotivationQuote } from './services/geminiService';
import { Menu, X } from 'lucide-react';

// Module Imports
import Home from './components/Home';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import MissionSetup from './components/MissionSetup';
import RoadmapView from './components/RoadmapView';
import IDEView from './components/IDEView';
import ProjectsView from './components/ProjectsView';
import NewsView from './components/NewsView';
import VaultView from './components/VaultView';
import LaunchpadView from './components/LaunchpadView';
import ResourceDrawer from './components/ResourceDrawer';
import LearningLab from './components/LearningLab';
import SageModal from './components/SageModal';
import NotificationOverlay from './components/NotificationOverlay';

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activePath, setActivePath] = useState<CareerPath | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSageOpen, setIsSageOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'motivation' | 'achievement', message: string } | null>(null);

  useEffect(() => {
    if (user && user.interest) {
      if (user.dynamicRoadmap) {
        setActivePath({
          id: user.interest,
          title: user.interest,
          description: "Personalized AI-generated path.",
          starterGuide: user.dynamicStarterGuide,
          nodes: user.dynamicRoadmap
        });
      } else {
        const path = INITIAL_PATHS.find(p => p.id === user.interest) || INITIAL_PATHS[0];
        setActivePath(path);
      }
      fetchAiAdvice(user.interest, user.skillLevel);
    } else {
      setActivePath(null);
    }
  }, [user?.interest, user?.dynamicRoadmap, user?.skillLevel, user?.dynamicStarterGuide]);

  // Trigger motivation on Dashboard load
  useEffect(() => {
    if (user && view === 'dashboard') {
      const triggerMotivation = async () => {
        const quote = await getMotivationQuote(user.language);
        setNotification({ type: 'motivation', message: quote });
      };
      triggerMotivation();
    }
  }, [view, user]);

  const fetchAiAdvice = async (interest: string, level: string) => {
    setLoading(true);
    const advice = await getGeminiAdvice(interest, level);
    setAiAdvice(advice || '');
    setLoading(false);
  };

  const toggleNodeCompletion = (nodeId: string) => {
    if (!user || !activePath) return;
    const isCompleted = user.completedNodes.includes(nodeId);
    let newCompleted = isCompleted ? user.completedNodes.filter(id => id !== nodeId) : [...user.completedNodes, nodeId];
    
    if (!isCompleted) {
       setNotification({ type: 'achievement', message: `Vector Secured: ${activePath.nodes.find(n => n.id === nodeId)?.title} 🏆` });
    }

    const updatedNodes = activePath.nodes.map((node, i) => {
      const isDone = newCompleted.includes(node.id);
      const isPrevDone = i === 0 || newCompleted.includes(activePath.nodes[i-1].id);
      return { ...node, status: isDone ? 'completed' : (isPrevDone ? 'unlocked' : 'locked') } as RoadmapNode;
    });

    setUser({ ...user, completedNodes: newCompleted });
    setActivePath({ ...activePath, nodes: updatedNodes });
  };

  const handleApply = (jobId: string) => {
    if (!user) return;
    const exists = user.applications.find(a => a.jobId === jobId);
    if (exists) return;
    const newApp = { id: Math.random().toString(), jobId, status: 'Applied' as const };
    setUser({ ...user, applications: [...user.applications, newApp] });
  };

  const addReminder = (text: string, dueDate: string, priority: 'low' | 'medium' | 'high') => {
    if (!user) return;
    const newReminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      dueDate,
      completed: false,
      priority
    };
    setUser({ ...user, reminders: [newReminder, ...user.reminders] });
  };

  const toggleReminder = (id: string) => {
    if (!user) return;
    const updated = user.reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r);
    setUser({ ...user, reminders: updated });
  };

  const removeReminder = (id: string) => {
    if (!user) return;
    const updated = user.reminders.filter(r => r.id !== id);
    setUser({ ...user, reminders: updated });
  };

  const handlePathActivation = (path: Recommendation) => {
    if (!user) return;
    const dynamicNodes: RoadmapNode[] = path.milestones.map((m, i) => ({
      id: `ai-node-${i}`,
      title: m.title,
      description: m.description,
      topics: m.topics,
      proTips: m.proTips,
      status: i === 0 ? 'unlocked' : 'locked',
      resources: m.resources,
      practicePrompt: `Project challenge for ${m.title}`,
      practiceCode: `// Mission: ${m.title}\n`
    }));

    setUser({ 
      ...user, 
      interest: path.title, 
      skillLevel: Difficulty.BEGINNER, 
      dynamicRoadmap: dynamicNodes,
      dynamicStarterGuide: path.starterGuide,
      completedNodes: [], 
      knownSkills: user.knownSkills,
      applications: [],
      reminders: [],
      quizScores: []
    });
    setView('dashboard');
  };

  const handleResetMission = () => {
    if (!user) return;
    setUser({ ...user, interest: '', dynamicRoadmap: undefined, dynamicStarterGuide: undefined, completedNodes: [], reminders: [] });
    setView('dashboard');
  };

  const handleLaunchLab = (resource: Resource) => {
    setActiveResource(resource);
    setView('learning-lab');
    setIsMobileMenuOpen(false);
    setSelectedNode(null);
  };

  if (view === 'home') {
    return <Home onStart={() => setView('onboarding')} />;
  }

  if (view === 'onboarding') {
    return (
      <Onboarding onComplete={(name: string, language: string) => { 
        setUser({ name, language, knownSkills: [], interest: '', skillLevel: Difficulty.BEGINNER, completedNodes: [], applications: [], reminders: [], quizScores: [] }); 
        setView('dashboard'); 
      }} />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 bg-slate-50 font-sans flex-col md:flex-row">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] md:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`fixed inset-y-0 left-0 z-[101] w-72 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          view={view} 
          setView={(v) => { setView(v); setIsMobileMenuOpen(false); }} 
          user={user} 
          onLogout={() => { setUser(null); setView('home'); }} 
          onOpenSage={() => setIsSageOpen(true)}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="md:hidden h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
          <div className="font-black text-xl tracking-tighter text-indigo-600">Brizzlearn</div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-100 rounded-xl text-slate-900">
            <Menu size={24} />
          </button>
        </div>

        <Header 
          view={view} 
          user={user} 
          activePath={activePath} 
          handleResetMission={handleResetMission} 
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 custom-scrollbar bg-slate-50/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full max-w-[1600px] mx-auto"
            >
              {view === 'dashboard' && (
                user?.interest ? (
                  <Dashboard 
                    user={user} 
                    path={activePath} 
                    setView={setView} 
                    onNodeClick={setSelectedNode}
                    aiAdvice={aiAdvice} 
                    loading={loading}
                    onAddReminder={addReminder}
                    onToggleReminder={toggleReminder}
                    onRemoveReminder={removeReminder}
                  />
                ) : (
                  <MissionSetup onSelectPath={handlePathActivation} userLanguage={user?.language || 'English'} />
                )
              )}
              {view === 'roadmap' && <RoadmapView path={activePath} onNodeClick={setSelectedNode} />}
              {view === 'editor' && <IDEView node={selectedNode} onComplete={() => selectedNode && toggleNodeCompletion(selectedNode.id)} />}
              {view === 'projects' && <ProjectsView />}
              {view === 'news' && <NewsView filter={user?.interest} />}
              {view === 'vault' && <VaultView domain={user?.interest || 'General'} onProblemSolve={(p) => { setSelectedNode({ ...p, status: 'unlocked', resources: [], topics: [] } as any); setView('editor'); }} />}
              {view === 'launchpad' && <LaunchpadView user={user!} jobs={JOBS} onApply={handleApply} />}
              {view === 'learning-lab' && activeResource && (
                <LearningLab resource={activeResource} userLanguage={user?.language || 'English'} onBack={() => setView('dashboard')} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {selectedNode && (
            <ResourceDrawer 
              node={selectedNode} 
              onClose={() => setSelectedNode(null)} 
              onStartCoding={() => { setView('editor'); setIsMobileMenuOpen(false); }}
              onLaunchLab={handleLaunchLab}
              isCompleted={user?.completedNodes.includes(selectedNode.id) || false}
              onToggleComplete={() => toggleNodeCompletion(selectedNode.id)}
            />
          )}
        </AnimatePresence>

        <SageModal 
          isOpen={isSageOpen} 
          onClose={() => setIsSageOpen(false)} 
          userLanguage={user?.language || 'English'} 
        />

        <NotificationOverlay 
          notification={notification} 
          onClear={() => setNotification(null)} 
        />
      </main>
    </div>
  );
}
