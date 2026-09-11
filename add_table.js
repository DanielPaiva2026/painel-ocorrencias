const fs = require('fs');
let code = fs.readFileSync('src/app/ferias/page.tsx', 'utf8');

// 1. We need `userProfile` for edit permissions
const regexStats = /const \[stats, setStats\] = useState<DashboardStats \| null>\(null\)/;
const statsReplacement = `const [stats, setStats] = useState<DashboardStats | null>(null)
  const [userProfile, setUserProfile] = useState('');
  useEffect(() => {
    setUserProfile(localStorage.getItem('auth_role') || '');
  }, []);
  const canEditDatas = ['ADMIN', 'RH', 'DP', 'COORDENADOR', 'COORDENADOR ADMINISTRATIVO'].includes(userProfile.toUpperCase());

  const handleSaveFeriasData = async (colabId, field, value) => {
    await api.updateColab(colabId, { [field]: value });
    setColaboradores(prev => prev.map(c => c.id === colabId ? { ...c, [field]: value } : c));
  };
`;
code = code.replace(regexStats, statsReplacement);

// 2. Add the table section right before the wizard modal {isWizardOpen && (
const regexWizard = /\{\/\* Seção de Pessoal Afastado ou Coberturas \*\/\}/;

const tableJSX = `
      {/* Quadro Geral de Prazos Limites */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mt-6">
        <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-brand-cyan" /> Quadro Geral de Aquisitivos (Prazos Limites)
          </h3>
          <input 
            type="text"
            placeholder="Buscar colaborador..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan"
          />
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 sticky top-0 z-10 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Colaborador</th>
                <th className="px-4 py-3 font-bold">Último Aquisitivo</th>
                <th className="px-4 py-3 font-bold">Limite Máximo</th>
                <th className="px-4 py-3 font-bold">Limite p/ Iniciar (-15d)</th>
                <th className="px-4 py-3 font-bold">Limite p/ Aviso (-30d)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredColaboradores.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.nome}</td>
                  <td className="px-4 py-3">
                    <input type="date" value={c.ferias_ultimo_aquisitivo || ''} onChange={e => handleSaveFeriasData(c.id, 'ferias_ultimo_aquisitivo', e.target.value)} disabled={!canEditDatas} className="bg-transparent border border-transparent hover:border-slate-300 focus:border-brand-cyan rounded px-2 py-1 outline-none w-36 text-slate-700 disabled:opacity-70 disabled:hover:border-transparent" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="date" value={c.ferias_vencimento || ''} onChange={e => handleSaveFeriasData(c.id, 'ferias_vencimento', e.target.value)} disabled={!canEditDatas} className="bg-transparent border border-transparent hover:border-slate-300 focus:border-brand-cyan rounded px-2 py-1 outline-none w-36 text-slate-700 disabled:opacity-70 disabled:hover:border-transparent" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="date" value={c.ferias_limite_entrada || ''} onChange={e => handleSaveFeriasData(c.id, 'ferias_limite_entrada', e.target.value)} disabled={!canEditDatas} className="bg-transparent border border-transparent hover:border-slate-300 focus:border-brand-cyan rounded px-2 py-1 outline-none w-36 text-slate-700 disabled:opacity-70 disabled:hover:border-transparent" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="date" value={c.ferias_notificacao || ''} onChange={e => handleSaveFeriasData(c.id, 'ferias_notificacao', e.target.value)} disabled={!canEditDatas} className="bg-transparent border border-transparent hover:border-slate-300 focus:border-brand-cyan rounded px-2 py-1 outline-none w-36 text-slate-700 disabled:opacity-70 disabled:hover:border-transparent" />
                  </td>
                </tr>
              ))}
              {filteredColaboradores.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-slate-400">Nenhum colaborador encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção de Pessoal Afastado ou Coberturas */}`;

code = code.replace(regexWizard, tableJSX);

fs.writeFileSync('src/app/ferias/page.tsx', code, 'utf8');
