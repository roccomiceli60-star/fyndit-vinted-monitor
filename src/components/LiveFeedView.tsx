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
  X,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  Tag,
  DollarSign
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

const CATEGORIES = [
  'Tutte le categorie',
  'Felpe & Maglioni',
  'Giacche & Cappotti',
  'Tute & Tracksuit',
  'Sneakers & Scarpe',
  'Pantaloni & Cargo',
  'T-shirt & Polo',
  'Accessori & Borse',
];

const SIZES = ['Tutte', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45'];

const CONDITIONS = [
  'Tutte le condizioni',
  'Nuovo con cartellino',
  'Nuovo senza cartellino',
  'Ottime condizioni',
  'Buone condizioni',
];

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
  const [selectedCategory, setSelectedCategory] = useState<string>('Tutte le categorie');
  const [selectedSize, setSelectedSize] = useState<string>('Tutte');
  const [selectedCondition, setSelectedCondition] = useState<string>('Tutte le condizioni');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onlySteals, setOnlySteals] = useState(false);
  const [onlyRecentDrops, setOnlyRecentDrops] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const formatTimeAgo = (seconds: number): string => {
    if (seconds <= 40) return 'Appena messo!';
    if (seconds < 60) return `${seconds}s fa`;
    const mins = Math.floor(seconds / 60);
    return `${mins} min fa`;
  };

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    setSelectedBrand(currentBrand);
  }, [currentBrand]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveDropdown(null);
    onFilterChange(searchInput.trim(), selectedBrand);
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setActiveDropdown(null);
    onFilterChange(searchInput.trim(), brand);
  };

  const handleClearAll = () => {
    setSearchInput('');
    setSelectedBrand('Tutti');
    setSelectedCategory('Tutte le categorie');
    setSelectedSize('Tutte');
    setSelectedCondition('Tutte le condizioni');
    setMinPrice('');
    setMaxPrice('');
    setOnlySteals(false);
    setActiveDropdown(null);
    onFilterChange('', 'Tutti');
  };

  const handleCopyLink = (item: VintedListing) => {
    navigator.clipboard.writeText(item.vintedUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Client-side refined filtering (only for secondary criteria)
  const displayedListings = listings.filter((item) => {
    if (onlySteals && item.dealScore !== 'STEAL') return false;
    // Exclude old listings (> 20 minutes) if onlyRecentDrops is active
    if (onlyRecentDrops && item.publishedSecondsAgo > 1200) return false;
    
    // Category match
    if (selectedCategory !== 'Tutte le categorie') {
      const cat = selectedCategory.toLowerCase();
      const text = `${item.title} ${item.category}`.toLowerCase();
      if (cat.includes('felpe') && !text.includes('felpa') && !text.includes('hoodie') && !text.includes('sweat')) return false;
      if (cat.includes('giacche') && !text.includes('giacca') && !text.includes('jacket') && !text.includes('puffer') && !text.includes('coat')) return false;
      if (cat.includes('tute') && !text.includes('tuta') && !text.includes('tracksuit')) return false;
      if (cat.includes('sneakers') && !text.includes('scarpe') && !text.includes('dunk') && !text.includes('jordan') && !text.includes('sneaker')) return false;
      if (cat.includes('pantaloni') && !text.includes('pantal') && !text.includes('cargo') && !text.includes('jean')) return false;
    }

    // Size match
    if (selectedSize !== 'Tutte') {
      if (!item.size.toLowerCase().includes(selectedSize.toLowerCase())) return false;
    }

    // Condition match
    if (selectedCondition !== 'Tutte le condizioni') {
      if (!item.condition.toLowerCase().includes(selectedCondition.toLowerCase().substring(0, 5))) return false;
    }

    // Price range
    const minP = parseFloat(minPrice);
    if (!isNaN(minP) && minP > 0 && item.price < minP) return false;
    const maxP = parseFloat(maxPrice);
    if (!isNaN(maxP) && maxP > 0 && item.price > maxP) return false;

    return true;
  });

  const hasActiveFilters = Boolean(
    searchInput.trim() ||
    selectedBrand !== 'Tutti' ||
    selectedCategory !== 'Tutte le categorie' ||
    selectedSize !== 'Tutte' ||
    selectedCondition !== 'Tutte le condizioni' ||
    minPrice ||
    maxPrice ||
    onlySteals
  );

  return (
    <div className="space-y-5">
      
      {/* VINTED-STYLE SEARCH & FILTER HEADER */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        
        {/* Main Search Input: Authentic Vinted Search Box */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-teal-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cerca articoli appena pubblicati (es. Trapstar, Dunk, Corteiz, Ralph Lauren, Stone Island)..."
              className="w-full pl-12 pr-10 py-3.5 bg-zinc-950/90 border border-zinc-700/80 hover:border-teal-500/60 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 rounded-full text-sm text-zinc-100 placeholder-zinc-500 transition-all font-medium"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  onFilterChange('', selectedBrand);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="ml-2.5 px-6 py-3.5 bg-[#09B1BA] hover:bg-[#0799a1] active:scale-95 text-zinc-950 font-black text-sm rounded-full transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20 cursor-pointer whitespace-nowrap"
          >
            <Search className="w-4 h-4 stroke-[3]" />
            Cerca su Vinted
          </button>
        </form>

        {/* Vinted-Style Filter Chips Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          
          {/* Ordina Per (FISSO: Appena Pubblicati) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-950/60 border border-teal-500/50 text-teal-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span>Ordina: Più Recenti (Appena pubblicati)</span>
          </div>

          {/* Brand Filter Pill with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'brand' ? null : 'brand')}
              className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
                selectedBrand !== 'Tutti'
                  ? 'bg-teal-500 text-zinc-950 border-teal-400'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Brand: {selectedBrand}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {activeDropdown === 'brand' && (
              <div className="absolute left-0 top-9 z-30 w-64 p-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-h-72 overflow-y-auto space-y-1">
                <button
                  type="button"
                  onClick={() => handleBrandSelect('Tutti')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                    selectedBrand === 'Tutti' ? 'bg-teal-500 text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  Tutti i Brand
                </button>
                {POPULAR_BRANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleBrandSelect(b)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                      selectedBrand === b ? 'bg-teal-500 text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Categoria Filter Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'cat' ? null : 'cat')}
              className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
                selectedCategory !== 'Tutte le categorie'
                  ? 'bg-teal-500 text-zinc-950 border-teal-400'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <span>{selectedCategory}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {activeDropdown === 'cat' && (
              <div className="absolute left-0 top-9 z-30 w-56 p-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl space-y-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(c);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                      selectedCategory === c ? 'bg-teal-500 text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Taglia Filter Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'size' ? null : 'size')}
              className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
                selectedSize !== 'Tutte'
                  ? 'bg-teal-500 text-zinc-950 border-teal-400'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <span>Taglia: {selectedSize}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {activeDropdown === 'size' && (
              <div className="absolute left-0 top-9 z-30 w-48 p-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl grid grid-cols-3 gap-1">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSelectedSize(s);
                      setActiveDropdown(null);
                    }}
                    className={`p-2 rounded-lg text-center text-xs font-semibold ${
                      selectedSize === s ? 'bg-teal-500 text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Condizioni Filter Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'cond' ? null : 'cond')}
              className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
                selectedCondition !== 'Tutte le condizioni'
                  ? 'bg-teal-500 text-zinc-950 border-teal-400'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <span>Condizione: {selectedCondition}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {activeDropdown === 'cond' && (
              <div className="absolute left-0 top-9 z-30 w-56 p-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl space-y-1">
                {CONDITIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedCondition(c);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                      selectedCondition === c ? 'bg-teal-500 text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Prezzo Filter Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
              className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
                minPrice || maxPrice
                  ? 'bg-teal-500 text-zinc-950 border-teal-400'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Prezzo {minPrice || maxPrice ? `(€${minPrice || '0'} - €${maxPrice || '∞'})` : ''}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {activeDropdown === 'price' && (
              <div className="absolute left-0 top-9 z-30 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Da €</label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">A €</label>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(null)}
                  className="w-full py-1.5 bg-teal-500 text-zinc-950 font-bold rounded-lg text-xs"
                >
                  Applica Prezzo
                </button>
              </div>
            )}
          </div>

          {/* Steals Only Toggle */}
          <button
            type="button"
            onClick={() => setOnlySteals(!onlySteals)}
            className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
              onlySteals
                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${onlySteals ? 'fill-zinc-950' : 'text-amber-400'}`} />
            <span>Solo Affari (Steal)</span>
          </button>

          {/* Only Fresh Drops (< 20 min) Toggle */}
          <button
            type="button"
            onClick={() => setOnlyRecentDrops(!onlyRecentDrops)}
            className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
              onlyRecentDrops
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                : 'bg-zinc-950 text-zinc-400 border-zinc-700 hover:border-zinc-500'
            }`}
            title="Nasconde categoricamente qualsiasi articolo inserito ore o giorni fa"
          >
            <span className={`w-2 h-2 rounded-full ${onlyRecentDrops ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
            <span>Solo Appena Pubblicati (&lt; 20 min)</span>
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              Azzera tutto
            </button>
          )}
        </div>

        {/* Quick Brand Badges (Vinted Popolari) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs pt-1 border-t border-zinc-800/80">
          <span className="text-zinc-500 font-medium whitespace-nowrap mr-1">Brand hot:</span>
          {['Trapstar', 'Corteiz', 'Nike', 'Ralph Lauren', 'Stone Island', 'Carhartt', 'Stüssy', 'Jordan'].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => handleBrandSelect(b)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors text-[11px] font-semibold ${
                selectedBrand.toLowerCase() === b.toLowerCase()
                  ? 'bg-teal-500 text-zinc-950'
                  : 'bg-zinc-950/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

      </div>

      {/* Active Search & Drop Summary Banner */}
      <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 px-1 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-200">
            {displayedListings.length} articoli trovati
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Ordinati per pubblicazione più recente (Vinted Live)
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-teal-400 hover:text-teal-300 font-semibold underline"
          >
            Ripristina tutti i nuovi arrivi generali
          </button>
        )}
      </div>

      {/* Empty State */}
      {displayedListings.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-400">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-200">
              Nessun articolo trovato con questi criteri
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Gli annunci su Vinted vengono inseriti ogni secondo. Prova a cercare parole chiave più ampie o ad azzerare i filtri di prezzo e taglia.
            </p>
          </div>
          <button
            onClick={handleClearAll}
            className="px-5 py-2.5 rounded-full bg-[#09B1BA] text-zinc-950 font-bold text-xs hover:bg-teal-400 transition-colors"
          >
            Azzera Filtri e Mostra Tutti
          </button>
        </div>
      )}

      {/* Listings Grid: Enhanced Vinted Card with Realistic Market Valuation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedListings.map((item) => (
          <div
            key={item.id}
            className={`group rounded-2xl bg-zinc-900 border transition-all duration-200 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-teal-500/10 ${
              item.isNewDrop 
                ? 'border-emerald-500/90 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-500/15' 
                : 'border-zinc-800/80 hover:border-teal-500/50'
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

              {/* Deal Score / Discount Tag */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                {item.isNewDrop && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-400 text-zinc-950 text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-md">
                    <Zap className="w-3 h-3 fill-zinc-950" /> APPENA PUBBLICATO
                  </span>
                )}
                {item.dealScore === 'STEAL' ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 text-xs font-black flex items-center gap-1 shadow-md shadow-amber-500/30">
                    <Flame className="w-3.5 h-3.5 fill-zinc-950" />
                    -{item.discountPercent}% SUPER STEAL
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-teal-400 text-zinc-950 text-xs font-extrabold flex items-center gap-1 shadow-md">
                    <TrendingUp className="w-3 h-3" />
                    -{item.discountPercent}% DEAL
                  </span>
                )}
              </div>

              {/* Publication Timestamp Badge */}
              <div className="absolute top-2.5 right-2.5">
                <span className="px-2 py-0.5 rounded-md bg-zinc-950/85 backdrop-blur text-[11px] font-semibold text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(item.publishedSecondsAgo)}
                </span>
              </div>

              {/* Condition & Size pill */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-medium text-zinc-200 bg-zinc-950/80 backdrop-blur px-2.5 py-1 rounded-lg border border-zinc-800/60">
                <span className="truncate max-w-[130px]">{item.condition}</span>
                <span className="font-bold text-teal-300">Taglia {item.size}</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span className="font-extrabold uppercase tracking-wider text-teal-400">{item.brand}</span>
                  <span className="flex items-center gap-1 text-[11px]">
                    {item.seller.countryFlag} {item.seller.username}
                    <span className="text-amber-400 font-bold flex items-center">
                      <Star className="w-3 h-3 fill-amber-400 inline" /> {item.seller.rating}
                    </span>
                  </span>
                </div>

                <h3 className="font-semibold text-zinc-100 text-sm line-clamp-2 leading-snug group-hover:text-teal-300 transition-colors">
                  {item.title}
                </h3>
              </div>

              {/* ENHANCED MARKET VALUE & RESELL MARGIN BOX */}
              <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/90 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-500">Prezzo Vinted</div>
                    <div className="text-xl font-black text-emerald-400">
                      €{item.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-zinc-500">Valore di Mercato</div>
                    <div className="text-sm font-bold text-zinc-300 line-through">
                      €{item.marketValue.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Resell Profit Breakdown */}
                <div className="pt-1 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 text-[11px]">Margine Potenziale:</span>
                  <span className="font-black text-emerald-400 font-mono">
                    +€{(item.potentialProfit !== undefined ? item.potentialProfit : Math.max(0, item.marketValue - item.price - 2)).toFixed(2)}
                  </span>
                </div>

                {item.resellNotes && (
                  <div className="text-[10px] text-zinc-400 line-clamp-1 italic pt-0.5">
                    💡 {item.resellNotes}
                  </div>
                )}
              </div>

              {/* FAST BUY ACTION BUTTONS */}
              <div className="space-y-1.5 pt-1">
                <a
                  href={item.vintedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#09B1BA] hover:bg-[#0799a1] text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-teal-500/20 active:scale-95 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-zinc-950 animate-bounce" />
                  ⚡ COMPRA SUBITO SU VINTED
                </a>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => onAutocopItem(item)}
                    className="py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-teal-300 font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
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

              {/* Bottom Card Bar */}
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
                  className="hover:text-teal-400 flex items-center gap-1 transition-colors font-medium"
                >
                  Vedi su Vinted <ExternalLink className="w-3 h-3" />
                </a>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
