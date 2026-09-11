const fs = require('fs');
let code = fs.readFileSync('src/app/relatorios/page.tsx', 'utf8');

code = code.replace(
  /\{activeTab === 'extratos' && extratos && \(/,
  `{activeTab === 'extratos' && extratos && (
            <div className="bg-red-100 p-4 mb-4 rounded text-xs overflow-auto"><pre>{JSON.stringify(extratos, null, 2)}</pre></div>
          `
);

fs.writeFileSync('src/app/relatorios/page.tsx', code, 'utf8');
console.log('done debug');
