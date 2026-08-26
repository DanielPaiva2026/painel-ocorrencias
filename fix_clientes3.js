const fs = require('fs');
const path = 'src/app/clientes/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /onClick=\{\(\) => \{\s*setEditingPostoId\(posto\.id\);\s*setEditPostoData\(\{\s*exige_nr32: posto\.exige_nr32,\s*exige_nr35: posto\.exige_nr35,\s*horas_diarias: posto\.horas_diarias,\s*categoria_posto: posto\.categoria_posto \|\| parsePostoTurnoCategoria\(posto\.codigo\)\.funcao,\s*data_base_escala_12x36: posto\.data_base_escala_12x36 \|\| ''\s*\}\);\s*\}\}/;

const replacementStr = `onClick={() => {
                                  setEditingPostoId(posto.id);
                                  setEditPostoData({
                                    exige_nr32: posto.exige_nr32,
                                    exige_nr35: posto.exige_nr35,
                                    horas_diarias: posto.horas_diarias,
                                    categoria_posto: posto.categoria_posto || parsePostoTurnoCategoria(posto.codigo).funcao,
                                    data_base_escala_12x36: posto.data_base_escala_12x36 || '',
                                    tipo_escala: posto.tipo_escala || '',
                                    descricao_escala: posto.descricao_escala || ''
                                  });
                                }}`;

if (regex.test(code)) {
  code = code.replace(regex, replacementStr);
  fs.writeFileSync(path, code, 'utf8');
  console.log('Successfully updated!');
} else {
  console.log('Target string not found. Please check manually.');
}
