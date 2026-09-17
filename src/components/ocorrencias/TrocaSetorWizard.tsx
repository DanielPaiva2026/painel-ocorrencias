import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Briefcase, ArrowRight, CheckCircle2, UserX } from 'lucide-react';

interface TrocaSetorWizardProps {
  onClose: () => void;
  onFinish: () => void;
}

export function TrocaSetorWizard({ onClose, onFinish }: TrocaSetorWizardProps) {
  const [step, setStep] = useState(1);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [postos, setPostos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("");
  const [alocacoes, setAlocacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State para a cadeia de remanejamento
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [livres, setLivres] = useState<any[]>([]);

  // Variaveis da iteracao atual
  const [colabOrigem, setColabOrigem] = useState<any>(null);
  const [postoDestino, setPostoDestino] = useState<any>(null);
  const [ocupanteAtual, setOcupanteAtual] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cData, pData, aData, clData] = await Promise.all([
          api.getColabs(),
          api.getPostos(),
          api.getAlocacoes(),
          api.getClientes()
        ]);
        setColaboradores(cData.filter((c: any) => c.status_cadastro !== 'Inativo'));
        setPostos(pData);
        setAlocacoes(aData);
        setClientes(clData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectOrigem = (cId: string) => {
    const c = colaboradores.find(x => x.id === cId);
    setColabOrigem(c);
  };

  const handleSelectPosto = (pId: string) => {
    const p = postos.find(x => x.id === pId);
    setPostoDestino(p);
  };

  const confirmarPosto = () => {
    if (!postoDestino) return;

    // Verificar se alguem esta nesse posto
    // Cuidado: pode ja estar nas movimentacoes recem-criadas
    const alocadoAnterior = alocacoes.find(a => a.posto_id === postoDestino.id);
    
    // Precisamos saber quem esta la AGORA.
    // Se alguem ja foi movido pra la no array 'movimentacoes', seria um erro de colisao, mas vamos focar no estado do banco.
    if (alocadoAnterior && alocadoAnterior.colab_id !== colabOrigem.id) {
      const ocupante = colaboradores.find(c => c.id === alocadoAnterior.colab_id);
      if (ocupante) {
        setOcupanteAtual(ocupante);
        setStep(3); // Decisao de conflito
        return;
      }
    }

    // Se vazio
    avancarCadeia(null, null);
  };

  const avancarCadeia = (decisaoOcupante: 'Livre' | 'Outro' | null, ocupanteC: any = null) => {
    // Registra a movimentacao atual
    const novaMov = {
      colabId: colabOrigem.id,
      colabNome: colabOrigem.nome,
      postoId: postoDestino.id,
      postoNome: postoDestino.nome
    };
    
    setMovimentacoes(prev => [...prev, novaMov]);

    if (!decisaoOcupante) {
      // Fim da linha (posto vazio)
      setStep(4);
    } else if (decisaoOcupante === 'Livre') {
      setLivres(prev => [...prev, { id: ocupanteC.id, nome: ocupanteC.nome }]);
      setStep(4); // Fim da linha
    } else if (decisaoOcupante === 'Outro') {
      // Repete o processo para o ocupante
      setColabOrigem(ocupanteC);
      setPostoDestino(null);
      setOcupanteAtual(null);
      setStep(2);
    }
  };

  const handleFinalizar = async () => {
    try {
      setLoading(true);
      const payload = {
        movimentacoes: movimentacoes.map(m => ({ colabId: m.colabId, postoId: m.postoId })),
        livres: livres.map(l => l.id)
      };
      
      const success = await api.processarRemanejamento(payload);

      if (!success) throw new Error("Falha ao remanejar");
      alert("Remanejamento concluído com sucesso!");
      onFinish();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar remanejamento.");
      setLoading(false);
    }
  };

  if (loading) return <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 text-white">Carregando...</div>;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-brand-dark p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-cyan" />
              Troca de Setor (Remanejamento)
            </h2>
            <p className="text-sm text-slate-300 mt-1">Realize a troca de postos e defina as substituições em cadeia.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">1. Quem será trocado de setor?</h3>
              <p className="text-sm text-slate-500">Selecione o colaborador que iniciará a movimentação.</p>
              
              <select 
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan"
                value={colabOrigem?.id || ""}
                onChange={e => handleSelectOrigem(e.target.value)}
              >
                <option value="">Selecione um colaborador...</option>
                {colaboradores.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>

              <div className="pt-4 flex justify-end">
                <button 
                  disabled={!colabOrigem}
                  onClick={() => setStep(2)}
                  className="bg-brand-cyan hover:bg-brand-teal disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2"
                >
                  Próximo <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">2. Para qual posto {colabOrigem?.nome} irá?</h3>
              <p className="text-sm text-slate-500">Selecione o Cliente e depois o novo posto de trabalho.</p>
              
              <select 
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan mb-4"
                value={clienteSelecionado}
                onChange={e => {
                  setClienteSelecionado(e.target.value);
                  setPostoDestino(null);
                }}
              >
                <option value="">1. Selecione um Cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome_razao}</option>
                ))}
              </select>

              <select 
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan disabled:bg-slate-100 disabled:opacity-50"
                value={postoDestino?.id || ""}
                onChange={e => handleSelectPosto(e.target.value)}
                disabled={!clienteSelecionado}
              >
                <option value="">2. Selecione um posto...</option>
                {postos.filter(p => p.cliente_id === clienteSelecionado).map(p => (
                  <option key={p.id} value={p.id}>{p.codigo} {p.descricao_escala ? ` - ${p.descricao_escala}` : ''}</option>
                ))}
              </select>

              <div className="pt-4 flex justify-between">
                <button onClick={() => setStep(movimentacoes.length > 0 ? 3 : 1)} className="text-slate-500 font-medium">Voltar</button>
                <button 
                  disabled={!postoDestino}
                  onClick={confirmarPosto}
                  className="bg-brand-cyan hover:bg-brand-teal disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2"
                >
                  Avançar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && ocupanteAtual && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <Users className="w-6 h-6 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-amber-800">Posto Ocupado!</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    O posto <strong>{postoDestino?.nome}</strong> atualmente está ocupado por <strong>{ocupanteAtual.nome}</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg text-center">O que acontecerá com {ocupanteAtual.nome}?</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => avancarCadeia('Livre', ocupanteAtual)}
                    className="border-2 border-slate-200 hover:border-brand-cyan rounded-xl p-4 text-center group transition-colors"
                  >
                    <UserX className="w-8 h-8 text-slate-400 group-hover:text-brand-cyan mx-auto mb-2" />
                    <span className="font-bold block text-slate-700 group-hover:text-brand-cyan">Ficará Livre</span>
                    <span className="text-xs text-slate-500">Sem alocação no momento</span>
                  </button>

                  <button 
                    onClick={() => avancarCadeia('Outro', ocupanteAtual)}
                    className="border-2 border-slate-200 hover:border-brand-cyan rounded-xl p-4 text-center group transition-colors"
                  >
                    <Briefcase className="w-8 h-8 text-slate-400 group-hover:text-brand-cyan mx-auto mb-2" />
                    <span className="font-bold block text-slate-700 group-hover:text-brand-cyan">Irá para Outro Posto</span>
                    <span className="text-xs text-slate-500">Continuar remanejamento</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-bold text-2xl text-slate-800">Resumo do Remanejamento</h3>
                <p className="text-slate-500 mt-1">Confirme as alterações antes de salvar no sistema.</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-100">
                <div>
                  <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-2">Movimentações:</h4>
                  <ul className="space-y-2">
                    {movimentacoes.map((m, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <ArrowRight className="w-4 h-4 text-brand-cyan" />
                        <span className="font-medium text-slate-800">{m.colabNome}</span>
                        <span className="text-slate-500">vai para</span>
                        <span className="font-medium text-slate-800">{m.postoNome}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {livres.length > 0 && (
                  <div className="pt-3 border-t border-slate-200">
                    <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-2">Ficarão Livres:</h4>
                    <ul className="space-y-2">
                      {livres.map((l, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-amber-600">
                          <UserX className="w-4 h-4" />
                          <span className="font-medium">{l.nome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
                <button onClick={handleFinalizar} className="flex-1 px-4 py-3 rounded-xl bg-brand-cyan hover:bg-brand-teal text-white font-bold shadow-md">Confirmar e Salvar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
