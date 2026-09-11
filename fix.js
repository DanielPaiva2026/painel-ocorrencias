const fs = require('fs');
let code = fs.readFileSync('src/components/ocorrencias/TratamentoJornadaIncompletaWizard.tsx', 'utf8');

code = code.replace(
  'enviou_atestado: enviouAtestado,\n      url_documento: urlDocumento,',
  'enviou_atestado: enviouAtestado,\n      url_documento: null,'
);

code = code.replace(
  /const payload = \{[\s\S]*?substituto_id:.*?,\n\s*\};/,
  `let urlDocumento = null;
    if (enviouAtestado && atestadoFile) {
      const res = await api.uploadFile(atestadoFile);
      if (res) urlDocumento = res.url;
    }
    
    const payload = {
      colab_id: colab.id,
      tipo_jornada: tipoJornada,
      tempo_minutos: Number(tempoMinutos),
      sancao: sancaoSelecionada,
      observacao: observacao,
      enviou_atestado: enviouAtestado,
      url_documento: urlDocumento,
      precisa_cobertura: precisaCobertura,
      substituto_id: precisaCobertura ? substitutoSelecionado : null,
    };`
);

code = code.replace(/setLoading\(true\);\s*let urlDocumento = null;\s*if \(enviouAtestado && atestadoFile\) \{\s*const res = await api\.uploadFile\(atestadoFile\);\s*if \(res\) urlDocumento = res\.url;\s*\}/, 'setLoading(true);');

fs.writeFileSync('src/components/ocorrencias/TratamentoJornadaIncompletaWizard.tsx', code, 'utf8');
console.log('fixed');
