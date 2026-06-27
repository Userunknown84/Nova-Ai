import React from "react";
import { X, BookOpen, AlertTriangle, HelpCircle, ShieldCheck, FileText, Code2, Sparkles, Terminal } from "lucide-react";

export type FooterDocTab = "documentation" | "faq" | "privacy" | "terms";

interface FooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: FooterDocTab;
  theme: "light" | "dark";
}

export default function FooterModal({ isOpen, onClose, initialTab, theme }: FooterModalProps) {
  const [activeTab, setActiveTab] = React.useState<FooterDocTab>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const tabs = [
    { id: "documentation" as const, label: "System Documentation", icon: BookOpen, accent: "text-purple-400" },
    { id: "faq" as const, label: "Frequently Asked Questions", icon: HelpCircle, accent: "text-amber-400" },
    { id: "privacy" as const, label: "Privacy Protocol", icon: ShieldCheck, accent: "text-emerald-400" },
    { id: "terms" as const, label: "Terms of Service", icon: FileText, accent: "text-blue-400" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10" id="footer-resource-modal">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-5xl h-[85vh] md:h-[75vh] flex flex-col md:flex-row rounded-3xl overflow-hidden border shadow-2xl transition-all animate-in fade-in zoom-in duration-200
          ${theme === "dark" 
            ? "bg-[#0c081e]/95 border-white/5 text-zinc-100" 
            : "bg-white border-slate-200 text-slate-800"
          }
        `}
      >
        {/* Close Button Top-Right */}
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 z-10 p-2 rounded-xl transition-colors
            ${theme === "dark" 
              ? "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10" 
              : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }
          `}
          id="close-modal-btn"
        >
          <X size={16} />
        </button>

        {/* Left Sidebar Navigation */}
        <div 
          className={`w-full md:w-64 p-5 flex flex-col gap-4 shrink-0 border-b md:border-b-0 md:border-r
            ${theme === "dark" ? "border-white/5 bg-black/20" : "border-slate-100 bg-slate-50/50"}
          `}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-black">
              N
            </div>
            <span className="font-black text-xs uppercase tracking-wider">Nova Resources</span>
          </div>

          <p className="text-[10px] text-zinc-500 leading-normal hidden md:block">
            Explore developer specifications, user guidelines, privacy frameworks, and terms governing our neural scheduling system.
          </p>

          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-[11px] font-bold transition-all shrink-0 cursor-pointer w-full
                    ${isActive
                      ? theme === "dark"
                        ? "bg-purple-600/15 border border-purple-500/30 text-purple-400"
                        : "bg-purple-50 border border-purple-200 text-purple-950"
                      : "border border-transparent text-zinc-400 hover:text-zinc-200"
                    }
                  `}
                >
                  <TabIcon size={14} className={isActive ? tab.accent : "text-zinc-500"} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="hidden md:flex flex-col gap-1.5 mt-auto p-3.5 rounded-xl border border-white/5 bg-white/1">
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#a855f7] font-extrabold">
              <Terminal size={10} />
              <span>SYSTEM ONLINE</span>
            </div>
            <span className="text-[8px] text-zinc-500 font-mono">v1.1.2 • Firestore Sync</span>
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-black/5" id="footer-resource-content">
          {activeTab === "documentation" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-white/5 pb-4">
                <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                  <BookOpen size={16} />
                  <span className="text-[10px] uppercase font-mono tracking-wider">Specs & Overview</span>
                </div>
                <h3 className="text-base font-black">System Architecture & Heuristics Guide</h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Welcome to Nova, the ultimate predictive system designed to prevent task overload and structure your concentration.
                </p>
              </div>

              <div className="space-y-4 text-[11px] leading-relaxed text-zinc-300 font-sans">
                {/* Section 1 */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-zinc-200 flex items-center gap-1.5 border-b border-white/5 pb-1">
                    <span className="text-[#a855f7]">01.</span> Predict-Prioritize-Complete Cycle
                  </h4>
                  <p>
                    Unlike standard checklist apps, Nova utilizes an analytical cycle styled around **constraint satisfaction**. Rather than merely listing items, you define concrete **estimated duration coefficients** (Estimated Hours) and hard **deadlines**.
                  </p>
                  <div className="p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 flex items-start gap-2.5 my-2">
                    <Sparkles className="text-purple-400 shrink-0 mt-0.5" size={14} />
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      <strong>AI Overload Warning Indicator:</strong> If two or more tasks have overlapping hours requiring more than 8 actual hours of focus within a 24-hour period, Nova generates conflict diagnostics.
                    </p>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-zinc-200 flex items-center gap-1.5 border-b border-white/5 pb-1">
                    <span className="text-[#a855f7]">02.</span> Focus Breakdown AI Actions
                  </h4>
                  <p>
                    Ambiguous tasks are the primary source of procrastination. By highlighting a goal or high-hours task, you can command Nova to decompose elements into single task registries.
                  </p>
                </div>

                {/* Section 3 */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-zinc-200 flex items-center gap-1.5 border-b border-white/5 pb-1">
                    <span className="text-[#a855f7]">03.</span> Circadian Telemetry & Sync Blocks
                  </h4>
                  <p>
                    Our dynamic notification core automatically scans firestore tasks and dispatches high-fidelity warning emails at three critical alarm thresholds:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                    <li><strong>24-Hour Buffer:</strong> Preventive, high-level scheduling awareness alert.</li>
                    <li><strong>12-Hour Buffer:</strong> Tactical realignment and pacing buffer.</li>
                    <li><strong>1-Hour Deadline:</strong> Critical action requirement reminder.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "faq" && (() => {
            const faqs: { q: string; a: React.ReactNode; isBonus?: boolean }[] = [
              {
                q: "1. What is Nova AI?",
                a: "Nova AI is an AI-powered productivity companion that helps students, professionals, and entrepreneurs prioritize tasks, generate smart schedules, predict deadline risks, and complete work before deadlines are missed."
              },
              {
                q: "2. How is Nova AI different from a traditional to-do app?",
                a: "Traditional to-do apps only store tasks and send reminders. Nova AI analyzes your workload, predicts risks, recommends the best next action, creates recovery plans, and helps you make better decisions using AI."
              },
              {
                q: "3. How does the AI prioritize my tasks?",
                a: (
                  <div className="space-y-1.5 font-sans">
                    <p>Nova AI considers multiple factors such as:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Deadline urgency</li>
                      <li>Task importance</li>
                      <li>Estimated completion time</li>
                      <li>Current workload</li>
                      <li>Goal priority</li>
                    </ul>
                    <p className="mt-1">It then recommends the optimal order to complete your tasks.</p>
                  </div>
                )
              },
              {
                q: "4. What is the \"Save My Week\" feature?",
                a: "Save My Week is an AI-powered recovery planner that detects overloaded schedules, identifies high-risk tasks, and automatically generates an optimized weekly plan to help you meet your deadlines."
              },
              {
                q: "5. Can Nova AI create a schedule automatically?",
                a: "Yes. Simply enter your tasks and available time, and Nova AI will generate a personalized daily or weekly schedule based on priorities and deadlines."
              },
              {
                q: "6. Does Nova AI support voice commands?",
                a: "Yes. You can use Nova Voice to add tasks, ask productivity questions, generate schedules, and manage your workflow using natural speech."
              },
              {
                q: "7. Can I sign in with Google?",
                a: (
                  <div className="space-y-1.5 font-sans">
                    <p>Yes. Nova AI supports both:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Google Sign-In</li>
                      <li>Email & Password authentication</li>
                    </ul>
                    <p className="mt-1">Both methods securely store your profile and productivity data.</p>
                  </div>
                )
              },
              {
                q: "8. Will my tasks and history be saved?",
                a: "Yes. Your tasks, goals, habits, AI conversations, schedules, and productivity history are securely stored in your account and restored whenever you sign in."
              },
              {
                q: "9. Does Nova AI send deadline notifications?",
                a: (
                  <div className="space-y-1.5 font-sans">
                    <p>Yes. Nova AI can send:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Task due alerts</li>
                      <li>High-risk deadline warnings</li>
                      <li>Weekly productivity reports</li>
                      <li>AI-generated recovery suggestions</li>
                    </ul>
                    <p className="mt-1 font-sans">Notifications can be received in-app and via email (if enabled).</p>
                  </div>
                )
              },
              {
                q: "10. Is my data secure?",
                a: "Yes. User authentication is handled securely, and personal productivity data is stored separately for each user. Passwords are never stored in plain text."
              },
              {
                q: "11. Can I use Nova AI on mobile devices?",
                a: "Yes. Nova AI is fully responsive and works seamlessly on desktops, tablets, and smartphones."
              },
              {
                q: "12. Can I try Nova AI without creating an account?",
                a: "Yes. Click Preview AI Demo to explore Nova AI with a temporary guest session and experience its AI features before signing up."
              },
              {
                q: "13. How does AI help me make better decisions?",
                a: "Nova AI doesn't just remind you about tasks. It analyzes your workload, predicts deadline risks, recommends the best next action, creates optimized schedules, and provides personalized productivity insights to help you complete work more effectively."
              }
            ];

            return (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                    <HelpCircle size={16} />
                    <span className="text-[10px] uppercase font-mono tracking-wider">FAQ Core</span>
                  </div>
                  <h3 className="text-base font-black">Frequently Asked Questions</h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Get quick answers to common questions about Nova AI's functionality, features, security, and account settings.
                  </p>
                </div>

                <div className="space-y-4">
                  {faqs.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-2xl border font-sans relative overflow-hidden transition-all duration-300
                        ${item.isBonus 
                          ? theme === 'dark'
                            ? 'bg-purple-500/10 border-purple-500/30 shadow-md shadow-purple-500/5'
                            : 'bg-purple-50 border-purple-200 shadow-xs'
                          : theme === 'dark'
                            ? 'border-white/5 bg-white/1 hover:bg-white/2 hover:border-white/10'
                            : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/50'
                        }
                      `}
                    >
                      {item.isBonus && (
                        <div className="flex items-center gap-1 mb-2 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 font-bold text-[8px] tracking-wide uppercase font-mono w-fit border border-purple-500/30">
                          <span>💡</span>
                          <span>Bonus FAQ (Great for Judges)</span>
                        </div>
                      )}
                      <h4 className={`font-extrabold text-[11px] mb-1.5 ${theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'}`}>
                        {item.q}
                      </h4>
                      <div className={`text-[10px] leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}`}>
                        {item.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {activeTab === "privacy" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-white/5 pb-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] uppercase font-mono tracking-wider">Security & Privacy</span>
                </div>
                <h3 className="text-base font-black">Data Protection & Privacy Policy</h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Last Updated: June 2026 • Nova Secure Network Encryption Standard
                </p>
              </div>

              <div className="space-y-4 text-[11px] leading-relaxed text-zinc-300 font-sans">
                <p>
                  Your privacy is paramount. This statement describes what credentials we collect, how they are protected inside Cloud Firestore, and how authentication telemetry is handled.
                </p>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-zinc-200">1. Data Storage and Retention</h4>
                  <p>
                    All registered usernames, email parameters, goals, habits, and tasks generated under your active session are written directly to your isolated, user-owned subcollections within our secure Google Cloud Firestore cluster.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-zinc-200">2. OAuth Consent and Google Frameworks</h4>
                  <p>
                    We protect and secure auth credential scopes. Any connected services (such as active Google AI Studio integrations, Gmail vectors, or calendar synchronization states) are handled solely through secure modern token auth nodes.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-zinc-200">3. Artificial Intelligence Telemetry</h4>
                  <p>
                    Task descriptions, goals, and workloads sent to our AI Coach models for synthesis, breakdown, or analysis are passed client-to-server utilizing official, end-to-end sandbox channels. No user data is cached or recycled for secondary base training pipelines.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "terms" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-white/5 pb-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold mb-1">
                  <FileText size={16} />
                  <span className="text-[10px] uppercase font-mono tracking-wider">Legal Framework</span>
                </div>
                <h3 className="text-base font-black">Terms of Service</h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Nova Service Terms and Predictive Autonomy Disclaimer
                </p>
              </div>

              <div className="space-y-4 text-[11px] leading-relaxed text-zinc-300 font-sans">
                <p>
                  By authenticating or interacting with Nova AI, you consent to compile and save data in accordance with these conditions.
                </p>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-zinc-200">1. Proper System Usage</h4>
                  <p>
                    You agree to utilize Nova solely for personal scheduling alignment, concentration tracking, and habit reinforcement. Simulated automated emails dispatched inside the Settings playground must only be used in an authorized, legal sandbox context.
                  </p>
                </div>

                <div className="space-y-2 flex gap-3 p-3 rounded-xl border border-red-500/10 bg-red-500/5">
                  <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={15} />
                  <div>
                    <h5 className="font-bold text-zinc-200 leading-tight">AI Predictive Autonomy & Liability</h5>
                    <p className="text-[10px] text-zinc-400 leading-normal mt-0.5">
                      Nova AI provides task risk indices, scheduler heuristics, and coach analyses based purely on analytical parameters. All final actions, milestone modifications, or work pacing adjustments are made strictly under the user's ultimate responsibility.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-zinc-200">2. Account Synchronization and Cloud Access</h4>
                  <p>
                    We reserve the right to suspend accounts displaying abusive automated script logs, continuous empty stress-testing loops, or queries violating Google security boundaries.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
