import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Flame, 
  AlertTriangle, 
  Percent, 
  Euro, 
  ShieldCheck
} from 'lucide-react';
import { ResellPlatform, VintedListing } from '../types';
import { calculateResellProfit } from '../utils/calculator';

interface ProfitCalculatorProps {
  initialItem?: VintedListing | null;
}

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ initialItem }) => {
  const [buyPrice, setBuyPrice] = useState<number>(initialItem ? initialItem.price : 40);
  const [shippingCost, setShippingCost] = useState<number>(2.99);
  const [resellPrice, setResellPrice] = useState<number>(initialItem ? initialItem.marketValue : 110);
  const [platform, setPlatform] = useState<ResellPlatform>('vinted');

  useEffect(() => {
    if (initialItem) {
      setBuyPrice(initialItem.price);
      setResellPrice(initialItem.marketValue);
    }
  }, [initialItem]);

  const result = calculateResellProfit({
    buyPrice,
    shippingCost,
    resellPrice,
    platform,
  });

  const loadPreset = (buy: number, resell: number, plat: ResellPlatform = 'vinted') => {
    setBuyPrice(buy);
    setResellPrice(resell);
    setPlatform(plat);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Calcolatore Margini & Reselling Vinted</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-semibold border border-emerald-800/50">
              Formula Ufficiale Vinted 2026
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Calcola la protezione acquisti esatta (0,70€ + 5%), spedizione, commissioni di piattaforma e profitto netto
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-zinc-500 font-medium">Esempi rapidi:</span>
          <button
            onClick={() => loadPreset(65, 185, 'vinted')}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors"
          >
            Trapstar (65€ → 185€)
          </button>
          <button
            onClick={() => loadPreset(38, 110, 'stockx')}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors"
          >
            Dunk Panda (38€ → 110€)
          </button>
          <button
            onClick={() => loadPreset(25, 80, 'vinted')}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors"
          >
            Ralph Lauren (25€ → 80€)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Parameters (Cols 1-7) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
              <Euro className="w-4 h-4 text-cyan-400" />
              1. Costi di Acquisto su Vinted
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Prezzo Inserzione Vinted (€)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-zinc-500 font-bold">€</span>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(Number(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-white font-bold text-base focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center justify-between">
                  <span>Spedizione Stimata (€)</span>
                  <span className="text-[11px] text-zinc-500">InPost / Locker</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-zinc-500 font-bold">€</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(Number(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-white font-bold text-base focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Buyer Protection Breakdown info */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Protezione Acquisti Vinted (0,70€ + 5%):</span>
              </div>
              <span className="font-bold text-cyan-300">
                +€{result.buyerProtection.toFixed(2)}
              </span>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-sm">
              <span className="text-zinc-400 font-medium">Totale Spesa per Comprare:</span>
              <span className="font-extrabold text-white text-base">
                €{result.totalCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Resell Stage */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              2. Rivendita & Piattaforma
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Prezzo Stimato di Rivendita (€)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-zinc-500 font-bold">€</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={resellPrice}
                    onChange={(e) => setResellPrice(Number(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-emerald-400 font-black text-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Canale di Vendita
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as ResellPlatform)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-semibold text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="vinted">Vinted (0% commissioni venditore)</option>
                  <option value="wallapop">Wallapop (0% commissioni)</option>
                  <option value="stockx">StockX (~12% commissioni)</option>
                  <option value="ebay">eBay (~11.5% commissioni)</option>
                  <option value="private">Privato / A mano (0% commissioni)</option>
                </select>
              </div>
            </div>

            {result.platformFee > 0 && (
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 flex items-center justify-between text-xs">
                <span className="text-rose-300">Commissioni di vendita ({platform}):</span>
                <span className="font-bold text-rose-400">-€{result.platformFee.toFixed(2)}</span>
              </div>
            )}
          </div>

        </div>

        {/* Results Card (Cols 8-12) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Verdetto Affare
              </span>
              {result.rating === 'SUPER_STEAL' && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-xs flex items-center gap-1 shadow-md shadow-amber-500/10">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  SUPER STEAL 🔥
                </span>
              )}
              {result.rating === 'BUON_MARGINE' && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  BUON MARGINE
                </span>
              )}
              {result.rating === 'RISCHIOSO' && (
                <span className="px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-bold text-xs flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  MARGINE BASSO
                </span>
              )}
              {result.rating === 'IN_PERDITA' && (
                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1">
                  IN PERDITA ⚠️
                </span>
              )}
            </div>

            {/* Profit Hero */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
              <div className="text-xs font-medium text-zinc-400">Profitto Netto Stimato</div>
              <div className={`text-4xl font-black tracking-tight ${result.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.netProfit >= 0 ? `+€${result.netProfit.toFixed(2)}` : `-€${Math.abs(result.netProfit).toFixed(2)}`}
              </div>
              <div className="text-xs font-bold text-cyan-400 flex items-center justify-center gap-1 mt-1">
                <Percent className="w-3.5 h-3.5" /> ROI: {result.roiPercent}%
              </div>
            </div>

            {/* Detailed Financial Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-zinc-400">
                <span>Prezzo Articolo:</span>
                <span className="font-semibold text-zinc-200">€{result.buyPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-zinc-400">
                <span>Protezione Acquisti Vinted:</span>
                <span className="font-semibold text-zinc-200">€{result.buyerProtection.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-zinc-400">
                <span>Spedizione:</span>
                <span className="font-semibold text-zinc-200">€{result.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-zinc-300 font-bold">
                <span>Investimento Totale:</span>
                <span className="font-bold text-white">€{result.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-zinc-400">
                <span>Incasso Lordo Rivendita:</span>
                <span className="font-semibold text-emerald-400">€{result.resellPrice.toFixed(2)}</span>
              </div>
              {result.platformFee > 0 && (
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-rose-400">
                  <span>Trattenute {result.platform}:</span>
                  <span className="font-semibold">-€{result.platformFee.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Insight Note */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-900/50 text-[11px] text-cyan-300 leading-relaxed">
              💡 <strong>Regola d'oro Fyndit</strong>: Punta a capi con un ROI superiore al <strong>50%</strong> e almeno <strong>25€ di utile netto</strong> per assorbire tempi di vendita o leggere trattative dell'acquirente.
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
