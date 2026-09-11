"use client"

import { useState, useEffect } from "react"
import { api, Colaborador, DashboardStats } from "../../services/api"
import { FileText, AlertCircle, CalendarRange, Plus, X } from 'lucide-react';
import { SearchableSelect } from "../../components/ocorrencias/SearchableSelect";
import { TratamentoFeriasWizard } from "../../components/ocorrencias/TratamentoFeriasWizard";

export default function FeriasPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [userProfile, setUserProfile] = useState('');
  useEffect(() => {
    setUserProfile(localStorage.getItem('auth_role') || '');
  }, []);
  const canEditDatas = ['ADMIN', 'RH', 'DP', 'COORDENADOR', 'COORDENADOR ADMINISTRATIVO'].includes(userProfile.toUpperCase());

  
  const handleAutoCalcularTodas = async () => {
    if (!confirm('Isto irá varrer todos os colaboradores ativos e recalcular as datas de férias (Aquisitivo e Limites) baseado na Data de Admissão. Deseja continuar?')) return;
    setLoading(true);
    let updated = 0;
    const today = new Date();
    const parseDate = (d: string) => {
      if(!d) return null;
      if(d.includes('/')) return new Date(`${d.split('/')[2]}-${d.split('/')[1]}-${d.split('/')[0]}T12:00:00Z`);
      if(d.includes('-')) return new Date(`${d}T12:00:00Z`);
      return null;
    };
    const formatDate = (d: Date) => d ? d.toISOString().split('T')[0] : undefined;

    const novosColaboradores = [...colaboradores];

    for (let i = 0; i < novosColaboradores.length; i++) {
      const c = novosColaboradores[i];
      if (!c.admissao) continue;
      const adm = parseDate(c.admissao);
      if (!adm) continue;
      
      let uAq = new Date(adm);
      uAq.setFullYear(uAq.getFullYear() + 1);
      
      // Se a pessoa acabou de entrar, ainda não fechou 1 ano.
      if (uAq > today) continue;

      // Pula os anos até achar o último aquisitivo fechado
      while (true) {
        const prox = new Date(uAq); prox.setFullYear(prox.getFullYear() + 1);
        if (prox <= today) uAq = prox; else break;
      }

      const max = new Date(uAq); max.setDate(max.getDate() + 350);
      const inc = new Date(max); inc.setDate(inc.getDate() - 45);
      const avs = new Date(inc); avs.setDate(avs.getDate() - 30);

      const payload = {
        ferias_ultimo_aquisitivo: formatDate(uAq),
        ferias_vencimento: formatDate(max),
        ferias_limite_entrada: formatDate(inc),
        ferias_notificacao: formatDate(avs)
      };

      try {
        await api.updateColab(c.id, payload);
        novosColaboradores[i] = { ...c, ...payload };
        updated++;
      } catch (e) {
        console.error("Falha ao atualizar", c.nome);
      }
    }
    setColaboradores(novosColaboradores);
    setLoading(false);
    alert(`Processo concluído! ${updated} colaboradores corrigidos automaticamente.`);
  };

  const handleSaveFeriasData = async (colabId: string, field: string, value: string) => {
    let payload: any = { [field]: value };

    if (value) {
      if (field === 'ferias_ultimo_aquisitivo') {
        const d = new Date(value + 'T12:00:00Z');
        const max = new Date(d); max.setDate(max.getDate() + 350);
        const inicio = new Date(max); inicio.setDate(inicio.getDate() - 45);
        const aviso = new Date(inicio); aviso.setDate(aviso.getDate() - 30);

        payload.ferias_vencimento = max.toISOString().split('T')[0];
        payload.ferias_limite_entrada = inicio.toISOString().split('T')[0];
        payload.ferias_notificacao = aviso.toISOString().split('T')[0];
      } else if (field === 'ferias_vencimento') {
        const max = new Date(value + 'T12:00:00Z');
        const inicio = new Date(max); inicio.setDate(inicio.getDate() - 45);
        const aviso = new Date(inicio); aviso.setDate(aviso.getDate() - 30);

        payload.ferias_limite_entrada = inicio.toISOString().split('T')[0];
        payload.ferias_notificacao = aviso.toISOString().split('T')[0];
      }
    }

    await api.updateColab(colabId, payload);
    setColaboradores(prev => prev.map(c => c.id === colabId ? { ...c, ...payload } : c));
  };

  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  
  // Wizard Modal State
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedColabId, setSelectedColabId] = useState('')

  async function loadData() {
    setLoading(true)
    try {
      const [colabsData, statsData] = await Promise.all([
        api.getColabs(),
        api.getDashboardStats()
      ])
      
      const importados = colabsData.filter(c => c.status_cadastro !== "Inativo")
      setColaboradores(importados)
      setStats(statsData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredColaboradores = colaboradores.filter((colab) => {
    const term = searchTerm.toLowerCase()
    return (
      colab.nome.toLowerCase().includes(term) ||
      (colab.matricula && colab.matricula.toLowerCase().includes(term))
    )
  })

  async function handleAnexarDoc(avisoId: string) {
    const docUrl = prompt('Confirma o recebimento do aviso de férias? Cole o link do PDF assinado abaixo, ou digite "FISICO" se arquivado presencialmente:', '');
    if(docUrl) {
      await api.uploadDocumentoFerias(avisoId, docUrl);
      loadData();
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-400">Carregando painel de férias...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-b-4 border-brand-cyan inline-block pb-1">
            Tratamento de Férias
          </h1>
          <p className="text-slate-500 mt-2">
            Gestão de documentação, períodos aquisitivos e coberturas operacionais.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">

          <button 
            onClick={() => {
              setSelectedColabId('');
              setIsWizardOpen(true);
            }}
            className="bg-brand-cyan hover:bg-brand-teal transition-colors text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-brand-cyan/20 flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Lançar Férias</span>
          </button>
        </div>
      </div>

      {stats?.pendenciasFerias && stats.pendenciasFerias.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-amber-800 font-bold text-lg flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5" /> Avisos Pendentes de Assinatura
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.pendenciasFerias.map((aviso: any) => {
              const dataAvisoStr = new Date(aviso.data_aviso).toLocaleDateString('pt-BR');
              return (
                <div key={aviso.id} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex flex-col gap-2">
                   <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800">{aviso.colab?.nome}</p>
                        <p className="text-xs font-semibold text-amber-600 mt-0.5">Aviso gerado em {dataAvisoStr}</p>
                      </div>
                   </div>
                   <p className="text-xs text-slate-600 mt-1">
                     Dias: {aviso.dias_ferias} {aviso.dias_venda > 0 ? `(Vendeu ${aviso.dias_venda})` : ''}
                   </p>
                   <div className="flex justify-end mt-2">
                     <button onClick={() => handleAnexarDoc(aviso.id)} className="text-xs font-medium bg-brand-cyan text-white px-3 py-1.5 rounded-lg hover:bg-brand-teal transition-colors">
                       Anexar PDF
                     </button>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stats?.alertasTransferencia && stats.alertasTransferencia.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-rose-800 font-bold text-lg flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5" /> Alertas de Transferência (Próximos 2 dias)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.alertasTransferencia.map((alerta: any) => {
              // alerta.aviso contém data_inicio. Precisamos achar o nome do substituto cruzando com a lista do front
              const sub = colaboradores.find(c => c.id === alerta.colab_substituto_id);
              const dataStr = new Date(alerta.aviso?.data_inicio).toLocaleDateString('pt-BR');
              const postoNome = alerta.posto?.cliente?.nome_razao || alerta.posto_id.substring(0,8);
              return (
                <div key={alerta.id} className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex flex-col gap-2">
                   <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800">{sub?.nome || 'Colaborador'}</p>
                        <p className="text-xs font-semibold text-rose-600 mt-0.5">Transfere em {dataStr}</p>
                      </div>
                   </div>
                   <p className="text-xs text-slate-600 mt-1">
                     Vai cobrir as férias de <strong>{alerta.aviso?.colab?.nome}</strong> no posto {postoNome}.
                   </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      
      {/* Quadro Geral de Prazos Limites */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mt-6">
        <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-brand-cyan" /> Quadro Geral de Aquisitivos (Prazos Limites)
          </h3>
          {canEditDatas && (
              <button onClick={handleAutoCalcularTodas} className="bg-brand-cyan hover:bg-brand-teal text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition-colors">
                Auto-Corrigir Datas (Massa)
              </button>
            )}
            <input 
              type="text"
              placeholder="Buscar colaborador..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan"
          />
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 sticky top-0 z-10 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Colaborador</th>
                <th className="px-4 py-3 font-bold">Último Aquisitivo</th>
                <th className="px-4 py-3 font-bold">Limite Máximo</th>
                <th className="px-4 py-3 font-bold">Limite p/ Iniciar (-15d)</th>
                <th className="px-4 py-3 font-bold">Limite p/ Aviso (-30d)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredColaboradores.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.nome}</td>
                  <td className="px-4 py-3">
                    <input type="date" value={c.ferias_ultimo_aquisitivo || ''} onChange={e => handleSaveFeriasData(c.id, 'ferias_ultimo_aquisitivo', e.target.value)} disabled={!canEditDatas} className="bg-transparent border border-transparent hover:border-slate-300 focus:border-brand-cyan rounded px-2 py-1 outline-none w-36 text-slate-700 disabled:opacity-70 disabled:hover:border-transparent" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="date" value={c.ferias_vencimento || ''} onChange={e => handleSaveFeriasData(c.id, 'ferias_vencimento', e.target.value)} disabled={!canEditDatas} className="bg-transparent border border-transparent hover:border-slate-300 focus:border-brand-cyan rounded px-2 py-1 outline-none w-36 text-slate-700 disabled:opacity-70 disabled:hover:border-transparent" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="date" value={c.ferias_limite_entrada || ''} onChange={e => handleSaveFeriasData(c.id, 'ferias_limite_entrada', e.target.value)} disabled={!canEditDatas} className="bg-transparent border border-transparent hover:border-slate-300 focus:border-brand-cyan rounded px-2 py-1 outline-none w-36 text-slate-700 disabled:opacity-70 disabled:hover:border-transparent" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="date" value={c.ferias_notificacao || ''} onChange={e => handleSaveFeriasData(c.id, 'ferias_notificacao', e.target.value)} disabled={!canEditDatas} className="bg-transparent border border-transparent hover:border-slate-300 focus:border-brand-cyan rounded px-2 py-1 outline-none w-36 text-slate-700 disabled:opacity-70 disabled:hover:border-transparent" />
                  </td>
                </tr>
              ))}
              {filteredColaboradores.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-slate-400">Nenhum colaborador encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção de Pessoal Afastado ou Coberturas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
            <CalendarRange className="w-5 h-5 text-brand-cyan" /> Férias (Em Andamento / Agendadas)
          </h3>
          <ul className="divide-y divide-slate-50 max-h-60 overflow-y-auto pr-2">
            {stats?.colaboradoresEmFerias?.length === 0 && <li className="text-sm text-slate-400 py-2">Nenhum colaborador em férias.</li>}
            {stats?.colaboradoresEmFerias?.map((afastamento: any) => {
              const inicioStr = new Date(afastamento.data_inicio).toLocaleDateString('pt-BR');
              const fimStr = new Date(afastamento.data_fim).toLocaleDateString('pt-BR');
              const isFuture = new Date(afastamento.data_inicio) > new Date();
              return (
                <li key={afastamento.id} className="py-2 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-700">{afastamento.colab?.nome}</p>
                    <p className="text-xs text-slate-500">
                      De {inicioStr} a {fimStr}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${isFuture ? 'bg-amber-50 text-amber-600' : 'bg-brand-cyan/10 text-brand-cyan'}`}>
                    {isFuture ? 'Agendada' : 'Em Férias'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
            <FileText className="w-5 h-5 text-indigo-500" /> Coberturas Ativas / Agendadas
          </h3>
          <ul className="divide-y divide-slate-50 max-h-60 overflow-y-auto pr-2">
            {stats?.coberturasAtivas?.length === 0 && <li className="text-sm text-slate-400 py-2">Nenhuma cobertura agendada.</li>}
            {stats?.coberturasAtivas?.map((cobertura: any) => {
              const sub = colaboradores.find(c => c.id === cobertura.colab_substituto_id);
              const postoNome = cobertura.posto?.cliente?.nome_razao || cobertura.posto_id?.substring(0, 8);
              let periodoStr = 'Período não definido';
              if (cobertura.aviso) {
                 const d1 = new Date(cobertura.aviso.data_inicio).toLocaleDateString('pt-BR');
                 const d2 = new Date(cobertura.aviso.data_fim).toLocaleDateString('pt-BR');
                 periodoStr = `${d1} a ${d2}`;
              }

              return (
                <li key={cobertura.id} className="py-2 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-700">{sub?.nome || 'Colaborador'}</p>
                    <p className="text-xs font-medium text-slate-600">Posto: {postoNome}</p>
                    <p className="text-[10px] text-slate-500">{periodoStr}</p>
                  </div>
                  <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Cobertura</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsWizardOpen(false)} />
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 bg-white">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold tracking-tight text-slate-800">Lançar Aviso de Férias</h2>
              <button onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <SearchableSelect 
                label="Selecione o Colaborador"
                options={colaboradores.map(c => ({ id: c.id, label: c.nome, subLabel: `${c.categoria_cargo} (${c.turno_base})` }))}
                value={selectedColabId}
                onChange={setSelectedColabId}
                placeholder="Buscar colaborador..."
              />
              
              {selectedColabId && (
                <div className="mt-2 border-t border-slate-100 pt-4">
                  <TratamentoFeriasWizard 
                    colab={colaboradores.find(c => c.id === selectedColabId)!}
                    onClose={() => setIsWizardOpen(false)}
                    onSuccess={() => {
                      setIsWizardOpen(false);
                      setSelectedColabId('');
                      loadData();
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
