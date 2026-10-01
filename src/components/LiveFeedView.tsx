import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  ExternalLink, 
  Zap, 
  Calculator, 
  TrendingUp, 
  RefreshCw, 
  Search, 
  Check, 
  Clock, 
  Star, 
  Copy,
  Radio,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { VintedListing } from '../types';
import { POPULAR_BRANDS } from '../data/brands';

interface LiveFeedViewProps {
  listings: VintedListing[];
  onOpenCalculatorWithItem: (item: VintedListing) => void;
  onAutocopItem: (item: VintedListing) => void;
  onFilterChange: (search: string, brand: string) => void;
  currentSearch?: string;
  currentBrand?: string;
}

export const LiveFeedView: React.FC<LiveFeedViewProps> = ({
  listings,
  onOpenCalculatorWithItem,
  onAutocopItem,
  onFilterChange,
  currentSearch = '',
  currentBrand = 'Tutti',
}) => {
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [selectedBrand, setSelectedBrand] = useState<string>(currentBrand);
  const [onlySteals, setOnlySteals] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Sync external search input if changed
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    setSelectedBrand(currentBrand);
  }, [currentBrand]);

  // Handle Search Submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onFilterChange(searchInput.trim(), selectedBrand);
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    onFilterChange(searchInput.trim(), brand);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSelectedBrand('Tutti');
    setOnlySteals(false);
    setMaxPrice(500);
    onFilterChange('', 'Tutti');
  };

  const handleCopyLink = (item: VintedListing) => {
    navigator.clipboard.writeText(item.vintedUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter listings based on user criteria
  const displayedListings = listings.filter((item) => {
    if (onlySteals && item.dealScore !== 'STEAL' && item.discountPercent < 50) return false;
    if (showPriceFilter && item.price > maxPrice) return false;
    return true;
  });

  const isFiltered = Boolean(searchInput.trim() || selectedBrand !== 'Tutti' || onlySteals || (showPriceFilter && maxPrice < 500));

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
              <h2 className="text-lg font-bold text-white">Live Vinted Sniper Feed</h2>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Aggiornamento Istantaneo
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cerca qualsiasi articolo reale su Vinted o monitora i nuovi arrivi a prezzo stracciato
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {isFiltered && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Azzera Ricerca
            </button>
          )}

          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isLiveStreaming 
                ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' 
                : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveStreaming ? 'animate-spin text-cyan-400' : ''}`} />
            {isLiveStreaming ? 'Stream Attivo' : 'In Pausa'}
          </button>
        </div>
      </div>

      {/* High-Precision Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/90 space-y-3.5 shadow-lg">
        
        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Cerca qualsiasi articolo reale su Vinted (es. felpa, trapstar, nike dunk, giacca corteiz, ralph lauren)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-9 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  onFilterChange('', selectedBrand);
                }}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
          >
            <Search className="w-4 h-4" />
            Cerca su Vinted
          </button>

          {/* Steals Only Toggle */}
          <button
            type="button"
            onClick={() => setOnlySteals(!onlySteals)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
              onlySteals 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20' 
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            <Flame className={`w-4 h-4 ${onlySteals ? 'text-amber-400 fill-amber-400' : ''}`} />
            Solo Affari (Steal)
          </button>

          {/* Price Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowPriceFilter(!showPriceFilter)}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
              showPriceFilter
                ? 'bg-zinc-800 text-cyan-300 border-cyan-500/40'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Max €
          </button>
        </form>

        {/* Expandable Max Price Slider */}
        {showPriceFilter && (
          <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-lg flex items-center gap-4 text-xs">
            <span className="text-zinc-400 font-medium">Prezzo massimo:</span>
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="flex-1 accent-cyan-500 cursor-pointer"
            />
            <span className="font-bold text-cyan-400 font-mono w-16 text-right">
              €{maxPrice}
            </span>
            <button
              onClick={() => setShowPriceFilter(false)}
              className="text-zinc-500 hover:text-zinc-300 text-[11px]"
            >
              Rimuovi limite
            </button>
          </div>
        )}

        {/* Brand Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs pt-1">
          <span className="text-zinc-500 font-medium whitespace-nowrap mr-1">
            Brand veloci:
          </span>
          <button
            type="button"
            onClick={() => handleBrandSelect('Tutti')}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
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
              type="button"
              onClick={() => handleBrandSelect(brand)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                selectedBrand === brand 
                  ? 'bg-cyan-500 text-zinc-950 font-bold' 
                  : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* Active Search Summary */}
        {isFiltered && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/60 text-zinc-400">
            <div>
              <span>Risultati per: </span>
              {searchInput && <span className="font-bold text-white mr-2">"{searchInput}"</span>}
              {selectedBrand !== 'Tutti' && (
                <span className="bg-zinc-800 px-2 py-0.5 rounded text-cyan-300 font-semibold mr-2">
                  Brand: {selectedBrand}
                </span>
              )}
              {onlySteals && <span className="text-amber-400 font-semibold mr-2">• Solo Affari</span>}
              <span className="text-zinc-500">({displayedListings.length} articoli trovati)</span>
            </div>
            <button
              onClick={handleClearFilters}
              className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px]"
            >
              Mostra tutti i nuovi arrivi
            </button>
          </div>
        )}
      </div>

      {/* Empty State if No Listings Found */}
      {displayedListings.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-400">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-200">
              Nessun articolo trovato per questa ricerca
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Prova a cercare termini più generici come <span className="text-cyan-300 font-medium">"felpa"</span>, <span className="text-cyan-300 font-medium">"nike"</span>, <span className="text-cyan-300 font-medium">"trapstar"</span>, <span className="text-cyan-300 font-medium">"tuta"</span> oppure azzera i filtri.
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-zinc-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
          >
            Azzera Filtri e Mostra Tutti
          </button>
        </div>
      )}

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedListings.map((item) => (
          <div
            key={item.id}
            className={`group rounded-2xl bg-zinc-900 border transition-all duration-200 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-cyan-500/5 ${
              item.isNewDrop 
                ? 'border-emerald-500/90 ring-2 ring-emerald-500/50 shadow-xl shadow-emerald-500/20' 
                : 'border-zinc-800/80 hover:border-cyan-500/50'
            }`}
          >
            {/* Image Header with Badges */}
            <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                {item.isNewDrop && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-400 text-zinc-950 text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-md">
                    <Zap className="w-3 h-3 fill-zinc-950" /> APPENA USCITO
                  </span>
                )}
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
                  {item.publishedSecondsAgo <= 2 ? 'Istanti fa' : `${item.publishedSecondsAgo}s fa`}
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

              {/* ULTRA-FAST 1-CLICK BUY BUTTONS */}
              <div className="space-y-1.5 pt-1">
                <a
                  href={item.vintedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/25 active:scale-95 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-zinc-950 animate-bounce" />
                  ⚡ COMPRA SUBITO SU VINTED
                </a>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => onAutocopItem(item)}
                    className="py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <span>🎯</span> Sniper Bot
                  </button>

                  <button
                    onClick={() => onOpenCalculatorWithItem(item)}
                    className="py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                    Margine
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <button
                  onClick={() => handleCopyLink(item)}
                  className="hover:text-zinc-200 flex items-center gap-1 transition-colors"
                >
                  {copiedId === item.id ? (
                    <><Check className="w-3 h-3 text-emerald-400" /> Copiato!</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copia Link Vinted</>
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
