import { useState } from 'react';
import { api, PostoDeTrabalho } from '@/services/api';

interface ModalEditPostoProps {
  clienteId: string;
  posto?: PostoDeTrabalho; // Se não passar, é criação
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditPosto({ clienteId, posto, onClose, onSuccess }: ModalEditPostoProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!posto;
  
  const [formData, setFormData] = useState({
    codigo: posto?.codigo || '',
    descricao_escala: posto?.descricao_escala || '',
    tipo_escala: posto?.tipo_escala || '',
    funcao: posto?.funcao || '',
    horas_diarias: posto?.horas_diarias || '',
    status: posto?.status || 'Ativo',
    tipo_cobertura: posto?.tipo_cobertura || 'NENHUMA',
    par_impar: posto?.par_impar || 'PAR',
    cobertura_de: posto?.cobertura_de || 'NENHUMA',
    exige_nr32: posto?.exige_nr32 || false,
    exige_nr35: posto?.exige_nr35 || false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditing) {
        await api.updatePosto(posto.id, formData);
      } else {
        await api.createPostoManual(clienteId, formData);
      }
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar posto');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-slate-800">{isEditing ? 'Editar Posto' : 'Novo Posto Manual'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="edit-posto-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Código do Posto *</label>
              <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} required placeholder="Ex: MC015 - LD-A/1" className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Função do Posto</label>
              <input type="text" name="funcao" value={formData.funcao} onChange={handleChange} placeholder="Ex: Recepcionista, Vigia..." className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Escala</label>
                <select name="tipo_escala" value={formData.tipo_escala} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal">
                  <option value="">Selecione...</option>
                  <option value="12x36">12x36</option>
                  <option value="12x26">12x26</option>
                  <option value="6x1">6x1</option>
                  <option value="5x2">5x2</option>
                  <option value="3xsem">3xsem</option>
                  <option value="2xsem">2xsem</option>
                  <option value="1xsem">1xsem</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Horas Diárias</label>
                <input type="text" name="horas_diarias" value={formData.horas_diarias} onChange={handleChange} placeholder="Ex: 8, 12..." className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição Adicional da Escala</label>
              <input type="text" name="descricao_escala" value={formData.descricao_escala} onChange={handleChange} placeholder="Ex: Portaria Diurno" className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal">
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Par/Ímpar</label>
                <select name="par_impar" value={formData.par_impar} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal">
                  <option value="PAR">Par</option>
                  <option value="IMPAR">Ímpar</option>
                  <option value="NENHUMA">Não se aplica</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" name="exige_nr32" checked={formData.exige_nr32} onChange={handleChange} className="w-4 h-4 text-brand-teal rounded border-slate-300 focus:ring-brand-teal" />
                Exige NR 32
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" name="exige_nr35" checked={formData.exige_nr35} onChange={handleChange} className="w-4 h-4 text-brand-teal rounded border-slate-300 focus:ring-brand-teal" />
                Exige NR 35
              </label>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-semibold text-slate-700 text-sm">Regras de Cobertura (6x1 / 5x2)</h3>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Cobertura</label>
                <select name="tipo_cobertura" value={formData.tipo_cobertura} onChange={handleChange} className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal">
                  <option value="NENHUMA">Sem cobertura</option>
                  <option value="FIXO">Fixo (Requer posto Folguista)</option>
                  <option value="FOLGA_SEMANA">Folga (Folga na semana)</option>
                  <option value="REVEZAMENTO_FDS">Revezamento (Sábado x Domingo)</option>
                </select>
                {(formData.tipo_cobertura === 'FOLGA_SEMANA' || formData.tipo_cobertura === 'REVEZAMENTO_FDS') && (
                  <p className="text-xs text-orange-600 mt-2 font-medium bg-orange-50 p-2 rounded-lg">
                    Atenção: Postos com folga ou revezamento exigirão cobertura eventual para a folga do funcionário!
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Este posto é cobertura de:</label>
                <select name="cobertura_de" value={formData.cobertura_de} onChange={handleChange} className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal">
                  <option value="NENHUMA">Não é posto de cobertura</option>
                  <option value="DOMINGO">Domingos</option>
                  <option value="FERIADO">Feriados</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={loading} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors">
            Cancelar
          </button>
          <button form="edit-posto-form" type="submit" disabled={loading} className="bg-brand-teal hover:bg-brand-teal/90 text-white px-6 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar Posto'}
          </button>
        </div>
      </div>
    </div>
  );
}
