const fs = require('fs');
let code = fs.readFileSync('src/app/ferias/page.tsx', 'utf8');
code = code.replace(
  "const formatDate = (d: Date) => d ? d.toISOString().split('T')[0] : null;",
  "const formatDate = (d: Date) => d ? d.toISOString().split('T')[0] : undefined;"
);
fs.writeFileSync('src/app/ferias/page.tsx', code, 'utf8');
