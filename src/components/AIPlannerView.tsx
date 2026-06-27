import React, { useState } from "react";
import { 
  BrainCircuit, 
  Sparkles, 
  Play, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  ChevronRight, 
  CheckCircle2, 
  Hourglass,
  LayoutGrid,
  TrendingUp,
  X
} from "lucide-react";
import { Task, TaskBreakdown } from "../types";

interface AIPlannerViewProps {
  tasks: Task[];
  activeBreakdown: TaskBreakdown | null;
  onTriggerBreakdown: (title: string, hours: number) => void;
  isGeneratingBreakdown: boolean;
  scheduleSuggestions: any[];
  onGenerateSmartSchedule: () => void;
  isGeneratingSchedule: boolean;
  theme: 'light' | 'dark';
}

export default function AIPlannerView({
  tasks,
  activeBreakdown,
  onTriggerBreakdown,
  isGeneratingBreakdown,
  scheduleSuggestions,
  onGenerateSmartSchedule,
  isGeneratingSchedule,
  theme
}: AIPlannerViewProps) {
  const [largeTaskTitle, setLargeTaskTitle] = useState("");
  const [largeTaskHours, setLargeTaskHours] = useState(12);

  const handleDecompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!largeTaskTitle.trim()) return;

    onTriggerBreakdown(largeTaskTitle, Number(largeTaskHours) || 12);
  };

  return (
    <div className="space-y-6">
      
      {/* Tracker Headers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight" id="planner-headline">AI Planner & Workspace Sandbox</h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Break down complex projects or generate intelligent daily focus agendas based on deadlines and mental limits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Input Panel to run dynamic operations */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Project Breakdown Box Form */}
          <div className={`p-6 border rounded-3xl backdrop-blur-md relative
            ${theme === 'dark' ? 'bg-[#0f0a20] border-white/5 shadow-2xl' : 'bg-white border-slate-205'}
          `} id="decoupling-input-box">
            <h3 className="text-sm font-black tracking-tight flex items-center gap-1.5 mb-4 text-[#a855f7]">
              <Sparkles size={16} />
              <span>AI Milestone Decoupler</span>
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4">
              Enter any massive or ambiguous objective (e.g., "Build ML Chatbot" or "Study for Bio Exams"). Watch Gemini parse order roadmap metrics instantly.
            </p>

            <form onSubmit={handleDecompose} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-zinc-400 mb-1">Large Project Objective</label>
                <input 
                  type="text" 
                  value={largeTaskTitle}
                  onChange={(e) => setLargeTaskTitle(e.target.value)}
                  placeholder="e.g. Build Machine Learning Model"
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none
                    ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-300'}
                  `}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Target workload (cumulative hours)</label>
                <input 
                  type="number" 
                  value={largeTaskHours}
                  onChange={(e) => setLargeTaskHours(Number(e.target.value) || 10)}
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none
                    ${theme === 'dark' ? 'bg-black/40 border-white/10 text-zinc-300' : 'bg-slate-50 border-slate-300'}
                  `}
                  min={1}
                />
              </div>

              <button 
                type="submit"
                disabled={isGeneratingBreakdown}
                className={`w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-[#d946ef] to-blue-500 hover:brightness-110 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-transform hover:scale-101
                  ${isGeneratingBreakdown ? 'opacity-65 animate-pulse' : ''}
                `}
                id="btn-run-breakdown"
              >
                <BrainCircuit size={15} />
                <span>{isGeneratingBreakdown ? 'Running Gemini Deconstruction...' : 'Decompose Objective'}</span>
              </button>
            </form>
          </div>

          {/* Daily Scheduler Button Box */}
          <div className={`p-6 border rounded-3xl backdrop-blur-md relative
            ${theme === 'dark' ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200'}
          `} id="scheduler-generative-box">
            <h3 className="text-sm font-black tracking-tight flex items-center gap-1.5 mb-3 text-blue-400">
              <Clock size={16} />
              <span>Smart Schedule Orchestrator</span>
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4">
              Instruct the AI to coordinate your pending tasks into optimal 2-hour deep focused daily schedule chunks.
            </p>

            <button
              onClick={onGenerateSmartSchedule}
              disabled={isGeneratingSchedule || tasks.length === 0}
              className={`w-full py-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all duration-150
                ${theme === 'dark' 
                  ? 'bg-white/5 border-white/15 text-white hover:bg-white/10' 
                  : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                }
                ${isGeneratingSchedule ? 'animate-pulse opacity-60' : ''}
              `}
              id="btn-run-scheduler-planner"
            >
              <Sparkles size={14} className="text-blue-400" />
              <span>{isGeneratingSchedule ? 'Orchestrating Agenda...' : 'Generate Daily Schedule'}</span>
            </button>
          </div>

        </div>

        {/* Right Columns: Active decompiled roadmap or schedule outputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Project Breakdown Display */}
          {activeBreakdown ? (
            <div className={`p-6 border rounded-3xl backdrop-blur-md relative font-sans
              ${theme === 'dark' ? 'bg-[#0a071d] border-purple-500/20' : 'bg-white border-slate-205 shadow-md'}
            `} id="active-breakdown-panel">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-purple-500/10 px-2 py-0.5 rounded text-purple-400 tracking-wider">
                    Gemini Timeline Compiler
                  </span>
                  <h3 className="text-base font-black tracking-tight text-white mt-1">
                    Decomposed: {activeBreakdown.taskTitle}
                  </h3>
                  <p className="text-xs text-[#a855f7] italic mt-1 font-sans">
                    "{activeBreakdown.roadmapSummary}"
                  </p>
                </div>
                
                <div className="p-3 bg-white/2 border border-white/5 rounded-xl shrink-0 text-center">
                  <div className="text-[9px] font-mono text-zinc-500 uppercase">Est hours</div>
                  <strong className="text-lg font-black text-white">{activeBreakdown.estimatedTotalHours}h</strong>
                </div>
              </div>

              {/* Milestones timeline vertical cascade */}
              <div className="relative border-l border-[#a855f7]/20 ml-3 pl-8 space-y-5">
                {activeBreakdown.subtasks.map((sub, i) => (
                  <div key={sub.id} className="relative">
                    <div className="absolute top-1.5 -left-[40px] w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold font-mono text-xs flex items-center justify-center">
                      {sub.recommendedOrder}
                    </div>

                    <div className="p-4 bg-white/2 hover:bg-white/5 border border-white/2 rounded-2xl transition-all">
                      <div className="flex justify-between items-center mb-1 text-[9px] font-mono text-zinc-500">
                        <span>Phase {i + 1}</span>
                        <span className="bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded font-bold uppercase">
                          {sub.estimatedHours} hours active
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-sm text-zinc-100">{sub.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-normal font-sans">
                        {sub.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            /* Idle decompiled advice */
            <div className="p-12 border border-dashed border-slate-500/15 rounded-3xl text-center backdrop-blur-md">
              <BrainCircuit className="mx-auto text-zinc-500 mb-3" size={32} />
              <p className="text-zinc-400 text-xs">Run an Objective Deconstruction to compiled milestone steps here.</p>
            </div>
          )}

          {/* Schedule output Display */}
          {scheduleSuggestions.length > 0 && (
            <div className={`p-6 border rounded-3xl backdrop-blur-md relative font-sans
              ${theme === 'dark' ? 'bg-zinc-900/60 border-white/5 shadow-md' : 'bg-white border-slate-220'}
            `} id="schedule-planner-timeline-out">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5 pb-2 border-b border-white/5">
                <Clock size={15} />
                <span>Computed daily schedule pipeline</span>
              </h3>

              <div className="space-y-3">
                {scheduleSuggestions.map((sug, i) => (
                  <div 
                    key={i} 
                    className="flex justify-between items-center gap-4 p-4 border border-white/2 bg-white/2 rounded-2xl"
                  >
                    <div className="w-24 shrink-0 font-mono text-xs font-black text-blue-400">
                      {sug.timeBlock}
                    </div>
                    
                    <div className="grow min-w-0">
                      <h4 className="font-bold text-sm text-zinc-100 truncate">{sug.taskTitle}</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 italic font-sans truncate">
                        "{sug.actionReason}"
                      </p>
                    </div>

                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold bg-slate-500/10 text-slate-400 px-2.5 py-0.5 rounded shrink-0">
                      {sug.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
