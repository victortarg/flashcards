// Calcula a nova data de revisão baseada na resposta do usuário
// notas: 0 (Errei), 1 (Difícil), 2 (Bom), 3 (Fácil)

/**
 * @param {{ interval?: number | null, ease_factor?: number | null }} cartao
 * @param {number} qualidade
 */
export function calcularProximaRevisao(cartao, qualidade) {
  let intervalo = cartao.interval || 0;
  let fatorFacilidade = cartao.ease_factor || 2.5;

  // Se errou (0), reseta o progresso
  if (qualidade === 0) {
    intervalo = 0;
    // Não mudamos o fator de facilidade drasticamente no erro para não punir demais
  } else {
    // Lógica SM-2 Simplificada
    if (intervalo === 0) {
      intervalo = 1;
    } else if (intervalo === 1) {
      intervalo = 3;
    } else {
      intervalo = Math.round(intervalo * fatorFacilidade);
    }

    // Ajuste fino do Fator de Facilidade (SM-2 adaptado para a escala de 0 a 3)
    if (qualidade === 1) fatorFacilidade -= 0.2; // Ficou mais difícil
    if (qualidade === 2) fatorFacilidade += 0.0; // Manteve
    if (qualidade === 3) fatorFacilidade += 0.15; // Ficou mais fácil

    if (fatorFacilidade < 1.3) fatorFacilidade = 1.3; // Limite mínimo
  }

  // Calcula a data futura
  const proximaData = new Date();
  proximaData.setDate(proximaData.getDate() + intervalo);

  return {
    next_review: proximaData.toISOString(),
    interval: intervalo,
    ease_factor: fatorFacilidade,
  };
}

/**
 * Cartão novo (sem data) ou com revisão vencida.
 * @param {{ next_review?: string | null }} cartao
 * @param {Date} [agora]
 */
export function estaPendente(cartao, agora = new Date()) {
  if (!cartao.next_review) return true;
  return new Date(cartao.next_review) <= agora;
}

/**
 * Texto curto do próximo intervalo, mostrado embaixo de cada botão de resposta.
 * @param {number} dias
 */
export function descreverIntervalo(dias) {
  if (dias <= 0) return "hoje";
  if (dias === 1) return "1 dia";
  if (dias < 30) return `${dias} dias`;
  const meses = Math.round(dias / 30);
  if (meses < 12) return meses === 1 ? "1 mês" : `${meses} meses`;
  const anos = Math.round(dias / 365);
  return anos === 1 ? "1 ano" : `${anos} anos`;
}
