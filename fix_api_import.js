const fs = require('fs');
let code = fs.readFileSync('src/components/ocorrencias/TrocaSetorWizard.tsx', 'utf8');
code = code.replace("import { api } from '../../lib/api';", "import { api } from '../../services/api';");
fs.writeFileSync('src/components/ocorrencias/TrocaSetorWizard.tsx', code, 'utf8');
