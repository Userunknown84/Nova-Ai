import { useState } from "react";
import { 
  Flame, 
  CheckCircle2, 
  Award, 
  Calendar, 
  Code, 
  Dumbbell, 
  BookOpen, 
  Sparkles, 
  Check, 
  HelpCircle 
} from "lucide-react";
import { Habit } from "../types";

interface HabitTrackerViewProps {
  habits: Habit[];
  onToggleHabitDay: (habitId: string, dayStr: string) => void;
  onBootstrapHabits?: () => void;
  theme: 'light' | 'dark';
}

export default function HabitTrackerView({ habits, onToggleHabitDay, onBootstrapHabits, theme }: HabitTrackerViewProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  if (habits.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-black tracking-tight" id="habit-headline">Consistency Nodes</h2>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Maintain daily pacing structures. Watch Nova compute Streaks and log Consistency points across your execution intervals.
            </p>
          </div>
        </div>

        <div className="p-16 border border-dashed border-slate-500/15 rounded-3xl text-center backdrop-blur-md max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[300px]">
          <Flame size={48} className="text-purple-500 mb-4 animate-pulse" />
          <h3 className="text-sm font-bold text-zinc-200">No habits tracked yet.</h3>
          <p className="text-xs text-zinc-400 mt-2 max-w-sm leading-relaxed">
            Create or bootstrap core habit templates to start monitoring streaks, consistency percentages, and daily pacing nodes.
          </p>
          <button
            onClick={() => onBootstrapHabits?.()}
            className="mt-6 cursor-pointer px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md shadow-purple-500/20"
          >
            Bootstrap Core Habits
          </button>
        </div>
      </div>
    );
  }

  // Generate date strings for the last 14 days to display in the mini grid!
  const getPast14Days = () => {
    const list: { dayStr: string; label: string; weekday: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(2026, 5, 22 - i); // June 22, 2026 - i days
      const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      list.push({
        dayStr,
        label: String(d.getDate()),
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    return list;
  };

  const datesList = getPast14Days();

  // Find premium micro icon mapping
  const getHabitIcon = (name: string) => {
    if (name.toLowerCase() === 'coding') return Code;
    if (name.toLowerCase() === 'exercise') return Dumbbell;
    if (name.toLowerCase() === 'reading') return BookOpen;
    return Sparkles; // Meditation
  };

  return (
    <div className="space-y-6">
      
      {/* Tracker Headers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight" id="habit-headline">Consistency Nodes</h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Maintain daily pacing structures. Watch Nova compute Streaks and log Consistency points across your execution intervals.
          </p>
        </div>
      </div>

      {/* OVERALL STREAK LEADERBOARD GRAPH */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="habit-summaries-list">
        {habits.map((h) => {
          const Icon = getHabitIcon(h.name);
          const isSelected = selectedHabitId === h.id || (selectedHabitId === null && habits[0].id === h.id);
          
          if (selectedHabitId === null && habits[0].id === h.id) {
            // safe auto-select first on load
            setTimeout(() => setSelectedHabitId(h.id), 0);
          }

          return (
            <div 
              key={h.id}
              onClick={() => setSelectedHabitId(h.id)}
              className={`p-5 rounded-2xl border backdrop-blur-md cursor-pointer transition-all duration-150 relative overflow-hidden
                ${isSelected 
                  ? 'bg-[#1b1239] border-purple-500/40 scale-102 shadow-md shadow-purple-600/10' 
                  : 'bg-zinc-900/50 border-white/5 hover:bg-zinc-900 hover:border-white/10'
                }
              `}
              id={`habit-card-${h.id}`}
            >
              <div className="absolute top-[-20%] right-[-10%] w-16 h-16 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl border
                  ${isSelected ? 'bg-purple-500/25 border-purple-500/35 text-purple-400' : 'bg-slate-500/10 border-white/5 text-zinc-400'}
                `}>
                  <Icon size={16} />
                </div>
                
                <div className="flex items-center gap-1 text-orange-400 font-bold font-mono text-xs">
                  <Flame size={14} className="fill-current" />
                  <span>{h.streak}d streak</span>
                </div>
              </div>

              <h4 className="font-bold text-sm text-zinc-100">{h.name}</h4>
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">Consist index: {h.consistencyScore}%</p>
            </div>
          );
        })}
      </div>

      {/* DETAILED PACING SQUARES MATRIX */}
      {(() => {
        const activeHabit = habits.find(h => h.id === selectedHabitId) || habits[0];
        if (!activeHabit) return null;

        return (
          <div className={`p-6 border rounded-3xl backdrop-blur-md relative font-sans
            ${theme === 'dark' ? 'bg-[#0f0a20] border-white/5 shadow-2xl' : 'bg-white border-slate-205'}
          `} id={`habit-detail-grid-${activeHabit.id}`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4 mb-6">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-purple-400 flex items-center gap-1">
                  <Award size={12} />
                  <span>Interactive Consistency Matrix</span>
                </span>
                <h3 className="text-base font-black tracking-tight text-white mt-1">Strengthen Your "{activeHabit.name}" Habit Pattern</h3>
              </div>
              <p className="text-xs text-zinc-400 text-right leading-normal font-sans max-w-xs shrink-0 bg-white/2 p-2 border border-white/5 rounded-xl">
                💡 <span className="italic">Click individual date tiles below to retroactively log or toggle daily activities. Streaks recalculate instantly!</span>
              </p>
            </div>

            {/* Past 14 days grid */}
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-4">
              {datesList.map((d) => {
                const isCompleted = activeHabit.completedDays.includes(d.dayStr);
                const isToday = d.dayStr === '2026-06-22';

                return (
                  <button 
                    key={d.dayStr}
                    onClick={() => {
                      onToggleHabitDay(activeHabit.id, d.dayStr);
                    }}
                    className={`cursor-pointer p-4 border rounded-2xl flex flex-col items-center justify-between min-h-[95px] relative transition-all duration-150
                      ${isCompleted 
                        ? 'bg-gradient-to-tr from-[#7c3aed33] to-[#4f46e533] border-purple-500/40 text-[#a855f7]' 
                        : 'bg-white/2 border-white/5 text-zinc-500 hover:bg-white/5 hover:border-white/10'
                      }
                      ${isToday ? 'ring-2 ring-purple-500/55' : ''}
                    `}
                    id={`habit-tile-${activeHabit.id}-${d.dayStr}`}
                  >
                    <span className="text-[9px] uppercase font-mono tracking-wider font-bold block mb-2">{d.weekday}</span>
                    
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200
                      ${isCompleted 
                        ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30' 
                        : 'border-white/5 text-zinc-600'
                      }
                    `}>
                      {isCompleted ? <Check size={16} /> : <span className="text-xs font-mono font-bold">{d.label}</span>}
                    </div>

                    <div className="text-[9px] font-mono mt-2 font-bold uppercase transition-colors shrink-0">
                      {isCompleted ? 'Log Node' : isToday ? 'Active Node' : 'Idle'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footnote stats */}
            <div className="mt-8 border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-zinc-500 gap-2">
              <span>Habit Tracker Sandbox • Verified Telemetries</span>
              <div className="flex gap-4">
                <span>Streak points compiled: <strong className="text-orange-400 font-bold">{activeHabit.streak} consecutive completions</strong></span>
                <span>Calculated efficiency: <strong className="text-purple-400 font-bold">{activeHabit.consistencyScore}% consistency</strong></span>
              </div>
            </div>

          </div>
        );
      })()}

    </div>
  );
}
