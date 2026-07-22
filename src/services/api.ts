const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://app.alpiserra.com.br/backend';

export type Colaborador = {
  id: string;
  nome: string;
  papel: string;
  endereco: string;
  turno_base: string;
  status_cadastro: string | null;
  tipo_contratacao: string | null;
  horas_contratadas: string | null;
  categoria_cargo: string | null;
  cargo_alterdata: string | null;
  matricula: string | null;
  ctps: string | null;
  localizacao: string | null;
  sub_local: string | null;
  admissao: string | null;
  experiencia_1: string | null;
  experiencia_2: string | null;
  situacao_disponibilidade: string | null;
  justificativa_inativo?: string;
  data_retorno?: string;
  observacao_retorno?: string;
  ferias_ultimo_aquisitivo?: string;
  ferias_notificacao?: string;
  ferias_limite_entrada?: string;
  ferias_retorno?: string;
  ferias_vencimento?: string;
  [key: string]: any; // Allow other properties
  // Novos campos
  rg?: string | null;
  cpf?: string | null;
  telefone_principal?: string | null;
  is_whatsapp?: boolean;
  telefone_secundario?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  contrato_experiencia_dias?: number | null;
  manual_conduta_data?: string | null;
  manual_conduta_reciclagem?: string | null;
  seguranca_medicina_data?: string | null;
  seguranca_medicina_reciclagem?: string | null;
  treino_basico_data?: string | null;
  treino_basico_reciclagem?: string | null;

  data_integracao: string | null;
  reciclagem_integracao: string | null;
  data_nr32: string | null;
  reciclagem_nr32: string | null;
  data_nr35: string | null;
  reciclagem_nr35: string | null;
  data_aso: string | null;
  reciclagem_aso: string | null;
  exame_complementar_data?: string | null;
  exame_complementar_retorno?: string | null;
  criado_em: string;
  alocacoes?: Alocacao[];
  ocorrencias?: Ocorrencia[];
};

export type PostoDeTrabalho = {
  id: string;
  codigo: string;
  categoria_posto: string | null;
  turno: string | null;
  tipo_escala: string | null;
  descricao_escala: string | null;
  horas_diarias: string | null;
  exige_nr32?: boolean;
  exige_nr35?: boolean;
  alocacoes?: Alocacao[];
  cliente?: Cliente;
};

export type PostoParaAlocacao = PostoDeTrabalho & {
  mesma_cidade: boolean;
  mesma_funcao: boolean;
  horas_compativeis: boolean;
  alerta_nr: string | null;
  ocupantes_atuais: { id: string, nome: string }[];
  score: number;
};

export type Alocacao = {
  id: string;
  posto_id: string;
  colab_id: string;
  colab?: Colaborador;
  posto?: PostoDeTrabalho;
};

export type Cliente = {
  id: string;
  status: string | null;
  codigo: string | null;
  nome_razao: string;
  responsavel: string | null;
  telefone: string | null;
  cidade: string | null;
  cep: string;
  endereco: string;
  supervisor: string | null;
  quant_pessoas: string | null;
  quant_rotinas: string | null;
  ranking_financeiro: string | null;
  periodicidade_visita: string | null;
  status_contrato: string | null;
  observacao: string | null;
  razao_social: string | null;
  cnpj: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  uf: string | null;
  criado_em: string;
  postos_de_trabalho?: PostoDeTrabalho[];
};

export type Ocorrencia = {
  id: string;
  colab_id: string;
  tipo: string;
  data: string;
  tempo_minutos: number | null;
  observacao: string | null;
  resolvido: boolean;
  documento_exigido?: boolean;
  documento_entregue?: boolean;
  criado_em: string;
  colab?: {
    nome: string;
    papel: string;
    turno_base: string;
  }
};

export type Afastamento = {
  id: string;
  colab_id: string;
  motivo: string;
  data_inicio: string;
  data_fim: string | null;
  data_retorno_prevista: string;
  observacao: string | null;
  criado_em: string;
  colab?: {
    nome: string;
    papel: string;
  }
};

export type ColabLivre = {
  id: string;
  nome: string;
  tipo_contratacao: string;
  horas_contratadas: string | null;
  turno_base: string;
  horasRestantes: number;
  status: string;
  alocacoes: Alocacao[];
};

export type Substituto = {
  id: string;
  nome: string;
  papel: string;
  turno_base: string;
  situacao_disponibilidade: string;
  tipoDisponibilidade: string;
  prioridade: number;
  horasRestantes: number;
  scoreDistancia: number;
  alocacoesCount: number;
  tem_nr32: boolean;
  tem_nr35: boolean;
  tipo_contratacao: string;
  alocacao_posto_id?: string;
  alocacao_posto_nome?: string;
};

export type DashboardStats = {
  alertasDocumentos?: any[];
  hoje: {
    ocorrenciasRecentes: Ocorrencia[];
    stats: {
      atrasos: number;
      faltas: number;
      afastados: number;
      resolvidas: number;
    }
  },
  semana: {
    ocorrenciasRecentes: Ocorrencia[];
    stats: {
      atrasos: number;
      faltas: number;
      afastados: number;
      resolvidas: number;
    }
  },
  mes: {
    ocorrenciasRecentes: Ocorrencia[];
    stats: {
      atrasos: number;
      faltas: number;
      afastados: number;
      resolvidas: number;
    }
  };
  pendenciasFerias?: any[];
  alertasTransferencia?: any[];
  avisosRetorno?: any[];
  colaboradoresEmFerias?: any[];
  coberturasAtivas?: any[];
};

export const api = {
  getOcorrencias: async (): Promise<Ocorrencia[]> => {
    try {
      const res = await fetch(`${API_URL}/ocorrencias`, { 
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Falha ao buscar ocorrências');
      return res.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  
  getColabs: async (): Promise<Colaborador[]> => {
    try {
      const res = await fetch(`${API_URL}/colabs`, { cache: 'no-store' });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  updateColabStatus: async (id: string, status: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/colabs/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  updateColab: async (id: string, data: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/colabs/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  createColab: async (data: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/colabs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  uploadColabsCsv: async (file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/colabs/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Falha no upload do CSV');
      return res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  getClientes: async (): Promise<Cliente[]> => {
    const res = await fetch(`${API_URL}/clientes`);
    if (!res.ok) throw new Error('Falha ao buscar clientes');
    return res.json();
  },

  previewContrato: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_URL}/clientes/preview-contrato`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Falha ao processar o contrato. Verifique o arquivo e tente novamente.');
    }
    return res.json();
  },

  confirmarContrato: async (data: any) => {
    const res = await fetch(`${API_URL}/clientes/confirmar-contrato`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Falha ao salvar o contrato.');
    }
    return res.json();
  },

  updateCliente: async (id: string, data: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/clientes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  getAlocacoes: async () => {
    try {
      const res = await fetch(`${API_URL}/alocacoes`, { cache: 'no-store' });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  createOcorrencia: async (data: any) => {
    const res = await fetch(`${API_URL}/ocorrencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  },

  async createOcorrenciaCliente(data: any) {
    // Para simplificar, usamos o mesmo endpoint pois a API aceita data genérica
    const res = await fetch(`${API_URL}/ocorrencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  },

  anexarDocumento: async (id: string, urlDocumento: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/ocorrencias/${id}/documento`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlDocumento }),
      });
      return res.ok;
    } catch (error) {
      console.error('Erro ao anexar documento:', error);
      return false;
    }
  },

  updatePostoDeTrabalho: async (id: string, data: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/postos-de-trabalho/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch (error) {
      console.error('Erro ao atualizar posto:', error);
      return false;
    }
  },

  converterFaltaInjustificada: async (id: string, sancao: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/ocorrencias/${id}/converter-injustificada`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sancao }),
      });
      return res.ok;
    } catch (error) {
      console.error('Erro ao converter falta:', error);
      return false;
    }
  },
  
  resolverOcorrencia: async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/ocorrencias/${id}/resolver`, {
        method: 'PATCH',
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  getDashboardStats: async (): Promise<DashboardStats | null> => {
    try {
      const res = await fetch(`${API_URL}/dashboard/today`, { cache: 'no-store' });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  getLivres: async (): Promise<ColabLivre[]> => {
    try {
      const res = await fetch(`${API_URL}/disponibilidade/livres`, { cache: 'no-store' });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  getAfastamentos: async (): Promise<Afastamento[]> => {
    try {
      const res = await fetch(`${API_URL}/afastamentos`, { cache: 'no-store' });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  createAfastamento: async (data: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/afastamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  getSubstitutos: async (postoId?: string, papel?: string, data?: string, exige_nr32?: boolean, exige_nr35?: boolean): Promise<Substituto[]> => {
    try {
      const params = new URLSearchParams();
      if (postoId) params.append('posto_id', postoId);
      if (papel) params.append('papel', papel);
      if (data) params.append('data', data);
      if (exige_nr32) params.append('exige_nr32', 'true');
      if (exige_nr35) params.append('exige_nr35', 'true');
      
      const res = await fetch(`${API_URL}/disponibilidade/substitutos?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  getSancaoSugerida: async (colabId: string, tipo: string): Promise<any> => {
    try {
      const params = new URLSearchParams({ colab_id: colabId, tipo });
      const res = await fetch(`${API_URL}/ocorrencias/sancao-sugerida?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  registrarTratamentoAtraso: async (data: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/ocorrencias/tratamento/atraso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  registrarTratamentoJornadaIncompleta: async (data: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/ocorrencias/tratamento/jornada-incompleta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  updateOcorrencia: async (id: string, data: any, pin: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/ocorrencias/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, pin }),
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  deleteOcorrencia: async (id: string, pin: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/ocorrencias/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  getPostosParaAlocacao: async (colabId: string): Promise<PostoParaAlocacao[]> => {
    try {
      const res = await fetch(`${API_URL}/postos-de-trabalho/para-alocacao/${colabId}`, { cache: 'no-store' });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  realizarAlocacaoManual: async (payload: { colabId: string, postoId: string, acao_ocupante_atual?: string }): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/alocacoes/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  createAvisoFerias: async (data: { colab_id: string, data_aviso: string, dias_ferias: number, dias_venda: number }): Promise<any> => {
    try {
      const res = await fetch(`${API_URL}/ferias/aviso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Falha ao criar aviso de férias');
      return res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  uploadDocumentoFerias: async (avisoId: string, urlDocumento: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/ferias/aviso/${avisoId}/documento`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url_documento: urlDocumento }),
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  createCoberturaFerias: async (avisoId: string, data: { posto_id: string, colab_substituto_id: string, colab_substituido_id?: string }): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/ferias/aviso/${avisoId}/cobertura`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  decisaoRetornoFerias: async (avisoId: string, retorna: boolean): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/ferias/aviso/${avisoId}/decisao-retorno`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retorna }),
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  createClienteSimplificado: async (data: { nome_razao: string, telefone?: string, cidade?: string }): Promise<any> => {
    try {
      const res = await fetch(`${API_URL}/clientes/simplificado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Falha ao criar cliente simplificado');
      return res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  createServicoExtra: async (data: any): Promise<any> => {
    try {
      const res = await fetch(`${API_URL}/servicos-extras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Falha ao criar serviço extra');
      return res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  alocarServicoExtra: async (servicoId: string, colabIds: string[]): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/servicos-extras/${servicoId}/alocar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colabIds }),
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  // Usuários (Apenas Admin)
  getUsuarios: async () => {
    const res = await fetch(`${API_URL}/usuarios`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    });
    if (!res.ok) throw new Error('Falha ao buscar usuários');
    return res.json();
  },

  createUsuario: async (data: any) => {
    const res = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao criar usuário');
    return res.json();
  },

  deleteUsuario: async (id: string) => {
    const res = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    });
    return res.ok;
  },

  trocarSenha: async (novaSenha: string) => {
    const res = await fetch(`${API_URL}/auth/trocar-senha`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ novaSenha }),
    });
    return res.ok;
  },

  // ===============================
  // Relatórios e Alertas
  // ===============================

  getRelatorioVencimentos: async (): Promise<any[]> => {
    const res = await fetch(`${API_URL}/relatorios/vencimentos`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } });
    if (!res.ok) throw new Error('Falha ao buscar alertas de vencimentos');
    return res.json();
  },

  getRelatorioFerias: async (): Promise<any> => {
    const res = await fetch(`${API_URL}/relatorios/ferias`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } });
    if (!res.ok) throw new Error('Falha ao buscar alertas de férias');
    return res.json();
  },

  getRelatorioInconsistencias: async (): Promise<any[]> => {
    const res = await fetch(`${API_URL}/relatorios/inconsistencias`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } });
    if (!res.ok) throw new Error('Falha ao buscar inconsistências');
    return res.json();
  },

  getRelatorioExtratos: async (): Promise<any> => {
    const res = await fetch(`${API_URL}/relatorios/extratos`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } });
    if (!res.ok) throw new Error('Falha ao buscar extratos gerenciais');
    return res.json();
  },

  // ===============================
  // Tratamento de Atestados
  // ===============================

  getPendenciasDocumentos: async (): Promise<any[]> => {
    const res = await fetch(`${API_URL}/ocorrencias/pendencias-documentos`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } });
    if (!res.ok) throw new Error('Falha ao buscar pendências');
    return res.json();
  },

  resolverPendenciaDocumento: async (id: string, sancao: string, entregouDocumento: boolean = false): Promise<boolean> => {
    const res = await fetch(`${API_URL}/ocorrencias/${id}/resolver-pendencia`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ sancao, entregou_documento: entregouDocumento })
    });
    return res.ok;
  }
};
