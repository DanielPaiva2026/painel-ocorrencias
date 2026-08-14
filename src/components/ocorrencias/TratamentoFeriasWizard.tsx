'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api, Colaborador, Substituto } from '@/services/api';
import { SearchableSelect } from './SearchableSelect';

type Step = 'AVISO' | 'COBERTURA' | 'CONCLUSAO';

type Vaga = {
  posto_id: string;
  colab_substituido_id: string;
  colab_nome: string;
  posto_nome?: string;
};

export function TratamentoFeriasWizard({ 
  colab, 
  onClose, 
  onSuccess 
}: { 
  colab: Colaborador; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [step, setStep] = useState<Step>('AVISO');
  const [loading, setLoading] = useState(false);

  // Aviso State
  const [dataAviso, setDataAviso] = useState(new Date().toISOString().split('T')[0]);
  const [diasFerias, setDiasFerias] = useState(30);
  const [diasVenda, setDiasVenda] = useState(0);
  const [avisoCriado, setAvisoCriado] = useState<any>(null);

  // Cobertura Cadeia State
  const [vagasFila, setVagasFila] = useState<Vaga[]>([]);
  const [tipoSubstituicao, setTipoSubstituicao] = useState<'Livre' | 'Transferencia'>('Livre');
  const [candidatos, setCandidatos] = useState<Substituto[]>([]);
  const [substitutoId, setSubstitutoId] = useState('');
  const [treinamentoConfirmado, setTreinamentoConfirmado] = useState(false);
  const [isFetchingSubstitutos, setIsFetchingSubstitutos] = useState(false);

  // Info
  const [clientesAvisados, setClientesAvisados] = useState(false);

  const alocacaoAtual = colab.alocacoes?.[0];
  const postoBaseId = alocacaoAtual?.posto_id || null;
  const postoBaseNome = alocacaoAtual?.posto?.cliente?.nome_razao || '';

  // Exigências da vaga atual na fila
  const [exigeNR32, setExigeNR32] = useState(!!alocacaoAtual?.posto?.exige_nr32);
  const [exigeNR35, setExigeNR35] = useState(!!alocacaoAtual?.posto?.exige_nr35);

  const vagaAtual = vagasFila.length > 0 ? vagasFila[0] : null;

  useEffect(() => {
    if (step === 'COBERTURA' && vagaAtual) {
      setIsFetchingSubstitutos(true);
      setSubstitutoId('');
      setTreinamentoConfirmado(false);
      
      api.getSubstitutos(vagaAtual.posto_id, colab.categoria_cargo || undefined, new Date(dataAviso).toISOString(), undefined, undefined, colab.cidade || undefined).then(data => {
        if (tipoSubstituicao === 'Livre') {
          setCandidatos(data);
        } else {
          api.getColabs().then(colabs => {
            const alocados = colabs
              .filter(c => c.alocacoes && c.alocacoes.length > 0 && c.id !== colab.id && c.id !== vagaAtual.colab_substituido_id)
              .map(c => ({
                id: c.id,
                nome: c.nome,
                categoria_cargo: c.categoria_cargo,
                turno_base: c.turno_base,
                situacao_disponibilidade: c.situacao_disponibilidade || '',
                tipoDisponibilidade: 'Alocado (' + c.alocacoes![0].posto?.cliente?.nome_razao + ')',
                prioridade: 99,
                horasRestantes: 0,
                scoreDistancia: 1,
                alocacoesCount: 1,
                tem_nr32: !!(c.data_nr32 || c.reciclagem_nr32),
                tem_nr35: !!(c.data_nr35 || c.reciclagem_nr35),
                tipo_contratacao: c.tipo_contratacao || '',
                alocacao_posto_id: c.alocacoes![0].posto_id,
                alocacao_posto_nome: c.alocacoes![0].posto?.cliente?.nome_razao || ''
              }));
            setCandidatos(alocados);
          });
        }
        setIsFetchingSubstitutos(false);
      });
    }
  }, [step, vagaAtual?.posto_id, tipoSubstituicao, dataAviso]);

  async function handleCriarAviso(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await api.createAvisoFerias({
      colab_id: colab.id,
      data_aviso: new Date(dataAviso).toISOString(),
      dias_ferias: Number(diasFerias),
      dias_venda: Number(diasVenda)
    });
    
    setLoading(false);
    if (result) {
      setAvisoCriado(result);
      if (postoBaseId) {
        setVagasFila([{
          posto_id: postoBaseId,
          colab_substituido_id: colab.id,
          colab_nome: colab.nome,
          posto_nome: postoBaseNome
        }]);
        setStep('COBERTURA');
      } else {
        setStep('CONCLUSAO');
      }
    } else {
      alert("Falha ao registrar aviso de férias.");
    }
  }

  async function handleCobertura(e: React.FormEvent) {
    e.preventDefault();
    if (!vagaAtual) return;
    if (!substitutoId) return alert('Selecione um substituto');
    
    const sub = candidatos.find(c => c.id === substitutoId);
    if (sub && ((exigeNR32 && !sub.tem_nr32) || (exigeNR35 && !sub.tem_nr35)) && !treinamentoConfirmado) {
      return alert('Confirme o treinamento das NRs para continuar.');
    }

    setLoading(true);

    const success = await api.createCoberturaFerias(avisoCriado.id, {
      posto_id: vagaAtual.posto_id,
      colab_substituto_id: substitutoId,
      colab_substituido_id: vagaAtual.colab_substituido_id
    });

    setLoading(false);
    if (success) {
      const novaFila = [...vagasFila];
      novaFila.shift(); // Remove a vaga preenchida

      if (tipoSubstituicao === 'Transferencia' && sub?.alocacao_posto_id) {
        // Se transferiu, a vaga do substituto ficou aberta! Adiciona na fila.
        novaFila.push({
          posto_id: sub.alocacao_posto_id,
          colab_substituido_id: sub.id,
          colab_nome: sub.nome,
          posto_nome: sub.alocacao_posto_nome
        });
      }

      setVagasFila(novaFila);

      if (novaFila.length === 0) {
        setStep('CONCLUSAO');
      } else {
        // Zera as escolhas para a próxima vaga na fila
        setTipoSubstituicao('Livre');
        setSubstitutoId('');
        setTreinamentoConfirmado(false);
        // NOTA: Para ser exato, precisaríamos buscar os requisitos do NOVO posto.
        // Se a API retornasse as exigências do posto, seria ideal. Assumimos false ou mantemos.
      }
    } else {
      alert("Erro ao registrar cobertura.");
    }
  }

  const renderCandidatosLivres = () => {
    if (isFetchingSubstitutos) return <div className="text-center py-4 text-sm text-brand-cyan"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Buscando candidatos...</div>;
    if (!candidatos || candidatos.length === 0) return <p className="text-sm text-slate-500">Nenhum candidato encontrado.</p>;

    let exibicao = [...candidatos];
    if (exigeNR32 || exigeNR35) {
       exibicao.sort((a, b) => {
         let aScore = (exigeNR32 && a.tem_nr32 ? 1 : 0) + (exigeNR35 && a.tem_nr35 ? 1 : 0);
         let bScore = (exigeNR32 && b.tem_nr32 ? 1 : 0) + (exigeNR35 && b.tem_nr35 ? 1 : 0);
         return bScore - aScore;
       });
    }

    const selecionado = exibicao.find(c => c.id === substitutoId);
    const faltaNR = selecionado && ((exigeNR32 && !selecionado.tem_nr32) || (exigeNR35 && !selecionado.tem_nr35));

    return (
      <div className="space-y-2 mt-2 border border-slate-100 rounded-xl p-2 bg-slate-50">
        <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
          {exibicao.map(sub => {
            const faltaNRSub = (exigeNR32 && !sub.tem_nr32) || (exigeNR35 && !sub.tem_nr35);
            return (
              <label key={sub.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${substitutoId === sub.id ? 'border-brand-cyan bg-brand-cyan/5' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <input type="radio" name="substituto" value={sub.id} checked={substitutoId === sub.id} onChange={() => { setSubstitutoId(sub.id); setTreinamentoConfirmado(false); }} className="mt-1 text-brand-cyan" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      {sub.nome}
                      {!faltaNRSub && (exigeNR32 || exigeNR35) && <span title="Possui os NRs exigidos"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /></span>}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{sub.tipoDisponibilidade}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex justify-between">
                    <span>{sub.categoria_cargo}</span>
                    {sub.scoreDistancia === 0 && <span className="text-emerald-600 font-medium">Mesma cidade</span>}
                    {sub.scoreDistancia > 0 && <span className="text-amber-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Outra cidade</span>}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
        
        {faltaNR && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg mt-3">
            <p className="text-xs text-red-800 mb-2 font-medium flex items-center gap-1.5"><AlertTriangle className="w-4 h-4"/> O colaborador selecionado não possui as certificações exigidas pelo posto.</p>
            <label className="flex items-center gap-2 text-xs font-bold text-red-900 cursor-pointer">
              <input type="checkbox" checked={treinamentoConfirmado} onChange={e => setTreinamentoConfirmado(e.target.checked)} className="rounded text-red-600" />
              Confirmo que o colaborador receberá o treinamento necessário.
            </label>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          Lançar Férias
        </h3>
        <span className="text-xs font-semibold bg-brand-cyan/10 text-brand-teal px-2 py-1 rounded-md">
          {step === 'AVISO' ? 'Passo 1' : step === 'COBERTURA' ? 'Cobertura' : 'Conclusão'}
        </span>
      </div>

      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">
        <p className="text-sm font-medium text-slate-700">Colaborador: <span className="font-bold">{colab.nome}</span></p>
        <p className="text-xs text-slate-500">Último Aquisitivo: {colab.ferias_ultimo_aquisitivo || 'Não registrado'}</p>
      </div>

      {step === 'AVISO' && (
        <form onSubmit={handleCriarAviso} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">Data do Aviso de Férias</label>
            <input 
              type="date" 
              required 
              value={dataAviso}
              onChange={e => setDataAviso(e.target.value)}
              className="w-full rounded-xl border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-brand-cyan" 
            />
            <p className="text-xs text-slate-400 mt-1">As férias iniciarão 30 dias após esta data.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Dias de Férias</label>
              <select 
                value={diasFerias} 
                onChange={e => setDiasFerias(Number(e.target.value))}
                className="w-full rounded-xl border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-brand-cyan"
              >
                <option value={30}>30 dias</option>
                <option value={15}>15 dias</option>
                <option value={10}>10 dias</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Venda (Abono)</label>
              <select 
                value={diasVenda} 
                onChange={e => setDiasVenda(Number(e.target.value))}
                className="w-full rounded-xl border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-brand-cyan"
              >
                <option value={0}>Não vendeu</option>
                <option value={10}>10 dias</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={loading} className="bg-brand-cyan text-white px-4 py-2 text-sm rounded-lg hover:bg-brand-teal transition-colors">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lançar e Avançar'}
            </button>
          </div>
        </form>
      )}

      {step === 'COBERTURA' && vagaAtual && (
        <form onSubmit={handleCobertura} className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-800">
            <strong>Substituição Necessária:</strong> Quem irá assumir a vaga deixada por <strong>{vagaAtual.colab_nome}</strong> no posto {vagaAtual.posto_nome || 'atual'}?
          </div>
          
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="tipoSub" checked={tipoSubstituicao === 'Livre'} onChange={() => { setTipoSubstituicao('Livre'); setSubstitutoId(''); }} />
              <span className="text-sm font-medium text-slate-700">Com um Disponível</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="tipoSub" checked={tipoSubstituicao === 'Transferencia'} onChange={() => { setTipoSubstituicao('Transferencia'); setSubstitutoId(''); }} />
              <span className="text-sm font-medium text-slate-700">Transferir de Outro Posto</span>
            </label>
          </div>

          <div>
            {tipoSubstituicao === 'Livre' ? (
              renderCandidatosLivres()
            ) : (
              <div className="mt-2">
                <SearchableSelect
                  label="Pesquisar funcionário por nome"
                  placeholder="Selecione um funcionário de outro posto"
                  value={substitutoId}
                  onChange={setSubstitutoId}
                  options={candidatos.map(c => ({
                    id: c.id,
                    label: c.nome,
                    subLabel: c.tipoDisponibilidade
                  }))}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="submit" disabled={loading || !substitutoId} className="bg-brand-cyan text-white px-4 py-2 text-sm rounded-lg hover:bg-brand-teal transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Cobertura'}
            </button>
          </div>
        </form>
      )}

      {step === 'CONCLUSAO' && (
        <div className="flex flex-col gap-4 items-center py-6 text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Férias e Coberturas Registradas!</h3>
          <p className="text-sm text-slate-500">
            A cadeia de transferências e substituições foi agendada com sucesso. O documento de aviso está pendente na aba Tratamento de Férias.
          </p>
          
          <label className="flex items-center gap-2 mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer w-full text-left">
            <input type="checkbox" checked={clientesAvisados} onChange={e => setClientesAvisados(e.target.checked)} className="w-4 h-4 text-brand-cyan rounded border-slate-300" />
            <span className="text-sm font-medium text-slate-700">Confirmo que os postos foram comunicados das alterações.</span>
          </label>

          <button 
            disabled={!clientesAvisados}
            onClick={onSuccess} 
            className="w-full mt-4 bg-brand-cyan text-white py-2.5 rounded-xl font-medium shadow-sm hover:bg-brand-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Concluir
          </button>
        </div>
      )}
    </div>
  );
}
