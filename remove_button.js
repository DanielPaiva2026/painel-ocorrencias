const fs = require('fs');
let code = fs.readFileSync('src/app/ferias/page.tsx', 'utf8');

const regex = /\{canEditDatas && \(\s*<button onClick=\{handleAutoCalcularTodas\}[^>]*>\s*Auto-Corrigir Datas \(Massa\)\s*<\/button>\s*\)\}/;
code = code.replace(regex, '');

fs.writeFileSync('src/app/ferias/page.tsx', code, 'utf8');
