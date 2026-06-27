import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Target, 
  Flame, 
  BrainCircuit, 
  Zap, 
  History, 
  Settings, 
  LogOut, 
  User,
  Sun, 
  Moon,
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: { name: string; email: string } | null;
  profilePhoto?: string;
  onSignOut: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({
  currentView,
  setCurrentView,
  theme,
  toggleTheme,
  user,
  profilePhoto,
  onSignOut,
  sidebarOpen,
  setSidebarOpen
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'habits', label: 'Habit Tracker', icon: Flame },
    { id: 'planner', label: 'AI Planner', icon: BrainCircuit },
    { id: 'save-week', label: 'Save My Week', icon: Zap, badge: '⚡ AI' },
    { id: 'history', label: 'History & Logs', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 border-r transition-all duration-300 z-50 flex flex-col
          ${theme === 'dark' 
            ? 'bg-[#0f0b1e]/90 border-slate-800 text-slate-200 backdrop-blur-lg' 
            : 'bg-white/90 border-slate-200 text-slate-700 backdrop-blur-lg'
          }
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white font-black shadow-lg shadow-purple-500/30">
              N
            </div>
            <span className="font-sans font-bold tracking-tight text-lg bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Nova AI
            </span>
          </div>
          
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-500/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Badge */}
        {user && (
          <div className="p-4 mx-4 my-3 rounded-xl border border-dashed flex items-center gap-3 bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-slate-500/20">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 overflow-hidden shrink-0 border border-indigo-500/10">
              <img 
                src={profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=4f46e5`} 
                alt="User Badge Profile" 
                className="w-full h-full object-cover"
                id="sidebar-user-avatar-element"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-xs truncate">{user.name}</h4>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-3 overflow-y-auto space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false); // Close on mobile navigation
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-purple-600/15 to-blue-500/15 text-purple-400 border border-purple-500/20 shadow-xs' 
                    : 'hover:bg-slate-500/5 border border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    size={18} 
                    className={`transition-transform duration-150 group-hover:scale-105
                      ${isActive ? 'text-purple-400' : 'text-slate-400'}
                    `} 
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase bg-gradient-to-r from-purple-500 to-blue-500 text-white font-mono shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions Footer */}
        <div className="p-4 border-t border-inherit space-y-2">
          {/* Sign Out Button */}
          {user && (
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-150"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
