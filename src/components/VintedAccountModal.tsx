import React, { useState } from 'react';
import { 
  User, 
  CheckCircle2, 
  X, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Star, 
  LogOut, 
  Zap, 
  Sparkles,
  Lock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { VintedAccount, VintedPickupPoint } from '../types';

interface VintedAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: VintedAccount;
  onUpdateAccount: (account: VintedAccount) => void;
  onOpenPickupSelector: () => void;
}

export const VintedAccountModal: React.FC<VintedAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onUpdateAccount,
  onOpenPickupSelector,
}) => {
  const [username, setUsername] = useState(account.username || 'rocco_resell');
  const [email, setEmail] = useState(account.email || 'rocco.vinted@gmail.com');
  const [sessionToken, setSessionToken] = useState('');
  const [country, setCountry] = useState(account.country || 'Italia');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleConnectAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onUpdateAccount({
        ...account,
        isConnected: true,
        username: username.replace('@', '').trim() || 'utente_vinted',
        email: email.trim(),
        country,
        rating: 5.0,
        reviewCount: Math.max(account.reviewCount || 42, 42),
        paymentMethod: {
          type: 'Saldo Portafoglio Vinted + Carta di Credito',
          last4: '4821',
          balance: 145.50,
        },
        connectedAt: Date.now(),
      });
      onClose();
    }, 400);
  };

  const handleDisconnect = () => {
    onUpdateAccount({
      ...account,
      isConnected: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-6 flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#09B1BA]/10 border border-[#09B1BA]/30 text-[#09B1BA]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                Account Vinted Collegato
                {account.isConnected && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connesso
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-400">
                Acquisti diretti in-app e sincronizzazione punti di ritiro
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

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {account.isConnected ? (
            <div className="space-y-4">
              {/* Account Connected Card */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-teal-500/30 relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={account.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'}
                      alt={account.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-teal-400"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-zinc-950" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">
                      @{account.username}
                    </h4>
                    <p className="text-xs text-zinc-400 truncate">{account.email}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-300">
                      <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" /> {account.rating?.toFixed(1) || '5.0'}
                      </span>
                      <span className="text-zinc-500">·</span>
                      <span>{account.reviewCount || 84} recensioni</span>
                      <span className="text-zinc-500">·</span>
                      <span className="text-teal-400 font-medium">{account.country}</span>
                    </div>
                  </div>
                </div>

                {/* Balance & Payment Method */}
                <div className="mt-3 pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold">Saldo Portafoglio</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      €{(account.paymentMethod.balance || 145.50).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold">Metodo Pagamento</span>
                    <span className="text-xs font-bold text-zinc-200 truncate block mt-0.5">
                      💳 Mastercard •••• {account.paymentMethod.last4 || '4821'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferred Pickup Point */}
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    Punto di Ritiro Predefinito
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPickupSelector();
                    }}
                    className="text-[11px] font-bold text-teal-400 hover:text-teal-300 underline"
                  >
                    Cambia Punto
                  </button>
                </div>

                {account.preferredPickupPoint ? (
                  <div className="p-2.5 rounded-xl bg-teal-950/20 border border-teal-500/30 flex items-center justify-between text-xs gap-2">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">
                        {account.preferredPickupPoint.name}
                      </span>
                      <span className="text-zinc-400 text-[11px] block">
                        {account.preferredPickupPoint.address}, {account.preferredPickupPoint.city}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-teal-300 shrink-0">
                      a {account.preferredPickupPoint.distanceMeters}m da casa
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPickupSelector();
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-zinc-700 text-xs text-zinc-400 hover:text-teal-300 hover:border-teal-500 transition-colors text-center"
                  >
                    + Seleziona il Locker o Punto di Ritiro più vicino a te
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Disconnetti Account
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs transition-colors"
                >
                  Salva & Chiudi
                </button>
              </div>
            </div>
          ) : (
            /* Connect Form */
            <form onSubmit={handleConnectAccount} className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-teal-950/20 border border-teal-500/30 text-xs text-zinc-300 space-y-1">
                <div className="font-bold text-teal-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  Acquisto Diretto in 1 Clic
                </div>
                <p className="text-[11px] text-zinc-400">
                  Collegando il tuo account potrai comprare all'istante i drop più caldi senza uscire dall'app, facendoli arrivare al locker o punto di ritiro prescelto.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Nome Utente Vinted
                </label>
                <div className="relative">
                  <span className="text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold">@</span>
                  <input
                    type="text"
                    required
                    placeholder="es. rocco_resell"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Email Account Vinted
                </label>
                <input
                  type="email"
                  placeholder="tua.email@vinted.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Paese Principale Account
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="Italia">🇮🇹 Italia (vinted.it)</option>
                  <option value="Francia">🇫🇷 Francia (vinted.fr)</option>
                  <option value="Spagna">🇪🇸 Spagna (vinted.es)</option>
                  <option value="Germania">🇩🇪 Germania (vinted.de)</option>
                  <option value="Belgio">🇧🇪 Belgio (vinted.be)</option>
                  <option value="Portogallo">🇵🇹 Portogallo (vinted.pt)</option>
                  <option value="Paesi Bassi">🇳🇱 Paesi Bassi (vinted.nl)</option>
                  <option value="Austria">🇦🇹 Austria (vinted.at)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 rounded-full bg-[#09B1BA] hover:bg-teal-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-teal-500/20 active:scale-95"
                >
                  {isSaving ? 'Connessione in corso...' : '⚡ Collega Account & Abilita Acquisti In-App'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
