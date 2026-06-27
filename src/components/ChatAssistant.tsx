import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  X, 
  User, 
  Bot, 
  Check, 
  Zap,
  ArrowRight,
  AlertCircle,
  Plus,
  History,
  Trash2,
  Calendar,
  Layers,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage, ChatSession } from "../types";

interface ChatAssistantProps {
  messages: ChatMessage[];
  chatSessions: ChatSession[];
  activeChatId: string | null;
  onSendMessage: (text: string, isVoice?: boolean) => void;
  onApplySuggestedAction: (actionType: string, payload?: any) => void;
  onSelectChatSession: (session: ChatSession) => void;
  onDeleteChatSession: (chatId: string) => void;
  onStartNewChat: () => void;
  isSendingMessage: boolean;
  theme: 'light' | 'dark';
  onTriggerVoice?: () => void;
}

export default function ChatAssistant({
  messages,
  chatSessions,
  activeChatId,
  onSendMessage,
  onApplySuggestedAction,
  onSelectChatSession,
  onDeleteChatSession,
  onStartNewChat,
  isSendingMessage,
  theme,
  onTriggerVoice
}: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest chats
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, showHistory]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSendingMessage) return;

    onSendMessage(inputText);
    setInputText("");
  };

  // Highly robust simulate voice command recording transcription
  const handleToggleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    
    // Simulate recording voice for 3 seconds and parsing transcription
    setTimeout(() => {
      setIsRecording(false);
      
      const simulatedTranscripts = [
        "Create task for build machine learning project category startup priority high hours 8 due next week",
        "Save my week overload warning",
        "Prioritize my academic goals",
        "Review my schedule for tomorrow"
      ];
      
      const selected = simulatedTranscripts[Math.floor(Math.random() * simulatedTranscripts.length)];
      onSendMessage(selected, true);
    }, 3000);
  };

  // Group chat sessions chronologically
  const getGroupedSessions = () => {
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const lastWeek: ChatSession[] = [];

    const todayStr = new Date().toDateString();
    
    const yestDate = new Date();
    yestDate.setDate(yestDate.getDate() - 1);
    const yesterdayStr = yestDate.toDateString();

    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - 7);

    chatSessions.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      const sessionStr = sessionDate.toDateString();

      if (sessionStr === todayStr) {
        today.push(session);
      } else if (sessionStr === yesterdayStr) {
        yesterday.push(session);
      } else {
        lastWeek.push(session);
      }
    });

    return { today, yesterday, lastWeek };
  };

  const { today, yesterday, lastWeek } = getGroupedSessions();

  return (
    <div className={`fixed z-50 flex flex-col items-end gap-3 font-sans transition-all duration-200
      ${isOpen 
        ? 'max-sm:bottom-0 max-sm:right-0 max-sm:left-0 max-sm:top-0 max-sm:p-0 bottom-6 right-6' 
        : 'bottom-6 right-6'
      }
    `} id="chat-assistant-container">
      
      {/* Visual Injected Keyframes for CSS Pulse Rings */}
      <style>{`
        @keyframes subtlePulse {
          0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); }
          100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
        }
        .pulse-glow-ring {
          animation: subtlePulse 2.2s infinite;
        }
      `}</style>

      {/* Visual Suggestion Banner (only visible when Closed) */}
      {!isOpen && (
        <div 
          onClick={() => setIsOpen(true)}
          className={`cursor-pointer px-4 py-2.5 rounded-2xl shadow-xl border backdrop-blur-lg text-xs leading-tight animate-bounce flex items-center gap-2 max-w-[240px] max-sm:max-w-[180px] max-sm:text-[10px] transition-all duration-150 hover:scale-102
            ${theme === 'dark' ? 'bg-[#0f0a20f0] border-purple-500/30 text-zinc-200' : 'bg-white border-purple-100 text-slate-800'}
          `}
          id="chat-hint-bubble"
        >
          <Sparkles size={14} className="text-purple-400 shrink-0" />
          <span>Need help organizing your workload? <strong>Ask Nova AI.</strong></span>
        </div>
      )}
 
      {/* Premium Glassmorphic Glowing Launcher Button */}
      {!isOpen && (
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white relative shadow-2xl transition-all border border-white/20 pulse-glow-ring
            ${theme === 'dark' 
              ? 'bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-blue-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
              : 'bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-500 shadow-[0_0_15px_rgba(168,85,247,0.35)]'
            }
          `}
          id="chat-toggle-launcher"
        >
          <Sparkles size={22} className="text-white shrink-0 animate-pulse" />
          {isSendingMessage && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500"></span>
            </span>
          )}
        </motion.button>
      )}
 
      {/* CHAT WINDOW BOX (glassmorphism bento frame - full screen on mobile, floating on desktop) */}
      {isOpen && (
        <div 
          className={`border flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative transition-all duration-250 backdrop-blur-xl
            w-[380px] h-[550px] rounded-3xl max-sm:w-screen max-sm:h-screen max-sm:rounded-none max-sm:border-none
            ${theme === 'dark' ? 'bg-[#09061df2] border-slate-800 text-zinc-100' : 'bg-white/95 border-slate-200 text-slate-900'}
          `}
          id="chat-window-box"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/30 to-blue-900/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-1.5 rounded-lg border transition-colors relative
                  ${showHistory 
                    ? 'bg-purple-600 text-white border-purple-500' 
                    : theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }
                `}
                title="Chat History"
              >
                <History size={15} />
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-lg">
                  <Bot size={15} />
                </div>
                <div>
                  <h4 className="font-bold text-xs tracking-tight">Nova AI</h4>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] uppercase tracking-wider text-green-400 font-mono">Live assistant engine</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={onStartNewChat}
                className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors
                  ${theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }
                `}
                title="Start a new conversation thread"
              >
                <Plus size={13} />
                <span className="font-semibold text-[10px] tracking-tight uppercase">New</span>
              </button>

              <button 
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg transition-colors
                  ${theme === 'dark' ? 'hover:bg-slate-500/10 text-zinc-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}
                `}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden flex flex-col">
            {/* HISTORICAL DRAWER SCREEN OVERLAY */}
            <AnimatePresence>
              {showHistory && (
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  className={`absolute inset-0 z-40 flex flex-col border-r shadow-2xl
                    ${theme === 'dark' ? 'bg-[#0b0821] border-slate-800' : 'bg-slate-50 border-slate-200'}
                  `}
                >
                  <div className={`p-3 border-b flex items-center justify-between shrink-0
                    ${theme === 'dark' ? 'border-slate-800 bg-[#0f0b2a]' : 'border-slate-200 bg-slate-100'}
                  `}>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Previous Chats</h5>
                    <button 
                      onClick={() => setShowHistory(false)}
                      className="p-1 rounded-md hover:bg-slate-500/10 text-zinc-400"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    {/* Start new chat button */}
                    <button
                      onClick={() => {
                        onStartNewChat();
                        setShowHistory(false);
                      }}
                      className="w-full p-2.5 rounded-xl border border-dashed transition-all hover:scale-101 flex items-center justify-center gap-2 text-xs font-semibold
                        ${theme === 'dark' 
                          ? 'border-purple-500/30 hover:border-purple-500 text-purple-400 hover:text-purple-300 hover:bg-purple-950/20' 
                          : 'border-purple-300 hover:border-purple-500 text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                        }
                      "
                    >
                      <Plus size={14} />
                      <span>Start Fresh Chat</span>
                    </button>

                    {/* Chat Sessions list empty state */}
                    {chatSessions.length === 0 && (
                      <div className="text-center py-10 space-y-2">
                        <Layers size={24} className="mx-auto text-zinc-500/50" />
                        <p className="text-xs text-zinc-500">No chat history cached</p>
                      </div>
                    )}

                    {/* Group: Today */}
                    {today.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400/90 font-mono">Today</p>
                        {today.map(session => (
                          <div 
                            key={session.id}
                            className={`group relative flex items-center rounded-xl p-2.5 cursor-pointer border text-xs transition-all duration-150
                              ${session.id === activeChatId 
                                ? theme === 'dark' 
                                  ? 'bg-purple-950/35 border-purple-500/50 text-white' 
                                  : 'bg-purple-50 border-purple-200 text-purple-950 font-medium'
                                : theme === 'dark'
                                  ? 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10 text-zinc-300'
                                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                              }
                            `}
                            onClick={() => {
                              onSelectChatSession(session);
                              setShowHistory(false);
                            }}
                          >
                            <MessageSquare size={13} className="mr-2 text-purple-400 shrink-0" />
                            <span className="truncate pr-5 shrink grow">{session.message || "Empty chat thread"}</span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChatSession(session.id);
                              }}
                              className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all"
                              title="Delete session"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Group: Yesterday */}
                    {yesterday.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400/90 font-mono">Yesterday</p>
                        {yesterday.map(session => (
                          <div 
                            key={session.id}
                            className={`group relative flex items-center rounded-xl p-2.5 cursor-pointer border text-xs transition-all duration-150
                              ${session.id === activeChatId 
                                ? theme === 'dark' 
                                  ? 'bg-purple-950/35 border-purple-500/50 text-white' 
                                  : 'bg-purple-50 border-purple-200 text-purple-950 font-medium'
                                : theme === 'dark'
                                  ? 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10 text-zinc-300'
                                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                              }
                            `}
                            onClick={() => {
                              onSelectChatSession(session);
                              setShowHistory(false);
                            }}
                          >
                            <MessageSquare size={13} className="mr-2 text-purple-400 shrink-0" />
                            <span className="truncate pr-5 shrink grow">{session.message || "Empty chat thread"}</span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChatSession(session.id);
                              }}
                              className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all"
                              title="Delete session"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Group: Last Week */}
                    {lastWeek.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400/90 font-mono">Older</p>
                        {lastWeek.map(session => (
                          <div 
                            key={session.id}
                            className={`group relative flex items-center rounded-xl p-2.5 cursor-pointer border text-xs transition-all duration-150
                              ${session.id === activeChatId 
                                ? theme === 'dark' 
                                  ? 'bg-purple-950/35 border-purple-500/50 text-white' 
                                  : 'bg-purple-50 border-purple-200 text-purple-950 font-medium'
                                : theme === 'dark'
                                  ? 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10 text-zinc-300'
                                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                              }
                            `}
                            onClick={() => {
                              onSelectChatSession(session);
                              setShowHistory(false);
                            }}
                          >
                            <MessageSquare size={13} className="mr-2 text-purple-400 shrink-0" />
                            <span className="truncate pr-5 shrink grow">{session.message || "Empty chat thread"}</span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChatSession(session.id);
                              }}
                              className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all"
                              title="Delete session"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty Chat Welcome Guidelines State */}
            {messages.length === 0 ? (
              <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col justify-start space-y-6">
                <div className="flex flex-col items-center text-center space-y-4 pt-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20 pulse-glow-ring">
                    <Sparkles size={28} className="text-white shrink-0 animate-pulse" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-bold tracking-tight">Hi, I'm Nova AI 👋</h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'} max-w-[280px] leading-relaxed`}>
                      I can help you prioritize work, create schedules, plan goals, and prevent missed deadlines. Let's optimize your productivity index!
                    </p>
                  </div>
                </div>

                <div className="w-full space-y-2.5 pt-2">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest text-left pl-1">Suggested prompts</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { text: "Help me plan my week", icon: "📅" },
                      { text: "Prioritize my tasks", icon: "⚡" },
                      { text: "Create a study schedule", icon: "📚" },
                      { text: "Save My Week", icon: "🚨" }
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onSendMessage(prompt.text)}
                        className={`w-full p-3 text-left rounded-xl text-xs transition-all border flex items-center gap-2.5 group
                          ${theme === 'dark' 
                            ? 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-purple-500/30 text-zinc-300' 
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-purple-300 text-slate-700'
                          }
                        `}
                      >
                        <span className="text-sm shrink-0 group-hover:scale-115 transition-transform">{prompt.icon}</span>
                        <span className="font-medium group-hover:translate-x-0.5 transition-transform">{prompt.text}</span>
                        <ArrowRight size={13} className="ml-auto opacity-0 group-hover:opacity-100 text-purple-400 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Active Chat messages Node Feed */
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs flex flex-col">
                {messages.map((m) => {
                  const isAssistant = m.sender === 'assistant';
                  return (
                    <div 
                      key={m.id}
                      className={`flex gap-2.5 max-w-[85%]
                        ${isAssistant ? 'self-start' : 'self-end ml-auto flex-row-reverse'}
                      `}
                    >
                      {/* Avatar */}
                      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm
                        ${isAssistant 
                          ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white' 
                          : 'bg-slate-500/20 text-purple-400 border border-purple-500/15'
                        }
                      `}>
                        {isAssistant ? <Bot size={13} /> : <User size={13} />}
                      </div>

                      {/* Bubble wrapping */}
                      <div className="space-y-1">
                        <div 
                          className={`p-3 rounded-2xl relative border shadow-sm
                            ${isAssistant 
                              ? theme === 'dark'
                                ? 'bg-white/5 border-white/5 text-zinc-100 rounded-tl-sm'
                                : 'bg-slate-100 border-slate-200 text-slate-800 rounded-tl-sm'
                              : 'bg-purple-600 border-purple-500 text-white rounded-tr-sm shadow-md shadow-purple-500/10'
                            }
                          `}
                        >
                          {/* Voice indicator tag */}
                          {m.isVoice && (
                            <div className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-widest text-purple-300 mb-1.5 border-b border-purple-400/20 pb-1">
                              <Mic size={10} className="text-purple-300 animate-pulse" />
                              <span>Voice transcript Node</span>
                            </div>
                          )}
                          
                          {/* Message text */}
                          <p className="leading-relaxed font-normal whitespace-pre-wrap">{m.text}</p>
                        </div>

                        {/* Timestamp Log info */}
                        <div className={`text-[8px] font-mono text-zinc-500/80 px-1
                          ${isAssistant ? 'text-left' : 'text-right'}
                        `}>
                          {m.timestamp}
                        </div>

                        {/* Action chips if any */}
                        {isAssistant && m.suggestedAction && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            <button
                              onClick={() => {
                                onApplySuggestedAction(m.suggestedAction!.type, m.suggestedAction!.payload);
                              }}
                              className="px-2.5 py-1.5 bg-[#a855f71a] hover:bg-[#a855f72e] border border-purple-500/20 rounded-xl text-[9px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1 transition-all"
                            >
                              <Zap size={11} className="text-purple-400 animate-pulse" />
                              <span>{m.suggestedAction.label}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Waiting/Typing loader indicator */}
                {isSendingMessage && (
                  <div className="flex gap-2.5 max-w-[85%] self-start">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-[10px]">
                      <Bot size={13} />
                    </div>
                    <div className={`p-3 rounded-2xl rounded-tl-sm flex items-center gap-1 border
                      ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}
                    `}>
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Voice recording warning panel */}
          {isRecording && (
            <div className="px-4 py-2 bg-rose-500/15 border-t border-b border-rose-500/20 text-rose-400 text-[10px] flex items-center gap-2 font-mono uppercase tracking-wider justify-between shrink-0 animate-pulse">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>🎤 Recording spoken phrase...</span>
              </span>
              <button onClick={() => setIsRecording(false)} className="hover:text-white font-bold">Cancel</button>
            </div>
          )}

          {/* Form input */}
          <form onSubmit={handleSend} className={`p-3 border-t flex gap-2 shrink-0
            ${theme === 'dark' ? 'border-white/5 bg-[#0f0b1e]/60' : 'border-slate-200 bg-slate-50'}
          `}>
            {/* Mic voice button */}
            <button
              type="button"
              onClick={onTriggerVoice || handleToggleVoice}
              className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-colors
                ${isRecording 
                  ? 'bg-rose-600 border-rose-500 text-white animate-pulse' 
                  : theme === 'dark'
                    ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                    : 'bg-white border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-100 shadow-sm'
                }
              `}
              title="Speak Naturally (Voice Command Parser)"
            >
              {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            {/* Input message */}
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isRecording ? "Listening..." : "Ask Nova to schedule study hours..."}
              disabled={isRecording || isSendingMessage}
              className={`grow px-3 py-2 text-xs rounded-xl focus:outline-none border transition-all
                ${theme === 'dark' 
                  ? 'bg-black/30 border-white/5 focus:border-[#a855f7] focus:ring-[#a855f7] focus:ring-1 text-white' 
                  : 'bg-white border-slate-300 text-slate-800 focus:border-purple-500 focus:ring-purple-500 focus:ring-1'
                }
              `}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={!inputText.trim() || isSendingMessage || isRecording}
              className={`p-2.5 rounded-xl text-white flex items-center justify-center shrink-0 transition-all shadow-md
                ${inputText.trim() && !isSendingMessage && !isRecording
                  ? 'bg-purple-600 hover:bg-purple-500 hover:scale-102 active:scale-98'
                  : 'bg-slate-600 opacity-40 cursor-not-allowed'
                }
              `}
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
