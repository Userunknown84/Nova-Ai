import React, { useState } from "react";
import { ArrowRight, Sparkles, Shield, Clock, BrainCircuit, CheckCircle2, Star, Github, Linkedin, Twitter, Mail } from "lucide-react";
import FooterModal, { FooterDocTab } from "./FooterModal";

interface LandingPageProps {
  onGetStarted: () => void;
  onTryDemo: () => void;
  theme: 'light' | 'dark';
}

export default function LandingPage({ onGetStarted, onTryDemo, theme }: LandingPageProps) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FooterDocTab>("documentation");

  const openTab = (tab: FooterDocTab) => {
    setActiveTab(tab);
    setModalOpen(true);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes("@")) {
      setNewsletterSuccess(true);
      setTimeout(() => {
        setNewsletterSuccess(false);
        setNewsletterEmail("");
      }, 4000);
    }
  };

  const features = [
    {
      icon: BrainCircuit,
      title: "AI Chief of Staff Engine",
      description: "Not a to-do list. An automated cognitive assistant that sequences work, calculates priority scores, and protects focus grids."
    },
    {
      icon: Shield,
      title: "Sliver-thin Deadline Protection",
      description: "Nova analyzes real-time task velocities and warns you of critical overlaps up to 72 hours before they crash."
    },
    {
      icon: Clock,
      title: "Save My Week (Premium Option)",
      description: "When workloads spike, trigger Save My Week to de-escalate lower priority nodes and formulate custom recovery roadmaps."
    },
    {
      icon: Sparkles,
      title: "Microscope Goal Breakdowns",
      description: "State any objective (e.g., 'Learn React' or 'Launch Startup') and watch the compiler auto-carve milestones."
    }
  ];

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${theme === 'dark' ? 'bg-[#06030e] text-zinc-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Visual Mesh Backgrounds */}
      <div className="absolute top-0 left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[130px] rounded-full pointing-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 blur-[140px] rounded-full pointing-events-none" />
      <div className="absolute bottom-[0%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointing-events-none" />

      {/* Outer Banner Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-purple-600/35">
            N
          </div>
          <span className="font-bold tracking-tight text-xl bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
            Nova AI
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onGetStarted}
            className="cursor-pointer px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white shadow-lg shadow-purple-600/25 shrink-0 transition-transform hover:scale-102"
            id="nav-getstarted-btn"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 pt-20 pb-28 text-center max-w-4xl mx-auto z-10" id="hero-section">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-8 border border-purple-500/30 bg-purple-500/10 text-purple-300 animate-pulse">
          <Sparkles size={13} />
          <span>Intelligent Productivity Compiler</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Your AI Productivity Companion That{" "}
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent font-black block mt-2">
            Prevents Missed Deadlines
          </span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
          Plan smarter, prioritize better, and complete tasks before deadlines become emergencies. Experience cognitive workload leveling designed for peak performance.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onGetStarted}
            className="cursor-pointer w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-purple-600 via-[#d946ef] to-blue-500 hover:brightness-110 text-white shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 group"
            id="hero-get-started-btn"
          >
            <span>Activate Nova AI</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={onTryDemo}
            className={`cursor-pointer w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold border transition-all flex items-center justify-center gap-2
              ${theme === 'dark' ? 'bg-white/5 border-white/10 text-zinc-100 hover:bg-white/10' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'}
            `}
            id="hero-demo-btn"
          >
            <span>Preview AI Demo</span>
          </button>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative z-10" id="features-section">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Forged for Extreme Mental Clarity
          </h2>
          <p className="text-zinc-500 font-sans max-w-xl mx-auto text-sm">
            Nova replaces standard static checklists with dynamic risk orchestration and calendar alignment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className={`p-6 border rounded-2xl backdrop-blur-md hover:translate-y-[-4px] transition-all duration-300
                  ${theme === 'dark' 
                    ? 'bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-white/10' 
                    : 'bg-white border-slate-200 hover:border-blue-500/40 hover:shadow-lg'
                  }
                `}
                id={`feature-card-${idx}`}
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-6 py-16 relative z-10" id="how-it-works-section">
        <div className={`p-8 sm:p-12 border rounded-3xl backdrop-blur-lg relative overflow-hidden
          ${theme === 'dark' ? 'bg-[#0f0b1e]/60 border-white/10' : 'bg-white border-slate-200 shadow-xl'}
        `}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/5 blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[#d946ef]">High-Throughput Paradigm</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 mb-6">How Nova Governs Your Focus Grid</h2>
            
            <div className="space-y-8 font-sans">
              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">Deep Context Ingestion</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">Input your deadlines, goals, work categories, and voice instructions. Nova indexes these dynamically.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">Multi-Metric Prioritization</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">The AI maps each task based on computed Urgency, Importance, and deadline velocity indices, outputting a live Priority Score.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">Continuous Risk Warning & Recovery</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">If schedules clash, Nova alerts you. Deploy "Save My Week" or converse with the voice assistant to synthesize a direct mitigation plan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM HIGH-END FOOTER */}
      <footer 
        className={`border-t relative z-10 transition-colors duration-300 backdrop-blur-md
          ${theme === 'dark' 
            ? 'bg-[#04020a]/90 border-white/5 text-zinc-300' 
            : 'bg-slate-100/90 border-slate-200 text-slate-800'
          }
        `}
        id="premium-saas-footer"
      >
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 md:gap-8 lg:gap-12 mb-16">
            
            {/* BRAND SECTION */}
            <div className="space-y-5 lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-xl flex items-center justify-center text-white font-black shadow-md">
                  N
                </div>
                <div>
                  <span className={`font-extrabold tracking-tight text-lg transition-colors
                    ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                  `}>
                    Nova AI
                  </span>
                  <span className="block text-[8px] uppercase tracking-widest text-indigo-500 font-mono leading-none font-bold">
                    PREDICT • PRIORITIZE • COMPLETE
                  </span>
                </div>
              </div>

              <p className={`text-[11px] font-mono font-bold uppercase tracking-wider
                ${theme === 'dark' ? 'text-purple-400' : 'text-indigo-600'}
              `}>
                "Predict. Prioritize. Complete."
              </p>

              <p className={`text-xs leading-relaxed max-w-sm
                ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}
              `}>
                An AI-powered productivity companion that helps students, professionals, and entrepreneurs avoid missed deadlines, make smarter decisions, and complete important work effectively.
              </p>

              {/* SOCIAL LINKS */}
              <div className="flex items-center gap-3 pt-2">
                {[
                  { icon: Github, href: "https://github.com", label: "GitHub Coordinates Link" },
                  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn Connection Link" },
                  { icon: Twitter, href: "https://twitter.com", label: "X Platform Stream Link" },
                  { icon: Mail, href: "mailto:support@nova.ai", label: "Direct Support Coordinate Email" }
                ].map((social, sIdx) => {
                  const SocialIcon = social.icon;
                  return (
                    <a 
                      key={sIdx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 hover:scale-[1.08] cursor-pointer
                        ${theme === 'dark' 
                          ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:border-purple-500/40 hover:bg-purple-950/20' 
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-950 hover:border-blue-500/30 hover:bg-blue-50/50 shadow-xs'
                        }
                      `}
                    >
                      <SocialIcon size={14} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* QUICK LINKS SECTION */}
            <div className="space-y-4">
              <h4 className={`text-xs font-mono uppercase tracking-widest font-extrabold pb-1
                ${theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'}
              `}>
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-xs">
                {[
                  { name: "Home", href: "#main-layout-root" },
                  { name: "Features", href: "#features-section" },
                  { name: "How It Works", href: "#how-it-works-section" },
                  { name: "AI Planner", href: "#features-section" },
                  { name: "Save My Week", href: "#features-section" },
                  { name: "Pricing", href: "#features-section" },
                  { name: "Contact", href: "mailto:support@nova.ai" }
                ].map((lnk, lIdx) => (
                  <li key={lIdx}>
                    <a 
                      href={lnk.href}
                      className={`transition-colors duration-200 hover:underline
                        ${theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'}
                      `}
                    >
                      {lnk.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* FEATURES SECTION */}
            <div className="space-y-4">
              <h4 className={`text-xs font-mono uppercase tracking-widest font-extrabold pb-1
                ${theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'}
              `}>
                Features
              </h4>
              <ul className="space-y-2.5 text-xs">
                {[
                  "Smart Scheduling",
                  "AI Prioritization",
                  "Goal Tracking",
                  "Calendar Integration",
                  "Productivity Insights",
                  "Voice Assistant"
                ].map((feat, fIdx) => (
                  <li key={fIdx}>
                    <button 
                      onClick={onGetStarted}
                      className={`text-left transition-colors duration-200 hover:underline cursor-pointer
                        ${theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'}
                      `}
                    >
                      {feat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* RESOURCES SECTION */}
            <div className="space-y-4">
              <h4 className={`text-xs font-mono uppercase tracking-widest font-extrabold pb-1
                ${theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'}
              `}>
                Resources
              </h4>
              <ul className="space-y-2.5 text-xs">
                {[
                  { name: "Documentation", tab: "documentation" },
                  { name: "FAQ", tab: "faq" },
                  { name: "Privacy Policy", tab: "privacy" },
                  { name: "Terms of Service", tab: "terms" }
                ].map((res, rIdx) => (
                  <li key={rIdx}>
                    <button 
                      onClick={() => openTab(res.tab as FooterDocTab)}
                      className={`text-left transition-colors duration-200 hover:underline cursor-pointer
                        ${theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'}
                      `}
                    >
                      {res.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* NEWSLETTER ROW SECTION */}
          <div 
            className={`p-6 md:p-8 rounded-[24px] border backdrop-blur-xl mb-16 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300
              ${theme === 'dark' 
                ? 'bg-zinc-950/60 border-white/5 shadow-2xl shadow-purple-950/5' 
                : 'bg-white border-slate-200 shadow-sm shadow-slate-200/50'
              }
            `}
            id="newsletter-container"
          >
            <div className="space-y-1 text-center md:text-left">
              <h3 className={`text-lg font-extrabold tracking-tight flex items-center justify-center md:justify-start gap-2
                ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
              `}>
                <Sparkles size={16} className="text-purple-500" />
                <span>Stay Productive</span>
              </h3>
              <p className={`text-xs
                ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}
              `}>
                Get productivity tips and AI-powered workflow insights.
              </p>
            </div>

            {newsletterSuccess ? (
              <div className={`px-6 py-3.5 rounded-xl border text-xs font-semibold animate-fade-in text-center shrink-0 w-full md:w-auto
                ${theme === 'dark' 
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' 
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }
              `}>
                🎉 Sparkles! You're added to the productivity registry roster!
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto max-w-md shrink-0">
                <input 
                  type="email" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Email Address"
                  className={`px-4 py-3 rounded-xl border text-xs font-semibold tracking-tight transition-all focus:outline-none focus:ring-1 w-full sm:w-64
                    ${theme === 'dark' 
                      ? 'bg-zinc-900/60 border-white/10 text-white placeholder-zinc-500 focus:ring-purple-500 focus:border-purple-500 focus:bg-zinc-950' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 focus:bg-white'
                    }
                  `}
                  required
                />
                <button 
                  type="submit"
                  className={`px-6 py-3 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center whitespace-nowrap
                    ${theme === 'dark' 
                      ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 shadow-purple-900/30' 
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-indigo-600/25'
                    }
                  `}
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

          {/* BOTTOM COPYRIGHT BAR */}
          <div 
            className={`pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono font-medium
              ${theme === 'dark' ? 'border-white/5 text-zinc-500' : 'border-slate-200 text-slate-500'}
            `}
          >
            <p>© {new Date().getFullYear()} Nova AI. All rights reserved.</p>
            
            <div className="flex gap-4">
              <button onClick={() => openTab("privacy")} className="hover:underline hover:text-zinc-400 cursor-pointer">Privacy Coordinates</button>
              <span className="opacity-40">•</span>
              <button onClick={() => openTab("terms")} className="hover:underline hover:text-zinc-400 cursor-pointer">Heuristics Protocol</button>
            </div>
          </div>

        </div>
      </footer>

      <FooterModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initialTab={activeTab} 
        theme={theme} 
      />

    </div>
  );
}
