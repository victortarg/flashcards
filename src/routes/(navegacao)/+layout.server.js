import { exigirUsuario } from "#lib/server/acoes.js";
import { listarResumo } from "#lib/server/dados.js";

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, depends }) {
  depends("app:biblioteca");
  const usuario = exigirUsuario(locals);
  return listarResumo(locals.supabase, usuario.id);
}
