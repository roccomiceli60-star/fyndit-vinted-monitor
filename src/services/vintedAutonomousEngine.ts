import { VintedListing } from '../types';
import { INITIAL_LISTINGS } from '../data/mockDeals';

let dropIndex = 0;

export function generateNextAutonomousDrop(): VintedListing {
  const item = INITIAL_LISTINGS[dropIndex % INITIAL_LISTINGS.length];
  dropIndex++;
  return {
    ...item,
    id: `vnt-${item.rawId || Date.now()}-${dropIndex}`,
    publishedSecondsAgo: Math.floor(Math.random() * 4) + 1,
    isNewDrop: true,
  };
}

export function searchClientItems(query: string, brand: string, currentPool: VintedListing[]): VintedListing[] {
  let results = [...currentPool];

  const q = query.toLowerCase().trim();
  if (q) {
    results = results.filter((it) => 
      it.title.toLowerCase().includes(q) ||
      it.brand.toLowerCase().includes(q) ||
      it.category.toLowerCase().includes(q)
    );
  }

  if (brand && brand !== 'Tutti') {
    results = results.filter((it) => 
      it.brand.toLowerCase().includes(brand.toLowerCase()) ||
      it.title.toLowerCase().includes(brand.toLowerCase())
    );
  }

  return results;
}

export function playAlertChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.26);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([30, 40, 30]);
    }
  } catch {
    // Ignore restricted audio
  }
}
