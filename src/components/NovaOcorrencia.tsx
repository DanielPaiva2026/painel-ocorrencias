'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { api, Colaborador } from '@/services/api';
import { useRouter } from 'next/navigation';
import { SearchableSelect } from './ocorrencias/SearchableSelect';
import { TratamentoAtrasoWizard } from './ocorrencias/TratamentoAtrasoWizard';
import { TratamentoAusenciaWizard } from './ocorrencias/TratamentoAusenciaWizard';

export function NovaOcorrencia() {
  const [isOpen, setIsOpen] = useState(false);
  const [colabs, setColabs] = useState<Colaborador[]>([]);
  
  const [grupoOcorrencia, setGrupoOcorrencia] = useState('');
  const [tipoOcorrencia, setTipoOcorrencia] = useState('');
  const [colabId, setColabId] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      api.getColabs().then(setColabs);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setGrupoOcorrencia('');
    setTipoOcorrencia('');
    setColabId('');
  };

  const handleSuccess = () => {
    handleClose();
    router.refresh();
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-brand-teal hover:bg-brand-cyan transition-colors text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-brand-cyan/20 flex items-center gap-2"
      >
        <AlertCircle className="w-5 h-5" />
        <span>Nova Ocorrência</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleClose} />
          <div className="bg-white flex flex-col max-h-[95vh] overflow-y-auto w-full max-w-md p-6 rounded-2xl relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold tracking-tight text-slate-800">Registrar Ocorrência</h2>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              
              {/* PASSO 1: GRUPO DA OCORRÊNCIA */}
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Tipo de Ocorrência</label>
                <select 
                  required 
                  value={grupoOcorrencia} 
                  onChange={(e) => {
                    setGrupoOcorrencia(e.target.value);
                    setTipoOcorrencia('');
                    setColabId('');
                  }} 
                  className="w-full rounded-xl border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
                >
                  <option value="">Selecione...</option>
                  <option value="Ausência ou Atraso">Ausência ou Atraso</option>
                  <option value="Cobertura">Cobertura</option>
                </select>
              </div>

              {/* PASSO 2: TIPO ESPECÍFICO (se escolheu Ausência ou Atraso) */}
              {grupoOcorrencia === 'Ausência ou Atraso' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-medium text-slate-600 mb-1 block">Subcategoria</label>
                  <select 
                    required 
                    value={tipoOcorrencia} 
                    onChange={(e) => {
                      setTipoOcorrencia(e.target.value);
                      setColabId('');
                    }} 
                    className="w-full rounded-xl border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
                  >
                    <option value="">Selecione...</option>
                    <option value="Atraso">Atraso</option>
                    <option value="Ausência">Ausência</option>
                  </select>
                </div>
              )}

              {/* MENSAGENS TEMPORÁRIAS (Placeholders) */}
              {grupoOcorrencia === 'Cobertura' && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm animate-in fade-in slide-in-from-top-2">
                  <p className="font-medium">O fluxo de Cobertura será implementado na próxima etapa.</p>
                </div>
              )}

              {/* PASSO 3: COLABORADOR (Atraso ou Ausência) */}
              {grupoOcorrencia === 'Ausência ou Atraso' && tipoOcorrencia && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <SearchableSelect 
                    label="Colaborador"
                    options={colabs.map(c => ({ id: c.id, label: c.nome, subLabel: `${c.categoria_cargo} (${c.turno_base})` }))}
                    value={colabId}
                    onChange={setColabId}
                    placeholder="Selecione um colaborador"
                  />
                </div>
              )}

              {/* PASSO 4: WIZARDS */}
              {grupoOcorrencia === 'Ausência ou Atraso' && tipoOcorrencia === 'Atraso' && colabId && (
                <div className="mt-2 border-t border-slate-100 pt-4 animate-in fade-in slide-in-from-top-2">
                  <TratamentoAtrasoWizard 
                    colab={colabs.find(c => c.id === colabId)!}
                    onClose={handleClose}
                    onSuccess={handleSuccess}
                  />
                </div>
              )}

              {grupoOcorrencia === 'Ausência ou Atraso' && tipoOcorrencia === 'Ausência' && colabId && (
                <div className="mt-2 border-t border-slate-100 pt-4 animate-in fade-in slide-in-from-top-2">
                  <TratamentoAusenciaWizard 
                    colab={colabs.find(c => c.id === colabId)!}
                    onClose={handleClose}
                    onSuccess={handleSuccess}
                  />
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
