/**
 * Aceita apenas caminhos internos ("/algo"), evitando open redirect via ?next=.
 * @param {string | null | undefined} destino
 */
export function caminhoSeguro(destino) {
  if (!destino || !destino.startsWith("/") || destino.startsWith("//")) return "/";
  return destino;
}
