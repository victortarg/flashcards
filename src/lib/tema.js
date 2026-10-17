/**
 * Aplica o tema na hora e grava num cookie, que o servidor lê no próximo
 * carregamento para já mandar o HTML com o tema certo.
 * @param {App.Tema} tema
 */
export function aplicarTema(tema) {
  const raiz = document.documentElement;
  if (tema === "sistema") {
    delete raiz.dataset.tema;
    document.cookie = "reviz-tema=; path=/; max-age=0; samesite=lax";
  } else {
    raiz.dataset.tema = tema;
    document.cookie = `reviz-tema=${tema}; path=/; max-age=31536000; samesite=lax`;
  }
}
