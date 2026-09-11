const fs = require('fs');
let code = fs.readFileSync('src/app/colaboradores/page.tsx', 'utf8');

const target = `            <button 
              onClick={() => setIsModalOpen(true)}`;

if (!code.includes('Troca de Setor</button>')) {
  code = code.replace(target, `{canTrocaSetor && (
              <button onClick={() => setIsTrocaSetorOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>
                Troca de Setor
              </button>
            )}
            <button 
              onClick={() => setIsModalOpen(true)}`);

  fs.writeFileSync('src/app/colaboradores/page.tsx', code, 'utf8');
}
