const fs = require('fs');

let code = fs.readFileSync('src/app/colaboradores/page.tsx', 'utf8');

// 1. Inject imports
if (!code.includes('TrocaSetorWizard')) {
    code = code.replace(
        'import { Ocorrencia } from "@/types";\n',
        'import { Ocorrencia } from "@/types";\nimport { TrocaSetorWizard } from "@/components/ocorrencias/TrocaSetorWizard";\n'
    );
}

// 2. Inject states
if (!code.includes('isTrocaSetorOpen')) {
    code = code.replace(
        'const [isModalOpen, setIsModalOpen] = useState(false);',
        'const [isModalOpen, setIsModalOpen] = useState(false);\n  const [isTrocaSetorOpen, setIsTrocaSetorOpen] = useState(false);'
    );
}

// 3. Inject permission
if (!code.includes('canTrocaSetor')) {
    code = code.replace(
        "const canEditRegime = ['ADMIN', 'RH'].includes(userProfile.toUpperCase());",
        "const canEditRegime = ['ADMIN', 'RH'].includes(userProfile.toUpperCase());\n  const canTrocaSetor = ['ADMIN', 'COORDENADOR', 'COORDENADOR ADMINISTRATIVO', 'GERENTE', 'RH', 'DP'].includes(userProfile.toUpperCase());"
    );
}

// 4. Inject button
if (!code.includes('Troca de Setor')) {
    const btn_target = '<button \n              onClick={() => setIsModalOpen(true)}';
    const replacement = `{canTrocaSetor && (
              <button onClick={() => setIsTrocaSetorOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>
                Troca de Setor
              </button>
            )}
            <button \n              onClick={() => setIsModalOpen(true)}`;
    code = code.replace(btn_target, replacement);
}

// 5. Inject modal
if (!code.includes('<TrocaSetorWizard')) {
    const modal_target = '<ModalNovoColaborador \n        isOpen={isModalOpen}';
    const modal_replacement = `{isTrocaSetorOpen && (
        <TrocaSetorWizard 
          onClose={() => setIsTrocaSetorOpen(false)}
          onFinish={() => {
            setIsTrocaSetorOpen(false);
            loadColabs();
          }}
        />
      )}
      <ModalNovoColaborador \n        isOpen={isModalOpen}`;
    code = code.replace(modal_target, modal_replacement);
}

fs.writeFileSync('src/app/colaboradores/page.tsx', code, 'utf8');
