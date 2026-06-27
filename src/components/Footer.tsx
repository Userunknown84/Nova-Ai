import { useState } from "react";
import { Github, Linkedin, Twitter, Mail, Sparkles } from "lucide-react";
import FooterModal, { FooterDocTab } from "./FooterModal";

interface FooterProps {
  theme: 'light' | 'dark';
}

export default function Footer({ theme }: FooterProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FooterDocTab>("documentation");

  const openTab = (tab: FooterDocTab) => {
    setActiveTab(tab);
    setModalOpen(true);
  };

  return (
    <footer 
      className={`border-t rounded-3xl mt-16 relative z-10 transition-colors duration-300 backdrop-blur-md overflow-hidden
        ${theme === 'dark' 
          ? 'bg-zinc-950/40 border-white/5 text-zinc-300' 
          : 'bg-white border-slate-200 text-slate-800'
        }
      `}
      id="workspace-reusable-footer"
    >
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-white/5">
          {/* BRAND INSTANCE */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">
                N
              </div>
              <div>
                <span className={`font-black tracking-tight text-sm transition-colors
                  ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                `}>
                  Nova AI
                </span>
                <span className="block text-[8px] uppercase tracking-widest text-[#a855f7] font-mono leading-none font-bold">
                  PREDICT • PRIORITIZE • COMPLETE
                </span>
              </div>
            </div>
            <p className={`text-xs leading-relaxed max-w-xs
              ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}
            `}>
              An AI-powered productivity companion helping you avoid missed deadlines, optimize schedules, and meet goals.
            </p>
          </div>

          {/* DYNAMIC SYSTEM METADATA NODES */}
          <div className="space-y-4">
            <h4 className={`text-[10px] font-mono uppercase tracking-widest font-extrabold
              ${theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'}
            `}>
              Workspace Registry Nodes
            </h4>
            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
              <div className="space-y-1">
                <span className="text-zinc-500 block">Security Mode</span>
                <span className="text-green-400 font-bold block">● Active SSL</span>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-500 block">System Mode</span>
                <span className="text-purple-400 font-bold block">Production Cluster</span>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-500 block">Synchronization</span>
                <span className="text-indigo-400 font-bold block">Cloud Firestore</span>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-500 block">Telemetry Pacing</span>
                <span className="text-blue-400 font-bold block">Dynamic Neural</span>
              </div>
            </div>
          </div>

          {/* SOCIAL LINKS & REGISTRY COORDINATES */}
          <div className="space-y-4">
            <h4 className={`text-[10px] font-mono uppercase tracking-widest font-extrabold
              ${theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'}
            `}>
              Connect Coordinates
            </h4>
            <div className="flex items-center gap-2.5">
              {[
                { icon: Github, href: "https://github.com", label: "GitHub Coordinates" },
                { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn Connection" },
                { icon: Twitter, href: "https://twitter.com", label: "X Stream" },
                { icon: Mail, href: "mailto:support@nova.ai", label: "Mail Direct" }
              ].map((social, sIdx) => {
                const SocialIcon = social.icon;
                return (
                  <a 
                    key={sIdx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 hover:scale-[1.05] cursor-pointer
                      ${theme === 'dark' 
                        ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:border-purple-500/40 hover:bg-purple-950/20' 
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-950 hover:border-blue-500/30 hover:bg-blue-50/50 shadow-xs'
                      }
                    `}
                  >
                    <SocialIcon size={13} />
                  </a>
                );
              })}
            </div>
            <p className="text-[10px] text-zinc-500">
              Need assistance? Email us at <a href="mailto:support@nova.ai" className="hover:underline text-[#a855f7]">support@nova.ai</a>
            </p>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT BAR */}
        <div 
          className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono font-medium text-zinc-500"
        >
          <p>© {new Date().getFullYear()} Nova AI. All rights reserved.</p>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-center">
            <button 
              onClick={() => openTab("documentation")} 
              className="hover:underline hover:text-purple-400 cursor-pointer font-medium"
            >
              Documentation
            </button>
            <span className="opacity-40">•</span>
            <button 
              onClick={() => openTab("faq")} 
              className="hover:underline hover:text-purple-400 cursor-pointer font-medium"
            >
              FAQ
            </button>
            <span className="opacity-40">•</span>
            <button 
              onClick={() => openTab("privacy")} 
              className="hover:underline hover:text-purple-400 cursor-pointer font-medium"
            >
              Privacy Policy
            </button>
            <span className="opacity-40">•</span>
            <button 
              onClick={() => openTab("terms")} 
              className="hover:underline hover:text-purple-400 cursor-pointer font-medium"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      <FooterModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initialTab={activeTab} 
        theme={theme} 
      />
    </footer>
  );
}
