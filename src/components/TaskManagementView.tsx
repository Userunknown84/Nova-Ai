import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Eye, 
  X,
  Edit2, 
  Play, 
  Grid,
  Check
} from "lucide-react";
import { Task } from "../types";

interface TaskManagementViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onEditTask: (id: string, updated: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onRunBreakdown: (task: Task) => void;
  theme: 'light' | 'dark';
}

export default function TaskManagementView({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onRunBreakdown,
  theme
}: TaskManagementViewProps) {
  // Filters & Search state
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form values
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<'Work' | 'Study' | 'Personal' | 'Health' | 'Finance' | 'Startup'>('Study');
  const [estimatedTime, setEstimatedTime] = useState(2);

  const categories = ['Work', 'Study', 'Personal', 'Health', 'Finance', 'Startup'];

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setPriority('medium');
    setCategory('Study');
    setEstimatedTime(2);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    onAddTask({
      title,
      description,
      deadline,
      priority,
      category,
      estimatedTime: Number(estimatedTime) || 1,
      status: 'todo'
    });
    
    resetForm();
    setIsAdding(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !title.trim() || !deadline) return;

    onEditTask(editingTask.id, {
      title,
      description,
      deadline,
      priority,
      category,
      estimatedTime: Number(estimatedTime) || 1
    });

    setEditingTask(null);
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setDeadline(task.deadline);
    setPriority(task.priority);
    setCategory(task.category);
    setEstimatedTime(task.estimatedTime);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === 'All' || t.category === catFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Completed' && t.status === 'completed') ||
                          (statusFilter === 'Active' && t.status !== 'completed');

    return matchesSearch && matchesCat && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Visual Workspace Frame */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <span>Workspace Commitments</span>
            <span className="text-xs font-mono font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">
              Active: {tasks.filter(t => t.status !== 'completed').length}
            </span>
          </h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Sort, prioritize, and initiate AI roadmaps for your core academic, development and startup files.
          </p>
        </div>

        <button 
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-500 hover:brightness-110 text-white shadow-lg shadow-purple-600/25 shrink-0 flex items-center gap-1.5"
          id="btn-add-commitment"
        >
          <Plus size={15} />
          <span>Add Commitment</span>
        </button>
      </div>

      {/* FILTER BAR PANEL */}
      <div className={`p-4 border rounded-2xl backdrop-blur-md flex flex-wrap gap-3 items-center font-sans
        ${theme === 'dark' ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200 shadow-xs'}
      `} id="filter-bar">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search objectives, papers, metrics..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:ring-1 focus:outline-none focus:ring-purple-500/50
              ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-slate-200'}
            `}
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-1">
          <select 
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500
              ${theme === 'dark' ? 'bg-zinc-950 border-white/5 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'}
            `}
            id="cat-filter-select"
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500
              ${theme === 'dark' ? 'bg-zinc-950 border-white/5 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'}
            `}
            id="priority-filter-select"
          >
            <option value="All">All Priorities</option>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500
              ${theme === 'dark' ? 'bg-zinc-950 border-white/5 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'}
            `}
            id="status-filter-select"
          >
            <option value="All">All Stages</option>
            <option value="Active">Active only</option>
            <option value="Completed">Completed only</option>
          </select>
        </div>

      </div>

      {/* CREATE DIALOG MODAL */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`p-6 border rounded-3xl w-full max-w-lg shadow-2xl relative
            ${theme === 'dark' ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-250 text-slate-900'}
          `}>
            <button 
              onClick={() => setIsAdding(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-white/10 text-zinc-400"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black tracking-tight mb-4">Add Premium Commitment</h3>
            
            <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-zinc-400 mb-1">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build Machine Learning Project"
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none
                    ${theme === 'dark' ? 'bg-black/30 border-white/10 focus:border-purple-500' : 'bg-slate-50 border-slate-300'}
                  `}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize structural constraints..."
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none h-20
                    ${theme === 'dark' ? 'bg-black/30 border-white/10 focus:border-purple-500' : 'bg-slate-50 border-slate-300'}
                  `}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none
                      ${theme === 'dark' ? 'bg-black/50 border-white/10 text-zinc-300' : 'bg-white border-slate-200'}
                    `}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none
                      ${theme === 'dark' ? 'bg-black/50 border-white/10 text-zinc-300' : 'bg-white border-slate-200'}
                    `}
                  >
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Estimated Hours</label>
                  <input 
                    type="number" 
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(Number(e.target.value) || 1)}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none
                      ${theme === 'dark' ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-300'}
                    `}
                    min={0.5}
                    step={0.5}
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Deadline Date</label>
                  <input 
                    type="date" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none
                      ${theme === 'dark' ? 'bg-black/30 border-white/10 text-zinc-300' : 'bg-slate-50 border-slate-300'}
                    `}
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2.5 rounded-xl border text-zinc-400 border-white/5 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:brightness-110 text-white font-bold"
                >
                  Allocate Nodes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDITING DIALOG MODAL */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`p-6 border rounded-3xl w-full max-w-lg shadow-2xl relative
            ${theme === 'dark' ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-250 text-slate-900'}
          `}>
            <button 
              onClick={() => setEditingTask(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-white/10 text-zinc-400"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black tracking-tight mb-4 text-[#a855f7]">Edit Technical Item</h3>
            
            <form onSubmit={handleUpdate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-zinc-400 mb-1">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Learn React"
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none
                    ${theme === 'dark' ? 'bg-black/30 border-white/10 focus:border-purple-500' : 'bg-slate-50 border-slate-300'}
                  `}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed logs..."
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none h-20
                    ${theme === 'dark' ? 'bg-black/30 border-white/10 focus:border-purple-500' : 'bg-slate-50 border-slate-300'}
                  `}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none
                      ${theme === 'dark' ? 'bg-black/50 border-white/10 text-zinc-300' : 'bg-white border-slate-200'}
                    `}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none
                      ${theme === 'dark' ? 'bg-black/50 border-white/10 text-zinc-300' : 'bg-white border-slate-200'}
                    `}
                  >
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Estimated Hours</label>
                  <input 
                    type="number" 
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(Number(e.target.value) || 1)}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none
                      ${theme === 'dark' ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-300'}
                    `}
                    min={0.5}
                    step={0.5}
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Deadline Date</label>
                  <input 
                    type="date" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none
                      ${theme === 'dark' ? 'bg-black/30 border-white/10 text-zinc-300' : 'bg-slate-50 border-slate-300'}
                    `}
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2.5 rounded-xl border text-zinc-400 border-white/5 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Confirm Schema Mod
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMMITMENTS GRID */}
      {filteredTasks.length === 0 ? (
        <div className="p-16 border border-dashed border-slate-500/15 rounded-3xl text-center backdrop-blur-md">
          <Grid className="mx-auto text-zinc-500 mb-3" size={32} />
          <p className="text-zinc-400 text-xs">No commitments matches these filter parameters.</p>
          <button 
            onClick={() => { setSearch(""); setCatFilter("All"); setPriorityFilter("All"); setStatusFilter("All"); }}
            className="text-purple-400 hover:underline text-xs mt-2"
          >
            Reset filter variables
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="tasks-cards-grid">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const progressStatus = task.status === 'inprogress';
            
            // Check risk warnings
            const diff = new Date(task.deadline).getTime() - Date.now();
            const daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
            const isCritical = !isCompleted && daysLeft <= 2;

            return (
              <div 
                key={task.id}
                className={`p-6 border rounded-2xl backdrop-blur-md relative flex flex-col justify-between group transition-all duration-200 hover:scale-101
                  ${theme === 'dark' 
                    ? 'bg-zinc-900/60 border-white/5 hover:border-purple-500/40' 
                    : 'bg-white border-slate-200 hover:border-blue-500/30 hover:shadow-md'
                  }
                  ${isCompleted ? 'opacity-70 contrast-75' : ''}
                `}
                id={`task-unit-${task.id}`}
              >
                <div>
                  {/* Card Header metadata */}
                  <div className="flex justify-between items-start gap-2 mb-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono font-bold
                      ${task.category === 'Startup' ? 'bg-[#pink]/10 text-pink-400' : ''}
                      ${task.category === 'Study' ? 'bg-[#blue]/15 text-blue-400' : ''}
                      ${task.category === 'Work' ? 'bg-[#purple]/15 text-purple-400' : ''}
                      ${task.category === 'Finance' ? 'bg-[#green]/15 text-green-400' : ''}
                      ${task.category === 'Personal' ? 'bg-slate-500/10 text-slate-400' : ''}
                    `}>
                      {task.category}
                    </span>

                    <div className="flex gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono
                        ${task.priority === 'high' ? 'bg-rose-500/10 text-rose-400' : ''}
                        ${task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : ''}
                        ${task.priority === 'low' ? 'bg-slate-500/10 text-slate-400' : ''}
                      `}>
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  {/* Title & info */}
                  <h4 className={`font-bold text-sm tracking-tight mb-2 ${isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                    {task.title}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-normal mb-4 font-sans line-clamp-3">
                    {task.description || "No specific logging details declared."}
                  </p>

                  {/* Risk analysis & scores */}
                  {!isCompleted && task.priorityScore !== undefined && (
                    <div className="p-3 bg-slate-500/5 rounded-xl border border-white/5 space-y-1 mb-4 font-mono text-[9px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Urgency Score:</span>
                        <span className="text-amber-400 font-bold">{task.urgencyScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Importance:</span>
                        <span className="text-blue-400 font-bold">{task.importanceScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Cumulative Risk:</span>
                        <span className={`font-bold ${task.riskScore && task.riskScore > 75 ? 'text-rose-500' : 'text-zinc-300'}`}>
                          {task.riskScore}%
                        </span>
                      </div>
                      {task.aiRiskAnalysis && (
                        <p className="text-[#a855f7] italic mt-1 leading-normal text-[8px] font-sans">
                          "{task.aiRiskAnalysis}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Date & metrics footnotes */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-500 font-sans border-t border-white/5 pt-3 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{task.estimatedTime} hours</span>
                    </span>
                    <span className={`flex items-center gap-1 ${isCritical ? 'text-rose-400' : ''}`}>
                      {isCritical && <AlertTriangle size={12} className="animate-pulse" />}
                      <span>Due: {task.deadline}</span>
                    </span>
                  </div>
                </div>

                {/* Operations bar */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  
                  {/* Edit/Delete */}
                  <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEditing(task)}
                      className="p-1.5 rounded-lg hover:bg-white/5 hover:text-[#a855f7]"
                      title="Edit objective"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button 
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 rounded-lg hover:bg-white/5 hover:text-rose-500"
                      title="Delete Node"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* AI & Completion Actions */}
                  <div className="flex items-center gap-1.5">
                    {!isCompleted && (
                      <button 
                        onClick={() => onRunBreakdown(task)}
                        className="px-2 py-1 bg-[#a855f71e] text-purple-400 hover:bg-[#a855f72e] rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                        title="Decompose Task into Milestone Roadmap"
                      >
                        <Play size={9} />
                        <span>AI Decouple</span>
                      </button>
                    )}

                    <button 
                      onClick={() => {
                        const nextStatus = isCompleted ? 'todo' : 'completed';
                        onEditTask(task.id, { status: nextStatus });
                      }}
                      className={`p-1.5 rounded-xl border flex items-center justify-center transition-all duration-150
                        ${isCompleted 
                          ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                          : 'border-slate-550/20 text-zinc-500 hover:text-green-500 hover:border-green-500/30'
                        }
                      `}
                      title={isCompleted ? "Mark incomplete" : "Toggle complete"}
                    >
                      {isCompleted ? <Check size={14} /> : <CheckCircle2 size={14} />}
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
