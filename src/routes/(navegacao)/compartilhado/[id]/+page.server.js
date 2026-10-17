import { error, fail, redirect } from "@sveltejs/kit";
import { exigirUsuario } from "#lib/server/acoes.js";
import { garantir } from "#lib/server/dados.js";
import { copiarImagem } from "#lib/server/imagens.js";

/**
 * Baralho público (de qualquer pessoa) com os cartões.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} id
 */
async function buscarPublico(supabase, id) {
  const [resultadoBaralho, resultadoCartoes] = await Promise.all([
    supabase
      .from("decks")
      .select("id, title, color, user_id, is_public")
      .eq("id", id)
      .eq("is_public", true)
      .maybeSingle(),
    supabase
      .from("cards")
      .select("front, back, image_url, image_back_url")
      .eq("deck_id", id)
      .order("created_at"),
  ]);

  const baralho = garantir(resultadoBaralho, "Não foi possível abrir o baralho.");
  if (!baralho) error(404, "Este link não existe ou o baralho deixou de ser compartilhado.");
  return { baralho, cartoes: garantir(resultadoCartoes, "Não foi possível abrir os cartões.") };
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
  const usuario = exigirUsuario(locals);
  const { baralho, cartoes } = await buscarPublico(locals.supabase, params.id);

  return {
    compartilhado: {
      id: baralho.id,
      title: baralho.title,
      color: baralho.color,
      proprio: baralho.user_id === usuario.id,
      total: cartoes.length,
      amostra: cartoes.slice(0, 3),
    },
  };
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
  importar: async ({ params, locals }) => {
    const usuario = exigirUsuario(locals);
    const { supabase } = locals;
    const { baralho, cartoes } = await buscarPublico(supabase, params.id);

    const { data: novo, error: erroBaralho } = await supabase
      .from("decks")
      .insert({
        title: `${baralho.title} (cópia)`,
        color: baralho.color,
        folder_id: null,
        is_public: false,
        user_id: usuario.id,
      })
      .select("id")
      .single();
    if (erroBaralho) return fail(500, { erro: "Não foi possível criar a cópia." });

    // As imagens são copiadas para a pasta de quem importa, para a cópia
    // continuar funcionando mesmo se o dono original apagar os cartões.
    const copias = [];
    for (let i = 0; i < cartoes.length; i += 4) {
      const lote = cartoes.slice(i, i + 4);
      copias.push(
        ...(await Promise.all(
          lote.map(async (cartao) => ({
            front: cartao.front,
            back: cartao.back,
            image_url: await copiarImagem(supabase, usuario.id, cartao.image_url),
            image_back_url: await copiarImagem(supabase, usuario.id, cartao.image_back_url),
            deck_id: novo.id,
            user_id: usuario.id,
          })),
        )),
      );
    }

    if (copias.length) {
      const { error: erroCartoes } = await supabase.from("cards").insert(copias);
      if (erroCartoes) {
        await supabase.from("decks").delete().eq("id", novo.id);
        return fail(500, { erro: "Não foi possível copiar os cartões." });
      }
    }

    redirect(303, `/baralhos/${novo.id}`);
  },
};
