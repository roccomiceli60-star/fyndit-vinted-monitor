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
  ChevronRight
} from 'lucide-react';
import { VintedPickupPoint } from '../types';
import { SAMPLE_PICKUP_POINTS_MILAN, getNearbyPickupPoints } from '../data/pickupPoints';

interface PickupPointSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPoint: VintedPickupPoint | null;
  onSelectPoint: (point: VintedPickupPoint) => void;
  userAddress: string;
  setUserAddress: (addr: string) => void;
}

export const PickupPointSelectorModal: React.FC<PickupPointSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedPoint,
  onSelectPoint,
  userAddress,
  setUserAddress,
}) => {
  const [searchInput, setSearchInput] = useState(userAddress || 'Milano');
  const [points, setPoints] = useState<VintedPickupPoint[]>(
    SAMPLE_PICKUP_POINTS_MILAN
  );
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
      (pos) => {
        setIsLocating(false);
        const autoAddr = 'La tua posizione attuale (GPS)';
        setSearchInput(autoAddr);
        setUserAddress(autoAddr);
        const results = getNearbyPickupPoints('Vicino a te', 'Italia');
        setPoints(results);
      },
      (err) => {
        setIsLocating(false);
        alert('Impossibile rilevare la posizione GPS. Inserisci il tuo indirizzo o CAP manualmente.');
      },
      { timeout: 8000 }
    );
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
                Punto di Ritiro & Locker Vinted
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                  Più vicino a casa
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Scegli dove ritirare i tuoi acquisti Vinted in 1 clic
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

        {/* Search Bar & GPS button */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/60 space-y-2.5">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Inserisci indirizzo di casa, via o CAP..."
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
            className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-teal-300 border border-zinc-800 text-xs font-medium flex items-center justify-center gap-2 transition-all"
          >
            <Navigation className={`w-3.5 h-3.5 text-teal-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Rilevamento GPS in corso...' : 'Usa la mia posizione attuale (GPS)'}</span>
          </button>
        </div>

        {/* List of Nearby Pickup Points */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Punti disponibili ordinati per distanza:</span>
            <span className="text-teal-400 font-bold">{points.length} punti trovati</span>
          </div>

          {points.map((pt, idx) => {
            const isSelected = selectedPoint?.id === pt.id;
            const isClosest = idx === 0;

            return (
              <div
                key={pt.id}
                onClick={() => {
                  onSelectPoint(pt);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 relative ${
                  isSelected
                    ? 'bg-teal-950/30 border-teal-400 ring-2 ring-teal-500/40 shadow-lg shadow-teal-500/10'
                    : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
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

                  <div className="flex items-center gap-1 text-teal-400 font-semibold shrink-0 ml-2">
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-teal-300 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 fill-teal-400/20" /> Selezionato
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 hover:underline">
                        Scegli <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            Punto di ritiro salvato in automatico per tutti gli acquisti
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-colors"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
