import React from 'react';
import { 
  Zap, 
  Target, 
  Calculator, 
  Bot, 
  BookOpen, 
  Smartphone, 
  BellRing,
  Activity
} from 'lucide-react';
import fynditIcon from '../assets/images/fyndit_icon_1790842000865.jpg';

export type TabType = 'feed' | 'monitors' | 'autocop' | 'guide' | 'ipa';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeMonitorsCount: number;
  newDealsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeMonitorsCount,
  newDealsCount,
}) => {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => setActiveTab('feed')}>
            <img
              src={fynditIcon}
              alt="Fyndit Logo"
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-500/10 transition-transform group-hover:scale-105"
            />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Fyndit
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  Vinted Bot
                </span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:flex items-center gap-1.5 font-medium">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              Monitor annunci in tempo reale & Deal Sniper
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'feed'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Zap className={`w-4 h-4 ${activeTab === 'feed' ? 'text-amber-400' : ''}`} />
            Live Deals
            {newDealsCount > 0 && (
              <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                +{newDealsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('monitors')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'monitors'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Target className={`w-4 h-4 ${activeTab === 'monitors' ? 'text-cyan-400' : ''}`} />
            Miei Monitor
            <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded-full bg-zinc-700/60 text-zinc-300">
              {activeMonitorsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('autocop')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'autocop'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Bot className={`w-4 h-4 ${activeTab === 'autocop' ? 'text-violet-400' : ''}`} />
            Autocop Bot
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'guide' ? 'text-blue-400' : ''}`} />
            Guida
          </button>

          <button
            onClick={() => setActiveTab('ipa')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'ipa'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-semibold shadow-md'
                : 'text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Scarica iOS IPA
          </button>
        </nav>

        {/* Mobile Navigation button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setActiveTab('ipa')}
            className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/60"
            title="Scarica IPA"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab(activeTab === 'feed' ? 'monitors' : 'feed')}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-200"
          >
            <Zap className="w-4 h-4 text-amber-400" />
          </button>
        </div>

      </div>

      {/* Sub-bar for mobile navigation */}
      <div className="flex md:hidden border-t border-zinc-800/80 px-2 py-1.5 overflow-x-auto gap-1 bg-zinc-950/95 scrollbar-none">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'feed' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Live Deals
        </button>
        <button
          onClick={() => setActiveTab('monitors')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'monitors' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-cyan-400" /> Monitor ({activeMonitorsCount})
        </button>
        <button
          onClick={() => setActiveTab('autocop')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'autocop' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-violet-400" /> Autocop
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'guide' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Guida
        </button>
      </div>
    </header>
  );
};
