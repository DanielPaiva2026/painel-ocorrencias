const fs = require('fs');
const path = 'src/components/ocorrencias/TratamentoAtrasoWizard.tsx';

let code = fs.readFileSync(path, 'utf8');

if (!code.includes('SubstitutoAvancadoFlow')) {
  code = code.replace(
    /import \{ api, Colaborador, PostoDeTrabalho \} from '@\/services\/api';/,
    "import { api, Colaborador, PostoDeTrabalho } from '@/services/api';\nimport { SubstitutoAvancadoFlow } from './SubstitutoAvancadoFlow';"
  );
}

const newStep3 = `{step === 3 && vaiPegarPosto === false && (
  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
     <SubstitutoAvancadoFlow 
         diasCobertura={diasCobertura} 
         colabOriginal={colab} 
         alocacaoAtual={alocacaoAtual} 
         exigeNR32={exigeNR32} 
         exigeNR35={exigeNR35} 
         onFinish={(flowData) => handleSubmitComFlow(flowData)}
     />
     <div className="pt-4 border-t border-slate-100 flex justify-start">
        <button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-700 text-sm font-bold bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">Voltar Passo Anterior</button>
     </div>
  </div>
)}
`;

const parts = code.split('{step === 3 && vaiPegarPosto === false && (');
if (parts.length > 1) {
   let p2 = parts[1];
   let endIdx = p2.lastIndexOf(')}');
   let remaining = p2.substring(endIdx + 2);
   code = parts[0] + newStep3 + remaining;
   fs.writeFileSync(path, code, 'utf8');
   console.log('Successfully replaced step 3');
} else {
   console.log('Could not find step 3');
}
