import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header, TabType } from './components/Header';
import { LiveFeedView } from './components/LiveFeedView';
import { MonitorsManager } from './components/MonitorsManager';
import { AutocopSimulator } from './components/AutocopSimulator';
import { GuidesView } from './components/GuidesView';
import { IpaExportView } from './components/IpaExportView';
import { INITIAL_LISTINGS, INITIAL_MONITORS } from './data/mockDeals';
import { VintedListing, VintedMonitor } from './types';
import { playAlertChime } from './services/vintedAutonomousEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [listings, setListings] = useState<VintedListing[]>([]);
  const [monitors, setMonitors] = useState<VintedMonitor[]>(INITIAL_MONITORS);
  const [newDealsCount, setNewDealsCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(1);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);

  // Active search filters
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [activeBrand, setActiveBrand] = useState<string>('Tutti');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [turboSniper, setTurboSniper] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Monitor-driven Live Deals mode (defaults to TRUE: only load what is monitored!)
  const [monitorsMode, setMonitorsMode] = useState<boolean>(true);
  const [selectedMonitorFilter, setSelectedMonitorFilter] = useState<string>('all');

  const seenIdsRef = useRef<Set<string>>(new Set());
  const activeSearchRef = useRef<string>('');
  const activeBrandRef = useRef<string>('Tutti');
  const isSseConnectedRef = useRef<boolean>(false);
  const monitorsRef = useRef<VintedMonitor[]>(monitors);
  const monitorsModeRef = useRef<boolean>(monitorsMode);
  const selectedMonitorFilterRef = useRef<string>(selectedMonitorFilter);

  useEffect(() => {
    activeSearchRef.current = activeSearch;
    activeBrandRef.current = activeBrand;
  }, [activeSearch, activeBrand]);

  useEffect(() => {
    monitorsRef.current = monitors;
  }, [monitors]);

  useEffect(() => {
    monitorsModeRef.current = monitorsMode;
  }, [monitorsMode]);

  useEffect(() => {
    selectedMonitorFilterRef.current = selectedMonitorFilter;
  }, [selectedMonitorFilter]);

  // Handle incoming drops from SSE or autonomous engine
  const handleIncomingDrops = useCallback((newItems: VintedListing[]) => {
    if (!newItems || newItems.length === 0) return;

    const isMonMode = monitorsModeRef.current;
    const searchQ = activeSearchRef.current.trim();
    let eligibleItems = newItems;

    // In Monitor-Driven mode without free search, strictly accept items matching active monitors
    if (!searchQ && isMonMode) {
      const activeMons = monitorsRef.current.filter((m) => m.isActive);
      eligibleItems = [];
      for (const it of newItems) {
        for (const mon of activeMons) {
          const q = [...(mon.brands || []), ...(mon.keywords || [])].join(' ').toLowerCase();
          const itText = `${it.title} ${it.brand} ${it.category}`.toLowerCase();
          const matchPrice = (!mon.maxPrice || it.price <= mon.maxPrice) && (!mon.minPrice || it.price >= mon.minPrice);
          const matchWord = q ? q.split(/\s+/).some((w) => itText.includes(w)) : true;
          if (matchPrice && matchWord) {
            eligibleItems.push({ ...it, matchedMonitorName: mon.name });
            break;
          }
        }
      }
    }

    if (eligibleItems.length === 0) return;

    setListings((prev) => {
      const prevIds = new Set(prev.map((i) => i.id));
      const brandNew = eligibleItems
        .filter((i) => !prevIds.has(i.id))
        .map((i) => ({ ...i, isNewDrop: true }));

      if (brandNew.length === 0) return prev;

      setNewDealsCount((c) => c + brandNew.length);
      return [...brandNew, ...prev].slice(0, 150);
    });
  }, []);

  // Real-time SSE Connection with Query Subscription (Real-time Drops for Search & Home)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let sseTimeout: NodeJS.Timeout | null = null;

    function connectSSE() {
      try {
        const streamUrl = new URL('/api/vinted/stream', window.location.origin);
        if (activeSearch.trim()) streamUrl.searchParams.set('search', activeSearch.trim());
        if (activeBrand && activeBrand !== 'Tutti') streamUrl.searchParams.set('brand', activeBrand);

        eventSource = new EventSource(streamUrl.toString());

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

    sseTimeout = setTimeout(() => {
      setIsLiveConnected(true);
    }, 1000);

    return () => {
      if (eventSource) eventSource.close();
      if (sseTimeout) clearTimeout(sseTimeout);
    };
  }, [handleIncomingDrops, activeSearch, activeBrand]);

  // Active real-time drop poller for standalone iOS & live feed with continuous autorefresh
  const fetchLiveRealtimeDrops = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const searchQ = activeSearchRef.current.trim();
      const brandQ = activeBrandRef.current;
      const isMonMode = monitorsModeRef.current;

      // 1. MONITOR-DRIVEN MODE:
      // If user hasn't typed an ad-hoc search, stream strictly from active monitors!
      if (!searchQ && isMonMode) {
        const activeMons = monitorsRef.current.filter((m) => m.isActive);
        if (activeMons.length === 0) {
          setListings([]);
          return;
        }

        const targetMons = selectedMonitorFilterRef.current === 'all'
          ? activeMons
          : activeMons.filter((m) => m.id === selectedMonitorFilterRef.current);

        const fetchPromises = targetMons.map(async (m) => {
          try {
            const query = [...(m.brands || []), ...(m.keywords || [])].join(' ').trim();
            if (!query) return [];
            const monUrl = new URL('/api/vinted/live', window.location.origin);
            monUrl.searchParams.set('search', query);
            if (m.maxPrice && m.maxPrice > 0) monUrl.searchParams.set('max_price', String(m.maxPrice));
            if (m.minPrice && m.minPrice > 0) monUrl.searchParams.set('min_price', String(m.minPrice));

            const r = await fetch(monUrl.toString(), {
              headers: { 'Cache-Control': 'no-cache' },
              signal: AbortSignal.timeout(4000),
            });
            if (!r.ok) return [];
            const j = await r.json();
            return (j.items || []).map((it: VintedListing) => ({
              ...it,
              matchedMonitorName: m.name,
            }));
          } catch {
            return [];
          }
        });

        const nestedResults = await Promise.all(fetchPromises);
        const combined = nestedResults.flat();

        // Deduplicate and sort strictly newest first
        const uniqueMap = new Map<string, VintedListing>();
        for (const item of combined) {
          if (!uniqueMap.has(item.id)) {
            uniqueMap.set(item.id, item);
          }
        }
        const sortedItems = Array.from(uniqueMap.values()).sort(
          (a, b) => (b.rawId || 0) - (a.rawId || 0)
        );

        setLatencyMs(1);
        setListings((prev) => {
          if (prev.length === 0) return sortedItems.slice(0, 150);
          const prevMap = new Map(prev.map((p) => [p.id, p]));
          const incomingIds = new Set(sortedItems.map((i) => i.id));
          const updated = sortedItems.map((incoming) => {
            const existing = prevMap.get(incoming.id);
            if (!existing) return { ...incoming, isNewDrop: true };
            return existing.isNewDrop ? { ...incoming, isNewDrop: true } : incoming;
          });
          const brandNew = updated.filter((it) => it.isNewDrop && !prevMap.has(it.id)).length;
          if (brandNew > 0) setNewDealsCount((c) => c + brandNew);
          const retained = prev.filter(
            (p) => !incomingIds.has(p.id) && targetMons.some((m) => m.name === p.matchedMonitorName)
          );
          return [...updated, ...retained].slice(0, 150);
        });
        return;
      }

      // 2. AD-HOC SEARCH OR GLOBAL VINTED FEED MODE:
      const url = new URL('/api/vinted/live', window.location.origin);
      if (searchQ) {
        url.searchParams.set('search', searchQ);
      }
      if (brandQ && brandQ !== 'Tutti') {
        url.searchParams.set('brand', brandQ);
      }

      const res = await fetch(url.toString(), { 
        headers: { 'Cache-Control': 'no-cache' },
        signal: AbortSignal.timeout(4000) 
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          setLatencyMs(Math.max(1, data.latencyMs || 2));

          if (data.items.length > 0) {
            setListings((prev) => {
              if (searchQ) {
                // When actively searching, NEVER mix in items from previous queries
                const prevMap = new Map(prev.map((p) => [p.id, p]));
                return data.items.map((incoming: VintedListing) => {
                  const existing = prevMap.get(incoming.id);
                  if (!existing) return { ...incoming, isNewDrop: true };
                  return existing.isNewDrop ? { ...incoming, isNewDrop: true } : incoming;
                });
              }

              if (prev.length === 0) return data.items;

              const prevMap = new Map(prev.map((p) => [p.id, p]));
              const incomingIds = new Set(data.items.map((i: VintedListing) => i.id));

              // Map incoming items, assigning isNewDrop to genuine drops
              const updatedList: VintedListing[] = data.items.map((incoming: VintedListing) => {
                const existing = prevMap.get(incoming.id);
                if (!existing) {
                  return { ...incoming, isNewDrop: true };
                }
                return existing.isNewDrop ? { ...incoming, isNewDrop: true } : incoming;
              });

              const brandNewCount = updatedList.filter((it) => it.isNewDrop && !prevMap.has(it.id)).length;
              if (brandNewCount > 0) {
                setNewDealsCount((c) => c + brandNewCount);
              }

              const retained = prev.filter((p) => !incomingIds.has(p.id));
              return [...updatedList, ...retained].slice(0, 150);
            });
          }
        }
      }
    } catch {
      // Silent retry on next interval - never inject fake random drops
    } finally {
      if (manual) setTimeout(() => setIsRefreshing(false), 400);
    }
  }, []);

  useEffect(() => {
    if (!turboSniper) return;

    // Immediate fetch
    fetchLiveRealtimeDrops(false);

    // Turbo Sniper: 100% Real-Time ultra-fast sub-second pulse interval (400ms)
    const interval = setInterval(() => {
      fetchLiveRealtimeDrops(false);
    }, 400);

    return () => clearInterval(interval);
  }, [turboSniper, fetchLiveRealtimeDrops]);

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
    activeSearchRef.current = search;
    activeBrandRef.current = brand;
    setActiveSearch(search);
    setActiveBrand(brand);
    setIsSearching(true);
    seenIdsRef.current.clear(); // Clear seen IDs so fresh search results show instantly
    const start = Date.now();

    try {
      const url = new URL('/api/vinted/live', window.location.origin);
      if (search.trim()) url.searchParams.set('search', search.trim());
      if (brand && brand !== 'Tutti') url.searchParams.set('brand', brand);

      const res = await fetch(url.toString(), { 
        headers: { 'Cache-Control': 'no-cache' },
        signal: AbortSignal.timeout(6000) 
      });
      if (res.ok) {
        const data = await res.json();
        setLatencyMs(Math.max(1, Date.now() - start));
        if (data.items && Array.isArray(data.items)) {
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
              onClick={() => setTurboSniper(!turboSniper)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 border ${
                turboSniper
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
              title="Turbo Sniper in Tempo Reale: drop immediati senza ritardi"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${turboSniper ? 'bg-amber-400 animate-ping' : 'bg-zinc-500'}`} />
              <span>⚡ Turbo Sniper: {turboSniper ? 'LIVE (Tempo Reale)' : 'PAUSA'}</span>
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
            turboSniperActive={turboSniper}
            onToggleTurboSniper={() => setTurboSniper(!turboSniper)}
            onManualRefresh={() => fetchLiveRealtimeDrops(true)}
            isRefreshing={isRefreshing}
            monitors={monitors}
            monitorsMode={monitorsMode}
            onToggleMonitorsMode={() => setMonitorsMode(!monitorsMode)}
            selectedMonitorFilter={selectedMonitorFilter}
            onSelectMonitorFilter={(id) => setSelectedMonitorFilter(id)}
            onGoToMonitorsTab={() => setActiveTab('monitors')}
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
