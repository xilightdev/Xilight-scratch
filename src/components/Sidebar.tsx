import React from 'react';
import { Plus, MessageSquare, Settings, Trash2, Zap } from 'lucide-react';
import { Logo } from './Logo';
import { ChatSession } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}) => {
  return (
    <div className="w-72 h-full bg-brutal-black border-r border-white/10 flex flex-col">
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-neon-purple to-neon-blue text-brutal-white font-display text-xl tracking-wide hover:opacity-90 transition-all rounded-sm"
        >
          <Plus size={18} />
          New Transmission
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
          History
        </div>
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "group relative flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer transition-all",
              currentSessionId === session.id
                ? "bg-white/10 text-neon-purple"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
            onClick={() => onSelectSession(session.id)}
          >
            <MessageSquare size={16} className="shrink-0" />
            <span className="text-sm truncate pr-6 font-medium">
              {session.title || "New Transmission"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 space-y-4">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Logo size={16} />
            <span className="text-sm font-display tracking-widest text-neon-blue">
              Xilight Core
            </span>
          </div>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-neon-purple to-neon-blue"
              initial={{ width: "0%" }}
              animate={{ width: "65%" }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
          </div>
          <div className="mt-2 text-xs font-mono text-white/40 uppercase flex justify-between">
            <span>Neural Load</span>
            <span>65%</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Protocol v4.2.0</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-neon-blue rounded-full" />
              <div className="w-1 h-1 bg-neon-purple rounded-full animate-pulse" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button className="p-2 bg-white/5 border border-white/10 rounded text-[10px] font-mono uppercase tracking-tighter text-neon-blue hover:bg-neon-blue/10 transition-colors">
              Deep Scan
            </button>
            <button className="p-2 bg-white/5 border border-white/10 rounded text-[10px] font-mono uppercase tracking-tighter text-white/40 hover:text-white transition-colors">
              Stealth
            </button>
          </div>

          <div className="flex items-center justify-between px-1 pt-1">
            <span className="text-[9px] font-mono text-white/20 uppercase">Latency</span>
            <span className="text-[9px] font-mono text-neon-green uppercase">24ms</span>
          </div>
          
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-mono text-white/20 uppercase">Neural Sync</span>
            <span className="text-[9px] font-mono text-neon-purple uppercase">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
