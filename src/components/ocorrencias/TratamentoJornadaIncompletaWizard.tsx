'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { api, Colaborador } from '@/services/api';

interface Props {
  colab: Colaborador;
  onClose: () => void;
  onSuccess: () => void;
}

export function TratamentoJornadaIncompletaWizard({ colab, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  
  // Dados Principais
  const [tipoJornada, setTipoJornada] = useState<'Chegar mais tarde' | 'Sair mais cedo' | ''>('');
  const [tempoMinutos, setTempoMinutos] = useState('');
  const [enviouAtestado, setEnviouAtestado] = useState(false);
  const [observacao, setObservacao] = useState('');
  
  // Sanção
  const [sancaoData, setSancaoData] = useState<{ sancao_sugerida: string, total_ocorrencias: number, historico_count: number, historico: any[] } | null>(null);
  const [sancaoSelecionada, setSancaoSelecionada] = useState('Nenhuma');

  // Cobertura
  const [precisaCobertura, setPrecisaCobertura] = useState(false);
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [loadingCandidatos, setLoadingCandidatos] = useState(false);
  const [substitutoSelecionado, setSubstitutoSelecionado] = useState('');

  const alocacaoAtual = colab.alocacoes?.[0];

  useEffect(() => {
    // Buscar histórico para sugerir sanção (tipo Não cumprimento de Horário englobado no backend)
    api.getSancaoSugerida(colab.id, 'Não cumprimento de Horário').then(data => {
      if (data) {
        setSancaoData(data);
        setSancaoSelecionada(data.sancao_sugerida);
      }
    });
  }, [colab.id]);

  useEffect(() => {
    if (precisaCobertura) {
      setLoadingCandidatos(true);
      const isoDate = new Date().toISOString();
      const postoIdToUse = alocacaoAtual?.posto_id || undefined;
      api.getSubstitutos(postoIdToUse, (colab.categoria_cargo || undefined), isoDate, undefined, undefined, (colab.cidade || undefined)).then(data => {
        setCandidatos(data);
        setLoadingCandidatos(false);
      });
    }
  }, [precisaCobertura, alocacaoAtual, colab.categoria_cargo]);

  const handleSubmit = async () => {
    if (!tipoJornada) {
      alert('Selecione se foi "Chegar mais tarde" ou "Sair mais cedo".');
      return;
    }

    setLoading(true);

    const payload = {
      colab_id: colab.id,
      tipo_jornada: tipoJornada,
      tempo_minutos: Number(tempoMinutos),
      sancao: sancaoSelecionada,
      observacao: observacao,
      enviou_atestado: enviouAtestado,
      precisa_cobertura: precisaCobertura,
      substituto_id: precisaCobertura ? substitutoSelecionado : null,
    };

    try {
      await api.registrarTratamentoJornadaIncompleta(payload);
      onSuccess();
    } catch (e) {
      alert("Falha ao registrar ocorrência.");
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = () => {
    if (loading) return true;
    if (!tipoJornada) return true;
    if (!tempoMinutos) return true;
    if (precisaCobertura && !substitutoSelecionado) return true;
    return false;
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Info */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-dark font-bold uppercase">
          {colab.nome.substring(0, 2)}
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">{colab.nome}</h3>
          <p className="text-xs text-slate-500">{colab.categoria_cargo} • {alocacaoAtual?.posto?.cliente?.nome_razao || 'Sem posto alocado'}</p>
        </div>
      </div>

      <div className="space-y-5">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Modalidade</label>
            <select 
              value={tipoJornada} 
              onChange={e => setTipoJornada(e.target.value as any)} 
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
            >
              <option value="">Selecione...</option>
              <option value="Chegar mais tarde">Chegar mais tarde</option>
              <option value="Sair mais cedo">Sair mais cedo</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Tempo (minutos)</label>
            <input 
              type="number" 
              value={tempoMinutos} 
              onChange={e => setTempoMinutos(e.target.value)} 
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan" 
              placeholder="Ex: 60" 
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={enviouAtestado} 
              onChange={e => setEnviouAtestado(e.target.checked)} 
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
            />
            <div>
              <span className="font-bold text-sm text-blue-900 block">Enviou Atestado de Comparecimento?</span>
              <span className="text-xs text-blue-700">Se não marcar, o sistema irá cobrar o documento em pendências.</span>
            </div>
          </label>
        </div>

        {sancaoData && (
          <div className={`border p-3 rounded-xl ${sancaoData.total_ocorrencias > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
            <h4 className={`font-bold text-sm flex items-center gap-1.5 mb-2 ${sancaoData.total_ocorrencias > 0 ? 'text-amber-800' : 'text-slate-700'}`}>
              {sancaoData.total_ocorrencias > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />} 
              Histórico: Não Cumprimento de Horário
            </h4>
            <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 mb-3 text-xs">
              <span className="text-slate-600">Ocorrências registradas: <strong className="text-slate-800">{sancaoData.total_ocorrencias}</strong></span>
              <span className="text-amber-600 font-bold">Sanção Sugerida: {sancaoData.sancao_sugerida}</span>
            </div>
            
            <label className="text-xs font-medium text-slate-600 mb-1 block">Sanção a Aplicar</label>
            <select 
              value={sancaoSelecionada} 
              onChange={e => setSancaoSelecionada(e.target.value)} 
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
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input 
              type="checkbox" 
              checked={precisaCobertura} 
              onChange={e => {
                setPrecisaCobertura(e.target.checked);
                if (!e.target.checked) setSubstitutoSelecionado('');
              }} 
              className="w-4 h-4 rounded text-brand-cyan" 
            />
            <span className="font-bold text-sm text-slate-800 block">Precisa de Cobertura / Substituto?</span>
          </label>

          {precisaCobertura && (
            <div className="mt-3 bg-white p-3 rounded-lg border border-slate-100">
              <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1 mb-3"><Clock className="w-3 h-3" /> Substitutos Disponíveis</h4>
              
              {loadingCandidatos ? (
                <div className="text-center py-4 text-sm text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Buscando...</div>
              ) : candidatos.length === 0 ? (
                <p className="text-sm text-amber-600 p-2 bg-amber-50 rounded">Nenhum substituto encontrado com os critérios.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {candidatos.map(sub => (
                    <label key={sub.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${substitutoSelecionado === sub.id ? 'border-brand-cyan bg-brand-cyan/5' : 'border-slate-100 bg-white hover:border-brand-cyan/30'}`}>
                      <input 
                        type="radio" 
                        name="substituto" 
                        value={sub.id} 
                        checked={substitutoSelecionado === sub.id} 
                        onChange={() => setSubstitutoSelecionado(sub.id)} 
                        className="mt-1" 
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800 text-sm">{sub.nome}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{sub.tipoDisponibilidade}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex justify-between">
                          <span>{sub.papel}</span>
                          {sub.scoreDistancia === 0 ? (
                            <span className="text-emerald-600 font-medium">Mesma cidade</span>
                          ) : (
                            <span className="text-amber-600 font-medium flex items-center gap-1">Outra cidade</span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Observação / Motivo</label>
          <textarea 
            value={observacao} 
            onChange={e => setObservacao(e.target.value)} 
            rows={2} 
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan" 
            placeholder="Ex: Consulta médica, imprevisto pessoal..."
          ></textarea>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
          <button onClick={handleSubmit} disabled={isSubmitDisabled()} className="bg-brand-cyan hover:bg-brand-teal text-white px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrar Jornada Incompleta'}
          </button>
        </div>

      </div>
    </div>
  );
}
