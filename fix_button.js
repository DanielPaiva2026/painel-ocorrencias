const fs = require('fs');
let code = fs.readFileSync('src/app/colaboradores/page.tsx', 'utf8');

const selectRegex = /<select \s+className="md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium\s+outline-none focus:border-brand-teal"\s+value=\{buscaCidade\}/m;

code = code.replace(
  selectRegex,
  `<button 
              onClick={() => setFiltroStatus(filtroStatus === 'ATIVO' ? 'INATIVO' : 'ATIVO')}
              className={\`md:w-32 px-4 py-3 rounded-xl font-bold text-sm transition-colors \${filtroStatus === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}
            >
              {filtroStatus}S
            </button>
            <select 
              className="md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium outline-none focus:border-brand-teal"
              value={buscaCidade}`
);

fs.writeFileSync('src/app/colaboradores/page.tsx', code, 'utf8');
console.log('done select button');
