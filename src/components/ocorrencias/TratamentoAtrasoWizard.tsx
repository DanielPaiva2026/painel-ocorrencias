'use client';

import { useState, useEffect } from 'react';
import { Loader2, ArrowRight, CheckCircle2, User, Clock, AlertTriangle, FileText } from 'lucide-react';
import { api, Colaborador, PostoDeTrabalho } from '@/services/api';
import { SearchableSelect } from './SearchableSelect';

interface Props {
  colab: Colaborador;
  onClose: () => void;
  onSuccess: () => void;
}

export function TratamentoAtrasoWizard({ colab, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Dados do Passo 1
  const [vaiPegarPosto, setVaiPegarPosto] = useState<boolean | null>(null);
  const alocacaoAtual = colab.alocacoes?.[0]; // Assumindo a primeira alocação para simplificar

  // Dados Adicionais (Comuns)
  const [sancaoData, setSancaoData] = useState<{ sancao_sugerida: string, total_ocorrencias: number, ultima_ocorrencia: Date | null, historico_count: number, historico: any[] } | null>(null);
  const [sancaoSelecionada, setSancaoSelecionada] = useState('');
  const [clienteInformado, setClienteInformado] = useState(false);
  const [observacao, setObservacao] = useState('');

  // Se VAI pegar posto
  const [tempoAtraso, setTempoAtraso] = useState('');
  const [gerarExtraPorteiro, setGerarExtraPorteiro] = useState(false);
  const [tempoEsperaPorteiro, setTempoEsperaPorteiro] = useState('');

  // Se NÃO vai pegar posto (Falta ou Suspensão)
  const [diasCobertura, setDiasCobertura] = useState(1);
  const [usarMesmoSubstituto, setUsarMesmoSubstituto] = useState(true);
  
  // Múltiplos dias
  const [substitutosPorDia, setSubstitutosPorDia] = useState<Record<number, any[]>>({});
  const [substitutosSelecionados, setSubstitutosSelecionados] = useState<Record<number, string>>({});
  const [loadingDias, setLoadingDias] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Buscar histórico para sugerir sanção (tipo Atraso/Falta)
    api.getSancaoSugerida(colab.id, vaiPegarPosto === false ? 'Falta' : 'Atraso').then(data => {
      if (data) {
        setSancaoData(data);
        setSancaoSelecionada(data.sancao_sugerida);
      }
    });
  }, [colab.id, vaiPegarPosto]);

  useEffect(() => {
    let dias = 1;
    if (sancaoSelecionada.includes('2 Dias')) dias = 2;
    if (sancaoSelecionada.includes('3 Dias')) dias = 3;
    setDiasCobertura(dias);
  }, [sancaoSelecionada]);

  useEffect(() => {
    if (vaiPegarPosto === false) {
      // Buscar substitutos para cada dia necessário
      for (let i = 0; i < diasCobertura; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const isoDate = date.toISOString();
        
        setLoadingDias(prev => ({ ...prev, [i]: true }));
        const postoIdToUse = alocacaoAtual?.posto_id || undefined;
        api.getSubstitutos(postoIdToUse, colab.papel, isoDate).then(data => {
          setSubstitutosPorDia(prev => ({ ...prev, [i]: data }));
          setLoadingDias(prev => ({ ...prev, [i]: false }));
        });
      }
    }
  }, [vaiPegarPosto, alocacaoAtual, colab.papel, diasCobertura]);

  const handleSubmit = async () => {
    setLoading(true);
    const fakePorteiroId = "fake-porteiro-id"; 

    // Montar array de substitutos caso seja Falta/Suspensão
    const arraySubstitutos = [];
    if (!vaiPegarPosto) {
      for (let i = 0; i < diasCobertura; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const subId = usarMesmoSubstituto ? substitutosSelecionados[0] : substitutosSelecionados[i];
        if (subId) {
          arraySubstitutos.push({ colab_id: subId, data: date.toISOString() });
        }
      }
    }

    const payload = {
      atrasado_colab_id: colab.id,
      posto_id: alocacaoAtual?.posto_id,
      vai_pegar_posto: vaiPegarPosto,
      tempo_atraso_minutos: vaiPegarPosto ? Number(tempoAtraso) : null,
      sancao: sancaoSelecionada,
      observacao: `Cliente Informado: ${clienteInformado ? 'Sim' : 'Não'}. ${observacao}`,
      gerar_extra: vaiPegarPosto ? gerarExtraPorteiro : arraySubstitutos.length > 0,
      extra_colab_id: vaiPegarPosto ? fakePorteiroId : null,
      substitutos: vaiPegarPosto ? [] : arraySubstitutos,
      extra_tempo_minutos: vaiPegarPosto ? Number(tempoEsperaPorteiro) : null,
    };

    const success = await api.registrarTratamentoAtraso(payload);
    setLoading(false);

    if (success) {
      onSuccess();
    } else {
      alert("Falha ao registrar tratamento de ocorrência.");
    }
  };

  const isSubmitDisabled = () => {
    if (loading) return true;
    if (vaiPegarPosto === true && !tempoAtraso) return true;
    if (vaiPegarPosto === false) {
      if (usarMesmoSubstituto && !substitutosSelecionados[0]) return true;
      if (!usarMesmoSubstituto) {
        for (let i = 0; i < diasCobertura; i++) {
          if (!substitutosSelecionados[i]) return true;
        }
      }
    }
    return false;
  };

  const isLoadingComum = () => {
    for (let i = 0; i < diasCobertura; i++) {
      if (loadingDias[i]) return true;
    }
    return false;
  };

  // Funcao auxiliar para renderizar a lista de candidatos
  const renderCandidatos = (isLoading: boolean, candidatos: any[], keySelected: number) => {
    if (isLoading) {
      return <div className="text-center py-4 text-sm text-amber-600"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Buscando melhores candidatos...</div>;
    }
    if (!candidatos || candidatos.length === 0) {
      return <p className="text-sm text-amber-700">Nenhum substituto encontrado para este dia.</p>;
    }
    
    const selectedId = substitutosSelecionados[keySelected];

    return (
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {candidatos.map(sub => (
          <label key={sub.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedId === sub.id ? 'border-amber-500 bg-amber-100/50' : 'border-amber-100 bg-white hover:border-amber-300'}`}>
            <input 
              type="radio" 
              name={`substituto_${keySelected}`} 
              value={sub.id} 
              checked={selectedId === sub.id} 
              onChange={() => setSubstitutosSelecionados(prev => ({ ...prev, [keySelected]: sub.id }))} 
              className="mt-1" 
            />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">{sub.nome}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-800">{sub.tipoDisponibilidade}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex justify-between">
                <span>{sub.papel}</span>
                {sub.scoreDistancia === 0 && <span className="text-emerald-600 font-medium">Mesma cidade</span>}
                {sub.scoreDistancia > 0 && <span className="text-amber-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Outra cidade</span>}
              </div>
            </div>
          </label>
        ))}
      </div>
    );
  };

  // Se usar mesmo substituto, precisamos encontrar a interseção dos candidatos para todos os dias
  const candidatosComuns = () => {
    if (!substitutosPorDia[0]) return [];
    let comuns = [...substitutosPorDia[0]];
    for (let i = 1; i < diasCobertura; i++) {
      if (substitutosPorDia[i]) {
        comuns = comuns.filter(c => substitutosPorDia[i].find((s:any) => s.id === c.id));
      } else {
        return []; // Ainda carregando
      }
    }
    return comuns;
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Info */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-dark font-bold uppercase">
            {colab.nome.substring(0, 2)}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">{colab.nome}</h3>
            <p className="text-xs text-slate-500">{colab.papel} • {alocacaoAtual?.posto?.cliente?.nome_razao || 'Sem posto alocado'}</p>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          {sancaoData && (
            <div className={`border p-3 rounded-xl mb-2 ${sancaoData.total_ocorrencias > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
              <h4 className={`font-bold text-sm flex items-center gap-1.5 mb-2 ${sancaoData.total_ocorrencias > 0 ? 'text-amber-800' : 'text-slate-700'}`}>
                {sancaoData.total_ocorrencias > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />} 
                Histórico de {vaiPegarPosto === false ? 'Faltas' : 'Atrasos'}
              </h4>
              
              <div className="flex gap-4 text-xs mb-3">
                <div className="bg-white rounded border border-slate-200 p-2 flex-1 shadow-sm">
                  <span className="block text-slate-500 mb-1">Total de Ocorrências:</span>
                  <span className="font-bold text-slate-700">{sancaoData.total_ocorrencias}</span>
                  {sancaoData.ultima_ocorrencia && (
                    <span className="block text-[10px] text-slate-400 mt-1">
                      Última em: {new Date(sancaoData.ultima_ocorrencia).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                <div className="bg-white rounded border border-slate-200 p-2 flex-1 shadow-sm">
                  <span className="block text-slate-500 mb-1">Sanções Aplicadas:</span>
                  <span className="font-bold text-amber-700">{sancaoData.historico_count}</span>
                </div>
              </div>
              
              {sancaoData.historico.length > 0 ? (
                <div className="max-h-24 overflow-y-auto pr-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Histórico de Sanções</span>
                  <ul className="space-y-1.5">
                    {sancaoData.historico.map((h: any, i: number) => (
                      <li key={i} className="text-xs text-amber-800/80 flex justify-between bg-amber-100/50 px-2 py-1 rounded">
                        <span>{new Date(h.data).toLocaleDateString('pt-BR')}</span>
                        <span className="font-bold">{h.sancao}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-100">
                  Nenhuma sanção anterior aplicada neste assunto.
                </div>
              )}
            </div>
          )}

          <h4 className="font-semibold text-slate-700">O colaborador vai pegar o posto?</h4>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => { setVaiPegarPosto(true); setStep(2); }}
              className="p-4 border border-slate-200 rounded-xl hover:border-brand-cyan hover:bg-brand-cyan/5 transition-all text-center flex flex-col items-center gap-2"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span className="font-medium text-slate-700">Sim, apenas atraso</span>
            </button>
            <button 
              onClick={() => { setVaiPegarPosto(false); setStep(2); }}
              className="p-4 border border-slate-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all text-center flex flex-col items-center gap-2"
            >
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <span className="font-medium text-slate-700">Não, gerou falta</span>
            </button>
          </div>
        </div>
      )}

      {step === 2 && vaiPegarPosto === true && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Tempo de Atraso (minutos)</label>
              <input type="number" value={tempoAtraso} onChange={e => setTempoAtraso(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan" placeholder="Ex: 30" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Sanção a Aplicar</label>
              <select value={sancaoSelecionada} onChange={e => setSancaoSelecionada(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan">
                <option value="Nenhuma">Nenhuma</option>
                <option value="Informe">Informe</option>
                <option value="Advertência">Advertência</option>
                <option value="Suspensão 1 Dia">Suspensão 1 Dia</option>
                <option value="Suspensão 2 Dias">Suspensão 2 Dias</option>
                <option value="Suspensão 3 Dias">Suspensão 3 Dias</option>
                <option value="Justa Causa">Justa Causa</option>
              </select>
              {sancaoData && (
                <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
                  <p className="font-bold text-amber-700">Sugestão: {sancaoData.sancao_sugerida}</p>
                  <p className="text-slate-500 mb-1">Histórico neste assunto: {sancaoData.historico_count} registros</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Cliente informado do atraso?</span>
            <input type="checkbox" checked={clienteInformado} onChange={e => setClienteInformado(e.target.checked)} className="w-4 h-4 rounded text-brand-cyan" />
          </div>

          {colab.papel.toLowerCase().includes('portei') && (
            <div className="p-4 border border-brand-cyan/30 bg-brand-cyan/5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-brand-dark flex items-center gap-2"><User className="w-4 h-4"/> Alguém aguardou no posto?</span>
                <input type="checkbox" checked={gerarExtraPorteiro} onChange={e => setGerarExtraPorteiro(e.target.checked)} className="w-4 h-4 rounded text-brand-cyan" />
              </div>
              {gerarExtraPorteiro && (
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Tempo extra a gerar p/ quem aguardou (min)</label>
                  <input type="number" value={tempoEsperaPorteiro} onChange={e => setTempoEsperaPorteiro(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none" placeholder="Ex: 30" />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Observação Adicional</label>
            <textarea value={observacao} onChange={e => setObservacao(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan" placeholder="Ex: Trânsito intenso na via Dutra..."></textarea>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg">Voltar</button>
            <button onClick={handleSubmit} disabled={isSubmitDisabled()} className="bg-brand-cyan hover:bg-brand-teal text-white px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrar Atraso e Extras'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && vaiPegarPosto === false && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          
          <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Sanção (Falta)</label>
              <select value={sancaoSelecionada} onChange={e => {
                  setSancaoSelecionada(e.target.value);
                  setSubstitutosSelecionados({}); // Limpar seleção ao mudar sanção
                }} 
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
              >
                <option value="Nenhuma">Nenhuma</option>
                <option value="Informe">Informe</option>
                <option value="Advertência">Advertência</option>
                <option value="Suspensão 1 Dia">Suspensão 1 Dia</option>
                <option value="Suspensão 2 Dias">Suspensão 2 Dias</option>
                <option value="Suspensão 3 Dias">Suspensão 3 Dias</option>
                <option value="Justa Causa">Justa Causa</option>
              </select>
              {sancaoData && (
                <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
                  <p className="font-bold text-amber-700">Sugestão: {sancaoData.sancao_sugerida}</p>
                </div>
              )}
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 mt-5">
                <input type="checkbox" checked={clienteInformado} onChange={e => setClienteInformado(e.target.checked)} className="w-4 h-4 rounded text-brand-cyan" />
                Cliente Informado?
              </label>
            </div>
          </div>

          {diasCobertura > 1 && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Usar o mesmo substituto para os {diasCobertura} dias?</span>
              <input type="checkbox" checked={usarMesmoSubstituto} onChange={e => {
                setUsarMesmoSubstituto(e.target.checked);
                setSubstitutosSelecionados({});
              }} className="w-4 h-4 rounded text-brand-cyan" />
            </div>
          )}

          <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl space-y-4">
            <h4 className="font-bold text-amber-800 text-sm flex items-center gap-2 mb-1"><Clock className="w-4 h-4" /> Buscar Substituto(s)</h4>
            <p className="text-xs text-amber-700 mb-3">Cobertura necessária para {diasCobertura} dia(s).</p>
            
            {usarMesmoSubstituto ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Substituto para o período completo</span>
                {renderCandidatos(isLoadingComum(), candidatosComuns(), 0)}
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from({ length: diasCobertura }).map((_, i) => {
                  const dataFormat = new Date();
                  dataFormat.setDate(dataFormat.getDate() + i);
                  return (
                    <div key={i} className="border-t border-amber-200/50 pt-3 first:border-0 first:pt-0">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                        Dia {i + 1} - {dataFormat.toLocaleDateString('pt-BR')}
                      </span>
                      {renderCandidatos(loadingDias[i], substitutosPorDia[i] || [], i)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Observação / Justificativa</label>
            <textarea value={observacao} onChange={e => setObservacao(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"></textarea>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg">Voltar</button>
            <button onClick={handleSubmit} disabled={isSubmitDisabled()} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrar Falta e Acionar Substituto(s)'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
