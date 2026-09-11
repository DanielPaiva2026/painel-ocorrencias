const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf8');

code = code.replace(
  'resolverPendenciaDocumento: async (id: string, sancao: string, entregouDocumento: boolean = false): Promise<boolean> => {',
  'resolverPendenciaDocumento: async (id: string, sancao: string, entregouDocumento: boolean = false, url_documento?: string): Promise<boolean> => {'
);

code = code.replace(
  'body: JSON.stringify({ sancao, entregou_documento: entregouDocumento })',
  'body: JSON.stringify({ sancao, entregou_documento: entregouDocumento, url_documento })'
);

fs.writeFileSync('src/services/api.ts', code, 'utf8');
console.log('fixed api.ts');
