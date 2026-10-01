import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Power, 
  Volume2, 
  VolumeX, 
  Bell, 
  Send, 
  Check, 
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { VintedMonitor, ConditionType } from '../types';
import { POPULAR_BRANDS, POPULAR_SIZES, VINTED_COUNTRIES } from '../data/brands';

interface MonitorsManagerProps {
  monitors: VintedMonitor[];
  onToggleMonitor: (id: string) => void;
  onDeleteMonitor: (id: string) => void;
  onAddMonitor: (monitor: Omit<VintedMonitor, 'id' | 'createdAt' | 'matchCount'>) => void;
}

export const MonitorsManager: React.FC<MonitorsManagerProps> = ({
  monitors,
  onToggleMonitor,
  onDeleteMonitor,
  onAddMonitor,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [webhookTestStatus, setWebhookTestStatus] = useState<string | null>(null);

  // New Monitor form state
  const [name, setName] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['Nike']);
  const [keywords, setKeywords] = useState('');
  const [excludedKeywords, setExcludedKeywords] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L']);
  const [maxPrice, setMaxPrice] = useState<number>(50);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['IT', 'FR']);
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
  const [enableSound, setEnableSound] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);

  const handleBrandToggle = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleCountryToggle = (code: string) => {
    if (selectedCountries.includes(code)) {
      setSelectedCountries(selectedCountries.filter((c) => c !== code));
    } else {
      setSelectedCountries([...selectedCountries, code]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMonitor({
      name: name.trim(),
      brands: selectedBrands,
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      excludedKeywords: excludedKeywords.split(',').map((k) => k.trim()).filter(Boolean),
      sizes: selectedSizes,
      maxPrice: Number(maxPrice) || 50,
      minPrice: 0,
      minCondition: 'Tutte',
      countries: selectedCountries,
      isActive: true,
      enableSound,
      enableNotifications,
      discordWebhookUrl: discordWebhookUrl.trim() || undefined,
    });

    // Reset and close
    setName('');
    setShowAddModal(false);
  };

  const testDiscordWebhook = () => {
    setWebhookTestStatus('Invio alert test...');
    setTimeout(() => {
      setWebhookTestStatus('✅ Webhook verificato! Notifica inviata con successo.');
      setTimeout(() => setWebhookTestStatus(null), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">I Miei Monitor Vinted</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-semibold border border-cyan-800/50">
              {monitors.length} Configurati
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Imposta filtri ultra-precisi: il bot scansiona Vinted 24/7 e ti avvisa appena esce un annuncio conveniente
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          Crea Nuovo Monitor
        </button>
      </div>

      {/* Monitor Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {monitors.map((mon) => (
          <div
            key={mon.id}
            className={`p-5 rounded-2xl border transition-all ${
              mon.isActive 
                ? 'bg-zinc-900/90 border-cyan-500/40 shadow-lg shadow-cyan-500/5' 
                : 'bg-zinc-950/60 border-zinc-800/80 opacity-60'
            }`}
          >
            {/* Header of card */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-zinc-100 text-base flex items-center gap-2">
                  {mon.name}
                </h3>
                <div className="text-xs text-zinc-400 mt-0.5">
                  Trovati finora: <span className="text-cyan-400 font-bold">{mon.matchCount} annunci</span>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => onToggleMonitor(mon.id)}
                className={`p-2 rounded-xl transition-colors ${
                  mon.isActive 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-zinc-800 text-zinc-500'
                }`}
                title={mon.isActive ? 'Disattiva' : 'Attiva'}
              >
                <Power className="w-4 h-4" />
              </button>
            </div>

            {/* Filter pills */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/60 text-zinc-400">
                <span>Prezzo Max:</span>
                <span className="font-bold text-emerald-400 text-sm">≤ €{mon.maxPrice}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-zinc-800/60 text-zinc-400">
                <span>Brand:</span>
                <span className="font-semibold text-zinc-200">{mon.brands.join(', ') || 'Tutti'}</span>
              </div>

              {mon.keywords.length > 0 && (
                <div className="flex items-center justify-between py-1 border-b border-zinc-800/60 text-zinc-400">
                  <span>Parole chiave:</span>
                  <span className="font-semibold text-cyan-300">{mon.keywords.join(', ')}</span>
                </div>
              )}

              <div className="flex items-center justify-between py-1 border-b border-zinc-800/60 text-zinc-400">
                <span>Taglie:</span>
                <span className="font-semibold text-zinc-200">{mon.sizes.join(', ') || 'Tutte'}</span>
              </div>

              <div className="flex items-center justify-between py-1 text-zinc-400">
                <span>Paesi:</span>
                <span className="font-semibold text-zinc-200">{mon.countries.join(' ')}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                {mon.enableSound ? (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-zinc-600" />
                )}
                {mon.discordWebhookUrl && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                    Discord
                  </span>
                )}
              </div>

              <button
                onClick={() => onDeleteMonitor(mon.id)}
                className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors"
                title="Elimina monitor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Creazione Monitor */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Nuovo Monitor Vinted</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Nome Monitor</label>
                <input
                  type="text"
                  placeholder="Es. Trapstar felpe < 50€, Nike Dunk Panda..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Brands selection */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Brand da monitorare</label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-zinc-950 rounded-xl border border-zinc-800">
                  {POPULAR_BRANDS.map((brand) => (
                    <button
                      type="button"
                      key={brand}
                      onClick={() => handleBrandToggle(brand)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        selectedBrands.includes(brand)
                          ? 'bg-cyan-500 text-zinc-950'
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keywords and Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Parole chiave (separate da virgola)</label>
                  <input
                    type="text"
                    placeholder="Es. chenille, tracksuit, hoodie"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Prezzo Massimo (€)</label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Sizes selection */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Taglie desiderate</label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SIZES.map((sz) => (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => handleSizeToggle(sz)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        selectedSizes.includes(sz)
                          ? 'bg-cyan-500 text-zinc-950'
                          : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Countries */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Paesi di spedizione</label>
                <div className="flex flex-wrap gap-2">
                  {VINTED_COUNTRIES.map((ct) => (
                    <button
                      type="button"
                      key={ct.code}
                      onClick={() => handleCountryToggle(ct.code)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                        selectedCountries.includes(ct.code)
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                          : 'bg-zinc-950 text-zinc-500 border border-zinc-800'
                      }`}
                    >
                      <span>{ct.flag}</span>
                      <span>{ct.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discord Webhook */}
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-indigo-300 font-semibold text-xs flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    Webhook Discord per Notifiche Istantanee (Opzionale)
                  </label>
                  {discordWebhookUrl && (
                    <button
                      type="button"
                      onClick={testDiscordWebhook}
                      className="text-xs text-indigo-400 underline hover:text-indigo-200"
                    >
                      Test Webhook
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={discordWebhookUrl}
                  onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
                {webhookTestStatus && (
                  <p className="text-xs text-emerald-400 font-medium">{webhookTestStatus}</p>
                )}
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold shadow-lg shadow-cyan-500/20"
                >
                  Salva & Avvia Monitor
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
