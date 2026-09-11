const fs = require('fs');
let code = fs.readFileSync('src/app/colaboradores/page.tsx', 'utf8');

code = code.replace(
  '  const [buscaFuncao, setBuscaFuncao] = useState(\'\');',
  '  const [buscaFuncao, setBuscaFuncao] = useState(\'\');\n  const [buscaTipoContratacao, setBuscaTipoContratacao] = useState(\'\');\n  const [buscaSituacao, setBuscaSituacao] = useState(\'\');'
);

code = code.replace(
  '    const matchFuncao = buscaFuncao ? col.categoria_cargo === buscaFuncao : true;',
  '    const matchFuncao = buscaFuncao ? col.categoria_cargo === buscaFuncao : true;\n    const matchTipoContratacao = buscaTipoContratacao ? col.tipo_contratacao === buscaTipoContratacao : true;\n    const situacaoMap = (disp, isAlocado) => {\n      const d = (disp || \'\').toLowerCase();\n      if (d.includes(\'inss\')) return \'INSS\';\n      if (d.includes(\'atestado\')) return \'Atestado\';\n      if (d.includes(\'férias\') || d.includes(\'ferias\')) return \'Férias\';\n      if (isAlocado) return \'Alocado\';\n      return \'Livre\';\n    };\n    const matchSituacao = buscaSituacao ? situacaoMap(col.situacao_disponibilidade, (col.alocacoes && col.alocacoes.length > 0)) === buscaSituacao : true;'
);

code = code.replace(
  'const isBuscaAtiva = buscaNome.length > 0 || buscaCidade.length > 0 || buscaFuncao.length > 0;',
  'const isBuscaAtiva = buscaNome.length > 0 || buscaCidade.length > 0 || buscaFuncao.length > 0 || buscaTipoContratacao.length > 0 || buscaSituacao.length > 0;'
);

code = code.replace(
  'return matchNome && matchCidade && matchFuncao && matchStatus;',
  'return matchNome && matchCidade && matchFuncao && matchStatus && matchTipoContratacao && matchSituacao;'
);

code = code.replace(
  'const uniqueFuncoes = Array.from(new Set(colaboradores.map(c => c.categoria_cargo).filter((c): c is string => !!c))).sort();',
  'const uniqueFuncoes = Array.from(new Set(colaboradores.map(c => c.categoria_cargo).filter((c): c is string => !!c))).sort();\n  const uniqueTiposContratacao = Array.from(new Set(colaboradores.map(c => c.tipo_contratacao).filter((c): c is string => !!c))).sort();'
);

// We replace the </select> of buscaFuncao and inject our new selects below it
code = code.replace(
  '{uniqueFuncoes.map(funcao => (\n                <option key={funcao} value={funcao}>{funcao}</option>\n              ))}\n            </select>',
  '{uniqueFuncoes.map(funcao => (\n                <option key={funcao} value={funcao}>{funcao}</option>\n              ))}\n            </select>\n\n            <select \n              className="md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium outline-none focus:border-brand-teal"\n              value={buscaTipoContratacao}\n              onChange={(e) => setBuscaTipoContratacao(e.target.value)}\n            >\n              <option value="">Tipos (Contratação)</option>\n              {uniqueTiposContratacao.map(tipo => (\n                <option key={tipo} value={tipo}>{tipo}</option>\n              ))}\n            </select>\n\n            <select \n              className="md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium outline-none focus:border-brand-teal"\n              value={buscaSituacao}\n              onChange={(e) => setBuscaSituacao(e.target.value)}\n            >\n              <option value="">Todas Situações</option>\n              <option value="Alocado">Alocado</option>\n              <option value="Livre">Livre</option>\n              <option value="INSS">INSS</option>\n              <option value="Atestado">Atestado</option>\n              <option value="Férias">Férias</option>\n            </select>'
);

fs.writeFileSync('src/app/colaboradores/page.tsx', code, 'utf8');
