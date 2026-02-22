import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '../types';
import { cn } from '../lib/utils';
import { User, Bot, Copy, Check, Share2, Zap } from 'lucide-react';
import { Logo } from './Logo';
import { motion } from 'framer-motion';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);
  const isModel = message.role === 'model';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 lg:gap-4 p-4 lg:p-6 transition-colors",
        isModel ? "bg-white/[0.02]" : "bg-transparent"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-sm flex items-center justify-center shrink-0 border",
        isModel ? "bg-brutal-black border-white/10" : "bg-white/10 border-white/20 text-white"
      )}>
        {isModel ? <Logo size={18} /> : <User size={18} />}
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-widest text-white/40">
            {isModel ? "Xilight Core" : "User"} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy} className="p-1 hover:text-neon-blue transition-colors">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <button className="p-1 hover:text-neon-blue transition-colors">
              <Share2 size={14} />
            </button>
          </div>
        </div>

        <div className="markdown-body">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="relative group/code">
                    <div className="absolute right-2 top-2 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                       <button 
                        onClick={() => navigator.clipboard.writeText(String(children))}
                        className="p-1.5 bg-brutal-black/80 border border-white/10 rounded hover:bg-white/10 transition-colors"
                       >
                        <Copy size={12} />
                       </button>
                    </div>
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </Markdown>
        </div>
      </div>
    </motion.div>
  );
};

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isTyping }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto divide-y divide-white/5">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div className="p-4 lg:p-6 flex gap-3 lg:gap-4 bg-white/[0.02]">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0 border bg-brutal-black border-white/10">
              <Logo size={18} />
            </div>
            <div className="flex items-center gap-1">
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-1 h-1 bg-neon-purple rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                className="w-1 h-1 bg-neon-blue rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                className="w-1 h-1 bg-neon-purple rounded-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
