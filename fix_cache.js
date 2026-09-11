const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf8');

code = code.replace(
  /getRelatorioExtratos: async \(\): Promise<any> => \{\n\s*const res = await fetch\(`\$\{API_URL\}\/relatorios\/extratos`, \{ headers: \{ 'Authorization': `Bearer \$\{localStorage.getItem\('access_token'\)\}` \} \}\);/,
  `getRelatorioExtratos: async (): Promise<any> => {
    const res = await fetch(\`\${API_URL}/relatorios/extratos\`, { 
      headers: { 'Authorization': \`Bearer \${localStorage.getItem('access_token')}\` },
      cache: 'no-store'
    });`
);

fs.writeFileSync('src/services/api.ts', code, 'utf8');
console.log('done cache');
