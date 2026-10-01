import React, { useState } from 'react';
import { 
  Bot, 
  Zap, 
  ShieldCheck, 
  Sliders, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Cpu, 
  Gauge
} from 'lucide-react';
import { AutocopLog } from '../types';

export const AutocopSimulator: React.FC = () => {
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [simStep, setSimStep] = useState<string | null>(null);
  const [reactionMs, setReactionMs] = useState<number | null>(null);

  // Settings
  const [minDiscount, setMinDiscount] = useState<number>(50);
  const [maxSpend, setMaxSpend] = useState<number>(75);
  const [autoOffer, setAutoOffer] = useState<boolean>(true);
  const [autoOfferPercent, setAutoOfferPercent] = useState<number>(20);

  const [logs, setLogs] = useState<AutocopLog[]>([
    {
      id: 'log-1',
      itemTitle: 'Trapstar Chenille Decoded Tracksuit M',
      brand: 'Trapstar',
      price: 65,
      reactionTimeMs: 184,
      status: 'SUCCESS',
      timestamp: '01:04:12',
    },
    {
      id: 'log-2',
      itemTitle: 'Nike Dunk Low Panda 42',
      brand: 'Nike',
      price: 38,
      reactionTimeMs: 210,
      status: 'SUCCESS',
      timestamp: '00:58:34',
    },
    {
      id: 'log-3',
      itemTitle: 'Giacca Carhartt Detroit XL',
      brand: 'Carhartt',
      price: 49,
      reactionTimeMs: 340,
      status: 'MISSED',
      timestamp: '00:41:19',
    },
  ]);

  const runSimulation = () => {
    setIsRunningSim(true);
    setSimStep('1/3: Rilevamento annuncio (Websocket streaming)...');
    setReactionMs(null);

    setTimeout(() => {
      setSimStep('2/3: Calcolo deal score e verifica condizioni...');
      setTimeout(() => {
        setSimStep('3/3: Esecuzione checkout tokenizzato su Vinted API...');
        setTimeout(() => {
          const time = Math.floor(Math.random() * 120) + 140; // 140ms - 260ms
          setReactionMs(time);
          setSimStep(null);
          setIsRunningSim(false);

          setLogs((prev) => [
            {
              id: `log-${Date.now()}`,
              itemTitle: 'Stussy 8 Ball Fleece Reversible M',
              brand: 'Stussy',
              price: 55,
              reactionTimeMs: time,
              status: 'SUCCESS',
              timestamp: new Date().toLocaleTimeString(),
            },
            ...prev,
          ]);
        }, 350);
      }, 300);
    }, 250);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Banner */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-white">Autocop & Auto-Offer Engine</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 font-semibold border border-violet-800/50">
              High-Speed Sniper
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Simula l'acquisto o l'offerta automatica a velocità supersonica (150-250ms) per accaparrarti gli affari prima di chiunque altro
          </p>
        </div>

        <button
          onClick={runSimulation}
          disabled={isRunningSim}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20 active:scale-95 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-white" />
          {isRunningSim ? 'Sniper in corso...' : 'Avvia Simulazione Autocop'}
        </button>
      </div>

      {/* Simulation Live Status */}
      {isRunningSim && (
        <div className="p-4 rounded-xl bg-violet-950/40 border border-violet-800/60 flex items-center gap-3 animate-pulse">
          <Cpu className="w-5 h-5 text-cyan-400 animate-spin" />
          <div className="text-xs font-semibold text-cyan-200">{simStep}</div>
        </div>
      )}

      {reactionMs && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Autocop Riuscito! Tempo di reazione del bot:
          </div>
          <div className="text-lg font-black text-emerald-400 font-mono">
            ⚡ {reactionMs} ms
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Settings Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-violet-400" />
              Configurazione Trigger Sniper
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <div className="flex items-center justify-between mb-1.5 font-semibold text-zinc-300">
                  <span>Sconto Minimo dal Valore di Mercato:</span>
                  <span className="text-cyan-400 font-bold">-{minDiscount}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  step="5"
                  value={minDiscount}
                  onChange={(e) => setMinDiscount(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1.5">
                  Tetto Massimo di Spesa per Articolo (€)
                </label>
                <input
                  type="number"
                  value={maxSpend}
                  onChange={(e) => setMaxSpend(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Auto Offer Toggle */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-zinc-200">Auto-Offer (Offerta Rapida)</div>
                    <div className="text-[11px] text-zinc-400">Invia automaticamente un'offerta ribassata al venditore</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoOffer}
                    onChange={(e) => setAutoOffer(e.target.checked)}
                    className="w-5 h-5 accent-violet-500 rounded cursor-pointer"
                  />
                </div>

                {autoOffer && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5 font-semibold text-zinc-300">
                      <span>Percentuale di ribasso offerta:</span>
                      <span className="text-violet-400 font-bold">-{autoOfferPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      step="5"
                      value={autoOfferPercent}
                      onChange={(e) => setAutoOfferPercent(Number(e.target.value))}
                      className="w-full accent-violet-500 cursor-pointer"
                    />
                    <div className="text-[10px] text-zinc-500 mt-1">
                      (Vinted consente un'offerta massima di sconto fino al -40%)
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Live Execution Logs Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                Registro Esecuzioni Sniper (Session Logs)
              </h3>
              <span className="text-[11px] text-zinc-500 font-mono">Latenza Media: 198ms</span>
            </div>

            <div className="space-y-2.5">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-zinc-200">{log.itemTitle}</div>
                    <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                      <span>{log.timestamp}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">€{log.price}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    {log.status === 'SUCCESS' ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                        Preso in {log.reactionTimeMs}ms
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 font-bold text-[11px]">
                        Perso (+{log.reactionTimeMs}ms)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
