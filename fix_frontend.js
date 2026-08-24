const fs = require('fs');

// --- 1. Fix clientes/page.tsx ---
const clientesPath = 'src/app/clientes/page.tsx';
let clientesCode = fs.readFileSync(clientesPath, 'utf8');

// Replace Data Base 12x36 edit block
const dataBaseEditBlock = `
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Data Base Escala 12x36</label>
                              <input 
                                type="date" 
                                className="w-full text-xs p-1 border rounded" 
                                value={editPostoData.data_base_escala_12x36 ? editPostoData.data_base_escala_12x36.split('/').reverse().join('-') : ''} 
                                onChange={e => {
                                  const val = e.target.value;
                                  const formatted = val ? val.split('-').reverse().join('/') : '';
                                  setEditPostoData({...editPostoData, data_base_escala_12x36: formatted});
                                }} 
                              />
                            </div>
`;

const is12x36CheckEdit = `
                            {(posto.codigo.includes('-A') || posto.tipo_escala === 'A' || String(posto.tipo_escala).includes('12x36') || String(posto.descricao_escala).includes('12 por 36') || String(posto.descricao_escala).includes('12x36')) && (
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Data Base Escala 12x36</label>
                              <input 
                                type="date" 
                                className="w-full text-xs p-1 border rounded" 
                                value={editPostoData.data_base_escala_12x36 ? editPostoData.data_base_escala_12x36.split('/').reverse().join('-') : ''} 
                                onChange={e => {
                                  const val = e.target.value;
                                  const formatted = val ? val.split('-').reverse().join('/') : '';
                                  setEditPostoData({...editPostoData, data_base_escala_12x36: formatted});
                                }} 
                              />
                            </div>
                            )}
`;

clientesCode = clientesCode.replace(dataBaseEditBlock, is12x36CheckEdit);

// Replace Data Base 12x36 view block
const dataBaseViewBlock = `<p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Data Base 12x36:</span> {posto.data_base_escala_12x36 || 'Não configurada'}</p>`;

const is12x36CheckView = `{(posto.codigo.includes('-A') || posto.tipo_escala === 'A' || String(posto.tipo_escala).includes('12x36') || String(posto.descricao_escala).includes('12 por 36') || String(posto.descricao_escala).includes('12x36')) && (
                              <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Data Base 12x36:</span> {posto.data_base_escala_12x36 || 'Não configurada'}</p>
                            )}`;

// Because of unicode replacement, let's just do a regex
clientesCode = clientesCode.replace(/<p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Data Base 12x36:.*?<\/p>/, is12x36CheckView);

fs.writeFileSync(clientesPath, clientesCode, 'utf8');


// --- 2. Fix TratamentoAtrasoWizard.tsx ---
const atrasoPath = 'src/components/ocorrencias/TratamentoAtrasoWizard.tsx';
let atrasoCode = fs.readFileSync(atrasoPath, 'utf8');

if (!atrasoCode.includes('SubstitutoAvancadoFlow')) {
  atrasoCode = atrasoCode.replace(
    /import \{ api, Colaborador, PostoDeTrabalho \} from '@\/services\/api';/,
    "import { api, Colaborador, PostoDeTrabalho } from '@/services/api';\nimport { SubstitutoAvancadoFlow } from './SubstitutoAvancadoFlow';"
  );
}

// 2. Add handleSubmitComFlow
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

if (!atrasoCode.includes('handleSubmitComFlow')) {
   atrasoCode = atrasoCode.replace('const handleSubmit = async () => {', replacementFunc + '\n  const handleSubmit = async () => {');
}

// 3. Replace step 2's Candidates with step 3
// In AtrasoWizard, step === 2 && vaiPegarPosto === false has both Sancao and Candidates.
// We'll extract Sancao and replace Candidates with SubstitutoAvancadoFlow in Step 3!

// Find the candidates container inside step === 2 && vaiPegarPosto === false
const candRegex = /<div className="bg-amber-50 p-4 border border-amber-200 rounded-xl space-y-4">[\s\S]*?(?=<\/div>\s*<\/div>\s*\)\s*\}\s*<\/div>\s*\)\s*;)/;

const newStep3 = `
          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg">Voltar</button>
            <button onClick={() => setStep(3)} className="bg-brand-cyan hover:bg-brand-teal text-white px-5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
              Escolher Substituto <ArrowRight className="w-4 h-4" />
            </button>
          </div>
`;

atrasoCode = atrasoCode.replace(/<div className="bg-amber-50 p-4 border border-amber-200 rounded-xl space-y-4">[\s\S]*?(?=<\/div>\s*<\/div>\s*\)\s*\}\s*<\/div>\s*\)\s*;)/, newStep3);

const finalStep3Block = `{step === 3 && vaiPegarPosto === false && (
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

const closingParts = atrasoCode.split('</div>\n  );\n}');
if (closingParts.length > 1) {
   atrasoCode = closingParts[0] + finalStep3Block + '\n  </div>\n  );\n}';
}

fs.writeFileSync(atrasoPath, atrasoCode, 'utf8');

console.log('Done script');
