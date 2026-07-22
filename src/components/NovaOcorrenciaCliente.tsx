'use client';

import { useState } from 'react';
import { AlertCircle, X, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

export function NovaOcorrenciaCliente() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Para o cliente, não exigimos ID do colaborador (ele pode não saber).
    // Usamos o campo observacao para enviar todos os dados.
    const nomeColaborador = formData.get('nome') as string;
    const dataHora = formData.get('data') as string;
    const tipo = formData.get('tipo') as string;
    const observacaoUser = formData.get('observacao') as string;
    
    const obsCompleta = `Informado pelo Cliente: \nNome: ${nomeColaborador}\nData/Hora: ${dataHora}\nObs: ${observacaoUser}`;

    const dataOcorrencia = {
      colab_id: null, // Será ajustado no backend para permitir nulo, ou vincularemos a um colab "genérico" ou ajustamos o model.
      // Ops, colab_id é obrigatório na tabela atual. 
      // Para resolver sem quebrar o BD rápido: passaremos uma string vazia ou um mock e lidamos no backend.
      // O melhor é mudar o BD ou ter o "nome" na ocorrência. 
      // Como o colab_id é string, precisaremos ajustar o Prisma para opcional, ou pegar a observacao.
      // Vou usar um hack temporário: se não tiver colab, a gente manda um ID inválido e o backend lida, ou apenas mandamos sem ID e ajustamos a API para não quebrar.
      // Na verdade, a API precisa de colab_id. Vou passar para a API criar a ocorrência sem colab_id se a origem_informacao for Cliente.
      tipo: tipo,
      data: new Date(dataHora).toISOString(),
      observacao: obsCompleta,
      origem: 'SISTEMA',
      origem_informacao: 'Cliente'
    };
    
    await api.createOcorrenciaCliente(dataOcorrencia);
    setIsOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-brand-teal hover:bg-brand-cyan transition-colors text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-brand-cyan/20 flex items-center gap-2"
      >
        <AlertCircle className="w-5 h-5" />
        <span>Reportar Ocorrência</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-brand-teal" />
                Reportar Atraso ou Falta
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Tipo de Ocorrência</label>
                <select name="tipo" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal">
                  <option value="Falta">Falta (Não compareceu)</option>
                  <option value="Atraso">Atraso</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Nome do Profissional</label>
                <input name="nome" type="text" required placeholder="Digite o nome do funcionário" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal" />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Data e Hora do Ocorrido</label>
                <input name="data" type="datetime-local" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal" />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Observações Adicionais</label>
                <textarea name="observacao" rows={3} placeholder="Alguma observação importante?" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal resize-none" />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full bg-brand-teal hover:bg-brand-cyan text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-brand-teal/20 transition-colors flex justify-center items-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Ocorrência'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
