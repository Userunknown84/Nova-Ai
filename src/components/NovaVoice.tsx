import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Bot, 
  CornerDownRight, 
  HelpCircle,
  Clock,
  CheckCircle,
  Play,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, Goal } from "../types";

interface NovaVoiceProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  goals: Goal[];
  currentView: string;
  onNavigate: (view: string) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onEditTask: (id: string, updated: Partial<Task>) => void;
  onAddGoal: (title: string, category: string, targetDate: string, milestones: any[]) => void;
  onExecuteSaveMyWeek: () => void;
  onAddChatMessage: (text: string, sender: 'user' | 'assistant', isVoice?: boolean) => void;
  theme: 'light' | 'dark';
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function NovaVoice({
  isOpen,
  onClose,
  tasks,
  goals,
  currentView,
  onNavigate,
  onAddTask,
  onEditTask,
  onAddGoal,
  onExecuteSaveMyWeek,
  onAddChatMessage,
  theme
}: NovaVoiceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [assistantReply, setAssistantReply] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setTranscript("");
        setErrorMessage("");
        setAssistantReply("");
        // Cancel ongoing TTS when user starts speaking
        cancelTTS();
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setTranscript(text);
          processVoiceCommand(text);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setErrorMessage("Microphone permission denied. Enable mic access to use Nova Voice.");
        } else {
          setErrorMessage(`Voice recognition failed: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognitionInstance(rec);
    }
  }, [tasks, goals, currentView]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      cancelTTS();
    };
  }, []);

  const cancelTTS = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleListen = () => {
    if (!recognitionInstance) {
      setErrorMessage("Speech Recognition is not supported on this browser. Try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionInstance.stop();
    } else {
      try {
        recognitionInstance.start();
      } catch (err) {
        console.error("Failed to start recognition:", err);
      }
    }
  };

  const speakText = (text: string) => {
    if (isMuted) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      cancelTTS();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.05;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => 
        v.name.includes("Google US English") || 
        v.name.includes("Samantha") || 
        v.name.includes("Female") ||
        v.lang.startsWith("en-")
      );
      if (preferred) utterance.voice = preferred;

      activeUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Main command processing engine
  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Build contexts
      const tasksContext = tasks.map(t => ({ id: t.id, title: t.title, status: t.status }));
      const goalsContext = goals.map(g => g.title);

      const response = await fetch("/api/ai/process-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transcript: command,
          currentView,
          tasksContext,
          goalsContext
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with voice interpreter service.");
      }

      const data = await response.json();
      const { action, parameters, replyText, speakText: audioText } = data;

      setAssistantReply(replyText);
      setIsProcessing(false);

      // Execute structured actions on client side
      executeLocalAction(action, parameters, command, replyText);

      // Read response aloud
      speakText(audioText || replyText);

    } catch (err: any) {
      console.error("Error processing voice:", err);
      setIsProcessing(false);
      setErrorMessage("Interpreter latency error. Running rule-based command solver.");
      executeFallbackLocal(command);
    }
  };

  const executeLocalAction = (action: string, parameters: any, originalCommand: string, replyText: string) => {
    // Add interactions to chatbot history for seamless integration
    onAddChatMessage(originalCommand, 'user', true);
    onAddChatMessage(replyText, 'assistant');

    switch (action) {
      case "NAVIGATE":
        if (parameters.view) {
          onNavigate(parameters.view);
        }
        break;

      case "CREATE_TASK":
        if (parameters.title) {
          onAddTask({
            title: parameters.title,
            description: parameters.description || "Synthesized automatically from spoken voice prompt.",
            category: parameters.category || "Study",
            priority: parameters.priority || "medium",
            estimatedTime: Number(parameters.estimatedTime) || 2,
            deadline: parameters.deadline || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: "todo"
          });
          // Redirect to tasks page to show the creation
          onNavigate("tasks");
        }
        break;

      case "MARK_COMPLETE":
        let taskId = parameters.taskId;
        // Fuzzy search by title if no exact ID
        if (!taskId && parameters.taskTitle) {
          const matching = tasks.find(t => t.title.toLowerCase().includes(parameters.taskTitle.toLowerCase()));
          if (matching) {
            taskId = matching.id;
          }
        }
        if (taskId) {
          onEditTask(taskId, { status: parameters.status || "completed" });
          onNavigate("tasks");
        } else {
          setAssistantReply(`I analyzed your active task list but couldn't locate a task matching "${parameters.taskTitle || 'spoken context'}".`);
        }
        break;

      case "ADD_GOAL":
        if (parameters.title) {
          onAddGoal(
            parameters.title,
            parameters.category || "Personal",
            parameters.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            parameters.milestones || []
          );
          onNavigate("goals");
        }
        break;

      case "SAVE_MY_WEEK":
        onNavigate("save_my_week");
        onExecuteSaveMyWeek();
        break;

      case "PRIORITIZE_TASKS":
        onNavigate("planner");
        break;

      case "GENERATE_SCHEDULE":
        onNavigate("calendar");
        break;

      default:
        // Do nothing for normal Q&A other than updating chat messages
        break;
    }
  };

  // Rule-based parsing fallback if internet goes down or server fails
  const executeFallbackLocal = (command: string) => {
    const text = command.toLowerCase();
    onAddChatMessage(command, 'user', true);

    let reply = "Nova is online, but our Gemini deep reasoning engine is waiting for secret setup. ";
    let audio = "Nova Voice Online. ";

    if (text.includes("dashboard") || text.includes("home") || text.includes("mainframe")) {
      onNavigate("dashboard");
      reply += "Redirecting you to the Nova Workspace Dashboard mainframe.";
      audio += "Navigating to Dashboard.";
    } else if (text.includes("task") || text.includes("todo") || text.includes("to-do")) {
      onNavigate("tasks");
      if (text.includes("create") || text.includes("add") || text.includes("new")) {
        const titleMatch = command.match(/(?:create|add|new)\s+(?:task|todo)\s+called\s+([^]+)/i) || 
                           command.match(/(?:create|add|new)\s+(?:task|todo)\s+([^]+)/i);
        const title = titleMatch ? titleMatch[1] : "Spoken Commitment Task";
        onAddTask({
          title,
          description: "Created via rule-based spoken fallback command.",
          category: "Work",
          priority: "medium",
          estimatedTime: 2,
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "todo"
        });
        reply += `Successfully initialized task node: "${title}" inside your Work registry.`;
        audio += `Created task ${title}.`;
      } else {
        reply += "Opening your Task Workspace registry.";
        audio += "Opening task registry.";
      }
    } else if (text.includes("calendar") || text.includes("schedule")) {
      onNavigate("calendar");
      reply += "Pulling up your temporal Calendar and weekly focus map coordinates.";
      audio += "Opening calendar schedule.";
    } else if (text.includes("goal")) {
      onNavigate("goals");
      if (text.includes("add") || text.includes("create") || text.includes("new")) {
        const titleMatch = command.match(/(?:create|add|new)\s+goal\s+([^]+)/i);
        const title = titleMatch ? titleMatch[1] : "Spoken Target Goal";
        onAddGoal(
          title,
          "Personal",
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          []
        );
        reply += `Initialized long-term commitment goal: "${title}" inside your coordinates.`;
        audio += `Created goal ${title}.`;
      } else {
        reply += "Opening your long-term goal benchmarks tracker.";
        audio += "Opening goal benchmarks.";
      }
    } else if (text.includes("habit") || text.includes("streak")) {
      onNavigate("habits");
      reply += "Displaying daily ritual and consistency metrics.";
      audio += "Opening habits.";
    } else if (text.includes("save my week") || text.includes("overload") || text.includes("emergency")) {
      onNavigate("save_my_week");
      onExecuteSaveMyWeek();
      reply += "Activating cognitive emergency protocol. Executing Save My Week load redistribution algorithms.";
      audio += "Executing Save My Week protocol.";
    } else {
      reply += "I decoded your voice, but that command requires a cloud-based Gemini API model. Try asking 'Go to calendar', 'Create task write code', or 'Save my week'.";
      audio += "Try saying, Go to calendar, or, Save my week.";
    }

    setAssistantReply(reply);
    onAddChatMessage(reply, 'assistant');
    speakText(audio);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#020108]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`w-full max-w-lg border rounded-3xl p-6 relative overflow-hidden shadow-[0_0_50px_rgba(147,51,234,0.15)] font-sans
            ${theme === 'dark' ? 'bg-[#080517]/95 border-purple-500/30 text-white' : 'bg-white border-purple-100 text-slate-800'}
          `}
          id="nova-voice-panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                <Bot size={16} className="animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">Nova Voice Assistant</h4>
                <p className="text-[10px] font-mono uppercase tracking-widest text-purple-400">Tactical Productivity Companion</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mute toggle */}
              <button
                onClick={() => {
                  const nextMute = !isMuted;
                  setIsMuted(nextMute);
                  if (nextMute) cancelTTS();
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer hover:scale-105 active:scale-95
                  ${isMuted 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                    : theme === 'dark'
                      ? 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }
                `}
                title={isMuted ? "Unmute Speech" : "Mute Speech"}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  cancelTTS();
                  onClose();
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer hover:scale-105 active:scale-95
                  ${theme === 'dark' 
                    ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10' 
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Assistant Visualizer Wave / Orb */}
          <div className="py-10 flex flex-col items-center justify-center relative z-10">
            <div className="relative mb-6">
              {/* Wave pulse layers */}
              <AnimatePresence>
                {(isListening || isSpeaking) && (
                  <>
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full bg-purple-500/20 filter blur-md"
                    />
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.4 }}
                      className="absolute inset-0 rounded-full bg-indigo-500/15 filter blur-lg"
                    />
                  </>
                )}
              </AnimatePresence>

              {/* Central Trigger Mic Orb */}
              <motion.button
                onClick={toggleListen}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white relative z-20 shadow-2xl transition-all border cursor-pointer
                  ${isListening 
                    ? 'bg-gradient-to-tr from-rose-600 to-fuchsia-600 border-rose-400 animate-pulse'
                    : isProcessing
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-600 border-amber-400'
                      : isSpeaking
                        ? 'bg-gradient-to-tr from-teal-500 to-blue-600 border-teal-400'
                        : theme === 'dark'
                          ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 border-purple-500/50 hover:shadow-[0_0_30px_rgba(147,51,234,0.4)]'
                          : 'bg-gradient-to-tr from-purple-500 to-indigo-500 border-purple-400 hover:shadow-[0_0_20px_rgba(147,51,234,0.25)]'
                  }
                `}
                id="nova-voice-trigger-orb"
              >
                {isListening ? (
                  <MicOff size={28} className="animate-bounce" />
                ) : (
                  <Mic size={28} />
                )}
              </motion.button>
            </div>

            {/* Status text */}
            <div className="text-center">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border font-mono
                ${isListening 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                  : isProcessing
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                    : isSpeaking
                      ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                      : theme === 'dark'
                        ? 'bg-purple-500/5 border-purple-500/20 text-purple-400'
                        : 'bg-purple-50 border-purple-100 text-purple-600'
                }
              `}>
                {isListening ? "Listening..." : isProcessing ? "Nova is thinking..." : isSpeaking ? "Nova is speaking..." : "Ready. Tap mic to speak"}
              </span>
            </div>
          </div>

          {/* Conversational Screen Panel */}
          <div className="space-y-4 relative z-10">
            {/* Error alerts */}
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[11px] text-rose-400 font-medium flex items-start gap-2 animate-shake">
                <span className="shrink-0 text-xs">⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Transcript */}
            {transcript && (
              <div className={`p-4 rounded-2xl border text-xs
                ${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'}
              `}>
                <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
                  <Mic size={11} />
                  <span>You Spoke</span>
                </div>
                <p className={`font-semibold tracking-wide ${theme === 'dark' ? 'text-zinc-200' : 'text-slate-700'}`}>"{transcript}"</p>
              </div>
            )}

            {/* Assistant Response Box */}
            {assistantReply && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border text-xs bg-gradient-to-tr
                  ${theme === 'dark' 
                    ? 'from-purple-950/10 to-indigo-950/10 border-purple-500/20 text-zinc-200' 
                    : 'from-purple-50/50 to-indigo-50/50 border-purple-100 text-slate-800'
                  }
                `}
              >
                <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-purple-400 mb-1.5">
                  <Sparkles size={11} className="animate-pulse" />
                  <span>Nova Companion</span>
                </div>
                <p className="leading-relaxed whitespace-pre-line">{assistantReply}</p>
              </motion.div>
            )}

            {/* Sample commands catalog */}
            {!transcript && !assistantReply && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest pl-1 font-mono">Sample Voice Instructions</p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-medium font-mono">
                  {[
                    "Create task to prepare startup pitch deck",
                    "Complete task preparation",
                    "Add goal learn typescript coding",
                    "Go to calendar view",
                    "Show my goals tracker",
                    "🚨 Run emergency Save My Week"
                  ].map((tip, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTranscript(tip);
                        processVoiceCommand(tip);
                      }}
                      className={`p-2.5 text-left rounded-xl border cursor-pointer transition-all hover:scale-101 flex items-center gap-1.5 group
                        ${theme === 'dark' 
                          ? 'bg-white/5 border-white/5 hover:border-purple-500/30 text-zinc-400 hover:text-white' 
                          : 'bg-slate-50 border-slate-200 hover:border-purple-200 text-slate-600 hover:text-slate-900'
                        }
                      `}
                    >
                      <CornerDownRight size={10} className="text-purple-400 group-hover:translate-x-0.5 transition-all" />
                      <span className="truncate">{tip}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Atmospheric background glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-500/5 filter blur-3xl pointer-events-none" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
