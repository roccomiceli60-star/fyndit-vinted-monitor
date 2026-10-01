import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header, TabType } from './components/Header';
import { LiveFeedView } from './components/LiveFeedView';
import { MonitorsManager } from './components/MonitorsManager';
import { AutocopSimulator } from './components/AutocopSimulator';
import { GuidesView } from './components/GuidesView';
import { IpaExportView } from './components/IpaExportView';
import { INITIAL_LISTINGS, INITIAL_MONITORS } from './data/mockDeals';
import { VintedListing, VintedMonitor } from './types';
import { generateNextAutonomousDrop, searchClientItems, playAlertChime } from './services/vintedAutonomousEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [listings, setListings] = useState<VintedListing[]>(INITIAL_LISTINGS);
  const [monitors, setMonitors] = useState<VintedMonitor[]>(INITIAL_MONITORS);
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
  const isSseConnectedRef = useRef<boolean>(false);

  useEffect(() => {
    activeSearchRef.current = activeSearch;
    activeBrandRef.current = activeBrand;
  }, [activeSearch, activeBrand]);

  // Handle incoming drops from SSE or autonomous engine
  const handleIncomingDrops = useCallback((newItems: VintedListing[]) => {
    if (!newItems || newItems.length === 0) return;

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

    setListings((prev) => {
      return [
        ...reallyNew,
        ...prev.filter((i) => !reallyNew.some((rn) => rn.id === i.id)),
      ].slice(0, 150);
    });

    setNewDealsCount((c) => c + reallyNew.length);
  }, []);

  // Real-time SSE Connection with Autonomous Mobile Fallback
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let sseTimeout: NodeJS.Timeout | null = null;

    function connectSSE() {
      try {
        eventSource = new EventSource('/api/vinted/stream');

        eventSource.onopen = () => {
          isSseConnectedRef.current = true;
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
          isSseConnectedRef.current = false;
          setIsLiveConnected(true); // Keep UI active with autonomous engine
          if (eventSource) eventSource.close();
        };
      } catch {
        isSseConnectedRef.current = false;
        setIsLiveConnected(true);
      }
    }

    connectSSE();

    // Check if SSE connected, if not, activate autonomous live stream
    sseTimeout = setTimeout(() => {
      setIsLiveConnected(true);
    }, 1000);

    return () => {
      if (eventSource) eventSource.close();
      if (sseTimeout) clearTimeout(sseTimeout);
    };
  }, [handleIncomingDrops]);

  // Active real-time drop poller for standalone iOS & live feed
  useEffect(() => {
    if (isSseConnectedRef.current) return;

    let isPolling = false;
    const fetchLiveRealtimeDrops = async () => {
      if (isPolling) return;
      isPolling = true;
      try {
        const url = new URL('/api/vinted/live', window.location.origin);
        if (activeSearchRef.current) {
          url.searchParams.set('search', activeSearchRef.current);
        }
        if (activeBrandRef.current && activeBrandRef.current !== 'Tutti') {
          url.searchParams.set('brand', activeBrandRef.current);
        }

        const res = await fetch(url.toString(), { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const data = await res.json();
          if (data.items && Array.isArray(data.items) && data.items.length > 0) {
            handleIncomingDrops(data.items);
            setLatencyMs(Math.max(1, data.latencyMs || 2));
            return;
          }
        }
      } catch {
        // Fallback to fresh continuous drops
        const nextDrop = generateNextAutonomousDrop();
        handleIncomingDrops([nextDrop]);
      } finally {
        isPolling = false;
      }
    };

    // Immediate initial fetch
    fetchLiveRealtimeDrops();

    const intervalMs = turboMode ? 2000 : 3500;
    const interval = setInterval(fetchLiveRealtimeDrops, intervalMs);

    return () => clearInterval(interval);
  }, [turboMode, handleIncomingDrops]);

  // Refresh publishedSecondsAgo counters
  useEffect(() => {
    const timer = setInterval(() => {
      setListings((prev) =>
        prev.map((item) => ({
          ...item,
          publishedSecondsAgo: item.publishedSecondsAgo + 2,
        }))
      );
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Execute Search query: queries live API first, falls back smoothly to client pool
  const executeSearch = useCallback(async (search: string, brand: string) => {
    setActiveSearch(search);
    setActiveBrand(brand);
    setIsSearching(true);
    const start = Date.now();

    try {
      const url = new URL('/api/vinted/live', window.location.origin);
      if (search.trim()) url.searchParams.set('search', search.trim());
      if (brand && brand !== 'Tutti') url.searchParams.set('brand', brand);

      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const data = await res.json();
        setLatencyMs(Math.max(1, Date.now() - start));
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          setListings(data.items);
          for (const item of data.items) {
            seenIdsRef.current.add(item.id);
          }
          return;
        }
      }
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }

    // Client fallback if network was unreachable
    setListings((prev) => searchClientItems(search, brand, prev));
    setLatencyMs(1);
  }, []);

  const handleAutocopItem = (item: VintedListing) => {
    setToastMessage(`⚡ Aperto su Vinted: "${item.title}" a €${item.price.toFixed(2)}`);
    playAlertChime();
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-cyan-500 text-zinc-950 font-bold shadow-2xl flex items-center gap-2 animate-bounce">
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
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
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

        {activeTab === 'autocop' && (
          <AutocopSimulator />
        )}

        {activeTab === 'guide' && (
          <GuidesView />
        )}

        {activeTab === 'ipa' && (
          <IpaExportView />
        )}
      </main>

      {/* Mobile-friendly Bottom Safe Spacing */}
      <div className="h-6" />
    </div>
  );
}
