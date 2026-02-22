import React from 'react';
import { Send, Paperclip, Mic, Image as ImageIcon, X, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface InputBarProps {
  onSend: (text: string, attachments?: any[]) => void;
  disabled?: boolean;
  isHome?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ onSend, disabled, isHome }) => {
  const [text, setText] = React.useState('');
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (text.trim() || attachments.length > 0) {
      onSend(text, attachments);
      setText('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, isHome ? 300 : 200)}px`;
    }
  };

  return (
    <div className={cn(
      "p-2 lg:p-4 transition-all duration-500",
      isHome ? "bg-transparent border-none" : "bg-brutal-black border-t border-white/10"
    )}>
      <div className={cn(
        "mx-auto relative transition-all duration-500",
        isHome ? "max-w-3xl" : "max-w-4xl"
      )}>
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex gap-2 mb-2 overflow-x-auto pb-2"
            >
              {attachments.map((file, i) => (
                <div key={i} className="relative group shrink-0">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/10 rounded border border-white/20 flex items-center justify-center overflow-hidden">
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Paperclip size={16} className="text-white/40" />
                    )}
                  </div>
                  <button
                    onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={cn(
          "relative flex items-end gap-1 lg:gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5 lg:p-2 focus-within:border-neon-purple/50 transition-all",
          isHome && "p-3 lg:p-4 bg-white/[0.07] border-white/20 shadow-2xl shadow-neon-purple/5"
        )}>
          <div className="flex items-center gap-0.5 lg:gap-1 pb-0.5 lg:pb-1">
            <button className="p-1.5 lg:p-2 text-white/40 hover:text-white transition-colors">
              <Paperclip size={isHome ? 22 : 18} className="lg:w-5 lg:h-5" />
            </button>
            <button className="hidden sm:block p-1.5 lg:p-2 text-white/40 hover:text-white transition-colors">
              <ImageIcon size={isHome ? 22 : 18} className="lg:w-5 lg:h-5" />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={isHome ? "What is on your thoughts today?" : "Transmit..."}
            className={cn(
              "flex-1 bg-transparent border-none focus:ring-0 text-sm py-1.5 lg:py-2 resize-none placeholder:text-white/20",
              isHome ? "text-lg py-3 lg:py-4 max-h-[300px]" : "max-h-[150px] lg:max-h-[200px]"
            )}
          />

          <div className="flex items-center gap-0.5 lg:gap-1 pb-0.5 lg:pb-1">
            <button className="hidden sm:block p-1.5 lg:p-2 text-white/40 hover:text-white transition-colors">
              <Mic size={isHome ? 22 : 18} className="lg:w-5 lg:h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!text.trim() && attachments.length === 0}
              className={cn(
                "p-1.5 lg:p-2 rounded-lg transition-all",
                text.trim() || attachments.length > 0
                  ? "bg-gradient-to-r from-neon-purple to-neon-blue text-brutal-white hover:scale-105"
                  : "bg-white/10 text-white/20",
                isHome && "p-3 lg:p-4"
              )}
            >
              <Send size={isHome ? 22 : 18} className="lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>
        
        <div className="mt-1.5 lg:mt-2 flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 text-xs font-mono text-white/40 uppercase tracking-widest">
              <Globe size={10} className="text-neon-blue lg:w-3 lg:h-3" />
              <span className="hidden xs:inline">Search Grounding Active</span>
              <span className="xs:hidden">Live</span>
            </div>
          </div>
          <div className="hidden sm:block text-[10px] font-mono text-white/20 uppercase tracking-widest">
            Shift + Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};
