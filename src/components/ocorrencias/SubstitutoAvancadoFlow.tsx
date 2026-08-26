'use client';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { User, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';

function parseDateBase(dbString: string) {
  if (!dbString) return null;
  const [d,m,y] = dbString.split('/');
  return new Date(parseInt(y), parseInt(m)-1, parseInt(d));
}
function is12x36WorkingDay(targetDate: Date, baseDate: Date) {
  if (!baseDate) return false;
  const target = new Date(targetDate);
  target.setHours(0,0,0,0);
  const base = new Date(baseDate);
  base.setHours(0,0,0,0);
  const diffTime = target.getTime() - base.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
  return diffDays % 2 === 0;
}

export function SubstitutoAvancadoFlow({ diasCobertura, colabOriginal, alocacaoAtual, exigeNR32, exigeNR35, onFinish }: any) {
  const [jaTemSubstituto, setJaTemSubstituto] = useState<boolean | null>(null);
  
  // Lista manual
  const [todosColabs, setTodosColabs] = useState<any[]>([]);
  const [subManualId, setSubManualId] = useState('');
  
  // Lista automatica
  const [loadingAuto, setLoadingAuto] = useState(false);
  const [substitutosAuto, setSubstitutosAuto] = useState<any[]>([]);
  const [subAutoId, setSubAutoId] = useState('');

  // Fluxo de perguntas para sub manual
  const [subManualCalculado, setSubManualCalculado] = useState<any>(null);
  const [cobriraAssimMesmo, setCobriraAssimMesmo] = useState<boolean | null>(null);
  const [vaiMandarAlguemProPosto, setVaiMandarAlguemProPosto] = useState<boolean | null>(null);
  const [clienteAvisadoFalta, setClienteAvisadoFalta] = useState<boolean | null>(null);

  useEffect(() => {
    api.getColabs().then(setTodosColabs);
  }, []);

  const selectAuto = () => {
    setJaTemSubstituto(false);
    setLoadingAuto(true);
    const date = new Date().toISOString();
    api.getSubstitutos(alocacaoAtual?.posto_id, colabOriginal?.categoria_cargo, date, undefined, undefined, colabOriginal?.cidade)
       .then(data => {
         setSubstitutosAuto(data);
         setLoadingAuto(false);
       });
  };

  const selectManual = () => {
    setJaTemSubstituto(true);
  };

  // Quando escolhe sub manual, calcula status dele
  useEffect(() => {
    if (subManualId) {
      const c = todosColabs.find(x => x.id === subManualId);
      if (c) {
        let deFolga = false;
        let posto_id = null;
        let nome_posto = '';
        if (c.alocacoes && c.alocacoes.length > 0) {
           const aloc = c.alocacoes[0];
           posto_id = aloc.posto_id;
           nome_posto = aloc.posto?.codigo || 'Posto Desconhecido';
           if (aloc.posto?.descricao_escala?.includes('12x36') && aloc.posto?.data_base_escala_12x36) {
             const base = parseDateBase(aloc.posto.data_base_escala_12x36);
             const target = new Date();
             if (base && !is12x36WorkingDay(target, base)) {
               deFolga = true;
             }
           }
        } else {
           deFolga = true; // livre
        }
        
        setSubManualCalculado({
          colab: c,
          deFolga,
          posto_id,
          nome_posto
        });
      }
    } else {
      setSubManualCalculado(null);
      setCobriraAssimMesmo(null);
      setVaiMandarAlguemProPosto(null);
      setClienteAvisadoFalta(null);
    }
  }, [subManualId, todosColabs]);

  const finalizarFluxoManual = (nestedData?: any) => {
     const payloadsSubs = [];
     const descontos = [];
     
     // 1. O Substituto principal (que cobrirá a falta) para todos os dias
     for(let i=0; i<diasCobertura; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        payloadsSubs.push({
           colab_id: subManualId,
           data: d.toISOString(),
           gerar_extra: subManualCalculado?.deFolga ? true : false
        });
     }

     // 2. O desconto se houver posto descoberto
     if (cobriraAssimMesmo && vaiMandarAlguemProPosto === false) {
        descontos.push({
           cliente_id: subManualCalculado.colab.alocacoes[0]?.posto?.cliente_id,
           posto_id: subManualCalculado.posto_id,
           colab_faltante_id: subManualId,
           data: new Date().toISOString(),
           motivo: 'Deslocado para cobrir outra falta',
           cliente_avisado: clienteAvisadoFalta || false
        });
     }

     onFinish({
       substitutosSelecionados: payloadsSubs,
       descontos_cliente: descontos
     });
  };

  const finalizarFluxoAuto = () => {
     if (!subAutoId) return;
     const payloadsSubs = [];
     for(let i=0; i<diasCobertura; i++){
        const d = new Date();
        d.setDate(d.getDate()+i);
        payloadsSubs.push({
           colab_id: subAutoId,
           data: d.toISOString(),
           gerar_extra: true // Automaticos sao folguistas ou livre
        });
     }
     onFinish({
       substitutosSelecionados: payloadsSubs,
       descontos_cliente: []
     });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
       <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-700 flex items-center gap-2"><User className="w-4 h-4"/> Seleção de Substituto</h4>
       </div>

       {jaTemSubstituto === null && (
         <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700">Você já tem alguém específico para substituir?</p>
            <div className="flex justify-center gap-4">
               <button onClick={selectManual} className="bg-brand-cyan hover:bg-brand-teal text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors">Sim, já escolhi</button>
               <button onClick={selectAuto} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-6 rounded-lg text-sm transition-colors">Não, buscar disponíveis</button>
            </div>
         </div>
       )}

       {jaTemSubstituto === true && (
         <div className="space-y-4 p-4 border border-slate-200 rounded-lg">
            <SearchableSelect 
               label="Buscar Substituto por Nome"
               options={todosColabs.map(c => ({ id: c.id, label: c.nome, subLabel: c.categoria_cargo }))}
               value={subManualId}
               onChange={setSubManualId}
            />

            {subManualCalculado && (
              <div className="mt-4 animate-in fade-in space-y-4">
                 {subManualCalculado.deFolga ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                       <p className="text-sm text-emerald-800 font-medium flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5"/> Colaborador está Livre ou em dia de Folga!</p>
                       <p className="text-xs text-emerald-600 mt-1">Será apontado Serviço Extra para este dia.</p>
                       <button onClick={finalizarFluxoManual} className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-sm transition-colors">Confirmar Substituto</button>
                    </div>
                 ) : (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg space-y-3">
                       <p className="text-sm text-amber-800 font-medium flex items-center"><AlertTriangle className="w-4 h-4 mr-1.5"/> Colaborador já está alocado!</p>
                       <p className="text-xs text-amber-700">Ele(a) deveria estar trabalhando no posto <b>{subManualCalculado.nome_posto}</b> hoje.</p>

                       <div className="pt-2 border-t border-amber-200/50">
                         <p className="text-xs font-bold text-amber-900 mb-2">Mesmo assim você vai cobrir a falta com ele?</p>
                         <div className="flex gap-2">
                            <button onClick={() => setCobriraAssimMesmo(true)} className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${cobriraAssimMesmo === true ? 'bg-amber-600 text-white' : 'bg-white border border-amber-300 text-amber-700'}`}>Sim</button>
                            <button onClick={() => { setCobriraAssimMesmo(false); setSubManualId(''); }} className="flex-1 py-1.5 text-xs font-bold rounded bg-white border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors">Não, escolher outro</button>
                         </div>
                       </div>

                       {cobriraAssimMesmo === true && (
                          <div className="pt-2 border-t border-amber-200/50 animate-in fade-in">
                            <p className="text-xs font-bold text-amber-900 mb-2">Vamos mandar alguém para o posto que ficou descoberto ({subManualCalculado.nome_posto})?</p>
                            <div className="flex gap-2">
                               <button onClick={() => setVaiMandarAlguemProPosto(true)} className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${vaiMandarAlguemProPosto === true ? 'bg-amber-600 text-white' : 'bg-white border border-amber-300 text-amber-700'}`}>Sim</button>
                               <button onClick={() => setVaiMandarAlguemProPosto(false)} className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${vaiMandarAlguemProPosto === false ? 'bg-amber-600 text-white' : 'bg-white border border-amber-300 text-amber-700'}`}>Não</button>
                            </div>
                          </div>
                       )}

                       {vaiMandarAlguemProPosto === true && (
                          <div className="pt-4 border-t border-amber-200/50 animate-in fade-in">
                             <div className="bg-white p-4 rounded-lg border-2 border-dashed border-amber-300">
                                <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                                   <User className="w-4 h-4" /> 
                                   Quem vai cobrir o posto de {subManualCalculado.colab.nome}?
                                </h4>
                                <SubstitutoAvancadoFlow 
                                   diasCobertura={diasCobertura}
                                   colabOriginal={subManualCalculado.colab}
                                   alocacaoAtual={subManualCalculado.colab.alocacoes?.[0]}
                                   exigeNR32={subManualCalculado.colab.alocacoes?.[0]?.posto?.exige_nr32}
                                   exigeNR35={subManualCalculado.colab.alocacoes?.[0]?.posto?.exige_nr35}
                                   onFinish={(nestedData: any) => finalizarFluxoManual(nestedData)}
                                />
                             </div>
                          </div>
                       )}

                       {vaiMandarAlguemProPosto === false && (
                          <div className="pt-2 border-t border-amber-200/50 animate-in fade-in space-y-3">
                             <p className="text-xs font-bold text-amber-900 mb-2">O cliente do Posto {subManualCalculado.nome_posto} já está avisado que ficará descoberto?</p>
                             <div className="flex gap-2">
                               <button onClick={() => setClienteAvisadoFalta(true)} className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${clienteAvisadoFalta === true ? 'bg-amber-600 text-white' : 'bg-white border border-amber-300 text-amber-700'}`}>Sim</button>
                               <button onClick={() => setClienteAvisadoFalta(false)} className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${clienteAvisadoFalta === false ? 'bg-amber-600 text-white' : 'bg-white border border-amber-300 text-amber-700'}`}>Não</button>
                             </div>
                             {clienteAvisadoFalta !== null && (
                                <button onClick={finalizarFluxoManual} className="w-full bg-brand-cyan hover:bg-brand-teal text-white font-bold py-2 rounded-lg text-sm mt-2 transition-colors">Confirmar Substituto e Gerar Desconto</button>
                             )}
                          </div>
                       )}

                    </div>
                 )}
              </div>
            )}
         </div>
       )}

       {jaTemSubstituto === false && (
         <div className="space-y-4 p-4 border border-slate-200 rounded-lg">
            {loadingAuto ? (
              <div className="text-center py-4 text-sm text-amber-600"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Buscando melhores candidatos...</div>
            ) : (
              <>
                 <div className="max-h-[40vh] overflow-y-auto space-y-2">
                   {substitutosAuto.map(sub => (
                     <label key={sub.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${subAutoId === sub.id ? 'border-brand-cyan bg-brand-cyan/5' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <input type="radio" name="subAuto" value={sub.id} checked={subAutoId === sub.id} onChange={() => setSubAutoId(sub.id)} className="mt-1 text-brand-cyan" />
                        <div className="flex-1">
                          <div className="font-bold text-slate-800 text-sm flex justify-between items-center">
                             {sub.nome}
                             <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{sub.tipoDisponibilidade}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex justify-between">
                             <span>{sub.papel}</span>
                             {sub.scoreDistancia === 0 && <span className="text-emerald-600 font-medium">Mesma cidade</span>}
                             {sub.scoreDistancia > 0 && <span className="text-amber-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Outra cidade</span>}
                          </div>
                        </div>
                     </label>
                   ))}
                   {substitutosAuto.length === 0 && (
                     <p className="text-sm text-amber-700 text-center py-4">Nenhum substituto livre ou folguista encontrado para este posto no momento.</p>
                   )}
                 </div>
                 {subAutoId && (
                   <button onClick={finalizarFluxoAuto} className="w-full bg-brand-cyan hover:bg-brand-teal text-white font-bold py-2 rounded-lg text-sm transition-colors">Confirmar Substituto</button>
                 )}
              </>
            )}
         </div>
       )}
    </div>
  );
}
