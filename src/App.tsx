import React, { useState, useEffect } from 'react';
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

  // Simulated live feed incoming drops every 14 seconds
  useEffect(() => {
    const sampleIncomingDeals: Partial<VintedListing>[] = [
      {
        title: 'Trapstar Hyperdrive Puffer Jacket Nero S',
        brand: 'Trapstar',
        category: 'Giacche',
        size: 'S',
        condition: 'Nuovo con cartellino',
        price: 75,
        marketValue: 220,
        discountPercent: 66,
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
        dealScore: 'STEAL',
        seller: { username: 'milan_drip_shop', rating: 5.0, reviewCount: 54, country: 'Italia', countryFlag: '🇮🇹' },
      },
      {
        title: 'Nike Air Max Plus TN Triple Black 43',
        brand: 'Nike',
        category: 'Sneakers',
        size: 'EU 43',
        condition: 'Ottime condizioni',
        price: 45,
        marketValue: 130,
        discountPercent: 65,
        imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
        dealScore: 'STEAL',
        seller: { username: 'paris_sneaker_lab', rating: 4.8, reviewCount: 110, country: 'Francia', countryFlag: '🇫🇷' },
      },
      {
        title: 'Corteiz Guerillaz Cargo Pants Black M',
        brand: 'Corteiz',
        category: 'Pantaloni',
        size: 'M',
        condition: 'Nuovo con cartellino',
        price: 50,
        marketValue: 150,
        discountPercent: 67,
        imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80',
        dealScore: 'STEAL',
        seller: { username: 'rome_reseller_hub', rating: 4.9, reviewCount: 82, country: 'Italia', countryFlag: '🇮🇹' },
      }
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index >= sampleIncomingDeals.length) return;
      const sample = sampleIncomingDeals[index];
      const newItem: VintedListing = {
        id: `vnt-live-${Date.now()}`,
        title: sample.title!,
        brand: sample.brand!,
        category: sample.category!,
        size: sample.size!,
        condition: sample.condition!,
        price: sample.price!,
        marketValue: sample.marketValue!,
        discountPercent: sample.discountPercent!,
        imageUrl: sample.imageUrl!,
        dealScore: sample.dealScore!,
        seller: sample.seller!,
        vintedUrl: 'https://www.vinted.it',
        publishedSecondsAgo: 2,
        likesCount: 1,
      };

      setListings((prev) => [newItem, ...prev]);
      setNewDealsCount((c) => c + 1);
      index++;
    }, 14000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenCalculatorWithItem = (item: VintedListing) => {
    setCalculatorItem(item);
    setActiveTab('calculator');
  };

  const handleAutocopItem = (item: VintedListing) => {
    setToastMessage(`⚡ Autocop avviato per "${item.title}" a €${item.price}!`);
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'feed' && (
          <LiveFeedView
            listings={listings}
            onOpenCalculatorWithItem={handleOpenCalculatorWithItem}
            onAutocopItem={handleAutocopItem}
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
          <p>© 2026 Fyndit - Monitor e Sniper Vinted. Non affiliato con Vinted UAB.</p>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Vinted EU API: Operativa
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
