import { VintedListing } from '../types';

let audioCtx: AudioContext | null = null;

export function playQuickBuyNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // High energy 2-tone notification
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.12); // E6
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second chime
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1760, now + 0.1); // A6
    gain2.gain.setValueAtTime(0.2, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.45);

    // Device vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 150]);
    }
  } catch {
    // Audio/Vibration not permitted without user gesture
  }
}

export function requestPushNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }
}

export function triggerSystemPushNotification(item: VintedListing, matchScore: number) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('🔥 NUOVO ARTICOLO TROVATO', {
        body: `Marca: ${item.brand}\nModello: ${item.model || item.title}\nTaglia: ${item.size || 'Unica'}\nPrezzo: €${item.price.toFixed(2)}\nMatch: ${matchScore}%`,
        icon: item.imageUrl,
      });
    } catch {
      // ignore
    }
  }
}

