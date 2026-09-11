const fs = require('fs');
let code = fs.readFileSync('src/app/relatorios/page.tsx', 'utf8');

const regex = /<div className="bg-slate-50 border border-slate-200 rounded-xl p-5">[\s\S]*?<p className="text-3xl font-black text-brand-teal">\{extratos\.disponibilidade\.colabsLivres\}<\/p>\s*<\/div>/;

const replacement = `<div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Postos de Trabalho</p>
                  <p className="text-3xl font-black text-slate-800">{extratos.vagas.totalPostos}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Colabs. Ativos</p>
                  <p className="text-3xl font-black text-emerald-800">{extratos.vagas.colabsAtivos}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Colabs. Alocados</p>
                  <p className="text-3xl font-black text-amber-800">{extratos.vagas.colabsAlocados}</p>
                </div>
                <div className="bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl p-5">
                  <p className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">Colabs. Livres</p>
                  <p className="text-3xl font-black text-brand-teal">{extratos.vagas.colabsLivres}</p>
                </div>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/app/relatorios/page.tsx', code, 'utf8');
console.log('done frontend');
