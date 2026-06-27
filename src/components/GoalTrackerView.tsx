import React, { useState } from "react";
import { 
  Target, 
  Plus, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  CheckSquare, 
  CheckSquare2, 
  Trash2, 
  BrainCircuit,
  ChevronDown,
  X
} from "lucide-react";
import { Goal, Milestone } from "../types";

interface GoalTrackerViewProps {
  goals: Goal[];
  onAddGoal: (title: string, category: string, targetDate: string, milestones: Milestone[]) => void;
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onDeleteGoal: (id: string) => void;
  isGeneratingMilestones: boolean;
  theme: 'light' | 'dark';
}

export default function GoalTrackerView({
  goals,
  onAddGoal,
  onToggleMilestone,
  onDeleteGoal,
  isGeneratingMilestones,
  theme
}: GoalTrackerViewProps) {
  // Dialog flow
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalCat, setGoalCat] = useState("Professional");
  const [goalDate, setGoalDate] = useState("2026-12-31");

  // Selection info
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim() || !goalDate) return;

    // Intelligent baseline seed of weekly targets & milestone actions based on goal input!
    let generatedMilestones: Milestone[] = [];
    const normalizedTitle = goalTitle.toLowerCase();

    if (normalizedTitle.includes("interview") || normalizedTitle.includes("job") || normalizedTitle.includes("placement")) {
      generatedMilestones = [
        { id: 'm-1', title: 'Revise Data Structures & Algorithms', deadline: '2026-08-30', completed: false, targetWeek: 'Week 1-4', dailyActions: ['Solve 2 LeetCode cards', 'Review HashMap complexity'] },
        { id: 'm-2', title: 'Formulate Mock Behavioural telemetries', deadline: '2026-09-30', completed: false, targetWeek: 'Week 5-8', dailyActions: ['Format STAR questions responses', 'Watch leadership webinars'] },
        { id: 'm-3', title: 'Optimize Portfolio assets & CV metrics', deadline: '2026-10-31', completed: false, targetWeek: 'Week 9-12', dailyActions: ['Tune index page loads', 'Validate markdown codeblocks'] }
      ];
    } else if (normalizedTitle.includes("startup") || normalizedTitle.includes("business") || normalizedTitle.includes("build")) {
      generatedMilestones = [
        { id: 'm-1', title: 'Verify MVP boundaries & Sandboxes', deadline: '2026-07-31', completed: false, targetWeek: 'Week 1-3', dailyActions: ['Draft schema definitions', 'Audit competitors UX structures'] },
        { id: 'm-2', title: 'Conduct Customer Interviews', deadline: '2026-08-31', completed: false, targetWeek: 'Week 4-7', dailyActions: ['Call 3 client contacts', 'Update feature roadmaps'] },
        { id: 'm-3', title: 'Complete Pitch Deck assets', deadline: '2026-09-30', completed: false, targetWeek: 'Week 8-10', dailyActions: ['Re-render vector banners', 'Fine-tune product valuations'] }
      ];
    } else {
      // Default versatile fallback
      generatedMilestones = [
        { id: 'm-1', title: 'Establish core parameters & Research foundation', deadline: '2026-08-15', completed: false, targetWeek: 'Week 1-3', dailyActions: ['Read documentation', 'Set up developer sandbox'] },
        { id: 'm-2', title: 'Continuous building & Incremental reviews', deadline: '2026-10-15', completed: false, targetWeek: 'Week 4-8', dailyActions: ['Publish code blocks', 'Fix layout alerts'] },
        { id: 'm-3', title: 'Release final MVP node', deadline: '2026-11-30', completed: false, targetWeek: 'Week 9-12', dailyActions: ['Run validation checks', 'Show preview to mentors'] }
      ];
    }

    onAddGoal(goalTitle, goalCat, goalDate, generatedMilestones);
    setGoalTitle("");
    setIsAddingGoal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight" id="goal-tracker-headline">Milestone Architect</h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Define high-level aspirations. Watch Nova's compiler break them down into multi-layer Milestones, Weekly Targets, and Daily Actions.
          </p>
        </div>

        <button 
          onClick={() => setIsAddingGoal(true)}
          className="cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-white shrink-0 shadow-lg shadow-purple-500/25 flex items-center gap-1.5"
          id="btn-add-objective-goal"
        >
          <Plus size={15} />
          <span>Launch AI Goal Objective</span>
        </button>
      </div>

      {/* CREATE GOAL MODAL */}
      {isAddingGoal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`p-6 border rounded-3xl w-full max-w-md shadow-2xl relative
            ${theme === 'dark' ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-250 text-slate-900'}
          `}>
            <button 
              onClick={() => setIsAddingGoal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-white/10 text-zinc-400"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
              <Sparkles className="text-purple-400" size={18} />
              <span>Initiate AI-Level Goal</span>
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-zinc-400 mb-1">Goal Objective</label>
                <input 
                  type="text" 
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Crack Placement Interview at Apple, Learn React"
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none
                    ${theme === 'dark' ? 'bg-black/30 border-white/10 focus:border-purple-500' : 'bg-slate-50 border-slate-300'}
                  `}
                  required
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  AI generates customized milestone structures targeting this exact context phrase.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Target Date</label>
                  <input 
                    type="date" 
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-purple-500
                      ${theme === 'dark' ? 'bg-black/30 border-white/10 text-zinc-300' : 'bg-slate-50 border-slate-300'}
                    `}
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Category</label>
                  <select 
                    value={goalCat}
                    onChange={(e) => setGoalCat(e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none
                      ${theme === 'dark' ? 'bg-[#0f0a20] border-white/10 text-zinc-300' : 'bg-white border-slate-200'}
                    `}
                  >
                    <option value="Professional">Professional Grow</option>
                    <option value="Startup Development">Startup Incubate</option>
                    <option value="Academic Coursework">Academic Studies</option>
                    <option value="Body & Health">Body & Health</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddingGoal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/5 text-zinc-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:brightness-110 text-white font-bold flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Compile Milestones</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED GOALS GRID */}
      {goals.length === 0 ? (
        <div className="p-16 border border-dashed border-slate-500/15 rounded-3xl text-center backdrop-blur-md">
          <Target className="mx-auto text-zinc-500 mb-4" size={36} />
          <p className="text-zinc-400 text-sm">No active objective variables configured. Set one up to test AI breakdowns!</p>
          <button 
            onClick={() => setIsAddingGoal(true)}
            className="text-purple-400 text-xs mt-3 font-bold hover:underline"
          >
            Launch Your First Goal Objective
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List panel */}
          <div className="lg:col-span-1 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 pb-2 border-b border-white/5 font-bold">
              Productive Objectives
            </h4>

            <div className="space-y-3">
              {goals.map((g) => {
                const isSelected = selectedGoalId === g.id || (selectedGoalId === null && goals[0].id === g.id);
                if (selectedGoalId === null && goals[0].id === g.id) {
                  // auto-select first one on mount safely
                  setTimeout(() => setSelectedGoalId(g.id), 0);
                }

                return (
                  <div 
                    key={g.id}
                    onClick={() => setSelectedGoalId(g.id)}
                    className={`p-5 rounded-2xl border backdrop-blur-md cursor-pointer transition-all duration-150
                      ${isSelected 
                        ? 'bg-[#1a143b] border-purple-500/40 shadow-md shadow-purple-600/10 scale-102' 
                        : 'bg-zinc-900/50 border-white/5 hover:bg-zinc-900 hover:border-white/10'
                      }
                    `}
                    id={`goal-item-${g.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-purple-400">
                        {g.category}
                      </span>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteGoal(g.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-rose-400"
                        title="Delete Goal Node"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <h4 className="font-bold text-sm text-zinc-100 group-hover:text-white leading-snug">{g.title}</h4>

                    <div className="mt-4 space-y-1.5 font-sans text-xs">
                      <div className="flex justify-between font-bold text-zinc-300">
                        <span>Milestones done</span>
                        <span>{g.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-500/10 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-purple-500 h-full rounded-full transition-all" 
                          style={{ width: `${g.progress}%` }} 
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono mt-3 border-t border-white/5 pt-2">
                      <span>Target: {g.targetDate}</span>
                      <span>{g.milestones.length} Phases</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakdown/Milestones Detail panel */}
          <div className="lg:col-span-2 space-y-5">
            {(() => {
              const activeGoal = goals.find(g => g.id === selectedGoalId) || goals[0];
              if (!activeGoal) return null;

              return (
                <div className={`p-6 border rounded-3xl backdrop-blur-md relative
                  ${theme === 'dark' ? 'bg-[#0f0a20cb] border-white/5 shadow-xl' : 'bg-white border-slate-200'}
                `} id={`detail-pane-${activeGoal.id}`}>
                  
                  {/* Decorative */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 blur-3xl" />

                  <div className="border-b border-white/5 pb-4 mb-6">
                    <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-[#d946ef]">Active Roadmap Matrix</span>
                    <h3 className="text-lg font-black tracking-tight text-white mt-1">{activeGoal.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans mt-1">
                      Check off completed phases. Toggling milestones recalculates cumulative target scores in real time.
                    </p>
                  </div>

                  {/* Milestones timeline vertical list */}
                  <div className="relative border-l border-slate-550/15 ml-4 pl-8 space-y-6">
                    
                    {activeGoal.milestones.map((m, mIdx) => (
                      <div key={m.id} className="relative">
                        {/* Bullet */}
                        <div className={`absolute top-1.5 -left-[41px] w-6 h-6 rounded-full border flex items-center justify-center font-mono text-xs font-bold transition-all
                          ${m.completed 
                            ? 'bg-purple-600 border-purple-500 text-white' 
                            : 'bg-[#151128] border-white/10 text-zinc-500'
                          }
                        `}>
                          {mIdx + 1}
                        </div>

                        {/* Content Card */}
                        <div className="p-4 bg-white/2 hover:bg-white/5 border border-white/5 rounded-2xl transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 font-mono">
                            <div>
                              <span className="text-[9px] uppercase font-bold tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                                {m.targetWeek}
                              </span>
                              <span className="text-[10px] text-zinc-500 ml-2">Due: {m.deadline}</span>
                            </div>

                            <button
                              onClick={() => {
                                onToggleMilestone(activeGoal.id, m.id);
                              }}
                              className={`px-3 py-1 rounded-lg text-[9px] font-bold border uppercase transition-all flex items-center gap-1
                                ${m.completed 
                                  ? 'bg-purple-500/15 border-purple-500/25 text-purple-400' 
                                  : 'border-white/5 text-zinc-400 hover:text-white'
                                }
                              `}
                            >
                              {m.completed ? '✓ Completed' : 'Mark Completed'}
                            </button>
                          </div>

                          <h4 className={`font-bold text-sm tracking-tight ${m.completed ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                            {m.title}
                          </h4>

                          {/* Daily action nodes */}
                          <div className="mt-3 block border-t border-white/5 pt-3 space-y-2 font-sans">
                            <span className="text-[10px] uppercase font-mono text-zinc-500 block">Daily focus targets:</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              {m.dailyActions.map((action, actionIdx) => (
                                <div key={actionIdx} className="flex items-center gap-2 p-2 bg-slate-500/5 rounded-lg border border-white/2 text-zinc-400">
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                                  <span className="truncate">{action}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      </div>
                    ))}

                  </div>

                </div>
              );
            })()}
          </div>

        </div>
      )}

    </div>
  );
}
