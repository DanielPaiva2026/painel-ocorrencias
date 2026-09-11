const fs = require('fs');
let code = fs.readFileSync('src/components/ocorrencias/SubstitutoAvancadoFlow.tsx', 'utf8');

const regex = /else \{\s*deFolga = true; \/\/ livre\s*\}/;
const replaceWith = `else {
           deFolga = true; // livre
        }
        
        // Se a API informou que ele está de folga ou férias, força como folga para gerar hora extra
        if (c.tipoDisponibilidade && (c.tipoDisponibilidade.includes('Folga') || c.tipoDisponibilidade.includes('Férias') || c.tipoDisponibilidade.includes('Ferias'))) {
           deFolga = true;
        }`;

code = code.replace(regex, replaceWith);

fs.writeFileSync('src/components/ocorrencias/SubstitutoAvancadoFlow.tsx', code, 'utf8');
console.log('done');
