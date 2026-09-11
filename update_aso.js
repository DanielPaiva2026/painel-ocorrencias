const fs = require('fs');
const file = 'src/app/colaboradores/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const asoUploadComponent = `
                               <EditableField label="Retorno (+365 Dias)" type="readonly" value={selectedColab.reciclagem_aso} />
                             </div>
                             
                             {canEditTreinamento && (
                               <div className="mt-2 pt-2 border-t border-slate-100">
                                 <label className="text-xs font-bold text-slate-400 uppercase">Anexar ASO (PDF/Img)</label>
                                 <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={async (e) => {
                                   const f = e.target.files?.[0];
                                   if(f) {
                                     const r = await api.uploadFile(f);
                                     if(r) handleTreinamentoChange('url_aso', r.url);
                                   }
                                 }} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-brand-cyan/10 file:text-brand-cyan hover:file:bg-brand-cyan/20" />
                               </div>
                             )}
                             {selectedColab.url_aso && !canEditTreinamento && (
                               <a href={'http://localhost:3000'+selectedColab.url_aso} target="_blank" className="text-xs text-blue-500 underline mt-1 block">Ver ASO Anexado</a>
                             )}
                           </div>
`;

code = code.replace(
  /<div className="mt-2"><EditableField label="Retorno \(\+365 Dias\)" type="readonly" value=\{selectedColab.reciclagem_aso\} \/><\/div>\n\s*<\/div>/,
  asoUploadComponent
);

const exameUploadComponent = `
                               <EditableField label="Retorno (+2 Anos)" type="readonly" value={selectedColab.exame_complementar_retorno} />
                               </div>
                               
                               {canEditTreinamento && (
                                 <div className="mt-2 pt-2 border-t border-slate-100">
                                   <label className="text-xs font-bold text-slate-400 uppercase">Anexar Exame (PDF/Img)</label>
                                   <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={async (e) => {
                                     const f = e.target.files?.[0];
                                     if(f) {
                                       const r = await api.uploadFile(f);
                                       if(r) handleTreinamentoChange('url_exame_complementar', r.url);
                                     }
                                   }} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-brand-cyan/10 file:text-brand-cyan hover:file:bg-brand-cyan/20" />
                                 </div>
                               )}
                               {selectedColab.url_exame_complementar && !canEditTreinamento && (
                                 <a href={'http://localhost:3000'+selectedColab.url_exame_complementar} target="_blank" className="text-xs text-blue-500 underline mt-1 block">Ver Exame Anexado</a>
                               )}
                              </div>
`;

code = code.replace(
  /<div className="mt-2"><EditableField label="Retorno \(\+2 Anos\)" type="readonly" value=\{selectedColab.exame_complementar_retorno\} \/><\/div>\n\s*<\/div>/,
  exameUploadComponent
);

// We need to use process.env.NEXT_PUBLIC_API_URL instead of localhost for the file URL
code = code.replace(/http:\/\/localhost:3000/g, '${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:3000\'}');

fs.writeFileSync(file, code, 'utf8');
console.log('done');
