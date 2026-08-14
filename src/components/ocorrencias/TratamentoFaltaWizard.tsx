'use client';

import { useState, useEffect } from 'react';
import { Loader2, ArrowRight, CheckCircle2, User, Clock, AlertTriangle, FileText, Info } from 'lucide-react';
import { api, Colaborador, PostoDeTrabalho } from '@/services/api';

interface Props {
  colab: Colaborador;
  onClose: () => void;
  onSuccess: () => void;
}

export function TratamentoFaltaWizard({ colab, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const alocacaoAtual = colab.alocacoes?.[0];

  // Step 1
  const [origem, setOrigem] = useState('');
  const [contatoRealizado, setContatoRealizado] = useState(false);

  // Step 2
  const [motivo, setMotivo] = useState('');
  const [documentoJaEnviado, setDocumentoJaEnviado] = useState(false);
  const exigeDoc = ['Doença', 'INSS', 'Doação de Sangue', 'Acompanhar Filho Médico'].includes(motivo);

  // Step 3
  const [diasCobertura, setDiasCobertura] = useState(1);
  const [sancaoData, setSancaoData] = useState<any>(null);
  const [sancaoSelecionada, setSancaoSelecionada] = useState('Nenhuma');

  // Step 4
  const [usarMesmoSubstituto, setUsarMesmoSubstituto] = useState(true);
  const [obsSubstituto, setObsSubstituto] = useState('');
  const [substitutosPorDia, setSubstitutosPorDia] = useState<Record<number, any[]>>({});
  const [substitutosSelecionados, setSubstitutosSelecionados] = useState<Record<number, string>>({});
  const [loadingDias, setLoadingDias] = useState<Record<number, boolean>>({});
  const [treinamentoConfirmado, setTreinamentoConfirmado] = useState(false);

  // O posto define se a vaga exige NR
  const exigeNR32 = !!alocacaoAtual?.posto?.exige_nr32;
  const exigeNR35 = !!alocacaoAtual?.posto?.exige_nr35;

  const isAfastamentoLongo = diasCobertura > 3 || motivo === 'INSS';

  useEffect(() => {
    if (isAfastamentoLongo) {
      setUsarMesmoSubstituto(true);
    }
  }, [isAfastamentoLongo]);

  useEffect(() => {
    api.getSancaoSugerida(colab.id, 'Falta').then(data => {
      if (data) {
        setSancaoData(data);
      }
    });
  }, [colab.id]);

  useEffect(() => {
    if (step === 3 && (motivo === 'Sem Justificativa' || (motivo === 'Doença' && !documentoJaEnviado && false))) {
        // Logica para setar a sancao sugerida se nao tem justificativa
        if(sancaoData) setSancaoSelecionada(sancaoData.sancao_sugerida);
    } else {
        setSancaoSelecionada('Nenhuma');
    }
  }, [motivo, step, sancaoData, documentoJaEnviado]);

  useEffect(() => {
    if (step === 4) {
      for (let i = 0; i < diasCobertura; i++) {
        if(!substitutosPorDia[i]){
          const date = new Date();
          date.setDate(date.getDate() + i);
          const isoDate = date.toISOString();
          
          setLoadingDias(prev => ({ ...prev, [i]: true }));
          const postoIdToUse = alocacaoAtual?.posto_id || undefined;
          api.getSubstitutos(postoIdToUse, (colab.categoria_cargo || undefined), isoDate, undefined, undefined, (colab.cidade || undefined)).then(data => {
            setSubstitutosPorDia(prev => ({ ...prev, [i]: data }));
            setLoadingDias(prev => ({ ...prev, [i]: false }));
          });
        }
      }
    }
  }, [step, diasCobertura, alocacaoAtual, colab.categoria_cargo]);

  const handleSubmit = async () => {
    setLoading(true);

    const deveGerarExtra = (subId: string, dia: number) => {
      const sub = substitutosPorDia[dia]?.find((c: any) => c.id === subId);
      if (!sub) return true; // fallback
      const tipo = (sub.tipo_contratacao || '').toUpperCase();
      const isIntermitenteOuHorista = tipo.includes('INTERMITENTE') || tipo.includes('HORISTA');
      const isFolga = sub.tipoDisponibilidade?.includes('Folga') || false;
      return isIntermitenteOuHorista || isFolga;
    };

    const arraySubstitutos = [];
    if (isAfastamentoLongo) {
       if (substitutosSelecionados[0]) {
         arraySubstitutos.push({ 
           colab_id: substitutosSelecionados[0], 
           data: new Date().toISOString(),
           gerar_extra: deveGerarExtra(substitutosSelecionados[0], 0)
         });
       }
    } else {
      for (let i = 0; i < diasCobertura; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const subId = usarMesmoSubstituto ? substitutosSelecionados[0] : substitutosSelecionados[i];
        if (subId) {
          arraySubstitutos.push({ 
            colab_id: subId, 
            data: date.toISOString(),
            gerar_extra: deveGerarExtra(subId, usarMesmoSubstituto ? 0 : i)
          });
        }
      }
    }

    let obsFinal = obsSubstituto;
    if (treinamentoConfirmado) {
       obsFinal = `[ATENÇÃO: Necessita Treinamento NR] ${obsFinal}`.trim();
    }

    const payload = {
      atrasado_colab_id: colab.id,
      posto_id: alocacaoAtual?.posto_id,
      vai_pegar_posto: false,
      sancao: sancaoSelecionada !== 'Nenhuma' ? sancaoSelecionada : null,
      observacao: `Afastamento de ${diasCobertura} dia(s).`,
      origem_informacao: origem,
      motivo_falta: motivo,
      documento_exigido: exigeDoc,
      documento_entregue: documentoJaEnviado,
      observacao_substituto: obsFinal,
      dias_afastamento: diasCobertura,
      is_afastamento_longo: isAfastamentoLongo,
      substitutos: arraySubstitutos,
      nome_titular: colab.nome,
    };

    // Usaremos a mesma api de registrar atraso pois a logica de salvar no BD é compartilhada
    const success = await api.registrarTratamentoAtraso(payload);
    setLoading(false);

    if (success) {
      onSuccess();
    } else {
      alert("Falha ao registrar tratamento de ocorrência.");
    }
  };

  const isLoadingComum = () => {
    for (let i = 0; i < diasCobertura; i++) {
      if (loadingDias[i]) return true;
    }
    return false;
  };

  const renderCandidatos = (isLoading: boolean, candidatos: any[], keySelected: number) => {
    if (isLoading) {
      return <div className="text-center py-4 text-sm text-amber-600"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Buscando melhores candidatos...</div>;
    }
    if (!candidatos || candidatos.length === 0) {
      return <p className="text-sm text-amber-700">Nenhum substituto encontrado para este dia.</p>;
    }
    const selectedId = substitutosSelecionados[keySelected];

    let exibicao = [...candidatos];
    if (exigeNR32 || exigeNR35) {
       exibicao.sort((a, b) => {
         let aScore = (exigeNR32 && a.tem_nr32 ? 1 : 0) + (exigeNR35 && a.tem_nr35 ? 1 : 0);
         let bScore = (exigeNR32 && b.tem_nr32 ? 1 : 0) + (exigeNR35 && b.tem_nr35 ? 1 : 0);
         return bScore - aScore;
       });
    }

    const selecionado = exibicao.find(c => c.id === selectedId);
    const faltaNR = selecionado && ((exigeNR32 && !selecionado.tem_nr32) || (exigeNR35 && !selecionado.tem_nr35));

    return (
      <div className="space-y-2">
        <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
          {exibicao.map(sub => {
            const faltaNRSub = (exigeNR32 && !sub.tem_nr32) || (exigeNR35 && !sub.tem_nr35);
            return (
              <label key={sub.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedId === sub.id ? 'border-brand-cyan bg-brand-cyan/5' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <input type="radio" name={`substituto_${keySelected}`} value={sub.id} checked={selectedId === sub.id} onChange={() => { setSubstitutosSelecionados(prev => ({ ...prev, [keySelected]: sub.id })); setTreinamentoConfirmado(false); }} className="mt-1 text-brand-cyan" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      {sub.nome}
                      {!faltaNRSub && (exigeNR32 || exigeNR35) && <span title="Possui os NRs exigidos"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /></span>}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{sub.tipoDisponibilidade}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex justify-between">
                    <span>{sub.papel}</span>
                    {sub.scoreDistancia === 0 && <span className="text-emerald-600 font-medium">Mesma cidade</span>}
                    {sub.scoreDistancia > 0 && <span className="text-amber-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Outra cidade</span>}
                  </div>
                  {faltaNRSub && (exigeNR32 || exigeNR35) && (
                    <div className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Faltam certificações (NR32/NR35)
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
        
        {faltaNR && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg mt-3">
            <p className="text-xs text-red-800 mb-2 font-medium flex items-center gap-1.5"><AlertTriangle className="w-4 h-4"/> O colaborador selecionado não possui as certificações (NR32/NR35) exigidas pelo posto.</p>
            <label className="flex items-center gap-2 text-xs font-bold text-red-900 cursor-pointer">
              <input type="checkbox" checked={treinamentoConfirmado} onChange={e => setTreinamentoConfirmado(e.target.checked)} className="rounded text-red-600" />
              Confirmo que o colaborador receberá o treinamento necessário.
            </label>
          </div>
        )}
      </div>
    );
  };

  const candidatosComuns = () => {
    if (!substitutosPorDia[0]) return [];
    let comuns = [...substitutosPorDia[0]];
    for (let i = 1; i < diasCobertura; i++) {
      if (substitutosPorDia[i]) {
        comuns = comuns.filter(c => substitutosPorDia[i].find((s:any) => s.id === c.id));
      } else return [];
    }
    return comuns;
  };

  const isSubmitDisabled = () => {
    if (loading) return true;
    if (usarMesmoSubstituto && !substitutosSelecionados[0]) return true;
    if (!usarMesmoSubstituto) {
      for (let i = 0; i < diasCobertura; i++) {
        if (!substitutosSelecionados[i]) return true;
      }
    }
    // Verificacao de Treinamento NR
    if (exigeNR32 || exigeNR35) {
      if (usarMesmoSubstituto && substitutosSelecionados[0]) {
        const c = substitutosPorDia[0]?.find((x:any) => x.id === substitutosSelecionados[0]);
        if (c && ((exigeNR32 && !c.tem_nr32) || (exigeNR35 && !c.tem_nr35)) && !treinamentoConfirmado) return true;
      } else if (!usarMesmoSubstituto) {
        // Multiplos substitutos sem confirmacao nao vamos checar por dia para simplificar, 
        // a logica assume que a confirmacao foi exibida pelo ultimo renderizado, mas o ideal é 
        // bloquear se QUALQUER UM nao tiver. Para evitar travar o fluxo, checamos se existe algum sem NR e se treinamentoConfirmado=false.
        let algumSemNR = false;
        for (let i = 0; i < diasCobertura; i++) {
          const c = substitutosPorDia[i]?.find((x:any) => x.id === substitutosSelecionados[i]);
          if (c && ((exigeNR32 && !c.tem_nr32) || (exigeNR35 && !c.tem_nr35))) algumSemNR = true;
        }
        if (algumSemNR && !treinamentoConfirmado) return true;
      }
    }
    return false;
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Info */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold uppercase">
            {colab.nome.substring(0, 2)}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">{colab.nome}</h3>
            <p className="text-xs text-slate-500">{colab.categoria_cargo} • {alocacaoAtual?.posto?.cliente?.nome_razao || 'Sem posto alocado'}</p>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h4 className="font-bold text-slate-700">Quem informou a falta?</h4>
          <div className="grid grid-cols-1 gap-3">
            {['Próprio Funcionário', 'Cliente', 'Funcionário Aguardando no Posto'].map(o => (
              <label key={o} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${origem === o ? 'border-brand-cyan bg-brand-cyan/5' : 'border-slate-200 hover:border-brand-cyan/50'}`}>
                <input type="radio" name="origem" value={o} checked={origem === o} onChange={(e) => setOrigem(e.target.value)} className="w-4 h-4 text-brand-cyan" />
                <span className="font-medium text-slate-700">{o}</span>
              </label>
            ))}
          </div>

          {(origem === 'Cliente' || origem === 'Funcionário Aguardando no Posto') && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
              <h5 className="font-bold text-amber-800 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4"/> Ação Recomendada
              </h5>
              <p className="text-sm text-amber-700">Antes de prosseguir, tente entrar em contato com o funcionário ausente para confirmar o motivo e verificar se existem documentos justificativos.</p>
              <label className="flex items-center gap-2 text-sm font-medium text-amber-900 bg-white/50 p-2 rounded-lg cursor-pointer">
                <input type="checkbox" checked={contatoRealizado} onChange={e => setContatoRealizado(e.target.checked)} className="rounded" />
                Contato realizado / Motivo conhecido
              </label>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              onClick={() => setStep(2)} 
              disabled={!origem || ((origem === 'Cliente' || origem === 'Funcionário Aguardando no Posto') && !contatoRealizado)}
              className="bg-brand-cyan hover:bg-brand-teal text-white px-5 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              Próximo Passo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h4 className="font-bold text-slate-700">Qual o motivo da falta?</h4>
          <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan">
            <option value="">Selecione o motivo...</option>
            <option value="Doença">Doença (Atestado)</option>
            <option value="INSS">Afastamento INSS</option>
            <option value="Doação de Sangue">Doação de Sangue</option>
            <option value="Acompanhar Filho Escola">Acompanhar Filho (Escola)</option>
            <option value="Acompanhar Filho Médico">Acompanhar Filho (Médico)</option>
            <option value="Sem Justificativa">Sem Justificativa</option>
          </select>

          {motivo && exigeDoc && (
             <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3 mt-4">
                <div className="flex items-center gap-2 text-brand-dark font-bold text-sm">
                  <FileText className="w-4 h-4" /> Exige Documento Comprobatório
                </div>
                <p className="text-xs text-slate-600">Este motivo exige que um documento seja entregue em até 48 horas. Se não for entregue, a falta será convertida para "Sem Justificativa" passível de sanção.</p>
                
                {origem === 'Próprio Funcionário' && (
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 p-3 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" checked={documentoJaEnviado} onChange={e => setDocumentoJaEnviado(e.target.checked)} className="rounded text-brand-cyan" />
                    O funcionário já enviou o documento agora?
                  </label>
                )}
             </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg">Voltar</button>
            <button onClick={() => setStep(3)} disabled={!motivo} className="bg-brand-cyan hover:bg-brand-teal text-white px-5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
              Próximo Passo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          
          <h4 className="font-bold text-slate-700">Tempo de Afastamento</h4>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Quantos dias de afastamento (conforme atestado / justificativa)?</label>
            <input type="number" min="1" value={diasCobertura} onChange={(e) => setDiasCobertura(parseInt(e.target.value) || 1)} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-brand-cyan" />
            <p className="text-[10px] text-slate-500 mt-1">Isto definirá os dias necessários de cobertura por substitutos.</p>
          </div>

          {isAfastamentoLongo && (
            <div className="bg-brand-cyan/10 border border-brand-cyan/30 p-3 rounded-xl flex gap-3 mt-3">
              <Info className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
              <p className="text-xs text-brand-dark">Como o afastamento é maior que 3 dias ou via INSS, <strong>o substituto escolhido no próximo passo será alocado oficialmente neste posto</strong> pelo mesmo período. Quando o titular retornar, o sistema perguntará se a troca deve ser desfeita.</p>
            </div>
          )}

          {motivo === 'Sem Justificativa' && sancaoData && (
            <div className="mt-4 border p-4 rounded-xl bg-amber-50 border-amber-200">
               <h4 className="font-bold text-sm flex items-center gap-1.5 mb-2 text-amber-800">
                <AlertTriangle className="w-4 h-4" /> Falta Injustificada - Histórico
              </h4>
              <p className="text-xs text-amber-700 mb-3">
                Total de faltas registradas: <strong>{sancaoData.total_ocorrencias}</strong>. Sanções já aplicadas: <strong>{sancaoData.historico_count}</strong>.
              </p>
              
              <label className="text-xs font-bold text-amber-900 mb-1 block">Sugerir Sanção (Progessiva)</label>
              <select value={sancaoSelecionada} onChange={e => setSancaoSelecionada(e.target.value)} className="w-full rounded-lg border border-amber-300 p-2 text-sm outline-none bg-white focus:ring-1 focus:ring-amber-500">
                <option value="Nenhuma">Nenhuma</option>
                <option value="Informe">Informe</option>
                <option value="Advertência">Advertência</option>
                <option value="Suspensão 1 Dia">Suspensão 1 Dia</option>
                <option value="Suspensão 2 Dias">Suspensão 2 Dias</option>
                <option value="Suspensão 3 Dias">Suspensão 3 Dias</option>
                <option value="Justa Causa">Justa Causa</option>
              </select>
              <p className="text-xs text-amber-700 mt-1 font-medium">Recomendação do sistema: {sancaoData.sancao_sugerida}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
            <button onClick={() => setStep(2)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg">Voltar</button>
            <button onClick={() => setStep(4)} className="bg-brand-cyan hover:bg-brand-teal text-white px-5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
              Escolher Substituto <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-700 flex items-center gap-2"><User className="w-4 h-4"/> Seleção de Substituto</h4>
            {diasCobertura > 1 && !isAfastamentoLongo && (
               <label className="text-xs flex items-center gap-2 text-slate-600 bg-slate-100 px-2 py-1 rounded cursor-pointer">
                 <input type="checkbox" checked={usarMesmoSubstituto} onChange={e => setUsarMesmoSubstituto(e.target.checked)} className="rounded" />
                 Usar mesmo substituto para todos os dias
               </label>
            )}
            {isAfastamentoLongo && (
              <span className="text-xs font-bold text-brand-teal bg-brand-cyan/10 px-2 py-1 rounded">Alocação Única (Afastamento Longo)</span>
            )}
          </div>
          
          {(exigeNR32 || exigeNR35) && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800">O posto deste colaborador exige certificações: <strong>{[exigeNR32 ? 'NR32' : '', exigeNR35 ? 'NR35' : ''].filter(Boolean).join(' e ')}</strong>. Os candidatos abaixo foram ordenados com base neste requisito.</p>
            </div>
          )}

          <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl space-y-4">
            {usarMesmoSubstituto ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Substituto para o período completo ({diasCobertura} dia{diasCobertura>1?'s':''})</span>
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
            <label className="text-xs font-medium text-slate-600 mb-1 block">Observação (Opcional)</label>
            <input type="text" value={obsSubstituto} onChange={e => setObsSubstituto(e.target.value)} placeholder={isAfastamentoLongo ? "Ex: Alocada pelo período do INSS..." : "Ex: Contatada e ciente do horário..."} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-brand-cyan" />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
            <button onClick={() => setStep(3)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg">Voltar</button>
            <button onClick={handleSubmit} disabled={isSubmitDisabled()} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Falta e Alocar Substituto'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
