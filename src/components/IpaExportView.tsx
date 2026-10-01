import React, { useState } from 'react';
import { 
  Download, 
  ExternalLink, 
  Github, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Copy, 
  Check, 
  Lock 
} from 'lucide-react';
import fynditIcon from '../assets/images/fyndit_icon_1790842000865.jpg';

export const IpaExportView: React.FC = () => {
  const repoUrl = 'https://github.com/roccomiceli60-star/fyndit-vinted-monitor';
  const actionsUrl = `${repoUrl}/actions`;

  const [githubToken, setGithubToken] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const gitPushCommand = `git remote set-url origin https://<TUO_TOKEN_GITHUB>@github.com/roccomiceli60-star/fyndit-vinted-monitor.git\ngit branch -M main\ngit push -u origin main --force`;

  const handlePushToGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubToken.trim()) return;

    setIsPushing(true);
    setPushStatus(null);

    try {
      const res = await fetch('/api/github-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken.trim(),
          repo: 'roccomiceli60-star/fyndit-vinted-monitor',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPushStatus({
          success: true,
          message: '✓ Modifiche applicate e pushate con successo su GitHub su roccomiceli60-star/fyndit-vinted-monitor!',
        });
        setGithubToken('');
      } else {
        setPushStatus({
          success: false,
          message: data.error || 'Errore durante il push. Verifica che il token abbia i permessi repo (write).',
        });
      }
    } catch (err: any) {
      setPushStatus({
        success: false,
        message: err.message || 'Errore di connessione al server',
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(gitPushCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

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
              <h2 className="text-xl font-extrabold text-white">Fyndit per iOS & Repository GitHub</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60">
                Sincronizzazione
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Repository: <strong>roccomiceli60-star/fyndit-vinted-monitor</strong>. Scarica l'archivio ZIP aggiornato o effettua il push automatico.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <a
            href="/api/download-ipa"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Scarica FynditExport.ipa
          </a>
          <a
            href="/api/download-zip"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-cyan-500/40"
          >
            <Download className="w-4 h-4" />
            Scarica ZIP Progetto
          </a>
          <a
            href={actionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-zinc-700"
          >
            <Github className="w-4 h-4" />
            GitHub Actions CI
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* GitHub Push Integration Box */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm">
          <UploadCloud className="w-5 h-5" />
          <span>Applica e Pusha le Modifiche su GitHub</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Inserisci il tuo <strong>GitHub Personal Access Token (PAT)</strong> per eseguire il push automatico di tutti i file aggiornati direttamente sul ramo <code>main</code> della repository:
        </p>

        <form onSubmit={handlePushToGithub} className="space-y-3">
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="Incolla il tuo token GitHub (es. ghp_...)"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] text-zinc-500">
              Il token deve avere il permesso <code>repo</code> (read/write contents).
            </span>
            <button
              type="submit"
              disabled={isPushing || !githubToken.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              {isPushing ? 'Invio push in corso...' : 'Esegui Push su GitHub'}
            </button>
          </div>
        </form>

        {pushStatus && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
              pushStatus.success
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}
          >
            {pushStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{pushStatus.message}</span>
          </div>
        )}

        {/* Alternative: Terminal Command */}
        <div className="pt-2 border-t border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              Oppure esegui da terminale sul tuo computer:
            </span>
            <button
              type="button"
              onClick={handleCopyCommand}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
            >
              {copiedCmd ? <><Check className="w-3.5 h-3.5" /> Copiato!</> : <><Copy className="w-3.5 h-3.5" /> Copia comandi</>}
            </button>
          </div>
          <pre className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto whitespace-pre">
            {gitPushCommand}
          </pre>
        </div>
      </div>

      {/* 3 Step Installation Guide for iOS */}
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

    </div>
  );
};
