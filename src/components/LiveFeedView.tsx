import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  ExternalLink, 
  Zap, 
  Calculator, 
  TrendingUp, 
  RefreshCw, 
  Filter, 
  Search, 
  Check, 
  Clock, 
  Star, 
  Copy,
  Radio
} from 'lucide-react';
import { VintedListing } from '../types';
import { POPULAR_BRANDS } from '../data/brands';

interface LiveFeedViewProps {
  listings: VintedListing[];
  onOpenCalculatorWithItem: (item: VintedListing) => void;
  onAutocopItem: (item: VintedListing) => void;
  onFilterChange?: (search: string, brand: string) => void;
}

export const LiveFeedView: React.FC<LiveFeedViewProps> = ({
  listings,
  onOpenCalculatorWithItem,
  onAutocopItem,
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('Tutti');
  const [onlySteals, setOnlySteals] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (onFilterChange) onFilterChange(val, selectedBrand);
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    if (onFilterChange) onFilterChange(searchTerm, brand);
  };

  const filteredListings = listings.filter((item) => {
    if (onlySteals && item.dealScore !== 'STEAL') return false;
    if (item.price > maxPrice) return false;
    if (selectedBrand !== 'Tutti' && item.brand !== selectedBrand) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyLink = (item: VintedListing) => {
    navigator.clipboard.writeText(item.vintedUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Live Status */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-cyan-950/40 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Live Vinted Deal Radar</h2>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                In Ascolto (0.2s)
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Rileva automaticamente gli articoli appena pubblicati a prezzo di saldo su Vinted Europa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isLiveStreaming 
                ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' 
                : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveStreaming ? 'animate-spin text-cyan-400' : ''}`} />
            {isLiveStreaming ? 'Live Stream Attivo' : 'In Pausa'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cerca annunci reali Vinted (es. Trapstar, Dunk, Ralph Lauren, Corteiz)..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Steals Only Toggle */}
          <button
            onClick={() => setOnlySteals(!onlySteals)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              onlySteals 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20' 
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            <Flame className={`w-4 h-4 ${onlySteals ? 'text-amber-400 fill-amber-400' : ''}`} />
            Solo Super Affari (Steal)
          </button>
        </div>

        {/* Brand Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-zinc-500 font-medium whitespace-nowrap mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Brand:
          </span>
          <button
            onClick={() => handleBrandSelect('Tutti')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
              selectedBrand === 'Tutti' 
                ? 'bg-cyan-500 text-zinc-950 font-bold' 
                : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            Tutti
          </button>
          {POPULAR_BRANDS.slice(0, 10).map((brand) => (
            <button
              key={brand}
              onClick={() => handleBrandSelect(brand)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                selectedBrand === brand 
                  ? 'bg-cyan-500 text-zinc-950 font-bold' 
                  : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredListings.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl bg-zinc-900 border border-zinc-800/80 hover:border-cyan-500/50 transition-all duration-200 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-cyan-500/5"
          >
            {/* Image Header with Badges */}
            <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                {item.dealScore === 'STEAL' ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 text-xs font-black flex items-center gap-1 shadow-md shadow-amber-500/30">
                    <Flame className="w-3.5 h-3.5 fill-zinc-950" />
                    -{item.discountPercent}% STEAL
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-zinc-950 text-xs font-extrabold flex items-center gap-1 shadow-md">
                    <TrendingUp className="w-3 h-3" />
                    DEAL -{item.discountPercent}%
                  </span>
                )}
              </div>

              <div className="absolute top-2.5 right-2.5">
                <span className="px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur text-[11px] font-semibold text-zinc-300 border border-zinc-700/60 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {item.publishedSecondsAgo}s fa
                </span>
              </div>

              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-medium text-zinc-200 bg-zinc-950/75 backdrop-blur px-2.5 py-1 rounded-lg">
                <span className="truncate max-w-[120px]">{item.condition}</span>
                <span className="font-bold text-cyan-300">Taglia {item.size}</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span className="font-bold uppercase tracking-wider text-cyan-400">{item.brand}</span>
                  <span className="flex items-center gap-1">
                    {item.seller.countryFlag} {item.seller.username}
                    <span className="text-amber-400 font-bold flex items-center">
                      <Star className="w-3 h-3 fill-amber-400 inline" /> {item.seller.rating}
                    </span>
                  </span>
                </div>

                <h3 className="font-semibold text-zinc-100 text-sm line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
              </div>

              {/* Price & Market Value Row */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-500">Prezzo Vinted</div>
                  <div className="text-xl font-black text-emerald-400">
                    €{item.price.toFixed(2)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-zinc-500">Valore Stimato</div>
                  <div className="text-sm font-semibold text-zinc-400 line-through">
                    €{item.marketValue.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => onAutocopItem(item)}
                  className="w-full py-2 px-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 fill-zinc-950" />
                  Autocop
                </button>

                <button
                  onClick={() => onOpenCalculatorWithItem(item)}
                  className="w-full py-2 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                  Margine
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <button
                  onClick={() => handleCopyLink(item)}
                  className="hover:text-zinc-200 flex items-center gap-1 transition-colors"
                >
                  {copiedId === item.id ? (
                    <><Check className="w-3 h-3 text-emerald-400" /> Copiato!</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copia Link</>
                  )}
                </button>

                <a
                  href={item.vintedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
                >
                  Apri su Vinted <ExternalLink className="w-3 h-3" />
                </a>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
