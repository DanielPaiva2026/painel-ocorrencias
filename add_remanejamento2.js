const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf8');

const regex = /realizarAlocacaoManual: async/;
code = code.replace(regex, `processarRemanejamento: async (payload: { movimentacoes: any[], livres: string[] }): Promise<boolean> => {
    try {
      const res = await fetch(\`\${API_URL}/alocacoes/remanejamento\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
  realizarAlocacaoManual: async`);

fs.writeFileSync('src/services/api.ts', code, 'utf8');
