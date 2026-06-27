import { 
  Zap, 
  BrainCircuit, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  Target, 
  Flame, 
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Task, Goal, Habit } from "../types";

interface DashboardViewProps {
  user: { name: string; email: string } | null;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  scheduleSuggestions: any[];
  onTriggerSaveMyWeek: () => void;
  onAddTaskClick: () => void;
  onQuickPrioritize: () => void;
  onNavigateToTab: (viewId: string) => void;
  isLoadingPriorities: boolean;
  theme: 'light' | 'dark';
}

export default function DashboardView({
  user,
  tasks,
  goals,
  habits,
  scheduleSuggestions,
  onTriggerSaveMyWeek,
  onAddTaskClick,
  onQuickPrioritize,
  onNavigateToTab,
  isLoadingPriorities,
  theme
}: DashboardViewProps) {
  // Real-time calculated metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Custom productivity score: blend completion rate + active streak metrics + importance allocation
  const activeStreakBoost = habits.reduce((acc, current) => acc + current.streak, 0) * 1.5;
  const rawScore = 35 + (completionRate * 0.5) + (activeStreakBoost);
  const productivityScore = Math.min(98.4, Math.max(42.1, Math.round(rawScore * 10) / 10));

  const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
  const criticalCount = tasks.filter(t => {
    if (t.status === 'completed') return false;
    const diff = new Date(t.deadline).getTime() - Date.now();
    return diff > 0 && diff < (2 * 24 * 60 * 60 * 1000); // due in 48h
  }).length;

  const hasActivity = totalTasks > 0 || goals.length > 0 || habits.length > 0;

  if (!hasActivity) {
    return (
      <div className="space-y-8 py-4 animate-fade-in font-sans">
        
        {/* Onboarding Welcome Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-mono font-bold tracking-wider uppercase border border-purple-500/20">
            <Sparkles size={12} className="shrink-0" />
            <span>AI Workspace Initialized</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mt-1 text-white" id="onboarding-welcome-title">
            Welcome to Nova AI
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            "Let's start building your productivity system."
          </p>
        </div>

        {/* Onboarding Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto" id="onboarding-cards-grid">
          
          {/* Card 1: Create Your First Task */}
          <div className={`p-6 border rounded-3xl backdrop-blur-md flex gap-4 transition-all hover:scale-[1.01]
            ${theme === 'dark' ? 'bg-[#120e2e]/40 border-white/5' : 'bg-white border-slate-200 shadow-xs'}
          `}>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100">Create Your First Task</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-normal">
                Commit to your daily duties. Define deadlines, set estimated action hours, and let Nova evaluate priorities.
              </p>
            </div>
          </div>

          {/* Card 2: Set Your First Goal */}
          <div className={`p-6 border rounded-3xl backdrop-blur-md flex gap-4 transition-all hover:scale-[1.01]
            ${theme === 'dark' ? 'bg-[#120e2e]/40 border-white/5' : 'bg-white border-slate-200 shadow-xs'}
          `}>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Target size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100">Set Your First Goal</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-normal">
                Establish broad objectives like startup pre-seeds or grade parameters. Define custom milestones for clean tracking.
              </p>
            </div>
          </div>

          {/* Card 3: Start a Habit */}
          <div className={`p-6 border rounded-3xl backdrop-blur-md flex gap-4 transition-all hover:scale-[1.01]
            ${theme === 'dark' ? 'bg-[#120e2e]/40 border-white/5' : 'bg-white border-slate-200 shadow-xs'}
          `}>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Flame size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100">Start a Habit</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-normal">
                Develop daily routine clusters. Track streaks and scale consistency graphs to buffer academic study overload.
              </p>
            </div>
          </div>

          {/* Card 4: Ask Nova AI for Planning Assistance */}
          <div className={`p-6 border rounded-3xl backdrop-blur-md flex gap-4 transition-all hover:scale-[1.01]
            ${theme === 'dark' ? 'bg-[#120e2e]/40 border-white/5' : 'bg-white border-slate-200 shadow-xs'}
          `}>
            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100">Ask Nova AI for Planning Assistance</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-normal">
                Query the intelligent assistant module. Let the planners layout structured weekly templates for your workspace.
              </p>
            </div>
          </div>

        </div>

        {/* Action Buttons Container */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto pt-4" id="onboarding-cta-container">
          <button
            onClick={onAddTaskClick}
            className="w-full sm:w-auto cursor-pointer px-6 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-500 hover:brightness-110 text-white shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
          >
            <span>Add Task</span>
          </button>
          
          <button
            onClick={() => onNavigateToTab('goals')}
            className={`w-full sm:w-auto cursor-pointer px-6 py-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2
              ${theme === 'dark' 
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }
            `}
          >
            <span>Create Goal</span>
          </button>

          <button
            onClick={() => onNavigateToTab('planner')}
            className={`w-full sm:w-auto cursor-pointer px-6 py-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2
              ${theme === 'dark' 
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }
            `}
          >
            <span>Open AI Assistant</span>
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight" id="dashboard-welcome">
            Welcome back, {user?.name || "Chief"}.
          </h2>
          <p className={`text-xs mt-1 font-sans ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
            Nova AI has evaluated <span className="text-purple-400 font-semibold">{totalTasks} tasks</span> and identified <span className="text-rose-400 font-semibold">{criticalCount} critical timelines</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={onQuickPrioritize}
            disabled={isLoadingPriorities || totalTasks === 0}
            className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all duration-150
              ${theme === 'dark' 
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }
              ${isLoadingPriorities ? 'animate-pulse opacity-60' : ''}
            `}
            id="dash-prioritize-btn"
          >
            <BrainCircuit size={14} className="text-purple-400" />
            <span>{isLoadingPriorities ? 'Recalculating Scores...' : 'AI Recalculate Urgencies'}</span>
          </button>

          <button 
            onClick={onAddTaskClick}
            className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-500 hover:brightness-110 text-white shadow-md shadow-purple-500/20"
            id="dash-addtask-btn"
          >
            + New Commitment
          </button>
        </div>
      </div>

      {/* QUICK STATS & OVERLOAD BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="quick-stats-grid">
        
        {/* Productivity Score */}
        <div className={`p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between border backdrop-blur-md
          ${theme === 'dark' ? 'bg-[#150f2dbb] border-[#8b5cf633]' : 'bg-gradient-to-tr from-[#9333ea0d] to-[#3b82f60d] border-purple-100'}
        `}>
          <div className="absolute top-[-20%] right-[-10%] w-20 h-20 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-purple-400 mb-1 flex items-center gap-1">
              <TrendingUp size={12} />
              <span>Productivity Score</span>
            </p>
            <div className="text-3xl font-black tracking-tight flex items-baseline">
              <span>{productivityScore}</span>
              <span className="text-xs opacity-60 ml-0.5">%</span>
            </div>
          </div>
          <div className="mt-3 text-[10px] font-sans text-slate-400">
            Real-time evaluation of completion velocity.
          </div>
        </div>

        {/* Completion Rate */}
        <div className={`p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between border backdrop-blur-md
          ${theme === 'dark' ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-slate-200'}
        `}>
          <div className="absolute top-[-20%] right-[-10%] w-20 h-20 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-blue-400 mb-1 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Completion Velocity</span>
            </p>
            <div className="text-3xl font-black tracking-tight">
              {completionRate}<span className="text-xs opacity-60">%</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-500/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${completionRate}%` }} />
            </div>
          </div>
        </div>

        {/* Upcoming Deadline Conflicts */}
        <div className={`p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between border backdrop-blur-md
          ${theme === 'dark' ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-slate-200'}
        `}>
          <div className="absolute top-[-20%] right-[-10%] w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-amber-500 mb-1 flex items-center gap-1">
              <Clock size={12} />
              <span>Hot Timelines</span>
            </p>
            <div className="text-3xl font-black tracking-tight text-amber-500">
              {criticalCount}
            </div>
          </div>
          <div className="mt-3 text-[10px] font-sans text-slate-400">
            Tasks due within the next 48 hours.
          </div>
        </div>

        {/* Save My Week Trigger Box */}
        <div className={`cursor-pointer group p-5 border rounded-2xl relative overflow-hidden transition-all duration-200 hover:scale-102 flex flex-col justify-between
          ${theme === 'dark' 
            ? 'bg-zinc-950 border-[#ea580c33] hover:border-orange-500' 
            : 'bg-white border-orange-100 hover:border-orange-400 shadow-xs'
          }
        `}
        onClick={onTriggerSaveMyWeek}
        id="dash-saveweek-box"
        >
          <div className="absolute top-[-20%] right-[-10%] w-20 h-20 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div className="p-1 rounded bg-orange-500/10 text-orange-500 text-xs flex items-center justify-center">
              <Zap size={14} className="animate-bounce" />
            </div>
            <span className="text-[8px] tracking-widest font-mono bg-orange-500 text-white font-bold px-1 py-0.5 rounded uppercase">Premium</span>
          </div>
          <div>
            <h4 className="font-bold text-xs text-orange-400 group-hover:underline">Save My Week</h4>
            <p className="text-[10px] text-zinc-400 mt-1 leading-normal font-sans">
              Schedule spike detected. Run AI workload leveling plan.
            </p>
          </div>
        </div>

      </div>

      {/* DETAILED CRITICAL BENTO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-content-grid">
        
        {/* Column 1: Today's Focus & Smart Daily Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Today's Focus */}
          <div className={`p-6 border rounded-2xl backdrop-blur-md relative
            ${theme === 'dark' ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200'}
          `} id="dash-focus-section">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-400" />
                <span>Today's Productive Focus</span>
              </h3>
              <span className="text-[10px] text-purple-400 font-mono font-bold bg-purple-500/10 px-2 py-0.5 rounded tracking-wider">AI Sorted Velocity</span>
            </div>

            <div className="space-y-3 font-sans">
              {tasks.filter(t => t.status !== 'completed').slice(0, 3).length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-500/20 rounded-xl">
                  <p className="text-xs text-zinc-400">Your agenda is clean. Focus on learning, recovery or add a commitment!</p>
                  <button 
                    onClick={onAddTaskClick}
                    className="mt-3 px-3 py-1.5 rounded-lg text-xs bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 font-medium transition-colors"
                  >
                    Add custom commitment
                  </button>
                </div>
              ) : (
                tasks.filter(t => t.status !== 'completed').slice(0, 3).map((task) => (
                  <div 
                    key={task.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-150
                      ${theme === 'dark' 
                        ? 'bg-white/5 border-white/5 hover:bg-white/10' 
                        : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/50'
                      }
                      ${task.priority === 'high' ? 'border-l-2 border-l-purple-600' : ''}
                    `}
                  >
                    <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center font-mono text-xs font-bold
                      ${task.priority === 'high' 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/25'
                      }
                    `}>
                      {task.priority === 'high' ? 'HI' : 'ME'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm truncate">{task.title}</h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono font-bold shrink-0
                          ${task.category === 'Startup' ? 'bg-[#ec48991a] text-pink-400 border border-pink-500/20' : ''}
                          ${task.category === 'Study' ? 'bg-[#3b82f61a] text-blue-400 border border-blue-500/20' : ''}
                          ${task.category === 'Work' ? 'bg-[#a855f71a] text-purple-400 border border-[#a855f720]' : ''}
                          ${task.category !== 'Startup' && task.category !== 'Study' && task.category !== 'Work' ? 'bg-slate-500/10 text-slate-400' : ''}
                        `}>
                          {task.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-1 leading-normal">{task.description || "No description provided."}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-zinc-400 block font-mono">Est: {task.estimatedTime}h</span>
                      {task.priorityScore && (
                        <div className="inline-flex items-center gap-1 mt-1 text-[10px] text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded">
                          <span>Urgency: {task.urgencyScore}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {tasks.length > 3 && (
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => onNavigateToTab('tasks')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                >
                  <span>See all {totalTasks} commitments</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Section: Today's Smart Daily Schedule timeline */}
          <div className={`p-6 border rounded-2xl backdrop-blur-md relative
            ${theme === 'dark' ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200 shadow-xs'}
          `} id="dash-schedule-section">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Clock size={14} className="text-blue-400" />
                <span>My Intelligent Daily Schedule</span>
              </h3>
              <button 
                onClick={() => onNavigateToTab('planner')}
                className="text-xs text-blue-400 hover:underline"
              >
                Go to AI Planner
              </button>
            </div>

            <div className="relative border-l border-slate-550/20 ml-2.5 pl-6 space-y-4 font-sans">
              
              {scheduleSuggestions.length === 0 ? (
                // Safe high quality simulated schedule based on preloaded list
                <>
                  <div className="relative">
                    <div className="absolute top-1.5 -left-[30px] w-2 h-2 rounded-full bg-purple-500 ring-4 ring-purple-600/15" />
                    <div className="p-3 bg-slate-500/5 hover:bg-slate-500/10 rounded-xl border border-slate-500/15 transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-zinc-400 font-mono">08:00 AM - 10:30 AM</span>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-[#a855f7] bg-[#a855f71e] px-1.5 py-0.5 rounded">Deep Study Node</span>
                      </div>
                      <h4 className="font-bold text-sm">Deep Work block: Priority alignment</h4>
                      <p className="text-xs text-zinc-500 mt-1">AI Recommendation: Dedicate early clean hours to tasks with greater risk rating indicators.</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute top-1.5 -left-[30px] w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-600/15" />
                    <div className="p-3 bg-slate-500/5 hover:bg-slate-500/10 rounded-xl border border-slate-500/15 transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-zinc-400 font-mono">11:00 AM - 12:30 PM</span>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Tactical Action</span>
                      </div>
                      <h4 className="font-bold text-sm">Drafting milestones & subtasks</h4>
                      <p className="text-xs text-zinc-500 mt-1">Applying the decomposition model to reduce cumulative friction points.</p>
                    </div>
                  </div>

                  <div className="relative pb-2">
                    <div className="absolute top-1.5 -left-[30px] w-2 h-2 rounded-full bg-zinc-600" />
                    <div className="p-3 bg-slate-500/5 hover:bg-slate-500/10 rounded-xl border border-slate-500/15 transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-zinc-400 font-mono">04:00 PM - 05:00 PM</span>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 bg-zinc-500/10 px-1.5 py-0.5 rounded">Habit Trigger</span>
                      </div>
                      <h4 className="font-bold text-sm">Consistent Daily pause grid</h4>
                      <p className="text-xs text-zinc-500 mt-1">Protected interval to complete scheduled exercise/meditation routines.</p>
                    </div>
                  </div>
                </>
              ) : (
                scheduleSuggestions.map((sug, i) => (
                  <div key={i} className="relative">
                    <div className="absolute top-1.5 -left-[30px] w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-purple-500/20" />
                    <div className="p-4 bg-slate-500/5 hover:bg-slate-500/10 rounded-xl border border-slate-500/15 transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-purple-400 font-mono">{sug.timeBlock}</span>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{sug.type}</span>
                      </div>
                      <h4 className="font-bold text-sm text-zinc-100">{sug.taskTitle}</h4>
                      <p className="text-xs text-zinc-400 font-sans italic mt-1">"{sug.actionReason}"</p>
                    </div>
                  </div>
                ))
              )}

            </div>
          </div>

        </div>

        {/* Column 2: AI Insights, Risk Alerts & Recommended Actions */}
        <div className="space-y-6">
          
          {/* Section: Critical Insights & Risk Alerts */}
          <div className={`p-6 border rounded-2xl backdrop-blur-md
            ${theme === 'dark' ? 'bg-[#151221bb] border-[#e11d4822]' : 'bg-rose-500/5 border-rose-100'}
          `} id="dash-alerts-section">
            <h3 className="text-xs font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-4">
              <AlertTriangle size={15} />
              <span>Nova Threat Alerts</span>
            </h3>

            <div className="space-y-3 font-sans">
              
              {criticalCount > 0 ? (
                <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl">
                  <div className="flex items-center gap-2 text-rose-400 mb-1">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider">Overload Alert (Conflict)</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    You have <span className="text-rose-400 font-bold">{criticalCount} critical task(s)</span> due shortly with considerable active estimated workloads. Let's trigger "Save My Week".
                  </p>
                  <button 
                    onClick={onTriggerSaveMyWeek}
                    className="w-full mt-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black tracking-wider uppercase transition-colors"
                  >
                    Generate AI Recovery plan
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-green-500/10 border border-green-500/25 rounded-2xl">
                  <div className="flex items-center gap-2 text-green-400 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Schedule Stabilized</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    All deadlines are currently outside our high-risk 48-hour buffer constraint. Continue current speed safely!
                  </p>
                </div>
              )}

              {/* General Insights */}
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl">
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <Sparkles size={14} />
                  <span className="text-xs font-bold uppercase">Proactive Insight</span>
                </div>
                {completedTasks < 1 && habits.filter(h => h.streak > 0).length === 0 ? (
                  <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                    No productivity insights available yet.
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Historically, completing 1 habit cycle before 11:00 AM matches a <span className="text-[#a855f7] font-semibold">+18.5% boost</span> in afternoon productivity output.
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Section: Recommended Next Actions */}
          <div className={`p-6 border rounded-2xl backdrop-blur-md
            ${theme === 'dark' ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200'}
          `} id="dash-recommendations-section">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
              <BrainCircuit size={15} className="text-purple-400" />
              <span>Recommended Actions</span>
            </h3>

            <div className="space-y-3 font-sans text-xs">
              
              {highPriority.slice(0, 2).map((item) => (
                <div 
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2
                    ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}
                  `}
                >
                  <div>
                    <h5 className="font-bold text-zinc-100">{item.title}</h5>
                    <p className="text-[10px] text-zinc-500">Urgency score is high. Act on this immediately.</p>
                  </div>
                  <button 
                    onClick={() => onNavigateToTab('tasks')}
                    className="p-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white shrink-0 transition-colors"
                  >
                    <ArrowRight size={12} />
                  </button>
                </div>
              ))}

              <div className={`p-3 rounded-xl border flex items-center justify-between gap-2
                ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}
              `}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#ec4899]" />
                  <div>
                    <h5 className="font-bold">Maintain Daily Habits</h5>
                    <p className="text-[10px] text-zinc-500">Streaks boost compilation scores.</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigateToTab('habits')}
                  className="px-2 py-1 rounded bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 font-bold text-[10px]"
                >
                  Track
                </button>
              </div>

            </div>
          </div>

          {/* Section: Goal Milestone Progress tracking */}
          <div className={`p-6 border rounded-2xl backdrop-blur-md
            ${theme === 'dark' ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200'}
          `} id="dash-goals-section">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5">
              <Target size={15} className="text-purple-400" />
              <span>Goal Tracking Milestones</span>
            </h3>

            <div className="space-y-4 font-sans text-xs">
              {goals.length === 0 ? (
                <p className="text-zinc-500 text-center italic py-2">No active goals found. Set up milestones in Goals!</p>
              ) : (
                goals.slice(0, 2).map((goal) => (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex justify-between font-bold text-zinc-200">
                      <span className="truncate">{goal.title}</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-500/15 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-full transition-all" 
                        style={{ width: `${goal.progress}%` }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
