import { useState } from 'react';
import { api } from '@/services/api';

interface ModalNovoColaboradorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalNovoColaborador({ isOpen, onClose, onSuccess }: ModalNovoColaboradorProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
  
  // States for manual form
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [papel, setPapel] = useState('');
  const [turnoBase, setTurnoBase] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [horasContratadas, setHorasContratadas] = useState('');
  const [tipoContratacao, setTipoContratacao] = useState('');

  // New detailed states
  const [statusCadastro, setStatusCadastro] = useState('Ativo');
  const [admissao, setAdmissao] = useState('');
  const [ctps, setCtps] = useState('');
  const [contratoExperienciaDias, setContratoExperienciaDias] = useState('');
  const [situacaoDisponibilidade, setSituacaoDisponibilidade] = useState('Disponível');
  const [dataRetorno, setDataRetorno] = useState('');
  const [justificativaInativo, setJustificativaInativo] = useState('');
  const [dataIntegracao, setDataIntegracao] = useState('');
  const [reciclagemIntegracao, setReciclagemIntegracao] = useState('');
  const [dataNr32, setDataNr32] = useState('');
  const [reciclagemNr32, setReciclagemNr32] = useState('');
  const [dataNr35, setDataNr35] = useState('');
  const [reciclagemNr35, setReciclagemNr35] = useState('');
  const [dataAso, setDataAso] = useState('');
  const [reciclagemAso, setReciclagemAso] = useState('');

  // States for upload form
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!nome || !papel || !turnoBase) {
      setError('Nome, Função e Turno Base são obrigatórios.');
      setLoading(false);
      return;
    }

    const payload = {
      nome,
      matricula,
      papel,
      turno_base: turnoBase,
      cep: cep || '00000-000',
      endereco: endereco || 'Não informado',
      horas_contratadas: horasContratadas || null,
      tipo_contratacao: tipoContratacao || null,
      status_cadastro: statusCadastro || null,
      admissao: admissao || null,
      ctps: ctps || null,
      contrato_experiencia_dias: contratoExperienciaDias ? parseInt(contratoExperienciaDias, 10) : null,
      situacao_disponibilidade: situacaoDisponibilidade || null,
      data_retorno: dataRetorno || null,
      justificativa_inativo: justificativaInativo || null,
      data_integracao: dataIntegracao || null,
      reciclagem_integracao: reciclagemIntegracao || null,
      data_nr32: dataNr32 || null,
      reciclagem_nr32: reciclagemNr32 || null,
      data_nr35: dataNr35 || null,
      reciclagem_nr35: reciclagemNr35 || null,
      data_aso: dataAso || null,
      reciclagem_aso: reciclagemAso || null,
    };

    const success = await api.createColab(payload);
    setLoading(false);
    
    if (success) {
      onSuccess();
      onClose();
    } else {
      setError('Erro ao salvar o colaborador. Verifique os dados e tente novamente.');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!file) {
      setError('Selecione um arquivo CSV para enviar.');
      return;
    }

    setLoading(true);
    const result = await api.uploadColabsCsv(file);
    setLoading(false);

    if (result && result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result?.message || 'Erro ao processar planilha. Verifique o formato do CSV e tente novamente.');
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "nome,matricula,categoria_cargo,turno_base,cep,endereco,horas_contratadas,tipo_contratacao,status_cadastro,admissao,ctps,contrato_experiencia_dias,situacao_disponibilidade,data_retorno,justificativa_inativo,data_integracao,reciclagem_integracao,data_nr32,reciclagem_nr32,data_nr35,reciclagem_nr35,data_aso,reciclagem_aso\nJoão da Silva,1234,PORTEIRO,12x36 Dia,01000-000,Rua Teste 123,44:00,CLT,Ativo,10/05/2023,1234567,45,Disponível,,,,,10/06/2023,,15/06/2023,,20/06/2023,";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_colaboradores.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Adicionar Colaborador</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex border-b border-slate-100 bg-white">
          <button 
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'manual' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('manual')}
          >
            Inclusão Manual
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'upload' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('upload')}
          >
            Importar Planilha (CSV)
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-8">
              
              {/* Seção 1: Informações Pessoais & Histórico */}
              <div>
                <h3 className="text-sm font-bold text-brand-dark border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider">1. Informações Pessoais & Histórico</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome Completo *</label>
                    <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all" placeholder="Ex: João da Silva" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CEP</label>
                    <input type="text" value={cep} onChange={e => setCep(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all" placeholder="Ex: 01000-000" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Endereço Completo</label>
                    <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all" placeholder="Ex: Rua Teste, 123 - Bairro" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status Cadastro</label>
                    <input type="text" value={statusCadastro} onChange={e => setStatusCadastro(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all" placeholder="Ex: Ativo" />
                  </div>
                  <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data Integração</label>
                      <input type="text" value={dataIntegracao} onChange={e => setDataIntegracao(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-brand-teal transition-all" placeholder="DD/MM/AAAA" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reciclagem Int.</label>
                      <input type="text" value={reciclagemIntegracao} onChange={e => setReciclagemIntegracao(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-brand-teal transition-all" placeholder="DD/MM/AAAA" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data NR32</label>
                      <input type="text" value={dataNr32} onChange={e => setDataNr32(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-brand-teal transition-all" placeholder="DD/MM/AAAA" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reciclagem NR32</label>
                      <input type="text" value={reciclagemNr32} onChange={e => setReciclagemNr32(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-brand-teal transition-all" placeholder="DD/MM/AAAA" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data NR35</label>
                      <input type="text" value={dataNr35} onChange={e => setDataNr35(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-brand-teal transition-all" placeholder="DD/MM/AAAA" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reciclagem NR35</label>
                      <input type="text" value={reciclagemNr35} onChange={e => setReciclagemNr35(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-brand-teal transition-all" placeholder="DD/MM/AAAA" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data Exame (ASO)</label>
                      <input type="text" value={dataAso} onChange={e => setDataAso(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-brand-teal transition-all" placeholder="DD/MM/AAAA" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reciclagem ASO</label>
                      <input type="text" value={reciclagemAso} onChange={e => setReciclagemAso(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-brand-teal transition-all" placeholder="DD/MM/AAAA" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Contrato de Trabalho */}
              <div>
                <h3 className="text-sm font-bold text-brand-dark border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider">2. Contrato de Trabalho</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Matrícula</label>
                    <input type="text" value={matricula} onChange={e => setMatricula(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:border-brand-teal transition-all" placeholder="Ex: 1234" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Data de Admissão</label>
                    <input type="text" value={admissao} onChange={e => setAdmissao(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:border-brand-teal transition-all" placeholder="DD/MM/AAAA" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Função / Papel *</label>
                    <input type="text" value={papel} onChange={e => setPapel(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:border-brand-teal transition-all" placeholder="Ex: PORTEIRO" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Turno Base *</label>
                    <input type="text" value={turnoBase} onChange={e => setTurnoBase(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:border-brand-teal transition-all" placeholder="Ex: 12x36 Dia" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo de Contratação</label>
                    <input type="text" value={tipoContratacao} onChange={e => setTipoContratacao(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:border-brand-teal transition-all" placeholder="Ex: CLT" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Horas Contratadas</label>
                    <input type="text" value={horasContratadas} onChange={e => setHorasContratadas(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:border-brand-teal transition-all" placeholder="Ex: 44:00" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CTPS</label>
                    <input type="text" value={ctps} onChange={e => setCtps(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:border-brand-teal transition-all" placeholder="Ex: 1234567" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contrato de Experiência (Dias)</label>
                    <select value={contratoExperienciaDias} onChange={e => setContratoExperienciaDias(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:border-brand-teal transition-all">
                      <option value="">Selecione...</option>
                      <option value="30">30 Dias</option>
                      <option value="45">45 Dias</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção 3: Disponibilidade */}
              <div>
                <h3 className="text-sm font-bold text-brand-dark border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider">3. Disponibilidade</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Situação / Disponibilidade</label>
                    <input type="text" value={situacaoDisponibilidade} onChange={e => setSituacaoDisponibilidade(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:border-brand-teal transition-all" placeholder="Ex: Disponível" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Data Retorno (se aplicável)</label>
                    <input type="text" value={dataRetorno} onChange={e => setDataRetorno(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:border-brand-teal transition-all" placeholder="DD/MM/AAAA" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Justificativa Inativo / Observação Retorno</label>
                    <input type="text" value={justificativaInativo} onChange={e => setJustificativaInativo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:border-brand-teal transition-all" placeholder="Ex: Aguardando recolocação..." />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-bold text-white bg-brand-teal hover:bg-brand-teal/90 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm">
                  {loading ? 'Salvando...' : 'Salvar Colaborador'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUploadSubmit} className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 border-dashed text-center">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Selecione o arquivo CSV</h3>
                <p className="text-sm text-slate-500 mb-4">O arquivo deve conter o separador por vírgula (,) e seguir as colunas padrão.</p>
                
                <input 
                  type="file" 
                  accept=".csv"
                  id="csvFile"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
                <label htmlFor="csvFile" className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal transition-colors">
                  {file ? file.name : 'Escolher arquivo'}
                </label>
              </div>

              <div className="bg-brand-cyan/10 p-4 rounded-xl border border-brand-cyan/20 flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <h4 className="text-sm font-bold text-brand-dark mb-1">Precisa do modelo padrão?</h4>
                  <p className="text-xs text-brand-dark/70 mb-2">Baixe a planilha modelo para garantir que as colunas estejam nomeadas corretamente antes de subir o arquivo.</p>
                  <button type="button" onClick={handleDownloadTemplate} className="text-xs font-bold text-brand-teal hover:underline">
                    Baixar modelo_colaboradores.csv
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading || !file} className="px-5 py-2.5 text-sm font-bold text-white bg-brand-teal hover:bg-brand-teal/90 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                  {loading ? 'Processando...' : 'Importar Dados'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
