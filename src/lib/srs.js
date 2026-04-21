// Calcula a nova data de revisão baseada na resposta do usuário
// notas: 0 (Errei), 1 (Difícil), 2 (Bom), 3 (Fácil)

export function calcularProximaRevisao(cartao, qualidade) {
  let intervalo = cartao.interval || 0;
  let fatorFacilidade = cartao.ease_factor || 2.5;

  // Se errou (0), reseta o progresso
  if (qualidade === 0) {
    intervalo = 0; // Revisar hoje/agora (ou amanhã, dependendo da lógica desejada)
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

    // Ajuste fino do Fator de Facilidade
    // Fórmula mágica do SM-2: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
    // Adaptado para nossa escala de 0 a 3:
    // 1 (Difícil) -> subtrai do fator
    // 2 (Bom) -> mantém/leve aumento
    // 3 (Fácil) -> aumenta fator

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
