import React from 'react';
import { Logo } from './components/Logo';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { InputBar } from './components/InputBar';
import { SparkVisualizer } from './components/SparkVisualizer';
import { ChatSession, Message, SparkNode } from './types';
import { gemini } from './services/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LayoutGrid, BrainCircuit, X, Menu } from 'lucide-react';
import { cn } from './lib/utils';

const STORAGE_KEY = 'xilight_sessions';

const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {
    // Fallback
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export default function App() {
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(null);
  const [typingCount, setTypingCount] = React.useState(0);
  const isTyping = typingCount > 0;
  const [sparkNodes, setSparkNodes] = React.useState<SparkNode[]>([]);
  const [showSpark, setShowSpark] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Load sessions from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  // Save sessions to localStorage
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: '',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setSparkNodes([]);
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (currentSessionId === id) {
      setCurrentSessionId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleSend = async (text: string) => {
    setError(null);
    let targetSessionId = currentSessionId;

    if (!targetSessionId) {
      const newId = generateId();
      const newSession: ChatSession = {
        id: newId,
        title: text.slice(0, 30),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(newId);
      targetSessionId = newId;
    }

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(s => {
      if (s.id === targetSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMsg],
          updatedAt: Date.now(),
          title: s.title || text.slice(0, 30)
        };
      }
      return s;
    }));

    setTypingCount(prev => prev + 1);

    try {
      let fullResponse = '';
      const modelMsgId = generateId();
      
      // Initialize model message
      setSessions(prev => prev.map(s => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            messages: [...s.messages, {
              id: modelMsgId,
              role: 'model',
              content: '',
              timestamp: Date.now()
            }]
          };
        }
        return s;
      }));

      const stream = gemini.streamResponse(text, currentSession?.messages || []);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setSessions(prev => prev.map(s => {
          if (s.id === targetSessionId) {
            return {
              ...s,
              messages: s.messages.map(m => 
                m.id === modelMsgId ? { ...m, content: fullResponse } : m
              )
            };
          }
          return s;
        }));
      }

      extractConcepts(fullResponse);

    } catch (error: any) {
      console.error("Gemini Error:", error);
      let message = error.message || "An unexpected error occurred during transmission.";
      if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
        message = "Neural link saturated (Quota Exceeded). The system has attempted multiple retries. Please wait a few minutes or check your Gemini API billing/quota status.";
      }
      setError(message);
    } finally {
      setTypingCount(prev => Math.max(0, prev - 1));
    }
  };

  const extractConcepts = (text: string) => {
    // Very basic extraction: look for capitalized words or key terms
    // In a real app, this would be another AI call or a NLP library
    const words = text.match(/\b[A-Z][a-z]{3,}\b/g) || [];
    const uniqueWords = Array.from(new Set(words)).slice(0, 5);
    
    const newNodes: SparkNode[] = uniqueWords.map(word => ({
      id: word.toLowerCase(),
      label: word,
      type: 'concept',
      connections: sparkNodes.length > 0 ? [sparkNodes[Math.floor(Math.random() * sparkNodes.length)].id] : []
    }));

    setSparkNodes(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const filtered = newNodes.filter(n => !existingIds.has(n.id));
      return [...prev, ...filtered].slice(-20); // Keep last 20 nodes
    });
  };

  return (
    <div className="flex h-screen bg-brutal-black text-brutal-white overflow-hidden relative">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={(id) => {
            setCurrentSessionId(id);
            setIsMobileMenuOpen(false);
          }}
          onNewChat={() => {
            handleNewChat();
            setIsMobileMenuOpen(false);
          }}
          onDeleteSession={handleDeleteSession}
        />
      </div>

      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 lg:px-6 bg-brutal-black/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 lg:hidden text-white/60 hover:text-white"
            >
              <Menu size={20} />
            </button>
            <div className="w-8 h-8 bg-brutal-black border border-white/10 rounded flex items-center justify-center shrink-0">
              <Logo size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-display tracking-wide truncate">
                {currentSession?.title || "Neural Link"}
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-neon-blue rounded-full animate-pulse shrink-0" />
                <span className="text-xs font-mono text-white/30 uppercase tracking-widest truncate">
                  System Online • Secure Session
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button 
              onClick={() => setShowSpark(!showSpark)}
              className={cn(
                "hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all text-xs font-display tracking-wider",
                showSpark ? "bg-neon-purple/10 border-neon-purple/30 text-neon-purple" : "bg-white/5 border-white/10 text-white/40 hover:text-white"
              )}
            >
              <BrainCircuit size={14} />
              Spark View
            </button>
            <button className="p-2 text-white/40 hover:text-white transition-colors">
              <LayoutGrid size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            {(!currentSession || currentSession.messages.length === 0) ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8"
                >
                  <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-neon-purple/20">
                    <Logo size={40} />
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-display tracking-tight mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-blue to-neon-purple animate-gradient">
                      Hello Developer,
                    </span>
                    <br />
                    <span className="text-white/80">what is on your thoughts today?</span>
                  </h1>
                </motion.div>
                
                <div className="w-full max-w-3xl">
                  <InputBar onSend={handleSend} isHome />
                </div>
              </div>
            ) : (
              <>
                <ChatArea messages={currentSession.messages} isTyping={isTyping} />
                
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="mx-4 mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-500 text-xs font-mono uppercase tracking-widest"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span>Error: {error}</span>
                      <button 
                        onClick={() => setError(null)}
                        className="ml-auto hover:text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <InputBar onSend={handleSend} />
              </>
            )}
          </div>

          <AnimatePresence>
            {showSpark && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-white/10 p-4 bg-white/[0.01] overflow-hidden hidden lg:block"
              >
                <div className="space-y-6">
                  <SparkVisualizer nodes={sparkNodes} />
                  
                  <div className="space-y-4">
                    <div className="px-1 py-2 border-b border-white/10">
                      <h3 className="text-[10px] font-display uppercase tracking-[0.2em] text-white/40">
                        Neural Insights
                      </h3>
                    </div>
                    
                    {sparkNodes.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                          Awaiting Data Stream...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sparkNodes.slice(-5).reverse().map((node, i) => (
                          <motion.div
                            key={node.id}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-3 bg-white/5 border border-white/10 rounded-lg group hover:border-neon-purple/30 transition-all"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-mono text-neon-blue uppercase">
                                #{node.id}
                              </span>
                              <span className="text-[8px] font-mono text-white/20">
                                0.98 Conf.
                              </span>
                            </div>
                            <p className="text-xs text-white/60 group-hover:text-white transition-colors">
                              Detected conceptual node: {node.label}. Integrating into neural map.
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
