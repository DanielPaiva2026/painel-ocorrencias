export function parsePostoTurnoCategoria(codigo: string | undefined | null) {
  let funcao = '-';
  let turno = '-';
  if (!codigo) return { funcao, turno };

  const parts = codigo.split('-');
  if (parts.length >= 2) {
    const block = parts[1].trim();
    if (block.startsWith('P')) funcao = 'Portaria';
    else if (block.startsWith('L')) funcao = 'Limpeza';
    else if (block.startsWith('A')) funcao = 'Administrativo';
    else if (block.startsWith('R')) funcao = 'Recepção';

    if (block.length > 1) {
      const t = block[1];
      if (t === 'D') turno = 'Diurno';
      else if (t === 'N') turno = 'Noturno';
    }
  }
  return { funcao, turno };
}

export function parseTipoEscala(descricao: string | null | undefined) {
  if (!descricao) return '-';
  const lowerDesc = descricao.toLowerCase();
  
  if (lowerDesc.includes('12x36') || lowerDesc.includes('12 por 36')) {
    return '12x36';
  }
  if (lowerDesc.includes('6x1') || lowerDesc.includes('segunda a sabado') || lowerDesc.includes('segunda a sábado')) {
    return '6x1';
  }
  if (lowerDesc.includes('5x2') || lowerDesc.includes('segunda a sexta')) {
    return '5x2';
  }
  if (lowerDesc.includes('3 vezes') || lowerDesc.includes('3x') || lowerDesc.includes('segunda, quarta e sexta')) {
    return '3 vezes por semana';
  }
  
  return '-';
}
