import { error } from "@sveltejs/kit";
import { acoesBiblioteca } from "#lib/server/acoes.js";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, parent }) {
  const { pastas } = await parent();
  const pasta = pastas.find((p) => p.id === params.id);
  if (!pasta) error(404, "Pasta não encontrada.");
  return { pasta };
}

export const actions = acoesBiblioteca;
