const fs = require('fs');
const path = 'src/components/ocorrencias/TratamentoAtrasoWizard.tsx';

let code = fs.readFileSync(path, 'utf8');

if (!code.includes('SubstitutoAvancadoFlow')) {
  code = code.replace(
    /import \{ api, Colaborador, PostoDeTrabalho \} from '@\/services\/api';/,
    "import { api, Colaborador, PostoDeTrabalho } from '@/services/api';\nimport { SubstitutoAvancadoFlow } from './SubstitutoAvancadoFlow';"
  );
}

// Add handleSubmitComFlow
let replacementFunc = `
  const handleSubmitComFlow = async (flowData: any) => {
    setLoading(true);
    let obsFinal = observacao;
    if (flowData.substitutosSelecionados.some((s: any) => s.gerar_extra)) {
       obsFinal += ' [Serviço Extra Gerado]';
    }

    const payload = {
      atrasado_colab_id: colab.id,
      posto_id: alocacaoAtual?.posto_id,
      vai_pegar_posto: false,
      sancao: sancaoSelecionada !== 'Nenhuma' ? sancaoSelecionada : null,
      observacao: obsFinal,
      origem_informacao: 'SISTEMA',
      motivo_falta: null,
      documento_exigido: false,
      documento_entregue: false,
      observacao_substituto: obsFinal,
      dias_afastamento: diasCobertura,
      is_afastamento_longo: false,
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

// Find step 2 logic.
// We need to replace the entire <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl space-y-4"> inside step === 2 && vaiPegarPosto === false
// Wait, the easier way is just to cut the file at step 2's end.

const step2Regex = /<div className="bg-amber-50 p-4 border border-amber-200 rounded-xl space-y-4">[\s\S]*?(?=<div className="flex gap-2 justify-end pt-4 border-t border-slate-100">)/;

const newStep2Bottom = `
          <div className="mt-4">
             <button onClick={() => setStep(3)} disabled={!sancaoSelecionada && !!sancaoData} className="bg-brand-cyan hover:bg-brand-teal text-white px-5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2">Próximo Passo <ArrowRight className="w-4 h-4" /></button>
          </div>
`;

code = code.replace(step2Regex, newStep2Bottom);

// Now we need to remove the old step 2 buttons:
const step2ButtonsRegex = /<div className="flex gap-2 justify-end pt-4 border-t border-slate-100">\s*<button onClick=\{\(\) => setStep\(1\)\}[\s\S]*?<\/div>/;
code = code.replace(step2ButtonsRegex, "");

// Now add Step 3 right before the final closing div
const step3Block = `
      {step === 3 && vaiPegarPosto === false && (
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
              <button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-700 text-sm font-bold bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">Voltar Passo Anterior</button>
           </div>
        </div>
      )}
`;

code = code.replace(/<\/div>\s*<\/div>\s*\)\s*\}\s*<\/div>\s*\)\s*;\s*\}\s*$/, `
        </div>
      )}
      ${step3Block}
    </div>
  );
}
`);

fs.writeFileSync(path, code, 'utf8');
