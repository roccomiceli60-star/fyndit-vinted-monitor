import React from 'react';
import { 
  Zap, 
  Target, 
  Bot, 
  BookOpen, 
  Smartphone, 
  Activity,
  User,
  MapPin,
  Flame,
  Volume2,
  VolumeX,
  PackageCheck
} from 'lucide-react';
import fynditIcon from '../assets/images/fyndit_icon_1790842000865.jpg';
import { VintedAccount } from '../types';

export type TabType = 'feed' | 'monitors' | 'orders' | 'pickup' | 'autocop' | 'guide' | 'ipa';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeMonitorsCount: number;
  newDealsCount: number;
  account?: VintedAccount;
  onOpenAccountModal?: () => void;
  onOpenPickupModal?: () => void;
  fastModeActive?: boolean;
  onToggleFastMode?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  ordersCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeMonitorsCount,
  newDealsCount,
  account,
  onOpenAccountModal,
  onOpenPickupModal,
  fastModeActive = true,
  onToggleFastMode,
  soundEnabled = true,
  onToggleSound,
  ordersCount = 0,
}) => {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => setActiveTab('feed')}>
            <img
              src={fynditIcon}
              alt="Vinted QuickBuy Logo"
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-teal-500/40 shadow-lg shadow-teal-500/10 transition-transform group-hover:scale-105"
            />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Vinted QuickBuy
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-500/50">
                  FAST MODE
                </span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:flex items-center gap-1.5 font-medium">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              Monitor annunci in tempo reale & Acquisto 1-Clic al Locker
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'feed'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Zap className={`w-4 h-4 ${activeTab === 'feed' ? 'text-amber-400' : ''}`} />
            Live Drops
            {newDealsCount > 0 && (
              <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                +{newDealsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('monitors')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'monitors'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Target className={`w-4 h-4 ${activeTab === 'monitors' ? 'text-cyan-400' : ''}`} />
            Profili Ricerca
            <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded-full bg-zinc-700/60 text-zinc-300">
              {activeMonitorsCount}
            </span>
          </button>

          <button
            onClick={() => onOpenPickupModal && onOpenPickupModal()}
            className="px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 cursor-pointer"
            title="Configura Locker Principale e Punti Alternativi"
          >
            <MapPin className="w-4 h-4 text-teal-400" />
            Punto di Ritiro
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <PackageCheck className={`w-4 h-4 ${activeTab === 'orders' ? 'text-emerald-400' : ''}`} />
            Ordini
            {ordersCount > 0 && (
              <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400">
                {ordersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ipa')}
            className={`px-2.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'ipa'
                ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold shadow-md'
                : 'text-teal-400 bg-teal-950/40 hover:bg-teal-900/60 border border-teal-800/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            App iOS
          </button>

          {/* FAST MODE Switch */}
          {onToggleFastMode && (
            <button
              type="button"
              onClick={onToggleFastMode}
              className={`ml-1 px-3 py-1.5 rounded-xl border font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                fastModeActive
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
              title="Attiva/Disattiva FAST MODE: ordinamento istantaneo per Match Score e notifiche audio immediate"
            >
              <Flame className={`w-4 h-4 ${fastModeActive ? 'fill-zinc-950 animate-bounce' : 'text-zinc-500'}`} />
              <span>{fastModeActive ? 'FAST MODE' : 'MODALITÀ NORMALE'}</span>
            </button>
          )}

          {/* Audio Chime Toggle */}
          {onToggleSound && (
            <button
              type="button"
              onClick={onToggleSound}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-zinc-800 text-teal-300 border-zinc-700'
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800'
              }`}
              title={soundEnabled ? 'Notifiche audio attive' : 'Audio disattivato'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          {/* Vinted Account & Preferred Locker Button */}
          <button
            type="button"
            onClick={onOpenAccountModal}
            className="ml-1 px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border-teal-500/40 hover:border-teal-400 shadow-sm cursor-pointer"
            title="Gestisci Account Vinted e Punto di Ritiro più vicino"
          >
            <div className="relative">
              <User className="w-4 h-4 text-teal-400" />
              {account?.isConnected && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 border border-zinc-950 animate-pulse" />
              )}
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-[11px] font-bold text-white leading-tight truncate max-w-[105px]">
                {account?.isConnected ? `@${account.username}` : 'Collega Vinted'}
              </div>
              <div className="text-[9px] text-teal-400 truncate max-w-[105px]">
                {account?.preferredPickupPoint ? `📍 ${account.preferredPickupPoint.carrier.split(' ')[0]}` : '📍 Scegli Locker'}
              </div>
            </div>
          </button>
        </nav>

        {/* Mobile Navigation button */}
        <div className="flex md:hidden items-center gap-1.5">
          {onToggleFastMode && (
            <button
              type="button"
              onClick={onToggleFastMode}
              className={`p-2 rounded-lg border text-xs font-bold ${
                fastModeActive
                  ? 'bg-amber-500 text-zinc-950 border-amber-400'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
              title="Toggle Fast Mode"
            >
              <Flame className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onOpenAccountModal}
            className="p-2 rounded-lg bg-teal-950/40 text-teal-300 border border-teal-500/40"
            title="Account Vinted & Punto di Ritiro"
          >
            <User className="w-4 h-4" />
          </button>
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
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Live Drops
        </button>
        <button
          onClick={() => setActiveTab('monitors')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'monitors' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-cyan-400" /> Profili ({activeMonitorsCount})
        </button>
        <button
          onClick={() => onOpenPickupModal && onOpenPickupModal()}
          className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 text-zinc-400"
        >
          <MapPin className="w-3.5 h-3.5 text-teal-400" /> Locker
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'orders' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5 text-emerald-400" /> Ordini ({ordersCount})
        </button>
      </div>
    </header>
  );
};

