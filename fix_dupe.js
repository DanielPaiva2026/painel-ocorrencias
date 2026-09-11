const fs = require('fs');
let code = fs.readFileSync('src/app/colaboradores/page.tsx', 'utf8');

const regex = /const canTrocaSetor = \['ADMIN', 'COORDENADOR', 'COORDENADOR ADMINISTRATIVO', 'GERENTE', 'RH', 'DP'\].includes\(userProfile.toUpperCase\(\)\);\n  const canTrocaSetor/;
code = code.replace(regex, `const canTrocaSetor`);

fs.writeFileSync('src/app/colaboradores/page.tsx', code, 'utf8');
