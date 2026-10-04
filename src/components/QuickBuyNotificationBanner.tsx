import React from 'react';
import { Flame, Zap, X, MapPin } from 'lucide-react';
import { VintedListing, VintedPickupPoint } from '../types';

interface QuickBuyNotificationBannerProps {
  item: VintedListing | null;
  pickupPoint?: VintedPickupPoint;
  onBuyNow: (item: VintedListing) => void;
  onDismiss: () => void;
}

export const QuickBuyNotificationBanner: React.FC<QuickBuyNotificationBannerProps> = ({
  item,
  pickupPoint,
  onBuyNow,
  onDismiss,
}) => {
  if (!item) return null;

  const matchPercent = item.matchScore || 98;
  const pFee = pickupPoint?.shippingFee || 2.89;
  const bFee = Number((0.70 + item.price * 0.05).toFixed(2));
  const total = item.price + pFee + bFee;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top-6 duration-300">
      <div className="p-4 rounded-3xl bg-zinc-950/95 border-2 border-amber-500/70 shadow-[0_0_40px_rgba(245,158,11,0.35)] backdrop-blur-2xl text-white space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500 text-zinc-950 animate-bounce">
              <Flame className="w-4 h-4 fill-zinc-950" />
            </span>
            <span className="font-black text-sm tracking-wide text-amber-400 uppercase">
              🔥 NUOVO ARTICOLO TROVATO
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/40">
              Match: {matchPercent}%
            </span>
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Chiudi notifica"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Item Info Card */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800/80">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-14 h-14 rounded-xl object-cover bg-zinc-950 shrink-0 border border-zinc-700/60"
          />
          <div className="min-w-0 flex-1 space-y-0.5 text-xs">
            <div className="text-zinc-300 flex items-center gap-1.5">
              <strong className="text-white uppercase font-black">{item.brand}</strong>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">Taglia: <strong className="text-white">{item.size || 'Unica'}</strong></span>
            </div>
            <div className="text-zinc-200 font-semibold truncate text-[11px]">
              {item.model || item.title}
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-base font-black font-mono text-emerald-400">
                €{item.price.toFixed(2)}
              </span>
              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-400" />
                {pickupPoint?.carrier.split(' ')[0] || 'Locker'} ({pickupPoint?.distanceMeters || 130}m)
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            onBuyNow(item);
            onDismiss();
          }}
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-teal-400 to-[#09B1BA] hover:brightness-110 active:scale-98 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-zinc-950" />
          <span>ACQUISTA ORA (€{total.toFixed(2)})</span>
        </button>

      </div>
    </div>
  );
};
