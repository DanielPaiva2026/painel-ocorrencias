const fs = require('fs');
let code = fs.readFileSync('src/app/colaboradores/page.tsx', 'utf8');

const regex = /(<option value="">Todas Fun\u00E7\u00F5es<\/option>[\s\S]*?<\/select>)/;

const appendHTML = `
            <select 
              className="md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium outline-none focus:border-brand-teal"
              value={buscaTipoContratacao}
              onChange={(e) => setBuscaTipoContratacao(e.target.value)}
            >
              <option value="">Tipos (Contratação)</option>
              {uniqueTiposContratacao.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>

            <select 
              className="md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium outline-none focus:border-brand-teal"
              value={buscaSituacao}
              onChange={(e) => setBuscaSituacao(e.target.value)}
            >
              <option value="">Todas Situações</option>
              <option value="Alocado">Alocado</option>
              <option value="Livre">Livre</option>
              <option value="INSS">INSS</option>
              <option value="Atestado">Atestado</option>
              <option value="Férias">Férias</option>
            </select>
`;

code = code.replace(regex, '$1\n' + appendHTML);
fs.writeFileSync('src/app/colaboradores/page.tsx', code, 'utf8');
