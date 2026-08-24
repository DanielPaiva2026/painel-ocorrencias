'use client';

import { useState, useEffect } from 'react';
import { api, Cliente } from '@/services/api';
import ModalUploadContrato from '@/components/ModalUploadContrato';
import { parsePostoTurnoCategoria, parseTipoEscala } from '@/lib/postoUtils';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscaNome, setBuscaNome] = useState('');
  
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [expandedSection, setExpandedSection] = useState<'basico' | 'contato' | 'operacional' | 'postos' | null>('basico');
  const [editingPostoId, setEditingPostoId] = useState<string | null>(null);
  const [editPostoData, setEditPostoData] = useState<any>({});
  const [userProfile, setUserProfile] = useState('');
  const [editClienteData, setEditClienteData] = useState<Partial<Cliente>>({});
  const [isSavingCliente, setIsSavingCliente] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    setUserProfile(localStorage.getItem('auth_role') || '');
    async function load() {
      const data = await api.getClientes();
      setClientes(data);
      setLoading(false);
    }
    load();
  }, []);

  // Filtra clientes ativos e busca por nome ou código
  const filteredClientes = clientes.filter(cli => {
    if (cli.status !== 'Ativo') return false; // Apenas Ativos na listagem, como pedido
    
    return cli.nome_razao.toLowerCase().includes(buscaNome.toLowerCase()) ||
           (cli.codigo && cli.codigo.toLowerCase().includes(buscaNome.toLowerCase()));
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-400">Carregando base de clientes...</div>
      </div>
    );
  }

  const handleEditChange = (field: keyof Cliente, value: any) => {
    setEditClienteData(prev => ({ ...prev, [field]: value }));
  };

  const maskCNPJ = (value: string) => {
    return value.replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  const maskCEP = (value: string) => {
    return value.replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  };

  const maskPhone = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    if (numeric.length <= 10) {
      return numeric.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numeric.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15);
  };

  const saveCliente = async () => {
    if (!selectedCliente) return;
    setIsSavingCliente(true);
    const success = await api.updateCliente(selectedCliente.id, editClienteData);
    if (success) {
      const data = await api.getClientes();
      setClientes(data);
      setSelectedCliente({ ...selectedCliente, ...editClienteData } as Cliente);
    } else {
      alert('Erro ao salvar cliente');
    }
    setIsSavingCliente(false);
  };

  // --- TELA DE DETALHE ---
  if (selectedCliente) {
    // Inicializar state de edição quando abrir o cliente
    if (!editClienteData.id || editClienteData.id !== selectedCliente.id) {
      setEditClienteData({
        ...selectedCliente
      });
    }

    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <button 
          onClick={() => {
            setSelectedCliente(null);
            setEditClienteData({});
          }}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Voltar
        </button>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-dark font-bold text-xl uppercase">
              {selectedCliente.nome_razao.substring(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{selectedCliente.nome_razao}</h1>
              <p className="text-slate-500 text-sm mt-1">Código: <span className="font-semibold text-slate-700">{selectedCliente.codigo || 'N/A'}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${selectedCliente.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {selectedCliente.status || 'Desconhecido'}
             </span>
             {['ADMIN', 'GERENCIA'].includes(userProfile) && (
               <button 
                 onClick={async () => {
                   const newStatus = selectedCliente.status === 'Ativo' ? 'Inativo' : 'Ativo';
                   await api.updateCliente(selectedCliente.id, { status: newStatus });
                   const data = await api.getClientes();
                   setClientes(data);
                   setSelectedCliente({ ...selectedCliente, status: newStatus });
                 }}
                 className="text-xs font-bold text-brand-dark bg-white border border-slate-200 hover:border-brand-dark px-3 py-1.5 rounded-lg transition-colors"
               >
                 Mudar
               </button>
             )}
          </div>
        </div>

        {/* Accordions */}
        <div className="space-y-4 pb-8">
          
          {/* Accordion 1 - Dados Cadastrais */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button 
              onClick={() => setExpandedSection(prev => prev === 'basico' ? null : 'basico')}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-slate-800">1. Dados Cadastrais</h3>
              <svg className={`w-5 h-5 text-slate-500 transform transition-transform ${expandedSection === 'basico' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {expandedSection === 'basico' && (
              <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Razão Social</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-brand-teal outline-none" 
                      value={editClienteData.razao_social || ''} 
                      onChange={e => handleEditChange('razao_social', e.target.value)} 
                    />
                  </div>
                  
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">CNPJ</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-brand-teal outline-none" 
                      value={editClienteData.cnpj || ''} 
                      onChange={e => handleEditChange('cnpj', maskCNPJ(e.target.value))} 
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Nome do Responsável pelo Contrato</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-brand-teal outline-none" 
                      value={editClienteData.responsavel || ''} 
                      onChange={e => handleEditChange('responsavel', e.target.value)} 
                    />
                  </div>
                  
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Telefone do Responsável</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-brand-teal outline-none" 
                      value={editClienteData.telefone || ''} 
                      onChange={e => handleEditChange('telefone', maskPhone(e.target.value))} 
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Logradouro</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-brand-teal outline-none" 
                      value={editClienteData.endereco || ''} 
                      onChange={e => handleEditChange('endereco', e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Número</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-brand-teal outline-none" 
                      value={editClienteData.numero || ''} 
                      onChange={e => handleEditChange('numero', e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Complemento</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-brand-teal outline-none" 
                      value={editClienteData.complemento || ''} 
                      onChange={e => handleEditChange('complemento', e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Bairro</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-brand-teal outline-none" 
                      value={editClienteData.bairro || ''} 
                      onChange={e => handleEditChange('bairro', e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Cidade</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-brand-teal outline-none" 
                      value={editClienteData.cidade || ''} 
                      onChange={e => handleEditChange('cidade', e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">UF</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-brand-teal outline-none" 
                      value={editClienteData.uf || ''} 
                      onChange={e => handleEditChange('uf', e.target.value)} 
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">CEP</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-brand-teal outline-none" 
                      value={editClienteData.cep || ''} 
                      onChange={e => handleEditChange('cep', maskCEP(e.target.value))} 
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button 
                    onClick={saveCliente}
                    disabled={isSavingCliente}
                    className="bg-brand-teal hover:bg-brand-teal/90 text-white px-6 py-2 rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {isSavingCliente ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 2 - Informações Operacionais de Gestão */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button 
              onClick={() => setExpandedSection(prev => prev === 'operacional' ? null : 'operacional')}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-slate-800">2. Informações Operacionais de Gestão</h3>
              <svg className={`w-5 h-5 text-slate-500 transform transition-transform ${expandedSection === 'operacional' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {expandedSection === 'operacional' && (
              <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Gestor Operacional</label>
                    <select 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-brand-teal outline-none"
                      value={editClienteData.supervisor || ''}
                      onChange={e => handleEditChange('supervisor', e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      <option value="Supervisor Área 1">Supervisor Área 1</option>
                      <option value="Supervisor Área 2">Supervisor Área 2</option>
                      <option value="Coordenador Administrativo">Coordenador Administrativo</option>
                      <option value="Gerencia">Gerencia</option>
                      <option value="Diretoria">Diretoria</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Periodicidade de Visita</label>
                    <select 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-brand-teal outline-none"
                      value={editClienteData.periodicidade_visita || ''}
                      onChange={e => handleEditChange('periodicidade_visita', e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      <option value="Semanal">Semanal</option>
                      <option value="Quinzenal">Quinzenal</option>
                      <option value="Mensal">Mensal</option>
                      <option value="Bimestral">Bimestral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Ranking Prioridades</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-brand-teal outline-none" 
                      value={editClienteData.ranking_financeiro || ''} 
                      onChange={e => handleEditChange('ranking_financeiro', e.target.value)} 
                    />
                  </div>

                  <div className="lg:col-span-3">
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Escopo de trabalho</label>
                    <textarea 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-brand-teal outline-none min-h-[120px]" 
                      value={editClienteData.observacao || ''} 
                      onChange={e => handleEditChange('observacao', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button 
                    onClick={saveCliente}
                    disabled={isSavingCliente}
                    className="bg-brand-teal hover:bg-brand-teal/90 text-white px-6 py-2 rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {isSavingCliente ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 3 - Postos de Trabalho & Alocações */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button 
              onClick={() => setExpandedSection(prev => prev === 'postos' ? null : 'postos')}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-slate-800">3. Postos de Trabalho & Alocações</h3>
              <div className="flex items-center gap-3">
                <span className="bg-brand-teal/10 text-brand-teal text-xs font-bold px-2 py-1 rounded-md">
                  {selectedCliente.postos_de_trabalho?.length || 0} Postos
                </span>
                <svg className={`w-5 h-5 text-slate-500 transform transition-transform ${expandedSection === 'postos' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </button>
            {expandedSection === 'postos' && (
              <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                {selectedCliente.postos_de_trabalho && selectedCliente.postos_de_trabalho.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCliente.postos_de_trabalho.map(posto => (
                      <div key={posto.id} className="border border-slate-200 rounded-xl p-4 bg-white hover:border-brand-cyan transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800 text-md">{posto.codigo}</h4>
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              {posto.turno || parsePostoTurnoCategoria(posto.codigo).turno}
                            </span>
                            {['ADMIN', 'GERENCIA', 'RH', 'TEC_SEGURANCA'].includes(userProfile) && (
                              <button 
                                onClick={() => {
                                  setEditingPostoId(posto.id);
                                  setEditPostoData({
                                    exige_nr32: posto.exige_nr32,
                                    exige_nr35: posto.exige_nr35,
                                    horas_diarias: posto.horas_diarias,
                                    categoria_posto: posto.categoria_posto || parsePostoTurnoCategoria(posto.codigo).funcao,
                                    data_base_escala_12x36: posto.data_base_escala_12x36 || ''
                                  });
                                }}
                                className="text-brand-cyan hover:text-brand-teal text-xs font-semibold px-2 py-0.5 border border-brand-cyan/20 rounded"
                              >
                                Editar
                              </button>
                            )}
                          </div>
                        </div>

                        {editingPostoId === posto.id ? (
                          <div className="space-y-3 mb-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Função</label>
                              <input 
                                type="text" 
                                className="w-full text-xs p-1 border rounded" 
                                value={editPostoData.categoria_posto || ''} 
                                onChange={e => setEditPostoData({...editPostoData, categoria_posto: e.target.value})} 
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Data Base Escala 12x36</label>
                              <input 
                                type="date" 
                                className="w-full text-xs p-1 border rounded" 
                                value={editPostoData.data_base_escala_12x36 ? editPostoData.data_base_escala_12x36.split('/').reverse().join('-') : ''} 
                                onChange={e => {
                                  const val = e.target.value;
                                  const formatted = val ? val.split('-').reverse().join('/') : '';
                                  setEditPostoData({...editPostoData, data_base_escala_12x36: formatted});
                                }} 
                              />
                            </div>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-1 text-xs text-slate-700">
                                <input 
                                  type="checkbox" 
                                  checked={editPostoData.exige_nr32 || false} 
                                  onChange={e => setEditPostoData({...editPostoData, exige_nr32: e.target.checked})} 
                                /> Exige NR32
                              </label>
                              <label className="flex items-center gap-1 text-xs text-slate-700">
                                <input 
                                  type="checkbox" 
                                  checked={editPostoData.exige_nr35 || false} 
                                  onChange={e => setEditPostoData({...editPostoData, exige_nr35: e.target.checked})} 
                                /> Exige NR35
                              </label>
                            </div>
                            <div className="flex gap-2 justify-end mt-2">
                              <button onClick={() => setEditingPostoId(null)} className="text-[10px] px-2 py-1 bg-slate-200 rounded">Cancelar</button>
                              <button 
                                onClick={async () => {
                                  await api.updatePostoDeTrabalho(posto.id, editPostoData);
                                  setEditingPostoId(null);
                                  // Refresh manual simples
                                  const data = await api.getClientes();
                                  setClientes(data);
                                  setSelectedCliente(data.find((c: any) => c.id === selectedCliente.id) || null);
                                }} 
                                className="text-[10px] px-2 py-1 bg-brand-teal text-white rounded"
                              >
                                Salvar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1 mb-3">
                            <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Função:</span> {posto.categoria_posto || parsePostoTurnoCategoria(posto.codigo).funcao}</p>
                            <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Exigências:</span> {posto.exige_nr32 && posto.exige_nr35 ? 'NR32 e NR35' : (posto.exige_nr32 ? 'NR32' : (posto.exige_nr35 ? 'NR35' : 'Não se Aplica'))}</p>
                            <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Tipo de Escala:</span> {
                               ['A', 'B', 'C'].includes(posto.tipo_escala || '') ? `Mensalista (Escala ${posto.tipo_escala})` : (posto.tipo_escala && posto.tipo_escala.startsWith('D') ? posto.tipo_escala : (posto.tipo_escala || parseTipoEscala(posto.descricao_escala)))
                            }</p>
                            <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Detalhes da Escala:</span> {posto.descricao_escala || '-'}</p>
                            {(posto.codigo.includes('-A') || posto.tipo_escala === 'A' || String(posto.tipo_escala).includes('12x36') || String(posto.descricao_escala).includes('12 por 36') || String(posto.descricao_escala).includes('12x36')) && (
                              <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Data Base 12x36:</span> {posto.data_base_escala_12x36 || 'Não configurada'}</p>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Colaborador(es) Alocado(s)</h5>
                          {posto.alocacoes && posto.alocacoes.length > 0 ? (
                            <div className="space-y-2">
                              {posto.alocacoes.map(alocacao => (
                                <div key={alocacao.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                  <div className="w-6 h-6 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-dark font-bold text-[9px] uppercase">
                                    {alocacao.colab?.nome?.substring(0, 2)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-700 truncate">{alocacao.colab?.nome}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                              Posto Vago (Sem alocação)
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                    Nenhum posto de trabalho cadastrado para este cliente.
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clientes Ativos</h1>
          <p className="text-slate-500 text-sm mt-1">Busque, visualize e gerencie seus clientes.</p>
        </div>
        <div className="flex gap-3">
          {['ADMIN', 'GERENCIA', 'RH', 'TEC_SEGURANCA'].includes(userProfile) && (
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-brand-dark hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Novo Cliente via Contrato (PDF)
            </button>
          )}
          <div className="bg-brand-teal/10 text-brand-teal px-4 py-2 rounded-xl font-bold flex gap-2 items-center">
            Total: <span>{filteredClientes.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
        <div className="flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/20 transition-all">
          <svg className="w-5 h-5 text-slate-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            placeholder="Buscar cliente por nome ou código..." 
            className="bg-transparent border-none outline-none w-full text-slate-700 font-medium placeholder-slate-400"
            value={buscaNome}
            onChange={(e) => setBuscaNome(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredClientes.map(cli => (
            <div 
              key={cli.id} 
              className="group flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-brand-cyan hover:shadow-md hover:bg-brand-cyan/5 transition-all cursor-pointer"
              onClick={() => setSelectedCliente(cli)}
            >
              <div className="flex items-center gap-4 mb-3 md:mb-0">
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-brand-cyan/20 flex items-center justify-center text-slate-600 group-hover:text-brand-dark font-bold uppercase transition-colors">
                  {cli.nome_razao.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-brand-dark">{cli.nome_razao}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span>Código: {cli.codigo || 'S/N'}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> {cli.cidade || 'Sem cidade'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {cli.supervisor || 'S/ Supervisor'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-brand-cyan/10 text-brand-teal border border-brand-cyan/20">
                    Rank. {cli.ranking_financeiro || '-'}
                  </span>
                </div>
                
                <button className="text-sm font-semibold text-brand-dark bg-white border border-slate-200 hover:border-brand-dark px-4 py-1.5 rounded-lg transition-colors">
                  Detalhes
                </button>
              </div>
            </div>
          ))}

          {filteredClientes.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
              Nenhum cliente ativo encontrado para essa busca.
            </div>
          )}
        </div>
      </div>

      {isUploadModalOpen && (
        <ModalUploadContrato 
          onClose={() => setIsUploadModalOpen(false)} 
          onSuccess={(novoCliente) => {
            // Recarregar os clientes
            api.getClientes().then(data => setClientes(data));
            // Opcional: já abrir o novo cliente
            // setSelectedCliente(novoCliente);
          }} 
        />
      )}
    </div>
  );
}
