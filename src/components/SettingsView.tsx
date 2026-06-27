import React, { useState, useEffect } from "react";
import { 
  Settings, 
  User, 
  Sparkles, 
  Check,
  Bell, 
  HelpCircle, 
  ShieldAlert, 
  Sun, 
  Moon,
  Sparkle,
  CheckCircle2,
  X,
  Palette,
  Mail,
  Inbox,
  Clock,
  AlertTriangle,
  Send,
  Eye,
  Trash2,
  RefreshCw,
  FileCheck2,
  AlertCircle
} from "lucide-react";
import ThemeDropdown from "./ThemeDropdown";
import { UserProfile, UserPreferences, SentEmail } from "../types";
import ProfileSettings from "./ProfileSettings";

interface SettingsViewProps {
  user: { name: string; email: string } | null;
  userProfile: UserProfile | null;
  onUpdateUser: (updated: { name: string; email: string }) => void;
  onUpdateUserPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  onUpdateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  theme: 'light' | 'dark';
  themeFamily: 'default' | 'purple' | 'cyberpunk' | 'emerald' | 'sunset';
  onPresetChange: (preset: 'default' | 'purple' | 'cyberpunk' | 'emerald' | 'sunset') => void;
  toggleTheme: () => void;
  
  // Simulated emails state and actions
  emails: SentEmail[];
  onTriggerSimulation: (type: 'due_alert' | 'high_risk' | 'missed' | 'weekly' | 'goal_update') => Promise<void>;
  onClearEmails: () => Promise<void>;
  onDeleteEmail: (id: string) => Promise<void>;
  isDemoMode?: boolean;
}

export default function SettingsView({
  user,
  userProfile,
  onUpdateUser,
  onUpdateUserPreferences,
  onUpdateUserProfile,
  theme,
  themeFamily,
  onPresetChange,
  toggleTheme,
  emails,
  onTriggerSimulation,
  onClearEmails,
  onDeleteEmail,
  isDemoMode = false
}: SettingsViewProps) {
  const [userName, setUserName] = useState(user?.name || "Sarah Jenkins");
  const [userEmail, setUserEmail] = useState(user?.email || "sarah@gmail.com");
  const [coachStyle, setCoachStyle] = useState<'strict' | 'guide' | 'analyst'>('guide');
  const [showNotification, setShowNotification] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Notification Preferences States
  const prefs = userProfile?.preferences || {};
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dueTaskAlerts, setDueTaskAlerts] = useState(true);
  const [highRiskAlerts, setHighRiskAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [goalUpdates, setGoalUpdates] = useState(true);

  // Sync state if userProfile loaded/changed
  useEffect(() => {
    if (userProfile) {
      setUserName(userProfile.fullName || user?.name || "");
      setUserEmail(userProfile.email || user?.email || "");
      if (userProfile.preferences) {
        const uPrefs = userProfile.preferences;
        setEmailNotifications(uPrefs.emailNotifications !== false);
        setDueTaskAlerts(uPrefs.dueTaskAlerts !== false);
        setHighRiskAlerts(uPrefs.highRiskAlerts !== false);
        setWeeklyReports(uPrefs.weeklyReports !== false);
        setGoalUpdates(uPrefs.goalUpdates !== false);
      }
    }
  }, [userProfile, user]);

  const [viewingEmail, setViewingEmail] = useState<SentEmail | null>(null);
  const [isSimulating, setIsSimulating] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save preferences to Firestore
    await onUpdateUserPreferences({
      emailNotifications,
      dueTaskAlerts,
      highRiskAlerts,
      weeklyReports,
      goalUpdates
    });

    setSaveMessage("Nova notification coordinates and alarm parameters updated.");
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleSimulateBtn = async (type: 'due_alert' | 'high_risk' | 'missed' | 'weekly' | 'goal_update', label: string) => {
    setIsSimulating(type);
    try {
      await onTriggerSimulation(type);
      setSaveMessage(`Simulated email dispatched: "${label}". Check the Mock Mailbox below!`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-xs">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
          <span>Nova Environment Variables</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Calibrate email alert thresholds, toggle task risk scanners, and trigger real-time simulated AI reports.
        </p>
      </div>

      {showNotification && (
        <div className="p-3 rounded-2xl border border-green-500/35 bg-green-500/10 text-green-400 font-bold flex items-center gap-2 animate-pulse" id="settings-save-success">
          <CheckCircle2 size={15} />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main bento settings forms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="settings-grid">
        
        {/* Left column: Profile card & Notification settings form */}
        <div className="md:col-span-2 space-y-6">
          <ProfileSettings 
            userProfile={userProfile} 
            onUpdateUserProfile={onUpdateUserProfile} 
            theme={theme} 
          />

          <form onSubmit={handleSubmit} className={`p-6 border rounded-3xl backdrop-blur-md space-y-6
            ${theme === 'dark' ? 'bg-[#0f0a20cb] border-white/5 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}
          `} id="settings-notifications-form">

            {/* Notification settings checklist */}
            <div className="space-y-4 font-sans">
              <div>
                <h4 className="font-bold text-zinc-300 flex items-center gap-1.5 text-sm">
                  <Bell size={15} className="text-purple-400" />
                  <span>Email Alarm Configurations</span>
                </h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Review and customize which automated alerts dispatch to your active registration directory below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Global email trigger */}
                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-150
                  ${emailNotifications 
                    ? 'border-purple-500/35 bg-purple-500/4' 
                    : theme === 'dark' ? 'border-white/5 bg-white/1' : 'border-slate-200 bg-slate-50'}
                `}>
                  <div className="space-y-0.5 pr-2">
                    <span className="font-bold text-zinc-200 block">Deliver Notifications</span>
                    <span className="text-[9px] text-zinc-500 leading-none">Global switch for simulated email routing.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer shrink-0"
                  />
                </label>

                {/* 2. Due alerts */}
                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-150
                  ${dueTaskAlerts 
                    ? 'border-purple-500/35 bg-purple-500/4' 
                    : theme === 'dark' ? 'border-white/5 bg-white/1' : 'border-slate-200 bg-slate-50'}
                  ${!emailNotifications ? 'opacity-50 cursor-not-allowed' : ''}
                `}>
                  <div className="space-y-0.5 pr-2">
                    <span className="font-bold text-zinc-200 block">Due Task Alerts</span>
                    <span className="text-[9px] text-zinc-500 leading-none">Dispatches warning logs at 24h, 12h, and 1h thresholds.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={dueTaskAlerts}
                    disabled={!emailNotifications}
                    onChange={(e) => setDueTaskAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer shrink-0"
                  />
                </label>

                {/* 3. High Risk AI warnings */}
                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-150
                  ${highRiskAlerts 
                    ? 'border-purple-500/35 bg-purple-500/4' 
                    : theme === 'dark' ? 'border-white/5 bg-white/1' : 'border-slate-200 bg-slate-50'}
                  ${!emailNotifications ? 'opacity-50 cursor-not-allowed' : ''}
                `}>
                  <div className="space-y-0.5 pr-2">
                    <span className="font-bold text-zinc-200 block">AI Overload Warnings</span>
                    <span className="text-[9px] text-zinc-500 leading-none">AI analyzes task metrics and sends deep recovery maps.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={highRiskAlerts}
                    disabled={!emailNotifications}
                    onChange={(e) => setHighRiskAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer shrink-0"
                  />
                </label>

                {/* 4. Weekly reports */}
                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-150
                  ${weeklyReports 
                    ? 'border-purple-500/35 bg-purple-500/4' 
                    : theme === 'dark' ? 'border-white/5 bg-white/1' : 'border-slate-200 bg-slate-50'}
                  ${!emailNotifications ? 'opacity-50 cursor-not-allowed' : ''}
                `}>
                  <div className="space-y-0.5 pr-2">
                    <span className="font-bold text-zinc-200 block">Weekly Digest Digests</span>
                    <span className="text-[9px] text-zinc-500 leading-none">Compiles completions rate, missed items, and next steps.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={weeklyReports}
                    disabled={!emailNotifications}
                    onChange={(e) => setWeeklyReports(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer shrink-0"
                  />
                </label>

                {/* 5. Goal updates */}
                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-150
                  ${goalUpdates 
                    ? 'border-purple-500/35 bg-purple-500/4' 
                    : theme === 'dark' ? 'border-white/5 bg-white/1' : 'border-slate-200 bg-slate-50'}
                  ${!emailNotifications ? 'opacity-50 cursor-not-allowed' : ''}
                `}>
                  <div className="space-y-0.5 pr-2">
                    <span className="font-bold text-zinc-200 block">Goal Success Logs</span>
                    <span className="text-[9px] text-zinc-500 leading-none">Sends milestones confirmations and next daily routines.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={goalUpdates}
                    disabled={!emailNotifications}
                    onChange={(e) => setGoalUpdates(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer shrink-0"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold hover:brightness-110 shadow-lg shadow-purple-600/25 text-xs transition-transform hover:scale-101 active:scale-99 cursor-pointer"
              >
                Save Notification Parameters
              </button>
            </div>

          </form>

          {/* SIMULATION TRICK TESTING ENGINE CARD */}
          <div className={`p-6 border rounded-3xl backdrop-blur-md space-y-4
            ${theme === 'dark' ? 'bg-[#0f0a20cb] border-white/5 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}
          `}>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                <span>Alert Sandbox Simulation Core</span>
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1">
                Immediately trigger or dispatch personalized alerts directly inside this session to visualize and audit your notifications.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                disabled={isSimulating !== null || !emailNotifications}
                onClick={() => handleSimulateBtn('due_alert', 'Due in 1-24h warning')}
                className="p-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors text-left flex flex-col justify-between h-20 group relative disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Clock size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-bold text-[10px] text-zinc-200 block">Due Alert</span>
                  <span className="text-[8px] text-zinc-500">⏳ Check 1h/12h/24h</span>
                </div>
              </button>

              <button
                type="button"
                disabled={isSimulating !== null || !emailNotifications || !highRiskAlerts}
                onClick={() => handleSimulateBtn('high_risk', 'AI high-risk warning analysis')}
                className="p-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors text-left flex flex-col justify-between h-20 group disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShieldAlert size={16} className="text-red-400 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-bold text-[10px] text-zinc-200 block">AI High Risk</span>
                  <span className="text-[8px] text-zinc-500">🚨 Risk Score analysis</span>
                </div>
              </button>

              <button
                type="button"
                disabled={isSimulating !== null || !emailNotifications}
                onClick={() => handleSimulateBtn('missed', 'Overdue missed deadline recovery')}
                className="p-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors text-left flex flex-col justify-between h-20 group disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <AlertTriangle size={16} className="text-rose-500 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-bold text-[10px] text-zinc-200 block">Overdue Recover</span>
                  <span className="text-[8px] text-zinc-500">⚠️ Post-deadline plan</span>
                </div>
              </button>

              <button
                type="button"
                disabled={isSimulating !== null || !emailNotifications || !weeklyReports}
                onClick={() => handleSimulateBtn('weekly', 'Weekly performance digest report')}
                className="p-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors text-left flex flex-col justify-between h-20 group disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileCheck2 size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-bold text-[10px] text-zinc-200 block">Weekly Digest</span>
                  <span className="text-[8px] text-zinc-500">📊 Stats & recommendations</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Coach Style Preferences & Layout theme presets */}
        <div className="space-y-6">
          
          {/* Theme Preset toggle bento box */}
          <div className={`p-6 border rounded-3xl backdrop-blur-md space-y-5
            ${theme === 'dark' ? 'bg-[#0f0a20cb] border-white/5 shadow-md' : 'bg-white border-slate-200 shadow-sm'}
          `} id="theme-settings-widget">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Palette size={16} className="text-purple-400" />
                <span>Workspace Aesthetics</span>
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
                Customize colors, layout modes, and futuristic neon accents.
              </p>
            </div>

            {/* LIGHT / DARK MODE SEGMENT */}
            <div className="space-y-2 pt-3 border-t border-white/5">
              <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Interface Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (theme !== 'light') toggleTheme();
                  }}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all duration-155 flex items-center justify-center gap-2 cursor-pointer active:scale-95
                    ${theme === 'light'
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/15'
                      : 'bg-zinc-950 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }
                  `}
                >
                  <span>🌞 Light Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (theme !== 'dark') toggleTheme();
                  }}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all duration-155 flex items-center justify-center gap-2 cursor-pointer active:scale-95
                    ${theme === 'dark'
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/15'
                      : 'bg-slate-50 border-slate-200 text-slate-750 hover:bg-slate-100'
                    }
                  `}
                >
                  <span>🌙 Dark Mode</span>
                </button>
              </div>
            </div>

            {/* THEME SELECTOR GRID */}
            <div className="space-y-2.5 pt-3 border-t border-white/5">
              <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Color Palette Theme</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'default', label: 'Default Theme', desc: 'Classic Blue accents, professional SaaS styling', icon: '🔹' },
                  { id: 'purple', label: 'Purple Theme', desc: 'Premium lavender & violet presets', icon: '🔮' },
                  { id: 'cyberpunk', label: 'Cyberpunk Theme', desc: 'Neon lighting, holographic feel, futuristic glow', icon: '⚡' },
                  { id: 'emerald', label: 'Emerald Theme', desc: 'Green accents, clean productivity aesthetic', icon: '❇️' },
                  { id: 'sunset', label: 'Sunset Theme', desc: 'Orange accents, warm gradients & sunset vibes', icon: '🌅' }
                ].map((preset) => {
                  const isActive = themeFamily === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onPresetChange(preset.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer active:scale-99
                        ${isActive
                          ? theme === 'dark'
                            ? 'bg-purple-600/15 border-purple-500/50 text-white font-bold'
                            : 'bg-purple-50 border-purple-200 text-purple-950 font-bold'
                          : theme === 'dark'
                            ? 'bg-zinc-950 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm leading-none">{preset.icon}</span>
                        <div className="flex flex-col text-left">
                          <span className={`text-[10px] font-bold leading-normal ${theme === 'dark' ? 'text-zinc-100' : 'text-slate-800'}`}>{preset.label}</span>
                          <span className="text-[8px] text-zinc-500 leading-none font-normal mt-0.5">{preset.desc}</span>
                        </div>
                      </div>
                      {isActive && (
                        <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[8px] shrink-0 font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Coach personality preference */}
          <div className={`p-6 border rounded-3xl backdrop-blur-md space-y-4
            ${theme === 'dark' ? 'bg-[#0f0a20cb] border-white/5 shadow-md' : 'bg-white border-slate-200 shadow-sm'}
          `} id="coach-style-widget">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Sparkles className="text-purple-400" size={16} />
              <span>AI Coach Personality</span>
            </h3>

            <div className="space-y-3">
              {[
                { id: 'strict', title: 'High-Focus Strict Coach', desc: 'Warns aggressively about overlaps, provides blunt analysis, and pushes for high streak consistency.' },
                { id: 'guide', title: 'Mindful Collaborative Guide', desc: 'Encourages balanced workload leveling, prompts physical exercise pauses and mental pacing buffer intervals.' },
                { id: 'analyst', title: 'Quantitative Data Analyst', desc: 'Outputs detailed weekly metrics, statistical delay trends, and charts indices logs.' }
              ].map((style) => {
                const active = coachStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setCoachStyle(style.id as any)}
                    className={`w-full p-3 border rounded-xl text-left transition-all font-sans
                      ${active 
                        ? 'bg-[#1b1239] border-purple-500/40 text-purple-350 scale-102 shadow-xs border-dashed' 
                        : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:border-white/10'
                      }
                    `}
                  >
                    <div className="font-bold text-[10px] text-zinc-100 flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#a855f7]' : 'bg-zinc-600'}`} />
                      <span>{style.title}</span>
                    </div>
                    <p className="text-[9px] text-zinc-500 mt-1 leading-normal">
                      {style.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* 📬 DELIVERED SIMULATED NOTIFICATIONS & MAILBOX */}
      <div className={`p-6 border rounded-3xl backdrop-blur-md space-y-4
        ${theme === 'dark' ? 'bg-[#0f0a20cb] border-white/5 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}
      `} id="mock-mail-center">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-3 gap-3">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Inbox size={16} className="text-purple-400" />
              <span>Delivered Notifications Folder & Archive</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">
              Live secure sandbox logs showing HTML emails delivered to <strong>{userEmail}</strong>.
            </p>
          </div>
          {emails.length > 0 && (
            <button
              onClick={onClearEmails}
              className="px-3 py-1.5 rounded-xl border border-white/5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold transition-all flex items-center gap-1.5 font-sans cursor-pointer active:scale-95"
            >
              <Trash2 size={13} />
              <span>Wipe Mail Archives</span>
            </button>
          )}
        </div>

        {emails.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-white/5 bg-white/1 max-w-lg mx-auto space-y-3">
            <span className="text-3xl block">📬</span>
            <h4 className="font-bold text-zinc-300">Mailbox is Currently Empty</h4>
            <p className="text-[10px] text-zinc-500 max-w-sm mx-auto leading-normal px-4">
              Your registered address triggers no active alerts yet. Use the simulation buttons above to instantly dispatch sample alerts, or shorten some task deadlines to see automatic checkers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Email list box (cols-4) */}
            <div className="col-span-1 lg:col-span-5 border border-white/5 rounded-2xl bg-black/20 overflow-y-auto max-h-[350px] p-2 space-y-1.5 custom-scrollbar">
              {emails.map((email) => {
                const isSelected = viewingEmail?.id === email.id;
                let badgeColor = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                if (email.type === "high_risk") badgeColor = "bg-red-500/10 text-red-400 border-red-500/20";
                if (email.type === "missed_deadline") badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                if (email.type === "weekly_report") badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

                return (
                  <div
                    key={email.id}
                    onClick={() => setViewingEmail(email)}
                    className={`p-3 rounded-xl border cursor-pointer text-left transition-all relative flex flex-col justify-between select-none
                      ${isSelected 
                        ? 'border-purple-500 bg-purple-500/5' 
                        : 'border-white/5 bg-white/1 hover:bg-white/3'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border shrink-0 ${badgeColor}`}>
                          {email.type.replace("_", " ")}
                        </span>
                        <span className="text-[7px] text-zinc-500 font-mono">
                          {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (viewingEmail?.id === email.id) setViewingEmail(null);
                          onDeleteEmail(email.id);
                        }}
                        className="text-zinc-600 hover:text-red-400 p-0.5 rounded transition-colors shrink-0"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>

                    <h4 className={`text-[10px] font-extrabold truncate ${isSelected ? 'text-purple-400' : 'text-zinc-200'}`}>
                      {email.subject}
                    </h4>

                    <span className="text-[8px] text-zinc-500 mt-1 font-sans truncate">
                      To: {email.recipient}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Email preview pane (cols-7) */}
            <div className="col-span-1 lg:col-span-7 border border-white/5 rounded-2xl bg-[#080512] flex flex-col overflow-hidden min-h-[350px]">
              {viewingEmail ? (
                <div className="flex-1 flex flex-col">
                  {/* Top bar */}
                  <div className="p-3 border-b border-white/5 bg-white/2 flex justify-between items-center text-[10px] text-zinc-400">
                    <div className="space-y-0.5">
                      <div className="font-bold text-zinc-200">{viewingEmail.subject}</div>
                      <div className="text-[8px] text-zinc-500">
                        From: <span className="text-purple-400 font-bold">nova-alert@analytics.nova.ai</span> • To: {viewingEmail.recipient}
                      </div>
                    </div>
                    <span className="text-[8px] text-zinc-500 font-mono shrink-0">
                      {new Date(viewingEmail.sentAt).toLocaleDateString()} {new Date(viewingEmail.sentAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* HTML Content Render */}
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#020106]">
                    <div 
                      dangerouslySetInnerHTML={{ __html: viewingEmail.body }} 
                      className="origin-top scale-[0.95] max-w-full mx-auto"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2">
                  <span className="text-3xl text-zinc-600">✉️</span>
                  <p className="font-bold text-zinc-450 text-[11px]">No Message Selected</p>
                  <p className="text-[9px] text-zinc-600 max-w-xs leading-normal">
                    Select any delivered email from the list on the left to display its full, interactive HTML layout.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
