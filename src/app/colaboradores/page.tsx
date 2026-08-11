'use client';

import { useState, useEffect } from 'react';
import { api, Colaborador } from '@/services/api';
import ModalNovoColaborador from '@/components/colabs/ModalNovoColaborador';

function parseHours(timeString: string | null | undefined): number {
  if (!timeString) return 0;
  if (timeString.toUpperCase().includes('12X36')) return 44;
  const match = timeString.match(/^(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
}

function addDays(dateStr: string, days: number): string {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() + days);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}`;
    }
  }
  return '';
}

function addMonths(dateStr: string, months: number): string {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));
    if (!isNaN(d.getTime())) {
      d.setMonth(d.getMonth() + months);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}`;
    }
  }
  return '';
}

function EditableField({ label, value, type = 'text', options = [], onChange, onBlur, className="", disabled=false, mask }: any) {
  const handleChange = (e: any) => {
    if (type === 'checkbox') return onChange(e.target.checked);
    let val = e.target.value;
    if (mask === 'date') {
      val = val.replace(/\D/g, '').slice(0, 8);
      if (val.length >= 5) {
        val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
      } else if (val.length >= 3) {
        val = `${val.slice(0, 2)}/${val.slice(2)}`;
      }
    }
    onChange(val);
  };

  return (
    <div className={className}>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</label>
      {type === 'select' ? (
        <select 
          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-brand-teal text-sm"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
        >
          <option value="">Selecione...</option>
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : type === 'checkbox' ? (
        <div className="flex items-center gap-2 mt-2 h-10">
          <input 
            type="checkbox" 
            checked={!!value}
            onChange={e => { onChange(e.target.checked); onBlur && onBlur(); }}
            disabled={disabled}
            className="w-4 h-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal disabled:opacity-50"
          />
          <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
      ) : type === 'readonly' ? (
        <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-medium text-sm h-[38px] flex items-center overflow-hidden whitespace-nowrap text-ellipsis">
          {value || '-'}
        </div>
      ) : (
        <input 
          type={type}
          inputMode={mask === 'date' ? 'numeric' : undefined}
          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-brand-teal text-sm"
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={mask === 'date' ? 'DD/MM/AAAA' : `Informe ${label.toLowerCase()}`}
        />
      )}
    </div>
  );
}

export default function ColabsPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaCidade, setBuscaCidade] = useState('');
  const [buscaFuncao, setBuscaFuncao] = useState('');
  
  const [selectedColab, setSelectedColab] = useState<Colaborador | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedOcorrencia, setExpandedOcorrencia] = useState<string | null>(null);
  const [expandedTreinamento, setExpandedTreinamento] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalHistoricoOpen, setIsModalHistoricoOpen] = useState(false);
  const [historicoManual, setHistoricoManual] = useState({ tipo: 'Falta', data: '', sancao: 'Nenhuma', observacao: '' });
  const [userProfile, setUserProfile] = useState('');

  const loadColabs = async () => {
    setLoading(true);
    const data = await api.getColabs();
    setColaboradores(data);
    setLoading(false);
  };

  useEffect(() => {
    setUserProfile(localStorage.getItem('auth_role') || '');
    loadColabs();
  }, []);

  const filteredColabs = colaboradores.filter(col => {
    const matchNome = col.nome.toLowerCase().includes(buscaNome.toLowerCase()) || (col.matricula && col.matricula.toLowerCase().includes(buscaNome.toLowerCase()));
    const matchCidade = buscaCidade ? (col.cidade === buscaCidade || col.localizacao === buscaCidade) : true;
    const matchFuncao = buscaFuncao ? col.papel === buscaFuncao : true;
    
    // Se a busca estiver vazia, esconder inativos. Se tiver busca, mostrar os inativos que derem match
    const isBuscaAtiva = buscaNome.length > 0 || buscaCidade.length > 0 || buscaFuncao.length > 0;
    const isActive = col.status_cadastro !== 'Inativo';
    const matchStatus = isBuscaAtiva ? true : isActive;

    return matchNome && matchCidade && matchFuncao && matchStatus;
  });

  const uniqueCidades = Array.from(new Set(colaboradores.map(c => c.cidade || c.localizacao).filter((c): c is string => !!c))).sort();
  const uniqueFuncoes = Array.from(new Set(colaboradores.map(c => c.papel).filter((c): c is string => !!c))).sort();

  const handleUpdateField = async (field: string, value: any) => {
    if (!selectedColab) return;
    
    let updatedData = { ...selectedColab, [field]: value };

    // Auto calculate Reciclagens
    if (field === 'manual_conduta_data') updatedData.manual_conduta_reciclagem = addDays(value, 365);
    if (field === 'seguranca_medicina_data') updatedData.seguranca_medicina_reciclagem = addDays(value, 365);
    if (field === 'treino_basico_data') updatedData.treino_basico_reciclagem = addDays(value, 365);
    if (field === 'data_nr32') updatedData.reciclagem_nr32 = addDays(value, 365);
    if (field === 'data_nr35') updatedData.reciclagem_nr35 = addDays(value, 365);
    if (field === 'data_aso') updatedData.reciclagem_aso = addDays(value, 365);
    if (field === 'exame_complementar_data') updatedData.exame_complementar_retorno = addMonths(value, 24);

    // Auto calculate Experiência (removido a pedido do usuário, agora apenas exibe o do banco)

    setSelectedColab(updatedData);
    setColaboradores(prev => prev.map(c => c.id === updatedData.id ? updatedData : c));
    
    await api.updateColab(selectedColab.id, updatedData);
  };

  const handleTreinamentoChange = (field: string, value: any) => {
    if (!selectedColab) return;
    let updatedData = { ...selectedColab, [field]: value };
    if (field === 'data_integracao') updatedData.reciclagem_integracao = addDays(value, 365);
    if (field === 'manual_conduta_data') updatedData.manual_conduta_reciclagem = addDays(value, 365);
    if (field === 'seguranca_medicina_data') updatedData.seguranca_medicina_reciclagem = addDays(value, 365);
    if (field === 'treino_basico_data') updatedData.treino_basico_reciclagem = addDays(value, 365);
    if (field === 'data_nr32') updatedData.reciclagem_nr32 = addDays(value, 365);
    if (field === 'data_nr35') updatedData.reciclagem_nr35 = addDays(value, 365);
    if (field === 'data_aso') updatedData.reciclagem_aso = addDays(value, 365);
    if (field === 'exame_complementar_data') updatedData.exame_complementar_retorno = addMonths(value, 24);
    setSelectedColab(updatedData);
  };

  const handleSaveTreinamentos = async () => {
    if (!selectedColab) return;
    const success = await api.updateColab(selectedColab.id, selectedColab);
    if (success) {
      setColaboradores(prev => prev.map(c => c.id === selectedColab.id ? selectedColab : c));
      alert('Treinamentos salvos com sucesso!');
    } else {
      alert('ERRO: Não foi possível salvar os treinamentos. Verifique sua conexão ou tente novamente.');
    }
  };

  const handleSaveHistoricoManual = async () => {
    if (!selectedColab || !historicoManual.data) return alert('Preencha a data.');
    const ok = await api.createOcorrencia({
      colab_id: selectedColab.id,
      tipo: historicoManual.tipo,
      data: historicoManual.data,
      sancao: historicoManual.sancao,
      observacao: historicoManual.observacao,
      resolvido: true,
      origem: 'SISTEMA_MANUAL'
    });
    if (ok) {
      alert('Histórico adicionado!');
      setIsModalHistoricoOpen(false);
      setHistoricoManual({ tipo: 'Falta', data: '', sancao: 'Nenhuma', observacao: '' });
      loadColabs();
      // Auto-update selectedColab from new list will happen if they close and reopen, 
      // but to see instantly, we'd need to re-fetch selectedColab.
    } else {
      alert('Erro ao salvar histórico.');
    }
  };

  const canEditTreinamento = ['ADMIN', 'RH', 'DP', 'SEGURANÇA DO TRABALHO', 'SEG. DO TRABALHO'].includes(userProfile.toUpperCase());
  const canEditCadastral = ['ADMIN', 'RH', 'DP'].includes(userProfile.toUpperCase());
  const canEditContrato = ['ADMIN', 'RH', 'DP'].includes(userProfile.toUpperCase());
  const canEditOcorrencia = ['ADMIN', 'GERENCIA', 'COORDENADOR', 'COORDENADOR ADMINISTRATIVO'].includes(userProfile.toUpperCase());


  const getSanctionsByTipo = (tipos: string | string[]) => {
    if (!selectedColab || !selectedColab.ocorrencias) return [];
    const tiposArray = Array.isArray(tipos) ? tipos : [tipos];
    return selectedColab.ocorrencias.filter((o: any) => tiposArray.includes(o.tipo) || tiposArray.includes(o.tipo_ocorrencia));
  };

  const renderOcorrenciasAccordion = (tipos: string | string[], label: string) => {
      const ocorrencias = getSanctionsByTipo(tipos);
      const isExpanded = expandedOcorrencia === label;
      
      return (
        <div className="border border-slate-200 rounded-lg mb-2 overflow-hidden bg-white">
            <button 
                className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                onClick={() => setExpandedOcorrencia(isExpanded ? null : label)}
            >
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-700">{label}</span>
                    <div className="flex gap-1 ml-2">
                        {ocorrencias.map((o: any, idx: number) => {
                            if (!o.sancao || o.sancao === 'Nenhuma' || o.sancao === 'Registrada') return null; // Não exibe círculo para os que não tem sanção

                            let color = 'bg-slate-200';
                            let initial = '';

                            if (o.sancao?.startsWith('Informe')) { color = 'bg-blue-500 text-white'; initial = 'I'; }
                            else if (o.sancao?.startsWith('Advertência')) { color = 'bg-yellow-500 text-white'; initial = 'A'; }
                            else if (o.sancao?.startsWith('Suspensão 1 Dia')) { color = 'bg-red-500 text-white'; initial = 'S1'; }
                            else if (o.sancao?.startsWith('Suspensão 2 Dias')) { color = 'bg-red-500 text-white'; initial = 'S2'; }
                            else if (o.sancao?.startsWith('Suspensão 3 Dias')) { color = 'bg-red-500 text-white'; initial = 'S3'; }
                            else if (o.sancao?.startsWith('Justa Causa')) { color = 'bg-red-900 text-white'; initial = 'J'; }
                            
                            if (!initial) return null; // Se por algum motivo a sanção não estiver mapeada e não for vazia

                            const dateStr = o.data || o.data_ocorrencia;
                            const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString('pt-BR') : '';

                            return (
                                <span key={idx} className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${color}`} title={`${o.tipo || 'Ocorrência'} (${o.sancao}) - ${formattedDate}`}>
                                    {initial}
                                </span>
                            );
                        })}
                    </div>
                </div>
                <svg className={`w-4 h-4 text-slate-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isExpanded && (
                <div className="p-4 bg-white border-t border-slate-100">
                    {ocorrencias.length > 0 ? (
                        <div className="space-y-3">
                            {ocorrencias.map((o: any) => {
                                const dateStr = o.data || o.data_ocorrencia;
                                const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString('pt-BR') : '';
                                
                                return (
                                    <div key={o.id} className="flex justify-between items-start text-sm border-b border-slate-50 pb-3 mb-2 last:border-0 last:pb-0 last:mb-0">
                                        <div className="pr-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-brand-dark">{o.tipo || 'Ocorrência'}</span>
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">{o.sancao || 'Registrada'}</span>
                                            </div>
                                            <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                                                {o.observacao}
                                            </p>
                                        </div>
                                        <span className="text-xs font-medium text-slate-500 whitespace-nowrap mt-1">{formattedDate}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">Nenhum registro para esta categoria.</p>
                    )}
                </div>
            )}
        </div>
      );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-400">Carregando base de talentos...</div>
      </div>
    );
  }

  // --- TELA DE DETALHE ---
  if (selectedColab) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <button 
          onClick={() => setSelectedColab(null)}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Voltar
        </button>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-dark font-bold text-xl uppercase">
              {selectedColab.nome.substring(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{selectedColab.nome}</h1>
              <p className="text-slate-500 text-sm mt-1">Matrícula: <span className="font-semibold text-slate-700">{selectedColab.matricula || 'N/A'}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${selectedColab.status_cadastro !== 'Inativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {selectedColab.status_cadastro !== 'Inativo' ? 'ATIVO' : 'INATIVO'}
             </span>
             {['ADMIN', 'RH', 'DP', 'GERENTE'].includes(userProfile) && (
              <button 
                onClick={async () => {
                  const novoStatus = selectedColab.status_cadastro === 'Inativo' ? 'Ativo' : 'Inativo';
                  const ok = await api.updateColabStatus(selectedColab.id, novoStatus);
                  if (ok) {
                    setSelectedColab({ ...selectedColab, status_cadastro: novoStatus });
                    setColaboradores(prev => prev.map(c => c.id === selectedColab.id ? { ...c, status_cadastro: novoStatus } : c));
                  }
                }}
                className={`p-1.5 rounded-full border transition-colors ${selectedColab.status_cadastro !== 'Inativo' ? 'bg-green-50 border-green-200 text-green-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600' : 'bg-red-50 border-red-200 text-red-600 hover:bg-green-50 hover:border-green-200 hover:text-green-600'}`}
                title={selectedColab.status_cadastro !== 'Inativo' ? 'Inativar Colaborador' : 'Ativar Colaborador'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {selectedColab.status_cadastro !== 'Inativo' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Accordions */}
        <div className="space-y-4 pb-8">
          
          {/* Accordion 1 - INFORMAÇÃO CADASTRAL */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button 
              onClick={() => setExpandedSection(prev => prev === 'pessoal' ? null : 'pessoal')}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-slate-800">1. Informação Cadastral</h3>
              <svg className={`w-5 h-5 text-slate-500 transform transition-transform ${expandedSection === 'pessoal' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {expandedSection === 'pessoal' && (
              <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <EditableField label="Nome Completo" type={canEditCadastral ? 'text' : 'readonly'} value={selectedColab.nome} onChange={(v: any) => setSelectedColab({...selectedColab, nome: v})} onBlur={() => handleUpdateField('nome', selectedColab.nome)} className="md:col-span-12 lg:col-span-8" />
                  <EditableField label="RG" type={canEditCadastral ? 'text' : 'readonly'} value={selectedColab.rg} onChange={(v: any) => setSelectedColab({...selectedColab, rg: v})} onBlur={() => handleUpdateField('rg', selectedColab.rg)} className="md:col-span-6 lg:col-span-4" />
                  <EditableField label="CPF" type={canEditCadastral ? 'text' : 'readonly'} value={selectedColab.cpf} onChange={(v: any) => setSelectedColab({...selectedColab, cpf: v})} onBlur={() => handleUpdateField('cpf', selectedColab.cpf)} className="md:col-span-6 lg:col-span-4" />
                  <EditableField label="CTPS" type={canEditCadastral ? 'text' : 'readonly'} value={selectedColab.ctps} onChange={(v: any) => setSelectedColab({...selectedColab, ctps: v})} onBlur={() => handleUpdateField('ctps', selectedColab.ctps)} className="md:col-span-6 lg:col-span-4" />
                  
                  <div className="md:col-span-12 lg:col-span-8 flex flex-col md:flex-row gap-4">
                    <div className="flex flex-1 gap-2">
                      <EditableField label="Telefone Celular" type={canEditCadastral ? 'text' : 'readonly'} value={selectedColab.telefone_principal} onChange={(v: any) => setSelectedColab({...selectedColab, telefone_principal: v})} onBlur={() => handleUpdateField('telefone_principal', selectedColab.telefone_principal)} className="flex-1" />
                      <EditableField label="WhatsApp?" type="checkbox" disabled={!canEditCadastral} value={selectedColab.is_whatsapp} onChange={(v: any) => handleUpdateField('is_whatsapp', v)} />
                    </div>
                    <EditableField label="Telefone Secundário (Recado)" type={canEditCadastral ? 'text' : 'readonly'} value={selectedColab.telefone_secundario} onChange={(v: any) => setSelectedColab({...selectedColab, telefone_secundario: v})} onBlur={() => handleUpdateField('telefone_secundario', selectedColab.telefone_secundario)} className="flex-1" />
                  </div>

                  <EditableField label="Logradouro" type={canEditCadastral ? 'text' : 'readonly'} value={selectedColab.logradouro} onChange={(v: any) => setSelectedColab({...selectedColab, logradouro: v})} onBlur={() => handleUpdateField('logradouro', selectedColab.logradouro)} className="md:col-span-8 lg:col-span-6" />
                  <EditableField label="Número" type={canEditCadastral ? 'text' : 'readonly'} value={selectedColab.numero} onChange={(v: any) => setSelectedColab({...selectedColab, numero: v})} onBlur={() => handleUpdateField('numero', selectedColab.numero)} className="md:col-span-4 lg:col-span-2" />
                  <EditableField label="Bairro" type={canEditCadastral ? 'text' : 'readonly'} value={selectedColab.bairro} onChange={(v: any) => setSelectedColab({...selectedColab, bairro: v})} onBlur={() => handleUpdateField('bairro', selectedColab.bairro)} className="md:col-span-6 lg:col-span-4" />
                  
                  <EditableField label="Cidade" type={canEditCadastral ? 'text' : 'readonly'} value={selectedColab.cidade} onChange={(v: any) => setSelectedColab({...selectedColab, cidade: v})} onBlur={() => handleUpdateField('cidade', selectedColab.cidade)} className="md:col-span-6 lg:col-span-5" />
                  
                  <div className="md:col-span-6 lg:col-span-7 flex gap-4">
                    <EditableField label="UF" type={canEditCadastral ? 'text' : 'readonly'} value={selectedColab.uf} onChange={(v: any) => setSelectedColab({...selectedColab, uf: v})} onBlur={() => handleUpdateField('uf', selectedColab.uf)} className="w-20" />
                    <EditableField label="CEP" type={canEditCadastral ? 'text' : 'readonly'} value={selectedColab.cep} onChange={(v: any) => setSelectedColab({...selectedColab, cep: v})} onBlur={() => handleUpdateField('cep', selectedColab.cep)} className="w-32" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 2 - REGIME DE CONTRATAÇÃO */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button 
              onClick={() => setExpandedSection(prev => prev === 'contrato' ? null : 'contrato')}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-slate-800">2. Regime de Contratação</h3>
              <svg className={`w-5 h-5 text-slate-500 transform transition-transform ${expandedSection === 'contrato' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {expandedSection === 'contrato' && (
              <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <EditableField label="Regime de Contratação" type="readonly" value={selectedColab.tipo_contratacao || ''} />
                  
                  {selectedColab.tipo_contratacao === 'HORISTA' && (
                     <EditableField label="Horas Contratadas" type="number" value={selectedColab.horas_contratadas} onChange={(v: any) => setSelectedColab({...selectedColab, horas_contratadas: v})} onBlur={() => handleUpdateField('horas_contratadas', selectedColab.horas_contratadas)} />
                  )}

                  <EditableField label="Nível de Atuação" type={canEditContrato ? 'select' : 'readonly'} options={['Operacional', 'Gestão', 'Administrativo', 'Diretoria']} value={selectedColab.nivel_atuacao || selectedColab.categoria_cargo || ''} onChange={(v: any) => setSelectedColab({...selectedColab, nivel_atuacao: v})} onBlur={() => handleUpdateField('nivel_atuacao', selectedColab.nivel_atuacao)} />
                  <EditableField label="Cargo (Função)" type={canEditContrato ? 'text' : 'readonly'} value={selectedColab.papel} onChange={(v: any) => setSelectedColab({...selectedColab, papel: v})} onBlur={() => handleUpdateField('papel', selectedColab.papel)} />
                  <EditableField label="Categoria do Cargo" type={canEditContrato ? 'text' : 'readonly'} value={selectedColab.categoria_cargo} onChange={(v: any) => setSelectedColab({...selectedColab, categoria_cargo: v})} onBlur={() => handleUpdateField('categoria_cargo', selectedColab.categoria_cargo)} />
                  <EditableField label="Data de Admissão (DD/MM/AAAA)" mask="date" type={canEditContrato ? 'text' : 'readonly'} value={selectedColab.admissao} onChange={(v: any) => setSelectedColab({...selectedColab, admissao: v})} onBlur={() => handleUpdateField('admissao', selectedColab.admissao)} />
                  
                  <EditableField label="1ª Experiência" mask="date" type={canEditContrato ? 'text' : 'readonly'} value={selectedColab.experiencia_1} onChange={(v: any) => setSelectedColab({...selectedColab, experiencia_1: v})} onBlur={() => handleUpdateField('experiencia_1', selectedColab.experiencia_1)} />
                  <EditableField label="2ª Experiência" mask="date" type={canEditContrato ? 'text' : 'readonly'} value={selectedColab.experiencia_2} onChange={(v: any) => setSelectedColab({...selectedColab, experiencia_2: v})} onBlur={() => handleUpdateField('experiencia_2', selectedColab.experiencia_2)} />
                </div>
              </div>
            )}
          </div>

          {/* Accordion 3 - EDUCAÇÃO E TREINAMENTO */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button 
              onClick={() => setExpandedSection(prev => prev === 'treinamento' ? null : 'treinamento')}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-slate-800">3. Educação e Treinamento</h3>
              <svg className={`w-5 h-5 text-slate-500 transform transition-transform ${expandedSection === 'treinamento' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {expandedSection === 'treinamento' && (
              <div className="p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                
                {/* INTEGRAÇÃO */}
                <div className="border border-slate-200 rounded-xl mb-3 overflow-hidden bg-white">
                  <button 
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                    onClick={() => setExpandedTreinamento(expandedTreinamento === 'integracao' ? null : 'integracao')}
                  >
                    <h4 className="text-sm font-bold text-brand-dark">Integração</h4>
                    <svg className={`w-4 h-4 text-slate-500 transform transition-transform ${expandedTreinamento === 'integracao' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {expandedTreinamento === 'integracao' && (
                    <div className="p-4 bg-white border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <EditableField label="Data da Integração (DD/MM/AAAA)" mask="date" type={canEditTreinamento ? 'text' : 'readonly'} value={selectedColab.data_integracao} onChange={(v: any) => handleTreinamentoChange('data_integracao', v)} />
                            <div className="mt-2"><EditableField label="Reciclagem (+365)" type="readonly" value={selectedColab.reciclagem_integracao} /></div>
                         </div>
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <EditableField label="Manual de Conduta (DD/MM/AAAA)" mask="date" type={canEditTreinamento ? 'text' : 'readonly'} value={selectedColab.manual_conduta_data} onChange={(v: any) => handleTreinamentoChange('manual_conduta_data', v)} />
                            <div className="mt-2"><EditableField label="Reciclagem (+365)" type="readonly" value={selectedColab.manual_conduta_reciclagem} /></div>
                         </div>
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <EditableField label="Segurança e Medicina (DD/MM/AAAA)" mask="date" type={canEditTreinamento ? 'text' : 'readonly'} value={selectedColab.seguranca_medicina_data} onChange={(v: any) => handleTreinamentoChange('seguranca_medicina_data', v)} />
                            <div className="mt-2"><EditableField label="Reciclagem (+365)" type="readonly" value={selectedColab.seguranca_medicina_reciclagem} /></div>
                         </div>
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <EditableField label="Treino Básico Op. (DD/MM/AAAA)" mask="date" type={canEditTreinamento ? 'text' : 'readonly'} value={selectedColab.treino_basico_data} onChange={(v: any) => handleTreinamentoChange('treino_basico_data', v)} />
                            <div className="mt-2"><EditableField label="Reciclagem (+365)" type="readonly" value={selectedColab.treino_basico_reciclagem} /></div>
                         </div>
                      </div>
                      {canEditTreinamento && (
                        <div className="mt-4 flex justify-end">
                          <button onClick={handleSaveTreinamentos} className="bg-brand-teal hover:bg-brand-teal/90 text-white px-4 py-2 rounded-lg font-bold transition-colors">Salvar Alterações</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* NORMAS REGULAMENTADORAS */}
                <div className="border border-slate-200 rounded-xl mb-3 overflow-hidden bg-white">
                  <button 
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                    onClick={() => setExpandedTreinamento(expandedTreinamento === 'nr' ? null : 'nr')}
                  >
                    <h4 className="text-sm font-bold text-brand-dark">Normas Regulamentadoras (NRs)</h4>
                    <svg className={`w-4 h-4 text-slate-500 transform transition-transform ${expandedTreinamento === 'nr' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {expandedTreinamento === 'nr' && (
                    <div className="p-4 bg-white border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-start">
                            <div className="mb-3">
                               <EditableField label="Requer NR32" type="checkbox" disabled={!canEditTreinamento} value={selectedColab.requer_nr32} onChange={(v: any) => handleTreinamentoChange('requer_nr32', v)} />
                            </div>
                            <EditableField label="Realização NR32 (DD/MM/AAAA)" mask="date" type={canEditTreinamento ? 'text' : 'readonly'} value={selectedColab.data_nr32} onChange={(v: any) => handleTreinamentoChange('data_nr32', v)} />
                            <div className="mt-2"><EditableField label="Reciclagem (+365)" type="readonly" value={selectedColab.reciclagem_nr32} /></div>
                         </div>
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-start">
                            <div className="mb-3">
                               <EditableField label="Requer NR35" type="checkbox" disabled={!canEditTreinamento} value={selectedColab.requer_nr35} onChange={(v: any) => handleTreinamentoChange('requer_nr35', v)} />
                            </div>
                            <EditableField label="Realização NR35 (DD/MM/AAAA)" mask="date" type={canEditTreinamento ? 'text' : 'readonly'} value={selectedColab.data_nr35} onChange={(v: any) => handleTreinamentoChange('data_nr35', v)} />
                            <div className="mt-2"><EditableField label="Reciclagem (+365)" type="readonly" value={selectedColab.reciclagem_nr35} /></div>
                         </div>
                      </div>
                      {canEditTreinamento && (
                        <div className="mt-4 flex justify-end">
                          <button onClick={handleSaveTreinamentos} className="bg-brand-teal hover:bg-brand-teal/90 text-white px-4 py-2 rounded-lg font-bold transition-colors">Salvar Alterações</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* EXAMES DE SAUDE OCUPACIONAL (ASO) */}
                <div className="border border-slate-200 rounded-xl mb-3 overflow-hidden bg-white">
                  <button 
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                    onClick={() => setExpandedTreinamento(expandedTreinamento === 'aso' ? null : 'aso')}
                  >
                    <h4 className="text-sm font-bold text-brand-dark">Exames de Saúde Ocupacional (ASO)</h4>
                    <svg className={`w-4 h-4 text-slate-500 transform transition-transform ${expandedTreinamento === 'aso' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {expandedTreinamento === 'aso' && (
                    <div className="p-4 bg-white border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <EditableField label="Exame Admissional (DD/MM/AAAA)" mask="date" type={canEditTreinamento ? 'text' : 'readonly'} value={selectedColab.data_aso} onChange={(v: any) => handleTreinamentoChange('data_aso', v)} />
                            <div className="mt-2"><EditableField label="Retorno (+365 Dias)" type="readonly" value={selectedColab.reciclagem_aso} /></div>
                         </div>
                         {(selectedColab.requer_nr32 || selectedColab.requer_nr35) && (
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                               <EditableField label="Exames Complementares (DD/MM/AAAA)" mask="date" type={canEditTreinamento ? 'text' : 'readonly'} value={selectedColab.exame_complementar_data} onChange={(v: any) => handleTreinamentoChange('exame_complementar_data', v)} />
                               <div className="mt-2"><EditableField label="Retorno (+2 Anos)" type="readonly" value={selectedColab.exame_complementar_retorno} /></div>
                            </div>
                         )}
                      </div>
                      {canEditTreinamento && (
                        <div className="mt-4 flex justify-end">
                          <button onClick={handleSaveTreinamentos} className="bg-brand-teal hover:bg-brand-teal/90 text-white px-4 py-2 rounded-lg font-bold transition-colors">Salvar Alterações</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Accordion 4 - ACOMPANHAMENTO CORRETIVO */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button 
              onClick={() => setExpandedSection(prev => prev === 'corretivo' ? null : 'corretivo')}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-slate-800">4. Acompanhamento Corretivo</h3>
              <svg className={`w-5 h-5 text-slate-500 transform transition-transform ${expandedSection === 'corretivo' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {expandedSection === 'corretivo' && (
              <div className="p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                 {canEditOcorrencia && (
                   <div className="flex justify-end mb-4">
                     <button onClick={() => setIsModalHistoricoOpen(true)} className="bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-brand-teal/90">+ Adicionar Histórico Manual</button>
                   </div>
                 )}
                 {renderOcorrenciasAccordion(['Atraso', 'Sair mais cedo', 'Saída Antecipada'], 'Não cumprimento de Horário')}
                 {renderOcorrenciasAccordion('Falta', 'Falta não Justificada')}
                 {renderOcorrenciasAccordion('Desacato ou Desrespeito', 'Desacato ou Desrespeito')}
                 {renderOcorrenciasAccordion('Descumprimento do manual de Conduta', 'Descumprimento do manual de Conduta')}
              </div>
            )}
          </div>

          {/* Modal Historico Manual */}
          {isModalHistoricoOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Adicionar Histórico Corretivo (Manual)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tipo de Ocorrência</label>
                    <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-brand-teal text-sm" value={historicoManual.tipo} onChange={e => setHistoricoManual({...historicoManual, tipo: e.target.value})}>
                      <option>Falta</option>
                      <option>Atraso</option>
                      <option>Saída Antecipada</option>
                      <option>Sair mais cedo</option>
                      <option>Desacato ou Desrespeito</option>
                      <option>Descumprimento do manual de Conduta</option>
                    </select>
                  </div>
                  <EditableField label="Data (DD/MM/AAAA) ou (AAAA-MM-DD)" value={historicoManual.data} onChange={(v: string) => setHistoricoManual({...historicoManual, data: v})} />
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sanção Aplicada</label>
                    <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-brand-teal text-sm" value={historicoManual.sancao} onChange={e => setHistoricoManual({...historicoManual, sancao: e.target.value})}>
                      <option>Nenhuma</option>
                      <option>Advertência Escrita</option>
                      <option>Suspensão 1 Dia</option>
                      <option>Suspensão 2 Dias</option>
                      <option>Suspensão 3 Dias</option>
                      <option>Justa Causa</option>
                    </select>
                  </div>
                  <EditableField label="Observações (Opcional)" value={historicoManual.observacao} onChange={(v: string) => setHistoricoManual({...historicoManual, observacao: v})} />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setIsModalHistoricoOpen(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                  <button onClick={handleSaveHistoricoManual} className="bg-brand-teal text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-teal/90 transition-colors">Salvar Histórico</button>
                </div>
              </div>
            </div>
          )}

          {/* Accordion 5 - POSTO DE TRABALHO & DISPONIBILIDADE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button 
              onClick={() => setExpandedSection(prev => prev === 'alocacao' ? null : 'alocacao')}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-slate-800">5. Posto de Trabalho & Disponibilidade</h3>
              <div className="flex items-center gap-3">
                {selectedColab.alocacoes && selectedColab.alocacoes.length > 0 && (
                  <span className="bg-brand-cyan/10 text-brand-teal text-xs font-bold px-2 py-1 rounded-md">
                    Alocado
                  </span>
                )}
                <svg className={`w-5 h-5 text-slate-500 transform transition-transform ${expandedSection === 'alocacao' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </button>
            {expandedSection === 'alocacao' && (
              <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Status de Disponibilidade & Saldo de Horas</h4>
                
                {(() => {
                  const horasContratadas = selectedColab.tipo_contratacao === 'MENSALISTA' ? 44 : parseHours(selectedColab.horas_contratadas);
                  const horasAlocadas = (selectedColab.alocacoes || []).reduce((acc: number, alocacao: any) => acc + parseHours(alocacao.posto?.horas_diarias), 0);
                  const saldo = horasAlocadas - horasContratadas; 
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Horas Alocadas (Total)</label>
                        <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-800 font-medium">{horasAlocadas} hs</div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Saldo Disponível (Alocadas - Contratadas)</label>
                        <div className={`px-3 py-2 rounded-lg font-bold border ${saldo > 0 ? 'bg-green-50 text-green-700 border-green-100' : saldo < 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                          {saldo > 0 ? `+${saldo} hs (Hora Extra/Dobra)` : saldo < 0 ? `${saldo} hs Livres` : 'Alocação Completa (0 hs)'}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <EditableField label="Situação / Afastamento" type={canEditOcorrencia ? 'select' : 'readonly'} options={['Livre', 'Alocado', 'Férias', 'Atestado', 'INSS', 'Licença Maternidade', 'Licença Paternidade']} value={selectedColab.situacao_disponibilidade || 'Livre'} onChange={(v: any) => setSelectedColab({...selectedColab, situacao_disponibilidade: v})} onBlur={() => handleUpdateField('situacao_disponibilidade', selectedColab.situacao_disponibilidade)} />
                  
                  <EditableField label="Data de Retorno (DD/MM/AAAA)" mask="date" type={canEditOcorrencia ? 'text' : 'readonly'} value={selectedColab.data_retorno} onChange={(v: any) => setSelectedColab({...selectedColab, data_retorno: v})} onBlur={() => handleUpdateField('data_retorno', selectedColab.data_retorno)} />
                  
                  <EditableField label="Justificativa / Motivo" type={canEditOcorrencia ? 'text' : 'readonly'} value={selectedColab.justificativa_inativo || selectedColab.observacao_retorno} onChange={(v: any) => setSelectedColab({...selectedColab, justificativa_inativo: v})} onBlur={() => handleUpdateField('justificativa_inativo', selectedColab.justificativa_inativo)} />
                </div>

                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mt-4">Alocação Atual (Posto de Trabalho)</h4>
                {selectedColab.alocacoes && selectedColab.alocacoes.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {selectedColab.alocacoes.map((alocacao: any) => (
                      <div key={alocacao.id} className="border border-slate-200 rounded-xl p-5 bg-white">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-brand-dark text-lg">{alocacao.posto?.cliente?.nome_razao || 'Cliente Desconhecido'}</h4>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                              {alocacao.posto?.cliente?.endereco || 'Sem endereço'} - {alocacao.posto?.cliente?.cidade || ''}
                            </p>
                          </div>
                          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-slate-200">
                            {alocacao.posto?.codigo}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Turno</span>
                            <span className="font-medium text-slate-800">{alocacao.posto?.turno || '-'}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Categoria</span>
                            <span className="font-medium text-slate-800">{alocacao.posto?.categoria_posto || '-'}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tipo de Escala</span>
                            <span className="font-medium text-slate-800">{alocacao.posto?.tipo_escala || '-'}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Carga Horária</span>
                            <span className="font-medium text-slate-800">{alocacao.posto?.horas_diarias || '-'}</span>
                          </div>
                          <div className="md:col-span-2 lg:col-span-4 mt-2 pt-3 border-t border-slate-200">
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Detalhes da Escala</span>
                            <span className="text-sm font-medium text-slate-700">{alocacao.posto?.descricao_escala || '-'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <p className="text-slate-600 font-medium">Colaborador não está alocado em nenhum posto ativo.</p>
                    <p className="text-slate-400 text-sm mt-1">Verifique o status de disponibilidade ou aloque-o em um posto vago.</p>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- TELA DE LISTAGEM ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Colaboradores</h1>
          <p className="text-slate-500 text-sm mt-1">Busque, visualize e gerencie seus associados e talentos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-brand-teal/10 text-brand-teal px-4 py-2 rounded-xl font-bold flex gap-2">
            Total: <span>{colaboradores.length}</span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-teal hover:bg-brand-teal/90 text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Adicionar Colaborador
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/20 transition-all">
            <svg className="w-5 h-5 text-slate-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Buscar colaborador por nome ou matrícula..." 
              className="bg-transparent border-none outline-none w-full text-slate-700 font-medium placeholder-slate-400"
              value={buscaNome}
              onChange={(e) => setBuscaNome(e.target.value)}
            />
          </div>
          
          <select 
            className="md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium outline-none focus:border-brand-teal"
            value={buscaCidade}
            onChange={(e) => setBuscaCidade(e.target.value)}
          >
            <option value="">Todas Cidades</option>
            {uniqueCidades.map(cidade => (
              <option key={cidade} value={cidade}>{cidade}</option>
            ))}
          </select>

          <select 
            className="md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium outline-none focus:border-brand-teal"
            value={buscaFuncao}
            onChange={(e) => setBuscaFuncao(e.target.value)}
          >
            <option value="">Todas Funções</option>
            {uniqueFuncoes.map(funcao => (
              <option key={funcao} value={funcao}>{funcao}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {filteredColabs.map(col => (
            <div 
              key={col.id} 
              className="group flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-brand-cyan hover:shadow-md hover:bg-brand-cyan/5 transition-all cursor-pointer"
              onClick={() => setSelectedColab(col)}
            >
              <div className="flex items-center gap-4 mb-3 md:mb-0">
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-brand-cyan/20 flex items-center justify-center text-slate-600 group-hover:text-brand-dark font-bold uppercase transition-colors">
                  {col.nome.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-brand-dark">{col.nome}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span>Matrícula: {col.matricula || 'S/N'}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> {col.cidade || col.localizacao || 'Sem cidade'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="flex gap-2">
                  {col.status_cadastro === 'Inativo' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                      Inativo
                    </span>
                  )}
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {col.papel}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${!col.situacao_disponibilidade || col.situacao_disponibilidade === 'Livre' ? 'bg-green-50 text-green-700 border-green-200' : col.situacao_disponibilidade === 'Alocado' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                    {col.situacao_disponibilidade || 'Livre'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-brand-cyan/10 text-brand-teal border border-brand-cyan/20">
                    {col.tipo_contratacao || 'Alocação Padrão'}
                  </span>
                </div>
                
                <button className="text-sm font-semibold text-brand-dark bg-white border border-slate-200 hover:border-brand-dark px-4 py-1.5 rounded-lg transition-colors">
                  Detalhes
                </button>
              </div>
            </div>
          ))}

          {filteredColabs.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
              Nenhum colaborador encontrado para essa busca.
            </div>
          )}
        </div>
      </div>

      <ModalNovoColaborador 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadColabs} 
      />
    </div>
  );
}
