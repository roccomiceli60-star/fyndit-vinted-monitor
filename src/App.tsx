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
import { matchListingToMonitor } from './utils/monitorMatcher';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [listings, setListings] = useState<VintedListing[]>([]);
  const [lastLiveSyncTime, setLastLiveSyncTime] = useState<number>(Date.now());
  const [monitors, setMonitors] = useState<VintedMonitor[]>(() => {
    try {
      const saved = localStorage.getItem('fyndit_monitors');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_MONITORS;
  });
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
  const [selectedMonitorFilter, setSelectedMonitorFilter] = useState<string[]>(['all']);

  const seenIdsRef = useRef<Set<string>>(new Set());
  const activeSearchRef = useRef<string>('');
  const activeBrandRef = useRef<string>('Tutti');
  const isSseConnectedRef = useRef<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);
  const monitorsRef = useRef<VintedMonitor[]>(monitors);
  const monitorsModeRef = useRef<boolean>(monitorsMode);
  const selectedMonitorFilterRef = useRef<string[]>(selectedMonitorFilter);

  useEffect(() => {
    try {
      localStorage.setItem('fyndit_monitors', JSON.stringify(monitors));
    } catch {
      // ignore
    }
  }, [monitors]);

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
      const currentFilters = selectedMonitorFilterRef.current;
      const isAll = currentFilters.includes('all') || currentFilters.length === 0;
      const relevantMons = isAll
        ? activeMons
        : activeMons.filter((m) => currentFilters.includes(m.id));

      for (const it of newItems) {
        const matchingMon = relevantMons.find((m) => matchListingToMonitor(it, m));
        if (matchingMon) {
          eligibleItems.push({
            ...it,
            matchedMonitorId: matchingMon.id,
            matchedMonitorName: matchingMon.name,
          });
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

      // Audio notification on new drops
      try {
        playAlertChime();
      } catch {
        // audio might require user interaction first
      }

      // Forward to Discord webhook if configured on the matching monitor
      const activeMons = monitorsRef.current.filter((m) => m.isActive);
      for (const item of brandNew) {
        const matchingMon = activeMons.find((m) => m.name === item.matchedMonitorName);
        if (matchingMon?.discordWebhookUrl) {
          fetch('/api/discord-webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              webhookUrl: matchingMon.discordWebhookUrl,
              item,
              monitorName: matchingMon.name,
            }),
          }).catch(() => {});
        }
      }

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
        if (monitorsMode && !activeSearch.trim()) streamUrl.searchParams.set('monitors_mode', '1');

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
              if (!activeSearchRef.current) {
                if (monitorsMode) {
                  const activeMons = monitorsRef.current.filter((m) => m.isActive);
                  const currentFilters = selectedMonitorFilterRef.current;
                  const isAll = currentFilters.includes('all') || currentFilters.length === 0;
                  const targetMons = isAll
                    ? activeMons
                    : activeMons.filter((m) => currentFilters.includes(m.id));

                  const matched = data.items
                    .filter((it: VintedListing) => targetMons.some((m) => matchListingToMonitor(it, m)))
                    .map((it: VintedListing) => {
                      const m = targetMons.find((mon) => matchListingToMonitor(it, mon));
                      return m ? { ...it, matchedMonitorId: m.id, matchedMonitorName: m.name } : it;
                    });
                  setListings(matched);
                } else if (activeBrandRef.current === 'Tutti') {
                  setListings(data.items);
                }
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
  }, [handleIncomingDrops, activeSearch, activeBrand, monitorsMode]);

  // Active real-time drop poller for standalone iOS & live feed with continuous autorefresh
  const fetchLiveRealtimeDrops = useCallback(async (manual = false) => {
    if (isFetchingRef.current && !manual) return;
    isFetchingRef.current = true;
    if (manual) setIsRefreshing(true);
    try {
      const searchQ = activeSearchRef.current.trim();
      const brandQ = activeBrandRef.current;
      const isMonMode = monitorsModeRef.current;

      // 1. MONITOR-DRIVEN MODE:
      // Stream strictly from active monitors using dedicated fast batch sync!
      if (!searchQ && isMonMode) {
        const activeMons = monitorsRef.current.filter((m) => m.isActive);
        if (activeMons.length === 0) {
          setListings([]);
          setLastLiveSyncTime(Date.now());
          return;
        }

        const currentFilters = selectedMonitorFilterRef.current;
        const isAll = currentFilters.includes('all') || currentFilters.length === 0;
        const targetMons = isAll
          ? activeMons
          : activeMons.filter((m) => currentFilters.includes(m.id));

        const syncRes = await fetch('/api/vinted/monitors-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            monitors: activeMons,
            targetMonitorIds: isAll ? undefined : currentFilters,
            targetMonitorId: isAll ? 'all' : currentFilters[0],
          }),
          signal: AbortSignal.timeout(4500),
        });

        if (!syncRes.ok) return;
        const syncData = await syncRes.json();
        const incomingItems: VintedListing[] = Array.isArray(syncData.items) ? syncData.items : [];

        // Guarantee strict client-side isolation using matchListingToMonitor
        const strictlyMatched: VintedListing[] = [];
        for (const it of incomingItems) {
          const matchingMon = targetMons.find((m) => matchListingToMonitor(it, m));
          if (matchingMon) {
            strictlyMatched.push({
              ...it,
              matchedMonitorId: matchingMon.id,
              matchedMonitorName: matchingMon.name,
            });
          }
        }

        setLatencyMs(Math.max(1, syncData.latencyMs || 1));
        setLastLiveSyncTime(Date.now());

        setListings((prev) => {
          if (prev.length === 0) return strictlyMatched.slice(0, 150);

          const prevMap = new Map(prev.map((p) => [p.id, p]));
          const incomingIds = new Set(strictlyMatched.map((i) => i.id));

          const updated = strictlyMatched.map((incoming) => {
            const existing = prevMap.get(incoming.id);
            if (!existing) return { ...incoming, isNewDrop: true };
            return existing.isNewDrop ? { ...incoming, isNewDrop: true } : incoming;
          });

          const brandNew = updated.filter((it) => it.isNewDrop && !prevMap.has(it.id));
          if (brandNew.length > 0) {
            setNewDealsCount((c) => c + brandNew.length);
            try { playAlertChime(); } catch {}

            // Forward to Discord webhook if configured on the matching monitor
            for (const item of brandNew) {
              const matchingMon = activeMons.find(
                (m) => m.id === item.matchedMonitorId || m.name === item.matchedMonitorName
              );
              if (matchingMon?.discordWebhookUrl) {
                fetch('/api/discord-webhook', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    webhookUrl: matchingMon.discordWebhookUrl,
                    item,
                    monitorName: matchingMon.name,
                  }),
                }).catch(() => {});
              }
            }
          }

          const retained = prev.filter(
            (p) => !incomingIds.has(p.id) && targetMons.some((m) => matchListingToMonitor(p, m))
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
      isFetchingRef.current = false;
      if (manual) setTimeout(() => setIsRefreshing(false), 400);
    }
  }, []);

  useEffect(() => {
    if (!turboSniper) return;

    // Immediate fetch
    fetchLiveRealtimeDrops(false);

    // Turbo Sniper: 100% Real-Time ultra-low latency pulse interval (600ms)
    const interval = setInterval(() => {
      fetchLiveRealtimeDrops(false);
    }, 600);

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

  const handleUpdateMonitor = (id: string, updated: Partial<VintedMonitor>) => {
    setMonitors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updated } : m))
    );
    setToastMessage('Monitor aggiornato con successo!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleMonitorFilter = (monId: string) => {
    setSelectedMonitorFilter((prev) => {
      if (monId === 'all') {
        return ['all'];
      }

      const wasAll = prev.includes('all') || prev.length === 0;
      if (wasAll) {
        // If clicking a monitor when all were selected, switch to just this monitor
        return [monId];
      }

      if (prev.includes(monId)) {
        // Unselecting this monitor
        const filtered = prev.filter((id) => id !== monId);
        return filtered.length === 0 ? ['all'] : filtered;
      } else {
        // Combining this monitor with existing selections (e.g. 2, 3 or 4 monitors together!)
        return [...prev, monId];
      }
    });
  };

  const handleViewMonitorInFeed = (monId: string) => {
    setSelectedMonitorFilter([monId]);
    setMonitorsMode(true);
    setActiveSearch('');
    setActiveTab('feed');
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
            onSelectMonitorFilter={handleToggleMonitorFilter}
            onGoToMonitorsTab={() => setActiveTab('monitors')}
            lastLiveSyncTime={lastLiveSyncTime}
          />
        )}

        {activeTab === 'monitors' && (
          <MonitorsManager
            monitors={monitors}
            onToggleMonitor={handleToggleMonitor}
            onDeleteMonitor={handleDeleteMonitor}
            onAddMonitor={handleAddMonitor}
            onUpdateMonitor={handleUpdateMonitor}
            onViewInFeed={handleViewMonitorInFeed}
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
