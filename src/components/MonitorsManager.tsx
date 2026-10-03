import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Power, 
  X,
  Layers, 
  Sparkles, 
  Gamepad2, 
  Shirt, 
  Baby, 
  Home, 
  Cat, 
  Tag, 
  Globe,
  Send 
} from 'lucide-react';
import { VintedMonitor, ConditionType } from '../types';
import { VINTED_CATEGORIES } from '../data/vintedCategories';
import { VINTED_COUNTRIES } from '../data/brands';

interface MonitorsManagerProps {
  monitors: VintedMonitor[];
  onToggleMonitor: (id: string) => void;
  onDeleteMonitor: (id: string) => void;
  onAddMonitor: (monitor: Omit<VintedMonitor, 'id' | 'createdAt' | 'matchCount'>) => void;
  onViewInFeed?: (monitorId: string) => void;
}

export const MonitorsManager: React.FC<MonitorsManagerProps> = ({
  monitors,
  onToggleMonitor,
  onDeleteMonitor,
  onAddMonitor,
  onViewInFeed,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');

  // New Monitor form state
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [customBrandInput, setCustomBrandInput] = useState('');
  const [keywords, setKeywords] = useState('');
  const [excludedKeywords, setExcludedKeywords] = useState('fake, replica, rotto, non funzionante');
  const [selectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(50);
  const [minPrice, setMinPrice] = useState<number>(5);
  const [minCondition, setMinCondition] = useState<ConditionType | 'Tutte'>('Tutte');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([
    'IT',
    'FR',
    'ES',
    'PT',
    'BE',
    'NL',
    'LU',
    'AT',
    'DE',
  ]);
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');

  // Icon mapping
  const getCategoryIcon = (catName?: string) => {
    const c = (catName || '').toLowerCase();
    if (c.includes('tutte') || c.includes('all')) {
      return <Layers className="w-4 h-4 text-teal-400" />;
    }
    if (c.includes('elettronica') || c.includes('entertainment') || c.includes('game') || c.includes('pokemon')) {
      return <Gamepad2 className="w-4 h-4 text-purple-400" />;
    }
    if (c.includes('bambin') || c.includes('lego') || c.includes('giocattol')) {
      return <Baby className="w-4 h-4 text-amber-400" />;
    }
    if (c.includes('donna') || c.includes('bors')) {
      return <Sparkles className="w-4 h-4 text-pink-400" />;
    }
    if (c.includes('casa') || c.includes('living')) {
      return <Home className="w-4 h-4 text-emerald-400" />;
    }
    if (c.includes('animal')) {
      return <Cat className="w-4 h-4 text-orange-400" />;
    }
    return <Shirt className="w-4 h-4 text-cyan-400" />;
  };

  // Find active category definition
  const currentCategoryDef = VINTED_CATEGORIES.find((c) => c.id === selectedCategory) || VINTED_CATEGORIES[0];

  const handleSubcategoryToggle = (subName: string) => {
    if (selectedSubcategories.includes(subName)) {
      setSelectedSubcategories(selectedSubcategories.filter((s) => s !== subName));
    } else {
      setSelectedSubcategories([...selectedSubcategories, subName]);
    }
  };

  const handleCountryToggle = (code: string) => {
    if (selectedCountries.includes(code)) {
      setSelectedCountries(selectedCountries.filter((c) => c !== code));
    } else {
      setSelectedCountries([...selectedCountries, code]);
    }
  };

  const handleAddCustomBrand = () => {
    const b = customBrandInput.trim();
    if (b && !selectedBrands.includes(b)) {
      setSelectedBrands([...selectedBrands, b]);
      setCustomBrandInput('');
    }
  };

  const handleApplyTemplate = (
    templateName: string,
    catId: string,
    subs: string[],
    brands: string[],
    kw: string,
    exKw: string,
    maxP: number
  ) => {
    setName(templateName);
    setSelectedCategory(catId);
    setSelectedSubcategories(subs);
    setSelectedBrands(brands);
    setKeywords(kw);
    setExcludedKeywords(exKw);
    setMaxPrice(maxP);
  };

  const handleCreateMonitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const kwArray = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    const exKwArray = excludedKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    // If keywords is empty and no brands chosen, automatically use monitor name as keyword
    let finalKeywords = kwArray;
    if (finalKeywords.length === 0 && selectedBrands.length === 0 && name.trim()) {
      finalKeywords = [name.trim()];
    }

    onAddMonitor({
      name: name.trim(),
      category: selectedCategory === 'all' ? 'Tutte le Categorie' : currentCategoryDef.name,
      subcategories: selectedCategory === 'all' ? [] : selectedSubcategories,
      brands: selectedBrands,
      keywords: finalKeywords,
      excludedKeywords: exKwArray,
      sizes: selectedSizes,
      maxPrice: Number(maxPrice),
      minPrice: Number(minPrice),
      minCondition,
      countries: selectedCountries,
      isActive: true,
      enableSound: false,
      enableNotifications: true,
      discordWebhookUrl: discordWebhookUrl.trim() || undefined,
    });

    setShowAddModal(false);
    // Reset form
    setName('');
    setSelectedBrands([]);
    setKeywords('');
    setSelectedSubcategories([]);
  };

  const filteredMonitors = monitors.filter((m) => {
    if (selectedCategoryTab === 'all') return true;
    const catText = (m.category || '').toLowerCase();
    return catText.includes(selectedCategoryTab.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Sniper Bot per Tutte le Categorie Vinted</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Monitora automaticamente qualsiasi categoria su Vinted EU (Console, Carte Pokémon, LEGO, Streetwear, Borse, Casa)
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-full bg-[#09B1BA] hover:bg-teal-400 active:scale-95 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Nuovo Monitor
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedCategoryTab('all')}
          className={`px-3.5 py-2 rounded-full font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategoryTab === 'all'
              ? 'bg-teal-500 text-zinc-950 font-bold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Tutte ({monitors.length})
        </button>
        <button
          onClick={() => setSelectedCategoryTab('entertainment')}
          className={`px-3.5 py-2 rounded-full font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategoryTab === 'entertainment'
              ? 'bg-purple-500 text-zinc-950 font-bold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          Elettronica & Entertainment
        </button>
        <button
          onClick={() => setSelectedCategoryTab('uomo')}
          className={`px-3.5 py-2 rounded-full font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategoryTab === 'uomo'
              ? 'bg-cyan-500 text-zinc-950 font-bold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          Uomo / Streetwear
        </button>
        <button
          onClick={() => setSelectedCategoryTab('donna')}
          className={`px-3.5 py-2 rounded-full font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategoryTab === 'donna'
              ? 'bg-pink-500 text-zinc-950 font-bold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Donna & Borse
        </button>
        <button
          onClick={() => setSelectedCategoryTab('bambin')}
          className={`px-3.5 py-2 rounded-full font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategoryTab === 'bambin'
              ? 'bg-amber-500 text-zinc-950 font-bold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Baby className="w-3.5 h-3.5" />
          Bambini & LEGO
        </button>
      </div>

      {/* Monitors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMonitors.map((mon) => (
          <div
            key={mon.id}
            className={`p-5 rounded-2xl bg-zinc-900 border transition-all space-y-4 flex flex-col justify-between ${
              mon.isActive 
                ? 'border-zinc-800 hover:border-teal-500/50 shadow-lg' 
                : 'border-zinc-800/50 opacity-60'
            }`}
          >
            <div className="space-y-3">
              {/* Header: Name, Category & Toggle */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    {getCategoryIcon(mon.category)}
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                      {mon.category || 'Tutte le Categorie'}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base leading-tight">
                    {mon.name}
                  </h3>
                </div>
                <button
                  onClick={() => onToggleMonitor(mon.id)}
                  className={`p-2 rounded-xl transition-all ${
                    mon.isActive 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}
                  title={mon.isActive ? 'Monitor Attivo' : 'Monitor in Pausa'}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              {/* Subcategories & Keywords Chips */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {mon.subcategories && mon.subcategories.map((sub, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/40 text-purple-300 font-medium">
                    {sub}
                  </span>
                ))}
                {mon.keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300">
                    "{kw}"
                  </span>
                ))}
              </div>

              {/* Brands */}
              {mon.brands.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <Tag className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-zinc-300 font-semibold">{mon.brands.join(', ')}</span>
                </div>
              )}

              {/* Price & Target stats */}
              <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">Prezzo Max</span>
                  <span className="text-sm font-black text-emerald-400">€{mon.maxPrice}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">Match Rilevati</span>
                  <span className="text-sm font-bold text-teal-300">{mon.matchCount} drop</span>
                </div>
              </div>

              {/* Countries */}
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="truncate">
                  {mon.countries && mon.countries.length > 0 && mon.countries.length < 9
                    ? mon.countries
                        .map((c) => {
                          const found = VINTED_COUNTRIES.find(
                            (vc) => vc.code.toLowerCase() === c.toLowerCase() || vc.name.toLowerCase() === c.toLowerCase()
                          );
                          return found ? `${found.flag} ${found.code}` : c;
                        })
                        .join(' · ')
                    : '🇪🇺 9 Paesi UE (IT, FR, ES, PT, BE, NL, LU, AT, DE)'}
                </span>
              </div>
            </div>

            {/* Bottom bar with status and delete */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs gap-2">
              {onViewInFeed ? (
                <button
                  type="button"
                  onClick={() => onViewInFeed(mon.id)}
                  className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                  title="Filtra il feed Live Deals con questo monitor"
                >
                  <Target className="w-3 h-3 text-teal-400" />
                  <span>Vedi Drop nel Feed</span>
                </button>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Scansione attiva (1.0s)
                </span>
              )}
              <button
                onClick={() => onDeleteMonitor(mon.id)}
                className="text-zinc-500 hover:text-red-400 p-1 transition-colors ml-auto"
                title="Elimina Monitor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MONITOR MODAL (Vinted Official Style) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Crea Monitor Sniper su Vinted</h3>
                  <p className="text-xs text-zinc-400">Rileva affari in tempo reale su qualsiasi categoria</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateMonitor} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Quick Template Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Template Veloci 1-Click
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('🃏 Carte Pokémon TCG & Booster', 'entertainment_electronics', ['Carte Collezionabili'], ['Pokémon', 'Nintendo'], 'charizard, booster, box, bundle', 'fake, replica', 50)}
                    className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-purple-500/50 text-left transition-all"
                  >
                    <div className="font-bold text-purple-300">🃏 Carte Pokémon</div>
                    <div className="text-[10px] text-zinc-500">Charizard, Booster, TCG &lt;50€</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('🎮 Nintendo 3DS / 2DS & Giochi', 'all', [], ['Nintendo'], '3ds, 2ds', 'custodia sola, scatola vuota', 120)}
                    className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-red-500/50 text-left transition-all"
                  >
                    <div className="font-bold text-red-400">🎮 Nintendo 3DS / 2DS</div>
                    <div className="text-[10px] text-zinc-500">Console & Giochi 3DS &lt;120€</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('🎮 Console PS5 & Switch', 'entertainment_electronics', ['Console & Videogiochi'], ['Sony', 'PlayStation', 'Nintendo'], 'ps5, switch, oled, console', 'scatola vuota, rotto', 180)}
                    className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-teal-500/50 text-left transition-all"
                  >
                    <div className="font-bold text-teal-300">🎮 Console PS5 / Switch</div>
                    <div className="text-[10px] text-zinc-500">PlayStation, Switch &lt;180€</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('🧱 LEGO Star Wars & Ninjago', 'kids', ['LEGO & Giocattoli'], ['LEGO'], 'star wars, ninjago, minifigure', 'incompleto', 45)}
                    className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 text-left transition-all"
                  >
                    <div className="font-bold text-amber-300">🧱 LEGO Collezionabili</div>
                    <div className="text-[10px] text-zinc-500">Star Wars, Ninjago &lt;45€</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('🔥 Trapstar & Corteiz', 'men', ['Felpe & Hoodie', 'Tute & Pantaloni'], ['Trapstar', 'Corteiz'], 'tracksuit, chenille, hoodie, alcatraz', 'fake, replica', 60)}
                    className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 text-left transition-all"
                  >
                    <div className="font-bold text-cyan-300">🔥 Trapstar & Corteiz</div>
                    <div className="text-[10px] text-zinc-500">Tracksuit, Felpe &lt;60€</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('👜 Borse Firmate Vintage', 'women', ['Borse, Pochette & Zaini'], ['Prada', 'Gucci', 'Louis Vuitton'], 'borsa, vintage, pochette', 'fake, strappato', 80)}
                    className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-pink-500/50 text-left transition-all"
                  >
                    <div className="font-bold text-pink-300">👜 Borse Firmate</div>
                    <div className="text-[10px] text-zinc-500">Prada, LV, Gucci &lt;80€</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('🎧 Apple AirPods & Tech', 'entertainment_electronics', ['Audio & Cuffie'], ['Apple'], 'airpods, airpods max, pro', 'falso, cover', 90)}
                    className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 text-left transition-all"
                  >
                    <div className="font-bold text-blue-300">🎧 Apple AirPods</div>
                    <div className="text-[10px] text-zinc-500">Max, Pro Wireless &lt;90€</div>
                  </button>
                </div>
              </div>

              {/* Monitor Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Nome del Monitor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Carte Pokémon TCG Sotto Costo, PS5 Drop Rapido, Trapstar Tracksuit..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Step 1: Scegli la Categoria Ufficiale Vinted */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    1. Categoria Vinted
                  </label>
                  <span className="text-[11px] text-[#09B1BA] font-semibold">
                    {selectedCategory === 'all' ? '✨ Tutte le Categorie (Consigliato)' : currentCategoryDef.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {VINTED_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubcategories([]);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        selectedCategory === cat.id
                          ? 'bg-[#09B1BA]/20 border-[#09B1BA] text-white shadow-md'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        {getCategoryIcon(cat.name)}
                        <span className="truncate">{cat.name}</span>
                        {cat.id === 'all' && (
                          <span className="ml-auto text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#09B1BA] text-zinc-950">
                            Tutto
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 line-clamp-1">
                        {cat.description}
                      </div>
                    </button>
                  ))}
                </div>
                {selectedCategory === 'all' && (
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>
                      <strong>Monitor Globale:</strong> Questo monitor cercherà articoli in <strong>TUTTE</strong> le categorie di Vinted (Sneakers, Abbigliamento, Console, Borse, Carte, Giochi, ecc.) senza limitazioni!
                    </span>
                  </div>
                )}
              </div>

              {/* Step 2: Sottocategorie pertinenti */}
              {currentCategoryDef.subcategories.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    2. Sottocategorie di {currentCategoryDef.name} (Opzionale)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCategoryDef.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSubcategoryToggle(sub.name)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          selectedSubcategories.includes(sub.name)
                            ? 'bg-teal-500 text-zinc-950 font-bold'
                            : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Parole Chiave e Esclusioni */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Parole Chiave (Separate da virgola)
                  </label>
                  <input
                    type="text"
                    placeholder="Es. charizard, booster, box, ps5, tracksuit"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                  <span className="text-[10px] text-zinc-500 block">L'articolo deve contenere almeno una parola chiave</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Parole Escluse (Anti-Fregatura)
                  </label>
                  <input
                    type="text"
                    placeholder="Es. fake, replica, rotto, difettoso, scatola vuota"
                    value={excludedKeywords}
                    onChange={(e) => setExcludedKeywords(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                  <span className="text-[10px] text-zinc-500 block">Scarta automaticamente annunci sospetti</span>
                </div>
              </div>

              {/* Step 4: Brand Target */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Brand o Produttore (Opzionale)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Aggiungi brand personalizzato (es. Pokémon, Nintendo, LEGO, Sony, Apple, Nike)..."
                    value={customBrandInput}
                    onChange={(e) => setCustomBrandInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomBrand();
                      }
                    }}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomBrand}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold"
                  >
                    Aggiungi
                  </button>
                </div>

                {selectedBrands.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedBrands.map((b) => (
                      <span
                        key={b}
                        className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center gap-1"
                      >
                        {b}
                        <button
                          type="button"
                          onClick={() => setSelectedBrands(selectedBrands.filter((item) => item !== b))}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 5: Prezzo Max & Condizione */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Prezzo Massimo (€)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    required
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Condizione Minima
                  </label>
                  <select
                    value={minCondition}
                    onChange={(e) => setMinCondition(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    <option value="Tutte">Qualsiasi condizione</option>
                    <option value="Nuovo con cartellino">Nuovo con cartellino</option>
                    <option value="Nuovo senza cartellino">Nuovo senza cartellino</option>
                    <option value="Ottime condizioni">Ottime condizioni</option>
                    <option value="Buone condizioni">Buone condizioni</option>
                  </select>
                </div>
              </div>

              {/* Step 6: Paesi Vinted Monitorati */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Paesi Vinted UE (9 Nazioni Europee)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCountries(VINTED_COUNTRIES.map((c) => c.code))}
                      className="text-[11px] font-bold text-teal-400 hover:text-teal-300 underline transition-colors"
                    >
                      Tutti e 9
                    </button>
                    <span className="text-zinc-600 text-xs">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCountries([])}
                      className="text-[11px] text-zinc-400 hover:text-zinc-300 underline transition-colors"
                    >
                      Deseleziona
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Rileva automaticamente annunci in lingua locale da Italia, Francia, Spagna, Portogallo, Belgio, Paesi Bassi, Lussemburgo, Austria e Germania.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {VINTED_COUNTRIES.map((ct) => (
                    <button
                      key={ct.code}
                      type="button"
                      onClick={() => handleCountryToggle(ct.code)}
                      className={`px-3 py-1.5 rounded-full border transition-all font-semibold flex items-center gap-1.5 ${
                        selectedCountries.includes(ct.code)
                          ? 'bg-teal-500 text-zinc-950 border-teal-400'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span>{ct.flag}</span>
                      <span>{ct.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 7: Webhook Discord per Notifiche Push Istantanee */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-indigo-400" />
                    Notifiche Push Discord (Opzionale)
                  </label>
                  <span className="text-[10px] text-indigo-400 font-semibold">&lt; 0.2s alert</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Incolla l'URL del Webhook del tuo server Discord per ricevere foto, prezzo e link diretto sul telefono.
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={discordWebhookUrl}
                    onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
                  />
                  {discordWebhookUrl.trim() && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/test-webhook', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ webhookUrl: discordWebhookUrl.trim() }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            alert('✅ Notifica di test inviata con successo sul tuo canale Discord!');
                          } else {
                            alert(`❌ Errore Webhook: ${data.error || 'URL non valido'}`);
                          }
                        } catch (err: any) {
                          alert(`❌ Errore di rete: ${err.message}`);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs whitespace-nowrap transition-all"
                    >
                      Invia Test
                    </button>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold text-xs hover:bg-zinc-700 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#09B1BA] hover:bg-teal-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-teal-500/20 active:scale-95"
                >
                  Attiva Monitor Sniper
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
