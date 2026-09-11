const fs = require('fs');
let code = fs.readFileSync('src/app/colaboradores/page.tsx', 'utf8');

code = code.replace(
  'const canEditContrato = [\'ADMIN\', \'RH\', \'DP\'].includes(userProfile.toUpperCase());',
  'const canEditContrato = [\'ADMIN\', \'RH\', \'DP\'].includes(userProfile.toUpperCase());\n  const canEditRegime = [\'ADMIN\', \'RH\'].includes(userProfile.toUpperCase());'
);

const rgxRegime = /<EditableField label=\"Regime de Contrata[^\"]+\" type=\"readonly\" value=\{selectedColab\.tipo_contratacao \|\| \'\'\} \/>/;
const newRegime = '<EditableField label="Regime de Contratação" type={canEditRegime ? \'select\' : \'readonly\'} options={[\'MENSALISTA\', \'HORISTA\', \'JOVEM APRENDIZ\', \'ESTAGIÁRIO\', \'INTERMITENTE\']} value={selectedColab.tipo_contratacao || \'\'} onChange={(v) => setSelectedColab({...selectedColab, tipo_contratacao: v})} onBlur={() => handleUpdateField(\'tipo_contratacao\', selectedColab.tipo_contratacao)} />';
code = code.replace(rgxRegime, newRegime);

const newHoras = '<EditableField label="Horas Contratadas" type={canEditRegime ? \'number\' : \'readonly\'} value={selectedColab.horas_contratadas} onChange={(v) => setSelectedColab({...selectedColab, horas_contratadas: v})} onBlur={() => handleUpdateField(\'horas_contratadas\', selectedColab.horas_contratadas)} />';

const rgxCondition = /\{selectedColab\.tipo_contratacao === \'HORISTA\' && \([\s\S]*?<EditableField label=\"Horas Contratadas\"[\s\S]*? \/>\s*\)\}/;
code = code.replace(rgxCondition, newHoras);

fs.writeFileSync('src/app/colaboradores/page.tsx', code, 'utf8');
