const fs = require('fs');
const path = 'src/components/ocorrencias/TratamentoAusenciaWizard.tsx';

let code = fs.readFileSync(path, 'utf8');

// 1. Add import
if (!code.includes('SubstitutoAvancadoFlow')) {
  code = code.replace(
    /import \{ api, Colaborador, PostoDeTrabalho \} from '@\/services\/api';/,
    "import { api, Colaborador, PostoDeTrabalho } from '@/services/api';\nimport { SubstitutoAvancadoFlow } from './SubstitutoAvancadoFlow';"
  );
}

// 2. Add handleSubmitComFlow
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
      observacao: \`Ausência (\${motivo}).\`,
      origem_informacao: origem,
      motivo_falta: motivo,
      documento_exigido: exigeDoc,
      documento_entregue: documentoJaEnviado,
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

// 3. Replace step 4
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

const parts = code.split('{step === 4 && (');
if (parts.length > 1) {
   let p2 = parts[1];
   let endIdx = p2.lastIndexOf(')}');
   let remaining = p2.substring(endIdx + 2);
   code = parts[0] + newStep4 + remaining;
}

fs.writeFileSync(path, code, 'utf8');
