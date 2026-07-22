import { api } from '@/services/api';
import { CalendarDays, AlertTriangle, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AfastamentosPage() {
  const afastamentos = await api.getAfastamentos();

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-b-4 border-brand-cyan inline-block pb-1">
            Gestão de Afastamentos
          </h1>
          <p className="text-slate-500 mt-2">Controle de faltas justificadas, atestados, INSS e férias.</p>
        </div>
        <button className="bg-brand-cyan text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-teal transition-all shadow-sm">
          Registrar Afastamento
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Histórico de Afastamentos</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Colaborador</th>
                <th className="px-6 py-4">Motivo</th>
                <th className="px-6 py-4">Período</th>
                <th className="px-6 py-4">Retorno Previsto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {afastamentos.length > 0 ? (
                afastamentos.map((afast) => (
                  <tr key={afast.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{afast.colab?.nome}</span>
                        <span className="text-xs text-slate-400">{afast.colab?.papel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                        <AlertTriangle className="w-3.5 h-3.5" /> {afast.motivo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>Início: {new Date(afast.data_inicio).toLocaleDateString('pt-BR')}</span>
                        {afast.data_fim && (
                          <span className="text-xs text-slate-400">Fim: {new Date(afast.data_fim).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="font-medium text-slate-700">
                         {new Date(afast.data_retorno_prevista).toLocaleDateString('pt-BR')}
                       </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-12 h-12 text-slate-200" />
                      <p>Nenhum afastamento registrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
