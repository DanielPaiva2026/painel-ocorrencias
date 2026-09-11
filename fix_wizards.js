const fs = require('fs');
let code = fs.readFileSync('src/components/ocorrencias/TratamentoFaltaWizard.tsx', 'utf8');

code = code.replace(
  "const isFolga = sub.tipoDisponibilidade?.includes('Folga') || false;",
  "const isFolga = sub.tipoDisponibilidade?.includes('Folga') || sub.tipoDisponibilidade?.includes('Férias') || sub.tipoDisponibilidade?.includes('Ferias') || false;"
);

fs.writeFileSync('src/components/ocorrencias/TratamentoFaltaWizard.tsx', code, 'utf8');

let code2 = fs.readFileSync('src/components/ocorrencias/TratamentoAtrasoWizard.tsx', 'utf8');
code2 = code2.replace(
  "const isFolga = sub.tipoDisponibilidade?.includes('Folga') || false;",
  "const isFolga = sub.tipoDisponibilidade?.includes('Folga') || sub.tipoDisponibilidade?.includes('Férias') || sub.tipoDisponibilidade?.includes('Ferias') || false;"
);
fs.writeFileSync('src/components/ocorrencias/TratamentoAtrasoWizard.tsx', code2, 'utf8');

let code3 = fs.readFileSync('src/components/ocorrencias/TratamentoAusenciaWizard.tsx', 'utf8');
code3 = code3.replace(
  "const isFolga = sub.tipoDisponibilidade?.includes('Folga') || false;",
  "const isFolga = sub.tipoDisponibilidade?.includes('Folga') || sub.tipoDisponibilidade?.includes('Férias') || sub.tipoDisponibilidade?.includes('Ferias') || false;"
);
fs.writeFileSync('src/components/ocorrencias/TratamentoAusenciaWizard.tsx', code3, 'utf8');

console.log('done wizards');
