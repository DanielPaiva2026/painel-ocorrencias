import { useState } from 'react';
import { api } from '@/services/api';

interface ModalCreateClienteProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalCreateCliente({ onClose, onSuccess }: ModalCreateClienteProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    empresa: 'MACHADO', // 'MACHADO' | 'FALCAO'
    razao_social: '',
    cnpj: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    responsavel: '',
    telefone: '',
    observacao: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.createClienteManual(formData);
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar cliente');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-slate-800">Novo Cliente Manual</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="create-cliente-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Empresa Contratada</label>
                <select name="empresa" value={formData.empresa} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" required>
                  <option value="MACHADO">MACHADO SOLUÇÕES</option>
                  <option value="FALCAO">FALCÃO PAIVA / AGENTS</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Razão Social *</label>
                <input type="text" name="razao_social" value={formData.razao_social} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">CNPJ *</label>
                <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Telefone</label>
                <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Responsável</label>
                <input type="text" name="responsavel" value={formData.responsavel} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">CEP *</label>
                <input type="text" name="cep" value={formData.cep} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Endereço (Rua/Av) *</label>
                <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Número</label>
                <input type="text" name="numero" value={formData.numero} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Complemento</label>
                <input type="text" name="complemento" value={formData.complemento} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Bairro *</label>
                <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cidade *</label>
                <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">UF *</label>
                <input type="text" name="uf" value={formData.uf} onChange={handleChange} required maxLength={2} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal uppercase" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Observações (Escopo)</label>
                <textarea name="observacao" value={formData.observacao} onChange={handleChange} rows={3} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal" />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={loading} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors">
            Cancelar
          </button>
          <button form="create-cliente-form" type="submit" disabled={loading} className="bg-brand-teal hover:bg-brand-teal/90 text-white px-6 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
}
