const fs = require('fs');
let code = fs.readFileSync('src/app/colaboradores/page.tsx', 'utf8');

code = code.replace(
  /Total: <span>\{colaboradores\.length\}<\/span>/,
  `Total: <span>{filteredColabs.length}</span>`
);

fs.writeFileSync('src/app/colaboradores/page.tsx', code, 'utf8');
console.log('done TOTAL filter');
