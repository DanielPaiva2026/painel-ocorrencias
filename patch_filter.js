const fs = require('fs');
let code = fs.readFileSync('src/app/ferias/page.tsx', 'utf8');
code = code.replace(
  'const importados = colabsData.filter(c => c.admissao || c.ferias_ultimo_aquisitivo || c.ferias_vencimento)',
  'const importados = colabsData.filter(c => c.status_cadastro !== "Inativo")'
);
fs.writeFileSync('src/app/ferias/page.tsx', code, 'utf8');
