import React from 'react';
import { 
  BookOpen, 
  Send, 
  ShieldAlert, 
  HelpCircle, 
  FileText, 
  ExternalLink,
  Flame,
  CheckCircle2
} from 'lucide-react';

export const GuidesView: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Guida Definitiva al Reselling Vinted (Fyndit Academy)</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 font-semibold border border-blue-800/50">
            Strategie Pro 2026
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Tutto quello che devi sapere per trovare affari prima degli altri, evitare truffe e massimizzare i tuoi profitti
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: Webhook Discord */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Send className="w-4 h-4" />
            1. Come ricevere gli Alert Istantanei su Discord
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Per ricevere le notifiche sul telefono prima di chiunque altro senza ritardi:
          </p>
          <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside">
            <li>Crea un canale privato nel tuo server Discord personale (es. <code>#vinted-deals</code>).</li>
            <li>Vai su <strong>Impostazioni Canale → Integrazioni → Webhook</strong> e clicca su "Nuovo Webhook".</li>
            <li>Copia l'URL del Webhook e incollalo nel configuratore monitor di Fyndit.</li>
            <li>Attiva le notifiche push di Discord sull'app del tuo iPhone per ricevere l'avviso in meno di <strong>0,2 secondi</strong> dalla pubblicazione!</li>
          </ul>
        </div>

        {/* Card 2: I Brand più redditizi */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Flame className="w-4 h-4 fill-amber-400" />
            2. I Brand con il ROI più alto su Vinted
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Gli articoli più ricercati e facili da rivendere con oltre il 60% di ricarico:
          </p>
          <ul className="text-xs text-zinc-300 space-y-1.5">
            <li>• <strong>Trapstar</strong>: Tute Chenille, giacche Decoded Hyperdrive (compra a 40-70€, rivendi a 130-180€).</li>
            <li>• <strong>Ralph Lauren</strong>: Maglioni a trecce, felpe zip e camicie oxford (compra a 15-25€, rivendi a 50-80€).</li>
            <li>• <strong>Carhartt Vintage</strong>: Giacche Detroit e giubbotti Active logorati (compra a 30-50€, rivendi a 120-160€).</li>
            <li>• <strong>Corteiz & Stussy</strong>: Pantaloni tuta, magliette e pile 8-Ball (vendita rapidissima in meno di 24h).</li>
          </ul>
        </div>

        {/* Card 3: Evitare Repliche & Fake */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            3. Come riconoscere i Falsi (Legit Check)
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            I prezzi troppo bassi spesso nascondono repliche dalla Cina (Taobao/Weidian):
          </p>
          <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside">
            <li><strong>Etichette interne (Wash tag)</strong>: Controlla sempre la foto del codice articolo interno e i font dei caratteri di lavaggio.</li>
            <li><strong>Profilo del venditore</strong>: Diffida di profili con 0 recensioni, foto stock prese da internet o account creati da poche ore.</li>
            <li><strong>Dettagli costruttivi</strong>: Su Trapstar controlla la spaziatura delle lettere in ciniglia; su Ralph Lauren la precisione del logo del giocatore di polo ricamato.</li>
          </ul>
        </div>

        {/* Card 4: Fisco e Direttiva DAC7 */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <FileText className="w-4 h-4" />
            4. Fisco e Limiti DAC7 in Italia
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            In base alla Direttiva Europea DAC7 (D.Lgs. 32/2023), Vinted è tenuto a trasmettere all'Agenzia delle Entrate i dati degli utenti che in un anno solare superano:
          </p>
          <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside">
            <li><strong>30 vendite concluse</strong> oppure</li>
            <li><strong>2.000 € di incasso totale lordo</strong>.</li>
          </ul>
          <p className="text-[11px] text-zinc-400 mt-2">
            La comunicazione è automatica per trasparenza fiscale. La vendita occasionale di beni personali usati non costituisce reddito imponibile se non esercitata come attività d'impresa continuativa.
          </p>
        </div>

      </div>

    </div>
  );
};
