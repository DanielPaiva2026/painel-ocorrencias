const fs = require('fs');
const path = 'src/components/ocorrencias/SubstitutoAvancadoFlow.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Replace finalizarFluxoManual signature and body to accept nestedData
const oldFinalizar = `const finalizarFluxoManual = () => {
     if (!subManualId || !subManualCalculado) return;
     const payloadsSubs = [];
     const descontos = [];
     
     // 1. O Substituto principal (que cobrirá a falta) para todos os dias
     for(let i=0; i<diasCobertura; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        payloadsSubs.push({
           colab_id: subManualId,
           data: d.toISOString(),
           gerar_extra: subManualCalculado?.deFolga ? true : false
        });
     }

     // 2. O desconto se houver posto descoberto
     if (cobriraAssimMesmo && vaiMandarAlguemProPosto === false) {
        descontos.push({
           cliente_id: subManualCalculado.colab.alocacoes[0]?.posto?.cliente_id,
           posto_id: subManualCalculado.posto_id,
           colab_faltante_id: subManualId,
           data: new Date().toISOString(),
           motivo: 'Deslocado para cobrir outra falta',
           cliente_avisado: clienteAvisadoFalta || false
        });
     }

     onFinish({
       substitutosSelecionados: payloadsSubs,
       descontos_cliente: descontos
     });
  };`;

const newFinalizar = `const finalizarFluxoManual = (nestedData?: any) => {
     if (!subManualId || !subManualCalculado) return;
     const payloadsSubs: any[] = [];
     const descontos: any[] = [];
     
     // 1. O Substituto principal (que cobrirá a falta) para todos os dias
     for(let i=0; i<diasCobertura; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        payloadsSubs.push({
           colab_id: subManualId,
           data: d.toISOString(),
           gerar_extra: subManualCalculado?.deFolga ? true : false
        });
     }

     // 2. O desconto se houver posto descoberto
     if (cobriraAssimMesmo && vaiMandarAlguemProPosto === false) {
        descontos.push({
           cliente_id: subManualCalculado.colab.alocacoes[0]?.posto?.cliente_id,
           posto_id: subManualCalculado.posto_id,
           colab_faltante_id: subManualId,
           data: new Date().toISOString(),
           motivo: 'Deslocado para cobrir outra falta',
           cliente_avisado: clienteAvisadoFalta || false
        });
     }

     // 3. Anexa substituições e descontos aninhados (recursão)
     if (nestedData) {
        if (nestedData.substitutosSelecionados) {
           payloadsSubs.push(...nestedData.substitutosSelecionados);
        }
        if (nestedData.descontos_cliente) {
           descontos.push(...nestedData.descontos_cliente);
        }
     }

     onFinish({
       substitutosSelecionados: payloadsSubs,
       descontos_cliente: descontos
     });
  };`;

// Note: the regex replacement needs to handle the exact whitespace if possible, or we just replace the function block.
// To be safe, let's use replace by exact string matching but accounting for potential CRLF vs LF.
// Actually, string replacement is safer.
code = code.split('const finalizarFluxoManual = () => {').join('const finalizarFluxoManual = (nestedData?: any) => {');

// In case the manual block was already replaced, we will do a regex to replace the inside:
code = code.replace(/if \(!subManualId \|\| !subManualCalculado\) return;[\s\S]*?onFinish\(\{[\s\S]*?\}\);/m, `if (!subManualId || !subManualCalculado) return;
     const payloadsSubs: any[] = [];
     const descontos: any[] = [];
     
     for(let i=0; i<diasCobertura; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        payloadsSubs.push({
           colab_id: subManualId,
           data: d.toISOString(),
           gerar_extra: subManualCalculado?.deFolga ? true : false
        });
     }

     if (cobriraAssimMesmo && vaiMandarAlguemProPosto === false) {
        descontos.push({
           cliente_id: subManualCalculado.colab.alocacoes[0]?.posto?.cliente_id,
           posto_id: subManualCalculado.posto_id,
           colab_faltante_id: subManualId,
           data: new Date().toISOString(),
           motivo: 'Deslocado para cobrir outra falta',
           cliente_avisado: clienteAvisadoFalta || false
        });
     }

     if (nestedData) {
        if (nestedData.substitutosSelecionados) {
           payloadsSubs.push(...nestedData.substitutosSelecionados);
        }
        if (nestedData.descontos_cliente) {
           descontos.push(...nestedData.descontos_cliente);
        }
     }

     onFinish({
       substitutosSelecionados: payloadsSubs,
       descontos_cliente: descontos
     });`);


// 2. Replace the JSX block for vaiMandarAlguemProPosto === true
const oldJsx = `{vaiMandarAlguemProPosto === true && (
                            <div className="pt-2 border-t border-amber-200/50 animate-in fade-in space-y-3">
                               <p className="text-xs font-bold text-amber-900">Como você optou por cobrir também este posto, vamos focar agora apenas em registrar a falta atual do titular. Depois, volte ao painel para registrar a ausência de {subManualCalculado.colab.nome}.</p>
                               <button onClick={finalizarFluxoManual} className="w-full bg-brand-cyan hover:bg-brand-teal text-white font-bold py-2 rounded-lg text-sm transition-colors">Confirmar Substituto</button>
                            </div>
                         )}`;

// Note: unicode escaping might fail in node script if we use regex with the exact text, let's just find the block by regex.
const jsxRegex = /\{vaiMandarAlguemProPosto === true && \([\s\S]*?\}\)/;

const newJsx = `{vaiMandarAlguemProPosto === true && (
                            <div className="pt-4 border-t border-amber-200/50 animate-in fade-in">
                               <div className="bg-white p-4 rounded-lg border-2 border-dashed border-amber-300">
                                  <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                                     <User className="w-4 h-4" /> 
                                     Quem vai cobrir o posto de {subManualCalculado.colab.nome}?
                                  </h4>
                                  <SubstitutoAvancadoFlow 
                                     diasCobertura={diasCobertura}
                                     colabOriginal={subManualCalculado.colab}
                                     alocacaoAtual={subManualCalculado.colab.alocacoes?.[0]}
                                     exigeNR32={subManualCalculado.colab.alocacoes?.[0]?.posto?.exige_nr32}
                                     exigeNR35={subManualCalculado.colab.alocacoes?.[0]?.posto?.exige_nr35}
                                     onFinish={(nestedData) => finalizarFluxoManual(nestedData)}
                                  />
                               </div>
                            </div>
                         )}`;

code = code.replace(jsxRegex, newJsx);

fs.writeFileSync(path, code, 'utf8');
console.log('Script ran successfully');
