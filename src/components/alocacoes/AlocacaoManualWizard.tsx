'use client';

import { useState, useEffect } from 'react';
import { api, ColabLivre, PostoParaAlocacao } from '@/services/api';
import { MapPin, UserCheck, Clock, AlertTriangle, ShieldAlert, Loader2, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlocacaoManualWizardProps {
  colab: ColabLivre;
  onClose: () => void;
  onSuccess: () => void;
}

export function AlocacaoManualWizard({ colab, onClose, onSuccess }: AlocacaoManualWizardProps) {
  const [postos, setPostos] = useState<PostoParaAlocacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosto, setSelectedPosto] = useState<PostoParaAlocacao | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [desalocarAntigo, setDesalocarAntigo] = useState(true);

  useEffect(() => {
    const fetchPostos = async () => {
      try {
        const data = await api.getPostosParaAlocacao(colab.id);
        setPostos(data);
      } catch (e) {
        alert('Erro ao carregar postos');
      } finally {
        setLoading(false);
      }
    };
    fetchPostos();
  }, [colab.id]);

  const handleAlocar = async () => {
    if (!selectedPosto) return;
    
    setSubmitting(true);
    const success = await api.realizarAlocacaoManual({
      colabId: colab.id,
      postoId: selectedPosto.id,
      acao_ocupante_atual: selectedPosto.ocupantes_atuais.length > 0 && desalocarAntigo ? 'desalocar' : 'manter'
    });

    if (success) {
      alert('Colaborador alocado com sucesso!');
      onSuccess();
    } else {
      alert('Ocorreu um erro ao tentar alocar o colaborador.');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Alocação Manual</h2>
            <p className="text-sm text-slate-500 mt-1">
              Alocando: <span className="font-semibold text-brand-cyan">{colab.nome}</span> ({colab.horasRestantes}h livres)
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-brand-cyan mb-4" />
              <p>Buscando postos compatíveis...</p>
            </div>
          ) : (
            <>
              {/* Lista de Postos */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Postos de Trabalho</h3>
                <div className="grid gap-3">
                  {postos.map(posto => {
                    const isSelected = selectedPosto?.id === posto.id;
                    const isOccupied = posto.ocupantes_atuais.length > 0;
                    
                    return (
                      <div 
                        key={posto.id}
                        onClick={() => setSelectedPosto(posto)}
                        className={cn(
                          "p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between",
                          isSelected ? "border-brand-cyan bg-cyan-50/30" : "border-slate-100 hover:border-brand-cyan/30 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-800 text-lg">{posto.cliente?.nome_razao || posto.codigo}</span>
                            {isOccupied && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                <AlertTriangle className="w-3 h-3" /> Ocupado
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                            <div className="flex items-center gap-1.5">
                              <MapPin className={cn("w-4 h-4", posto.mesma_cidade ? "text-emerald-500" : "text-slate-400")} />
                              {posto.cliente?.cidade}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <UserCheck className={cn("w-4 h-4", posto.mesma_funcao ? "text-emerald-500" : "text-slate-400")} />
                              {posto.categoria_posto}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className={cn("w-4 h-4", posto.horas_compativeis ? "text-emerald-500" : "text-rose-500")} />
                              {posto.horas_diarias}
                            </div>
                          </div>
                          
                          {posto.alerta_nr && (
                            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded w-fit">
                              <ShieldAlert className="w-3.5 h-3.5" /> Faltam NR(s): {posto.alerta_nr}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 items-start md:items-end w-full md:w-auto">
                          <div className="flex gap-2">
                            {posto.mesma_cidade && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">Mesma Cidade</span>}
                            {posto.mesma_funcao && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">Mesma Função</span>}
                          </div>
                          {isOccupied && (
                            <div className="text-xs text-slate-500">
                              Ocupado por: {posto.ocupantes_atuais.map(o => o.nome).join(', ')}
                            </div>
                          )}
                        </div>
                        
                        {/* Radio indicator */}
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 hidden md:flex",
                          isSelected ? "border-brand-cyan" : "border-slate-300"
                        )}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-cyan" />}
                        </div>
                      </div>
                    );
                  })}
                  
                  {postos.length === 0 && (
                    <div className="text-center py-10 text-slate-500">Nenhum posto de trabalho encontrado.</div>
                  )}
                </div>
              </div>
              
              {/* Painel de Conflito */}
              {selectedPosto && selectedPosto.ocupantes_atuais.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 animate-in slide-in-from-bottom-4">
                  <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" /> Posto já ocupado
                  </h4>
                  <p className="text-amber-700 text-sm mb-4">
                    Este posto encontra-se atualmente ocupado por <strong>{selectedPosto.ocupantes_atuais.map(o => o.nome).join(', ')}</strong>. 
                    O que você deseja fazer com o(s) ocupante(s) atual(is)?
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className={cn(
                      "flex-1 flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      desalocarAntigo ? "bg-white border-amber-400 ring-1 ring-amber-400" : "bg-white/50 border-amber-200 hover:bg-white"
                    )}>
                      <input 
                        type="radio" 
                        className="mt-1 accent-amber-600" 
                        checked={desalocarAntigo}
                        onChange={() => setDesalocarAntigo(true)}
                      />
                      <div>
                        <div className="font-medium text-slate-800 text-sm">Desalocar (Sugerido)</div>
                        <div className="text-xs text-slate-500 mt-0.5">O ocupante atual será removido deste posto e voltará para a lista de Livres.</div>
                      </div>
                    </label>

                    <label className={cn(
                      "flex-1 flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      !desalocarAntigo ? "bg-white border-amber-400 ring-1 ring-amber-400" : "bg-white/50 border-amber-200 hover:bg-white"
                    )}>
                      <input 
                        type="radio" 
                        className="mt-1 accent-amber-600" 
                        checked={!desalocarAntigo}
                        onChange={() => setDesalocarAntigo(false)}
                      />
                      <div>
                        <div className="font-medium text-slate-800 text-sm">Manter</div>
                        <div className="text-xs text-slate-500 mt-0.5">Ambos ficarão alocados neste posto simultaneamente.</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleAlocar}
            disabled={!selectedPosto || submitting}
            className="px-6 py-2 text-sm font-medium text-white bg-brand-cyan hover:bg-brand-teal rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirmar Alocação
          </button>
        </div>

      </div>
    </div>
  );
}
