'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, FileText, CheckCircle2, Clock, CalendarDays, CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NovaOcorrencia } from '@/components/NovaOcorrencia';
import { NovaOcorrenciaCliente } from '@/components/NovaOcorrenciaCliente';
import { NovoServicoExtra } from '@/components/NovoServicoExtra';
import { TrocarSenhaModal } from '@/components/TrocarSenhaModal';
import { PendenciasAtestadoWidget } from '@/components/PendenciasAtestadoWidget';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

export function DashboardView({ data }: { data: any }) {
  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes'>('hoje');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [precisaTrocarSenha, setPrecisaTrocarSenha] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      setUser(JSON.parse(u));
    }
    setPrecisaTrocarSenha(localStorage.getItem('auth_precisa_trocar_senha') === 'true');
    setLoading(false);
  }, []);

  if (loading) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full animate-spin"></div></div>;

  if (user?.role === 'CLIENTE') {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-10">
        {precisaTrocarSenha && <TrocarSenhaModal onSucesso={() => setPrecisaTrocarSenha(false)} />}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-b-4 border-brand-cyan inline-block pb-1">
              Painel do Cliente
            </h1>
            <p className="text-slate-500 mt-2">Relate ocorrências e acompanhe os atendimentos.</p>
          </div>
          <div className="flex gap-2">
            <NovaOcorrenciaCliente />
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-16 h-16 text-brand-teal mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Bem-vindo, {user?.nome}</h2>
          <p className="text-slate-500 mt-2 max-w-md">
            Utilize o botão acima para informar caso o profissional alocado não tenha comparecido ou esteja atrasado. Nossa equipe será notificada imediatamente.
          </p>
        </div>
      </div>
    );
  }

  const { stats, ocorrenciasRecentes } = data[periodo];
  const pendentes = ocorrenciasRecentes.filter((o: any) => !o.resolvido).length;
  const resolvidas = ocorrenciasRecentes.filter((o: any) => o.resolvido).length;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-10">
      {precisaTrocarSenha && <TrocarSenhaModal onSucesso={() => setPrecisaTrocarSenha(false)} />}
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-b-4 border-brand-cyan inline-block pb-1">
            Dashboard Operacional
          </h1>
          <p className="text-slate-500 mt-2">Acompanhe as ocorrências operacionais e o status da equipe.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex">
            <button 
              onClick={() => setPeriodo('hoje')}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors", periodo === 'hoje' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700')}
            >
              <CalendarDays className="w-4 h-4" /> Hoje
            </button>
            <button 
              onClick={() => setPeriodo('semana')}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors", periodo === 'semana' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700')}
            >
              <CalendarRange className="w-4 h-4" /> Últimos 7 Dias
            </button>
            <button 
              onClick={() => setPeriodo('mes')}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors", periodo === 'mes' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700')}
            >
              <CalendarRange className="w-4 h-4" /> Este Mês
            </button>
          </div>
          <div className="flex gap-2">
            <NovoServicoExtra />
            <NovaOcorrencia />
          </div>
        </div>
      </div>

      {/* Alertas Section */}
      {data.alertasDocumentos && data.alertasDocumentos.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-red-800 font-bold text-lg flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5" /> Documentos Pendentes / Prazos Vencendo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.alertasDocumentos.map((alerta: any) => {
              const prazo = new Date(alerta.prazo_documento);
              const isVencido = prazo < new Date();
              return (
                <div key={alerta.id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex flex-col gap-2">
                   <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800">{alerta.colab?.nome}</p>
                        <p className="text-xs font-semibold text-brand-teal mt-0.5">
                          Pendente: {alerta.tipo === 'Treinamento NR' ? 'Certificado Treinamento NR' : (alerta.motivo_falta === 'Atestado' ? 'Atestado Médico' : alerta.motivo_falta || 'Documento')}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${isVencido ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isVencido ? 'VENCIDO' : 'Dentro do Prazo'}
                      </span>
                   </div>
                   <p className="text-xs text-slate-600">
                     Prazo limite: {prazo.toLocaleString('pt-BR')}
                   </p>
                   <div className="flex justify-end gap-2 mt-2">
                     <button onClick={async () => {
                       const txt = alerta.tipo === 'Treinamento NR' ? 'Treinamento concluído? Cole o link do certificado ou digite "FISICO":' : 'Confirma o recebimento? Se o documento for digital, cole o link abaixo (ex: Google Drive). Se for apenas físico, deixe em branco ou digite "FISICO":';
                       const docUrl = prompt(txt, '');
                       if(docUrl !== null) {
                         await api.anexarDocumento(alerta.id, docUrl || 'Físico');
                         router.refresh();
                       }
                     }} className="text-xs font-medium bg-brand-cyan text-white px-3 py-1.5 rounded-lg hover:bg-brand-teal transition-colors">
                       {alerta.tipo === 'Treinamento NR' ? 'Concluir Treinamento' : 'Anexar Doc'}
                     </button>
                     {isVencido && (
                       <button onClick={async () => {
                         const sancao = prompt('A falta será convertida em INJUSTIFICADA. Qual a sanção a aplicar? (Ex: Advertência, Suspensão 1 Dia, Justa Causa)', 'Advertência');
                         if(sancao) {
                           await api.converterFaltaInjustificada(alerta.id, sancao);
                           router.refresh();
                         }
                       }} className="text-xs font-medium bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
                         Converter Falta
                       </button>
                     )}
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Avisos de Retorno Section */}
      {data.avisosRetorno && data.avisosRetorno.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-orange-800 font-bold text-lg flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5" /> Férias Acabando (Decisão de Retorno)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.avisosRetorno.map((aviso: any) => {
              const dataFim = new Date(aviso.data_fim).toLocaleDateString('pt-BR');
              return (
                <div key={aviso.id} className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm flex flex-col gap-2">
                   <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800">{aviso.colab?.nome}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Retorno em breve (Fim: {dataFim})</p>
                      </div>
                   </div>
                   <p className="text-sm font-medium text-slate-700 mt-2">O colaborador retornará ao seu posto original?</p>
                   <div className="flex gap-2 mt-2">
                     <button onClick={async () => {
                       await api.decisaoRetornoFerias(aviso.id, true);
                       router.refresh();
                     }} className="flex-1 text-xs font-medium bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                       Sim, retorna
                     </button>
                     <button onClick={async () => {
                       await api.decisaoRetornoFerias(aviso.id, false);
                       router.refresh();
                     }} className="flex-1 text-xs font-medium bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 transition-colors">
                       Não retorna
                     </button>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NOVO WIDGET: PENDÊNCIAS DE ATESTADO */}
      <PendenciasAtestadoWidget />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {[
          { title: "Atrasos", value: stats.atrasos.toString(), icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
          { title: "Faltas", value: stats.faltas.toString(), icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
          { title: "Afastados", value: stats.afastados.toString(), icon: FileText, color: "text-brand-cyan", bg: "bg-brand-cyan/10" },
          { title: "Resolvidas", value: resolvidas.toString(), icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" }
        ].map((kpi, i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className={cn("p-3 rounded-xl", kpi.bg)}>
              <kpi.icon className={cn("w-6 h-6", kpi.color)} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-slate-800">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            Ocorrências {periodo === 'hoje' ? 'do Dia' : periodo === 'semana' ? 'da Semana' : 'do Mês'}
          </h2>
          <a href="/ocorrencias/historico" className="text-sm font-medium text-brand-cyan hover:text-brand-teal transition-colors">
            Ver Histórico Completo →
          </a>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Colaborador</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Data/Tempo</th>
                <th className="px-6 py-4">Origem</th>
                <th className="px-6 py-4 text-right">Status/Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {ocorrenciasRecentes.length > 0 ? (
                ocorrenciasRecentes.map((oc: any) => (
                  <tr key={oc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{oc.colab?.nome ?? 'Desconhecido'}</span>
                        <span className="text-xs text-slate-400">{oc.colab?.categoria_cargo ?? 'Sem Papel'} • {oc.colab?.turno_base}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        oc.tipo === 'Falta' ? 'bg-red-50 text-red-600' : 
                        oc.tipo === 'Alocada' ? 'bg-brand-cyan/10 text-brand-teal' :
                        oc.tipo === 'Alocado' ? 'bg-indigo-50 text-indigo-600' :
                        oc.tipo === 'Treinamento NR' ? 'bg-purple-50 text-purple-600' :
                        'bg-amber-50 text-amber-600'
                      )}>
                        {oc.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>{new Date(oc.data).toLocaleDateString('pt-BR')}</span>
                        {oc.tempo_minutos && <span className="text-xs text-slate-400">{oc.tempo_minutos} min</span>}
                        {oc.tipo === 'Alocada' && oc.prazo_documento && (
                          <span className="text-[11px] font-semibold text-brand-teal mt-0.5">
                            até {new Date(oc.prazo_documento).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-md text-slate-600">
                          {oc.origem || 'SISTEMA'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {oc.resolvido ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolvido
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
                          <Clock className="w-3.5 h-3.5" /> Pendente
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-12 h-12 text-slate-200" />
                      <p>Nenhuma ocorrência registrada neste período.</p>
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
