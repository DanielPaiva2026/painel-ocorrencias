'use client';

import { useState, useEffect } from 'react';
import { api, Ocorrencia } from '@/services/api';
import { PinModal } from '@/components/ocorrencias/PinModal';
import { FileText, Search, Trash2, Edit, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function HistoricoOcorrenciasPage() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Pin Modal State
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [actionData, setActionData] = useState<{ type: 'delete' | 'resolve', id: string } | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    const data = await api.getOcorrencias();
    // Sort by date desc
    data.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    setOcorrencias(data);
    setLoading(false);
  };

  const handleActionClick = (type: 'delete' | 'resolve', id: string) => {
    setActionData({ type, id });
    setIsPinOpen(true);
  };

  const handlePinSuccess = async (pin: string) => {
    if (!actionData) return;
    setPinLoading(true);
    
    let success = false;
    
    if (actionData.type === 'delete') {
      success = await api.deleteOcorrencia(actionData.id, pin);
    } else if (actionData.type === 'resolve') {
      // Usando update para simular um patch genérico ou podemos chamar resolve direto se o resolve nao pedir pin.
      // Aqui para simplificar, usaremos o update genérico que pede PIN
      success = await api.updateOcorrencia(actionData.id, { resolvido: true }, pin);
    }

    setPinLoading(false);
    
    if (success) {
      setIsPinOpen(false);
      carregarDados();
    } else {
      alert("Ação negada. PIN incorreto ou erro no servidor.");
    }
  };

  const filtered = ocorrencias.filter(o => 
    o.colab?.nome.toLowerCase().includes(search.toLowerCase()) || 
    o.tipo.toLowerCase().includes(search.toLowerCase()) ||
    o.observacao?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-b-4 border-brand-cyan inline-block pb-1">
            Histórico de Ocorrências
          </h1>
          <p className="text-slate-500 mt-2">Visão completa, auditoria e edição de registros.</p>
        </div>
        <button onClick={() => router.push('/')} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 bg-white shadow-sm">
          Voltar ao Dashboard
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por colaborador, tipo ou observação..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-cyan"></div></div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Colaborador</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Detalhes</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {filtered.map((oc) => (
                  <tr key={oc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {new Date(oc.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{oc.colab?.nome ?? 'Desconhecido'}</span>
                        <span className="text-xs text-slate-400">{oc.colab?.categoria_cargo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        oc.tipo === 'Falta' ? 'bg-red-50 text-red-600' : 
                        oc.tipo === 'Extra' ? 'bg-blue-50 text-blue-600' : 
                        oc.tipo === 'Atraso' ? 'bg-amber-50 text-amber-600' : 
                        oc.tipo === 'Alocada' ? 'bg-brand-cyan/10 text-brand-teal' :
                        oc.tipo === 'Alocado' ? 'bg-indigo-50 text-indigo-600' :
                        oc.tipo === 'Substituição' ? 'bg-green-50 text-green-600' :
                        oc.tipo === 'Trabalho Intermitente' ? 'bg-orange-50 text-orange-600' :
                        oc.tipo === 'Treinamento NR' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'
                      )}>
                        {oc.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-xs" title={oc.observacao || ''}>
                      {oc.observacao || '-'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {oc.documento_exigido && !oc.documento_entregue && (
                        <button onClick={async () => {
                          const docUrl = prompt('Confirma o recebimento? Se o documento for digital, cole o link abaixo (ex: Google Drive). Se for apenas físico, deixe em branco ou digite "FISICO":', '');
                          if(docUrl !== null) {
                            await api.anexarDocumento(oc.id, docUrl || 'Físico');
                            carregarDados();
                          }
                        }} className="p-1.5 text-brand-cyan hover:bg-brand-cyan/10 rounded-lg transition-colors" title="Anexar Documento (Recebido)">
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {!oc.resolvido && !oc.documento_exigido && (
                        <button onClick={() => handleActionClick('resolve', oc.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Marcar como Resolvido">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={async () => {
                         const novaObs = prompt('Editar Observação:', oc.observacao || '');
                         if (novaObs !== null && novaObs !== oc.observacao) {
                           const pin = prompt('Digite o PIN de administrador para editar:');
                           if(pin) {
                             await api.updateOcorrencia(oc.id, { observacao: novaObs }, pin);
                             carregarDados();
                           }
                         }
                      }} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Editar Observação">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleActionClick('delete', oc.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir Registro">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      Nenhuma ocorrência encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <PinModal 
        isOpen={isPinOpen} 
        onClose={() => setIsPinOpen(false)} 
        onSuccess={handlePinSuccess}
        loading={pinLoading}
      />
    </div>
  );
}
