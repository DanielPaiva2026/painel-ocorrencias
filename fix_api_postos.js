const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf8');

const regex = /getPostosParaAlocacao:/;
code = code.replace(regex, `getPostos: async (): Promise<any[]> => {
    try {
      const res = await fetch(\`\${API_URL}/postos-de-trabalho\`, { cache: 'no-store' });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },
  getPostosParaAlocacao:`);

fs.writeFileSync('src/services/api.ts', code, 'utf8');
