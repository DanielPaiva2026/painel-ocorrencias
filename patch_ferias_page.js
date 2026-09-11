const fs = require('fs');
let code = fs.readFileSync('src/app/ferias/page.tsx', 'utf8');

const regex = /const handleSaveFeriasData = async \(colabId: string, field: string, value: string\) => \{[\s\S]*?\};\n/;
const replacement = `const handleSaveFeriasData = async (colabId: string, field: string, value: string) => {
    let payload: any = { [field]: value };

    if (value) {
      if (field === 'ferias_ultimo_aquisitivo') {
        const d = new Date(value + 'T12:00:00Z');
        const max = new Date(d); max.setDate(max.getDate() + 350);
        const inicio = new Date(max); inicio.setDate(inicio.getDate() - 45);
        const aviso = new Date(inicio); aviso.setDate(aviso.getDate() - 30);

        payload.ferias_vencimento = max.toISOString().split('T')[0];
        payload.ferias_limite_entrada = inicio.toISOString().split('T')[0];
        payload.ferias_notificacao = aviso.toISOString().split('T')[0];
      } else if (field === 'ferias_vencimento') {
        const max = new Date(value + 'T12:00:00Z');
        const inicio = new Date(max); inicio.setDate(inicio.getDate() - 45);
        const aviso = new Date(inicio); aviso.setDate(aviso.getDate() - 30);

        payload.ferias_limite_entrada = inicio.toISOString().split('T')[0];
        payload.ferias_notificacao = aviso.toISOString().split('T')[0];
      }
    }

    await api.updateColab(colabId, payload);
    setColaboradores(prev => prev.map(c => c.id === colabId ? { ...c, ...payload } : c));
  };
`;
code = code.replace(regex, replacement);
fs.writeFileSync('src/app/ferias/page.tsx', code, 'utf8');
