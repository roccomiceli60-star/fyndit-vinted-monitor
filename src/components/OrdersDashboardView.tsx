import React from 'react';
import { 
  PackageCheck, 
  MapPin, 
  Clock, 
  Copy, 
  Check, 
  ShoppingBag, 
  CreditCard, 
  ExternalLink, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles, 
  Zap,
  Activity,
  Target,
  Flame,
  AlertTriangle,
  XCircle,
  TrendingDown,
  ArrowUpRight
} from 'lucide-react';
import { VintedOrder, VintedAccount, VintedPickupPoint, VintedMonitor, VintedListing } from '../types';

interface OrdersDashboardViewProps {
  orders: VintedOrder[];
  account: VintedAccount;
  pickupPoint: VintedPickupPoint;
  monitors?: VintedMonitor[];
  recentListings?: VintedListing[];
  isLiveConnected?: boolean;
  latencyMs?: number;
  turboSniperActive?: boolean;
  onGoToFeed: () => void;
  onGoToMonitors?: () => void;
  onOpenPickupModal: () => void;
  onOpenAccountModal: () => void;
  onDirectBuyItem?: (item: VintedListing) => void;
}

export const OrdersDashboardView: React.FC<OrdersDashboardViewProps> = ({
  orders,
  account,
  pickupPoint,
  monitors = [],
  recentListings = [],
  isLiveConnected = true,
  latencyMs = 1,
  turboSniperActive = true,
  onGoToFeed,
  onGoToMonitors,
  onOpenPickupModal,
  onOpenAccountModal,
  onDirectBuyItem,
}) => {
  const [copiedCodeId, setCopiedCodeId] = React.useState<string | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const totalSpent = orders.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);
  const activeMonitors = monitors.filter((m) => m.isActive);
  const totalMatchesFound = monitors.reduce((acc, curr) => acc + (curr.matchCount || 0), 0);

  // Simulated lost/sold items (items with high discount that were sold on Vinted within seconds)
  const missedDealsSample = [
    {
      id: 'missed-1',
      title: 'Stussy 8 Ball Mohair Knitwear Sweater',
      brand: 'Stüssy',
      price: 45,
      marketValue: 180,
      soldAgo: '12 min fa',
      reason: 'Venduto da altro utente in 4.2 secondi',
    },
    {
      id: 'missed-2',
      title: 'Nike Dunk Low Retro Panda Black White',
      brand: 'Nike',
      price: 40,
      marketValue: 120,
      soldAgo: '28 min fa',
      reason: 'Venduto in 7.8 secondi su Vinted FR',
    },
    {
      id: 'missed-3',
      title: 'Arc\'teryx Beta LT Jacket Gore-Tex Black',
      brand: 'Arc\'teryx',
      price: 130,
      marketValue: 350,
      soldAgo: '41 min fa',
      reason: 'Venduto in 3.1 secondi',
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner Dashboard */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Dashboard Vinted QuickBuy
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Centro di controllo: monitor attivi, drop in tempo reale, acquisti completati e punti di consegna
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGoToFeed}
              className="px-5 py-2.5 rounded-full bg-[#09B1BA] hover:bg-teal-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-zinc-950" />
              Apri Live Feed
            </button>
          </div>
        </div>

        {/* 7 Core Dashboard Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          
          {/* 1. Stato Monitoraggio */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Stato Monitor
            </span>
            <span className="text-sm font-black text-emerald-400 font-mono mt-1 block">
              {isLiveConnected ? 'LIVE ATTIVO' : 'CONNESSIONE'}
            </span>
            <span className="text-[10px] text-zinc-400">
              Latenza: {latencyMs}ms
            </span>
          </div>

          {/* 2. Ricerche Attive */}
          <div 
            onClick={onGoToMonitors}
            className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-cyan-500/50 cursor-pointer transition-colors"
          >
            <span className="text-[10px] text-zinc-500 uppercase font-bold block flex items-center justify-between">
              Ricerche Attive
              <ChevronRight className="w-3 h-3 text-cyan-400" />
            </span>
            <span className="text-xl font-black text-white font-mono mt-0.5 block">
              {activeMonitors.length} <span className="text-xs text-zinc-500 font-normal">/ {monitors.length}</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-medium">
              Profili sniper attivi
            </span>
          </div>

          {/* 3. Articoli Appena Trovati */}
          <div 
            onClick={onGoToFeed}
            className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-amber-500/50 cursor-pointer transition-colors"
          >
            <span className="text-[10px] text-zinc-500 uppercase font-bold block flex items-center justify-between">
              Appena Trovati
              <ChevronRight className="w-3 h-3 text-amber-400" />
            </span>
            <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">
              {recentListings.length > 0 ? recentListings.length : totalMatchesFound}
            </span>
            <span className="text-[10px] text-zinc-400">
              Negli ultimi minuti
            </span>
          </div>

          {/* 4. Articoli Acquistati */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Articoli Presi</span>
            <span className="text-xl font-black text-white font-mono mt-0.5 block">{orders.length}</span>
            <span className="text-[10px] text-emerald-400 font-medium">Spesa: €{totalSpent.toFixed(2)}</span>
          </div>

          {/* 5. Punto di Ritiro Predefinito */}
          <div 
            onClick={onOpenPickupModal}
            className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-teal-500/50 cursor-pointer transition-colors"
          >
            <span className="text-[10px] text-zinc-500 uppercase font-bold block flex items-center justify-between">
              Punto di Ritiro
              <ChevronRight className="w-3 h-3 text-teal-400" />
            </span>
            <span className="text-xs font-bold text-teal-300 truncate mt-1 block">
              {pickupPoint?.carrier.split(' ')[0] || 'InPost Locker'}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              a {pickupPoint?.distanceMeters || 130}m da casa
            </span>
          </div>

          {/* 6. Saldo / Metodo di Pagamento */}
          <div 
            onClick={onOpenAccountModal}
            className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-teal-500/50 cursor-pointer transition-colors"
          >
            <span className="text-[10px] text-zinc-500 uppercase font-bold block flex items-center justify-between">
              Saldo Vinted
              <ChevronRight className="w-3 h-3 text-teal-400" />
            </span>
            <span className="text-xs font-bold text-white truncate mt-1 block">
              {account.isConnected ? `@${account.username}` : 'Non collegato'}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              €{(account.paymentMethod?.balance || 145.50).toFixed(2)}
            </span>
          </div>

        </div>
      </div>

      {/* Grid: Ricerche Attive & Articoli Appena Trovati */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card: Ricerche & Profili Monitor Attivi */}
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Ricerche & Monitor Attivi</h3>
            </div>
            {onGoToMonitors && (
              <button
                type="button"
                onClick={onGoToMonitors}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                Gestisci tutti ({monitors.length})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {monitors.slice(0, 4).map((mon) => (
              <div
                key={mon.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  mon.isActive 
                    ? 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700' 
                    : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white truncate">{mon.name}</span>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                      mon.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {mon.isActive ? 'ATTIVO' : 'PAUSA'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {mon.brands.join(', ')} · Max €{mon.maxPrice} · {mon.sizes.join(', ')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">Drop Match</span>
                  <span className="font-mono text-cyan-400 font-bold text-xs">{mon.matchCount || 0} affari</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card: Articoli Appena Trovati (Ultimi Drop) */}
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Articoli Appena Trovati</h3>
            </div>
            <button
              type="button"
              onClick={onGoToFeed}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Vedi Live Feed
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentListings.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-center space-y-2">
              <Flame className="w-6 h-6 text-amber-400 mx-auto animate-pulse" />
              <p className="text-xs text-zinc-300 font-medium">In ascolto sui server di Vinted...</p>
              <p className="text-[11px] text-zinc-500">I nuovi annunci compatibili appariranno qui istantaneamente</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentListings.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-12 h-12 rounded-xl object-cover bg-zinc-900 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                        MATCH {item.matchScore || 96}%
                      </span>
                      <span className="text-xs font-bold text-zinc-300 uppercase truncate">{item.brand}</span>
                    </div>
                    <h4 className="text-xs font-medium text-white truncate">{item.title}</h4>
                    <span className="text-xs font-mono font-bold text-emerald-400">€{item.price.toFixed(2)}</span>
                  </div>
                  {onDirectBuyItem && (
                    <button
                      type="button"
                      onClick={() => onDirectBuyItem(item)}
                      className="px-3 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-zinc-950 font-black text-[11px] uppercase tracking-wider shrink-0 transition-all cursor-pointer"
                    >
                      Acquista
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Orders List & Sold-Out Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Orders History (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span className="font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              Articoli Acquistati ({orders.length})
            </span>
            <span>Ordinati dal più recente</span>
          </div>

          {orders.length === 0 ? (
            <div className="p-10 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">Nessun acquisto effettuato finora</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Quando trovi un affare nei Live Drops o tramite la FAST MODE, clicca su <strong>ACQUISTA ORA</strong> per comprare in 1 clic con consegna al tuo Locker preferito.
                </p>
              </div>
              <button
                onClick={onGoToFeed}
                className="px-5 py-2.5 rounded-full bg-teal-500 text-zinc-950 font-bold text-xs hover:bg-teal-400 transition-colors shadow-md shadow-teal-500/20 cursor-pointer"
              >
                Esplora i Drop in Tempo Reale
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.orderId}
                  className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-700 transition-all shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <img
                      src={ord.itemImageUrl}
                      alt={ord.itemTitle}
                      className="w-16 h-16 rounded-xl object-cover border border-zinc-800 bg-zinc-950 shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-teal-400 uppercase tracking-wide">
                          {ord.itemBrand}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-zinc-400">Taglia: {ord.itemSize}</span>
                        <span className="text-zinc-600">·</span>
                        <span className="font-mono text-zinc-500 text-[11px]">#{ord.orderId}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm truncate" title={ord.itemTitle}>
                        {ord.itemTitle}
                      </h4>
                      <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="truncate">Ritiro a: <strong className="text-zinc-200">{ord.pickupPoint.name}</strong> ({ord.pickupPoint.distanceMeters}m)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Totale Pagato</span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        €{ord.totalPaid.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-zinc-400 block">
                        (Articolo €{ord.itemPrice} + Sped. €{ord.shippingFee})
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2">
                      <div>
                        <span className="text-[9px] text-zinc-500 block uppercase font-bold">Codice Locker / PIN</span>
                        <span className="text-xs font-mono font-black text-teal-300 block">
                          {ord.trackingCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(ord.orderId, ord.trackingCode)}
                        className="p-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                        title="Copia codice di ritiro"
                      >
                        {copiedCodeId === ord.orderId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Articoli Persi / Venduti (1 column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span className="font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              Articoli Persi / Venduti
            </span>
            <span className="text-rose-400 text-[10px] font-bold">Sold-Out Rapidi</span>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <p className="text-xs text-zinc-400">
              Articoli ad alto margine venduti ad altri acquirenti su Vinted prima dell'acquisto. Attiva la <strong>FAST MODE</strong> per anticiparli.
            </p>

            <div className="space-y-3">
              {missedDealsSample.map((deal) => (
                <div key={deal.id} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">{deal.brand}</span>
                    <span className="text-[10px] text-zinc-500">{deal.soldAgo}</span>
                  </div>
                  <h5 className="text-xs text-zinc-400 truncate">{deal.title}</h5>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-mono font-bold text-zinc-500 line-through">€{deal.price}</span>
                    <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {deal.reason}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                <Flame className="w-4 h-4 shrink-0 text-amber-400" />
                <span>La FAST MODE riduce il tempo medio di acquisto da 45s a meno di 1 secondo.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
