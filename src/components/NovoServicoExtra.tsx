'use client';

import { useState, useEffect } from 'react';
import { Briefcase, X, Loader2, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, Cliente, Substituto } from '@/services/api';
import { useRouter } from 'next/navigation';

export function NovoServicoExtra() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  // Dados do formulário
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tipoCliente, setTipoCliente] = useState<'existente' | 'novo'>('existente');
  const [clienteId, setClienteId] = useState('');
  const [nomeClienteNovo, setNomeClienteNovo] = useState('');
  
  const [tipoServico, setTipoServico] = useState('');
  const [categoriaAlvo, setcategoriaAlvo] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [quantidadeVagas, setQuantidadeVagas] = useState(1);
  const [exigeNr32, setExigeNr32] = useState(false);
  const [exigeNr35, setExigeNr35] = useState(false);

  // Lista de substitutos
  const [substitutosDisponiveis, setSubstitutosDisponiveis] = useState<Substituto[]>([]);
  const [substitutosSelecionados, setSubstitutosSelecionados] = useState<string[]>([]);
  
  // Serviço criado
  const [servicoId, setServicoId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getClientes().then(setClientes);
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setStep(1);
    setTipoCliente('existente');
    setClienteId('');
    setNomeClienteNovo('');
    setTipoServico('');
    setcategoriaAlvo('');
    setDataInicio('');
    setDataFim('');
    setQuantidadeVagas(1);
    setExigeNr32(false);
    setExigeNr35(false);
    setSubstitutosDisponiveis([]);
    setSubstitutosSelecionados([]);
    setServicoId(null);
  };

  const handleCreateServico = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalClienteId = clienteId;

    if (tipoCliente === 'novo') {
      const novoCliente = await api.createClienteSimplificado({ nome_razao: nomeClienteNovo });
      if (novoCliente) {
        finalClienteId = novoCliente.id;
      } else {
        alert("Erro ao cadastrar cliente novo.");
        setLoading(false);
        return;
      }
    }

    const payload = {
      cliente_id: finalClienteId,
      tipo_servico: tipoServico,
      exige_nr32: exigeNr32,
      exige_nr35: exigeNr35,
      quantidade_profissionais: quantidadeVagas,
      data_inicio: dataInicio,
      data_fim: dataFim,
    };

    const servico = await api.createServicoExtra(payload);
    if (servico && servico.id) {
      setServicoId(servico.id);
      
      // Busca disponibilidade filtrando pelos NRs, data informada e Categoria
      const disponiveis = await api.getSubstitutos(undefined, categoriaAlvo, dataInicio, exigeNr32, exigeNr35);
      setSubstitutosDisponiveis(disponiveis);
      setStep(2);
    } else {
      alert("Erro ao criar o pedido de serviço extra.");
    }
    
    setLoading(false);
  };

  const toggleSubstituto = (id: string) => {
    if (substitutosSelecionados.includes(id)) {
      setSubstitutosSelecionados(prev => prev.filter(s => s !== id));
    } else {
      if (substitutosSelecionados.length < quantidadeVagas) {
        setSubstitutosSelecionados(prev => [...prev, id]);
      } else {
        alert(`Você já selecionou o limite de ${quantidadeVagas} profissionais para esta vaga.`);
      }
    }
  };

  const handleFinalize = async () => {
    if (substitutosSelecionados.length !== quantidadeVagas) {
      alert(`Por favor, selecione exatamente ${quantidadeVagas} profissionais.`);
      return;
    }

    if (!servicoId) return;

    setLoading(true);
    const success = await api.alocarServicoExtra(servicoId, substitutosSelecionados);
    setLoading(false);

    if (success) {
      setIsOpen(false);
      router.refresh();
    } else {
      alert("Erro ao confirmar a alocação.");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-brand-teal hover:bg-brand-cyan transition-colors text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-brand-cyan/20 flex items-center gap-2"
      >
        <Briefcase className="w-5 h-5" />
        <span>Novo Serviço Extra</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !loading && setIsOpen(false)} />
          <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-blue" />
                Solicitar Serviço Extra
              </h2>
              <button onClick={() => !loading && setIsOpen(false)} className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {step === 1 && (
              <form onSubmit={handleCreateServico} className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4">
                
                {/* Cliente */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h3 className="font-semibold text-slate-700 mb-3 text-sm">1. Dados do Cliente</h3>
                  <div className="flex gap-4 mb-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" checked={tipoCliente === 'existente'} onChange={() => setTipoCliente('existente')} className="text-brand-blue focus:ring-brand-blue" />
                      Cliente Existente
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" checked={tipoCliente === 'novo'} onChange={() => setTipoCliente('novo')} className="text-brand-blue focus:ring-brand-blue" />
                      Novo Cliente (Avulso)
                    </label>
                  </div>
                  
                  {tipoCliente === 'existente' ? (
                    <select required value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="w-full rounded-xl border border-border-light bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal">
                      <option value="">Selecione um cliente...</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>{c.nome_razao}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" required value={nomeClienteNovo} onChange={(e) => setNomeClienteNovo(e.target.value)} placeholder="Digite a Razão Social ou Nome" className="w-full rounded-xl border border-border-light bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal" />
                  )}
                </div>

                {/* Detalhes do Serviço */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                  <h3 className="font-semibold text-slate-700 mb-1 col-span-2 text-sm">2. Detalhes do Serviço</h3>
                  
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Tipo de Serviço</label>
                    <input type="text" required value={tipoServico} onChange={(e) => setTipoServico(e.target.value)} placeholder="Ex: Limpeza Pós-Obra, Evento" className="w-full rounded-xl border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal" />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Função / Categoria Desejado</label>
                    <input type="text" value={categoriaAlvo} onChange={(e) => setcategoriaAlvo(e.target.value)} placeholder="Ex: Porteiro, Servente (Opcional)" className="w-full rounded-xl border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal" />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Data de Início</label>
                    <input type="date" required value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full rounded-xl border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal" />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Data de Fim</label>
                    <input type="date" required value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full rounded-xl border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal" />
                  </div>

                  <div className="col-span-2 border-t border-slate-200 mt-2 pt-3">
                    <label className="text-xs font-medium text-slate-500 mb-2 block">Quantidade de Profissionais</label>
                    <input type="number" min="1" required value={quantidadeVagas} onChange={(e) => setQuantidadeVagas(Number(e.target.value))} className="w-full md:w-1/3 rounded-xl border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal" />
                  </div>

                  <div className="col-span-2 flex gap-6 mt-1">
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input type="checkbox" checked={exigeNr32} onChange={(e) => setExigeNr32(e.target.checked)} className="rounded text-brand-teal focus:ring-brand-teal w-4 h-4" />
                      Exige NR32
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input type="checkbox" checked={exigeNr35} onChange={(e) => setExigeNr35(e.target.checked)} className="rounded text-brand-teal focus:ring-brand-teal w-4 h-4" />
                      Exige NR35
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={loading} className="bg-brand-teal hover:bg-brand-cyan text-white flex justify-center items-center px-6 py-2.5 text-sm font-medium rounded-xl shadow-md transition-colors disabled:opacity-70 gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar Profissionais'}
                    {!loading && <Search className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Selecione <strong>{quantidadeVagas}</strong> profissional(is) para o serviço.
                  </p>
                  <span className="text-sm bg-white px-2 py-1 rounded shadow-sm font-bold">
                    {substitutosSelecionados.length} / {quantidadeVagas}
                  </span>
                </div>

                <div className="max-h-[50vh] overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
                  {substitutosDisponiveis.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      Nenhum profissional disponível com os requisitos solicitados.
                    </div>
                  ) : (
                    substitutosDisponiveis.map(sub => {
                      const isSelected = substitutosSelecionados.includes(sub.id);
                      return (
                        <div 
                          key={sub.id} 
                          onClick={() => toggleSubstituto(sub.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-brand-teal bg-teal-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{sub.nome}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{sub.categoria_cargo} • {sub.tipo_contratacao || 'Não informado'}</p>
                            </div>
                            <div>
                              {isSelected ? (
                                <CheckCircle2 className="w-5 h-5 text-brand-teal" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                              )}
                            </div>
                          </div>
                          {(sub.tem_nr32 || sub.tem_nr35) && (
                            <div className="flex gap-2 mt-2">
                              {sub.tem_nr32 && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">NR32</span>}
                              {sub.tem_nr35 && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">NR35</span>}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="flex justify-between items-center mt-4 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                    Voltar
                  </button>
                  <button 
                    type="button" 
                    onClick={handleFinalize}
                    disabled={loading || substitutosSelecionados.length !== quantidadeVagas} 
                    className="bg-brand-teal hover:bg-brand-cyan text-white flex justify-center items-center px-6 py-2.5 text-sm font-medium rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Alocação'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
