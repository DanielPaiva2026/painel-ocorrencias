const fs = require('fs');
const file = 'src/components/ocorrencias/TratamentoJornadaIncompletaWizard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'setLoading(true);\n\n    const payload = {',
  `setLoading(true);

    let urlDocumento = null;
    if (enviouAtestado && atestadoFile) {
      const res = await api.uploadFile(atestadoFile);
      if (res) urlDocumento = res.url;
    }

    const payload = {`
);

fs.writeFileSync(file, code, 'utf8');
console.log('done');
