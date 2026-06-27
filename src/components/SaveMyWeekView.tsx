import { useState } from "react";
import { 
  Zap, 
  BrainCircuit, 
  AlertOctagon, 
  ChevronRight, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  X,
  RefreshCw
} from "lucide-react";
import { AIRecoveryPlan } from "../types";

interface SaveMyWeekViewProps {
  recoveryPlan: AIRecoveryPlan | null;
  onGeneratePlan: () => void;
  isGeneratingPlan: boolean;
  theme: 'light' | 'dark';
}

export default function SaveMyWeekView({
  recoveryPlan,
  onGeneratePlan,
  isGeneratingPlan,
  theme
}: SaveMyWeekViewProps) {
  return (
    <div className="space-y-6">
      
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2" id="save-week-title">
            <Zap className="text-orange-500 animate-bounce" size={20} />
            <span>Save My Week Protocol</span>
          </h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Emergency cognitive load-leveling scheduler to resolve multiple pending deadlines, bypass burnout, and secure milestones.
          </p>
        </div>

        <button 
          onClick={onGeneratePlan}
          disabled={isGeneratingPlan}
          className={`cursor-pointer px-4/5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-orange-600 via-[#ea580c] to-amber-500 text-white shadow-lg shadow-orange-500/20 shrink-0 flex items-center gap-2 transition-transform hover:scale-102
            ${isGeneratingPlan ? 'opacity-65 animate-pulse' : ''}
          `}
          id="btn-trigger-save-week"
        >
          {isGeneratingPlan ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Analyzing Workspace Telemetries...</span>
            </>
          ) : (
            <>
              <Zap size={14} />
              <span>Deploy Emergency Recovery Plan</span>
            </>
          )}
        </button>
      </div>

      {/* DETAILED CARDS & RESULTS DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Assessment warnings */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Workload Risk Gauge */}
          <div className={`p-6 border rounded-3xl backdrop-blur-md relative font-sans
            ${theme === 'dark' ? 'bg-[#1e0f0fbf] border-red-500/15' : 'bg-rose-500/5 border-rose-200'}
          `} id="risk-assessment-widget">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2 text-rose-400 mb-4 uppercase font-mono text-xs font-bold">
              <ShieldAlert size={18} />
              <span>Cumulative Workspace Threat</span>
            </div>

            {recoveryPlan ? (
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-mono">Computed Danger tier</div>
                  <strong className="text-2xl font-black tracking-tight text-rose-500 uppercase font-sans">
                    {recoveryPlan.riskLevel} threat index
                  </strong>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed leading-normal">
                  {recoveryPlan.riskExplanation}
                </p>

                <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-[10px] font-mono text-rose-400 leading-snug">
                  ⚠ Overload criteria triggered. High chance of missed study papers or coding deadlines without prompt leveling offsets.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed text-slate-500">
                  Trigger the assessment node to run live calculations comparing active estimated task bounds against cumulative daily cognitive limits.
                </p>
                
                <button 
                  onClick={onGeneratePlan}
                  className="w-full py-2 bg-slate-500/10 text-slate-300 rounded-xl text-[10px] font-bold border border-white/5 uppercase"
                >
                  Initiate dry audit
                </button>
              </div>
            )}
          </div>

          {/* Core concept advice */}
          <div className={`p-6 border rounded-3xl backdrop-blur-md font-sans
            ${theme === 'dark' ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200 shadow-xs'}
          `} id="mitigation-heuristics-widget">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 font-bold">
              Leveling Protocols
            </h4>
            <ul className="space-y-3 text-xs leading-normal font-sans text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong>De-escalate</strong> blocks: Convert low-importance study assets into delayed queues.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong>Buffer Sprints</strong>: Dedicate 30 mins to reading or physical exercises between major projects.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong>Aggregate</strong> meetings into clean, protected calendar blocks.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Right columns: Recovery step nodes & schedule schedules output */}
        <div className="lg:col-span-2 space-y-6">
          
          {recoveryPlan ? (
            <>
              {/* Recovery Steps list */}
              <div className={`p-6 border rounded-3xl backdrop-blur-md relative font-sans
                ${theme === 'dark' ? 'bg-[#0f0a20cb] border-[#ea580c22] shadow-2xl' : 'bg-white border-slate-205'}
              `} id="recovery-steps-matrix">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded tracking-wider">
                      Executive Roadmap
                    </span>
                    <h3 className="text-base font-black tracking-tight text-white mt-1">
                      Stabilization Procedures
                    </h3>
                  </div>
                  <Sparkles size={16} className="text-orange-400 animate-pulse" />
                </div>

                <div className="space-y-4 font-sans text-xs">
                  {recoveryPlan.recoverySteps.map((step, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 bg-white/2 hover:bg-white/5 border border-white/5 rounded-2xl flex items-start gap-3 transition-colors"
                    >
                      <div className="w-5 h-5 rounded-full bg-orange-500/15 text-orange-400 shrink-0 flex items-center justify-center font-bold text-[10px] font-mono">
                        {idx + 1}
                      </div>
                      <p className="text-zinc-300 leading-normal font-medium leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly outlook scheduled nodes */}
              {recoveryPlan.optimizedSchedule.length > 0 && (
                <div className={`p-6 border rounded-3xl backdrop-blur-md font-sans
                  ${theme === 'dark' ? 'bg-zinc-900/60 border-white/5 shadow-md' : 'bg-white border-slate-220'}
                `} id="recovery-schedule-output">
                  <div className="pb-3 border-b border-white/5 mb-4">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                      Optimized Weekly Schedule
                    </h4>
                    <p className="text-[11px] text-[#ea580c] italic mt-1 pb-1">
                      "{recoveryPlan.weeklyOutlook}"
                    </p>
                  </div>

                  <div className="space-y-3">
                    {recoveryPlan.optimizedSchedule.map((item, i) => (
                      <div 
                        key={i} 
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border border-white/2 bg-white/2 rounded-2xl"
                      >
                        <div className="w-44 shrink-0 font-mono text-xs font-black text-orange-400">
                          {item.timeBlock}
                        </div>
                        
                        <div className="grow min-w-0">
                          <h4 className="font-bold text-sm text-zinc-100 truncate">{item.taskTitle}</h4>
                          <p className="text-[10px] text-zinc-400 mt-1 italic truncate font-sans">
                            "{item.actionReason}"
                          </p>
                        </div>

                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold bg-[#ea580c1e] text-orange-400 px-2.5 py-0.5 rounded shrink-0">
                          {item.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Idle Recovery Card state */
            <div className="p-16 border border-dashed border-slate-500/15 rounded-3xl text-center backdrop-blur-md">
              <Zap className="mx-auto text-zinc-500 mb-3" size={32} />
              <p className="text-zinc-400 text-xs">Run a Stabilization Calculation to create structural weekly timetables.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
