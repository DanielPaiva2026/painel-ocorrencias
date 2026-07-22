'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { KeyRound, Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TrocarSenhaModal({ onSucesso }: { onSucesso: () => void }) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (novaSenha.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('A confirmação da senha não confere.');
      return;
    }

    setLoading(true);
    try {
      const success = await api.trocarSenha(novaSenha);
      if (success) {
        // Atualizar cookie se necessário, ou apenas avisar sucesso
        alert('Senha atualizada com sucesso! Por favor, faça login novamente com a nova senha.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('auth_role');
        localStorage.removeItem('auth_precisa_trocar_senha');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/login';
      } else {
        setError('Ocorreu um erro ao tentar alterar a senha. Tente novamente.');
      }
    } catch (e) {
      setError('Falha na comunicação com o servidor.');
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Troca de Senha Obrigatória</h2>
          <p className="text-slate-500 text-sm mt-2">
            Por motivos de segurança, você precisa definir uma nova senha antes de continuar utilizando o sistema.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Nova Senha
            </label>
            <input 
              type="password" 
              required 
              value={novaSenha} 
              onChange={e => setNovaSenha(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
              placeholder="Digite sua nova senha"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Confirmar Nova Senha
            </label>
            <input 
              type="password" 
              required 
              value={confirmarSenha} 
              onChange={e => setConfirmarSenha(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
              placeholder="Digite a mesma senha novamente"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-teal hover:bg-brand-cyan text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-teal/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Atualizar Senha e Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}
