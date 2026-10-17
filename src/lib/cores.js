// O banco guarda a cor como classe do Tailwind (herança da versão anterior).
// Mantemos as mesmas chaves e só trocamos o tom exibido por versões mais sóbrias.
export const CORES = [
  { chave: "bg-rose-500", nome: "Coral", valor: "oklch(0.64 0.14 22)" },
  { chave: "bg-teal-500", nome: "Verde-água", valor: "oklch(0.63 0.09 185)" },
  { chave: "bg-blue-500", nome: "Azul", valor: "oklch(0.6 0.12 245)" },
  { chave: "bg-indigo-500", nome: "Índigo", valor: "oklch(0.54 0.12 275)" },
  { chave: "bg-purple-500", nome: "Ameixa", valor: "oklch(0.52 0.11 320)" },
];

/** @param {string | null | undefined} chave */
export function corDoBaralho(chave) {
  return (CORES.find((cor) => cor.chave === chave) ?? CORES[3]).valor;
}

export function corAleatoria() {
  return CORES[Math.floor(Math.random() * CORES.length)].chave;
}
