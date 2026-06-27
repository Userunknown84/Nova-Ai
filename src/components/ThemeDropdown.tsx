import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Palette, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type ThemePreset = 'default' | 'purple' | 'cyberpunk' | 'emerald' | 'sunset';

interface ThemeDropdownProps {
  currentPreset: ThemePreset;
  onPresetChange: (preset: ThemePreset) => void;
  theme: 'light' | 'dark';
  align?: 'left' | 'right';
}

export default function ThemeDropdown({
  currentPreset,
  onPresetChange,
  theme,
  align = 'right'
}: ThemeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeOptions: Array<{
    id: ThemePreset;
    label: string;
    description: string;
    icon: string;
    colorAccent: string;
  }> = [
    { id: 'default', label: 'Default Theme', description: 'Classic Blue accents, professional SaaS styling', icon: '🔹', colorAccent: 'text-blue-500' },
    { id: 'purple', label: 'Purple Theme', description: 'Premium lavender & violet premium presets', icon: '🔮', colorAccent: 'text-purple-400' },
    { id: 'cyberpunk', label: 'Cyberpunk Theme', description: 'Neon Cyan highlights, futuristic dashboard glow', icon: '⚡', colorAccent: 'text-cyan-400' },
    { id: 'emerald', label: 'Emerald Theme', description: 'Green accents, clean productivity aesthetic', icon: '❇️', colorAccent: 'text-emerald-400' },
    { id: 'sunset', label: 'Sunset Theme', description: 'Orange accents, warm gradients', icon: '🌅', colorAccent: 'text-amber-500' }
  ];

  const getActiveLabel = () => {
    const preset = themeOptions.find(p => p.id === currentPreset);
    return `${preset ? preset.icon : '🎨'} ${preset?.label.split(' ')[0]}`;
  };

  return (
    <div className="relative font-sans text-xs" ref={containerRef} id="theme-preset-dropdown-container">
      {/* Theme Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 rounded-xl border flex items-center gap-2 font-bold transition-all cursor-pointer select-none active:scale-[0.98]
          ${theme === 'dark' 
            ? 'bg-zinc-800/95 hover:bg-zinc-800 border-white/5 text-zinc-100 shadow-lg shadow-black/20' 
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs'
          }
        `}
        id="theme-dropdown-trigger"
        type="button"
      >
        <Palette size={14} className="text-purple-400 shrink-0" />
        <span className="tracking-tight text-[11px] font-mono whitespace-nowrap">{getActiveLabel()}</span>
        <ChevronDown size={11} className={`opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Dropdown Frame */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute mt-2 w-56 rounded-2xl border p-2 backdrop-blur-2xl shadow-xl z-50 origin-top-right
              ${align === 'right' ? 'right-0' : 'left-0'}
              ${theme === 'dark' 
                ? 'bg-zinc-900 border-white/10 text-zinc-200 shadow-black/60' 
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/40'
              }
            `}
            id="theme-dropdown-panel"
          >
            <div className="px-2.5 py-1.5 mb-1.5 border-b border-white/5 flex items-center justify-between">
              <span className="font-extrabold text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Palette size={11} />
                <span>Select Theme</span>
              </span>
              <span className="text-[9px] font-mono text-zinc-500">Workspace Preset</span>
            </div>

            <div className="space-y-0.5" role="menu">
              {themeOptions.map((preset) => {
                const isPresetSelected = currentPreset === preset.id;
                
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onPresetChange(preset.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs font-semibold
                      ${isPresetSelected
                        ? theme === 'dark'
                          ? 'bg-purple-600/15 border border-purple-500/20 text-white font-bold'
                          : 'bg-purple-50 text-purple-700 border border-purple-100 font-bold'
                        : theme === 'dark'
                          ? 'hover:bg-white/5 border border-transparent text-zinc-300'
                          : 'hover:bg-slate-50 border border-transparent text-slate-700'
                      }
                    `}
                    id={`option-preset-${preset.id}`}
                    role="menuitem"
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm shrink-0">{preset.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-bold text-[11px] tracking-tight">{preset.label}</span>
                        <span className={`text-[9px] font-normal leading-none shrink-0 ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
                          {preset.id === 'default' ? 'SaaS standard' : preset.id === 'cyberpunk' ? 'Cyberpunk neon aesthetics' : 'Premium palette Accent'}
                        </span>
                      </div>
                    </div>
                    {isPresetSelected && (
                      <Check size={11} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
