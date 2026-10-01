import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Flame, 
  ExternalLink, 
  Zap, 
  TrendingUp, 
  Search, 
  Check, 
  Clock, 
  Star, 
  Copy,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  DollarSign,
  Tag,
  Palette,
  Shirt,
  Sparkles,
  Gamepad2,
  Baby,
  Home,
  Cat,
  Layers,
  CheckCircle2,
  ArrowUpDown,
  LayoutGrid,
  Rows,
  RefreshCw
} from 'lucide-react';
import { VintedListing } from '../types';
import { 
  POPULAR_BRANDS, 
  CLOTHING_SIZES, 
  SHOE_SIZES, 
  VINTED_CONDITIONS, 
  VINTED_COLORS, 
  VINTED_SORT_OPTIONS 
} from '../data/brands';
import { VINTED_CATEGORIES, VintedCategory, VintedSubcategory } from '../data/vintedCategories';

interface LiveFeedViewProps {
  listings: VintedListing[];
  onAutocopItem: (item: VintedListing) => void;
  onFilterChange: (search: string, brand: string) => void;
  currentSearch?: string;
  currentBrand?: string;
  autoRefreshEnabled?: boolean;
  onToggleAutoRefresh?: () => void;
  onManualRefresh?: () => void;
  isRefreshing?: boolean;
}

export const LiveFeedView: React.FC<LiveFeedViewProps> = ({
  listings,
  onAutocopItem,
  onFilterChange,
  currentSearch = '',
  currentBrand = 'Tutti',
  autoRefreshEnabled = true,
  onToggleAutoRefresh,
  onManualRefresh,
  isRefreshing = false,
}) => {
  // Grid layout mode: '2' = 2 per row on iPhone/mobile, '1' = 1 per row
  const [gridColumns, setGridColumns] = useState<'1' | '2'>('2');

  // Search state
  const [searchInput, setSearchInput] = useState(currentSearch);
  
  // Vinted Official Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [categoryViewLevel, setCategoryViewLevel] = useState<'main' | 'sub'>('main');
  const [activeParentCat, setActiveParentCat] = useState<VintedCategory | null>(null);

  // Multi-brand selection
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    currentBrand && currentBrand !== 'Tutti' ? [currentBrand] : []
  );
  const [brandSearchQuery, setBrandSearchQuery] = useState('');

  // Sizes & Conditions
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sizeTab, setSizeTab] = useState<'clothing' | 'shoes'>('clothing');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  // Colors
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Price range
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Sort by
  const [sortBy, setSortBy] = useState<string>('newest');

  // Price & Freshness Quick Filters
  const [underFifty, setUnderFifty] = useState<boolean>(false);
  const [onlyRecentDrops, setOnlyRecentDrops] = useState<boolean>(true);

  // Active Dropdown / Modal
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showFullFilterModal, setShowFullFilterModal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Real-time automatic search & filter synchronization (debounced to avoid request thrashing)
  useEffect(() => {
    const timer = setTimeout(() => {
      const primaryBrand = selectedBrands.length === 1 ? selectedBrands[0] : (selectedBrands.length > 1 ? selectedBrands.join(' ') : 'Tutti');
      // Only trigger if values differ from currently active props
      if (searchInput.trim() !== currentSearch || primaryBrand !== currentBrand) {
        onFilterChange(searchInput.trim(), primaryBrand);
      }
    }, 260);
    return () => clearTimeout(timer);
  }, [searchInput, selectedBrands, currentSearch, currentBrand, onFilterChange]);

  useEffect(() => {
    if (currentBrand && currentBrand !== 'Tutti') {
      setSelectedBrands([currentBrand]);
    } else {
      setSelectedBrands([]);
    }
  }, [currentBrand]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimeAgo = (seconds: number): string => {
    if (seconds <= 40) return 'Appena messo!';
    if (seconds < 60) return `${seconds}s fa`;
    const mins = Math.floor(seconds / 60);
    return `${mins} min fa`;
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveDropdown(null);
    const primaryBrand = selectedBrands.length === 1 ? selectedBrands[0] : 'Tutti';
    onFilterChange(searchInput.trim(), primaryBrand);
  };

  const handleToggleBrand = (brandName: string) => {
    let next: string[];
    if (selectedBrands.includes(brandName)) {
      next = selectedBrands.filter((b) => b !== brandName);
    } else {
      next = [...selectedBrands, brandName];
    }
    setSelectedBrands(next);
    const primaryBrand = next.length === 1 ? next[0] : 'Tutti';
    onFilterChange(searchInput.trim(), primaryBrand);
  };

  const handleToggleSize = (size: string) => {
    if (size === 'Tutte') {
      setSelectedSizes([]);
      return;
    }
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleToggleCondition = (condName: string) => {
    if (selectedConditions.includes(condName)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== condName));
    } else {
      setSelectedConditions([...selectedConditions, condName]);
    }
  };

  const handleToggleColor = (colorName: string) => {
    if (selectedColors.includes(colorName)) {
      setSelectedColors(selectedColors.filter((c) => c !== colorName));
    } else {
      setSelectedColors([...selectedColors, colorName]);
    }
  };

  const handleSelectCategory = (cat: VintedCategory) => {
    if (cat.id === 'all') {
      setSelectedCategory('all');
      setSelectedSubcategory(null);
      setActiveDropdown(null);
      setCategoryViewLevel('main');
      return;
    }
    setActiveParentCat(cat);
    setCategoryViewLevel('sub');
  };

  const handleSelectSubcategory = (catId: string, sub: VintedSubcategory | null) => {
    setSelectedCategory(catId);
    setSelectedSubcategory(sub ? sub.name : null);
    setActiveDropdown(null);
    setCategoryViewLevel('main');
  };

  const handleClearAll = () => {
    setSearchInput('');
    setSelectedCategory('all');
    setSelectedSubcategory(null);
    setSelectedBrands([]);
    setBrandSearchQuery('');
    setSelectedSizes([]);
    setSelectedConditions([]);
    setSelectedColors([]);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setUnderFifty(false);
    setActiveDropdown(null);
    setCategoryViewLevel('main');
    onFilterChange('', 'Tutti');
  };

  const handleCopyLink = (item: VintedListing) => {
    navigator.clipboard.writeText(item.vintedUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper for category icons
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shirt': return <Shirt className="w-4 h-4 text-cyan-400" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-pink-400" />;
      case 'Gamepad2': return <Gamepad2 className="w-4 h-4 text-purple-400" />;
      case 'Baby': return <Baby className="w-4 h-4 text-amber-400" />;
      case 'Home': return <Home className="w-4 h-4 text-emerald-400" />;
      case 'Cat': return <Cat className="w-4 h-4 text-orange-400" />;
      default: return <Layers className="w-4 h-4 text-teal-400" />;
    }
  };

  // Filtered brands for brand dropdown search
  const filteredBrandList = useMemo(() => {
    if (!brandSearchQuery.trim()) return POPULAR_BRANDS;
    const q = brandSearchQuery.toLowerCase().trim();
    return POPULAR_BRANDS.filter((b) => b.toLowerCase().includes(q));
  }, [brandSearchQuery]);

  // Client-side refined filtering (1 to 1 with Vinted parameters)
  const displayedListings = useMemo(() => {
    return listings
      .filter((item) => {
        // Under 50€ price filter
        if (underFifty && item.price > 50) return false;

        // Freshness filter (under 20 minutes)
        if (onlyRecentDrops && item.publishedSecondsAgo > 1200) return false;

        // Search text filter
        if (searchInput.trim()) {
          const q = searchInput.toLowerCase().trim();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchBrand = item.brand.toLowerCase().includes(q);
          const matchCategory = item.category.toLowerCase().includes(q);
          if (!matchTitle && !matchBrand && !matchCategory) return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          const itemCat = item.category.toLowerCase();
          const itemTitle = item.title.toLowerCase();
          const targetParent = VINTED_CATEGORIES.find((c) => c.id === selectedCategory);
          
          if (targetParent) {
            // Check if matches subcategory if specified
            if (selectedSubcategory) {
              const subObj = targetParent.subcategories.find((s) => s.name === selectedSubcategory);
              if (subObj && subObj.keywords.length > 0) {
                const matchKeyword = subObj.keywords.some((kw) => 
                  itemTitle.includes(kw) || itemCat.includes(kw) || item.brand.toLowerCase().includes(kw)
                );
                if (!matchKeyword && !itemCat.includes(selectedSubcategory.toLowerCase())) {
                  return false;
                }
              }
            } else {
              // Parent category check
              const parentKw = targetParent.name.toLowerCase();
              if (!itemCat.includes(parentKw) && !itemCat.includes(selectedCategory)) {
                // fallback check on keywords
                const anySubMatch = targetParent.subcategories.some((s) =>
                  s.keywords.some((kw) => itemTitle.includes(kw) || itemCat.includes(kw))
                );
                if (!anySubMatch) return false;
              }
            }
          }
        }

        // Multi-brand filter
        if (selectedBrands.length > 0) {
          const itemBrand = item.brand.toLowerCase();
          const matchAnyBrand = selectedBrands.some((b) => itemBrand.includes(b.toLowerCase()));
          if (!matchAnyBrand) return false;
        }

        // Size filter
        if (selectedSizes.length > 0) {
          const itemSize = item.size.toLowerCase();
          const matchSize = selectedSizes.some((s) => {
            const clean = s.split('/')[0].trim().toLowerCase();
            return itemSize.includes(clean);
          });
          if (!matchSize) return false;
        }

        // Condition filter
        if (selectedConditions.length > 0) {
          const matchCond = selectedConditions.some((c) => 
            item.condition.toLowerCase().includes(c.toLowerCase().substring(0, 5))
          );
          if (!matchCond) return false;
        }

        // Color filter (searches title & category)
        if (selectedColors.length > 0) {
          const text = `${item.title} ${item.category}`.toLowerCase();
          const matchColor = selectedColors.some((c) => text.includes(c.toLowerCase()));
          if (!matchColor) return false;
        }

        // Price range
        const minP = parseFloat(minPrice);
        if (!isNaN(minP) && minP > 0 && item.price < minP) return false;
        const maxP = parseFloat(maxPrice);
        if (!isNaN(maxP) && maxP > 0 && item.price > maxP) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        // Default newest
        return a.publishedSecondsAgo - b.publishedSecondsAgo;
      });
  }, [
    listings,
    underFifty,
    onlyRecentDrops,
    searchInput,
    selectedCategory,
    selectedSubcategory,
    selectedBrands,
    selectedSizes,
    selectedConditions,
    selectedColors,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  // Compute active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    if (selectedSizes.length > 0) count += selectedSizes.length;
    if (selectedConditions.length > 0) count += selectedConditions.length;
    if (selectedColors.length > 0) count += selectedColors.length;
    if (minPrice || maxPrice) count++;
    if (underFifty) count++;
    return count;
  }, [
    selectedCategory,
    selectedBrands,
    selectedSizes,
    selectedConditions,
    selectedColors,
    minPrice,
    maxPrice,
    underFifty,
  ]);

  // Label for the category filter pill
  const categoryPillLabel = useMemo(() => {
    if (selectedSubcategory) return selectedSubcategory;
    if (selectedCategory !== 'all') {
      const cat = VINTED_CATEGORIES.find((c) => c.id === selectedCategory);
      return cat ? cat.name : 'Categoria';
    }
    return 'Categoria';
  }, [selectedCategory, selectedSubcategory]);

  return (
    <div className="space-y-4">
      
      {/* VINTED 1:1 SEARCH & FILTER BAR */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5">
        
        {/* Authentic Vinted Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#09B1BA] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cerca articoli o membri..."
              className="w-full pl-12 pr-10 py-3 bg-zinc-950/90 border border-zinc-700/80 hover:border-[#09B1BA]/70 focus:border-[#09B1BA] focus:ring-2 focus:ring-[#09B1BA]/20 rounded-full text-sm text-zinc-100 placeholder-zinc-500 transition-all font-medium"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  onFilterChange('', selectedBrands.length === 1 ? selectedBrands[0] : 'Tutti');
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="ml-2.5 px-6 py-3 bg-[#09B1BA] hover:bg-[#079aa2] active:scale-95 text-zinc-950 font-black text-sm rounded-full transition-all flex items-center gap-2 shadow-lg shadow-[#09B1BA]/20 cursor-pointer whitespace-nowrap"
          >
            <Search className="w-4 h-4 stroke-[3]" />
            Cerca su Vinted
          </button>
        </form>

        {/* Vinted 1:1 Filter Pills Row */}
        <div ref={dropdownRef} className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
          
          {/* 1. Tutti i filtri Button (Icon + Badge) */}
          <button
            type="button"
            onClick={() => setShowFullFilterModal(true)}
            className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-bold ${
              activeFiltersCount > 0
                ? 'bg-[#09B1BA] text-zinc-950 border-[#09B1BA] shadow-md shadow-[#09B1BA]/20'
                : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtri</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-zinc-950 text-[#09B1BA] text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* 2. Categoria Pill (2-Level Vinted Explorer) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
              className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
                selectedCategory !== 'all'
                  ? 'bg-[#09B1BA] text-zinc-950 border-[#09B1BA]'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <span>{categoryPillLabel}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {activeDropdown === 'category' && (
              <div className="absolute left-0 top-10 z-40 w-72 p-2 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl space-y-1">
                {categoryViewLevel === 'main' ? (
                  <>
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                      Categorie Vinted
                    </div>
                    {VINTED_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                          selectedCategory === cat.id && !selectedSubcategory
                            ? 'bg-[#09B1BA] text-zinc-950'
                            : 'text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(cat.icon)}
                          <span>{cat.name}</span>
                        </div>
                        {cat.subcategories.length > 0 && (
                          <ChevronRight className="w-4 h-4 text-zinc-500" />
                        )}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setCategoryViewLevel('main')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#09B1BA] hover:bg-zinc-800 flex items-center gap-1 border-b border-zinc-800 mb-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Tutte le categorie</span>
                    </button>
                    {activeParentCat && (
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => handleSelectSubcategory(activeParentCat.id, null)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                            selectedCategory === activeParentCat.id && !selectedSubcategory
                              ? 'bg-[#09B1BA] text-zinc-950'
                              : 'text-zinc-200 hover:bg-zinc-800'
                          }`}
                        >
                          Tutto in {activeParentCat.name}
                        </button>
                        {activeParentCat.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleSelectSubcategory(activeParentCat.id, sub)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium ${
                              selectedSubcategory === sub.name
                                ? 'bg-[#09B1BA] text-zinc-950 font-bold'
                                : 'text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* 3. Brand Pill (Vinted Multi-Brand Picker) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'brand' ? null : 'brand')}
              className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
                selectedBrands.length > 0
                  ? 'bg-[#09B1BA] text-zinc-950 border-[#09B1BA]'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>
                {selectedBrands.length === 0
                  ? 'Brand'
                  : selectedBrands.length === 1
                  ? selectedBrands[0]
                  : `Brand (${selectedBrands.length})`}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {activeDropdown === 'brand' && (
              <div className="absolute left-0 top-10 z-40 w-72 p-3 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl space-y-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cerca marchio..."
                    value={brandSearchQuery}
                    onChange={(e) => setBrandSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {filteredBrandList.map((b) => {
                    const isChecked = selectedBrands.includes(b);
                    return (
                      <label
                        key={b}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 cursor-pointer"
                      >
                        <span className={isChecked ? 'font-bold text-[#09B1BA]' : ''}>{b}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleBrand(b)}
                          className="w-4 h-4 accent-[#09B1BA] rounded"
                        />
                      </label>
                    );
                  })}
                </div>
                {selectedBrands.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBrands([]);
                        onFilterChange(searchInput.trim(), 'Tutti');
                      }}
                      className="text-zinc-400 hover:text-white"
                    >
                      Cancella
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(null)}
                      className="px-3 py-1 bg-[#09B1BA] text-zinc-950 font-bold rounded-lg"
                    >
                      Applica
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Taglia Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'size' ? null : 'size')}
              className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
                selectedSizes.length > 0
                  ? 'bg-[#09B1BA] text-zinc-950 border-[#09B1BA]'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <span>
                {selectedSizes.length === 0
                  ? 'Taglia'
                  : selectedSizes.length === 1
                  ? selectedSizes[0]
                  : `Taglie (${selectedSizes.length})`}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {activeDropdown === 'size' && (
              <div className="absolute left-0 top-10 z-40 w-72 p-3 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl space-y-2.5">
                <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSizeTab('clothing')}
                    className={`py-1 rounded-lg text-center ${
                      sizeTab === 'clothing' ? 'bg-[#09B1BA] text-zinc-950 font-bold' : 'text-zinc-400'
                    }`}
                  >
                    Abbigliamento
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizeTab('shoes')}
                    className={`py-1 rounded-lg text-center ${
                      sizeTab === 'shoes' ? 'bg-[#09B1BA] text-zinc-950 font-bold' : 'text-zinc-400'
                    }`}
                  >
                    Scarpe (EU)
                  </button>
                </div>

                <div className="max-h-52 overflow-y-auto space-y-1">
                  {(sizeTab === 'clothing' ? CLOTHING_SIZES : SHOE_SIZES).map((s) => {
                    const isChecked = selectedSizes.includes(s);
                    return (
                      <label
                        key={s}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 cursor-pointer"
                      >
                        <span className={isChecked ? 'font-bold text-[#09B1BA]' : ''}>{s}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSize(s)}
                          className="w-4 h-4 accent-[#09B1BA] rounded"
                        />
                      </label>
                    );
                  })}
                </div>

                {selectedSizes.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedSizes([])}
                      className="text-zinc-400 hover:text-white"
                    >
                      Cancella
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(null)}
                      className="px-3 py-1 bg-[#09B1BA] text-zinc-950 font-bold rounded-lg"
                    >
                      Applica
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. Condizione Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'condition' ? null : 'condition')}
              className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
                selectedConditions.length > 0
                  ? 'bg-[#09B1BA] text-zinc-950 border-[#09B1BA]'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <span>
                {selectedConditions.length === 0
                  ? 'Condizione'
                  : selectedConditions.length === 1
                  ? selectedConditions[0]
                  : `Condizioni (${selectedConditions.length})`}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {activeDropdown === 'condition' && (
              <div className="absolute left-0 top-10 z-40 w-80 p-3 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl space-y-2">
                <div className="px-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Condizioni dell'articolo
                </div>
                <div className="space-y-1.5">
                  {VINTED_CONDITIONS.map((c) => {
                    const isChecked = selectedConditions.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className="flex items-start gap-2.5 p-2 rounded-xl text-xs hover:bg-zinc-800 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCondition(c.id)}
                          className="w-4 h-4 accent-[#09B1BA] rounded mt-0.5"
                        />
                        <div className="min-w-0">
                          <div className={`font-semibold ${isChecked ? 'text-[#09B1BA]' : 'text-zinc-200'}`}>
                            {c.name}
                          </div>
                          <div className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                            {c.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 6. Colore Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')}
              className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
                selectedColors.length > 0
                  ? 'bg-[#09B1BA] text-zinc-950 border-[#09B1BA]'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>
                {selectedColors.length === 0
                  ? 'Colore'
                  : selectedColors.length === 1
                  ? selectedColors[0]
                  : `Colori (${selectedColors.length})`}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {activeDropdown === 'color' && (
              <div className="absolute left-0 top-10 z-40 w-72 p-3 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl space-y-2.5">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                  Seleziona colore
                </div>
                <div className="grid grid-cols-2 gap-1 max-h-56 overflow-y-auto">
                  {VINTED_COLORS.map((col) => {
                    const isChecked = selectedColors.includes(col.name);
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleToggleColor(col.name)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                          isChecked ? 'bg-zinc-800 text-[#09B1BA] font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-zinc-600 shrink-0"
                          style={{ background: col.hex }}
                        />
                        <span className="truncate">{col.name}</span>
                        {isChecked && <Check className="w-3 h-3 ml-auto text-[#09B1BA]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 7. Prezzo Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
              className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
                minPrice || maxPrice
                  ? 'bg-[#09B1BA] text-zinc-950 border-[#09B1BA]'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>
                {minPrice || maxPrice
                  ? `Prezzo (€${minPrice || '0'} - €${maxPrice || '∞'})`
                  : 'Prezzo'}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {activeDropdown === 'price' && (
              <div className="absolute left-0 top-10 z-40 w-64 p-3.5 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl space-y-3">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Fascia di prezzo
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Da €</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">A €</label>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => { setMinPrice('0'); setMaxPrice('20'); }}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    Sotto 20€
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMinPrice('20'); setMaxPrice('50'); }}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    20€ - 50€
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMinPrice('50'); setMaxPrice('100'); }}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    50€ - 100€
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMinPrice('100'); setMaxPrice(''); }}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    Oltre 100€
                  </button>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                    className="text-zinc-400 hover:text-white"
                  >
                    Cancella
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(null)}
                    className="px-3 py-1 bg-[#09B1BA] text-zinc-950 font-bold rounded-lg"
                  >
                    Applica
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 8. Ordina per Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
              className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
                sortBy !== 'newest'
                  ? 'bg-[#09B1BA] text-zinc-950 border-[#09B1BA]'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{VINTED_SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'Ordina'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {activeDropdown === 'sort' && (
              <div className="absolute left-0 top-10 z-40 w-52 p-2 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl space-y-1">
                {VINTED_SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.id);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                      sortBy === opt.id ? 'bg-[#09B1BA] text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-zinc-950" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 9. Meno di 50€ Quick Toggle */}
          <button
            type="button"
            onClick={() => setUnderFifty(!underFifty)}
            className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
              underFifty
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <DollarSign className={`w-3.5 h-3.5 ${underFifty ? 'text-zinc-950' : 'text-emerald-400'}`} />
            <span>Meno di 50€</span>
          </button>

          {/* 10. Solo Nuovi Drop (< 20 min) Toggle */}
          <button
            type="button"
            onClick={() => setOnlyRecentDrops(!onlyRecentDrops)}
            className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-all font-semibold ${
              onlyRecentDrops
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-zinc-950 text-zinc-400 border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${onlyRecentDrops ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
            <span>Nuovi drop (&lt; 20 min)</span>
          </button>

          {/* 11. Auto-Refresh in Tempo Reale Control */}
          <div className="flex items-center gap-1.5 ml-auto">
            {onToggleAutoRefresh && (
              <button
                type="button"
                onClick={onToggleAutoRefresh}
                className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all text-xs font-bold ${
                  autoRefreshEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                }`}
                title="Attiva/Disattiva aggiornamento in tempo reale automatico"
              >
                <span className={`w-2 h-2 rounded-full ${autoRefreshEnabled ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
                <span>Auto-Refresh {autoRefreshEnabled ? 'ON' : 'OFF'}</span>
              </button>
            )}

            {onManualRefresh && (
              <button
                type="button"
                onClick={onManualRefresh}
                disabled={isRefreshing}
                className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 transition-colors"
                title="Aggiorna ora annunci da Vinted"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#09B1BA]' : ''}`} />
              </button>
            )}

            {/* 12. Grid Columns Mode: 1 o 2 per riga su iPhone */}
            <div className="flex items-center gap-0.5 bg-zinc-950 p-0.5 rounded-full border border-zinc-800">
              <button
                type="button"
                onClick={() => setGridColumns('1')}
                className={`px-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                  gridColumns === '1'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="1 annuncio per riga"
              >
                <Rows className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">1x</span>
              </button>
              <button
                type="button"
                onClick={() => setGridColumns('2')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1 transition-all ${
                  gridColumns === '2'
                    ? 'bg-[#09B1BA] text-zinc-950 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="2 annunci per riga su iPhone"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>2 per riga</span>
              </button>
            </div>
          </div>

        </div>

        {/* Active Filter Chips (1 to 1 with Vinted active filter tags) */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/80 text-xs">
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#09B1BA]/15 text-[#09B1BA] border border-[#09B1BA]/30 font-medium">
                {categoryPillLabel}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubcategory(null);
                  }}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedBrands.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#09B1BA]/15 text-[#09B1BA] border border-[#09B1BA]/30 font-medium"
              >
                {b}
                <button
                  type="button"
                  onClick={() => handleToggleBrand(b)}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedSizes.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#09B1BA]/15 text-[#09B1BA] border border-[#09B1BA]/30 font-medium"
              >
                Taglia: {s}
                <button
                  type="button"
                  onClick={() => handleToggleSize(s)}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedConditions.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#09B1BA]/15 text-[#09B1BA] border border-[#09B1BA]/30 font-medium"
              >
                {c}
                <button
                  type="button"
                  onClick={() => handleToggleCondition(c)}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedColors.map((col) => (
              <span
                key={col}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#09B1BA]/15 text-[#09B1BA] border border-[#09B1BA]/30 font-medium"
              >
                {col}
                <button
                  type="button"
                  onClick={() => handleToggleColor(col)}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#09B1BA]/15 text-[#09B1BA] border border-[#09B1BA]/30 font-medium">
                {minPrice ? `Da €${minPrice}` : ''} {maxPrice ? `Fino a €${maxPrice}` : ''}
                <button
                  type="button"
                  onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {underFifty && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium">
                Meno di 50€
                <button
                  type="button"
                  onClick={() => setUnderFifty(false)}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearAll}
              className="text-[#09B1BA] hover:text-[#079aa2] font-bold text-xs underline ml-auto cursor-pointer"
            >
              Cancella tutto
            </button>
          </div>
        )}

      </div>

      {/* Active Search & Drop Summary Banner */}
      <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 px-1 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-200">
            {displayedListings.length} articoli trovati
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 
            {sortBy === 'newest' ? 'Ordinati per data di pubblicazione più recente (Vinted Live)' : 'Ordinamento personalizzato'}
          </span>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={handleClearAll}
            className="text-[#09B1BA] hover:text-teal-300 font-semibold underline"
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
            className="px-5 py-2.5 rounded-full bg-[#09B1BA] text-zinc-950 font-bold text-xs hover:bg-[#079aa2] transition-colors"
          >
            Azzera Filtri e Mostra Tutti
          </button>
        </div>
      )}

      {/* Listings Grid: Compact and Responsive (supports 2 per row on iPhone) */}
      <div className={`grid ${
        gridColumns === '2'
          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'
      }`}>
        {displayedListings.map((item) => (
          <div
            key={item.id}
            className={`group rounded-xl bg-zinc-900 border transition-all duration-200 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-[#09B1BA]/10 ${
              item.isNewDrop 
                ? 'border-emerald-500/80 ring-1 sm:ring-2 ring-emerald-500/30' 
                : 'border-zinc-800/80 hover:border-[#09B1BA]/50'
            }`}
          >
            {/* Clickable Image: Opens item on Vinted ("Vedi su Vinted") */}
            <a
              href={item.vintedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square sm:aspect-[4/3] bg-zinc-950 overflow-hidden block cursor-pointer group/img"
              title="Vedi su Vinted"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.triedProxy && item.imageUrl && item.imageUrl.startsWith('http')) {
                    target.dataset.triedProxy = 'true';
                    target.src = `/api/image-proxy?url=${encodeURIComponent(item.imageUrl)}`;
                  } else {
                    target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2318181b"/><circle cx="150" cy="125" r="32" fill="%2327272a"/><path d="M70 230c0-40 35-60 80-60s80 20 80 60" fill="%2327272a"/><text x="150" y="270" fill="%2371717a" font-size="14" font-family="sans-serif" text-anchor="middle" font-weight="bold">Foto Vinted</text></svg>';
                  }
                }}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300 bg-zinc-950"
                loading="eager"
                decoding="async"
              />
              {/* Status Badges */}
              <div className="absolute top-1.5 left-1.5 flex items-center gap-1 flex-wrap">
                {item.isNewDrop && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-zinc-950 text-[8px] sm:text-[9px] font-black uppercase tracking-wider animate-pulse flex items-center gap-0.5 shadow-md">
                    <Zap className="w-2.5 h-2.5 fill-zinc-950" /> DROP
                  </span>
                )}
              </div>

              {/* Publication Timestamp Badge */}
              <div className="absolute top-1.5 right-1.5">
                <span className="px-1.5 py-0.5 rounded bg-zinc-950/85 backdrop-blur text-[9px] sm:text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {formatTimeAgo(item.publishedSecondsAgo)}
                </span>
              </div>

              {/* Condition & Size pill */}
              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[9px] sm:text-[10px] font-medium text-zinc-200 bg-zinc-950/80 backdrop-blur px-1.5 py-0.5 rounded border border-zinc-800/60">
                <span className="truncate max-w-[80px] sm:max-w-[120px]">{item.condition}</span>
                <span className="font-bold text-[#09B1BA] truncate">{item.size}</span>
              </div>
            </a>

            {/* Content Details */}
            <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2">
              <div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-0.5">
                  <span className="font-extrabold uppercase tracking-wider text-[#09B1BA] truncate max-w-[110px]">{item.brand}</span>
                  <span className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-zinc-400 shrink-0">
                    {item.seller.countryFlag}
                    <span className="text-amber-400 font-bold flex items-center">
                      <Star className="w-2.5 h-2.5 fill-amber-400 inline" /> {item.seller.rating}
                    </span>
                  </span>
                </div>
                <h3 className="font-semibold text-zinc-100 text-[11px] sm:text-xs line-clamp-1 leading-snug group-hover:text-[#09B1BA] transition-colors" title={item.title}>
                  {item.title}
                </h3>
              </div>

              {/* Solo Prezzo Vinted (Senza Protezione) */}
              <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-950/90 border border-zinc-800/80 flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] uppercase font-extrabold text-zinc-400 tracking-wider">
                  Prezzo Vinted
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm sm:text-base font-black text-emerald-400 font-mono tracking-tight">
                    €{item.price.toFixed(2)}
                  </span>
                  {item.originalCurrency && item.originalCurrency !== 'EUR' && (
                    <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono">
                      ({item.originalPriceDisplay})
                    </span>
                  )}
                </div>
              </div>

              {/* Compra su Vinted Button */}
              <div className="pt-0.5">
                <a
                  href={item.vintedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 sm:py-2 px-2 rounded-lg bg-[#09B1BA] hover:bg-[#079aa2] text-zinc-950 font-black text-[10px] sm:text-xs uppercase tracking-wide flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm shadow-[#09B1BA]/20 cursor-pointer text-center"
                >
                  <Zap className="w-3 h-3 fill-zinc-950 shrink-0" />
                  <span className="truncate">COMPRA SU VINTED</span>
                </a>
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* FULL VINTED FILTER DRAWER / MODAL ("Tutti i filtri") */}
      {showFullFilterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#09B1BA]" />
                <h3 className="font-bold text-white text-base">Filtri di Ricerca Vinted</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFullFilterModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-6 overflow-y-auto flex-1">
              
              {/* Section 1: Categoria */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Categoria
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {VINTED_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubcategory(null);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-[#09B1BA]/15 border-[#09B1BA] text-[#09B1BA] font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {getCategoryIcon(cat.icon)}
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: Brand con ricerca */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Brand ({selectedBrands.length} selezionati)
                  </div>
                  {selectedBrands.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedBrands([])}
                      className="text-xs text-[#09B1BA] hover:underline"
                    >
                      Deseleziona tutti
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cerca marchio..."
                    value={brandSearchQuery}
                    onChange={(e) => setBrandSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto grid grid-cols-2 gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                  {filteredBrandList.map((b) => {
                    const isChecked = selectedBrands.includes(b);
                    return (
                      <label
                        key={b}
                        className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 cursor-pointer"
                      >
                        <span className={isChecked ? 'font-bold text-[#09B1BA]' : ''}>{b}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleBrand(b)}
                          className="w-3.5 h-3.5 accent-[#09B1BA] rounded"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Taglie */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Taglie Abbigliamento & Scarpe
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '39', '40', '41', '42', '42.5', '43', '44', '45'].map((s) => {
                    const isChecked = selectedSizes.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleToggleSize(s)}
                        className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                          isChecked
                            ? 'bg-[#09B1BA] text-zinc-950 border-[#09B1BA]'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Condizioni */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Condizioni
                </div>
                <div className="space-y-1">
                  {VINTED_CONDITIONS.map((c) => {
                    const isChecked = selectedConditions.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className="flex items-center justify-between p-2 rounded-xl text-xs hover:bg-zinc-800 cursor-pointer"
                      >
                        <span className={isChecked ? 'font-bold text-[#09B1BA]' : 'text-zinc-300'}>{c.name}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCondition(c.id)}
                          className="w-4 h-4 accent-[#09B1BA] rounded"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Section 5: Prezzo */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Prezzo (€)
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] text-zinc-400 block mb-1">Da</label>
                    <input
                      type="number"
                      placeholder="0 €"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-zinc-400 block mb-1">A</label>
                    <input
                      type="number"
                      placeholder="Max €"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Colori */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Colori
                </div>
                <div className="flex flex-wrap gap-2">
                  {VINTED_COLORS.map((col) => {
                    const isChecked = selectedColors.includes(col.name);
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleToggleColor(col.name)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs transition-all ${
                          isChecked
                            ? 'bg-zinc-800 text-[#09B1BA] border-[#09B1BA] font-bold'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-zinc-600"
                          style={{ background: col.hex }}
                        />
                        <span>{col.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Sticky Bottom Bar */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-bold text-zinc-400 hover:text-white underline"
              >
                Cancella tutto
              </button>
              <button
                type="button"
                onClick={() => setShowFullFilterModal(false)}
                className="px-6 py-2.5 rounded-full bg-[#09B1BA] hover:bg-[#079aa2] text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-[#09B1BA]/20 transition-all"
              >
                Mostra {displayedListings.length} articoli
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
