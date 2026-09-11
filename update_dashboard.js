const fs = require('fs');
const file = 'src/components/DashboardView.tsx';
let code = fs.readFileSync(file, 'utf8');

const backupButton = `
            <button onClick={() => {
              const pin = prompt('Digite o PIN de Admin para baixar o backup (Padrão: 123456):');
              if(pin) {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                window.open(\`\${API_URL}/upload/backup?pin=\${pin}\`, '_blank');
              }
            }} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
              <FileText className="w-4 h-4" /> Backup (ZIP)
            </button>
            <NovoServicoExtra />
`;

code = code.replace(
  /<NovoServicoExtra \/>/,
  backupButton
);

fs.writeFileSync(file, code, 'utf8');
console.log('done');
