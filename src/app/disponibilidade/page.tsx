import { api } from '@/services/api';
import { UserCheck, Clock, CalendarDays, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlocarButton } from './AlocarButton';

export const dynamic = 'force-dynamic';

export default async function DisponibilidadePage() {
  const livres = await api.getLivres();

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-b-4 border-brand-cyan inline-block pb-1">
          Colaboradores Livres
        </h1>
        <p className="text-slate-500 mt-2">Lista de colaboradores disponíveis para alocação com base na carga horária semanal.</p>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Disponíveis na Semana</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Colaborador</th>
                <th className="px-6 py-4">Contratação</th>
                <th className="px-6 py-4">Status / Horas Restantes</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {livres.length > 0 ? (
                livres.map((colab) => (
                  <tr key={colab.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{colab.nome}</span>
                        <span className="text-xs text-slate-400 mt-0.5">{colab.turno_base || 'Sem Turno Base'}</span>
                        <span className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {(colab as any).localizacao || (colab as any).endereco || 'Localização não informada'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {colab.tipo_contratacao || 'Não Definido'}
                      </span>
                      {colab.horas_contratadas && (
                        <div className="text-xs text-slate-400 mt-1">
                          Contratado: {colab.horas_contratadas}h
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <UserCheck className="w-3.5 h-3.5" /> {colab.status}
                        </span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {colab.horasRestantes}h
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <AlocarButton colab={colab} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <CalendarDays className="w-12 h-12 text-slate-200" />
                      <p>Nenhum colaborador livre disponível.</p>
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
