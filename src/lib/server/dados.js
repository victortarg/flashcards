import { error, redirect } from "@sveltejs/kit";
import { estaPendente } from "#lib/srs.js";

/**
 * Lança um erro HTTP se a consulta ao Supabase falhar; senão devolve os dados.
 * @template T
 * @param {{ data: T, error: { message: string } | null }} resultado
 * @param {string} mensagem
 * @returns {T}
 */
export function garantir(resultado, mensagem) {
  if (resultado.error) {
    console.error(mensagem, resultado.error.message);
    error(500, mensagem);
  }
  return resultado.data;
}

/**
 * Pastas e baralhos do usuário, já com as contagens de cartões.
 * Não traz conteúdo dos cartões, só as datas de revisão, para ficar leve.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} idUsuario
 */
export async function listarResumo(supabase, idUsuario) {
  const [resultadoPastas, resultadoBaralhos] = await Promise.all([
    supabase
      .from("folders")
      .select("id, name, created_at")
      .eq("user_id", idUsuario)
      .order("created_at"),
    supabase
      .from("decks")
      .select("id, title, color, folder_id, is_public, created_at, cards(next_review)")
      .eq("user_id", idUsuario)
      .order("created_at"),
  ]);

  const pastas = garantir(resultadoPastas, "Não foi possível carregar as pastas.");
  const baralhos = garantir(resultadoBaralhos, "Não foi possível carregar os baralhos.");
  const agora = new Date();

  return {
    pastas,
    baralhos: baralhos.map(({ cards, ...baralho }) => ({
      ...baralho,
      total: cards.length,
      pendentes: cards.filter((cartao) => estaPendente(cartao, agora)).length,
    })),
  };
}

/**
 * Busca um baralho do próprio usuário. Se for um baralho público de outra
 * pessoa, manda para a página de compartilhamento; senão, 404.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} idUsuario
 * @param {string} idBaralho
 */
export async function buscarBaralho(supabase, idUsuario, idBaralho) {
  const baralho = garantir(
    await supabase
      .from("decks")
      .select("id, title, color, folder_id, is_public, created_at, user_id")
      .eq("id", idBaralho)
      .maybeSingle(),
    "Não foi possível carregar o baralho.",
  );
  if (!baralho) error(404, "Baralho não encontrado.");
  if (baralho.user_id !== idUsuario) {
    if (baralho.is_public) redirect(303, `/compartilhado/${idBaralho}`);
    error(404, "Baralho não encontrado.");
  }

  const { user_id: _dono, ...dados } = baralho;
  return dados;
}

export const CAMPOS_CARTAO =
  "id, front, back, image_url, image_back_url, next_review, interval, ease_factor, created_at";
