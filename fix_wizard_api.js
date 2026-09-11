const fs = require('fs');
let code = fs.readFileSync('src/components/ocorrencias/TrocaSetorWizard.tsx', 'utf8');

const regex = /const response = await fetch\([^;]+;/;
code = code.replace(regex, `const success = await api.processarRemanejamento(payload);`);
code = code.replace(/if \(!response\.ok\)/, 'if (!success)');

fs.writeFileSync('src/components/ocorrencias/TrocaSetorWizard.tsx', code, 'utf8');
