const fs = require('fs');
let code = fs.readFileSync('src/components/ocorrencias/TratamentoFeriasWizard.tsx', 'utf8');

const regex = /onChange=\{e => setAquisitivo\(e\.target\.value\)\}/;
const replacement = `onChange={e => {
                const val = e.target.value;
                setAquisitivo(val);
                if (val) {
                  const d = new Date(val + 'T12:00:00Z');
                  const max = new Date(d); max.setDate(max.getDate() + 350);
                  const inicio = new Date(max); inicio.setDate(inicio.getDate() - 45);
                  const aviso = new Date(inicio); aviso.setDate(aviso.getDate() - 30);
                  setVencimento(max.toISOString().split('T')[0]);
                  setLimiteEntrada(inicio.toISOString().split('T')[0]);
                  setNotificacao(aviso.toISOString().split('T')[0]);
                }
              }}`;

const regex2 = /onChange=\{e => setVencimento\(e\.target\.value\)\}/;
const replacement2 = `onChange={e => {
                const val = e.target.value;
                setVencimento(val);
                if (val) {
                  const max = new Date(val + 'T12:00:00Z');
                  const inicio = new Date(max); inicio.setDate(inicio.getDate() - 45);
                  const aviso = new Date(inicio); aviso.setDate(aviso.getDate() - 30);
                  setLimiteEntrada(inicio.toISOString().split('T')[0]);
                  setNotificacao(aviso.toISOString().split('T')[0]);
                }
              }}`;

code = code.replace(regex, replacement).replace(regex2, replacement2);
fs.writeFileSync('src/components/ocorrencias/TratamentoFeriasWizard.tsx', code, 'utf8');
