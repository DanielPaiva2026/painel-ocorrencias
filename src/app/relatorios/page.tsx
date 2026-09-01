'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { AlertCircle, AlertTriangle, Calendar, FileText, CheckCircle, Clock, ShieldAlert, FileWarning } from 'lucide-react';

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState<'vencimentos' | 'ferias' | 'extratos'>('vencimentos');
  const [loading, setLoading] = useState(true);

  const [vencimentos, setVencimentos] = useState<any[]>([]);
  const [ferias, setFerias] = useState<any[]>([]);
  const [feriasAgendadas, setFeriasAgendadas] = useState<any[]>([]);
  const [inconsistencias, setInconsistencias] = useState<any[]>([]);
  const [extratos, setExtratos] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [v, f, i, e] = await Promise.all([
        api.getRelatorioVencimentos(),
        api.getRelatorioFerias(),
        api.getRelatorioInconsistencias(),
        api.getRelatorioExtratos()
      ]);
      setVencimentos(v);
      setFerias(f.previsoes || []);
      setFeriasAgendadas(f.agendadas || []);
      setInconsistencias(i);
      setExtratos(e);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-brand-teal" />
          Relatórios e Alertas
        </h1>
        <p className="text-slate-500 mt-2">Gestão proativa de documentações, férias e operação</p>
      </div>

      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-4 shadow-sm">
        <button 
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'vencimentos' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('vencimentos')}
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            Vencimentos e Inconsistências
            {vencimentos.length + inconsistencias.length > 0 && (
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] ml-1">{vencimentos.length + inconsistencias.length}</span>
            )}
          </div>
        </button>
        <button 
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'ferias' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('ferias')}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Controle de Férias
            {ferias.length > 0 && (
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] ml-1">{ferias.length}</span>
            )}
          </div>
        </button>
        <button 
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'extratos' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('extratos')}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Extratos Operacionais
          </div>
        </button>
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-200 border-t-0 p-6 min-h-[500px]">
        {activeTab === 'vencimentos' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Treinamentos e Exames (Próximos 60 dias)
              </h2>
              {vencimentos.length === 0 ? (
                <div className="bg-slate-50 p-6 rounded-xl text-center border border-slate-100">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-slate-600 font-medium">Nenhum vencimento próximo.</p>
                </div>
              ) : (
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">Colaborador</th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">Documento</th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">Vencimento</th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vencimentos.map((v, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-medium text-slate-800">{v.colabNome}</td>
                          <td className="p-3 text-sm text-slate-600">{v.tipo}</td>
                          <td className="p-3 text-sm text-slate-600">{v.dataVencimento}</td>
                          <td className="p-3 text-right">
                            {v.status === 'VENCIDO' ? (
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                <AlertCircle className="w-3 h-3" /> Vencido há {Math.abs(v.diasRestantes)} dias
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">
                                <Clock className="w-3 h-3" /> Vence em {v.diasRestantes} dias
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-red-500" />
                Inconsistências de Alocação
              </h2>
              {inconsistencias.length === 0 ? (
                <div className="bg-slate-50 p-6 rounded-xl text-center border border-slate-100">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-slate-600 font-medium">Todas as alocações estão aderentes às exigências (NRs).</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inconsistencias.map((inc, i) => (
                    <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-red-800">{inc.colabNome}</h4>
                        <p className="text-sm text-red-600 mt-1">Alocado no posto <strong className="font-bold">{inc.posto}</strong></p>
                        <p className="text-xs text-red-500 mt-1">{inc.problema}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ferias' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-brand-cyan/10 border border-brand-cyan/20 p-4 rounded-xl mb-6">
              <h3 className="font-bold text-brand-dark flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" /> Regra de Alerta de Férias
              </h3>
              <p className="text-sm text-slate-600 mb-2">O sistema monitora a data limite para a concessão das férias (2 anos da admissão ou 1 ano do último aquisitivo). O alerta inicia **105 dias antes** do prazo final, garantindo tempo hábil de 30 dias para retorno, 60 dias de gozo e 15 dias de janela para programação do aviso de férias de 30 dias.</p>
              <p className="text-sm text-slate-600"><strong className="font-bold">Notificações Agendadas:</strong> Avisa com 10 dias de antecedência para o titular e substituto, e faz um reaviso 2 dias antes para o substituto assumir o posto.</p>
            </div>

            {feriasAgendadas.length > 0 && (
              <div className="mb-8">
                <h3 className="font-black text-xl text-slate-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  Notificações de Férias Agendadas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feriasAgendadas.map((f, i) => (
                    <div key={i} className={`border rounded-xl p-5 ${f.status.includes('REAVISO') ? 'bg-indigo-50 border-indigo-200' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className={`font-black text-lg ${f.status.includes('REAVISO') ? 'text-indigo-800' : 'text-blue-800'}`}>{f.colabNome}</h4>
                          <p className="text-xs text-slate-500">Início: {f.dataInicio}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wider uppercase ${
                          f.status.includes('REAVISO') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 
                          'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        }`}>
                          {f.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-2 bg-white/50 rounded-lg p-3 backdrop-blur-sm border border-white/20">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Substituto(s) Alocado(s)</p>
                          <p className="font-medium text-slate-800 text-sm">{f.substitutos}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 className="font-black text-xl text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Previsão de Vencimento de Férias
            </h3>

            {ferias.length === 0 ? (
              <div className="bg-slate-50 p-8 rounded-xl text-center border border-slate-100">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">Tudo em dia!</h3>
                <p className="text-slate-600 font-medium">Nenhum funcionário correndo risco de vencimento duplo de férias.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ferias.map((f, i) => (
                  <div key={i} className={`border rounded-xl p-5 ${f.status === 'AÇÃO IMEDIATA' ? 'bg-red-50 border-red-200' : f.status === 'ATRASADA' ? 'bg-orange-50 border-orange-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className={`font-black text-lg ${f.status === 'AÇÃO IMEDIATA' ? 'text-red-800' : f.status === 'ATRASADA' ? 'text-orange-800' : 'text-amber-800'}`}>{f.colabNome}</h4>
                        <p className="text-xs text-slate-500">Base: {f.dataBase}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wider uppercase ${
                        f.status === 'AÇÃO IMEDIATA' ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 
                        f.status === 'ATRASADA' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 
                        'bg-amber-400 text-amber-900'
                      }`}>
                        {f.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white/50 rounded-lg p-3 backdrop-blur-sm border border-white/20">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Prazo Fatal</p>
                        <p className="font-medium text-slate-800">{f.dataLimite}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tempo Restante</p>
                        <p className={`font-black text-lg ${f.diasRestantes < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                          {f.diasRestantes < 0 ? `Atrasado ${Math.abs(f.diasRestantes)} dias` : `${f.diasRestantes} dias`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'extratos' && extratos && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Postos de Trabalho</p>
                  <p className="text-3xl font-black text-slate-800">{extratos.vagas.totalPostos}</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Vagas Abertas</p>
                  <p className="text-3xl font-black text-red-800">{extratos.vagas.vagasAbertas}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Ativos (Geral)</p>
                  <p className="text-3xl font-black text-emerald-800">{extratos.vagas.colabsAtivos}</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Gestão/Admin</p>
                  <p className="text-3xl font-black text-purple-800">{extratos.vagas.colabsAdministrativo}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Alocados (Operação)</p>
                  <p className="text-3xl font-black text-amber-800">{extratos.vagas.colabsAlocados}</p>
                </div>
                <div className="bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl p-5">
                  <p className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">Livres (Operação)</p>
                  <p className="text-3xl font-black text-brand-teal">{extratos.vagas.colabsLivres}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Afastados/INSS</p>
                  <p className="text-3xl font-black text-orange-800">{extratos.vagas.colabsAfastados}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Ocorrências do Mês</h3>
                {extratos.ocorrencias.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Nenhuma ocorrência registrada no mês atual.</p>
                ) : (
                  <div className="space-y-3">
                    {extratos.ocorrencias.map((o: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="font-medium text-slate-700">{o.tipo}</span>
                        <span className="font-black text-brand-teal bg-white px-3 py-1 rounded shadow-sm border border-slate-100">{o.quantidade}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Afastamentos Ativos</h3>
                {extratos.afastamentos.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Nenhum colaborador afastado no momento.</p>
                ) : (
                  <div className="space-y-3">
                    {extratos.afastamentos.map((a: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="font-medium text-slate-700">{a.motivo}</span>
                        <span className="font-black text-amber-600 bg-white px-3 py-1 rounded shadow-sm border border-slate-100">{a.quantidade}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
