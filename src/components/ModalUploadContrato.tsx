import { useState, useRef } from 'react';
import { api, Cliente } from '@/services/api';

interface ModalUploadContratoProps {
  onClose: () => void;
  onSuccess: (novoCliente: Cliente) => void;
}

export default function ModalUploadContrato({ onClose, onSuccess }: ModalUploadContratoProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setPreviewData(null);
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const data = await api.previewContrato(file);
      setPreviewData(data);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!previewData) return;
    setIsProcessing(true);
    setError(null);

    try {
      const result = await api.confirmarContrato(previewData);
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar o contrato.');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setPreviewData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Novo Cliente via Contrato (PDF)</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {!previewData ? (
            <>
              <p className="text-slate-500 text-sm">
                Faça o upload do contrato assinado (PDF). Nosso sistema irá analisá-lo e extrair automaticamente todos os dados cadastrais e postos de trabalho.
              </p>

              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-brand-teal bg-brand-teal/5' : 'border-slate-300 hover:border-brand-teal/50 hover:bg-slate-50'}`}
              >
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {!file ? (
                  <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <p className="font-semibold text-slate-700">Clique para selecionar o PDF</p>
                    <p className="text-xs text-slate-400 mt-1">Apenas arquivos .pdf são suportados</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-brand-teal/10 rounded-full flex items-center justify-center text-brand-teal mb-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <p className="font-bold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button 
                      onClick={() => setFile(null)}
                      className="mt-4 text-xs font-semibold text-red-500 hover:text-red-700 underline"
                      disabled={isProcessing}
                    >
                      Remover arquivo
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-brand-cyan/10 text-brand-teal p-3 rounded-lg flex items-center gap-2 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className="font-semibold text-sm">Dados extraídos com sucesso! Revise antes de salvar.</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Razão Social</label>
                  <input 
                    type="text" 
                    value={previewData.razao_social || ''} 
                    onChange={e => updateField('razao_social', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CNPJ</label>
                  <input 
                    type="text" 
                    value={previewData.cnpj || ''} 
                    onChange={e => updateField('cnpj', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone</label>
                  <input 
                    type="text" 
                    value={previewData.telefone || ''} 
                    onChange={e => updateField('telefone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CEP</label>
                  <input 
                    type="text" 
                    value={previewData.cep || ''} 
                    onChange={e => updateField('cep', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço</label>
                  <input 
                    type="text" 
                    value={previewData.endereco || ''} 
                    onChange={e => updateField('endereco', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Postos Encontrados ({previewData.postos_de_trabalho?.length || 0})</label>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2">
                    {previewData.postos_de_trabalho?.map((posto: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                        <span className="font-semibold text-slate-700">{posto.funcao_nome || posto.funcao}</span>
                        <span className="text-slate-500">{posto.quantidade} vaga(s) | Escala {posto.escala_tipo} | Turno {posto.turno}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}

          {isProcessing && !previewData && (
            <div className="p-4 bg-brand-cyan/10 text-brand-teal text-sm rounded-lg border border-brand-cyan/20 flex flex-col items-center gap-2">
              <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <p className="font-semibold">Processando Contrato...</p>
              <p className="text-xs opacity-80 text-center">A inteligência artificial está lendo e estruturando as informações.<br/>Isso pode levar alguns segundos.</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={() => previewData ? setPreviewData(null) : onClose()}
            disabled={isProcessing}
            className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-50"
          >
            {previewData ? 'Voltar' : 'Cancelar'}
          </button>
          {!previewData ? (
            <button 
              onClick={handlePreview}
              disabled={!file || isProcessing}
              className="px-6 py-2 bg-brand-teal hover:bg-brand-teal/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? 'Enviando...' : 'Processar Contrato'}
            </button>
          ) : (
            <button 
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-6 py-2 bg-brand-cyan hover:bg-brand-cyan/90 text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? 'Salvando...' : 'Confirmar e Salvar'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
