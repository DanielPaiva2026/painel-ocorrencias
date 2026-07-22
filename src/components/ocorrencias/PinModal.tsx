'use client';

import { useState } from 'react';
import { Lock, X, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  loading?: boolean;
}

export function PinModal({ isOpen, onClose, onSuccess, loading }: Props) {
  const [pin, setPin] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full max-w-sm p-6 rounded-2xl relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2 text-slate-800">
            <Lock className="w-5 h-5" />
            <h2 className="text-xl font-bold tracking-tight">Autorização Necessária</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-slate-500 mb-4">
          Por favor, insira o PIN de administrador para prosseguir com esta ação.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); onSuccess(pin); }}>
          <input 
            type="password" 
            autoFocus
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full text-center text-2xl tracking-widest rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all"
            placeholder="••••••"
          />

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={!pin || loading} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white flex justify-center items-center px-4 py-2 text-sm font-medium rounded-xl shadow-sm transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
