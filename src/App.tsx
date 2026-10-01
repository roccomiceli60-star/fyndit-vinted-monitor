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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [listings, setListings] = useState<VintedListing[]>(INITIAL_LISTINGS);
  const [monitors, setMonitors] = useState<VintedMonitor[]>(INITIAL_MONITORS);
  const [calculatorItem, setCalculatorItem] = useState<VintedListing | null>(null);
  const [newDealsCount, setNewDealsCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(1);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);

  // Active search filters
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [activeBrand, setActiveBrand] = useState<string>('Tutti');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [turboMode, setTurboMode] = useState<boolean>(true);

  const seenIdsRef = useRef<Set<string>>(new Set());
  const activeSearchRef = useRef<string>('');
  const activeBrandRef = useRef<string>('Tutti');

  useEffect(() => {
    activeSearchRef.current = activeSearch;
    activeBrandRef.current = activeBrand;
  }, [activeSearch, activeBrand]);

  // Handle incoming drops from SSE with ZERO sound/noise
  const handleIncomingDrops = useCallback((newItems: VintedListing[]) => {
    if (!newItems || newItems.length === 0) return;

    // If user is searching, only include items that match the user's search
    const searchQ = activeSearchRef.current.toLowerCase().trim();
    const brandQ = activeBrandRef.current === 'Tutti' ? '' : activeBrandRef.current.toLowerCase().trim();

    const reallyNew: VintedListing[] = [];
    for (const item of newItems) {
      if (!seenIdsRef.current.has(item.id)) {
        seenIdsRef.current.add(item.id);
        if (searchQ || brandQ) {
          const itemText = `${item.title} ${item.brand} ${item.category}`.toLowerCase();
          const matchesSearch = !searchQ || itemText.includes(searchQ);
          const matchesBrand = !brandQ || item.brand.toLowerCase().includes(brandQ);
          if (matchesSearch && matchesBrand) {
            reallyNew.push({ ...item, isNewDrop: true });
          }
        } else {
          reallyNew.push({ ...item, isNewDrop: true });
        }
      }
    }

    if (reallyNew.length === 0) return;

    // Prepend directly to top of feed with zero delay (completely silent, no noise)
    setListings((prev) => {
      return [
        ...reallyNew,
        ...prev.filter((i) => !reallyNew.some((rn) => rn.id === i.id)),
      ].slice(0, 150);
    });

    setNewDealsCount((c) => c + reallyNew.length);
  }, []);

  // Real-time SSE Connection
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
              // Only set initial state if user is not actively searching
              if (!activeSearchRef.current && activeBrandRef.current === 'Tutti') {
                setListings(data.items);
              }
            } else if (data.type === 'NEW_DROPS' && Array.isArray(data.items)) {
              handleIncomingDrops(data.items);
            }
          } catch {
            // ignore
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

  // Execute Search query on Vinted live catalog
  const executeSearch = useCallback(async (search: string, brand: string) => {
    setActiveSearch(search);
    setActiveBrand(brand);
    setIsSearching(true);
    const start = Date.now();

    try {
      const url = new URL('/api/vinted/live', window.location.origin);
      if (search.trim()) url.searchParams.set('search', search.trim());
      if (brand && brand !== 'Tutti') url.searchParams.set('brand', brand);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setLatencyMs(Math.max(1, Date.now() - start));
        if (data.items && Array.isArray(data.items)) {
          setListings(data.items);
          for (const item of data.items) {
            seenIdsRef.current.add(item.id);
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Background refresh poller respects current search filters
  useEffect(() => {
    const fetchLive = async () => {
      const start = Date.now();
      try {
        const url = new URL('/api/vinted/live', window.location.origin);
        if (activeSearchRef.current.trim()) {
          url.searchParams.set('search', activeSearchRef.current.trim());
        }
        if (activeBrandRef.current && activeBrandRef.current !== 'Tutti') {
          url.searchParams.set('brand', activeBrandRef.current);
        }

        const res = await fetch(url.toString());
        if (!res.ok) return;
        const data = await res.json();
        setLatencyMs(Math.max(1, Date.now() - start));

        if (data.items && Array.isArray(data.items)) {
          // If we had no items before or got new ones, update smoothly
          if (data.items.length > 0) {
            handleIncomingDrops(data.items);
          }
        }
      } catch {
        // ignore
      }
    };

    const pollInterval = setInterval(fetchLive, turboMode ? 2200 : 4000);
    return () => clearInterval(pollInterval);
  }, [turboMode, handleIncomingDrops]);

  const handleOpenCalculatorWithItem = (item: VintedListing) => {
    setCalculatorItem(item);
    setActiveTab('calculator');
  };

  const handleAutocopItem = (item: VintedListing) => {
    setToastMessage(`⚡ Aperto su Vinted: "${item.title}" a €${item.price.toFixed(2)}`);
    if (item.vintedUrl) {
      window.open(item.vintedUrl, '_blank');
    }
    setTimeout(() => setToastMessage(null), 3000);
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl bg-cyan-500 text-zinc-950 font-bold shadow-2xl flex items-center gap-2">
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

      {/* Silent Live Status Bar */}
      <div className="bg-zinc-900/90 border-b border-zinc-800/80 py-2 px-4 text-xs text-zinc-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
              Vinted Live Stream: {isLiveConnected ? 'Attivo (Zero Ritardi)' : 'Connessione...'}
            </span>
            <span className="text-zinc-700">|</span>
            <span className="font-mono text-cyan-400 font-semibold bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
              Latenza: {latencyMs}ms
            </span>
            {isSearching && (
              <span className="text-amber-400 text-[11px] animate-pulse font-medium">
                ⏳ Ricerca live in corso...
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTurboMode(!turboMode)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 border ${
                turboMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              <span>⚡</span> Turbo: {turboMode ? '1.5s' : 'Standard'}
            </button>
            <span className="text-zinc-500 text-[11px]">Modalità Silenziosa Attiva 🔇</span>
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
            onFilterChange={executeSearch}
            currentSearch={activeSearch}
            currentBrand={activeBrand}
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
          <p>© 2026 Fyndit. Ricerca in tempo reale direttamente sull'API Vinted EU.</p>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Sincronizzazione Attiva
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
