import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Navigation, 
  CheckCircle2, 
  X, 
  Clock, 
  Package, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Plus,
  Trash2,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { VintedPickupPoint } from '../types';
import { SAMPLE_PICKUP_POINTS_MILAN, getNearbyPickupPoints } from '../data/pickupPoints';

interface PickupPointSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPoint: VintedPickupPoint | null;
  onSelectPoint: (point: VintedPickupPoint) => void;
  alternativePoints?: VintedPickupPoint[];
  onUpdateAlternativePoints?: (pts: VintedPickupPoint[]) => void;
  fallbackStrategy?: 'NEAREST' | 'FIRST_AVAILABLE' | 'ONLY_247_LOCKER';
  onChangeFallbackStrategy?: (strat: 'NEAREST' | 'FIRST_AVAILABLE' | 'ONLY_247_LOCKER') => void;
  maxDistanceKm?: number;
  onChangeMaxDistanceKm?: (km: number) => void;
  userAddress: string;
  setUserAddress: (addr: string) => void;
}

export const PickupPointSelectorModal: React.FC<PickupPointSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedPoint,
  onSelectPoint,
  alternativePoints = [],
  onUpdateAlternativePoints,
  fallbackStrategy = 'NEAREST',
  onChangeFallbackStrategy,
  maxDistanceKm = 2,
  onChangeMaxDistanceKm,
  userAddress,
  setUserAddress,
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'alternatives' | 'strategy'>('main');
  const [searchInput, setSearchInput] = useState(userAddress || 'Milano');
  const [points, setPoints] = useState<VintedPickupPoint[]>(SAMPLE_PICKUP_POINTS_MILAN);
  const [isLocating, setIsLocating] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;
    setUserAddress(searchInput.trim());
    const results = getNearbyPickupPoints(searchInput.trim(), 'Italia');
    setPoints(results);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalizzazione non supportata dal tuo browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setIsLocating(false);
        const autoAddr = 'La tua posizione attuale (GPS)';
        setSearchInput(autoAddr);
        setUserAddress(autoAddr);
        const results = getNearbyPickupPoints('Vicino a te', 'Italia');
        setPoints(results);
      },
      () => {
        setIsLocating(false);
        alert('Impossibile rilevare la posizione GPS. Inserisci il tuo indirizzo o CAP manualmente.');
      },
      { timeout: 8000 }
    );
  };

  const handleAddAlternative = (pt: VintedPickupPoint) => {
    if (!onUpdateAlternativePoints) return;
    if (selectedPoint?.id === pt.id) {
      alert('Questo punto è già il tuo punto principale.');
      return;
    }
    if (alternativePoints.some((a) => a.id === pt.id)) return;
    onUpdateAlternativePoints([...alternativePoints, pt]);
  };

  const handleRemoveAlternative = (id: string) => {
    if (!onUpdateAlternativePoints) return;
    onUpdateAlternativePoints(alternativePoints.filter((a) => a.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                Punto di Ritiro & Punti Alternativi
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                  QuickBuy
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Configura il locker principale e le riserve in caso di indisponibilità
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/70 p-1 text-xs">
          <button
            onClick={() => setActiveTab('main')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all text-center ${
              activeTab === 'main'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Punto Principale
          </button>
          <button
            onClick={() => setActiveTab('alternatives')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'alternatives'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Punti Alternativi ({alternativePoints.length})
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all text-center ${
              activeTab === 'strategy'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Strategia Fallback
          </button>
        </div>

        {/* TAB 1: MAIN PICKUP POINT */}
        {activeTab === 'main' && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Search Bar & GPS button */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-950/60 space-y-2.5">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Indirizzo casa, via, o CAP (es. Via Roma 10, Milano)..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-teal-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs transition-colors shrink-0 shadow-sm"
                >
                  Cerca
                </button>
              </form>

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-teal-300 border border-zinc-800 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Navigation className={`w-3.5 h-3.5 text-teal-400 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Rilevamento GPS...' : '📍 Usa la mia posizione attuale (GPS)'}</span>
              </button>
            </div>

            {/* List of Nearby Pickup Points */}
            <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Punti Vinted ordinati per vicinanza da casa:</span>
                <span className="text-teal-400 font-bold">{points.length} punti disponibili</span>
              </div>

              {points.map((pt, idx) => {
                const isSelected = selectedPoint?.id === pt.id;
                const isClosest = idx === 0;

                return (
                  <div
                    key={pt.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2 relative ${
                      isSelected
                        ? 'bg-teal-950/30 border-teal-400 ring-2 ring-teal-500/40 shadow-lg shadow-teal-500/10'
                        : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-white text-xs sm:text-sm">
                            {pt.name}
                          </span>
                          {isClosest && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-400" /> PIÙ VICINO
                            </span>
                          )}
                          {pt.isLocker247 && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/40 text-[9px] font-bold">
                              LOCKER 24/7
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-zinc-300 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                          <span>{pt.address}, {pt.city}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-black text-teal-300 block">
                          {pt.distanceMeters < 1000
                            ? `${pt.distanceMeters}m da casa`
                            : `${(pt.distanceMeters / 1000).toFixed(1)}km`}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          Sped. €{pt.shippingFee.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span className="truncate">{pt.openingHours}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAddAlternative(pt)}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                          title="Aggiungi come punto alternativo di riserva"
                        >
                          + Alternativo
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPoint(pt);
                            onClose();
                          }}
                          className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                            isSelected
                              ? 'bg-teal-500 text-zinc-950'
                              : 'bg-zinc-800 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          }`}
                        >
                          {isSelected ? 'Principale ✓' : 'Scegli Principale'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ALTERNATIVE PICKUP POINTS */}
        {activeTab === 'alternatives' && (
          <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
            <div className="p-3 rounded-2xl bg-teal-950/20 border border-teal-500/30 text-zinc-300 space-y-1">
              <span className="font-bold text-teal-300 block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Punti Alternativi di Riserva
              </span>
              <p className="text-[11px] text-zinc-400">
                Se il punto principale (es. Locker) dovesse essere momentaneamente pieno o non selezionabile dal venditore, l'app sceglierà automaticamente il primo punto di riserva disponibile.
              </p>
            </div>

            {alternativePoints.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 space-y-2">
                <Package className="w-8 h-8 mx-auto text-zinc-600" />
                <p>Nessun punto alternativo aggiunto.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('main')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-teal-400 font-bold text-xs hover:bg-zinc-700"
                >
                  Sfoglia punti e clicca "+ Alternativo"
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {alternativePoints.map((alt, idx) => (
                  <div
                    key={alt.id}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-bold">
                          Riserva #{idx + 1}
                        </span>
                        <span className="font-bold text-white truncate">{alt.name}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">{alt.address}, {alt.city}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold text-teal-300">
                        {alt.distanceMeters}m
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAlternative(alt.id)}
                        className="p-1 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Rimuovi punto alternativo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FALLBACK STRATEGY */}
        {activeTab === 'strategy' && (
          <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">
                Regola di selezione automatica del punto di ritiro
              </h4>
              <p className="text-zinc-400 text-xs">
                Definisce il comportamento quando un articolo viene acquistato all'istante:
              </p>
            </div>

            <div className="space-y-2">
              <label
                onClick={() => onChangeFallbackStrategy && onChangeFallbackStrategy('NEAREST')}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  fallbackStrategy === 'NEAREST'
                    ? 'bg-teal-950/20 border-teal-400 ring-1 ring-teal-400'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="fallback"
                  checked={fallbackStrategy === 'NEAREST'}
                  onChange={() => {}}
                  className="mt-0.5 accent-teal-400"
                />
                <div className="space-y-0.5">
                  <strong className="text-white block font-bold">1. Sempre il più vicino a casa</strong>
                  <p className="text-zinc-400 text-[11px]">
                    Se il punto principale non è disponibile, seleziona in automatico il punto con la minor distanza assoluta dalla tua abitazione.
                  </p>
                </div>
              </label>

              <label
                onClick={() => onChangeFallbackStrategy && onChangeFallbackStrategy('ONLY_247_LOCKER')}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  fallbackStrategy === 'ONLY_247_LOCKER'
                    ? 'bg-teal-950/20 border-teal-400 ring-1 ring-teal-400'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="fallback"
                  checked={fallbackStrategy === 'ONLY_247_LOCKER'}
                  onChange={() => {}}
                  className="mt-0.5 accent-teal-400"
                />
                <div className="space-y-0.5">
                  <strong className="text-white block font-bold">2. Massima disponibilità (Solo Locker InPost 24/7)</strong>
                  <p className="text-zinc-400 text-[11px]">
                    Privilegia solo punti automatici con ritiro h24, senza vincoli di orari di apertura o chiusure domenicali.
                  </p>
                </div>
              </label>

              <label
                onClick={() => onChangeFallbackStrategy && onChangeFallbackStrategy('FIRST_AVAILABLE')}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  fallbackStrategy === 'FIRST_AVAILABLE'
                    ? 'bg-teal-950/20 border-teal-400 ring-1 ring-teal-400'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="fallback"
                  checked={fallbackStrategy === 'FIRST_AVAILABLE'}
                  onChange={() => {}}
                  className="mt-0.5 accent-teal-400"
                />
                <div className="space-y-0.5">
                  <strong className="text-white block font-bold">3. Riserva sequenziale configurata</strong>
                  <p className="text-zinc-400 text-[11px]">
                    Segue strettamente l'ordine della tua lista personalizzata di punti alternativi (#1, #2, #3).
                  </p>
                </div>
              </label>
            </div>

            {/* Max distance slider */}
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                <span>Raggio massimo consentito da casa:</span>
                <span className="text-teal-400 font-mono">{maxDistanceKm} km</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={maxDistanceKm}
                onChange={(e) => onChangeMaxDistanceKm && onChangeMaxDistanceKm(Number(e.target.value))}
                className="w-full accent-teal-400"
              />
              <p className="text-[10px] text-zinc-500">
                I punti situati oltre {maxDistanceKm} km non verranno mai selezionati automaticamente.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="truncate">Attuale: <strong className="text-white">{selectedPoint?.name || 'Nessuno'}</strong></span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-colors shrink-0"
          >
            Chiudi & Conferma
          </button>
        </div>

      </div>
    </div>
  );
};
