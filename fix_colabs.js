const fs = require('fs');
let code = fs.readFileSync('src/app/colaboradores/page.tsx', 'utf8');

// 1. Add state
code = code.replace(
  /const \[buscaFuncao, setBuscaFuncao\] = useState\(''\);/,
  `const [buscaFuncao, setBuscaFuncao] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO');`
);

// 2. Update filteredColabs logic
const filterRegex = /const matchStatus = isBuscaAtiva \? true : isActive;/;
code = code.replace(
  filterRegex,
  `const matchStatus = filtroStatus === 'ATIVO' ? isActive : !isActive;`
);

// 3. Add toggle button
const selectRegex = /<select \n              className="md:w-48/;
code = code.replace(
  selectRegex,
  `<button 
              onClick={() => setFiltroStatus(filtroStatus === 'ATIVO' ? 'INATIVO' : 'ATIVO')}
              className={\`md:w-32 px-4 py-3 rounded-xl font-bold text-sm transition-colors \${filtroStatus === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}
            >
              {filtroStatus}S
            </button>
            <select 
              className="md:w-48`
);

// 4. Update the badge in the list
const badgeRegex = /<span className=\{\`inline-flex items-center px-2\.5 py-1 rounded-md text-\[11px\] font-bold border \$\{\!col\.situacao_disponibilidade \|\| col\.situacao_disponibilidade === 'Livre' \? 'bg-green-50 text-green-700 border-green-200' : col\.situacao_disponibilidade === 'Alocado' \? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'\}\`\}>\s*\{col\.situacao_disponibilidade \|\| 'Livre'\}\s*<\/span>/;

code = code.replace(
  badgeRegex,
  `<span className={\`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border \${(!col.situacao_disponibilidade || col.situacao_disponibilidade === 'Livre' || col.situacao_disponibilidade === 'Disponível') ? 'bg-green-50 text-green-700 border-green-200' : col.situacao_disponibilidade === 'Alocado' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}\`}>
                      {(!col.situacao_disponibilidade || col.situacao_disponibilidade === 'Disponível') ? 'Livre' : col.situacao_disponibilidade}
                    </span>`
);

fs.writeFileSync('src/app/colaboradores/page.tsx', code, 'utf8');
console.log('done');
