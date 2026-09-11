const fs = require('fs');
let code = fs.readFileSync('src/app/colaboradores/page.tsx', 'utf8');

if (!code.includes('isTrocaSetorOpen')) {
  const importRegex = /import \{ Colaborador \} from "\.\.\/\.\.\/types"/;
  code = code.replace(importRegex, `import { Colaborador } from "../../types";\nimport { TrocaSetorWizard } from "../../components/ocorrencias/TrocaSetorWizard";`);

  const stateRegex = /const \[isModalOpen, setIsModalOpen\] = useState\(false\)/;
  code = code.replace(stateRegex, `const [isModalOpen, setIsModalOpen] = useState(false);\n  const [isTrocaSetorOpen, setIsTrocaSetorOpen] = useState(false);`);

  const btnRegex = /const canEditRegime = \['ADMIN', 'RH'\].includes\(userProfile.toUpperCase\(\)\);/;
  code = code.replace(btnRegex, `const canEditRegime = ['ADMIN', 'RH'].includes(userProfile.toUpperCase());
  const canTrocaSetor = ['ADMIN', 'COORDENADOR', 'COORDENADOR ADMINISTRATIVO', 'GERENTE', 'RH', 'DP'].includes(userProfile.toUpperCase());`);

  const actionRegex = /<button \n\s*onClick=\{\(\) => setIsModalOpen\(true\)\}/;
  code = code.replace(actionRegex, `{canTrocaSetor && (
              <button onClick={() => setIsTrocaSetorOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>
                Troca de Setor
              </button>
            )}
            <button 
              onClick={() => setIsModalOpen(true)}`);

  const modalRegex = /\{isModalOpen && \(/;
  code = code.replace(modalRegex, `{isTrocaSetorOpen && (
        <TrocaSetorWizard 
          onClose={() => setIsTrocaSetorOpen(false)}
          onFinish={() => {
            setIsTrocaSetorOpen(false);
            loadColaboradores();
          }}
        />
      )}
      
      {isModalOpen && (`);

  fs.writeFileSync('src/app/colaboradores/page.tsx', code, 'utf8');
}
