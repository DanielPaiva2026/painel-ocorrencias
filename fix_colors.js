const fs = require('fs');
let code = fs.readFileSync('src/app/ocorrencias/historico/page.tsx', 'utf8');

code = code.replace(
  "oc.tipo === 'Alocado' ? 'bg-indigo-50 text-indigo-600' :",
  `oc.tipo === 'Alocado' ? 'bg-indigo-50 text-indigo-600' :
                        oc.tipo === 'Substituição' ? 'bg-green-50 text-green-600' :
                        oc.tipo === 'Trabalho Intermitente' ? 'bg-orange-50 text-orange-600' :`
);

fs.writeFileSync('src/app/ocorrencias/historico/page.tsx', code, 'utf8');
console.log('fixed frontend page');
