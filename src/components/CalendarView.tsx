import React, { useState } from "react";
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalIcon, 
  MapPin, 
  Clock, 
  Grid,
  TrendingUp,
  Target,
  Sparkles,
  CheckCircle2,
  X
} from "lucide-react";
import { Task, Goal } from "../types";

interface CalendarViewProps {
  tasks: Task[];
  goals: Goal[];
  theme: 'light' | 'dark';
}

interface CustomEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: 'meeting' | 'task' | 'goal' | 'deadline';
  category?: string;
}

export default function CalendarView({ tasks, goals, theme }: CalendarViewProps) {
  const [mode, setMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 22)); // June 22, 2026

  // Simulated meetings that are customized and elegant
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([
    { id: 'meet-1', title: 'Silicon Angels Pitch Prep Sync', date: '2026-06-23', time: '10:00 AM', type: 'meeting', category: 'Startup' },
    { id: 'meet-2', title: 'ML Stanford Mentor Evaluation', date: '2026-06-25', time: '02:00 PM', type: 'meeting', category: 'Study' },
    { id: 'meet-3', title: 'Financial Risk Node Review', date: '2026-06-22', time: '11:00 AM', type: 'meeting', category: 'Finance' },
  ]);

  // Dialog formulation
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("2026-06-22");
  const [newTime, setNewTime] = useState("09:00 AM");
  const [newType, setNewType] = useState<'meeting' | 'task' | 'goal' | 'deadline'>('meeting');

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Derive consolidated list of items on calendar
  const getEventsForDate = (dateStr: string): CustomEvent[] => {
    const list: CustomEvent[] = [];
    
    // Add custom events
    customEvents.forEach(e => {
      if (e.date === dateStr) list.push(e);
    });

    // Add tasks as tasks/deadlines
    tasks.forEach(t => {
      if (t.deadline === dateStr) {
        list.push({
          id: `task-${t.id}`,
          title: t.title,
          date: t.deadline,
          type: t.priority === 'high' ? 'deadline' : 'task',
          category: t.category
        });
      }
    });

    // Add goals targetDates as goals
    goals.forEach(g => {
      if (g.targetDate === dateStr) {
        list.push({
          id: `goal-${g.id}`,
          title: g.title,
          date: g.targetDate,
          type: 'goal',
          category: g.category
        });
      }
    });

    return list;
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    const eventObj: CustomEvent = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      date: newDate,
      time: newTime,
      type: newType,
      category: 'Work'
    };

    setCustomEvents([...customEvents, eventObj]);
    setNewTitle("");
    setIsAddingEvent(false);
  };

  // Helper arrays for populating Month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrev = () => {
    if (mode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (mode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
    }
  };

  const handleNext = () => {
    if (mode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (mode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Calendar Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight" id="cal-headline">Agenda Matrix</h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Synchronize tasks, core project milestones, and custom external meetings with the daily schedule timeline.
          </p>
        </div>

        <button 
          onClick={() => setIsAddingEvent(true)}
          className="cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-white shrink-0 shadow-lg shadow-purple-500/25 flex items-center gap-1.5"
          id="btn-add-cal-event"
        >
          <Plus size={15} />
          <span>Add Custom Node</span>
        </button>
      </div>

      {/* VIEW SELECTOR & TIME NAVIGATION */}
      <div className={`p-4 border rounded-2xl backdrop-blur-md flex flex-wrap gap-4 items-center justify-between font-sans
        ${theme === 'dark' ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200 shadow-xs'}
      `}>
        
        {/* Toggle Mode */}
        <div className="flex bg-slate-500/10 p-1 rounded-xl">
          {(['month', 'week', 'day'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setMode(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider font-mono
                ${mode === v 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }
              `}
              id={`cal-toggle-${v}`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Calendar Nav */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrev}
            className={`p-2 rounded-xl border transition-all hover:bg-slate-500/10
              ${theme === 'dark' ? 'border-white/5 text-zinc-400' : 'border-slate-200 text-slate-700 bg-white'}
            `}
          >
            <ChevronLeft size={16} />
          </button>
          
          <h3 className="text-sm font-black tracking-tight font-mono w-40 text-center">
            {mode === 'month' && `${monthNames[month]} ${year}`}
            {mode === 'week' && `Week of ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
            {mode === 'day' && `${currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`}
          </h3>

          <button 
            onClick={handleNext}
            className={`p-2 rounded-xl border transition-all hover:bg-slate-500/10
              ${theme === 'dark' ? 'border-white/5 text-zinc-400' : 'border-slate-200 text-slate-700 bg-white'}
            `}
          >
            <ChevronRight size={16} />
          </button>
        </div>

      </div>

      {/* EVENT ADD DIALOG */}
      {isAddingEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`p-6 border rounded-3xl w-full max-w-md shadow-2xl relative
            ${theme === 'dark' ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-250 text-slate-900'}
          `}>
            <button 
              onClick={() => setIsAddingEvent(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-white/10 text-zinc-400"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black tracking-tight mb-4">Plan Calendar Item</h3>
            
            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-zinc-400 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. VC Demo Pitch or Code Review"
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none
                    ${theme === 'dark' ? 'bg-black/30 border-white/10 focus:border-purple-500' : 'bg-slate-50 border-slate-300'}
                  `}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-purple-500
                      ${theme === 'dark' ? 'bg-black/30 border-white/10 text-zinc-300' : 'bg-slate-50 border-slate-300'}
                    `}
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Time Block</label>
                  <input 
                    type="text" 
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none
                      ${theme === 'dark' ? 'bg-black/30 border-white/10 text-zinc-300' : 'bg-slate-50 border-slate-300'}
                    `}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Item Categorization</label>
                <select 
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none
                    ${theme === 'dark' ? 'bg-black/50 border-white/10 text-zinc-300' : 'bg-white border-slate-200'}
                  `}
                >
                  <option value="meeting">External Meeting Sync</option>
                  <option value="task">Operational Task Node</option>
                  <option value="goal">Quarterly Goal Target</option>
                  <option value="deadline">Critical Deadline Alert</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddingEvent(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/5 text-zinc-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:brightness-110 text-white font-bold"
                >
                  Commit Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MATRIX VIEWS */}
      <div className={`p-6 border rounded-3xl backdrop-blur-md
        ${theme === 'dark' ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200 shadow-md'}
      `} id="calendar-matrix-area">
        
        {/* MONTH GRID VIEW */}
        {mode === 'month' && (
          <div className="space-y-4">
            <div className="grid grid-cols-7 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 pb-2 border-b border-white/5 md:grid hidden">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            <div className="md:grid grid-cols-7 gap-1.5 min-h-[380px] hidden">
              {/* Padding for first day */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2 border border-slate-500/5 opacity-20 rounded-xl" />
              ))}

              {/* Days population */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const events = getEventsForDate(dateStr);
                const isToday = dayNum === 22 && month === 5 && year === 2026; // June 22, 2026 is today!

                return (
                  <div 
                    key={dayNum}
                    className={`p-3 border rounded-xl flex flex-col justify-between transition-all group font-mono text-xs hover:bg-[#a855f7]/5 min-h-[75px]
                      ${theme === 'dark' ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/50'}
                      ${isToday ? 'bg-gradient-to-tr from-purple-600/10 to-blue-500/10 border-purple-500/60 ring-1 ring-purple-500/30' : ''}
                    `}
                  >
                    <span className={`font-bold self-end text-[10px] px-1.5 py-0.5 rounded
                      ${isToday ? 'bg-purple-600 text-white font-black' : 'text-zinc-400 group-hover:text-zinc-200'}
                    `}>
                      {dayNum}
                    </span>

                    {/* Render visual indicators */}
                    <div className="space-y-1.5 mt-2 font-sans grow overflow-hidden">
                      {events.slice(0, 3).map((e) => (
                        <div 
                          key={e.id}
                          className={`px-1.5 py-0.5 rounded-[5px] text-[8px] font-bold truncate leading-tight border flex items-center gap-1
                            ${e.type === 'meeting' ? 'bg-[#3b82f61a] border-blue-500/20 text-blue-400' : ''}
                            ${e.type === 'deadline' ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' : ''}
                            ${e.type === 'task' ? 'bg-[#a855f71a] border-[#a855f730] text-purple-400' : ''}
                            ${e.type === 'goal' ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400' : ''}
                          `}
                          title={`${e.title} ${e.time ? `(${e.time})` : ''}`}
                        >
                          <div className={`w-1 h-1 rounded-full shrink-0
                            ${e.type === 'meeting' ? 'bg-blue-500' : ''}
                            ${e.type === 'deadline' ? 'bg-red-500' : ''}
                            ${e.type === 'task' ? 'bg-purple-500' : ''}
                          `} />
                          <span className="truncate">{e.title}</span>
                        </div>
                      ))}
                      {events.length > 3 && (
                        <span className="text-[7px] text-zinc-500 block font-mono">+{events.length - 3} more items</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Month Agenda List View */}
            <div className="block md:hidden space-y-4">
              <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10 text-xs text-purple-300 flex items-center gap-2">
                <Sparkles size={13} className="shrink-0 text-purple-400" />
                <span>Mobile Agenda view active for {monthNames[month]} {year}</span>
              </div>
              <div className="space-y-3">
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const events = getEventsForDate(dateStr);
                  if (events.length === 0) return null;

                  return (
                    <div key={dayNum} className={`p-4 border rounded-2xl flex flex-col gap-2 
                      ${theme === 'dark' ? 'bg-zinc-900/60 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}
                    `}>
                      <div className={`flex justify-between items-center border-b pb-1.5
                        ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}
                      `}>
                        <span className="font-mono font-bold text-xs text-purple-500">
                          {monthNames[month]} {dayNum}, {year}
                        </span>
                        <span className="text-[10px] bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full font-bold">
                          {events.length} item(s)
                        </span>
                      </div>
                      <div className="space-y-2 mt-1">
                        {events.map((e) => (
                          <div key={e.id} className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-2 h-2 rounded-full shrink-0
                                ${e.type === 'meeting' ? 'bg-blue-500' : ''}
                                ${e.type === 'deadline' ? 'bg-rose-500' : ''}
                                ${e.type === 'task' ? 'bg-purple-500' : ''}
                                ${e.type === 'goal' ? 'bg-emerald-500' : ''}
                              `} />
                              <span className={`font-semibold truncate ${theme === 'dark' ? 'text-zinc-200' : 'text-slate-800'}`}>{e.title}</span>
                            </div>
                            {e.time && <span className="text-[10px] font-mono text-zinc-500 shrink-0">{e.time}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* WEEK VIEW */}
        {mode === 'week' && (
          <div className="space-y-6 font-sans">
            <div className="md:grid grid-cols-7 gap-4 hidden">
              {Array.from({ length: 7 }).map((_, i) => {
                // Find day offsets from current date, treating currents as Monday
                const dayOffset = new Date(currentDate.getTime() + (i - currentDate.getDay()) * 24 * 60 * 60 * 1000);
                const isToday = dayOffset.getDate() === 22 && dayOffset.getMonth() === 5 && dayOffset.getFullYear() === 2026;
                const formattedDate = `${dayOffset.getFullYear()}-${String(dayOffset.getMonth() + 1).padStart(2, '0')}-${String(dayOffset.getDate()).padStart(2, '0')}`;
                const events = getEventsForDate(formattedDate);

                return (
                  <div 
                    key={i}
                    className={`p-4 border rounded-2xl min-h-[300px] flex flex-col justify-between transition-all
                      ${theme === 'dark' ? 'border-white/5 bg-white/2' : 'border-slate-205 bg-slate-50/50'}
                      ${isToday ? 'bg-purple-600/10 border-purple-500/40' : ''}
                    `}
                  >
                    <div>
                      <div className="text-center pb-2 border-b border-white/5 mb-3 font-mono">
                        <span className="text-[10px] text-zinc-500 block uppercase font-bold">
                          {dayOffset.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className={`text-base font-black inline-block mt-0.5 px-2 py-0.5 rounded
                          ${isToday ? 'bg-purple-600 text-white' : 'text-zinc-205'}
                        `}>
                          {dayOffset.getDate()}
                        </span>
                      </div>

                      <div className="space-y-2 mt-2">
                        {events.length === 0 ? (
                           <p className="text-[9px] text-zinc-500 text-center italic py-4">No events</p>
                        ) : (
                          events.map((e) => (
                            <div 
                              key={e.id}
                              className={`p-2 rounded-xl border text-[9px] leading-tight space-y-1
                                ${e.type === 'meeting' ? 'bg-[#3b82f60a] border-blue-500/15 text-blue-400' : ''}
                                ${e.type === 'deadline' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : ''}
                                ${e.type === 'task' ? 'bg-purple-500/5 border-purple-500/15 text-purple-400' : ''}
                                ${e.type === 'goal' ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400' : ''}
                              `}
                            >
                              <div className="font-bold truncate">{e.title}</div>
                              {e.time && (
                                <div className="text-[8px] text-zinc-500 font-mono italic">
                                  {e.time}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <span className="text-[8px] font-mono text-zinc-500 text-center uppercase tracking-wider block mt-4 border-t border-white/5 pt-2">
                      {events.length} Event(s)
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Week Agenda List View */}
            <div className="block md:hidden space-y-4">
              <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10 text-xs text-purple-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles size={13} className="shrink-0 text-purple-400" />
                  <span>Interactive Week Agenda</span>
                </span>
                <span className="font-mono text-[10px] font-bold text-zinc-400">Tap date to inspect</span>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, i) => {
                  const dayOffset = new Date(currentDate.getTime() + (i - currentDate.getDay()) * 24 * 60 * 60 * 1000);
                  const isToday = dayOffset.getDate() === 22 && dayOffset.getMonth() === 5 && dayOffset.getFullYear() === 2026;
                  const formattedDate = `${dayOffset.getFullYear()}-${String(dayOffset.getMonth() + 1).padStart(2, '0')}-${String(dayOffset.getDate()).padStart(2, '0')}`;
                  const events = getEventsForDate(formattedDate);

                  return (
                    <div 
                      key={i}
                      onClick={() => {
                        // Switch directly to Day View of clicked node
                        setCurrentDate(dayOffset);
                        setMode('day');
                      }}
                      className={`p-4 border rounded-2xl cursor-pointer transition-all flex flex-col gap-2.5
                        ${theme === 'dark' ? 'border-white/5 bg-zinc-900/40 hover:bg-zinc-900/80 text-white' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'}
                        ${isToday ? 'bg-purple-600/10 border-purple-500/40 ring-1 ring-purple-500/20' : ''}
                      `}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 font-mono">
                          <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-purple-400' : 'text-zinc-500'}`}>
                            {dayOffset.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className={`text-xs font-black px-1.5 py-0.5 rounded ${isToday ? 'bg-purple-600 text-white' : 'text-zinc-500 bg-slate-200/50'}`}>
                            {dayOffset.getDate()}
                          </span>
                        </div>
                        <span className="text-[10px] text-purple-400 font-mono">
                          {events.length} item(s) • View
                        </span>
                      </div>

                      {events.length > 0 && (
                        <div className={`space-y-1.5 mt-1 border-t pt-2
                          ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}
                        `}>
                          {events.map((e) => (
                            <div key={e.id} className="flex items-center justify-between text-xs font-sans">
                              <span className={`font-semibold ${theme === 'dark' ? 'text-zinc-350' : 'text-slate-700'}`}>{e.title}</span>
                              {e.time && <span className="text-[10px] font-mono text-zinc-500 shrink-0">{e.time}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* DAY VIEW */}
        {mode === 'day' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            
            {/* List of active items */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 pb-2 border-b border-white/5">
                Core timeline nodes scheduling
              </h4>

              <div className="space-y-3">
                {getEventsForDate(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`).length === 0 ? (
                  <div className="p-12 text-center text-zinc-500 text-xs italic border border-dashed border-white/10 rounded-2xl bg-white/2">
                    No timeline items scheduled for this date. Go and record meeting specs!
                  </div>
                ) : (
                  getEventsForDate(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`).map((e) => (
                    <div 
                      key={e.id}
                      className={`flex items-center gap-4 p-4 border rounded-xl backdrop-blur-md
                        ${theme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-slate-50 border-slate-200'}
                      `}
                    >
                      <div className={`p-2.5 rounded-lg text-xs font-black font-mono uppercase text-center w-16
                        ${e.type === 'meeting' ? 'bg-[#3b82f61a] text-blue-400' : ''}
                        ${e.type === 'deadline' ? 'bg-rose-500/10 text-rose-400' : ''}
                        ${e.type === 'task' ? 'bg-[#a855f71a] text-purple-400' : ''}
                      `}>
                        {e.type}
                      </div>

                      <div className="grow min-w-0">
                        <h4 className="font-bold text-sm tracking-tight truncate">{e.title}</h4>
                        <div className="flex gap-4 text-[10px] text-zinc-400 font-mono mt-1">
                          {e.time && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              <span>{e.time}</span>
                            </span>
                          )}
                          {e.category && (
                            <span className="flex items-center gap-1 uppercase tracking-wider text-purple-400">
                              <span>•</span>
                              <span>{e.category}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick action info panel for current date */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between
              ${theme === 'dark' ? 'bg-zinc-950 border-white/5' : 'bg-slate-100 border-slate-200'}
            `}>
              <div>
                <CalIcon className="text-purple-400 mb-3" size={20} />
                <h5 className="font-bold text-sm">Focus Zone Buffer</h5>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Plan meetings on Tuesday or Thursday to protect contiguous coding sprints on Mondays, Wednesdays, and Fridays.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 mt-4 space-y-3 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-zinc-500 uppercase">Target date:</span>
                  <span>{currentDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 uppercase">Day index:</span>
                  <span>{currentDate.toLocaleDateString('en-US', { weekday: 'long' })}</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
