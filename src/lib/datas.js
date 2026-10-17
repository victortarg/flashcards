const relativo = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
const DIA = 24 * 60 * 60 * 1000;

/**
 * Situação de revisão de um cartão, em texto curto.
 * @param {{ next_review: string | null }} cartao
 * @returns {{ texto: string, pendente: boolean }}
 */
export function situacaoRevisao(cartao) {
  if (!cartao.next_review) return { texto: "Novo", pendente: true };

  const diferenca = new Date(cartao.next_review).getTime() - Date.now();
  if (diferenca <= 0) return { texto: "Para hoje", pendente: true };

  const dias = Math.max(1, Math.round(diferenca / DIA));
  if (dias < 30) return { texto: `Volta ${relativo.format(dias, "day")}`, pendente: false };
  const meses = Math.round(dias / 30);
  if (meses < 12) return { texto: `Volta ${relativo.format(meses, "month")}`, pendente: false };
  return { texto: `Volta ${relativo.format(Math.round(dias / 365), "year")}`, pendente: false };
}

/**
 * "amanhã", "em 3 dias"... para a próxima revisão de um baralho.
 * @param {string} data
 */
export function quandoVolta(data) {
  const dias = Math.max(1, Math.round((new Date(data).getTime() - Date.now()) / DIA));
  return relativo.format(dias, "day");
}

/** Remove acentos e caixa para a busca de cartões. */
export function normalizar(/** @type {string | null | undefined} */ texto) {
  return (texto ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}
