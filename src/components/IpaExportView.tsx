import React from 'react';
import { 
  Smartphone, 
  Download, 
  ExternalLink, 
  Github, 
  CheckCircle2, 
  ShieldCheck, 
  Apple, 
  Terminal,
  Zap
} from 'lucide-react';
import fynditIcon from '../assets/images/fyndit_icon_1790842000865.jpg';

export const IpaExportView: React.FC = () => {
  const repoUrl = 'https://github.com/roccomiceli60-star/fyndit-vinted-monitor';
  const actionsUrl = `${repoUrl}/actions`;
  const releasesUrl = `${repoUrl}/releases`;

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-cyan-950/60 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <img
            src={fynditIcon}
            alt="Fyndit App Icon"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-500/40 shadow-xl shadow-cyan-500/10"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Fyndit per iOS (File IPA)</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60">
                Flutter Nativo
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Repository dedicata creata su GitHub con pipeline CI automatica per generare il file <strong>FynditExport.ipa</strong> pronto per il tuo iPhone.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <a
            href={actionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Download className="w-4 h-4" />
            Scarica IPA su GitHub
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-zinc-700"
          >
            <Github className="w-4 h-4" />
            Apri Repository
          </a>
        </div>
      </div>

      {/* 3 Step Installation Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-sm flex items-center justify-center">
            1
          </div>
          <h3 className="font-bold text-zinc-100 text-sm">Scarica l'IPA compilato</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Vai su <strong>GitHub Actions</strong> o <strong>Releases</strong> della repository <code>fyndit-vinted-monitor</code> e scarica il file <code>FynditExport.ipa</code>.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-sm flex items-center justify-center">
            2
          </div>
          <h3 className="font-bold text-zinc-100 text-sm">Carica con Sideloadly o AltStore</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Collega il tuo iPhone al computer via cavo, apri Sideloadly (o AltStore), trascina il file IPA e inserisci il tuo Apple ID per firmarlo gratis.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-400 font-bold text-sm flex items-center justify-center">
            3
          </div>
          <h3 className="font-bold text-zinc-100 text-sm">Autorizza su iPhone</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Su iPhone vai in <strong>Impostazioni → Generali → VPN e gestione dispositivi</strong>, tocca il tuo Apple ID e premi "Autorizza sviluppatore". Fatto!
          </p>
        </div>

      </div>

      {/* Repository details */}
      <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Dati Repository GitHub
        </h4>
        <div className="p-3 rounded-xl bg-zinc-950 font-mono text-xs text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-zinc-800">
          <span>roccomiceli60-star/fyndit-vinted-monitor</span>
          <span className="text-emerald-400">● GitHub Actions macOS Runner (Xcode 15)</span>
        </div>
      </div>

    </div>
  );
};
