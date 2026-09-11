const fs = require('fs');
let code = fs.readFileSync('src/app/ferias/page.tsx', 'utf8');

const logicToAdd = `
  const handleAutoCalcularTodas = async () => {
    if (!confirm('Isto irá varrer todos os colaboradores ativos e recalcular as datas de férias (Aquisitivo e Limites) baseado na Data de Admissão. Deseja continuar?')) return;
    setLoading(true);
    let updated = 0;
    const today = new Date();
    const parseDate = (d: string) => {
      if(!d) return null;
      if(d.includes('/')) return new Date(\`\${d.split('/')[2]}-\${d.split('/')[1]}-\${d.split('/')[0]}T12:00:00Z\`);
      if(d.includes('-')) return new Date(\`\${d}T12:00:00Z\`);
      return null;
    };
    const formatDate = (d: Date) => d ? d.toISOString().split('T')[0] : null;

    const novosColaboradores = [...colaboradores];

    for (let i = 0; i < novosColaboradores.length; i++) {
      const c = novosColaboradores[i];
      if (!c.admissao) continue;
      const adm = parseDate(c.admissao);
      if (!adm) continue;
      
      let uAq = new Date(adm);
      uAq.setFullYear(uAq.getFullYear() + 1);
      
      // Se a pessoa acabou de entrar, ainda não fechou 1 ano.
      if (uAq > today) continue;

      // Pula os anos até achar o último aquisitivo fechado
      while (true) {
        const prox = new Date(uAq); prox.setFullYear(prox.getFullYear() + 1);
        if (prox <= today) uAq = prox; else break;
      }

      const max = new Date(uAq); max.setDate(max.getDate() + 350);
      const inc = new Date(max); inc.setDate(inc.getDate() - 45);
      const avs = new Date(inc); avs.setDate(avs.getDate() - 30);

      const payload = {
        ferias_ultimo_aquisitivo: formatDate(uAq),
        ferias_vencimento: formatDate(max),
        ferias_limite_entrada: formatDate(inc),
        ferias_notificacao: formatDate(avs)
      };

      try {
        await api.updateColab(c.id, payload);
        novosColaboradores[i] = { ...c, ...payload };
        updated++;
      } catch (e) {
        console.error("Falha ao atualizar", c.nome);
      }
    }
    setColaboradores(novosColaboradores);
    setLoading(false);
    alert(\`Processo concluído! \${updated} colaboradores corrigidos automaticamente.\`);
  };
`;

const importRegex = /const handleSaveFeriasData = async/;
code = code.replace(importRegex, logicToAdd + '\n  const handleSaveFeriasData = async');

const searchBarRegex = /<input \n\s*type="text"\n\s*placeholder="Buscar colaborador..."/;
const buttonToAdd = `{canEditDatas && (
              <button onClick={handleAutoCalcularTodas} className="bg-brand-cyan hover:bg-brand-teal text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition-colors">
                Auto-Corrigir Datas (Massa)
              </button>
            )}
            <input 
              type="text"
              placeholder="Buscar colaborador..."`;

code = code.replace(searchBarRegex, buttonToAdd);

fs.writeFileSync('src/app/ferias/page.tsx', code, 'utf8');
