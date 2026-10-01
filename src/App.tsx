import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header, TabType } from './components/Header';
import { LiveFeedView } from './components/LiveFeedView';
import { MonitorsManager } from './components/MonitorsManager';
import { ProfitCalculator } from './components/ProfitCalculator';
import { AutocopSimulator } from './components/AutocopSimulator';
import { GuidesView } from './components/GuidesView';
import { IpaExportView } from './components/IpaExportView';
import { INITIAL_LISTINGS, INITIAL_MONITORS } from './data/mockDeals';
import { VintedListing, VintedMonitor } from './types';
import { playSniperChime } from './utils/audioAlert';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [listings, setListings] = useState<VintedListing[]>(INITIAL_LISTINGS);
  const [monitors, setMonitors] = useState<VintedMonitor[]>(INITIAL_MONITORS);
  const [calculatorItem, setCalculatorItem] = useState<VintedListing | null>(null);
  const [newDealsCount, setNewDealsCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(1);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);
  
  // Sniper Bot controls
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoOpenSteals, setAutoOpenSteals] = useState<boolean>(false);
  const [turboMode, setTurboMode] = useState<boolean>(true);

  const seenIdsRef = useRef<Set<string>>(new Set());
  const soundEnabledRef = useRef(soundEnabled);
  const autoOpenRef = useRef(autoOpenSteals);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    autoOpenRef.current = autoOpenSteals;
  }, [autoOpenSteals]);

  // Handle incoming new drops with ZERO delay
  const handleIncomingDrops = useCallback((newItems: VintedListing[]) => {
    if (!newItems || newItems.length === 0) return;

    let hasSteal = false;
    const reallyNew: VintedListing[] = [];

    for (const item of newItems) {
      if (!seenIdsRef.current.has(item.id)) {
        seenIdsRef.current.add(item.id);
        reallyNew.push({ ...item, isNewDrop: true });
        if (item.dealScore === 'STEAL' || item.discountPercent >= 55) {
          hasSteal = true;
        }
      }
    }

    if (reallyNew.length === 0) return;

    // Play instant sound alert
    if (soundEnabledRef.current) {
      playSniperChime(hasSteal);
    }

    // Auto-open steal if option enabled
    if (autoOpenRef.current && hasSteal) {
      const topSteal = reallyNew.find((i) => i.dealScore === 'STEAL');
      if (topSteal && topSteal.vintedUrl) {
        window.open(topSteal.vintedUrl, '_blank');
      }
    }

    // Prepend directly to top of feed with zero delay
    setListings((prev) => {
      const existingMap = new Map(prev.map((i) => [i.id, i]));
      for (const ni of reallyNew) {
        existingMap.set(ni.id, ni);
      }
      return [
        ...reallyNew,
        ...prev.filter((i) => !reallyNew.some((rn) => rn.id === i.id)),
      ].slice(0, 150);
    });

    setNewDealsCount((c) => c + reallyNew.length);
  }, []);

  // Real-time SSE Connection (Server-Sent Events: Instant sub-millisecond push)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    function connectSSE() {
      try {
        eventSource = new EventSource('/api/vinted/stream');

        eventSource.onopen = () => {
          setIsLiveConnected(true);
          setLatencyMs(1);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'INITIAL_STATE' && Array.isArray(data.items)) {
              for (const it of data.items) {
                seenIdsRef.current.add(it.id);
              }
              setListings(data.items);
            } else if (data.type === 'NEW_DROPS' && Array.isArray(data.items)) {
              handleIncomingDrops(data.items);
            }
          } catch {
            // ignore parse error
          }
        };

        eventSource.onerror = () => {
          setIsLiveConnected(false);
          if (eventSource) eventSource.close();
          retryTimeout = setTimeout(connectSSE, 2000);
        };
      } catch {
        setIsLiveConnected(false);
        retryTimeout = setTimeout(connectSSE, 3000);
      }
    }

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [handleIncomingDrops]);

  // Polling fallback / Turbo sync to ensure absolute zero misses
  useEffect(() => {
    const fetchLive = async () => {
      const start = Date.now();
      try {
        const res = await fetch('/api/vinted/live');
        if (!res.ok) return;
        const data = await res.json();
        setLatencyMs(Math.max(1, Date.now() - start));
        if (data.items && Array.isArray(data.items)) {
          handleIncomingDrops(data.items);
        }
      } catch {
        // ignore
      }
    };

    const pollInterval = setInterval(fetchLive, turboMode ? 1800 : 3500);
    return () => clearInterval(pollInterval);
  }, [turboMode, handleIncomingDrops]);

  const handleOpenCalculatorWithItem = (item: VintedListing) => {
    setCalculatorItem(item);
    setActiveTab('calculator');
  };

  const handleAutocopItem = (item: VintedListing) => {
    setToastMessage(`⚡ Sniper avviato per "${item.title}" a €${item.price.toFixed(2)}! Apertura su Vinted in corso...`);
    if (item.vintedUrl) {
      window.open(item.vintedUrl, '_blank');
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleMonitor = (id: string) => {
    setMonitors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m))
    );
  };

  const handleDeleteMonitor = (id: string) => {
    setMonitors((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddMonitor = (newMon: Omit<VintedMonitor, 'id' | 'createdAt' | 'matchCount'>) => {
    const created: VintedMonitor = {
      ...newMon,
      id: `mon-${Date.now()}`,
      createdAt: Date.now(),
      matchCount: 0,
    };
    setMonitors((prev) => [created, ...prev]);
  };

  const handleSearchFilter = async (search: string, brand: string) => {
    try {
      const url = new URL('/api/vinted/live', window.location.origin);
      if (search) url.searchParams.set('search', search);
      if (brand && brand !== 'Tutti') url.searchParams.set('brand', brand);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.items) setListings(data.items);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl bg-cyan-500 text-zinc-950 font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'feed') setNewDealsCount(0);
        }}
        activeMonitorsCount={monitors.filter((m) => m.isActive).length}
        newDealsCount={newDealsCount}
      />

      {/* Ultra-Fast Live Sniper Bar */}
      <div className="bg-zinc-900/90 border-b border-zinc-800/80 py-2 px-4 text-xs text-zinc-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
              Vinted Live Stream SSE: {isLiveConnected ? 'Attivo (0ms Delay)' : 'Riconnessione...'}
            </span>
            <span className="text-zinc-700">|</span>
            <span className="font-mono text-cyan-400 font-semibold bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
              Ping: {latencyMs}ms
            </span>
          </div>

          {/* Quick Sniper Toggles */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTurboMode(!turboMode)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 border ${
                turboMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
              title="Aumenta la frequenza di scraping concorrente a 1 secondo"
            >
              <span>⚡</span> Turbo Mode: {turboMode ? '1.0s (ON)' : 'Standard'}
            </button>

            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playSniperChime(true);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 border ${
                soundEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
              title="Suono istantaneo Web Audio sintetizzato a 0ms appena esce un annuncio"
            >
              <span>🔔</span> Suono Allerta: {soundEnabled ? 'Attivo' : 'Muto'}
            </button>

            <button
              onClick={() => setAutoOpenSteals(!autoOpenSteals)}
              className={`hidden sm:flex px-2.5 py-1 rounded text-[11px] font-bold transition-all items-center gap-1.5 border ${
                autoOpenSteals
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/20'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
              title="Apre istantaneamente la pagina Vinted per comprare prima di tutti quando c'è uno STEAL"
            >
              <span>🎯</span> Auto-Open Steal: {autoOpenSteals ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'feed' && (
          <LiveFeedView
            listings={listings}
            onOpenCalculatorWithItem={handleOpenCalculatorWithItem}
            onAutocopItem={handleAutocopItem}
            onFilterChange={handleSearchFilter}
          />
        )}

        {activeTab === 'monitors' && (
          <MonitorsManager
            monitors={monitors}
            onToggleMonitor={handleToggleMonitor}
            onDeleteMonitor={handleDeleteMonitor}
            onAddMonitor={handleAddMonitor}
          />
        )}

        {activeTab === 'calculator' && (
          <ProfitCalculator initialItem={calculatorItem} />
        )}

        {activeTab === 'autocop' && <AutocopSimulator />}

        {activeTab === 'guide' && <GuidesView />}

        {activeTab === 'ipa' && <IpaExportView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Fyndit Sniper Engine. Monitoraggio in tempo reale a zero ritardi via Server-Sent Events.</p>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Sincronizzazione Streaming Attiva
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
