const fs = require('fs');
const file = 'src/components/ocorrencias/TratamentoJornadaIncompletaWizard.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const [atestadoFile')) {
  code = code.replace(
    'const [enviouAtestado, setEnviouAtestado] = useState(false);',
    'const [enviouAtestado, setEnviouAtestado] = useState(false);\n  const [atestadoFile, setAtestadoFile] = useState<File | null>(null);'
  );
}

code = code.replace(
  'const handleSubmit = async () => {\n    setLoading(true);',
  'const handleSubmit = async () => {\n    setLoading(true);\n\n    let urlDocumento = null;\n    if (enviouAtestado && atestadoFile) {\n      const res = await api.uploadFile(atestadoFile);\n      if (res) urlDocumento = res.url;\n    }'
);

code = code.replace(
  'enviou_atestado: enviouAtestado,',
  'enviou_atestado: enviouAtestado,\n      url_documento: urlDocumento,'
);

const fileInput = `          </div>

          {enviouAtestado && (
            <div className="mt-2">
              <label className="text-xs font-medium text-slate-700 block mb-1">Anexar Arquivo:</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setAtestadoFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-cyan/10 file:text-brand-cyan hover:file:bg-brand-cyan/20" />
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">`;

code = code.replace(
  /          <\/div>\n\n          <div className="pt-2 border-t border-slate-100">/,
  fileInput
);

fs.writeFileSync(file, code, 'utf8');
console.log('done');
