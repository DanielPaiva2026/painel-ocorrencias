'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle2, User, FileText, Loader2, X } from 'lucide-react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

export function PendenciasAtestadoWidget() {
  const [pendencias, setPendencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPendencia, setSelectedPendencia] = useState<any>(null);
  const [sancaoData, setSancaoData] = useState<any>(null);
  const [sancaoLoading, setSancaoLoading] = useState(false);
  const [sancaoEscolhida, setSancaoEscolhida] = useState('');
  const [obsSubstituto, setObsSubstituto] = useState('');
  const [atestadoFile, setAtestadoFile] = useState<File | null>(null);
  const [resolvendo, setResolvendo] = useState(false);
  const router = useRouter();

  const loadData = async () => {
    try {
      const data = await api.getPendenciasDocumentos();
      setPendencias(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = async (p: any) => {
    setSelectedPendencia(p);
    setSancaoLoading(true);
    setSancaoData(null);
    try {
      const data = await api.getSancaoSugerida(p.colab_id, 'Falta');
      setSancaoData(data);
      setSancaoEscolhida(data?.sancao_sugerida || 'Advertência');
    } catch (e) {
      console.error(e);
      setSancaoEscolhida('Advertência');
    } finally {
      setSancaoLoading(false);
    }
  };

  const handleResolve = async (entregouDocumento: boolean = false) => {
    if (!selectedPendencia) return;
    setResolvendo(true);
    try {
      let urlDocumento = null;
      if (entregouDocumento && atestadoFile) {
        const uploadRes = await api.uploadFile(atestadoFile);
        if (uploadRes) urlDocumento = uploadRes.url;
      }

      // Passando também a obsSubstituto para ser logada/salva como observação
      const payload = obsSubstituto ? `${sancaoEscolhida} | Chamado para cobrir: ${obsSubstituto}` : sancaoEscolhida;
      const ok = await api.resolverPendenciaDocumento(selectedPendencia.id, payload, entregouDocumento, urlDocumento || undefined);
      if (ok) {
        setSelectedPendencia(null);
        setObsSubstituto('');
        setAtestadoFile(null);
        await loadData();
        router.refresh();
      } else {
        alert("Erro ao resolver pendência.");
      }
    } catch (e) {
      alert("Erro ao resolver pendência.");
    } finally {
      setResolvendo(false);
    }
  };

  if (loading) {
    return <div className="p-4 border border-slate-200 rounded-xl animate-pulse bg-slate-50 h-32"></div>;
  }

  if (pendencias.length === 0) {
    return null; // Oculta se não houver pendências
  }

  return (
    <>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert className="w-6 h-6 text-amber-600" />
          <h2 className="text-lg font-bold text-amber-900 tracking-tight">
            Pendências de Atestado / Liberação de Catraca
          </h2>
          <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
            {pendencias.length} Ação(ões) Necessária(s)
          </span>
        </div>
        <p className="text-sm text-amber-700 mb-4">
          Os colaboradores abaixo possuem atestados vencidos ou não apresentaram o documento no momento do retorno ao posto. Você precisa aplicar o desdobramento para liberar ou bloquear a entrada.
        </p>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {pendencias.map(p => {
            const dataOcorrencia = new Date(p.data).toLocaleDateString('pt-BR');
            const dataPrazo = new Date(p.prazo_documento).toLocaleString('pt-BR');
            const isVencido = new Date() > new Date(p.prazo_documento);

            return (
              <div key={p.id} className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-slate-400" />
                    {p.colab?.nome}
                  </div>
                </div>
                <div className="text-xs text-slate-500 space-y-1 mb-4">
                  <p>Ausência em: <strong>{dataOcorrencia}</strong></p>
                  <p className={isVencido ? "text-red-600 font-medium flex items-center gap-1" : "text-amber-600 flex items-center gap-1"}>
                    <Clock className="w-3 h-3" /> Prazo: {dataPrazo}
                    {isVencido && " (VENCIDO)"}
                  </p>
                </div>
                <button 
                  onClick={() => openModal(p)}
                  className="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 py-2 rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2"
                >
                  Resolver Desdobramento
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedPendencia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedPendencia(null)} />
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] relative z-10 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Resolver Pendência
              </h3>
              <button onClick={() => setSelectedPendencia(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                <p><strong>Colaborador:</strong> {selectedPendencia.colab?.nome}</p>
                <p><strong>Data da Ausência:</strong> {new Date(selectedPendencia.data).toLocaleDateString('pt-BR')}</p>
                <p className="text-red-600 font-medium mt-2 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Atestado não apresentado no prazo.</p>
              </div>

              {sancaoLoading ? (
                <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-brand-cyan" /></div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-4">
                    <p className="text-sm text-blue-800 font-medium flex justify-between items-center mb-2">
                      <span>Análise de Histórico (Faltas)</span>
                      <span className="bg-blue-100 text-blue-900 text-xs px-2 py-0.5 rounded-full">{sancaoData?.total_ocorrencias || 0} Ocorrência(s)</span>
                    </p>
                    <p className="text-xs text-blue-700">Com base no fluxo de Faltas Não Justificadas, a sanção sugerida para este caso é:</p>
                    <p className="text-lg font-bold text-blue-900 mt-1">{sancaoData?.sancao_sugerida}</p>
                  </div>

                  <label className="text-sm font-medium text-slate-700 block mb-2">Selecione a Ação do Gestor:</label>
                  <div className="space-y-2">
                    {['Advertência', 'Suspensão 1 Dia', 'Suspensão 2 Dias', 'Suspensão 3 Dias', 'Justa Causa'].map(s => (
                      <label key={s} className={`flex p-3 border rounded-xl cursor-pointer transition-colors ${sancaoEscolhida === s ? 'border-brand-cyan bg-brand-cyan/5' : 'border-slate-200 hover:border-brand-cyan/30'}`}>
                        <input type="radio" name="sancao" value={s} checked={sancaoEscolhida === s} onChange={() => setSancaoEscolhida(s)} className="mt-0.5 mr-3 text-brand-cyan focus:ring-brand-cyan" />
                        <div>
                          <span className="font-bold text-slate-800 text-sm block">{s}</span>
                          <span className="text-xs text-slate-500">
                            {s.includes('Suspensão') || s === 'Justa Causa' 
                              ? 'Bloqueia a entrada. O colaborador perde a ausência passada e o dia da suspensão.' 
                              : 'Libera a entrada. O colaborador assume o posto hoje, mas a ausência passada é tida como injustificada.'}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>

                  {(sancaoEscolhida.includes('Suspensão') || sancaoEscolhida === 'Justa Causa') && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                      <label className="text-sm font-medium text-slate-700 block mb-1">
                        Substituição no Posto (Opcional):
                      </label>
                      <input 
                        type="text" 
                        value={obsSubstituto}
                        onChange={e => setObsSubstituto(e.target.value)}
                        placeholder="Ex: Liguei para João Silva cobrir o posto hoje"
                        className="w-full rounded-xl border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Para usar a alocação inteligente pelo sistema, conclua este passo e depois abra <strong>Nova Ocorrência &gt; Cobertura</strong>.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <label className="text-sm font-medium text-slate-700 block mb-1">
                      Anexar Atestado (Opcional se entregar hoje):
                    </label>
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e => setAtestadoFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-cyan/10 file:text-brand-cyan hover:file:bg-brand-cyan/20"
                    />
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
                    <button onClick={() => handleResolve(true)} disabled={resolvendo} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70">
                      {resolvendo ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      Atestado Entregue
                    </button>
                    <div className="flex gap-2 justify-end w-full sm:w-auto">
                      <button onClick={() => setSelectedPendencia(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                      <button onClick={() => handleResolve(false)} disabled={resolvendo} className="bg-brand-cyan hover:bg-brand-teal text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md shadow-brand-cyan/20 flex items-center justify-center gap-2 disabled:opacity-70">
                        {resolvendo ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Aplicar Sanção
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
