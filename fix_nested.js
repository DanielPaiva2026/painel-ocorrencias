const fs = require('fs');
let code = fs.readFileSync('src/components/ocorrencias/SubstitutoAvancadoFlow.tsx', 'utf8');

code = code.replace(
  '     onFinish({\n       substitutosSelecionados: payloadsSubs,\n       descontos_cliente: descontos\n     });',
  `     if (nestedData) {
        payloadsSubs.push(...(nestedData.substitutosSelecionados || []));
        descontos.push(...(nestedData.descontos_cliente || []));
     }
     
     onFinish({
       substitutosSelecionados: payloadsSubs,
       descontos_cliente: descontos
     });`
);

fs.writeFileSync('src/components/ocorrencias/SubstitutoAvancadoFlow.tsx', code, 'utf8');
console.log('done');
