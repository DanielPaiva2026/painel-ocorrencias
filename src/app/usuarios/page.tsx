'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Users, Trash2, Plus, Shield, User, Briefcase, Building } from 'lucide-react';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('mudar@123');
  const [role, setRole] = useState('OPERACIONAL');
  const [telefoneWhatsapp, setTelefoneWhatsapp] = useState('');

  useEffect(() => {
    loadUsuarios();
  }, []);

  async function loadUsuarios() {
    setLoading(true);
    try {
      const data = await api.getUsuarios();
      setUsuarios(data);
    } catch (e) {
      console.error(e);
      alert('Erro ao carregar usuários. Você tem permissão de Admin?');
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createUsuario({ nome, email, senha, role, telefone_whatsapp: telefoneWhatsapp });
      setShowModal(false);
      setNome('');
      setEmail('');
      setRole('OPERACIONAL');
      setTelefoneWhatsapp('');
      loadUsuarios();
    } catch (error) {
      alert('Erro ao criar usuário. O email pode já estar em uso.');
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await api.deleteUsuario(id);
        loadUsuarios();
      } catch (error) {
        alert('Erro ao excluir usuário');
      }
    }
  }

  const roleColors: Record<string, string> = {
    'ADMIN': 'bg-brand-blue text-white',
    'GERENCIA': 'bg-purple-600 text-white',
    'COORDENADOR': 'bg-indigo-600 text-white',
    'RH': 'bg-pink-600 text-white',
    'DP': 'bg-rose-600 text-white',
    'SUPERVISOR': 'bg-brand-teal text-white',
    'TEC_SEGURANCA': 'bg-orange-500 text-white',
    'OPERACIONAL': 'bg-slate-200 text-slate-700',
    'CLIENTE': 'bg-amber-100 text-amber-800'
  };

  const roleIcons: Record<string, any> = {
    'ADMIN': Shield,
    'GERENCIA': Briefcase,
    'COORDENADOR': Briefcase,
    'RH': Users,
    'DP': Briefcase,
    'SUPERVISOR': Briefcase,
    'TEC_SEGURANCA': Shield,
    'OPERACIONAL': User,
    'CLIENTE': Building
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-brand-teal" />
            Usuários
          </h1>
          <p className="text-slate-500 mt-2">Gerencie quem tem acesso ao sistema</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-brand-teal hover:bg-brand-cyan text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-brand-teal/20"
        >
          <Plus className="w-5 h-5" /> Novo Usuário
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Carregando usuários...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Perfil</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Última Troca de Senha</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => {
                const RoleIcon = roleIcons[u.role] || User;
                return (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-800">{u.nome}</td>
                    <td className="p-4 text-slate-600 text-sm">{u.email}</td>
                    <td className="p-4 text-slate-600 text-sm">{u.telefone_whatsapp || '-'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold tracking-wider ${roleColors[u.role]}`}>
                        <RoleIcon className="w-3 h-3" /> {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {new Date(u.ultima_troca_senha).toLocaleDateString()} 
                      {u.troca_senha_obrigatoria && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1 rounded font-bold uppercase">Pendente</span>}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {usuarios.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Novo Usuário */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Cadastrar Novo Usuário</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
                <input required type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha Inicial</label>
                <input required type="text" value={senha} onChange={e => setSenha(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal outline-none" />
                <p className="text-[10px] text-slate-400 mt-1">O usuário será obrigado a trocar esta senha no primeiro login.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WhatsApp (DDD + Número)</label>
                <input type="text" value={telefoneWhatsapp} onChange={e => setTelefoneWhatsapp(e.target.value)} placeholder="Ex: 24999999999" className="w-full border rounded-xl px-3 py-2 text-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Perfil de Acesso</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal outline-none bg-white">
                  <option value="OPERACIONAL">OPERACIONAL (Padrão)</option>
                  <option value="SUPERVISOR">SUPERVISOR</option>
                  <option value="COORDENADOR">COORDENADOR</option>
                  <option value="GERENCIA">GERENCIA</option>
                  <option value="RH">RH</option>
                  <option value="DP">DP</option>
                  <option value="TEC_SEGURANCA">TEC. SEGURANÇA</option>
                  <option value="CLIENTE">CLIENTE</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              
              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-teal hover:bg-brand-cyan rounded-xl">Criar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
