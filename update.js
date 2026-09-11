const fs = require('fs');

function update(file) {
  let code = fs.readFileSync(file, 'utf8');

  if (!code.includes('const [atestadoFile')) {
    code = code.replace(
      'const [documentoJaEnviado, setDocumentoJaEnviado] = useState(false);',
      'const [documentoJaEnviado, setDocumentoJaEnviado] = useState(false);\n  const [atestadoFile, setAtestadoFile] = useState<File | null>(null);'
    );
  }

  code = code.replace(
    'const handleSubmitComFlow = async (flowData: any) => {\n    setLoading(true);',
    'const handleSubmitComFlow = async (flowData: any) => {\n    setLoading(true);\n\n    let urlDocumento = null;\n    if (documentoJaEnviado && atestadoFile) {\n      const res = await api.uploadFile(atestadoFile);\n      if (res) urlDocumento = res.url;\n    }'
  );

  code = code.replace(
    /documento_entregue: documentoJaEnviado,\n\s*observacao_substituto: obsFinal,/,
    'documento_entregue: documentoJaEnviado,\n      url_documento: urlDocumento,\n      observacao_substituto: obsFinal,'
  );

  const fileInput = `O funcionário já enviou o documento agora?
                    </label>
                  )}

                  {documentoJaEnviado && (
                    <div className="mt-2">
                      <label className="text-xs font-medium text-slate-700 block mb-1">Anexar Arquivo:</label>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setAtestadoFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-cyan/10 file:text-brand-cyan hover:file:bg-brand-cyan/20" />
                    </div>
                  )}
`;

  code = code.replace(
    /O funcionário já enviou o documento agora\?\n\s*<\/label>\n\s*\)}/,
    fileInput
  );

  fs.writeFileSync(file, code, 'utf8');
}

update('src/components/ocorrencias/TratamentoFaltaWizard.tsx');
update('src/components/ocorrencias/TratamentoAusenciaWizard.tsx');
console.log('done');
