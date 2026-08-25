const fs = require('fs');
const path = 'src/app/clientes/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update the setEditPostoData call in the Edit button
const oldSetEdit = `setEditPostoData({
                                    exige_nr32: posto.exige_nr32,
                                    exige_nr35: posto.exige_nr35,
                                    horas_diarias: posto.horas_diarias,
                                    categoria_posto: posto.categoria_posto || parsePostoTurnoCategoria(posto.codigo).funcao,
                                    data_base_escala_12x36: posto.data_base_escala_12x36 || ''
                                  });`;
                                  
const newSetEdit = `setEditPostoData({
                                    exige_nr32: posto.exige_nr32,
                                    exige_nr35: posto.exige_nr35,
                                    horas_diarias: posto.horas_diarias,
                                    categoria_posto: posto.categoria_posto || parsePostoTurnoCategoria(posto.codigo).funcao,
                                    data_base_escala_12x36: posto.data_base_escala_12x36 || '',
                                    tipo_escala: posto.tipo_escala || '',
                                    descricao_escala: posto.descricao_escala || ''
                                  });`;

code = code.replace(oldSetEdit, newSetEdit);

// 2. Replace the editing block
// We will replace from {editingPostoId === posto.id ? ( to ) : (

const oldEditBlockRegex = /\{editingPostoId === posto\.id \? \([\s\S]*?\) : \(/;

const newEditBlock = `{editingPostoId === posto.id ? (
                          <div className="space-y-3 mb-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Função</label>
                              <input 
                                type="text" 
                                className="w-full text-xs p-1 border rounded" 
                                value={editPostoData.categoria_posto || ''} 
                                onChange={e => setEditPostoData({...editPostoData, categoria_posto: e.target.value})} 
                              />
                            </div>
                            
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Escala</label>
                              <input 
                                type="text" 
                                className="w-full text-xs p-1 border rounded" 
                                value={editPostoData.tipo_escala || ''} 
                                onChange={e => setEditPostoData({...editPostoData, tipo_escala: e.target.value})}
                                placeholder="Ex: 12x36, 6x1, 5x2..."
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Detalhes da Escala</label>
                              <textarea 
                                className="w-full text-xs p-1 border rounded" 
                                value={editPostoData.descricao_escala || ''} 
                                onChange={e => setEditPostoData({...editPostoData, descricao_escala: e.target.value})}
                                placeholder="Ex: 12 por 36 - 08:00 às 20:00 - Intervalo: 00h - 01h..."
                                rows={2}
                              />
                            </div>

                            {(posto.codigo.includes('-A') || posto.tipo_escala === 'A' || String(posto.tipo_escala).includes('12x36') || String(posto.descricao_escala).includes('12 por 36') || String(posto.descricao_escala).includes('12x36') || String(editPostoData.tipo_escala).includes('12x36') || String(editPostoData.descricao_escala).includes('12x36')) && (
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

                            <div className="flex gap-4">
                              <label className="flex items-center gap-1 text-xs text-slate-700">
                                <input 
                                  type="checkbox" 
                                  checked={editPostoData.exige_nr32 || false} 
                                  onChange={e => setEditPostoData({...editPostoData, exige_nr32: e.target.checked})} 
                                /> Exige NR32
                              </label>
                              <label className="flex items-center gap-1 text-xs text-slate-700">
                                <input 
                                  type="checkbox" 
                                  checked={editPostoData.exige_nr35 || false} 
                                  onChange={e => setEditPostoData({...editPostoData, exige_nr35: e.target.checked})} 
                                /> Exige NR35
                              </label>
                            </div>
                            <div className="flex gap-2 justify-end mt-2">
                              <button onClick={() => setEditingPostoId(null)} className="text-[10px] px-2 py-1 bg-slate-200 rounded">Cancelar</button>
                              <button 
                                onClick={async () => {
                                  await api.updatePostoDeTrabalho(posto.id, editPostoData);
                                  setEditingPostoId(null);
                                  // Refresh manual simples
                                  const data = await api.getClientes();
                                  setClientes(data);
                                  setSelectedCliente(data.find((c: any) => c.id === selectedCliente.id) || null);
                                }} 
                                className="text-[10px] px-2 py-1 bg-brand-teal text-white rounded"
                              >
                                Salvar
                              </button>
                            </div>
                          </div>
                        ) : (`;

code = code.replace(oldEditBlockRegex, newEditBlock);

fs.writeFileSync(path, code, 'utf8');
