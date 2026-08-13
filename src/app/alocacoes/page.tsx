import { api } from '@/services/api';

export const dynamic = 'force-dynamic';

export default async function AlocacoesPage() {
  const dados = await api.getAlocacoes();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Alocações de Postos</h1>
          <p className="text-slate-500 text-sm mt-1">Conexão entre colaboradores e clientes.</p>
        </div>
        <div className="bg-brand-cyan/10 text-brand-teal px-4 py-2 rounded-xl font-bold flex gap-2">
          Total: <span>{dados.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Cliente / Posto</th>
                <th className="px-6 py-4 font-semibold">Colaborador</th>
                <th className="px-6 py-4 font-semibold">Cargo</th>
                <th className="px-6 py-4 font-semibold">Turno Designado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dados.map((alocacao: any) => (
                <tr key={alocacao.id} className="hover:bg-brand-cyan/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-brand-dark">
                    {alocacao.cliente?.nome_razao || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">
                    {alocacao.colab?.nome || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                      {alocacao.colab?.categoria_cargo || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {alocacao.turno}
                  </td>
                </tr>
              ))}
              {dados.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhuma alocação cadastrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
