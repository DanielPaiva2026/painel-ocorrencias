const fs = require('fs');

let filePaths = [
  'src/components/ocorrencias/TratamentoFaltaWizard.tsx',
  'src/components/ocorrencias/TratamentoAtrasoWizard.tsx',
  'src/components/ocorrencias/TratamentoAusenciaWizard.tsx'
];

filePaths.forEach(path => {
  if (fs.existsSync(path)) {
    let code = fs.readFileSync(path, 'utf8');
    
    if (!code.includes('SubstitutoAvancadoFlow')) {
      code = code.replace(
        /import \{ api \} from '@\/services\/api';/,
        "import { api } from '@/services/api';\nimport { SubstitutoAvancadoFlow } from './SubstitutoAvancadoFlow';"
      );
    }
    
    let replacementFunc = `
  const handleSubmitComFlow = async (flowData: any) => {
    setLoading(true);
    let obsFinal = obsSubstituto;
    if (flowData.substitutosSelecionados.some((s: any) => s.gerar_extra)) {
       obsFinal += ' [Serviço Extra Gerado]';
    }

    const payload = {
      atrasado_colab_id: colab.id,
      posto_id: alocacaoAtual?.posto_id,
      vai_pegar_posto: false,
      sancao: sancaoSelecionada !== 'Nenhuma' ? sancaoSelecionada : null,
      observacao: 'Falta/Ausência registrada.',
      origem_informacao: origem,
      motivo_falta: motivo,
      documento_exigido: exigeDoc,
      documento_entregue: documentoJaEnviado,
      observacao_substituto: obsFinal,
      dias_afastamento: diasCobertura,
      is_afastamento_longo: isAfastamentoLongo,
      substitutos: flowData.substitutosSelecionados,
      descontos_cliente: flowData.descontos_cliente,
      nome_titular: colab.nome,
    };

    const success = await api.registrarTratamentoAtraso(payload);
    setLoading(false);

    if (success) {
      onSuccess();
    } else {
      alert('Falha ao registrar tratamento de ocorrência.');
    }
  };
`;

    if (!code.includes('handleSubmitComFlow')) {
       code = code.replace('const handleSubmit = async () => {', replacementFunc + '\n  const handleSubmit = async () => {');
    }
    
    // Replace the step 4 block specifically for TratamentoFaltaWizard
    if (path.includes('FaltaWizard')) {
        const step4regex = /\{\s*step\s*===\s*4\s*&&\s*\([\s\S]*?(?=<div className="flex justify-between pt-6 border-t border-slate-100 mt-6">)/;
        const newStep4 = `{step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <SubstitutoAvancadoFlow 
                 diasCobertura={diasCobertura} 
                 colabOriginal={colab} 
                 alocacaoAtual={alocacaoAtual} 
                 exigeNR32={exigeNR32} 
                 exigeNR35={exigeNR35} 
                 onFinish={(flowData: any) => handleSubmitComFlow(flowData)}
             />
             <div className="pt-4 border-t border-slate-100 flex justify-start">
                <button onClick={() => setStep(3)} className="text-slate-500 hover:text-slate-700 text-sm font-bold bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">Voltar Passo Anterior</button>
             </div>
          </div>
        )}
        
        `;
        code = code.replace(step4regex, newStep4);
        
        // Hide normal buttons on step 4
        code = code.replace(/<div className="flex justify-between pt-6 border-t border-slate-100 mt-6">/, `{step !== 4 && (<div className="flex justify-between pt-6 border-t border-slate-100 mt-6">`);
        const btnEndRegex = /(<button onClick=\{handleSubmit\}[^>]*>[\s\S]*?<\/button>\s*<\/div>)/;
        code = code.replace(btnEndRegex, "$1\n        )}");
    }

    fs.writeFileSync(path, code, 'utf8');
  }
});
