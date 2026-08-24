const fs = require('fs');
const path = 'src/components/ocorrencias/TratamentoAtrasoWizard.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('SubstitutoAvancadoFlow')) {
  code = code.replace(
    /import \{ api, Colaborador, PostoDeTrabalho \} from '@\/services\/api';/,
    "import { api, Colaborador, PostoDeTrabalho } from '@/services/api';\nimport { SubstitutoAvancadoFlow } from './SubstitutoAvancadoFlow';"
  );
}

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

fs.writeFileSync(path, code, 'utf8');
