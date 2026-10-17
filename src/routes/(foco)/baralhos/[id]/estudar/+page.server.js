import { fail } from "@sveltejs/kit";
import { exigirUsuario, texto } from "#lib/server/acoes.js";
import { buscarBaralho, CAMPOS_CARTAO, garantir } from "#lib/server/dados.js";
import { calcularProximaRevisao } from "#lib/srs.js";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url, locals }) {
  const usuario = exigirUsuario(locals);
  const { supabase } = locals;
  const livre = url.searchParams.get("modo") === "livre";
  const agora = new Date().toISOString();

  let consulta = supabase
    .from("cards")
    .select(CAMPOS_CARTAO)
    .eq("deck_id", params.id)
    .order("created_at");
  if (!livre) consulta = consulta.or(`next_review.is.null,next_review.lte.${agora}`);

  const [baralho, resultadoCartoes, resultadoProxima, resultadoTotal] = await Promise.all([
    buscarBaralho(supabase, usuario.id, params.id),
    consulta,
    supabase
      .from("cards")
      .select("next_review")
      .eq("deck_id", params.id)
      .gt("next_review", agora)
      .order("next_review")
      .limit(1)
      .maybeSingle(),
    supabase.from("cards").select("id", { count: "exact", head: true }).eq("deck_id", params.id),
  ]);

  const cartoes = garantir(resultadoCartoes, "Não foi possível carregar os cartões.");

  // No treino livre a ordem é embaralhada (Fisher-Yates).
  if (livre) {
    for (let i = cartoes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cartoes[i], cartoes[j]] = [cartoes[j], cartoes[i]];
    }
  }

  return {
    baralho,
    cartoes,
    livre,
    total: resultadoTotal.count ?? cartoes.length,
    proximaRevisao: resultadoProxima.data?.next_review ?? null,
  };
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
  responder: async ({ request, params, locals }) => {
    exigirUsuario(locals);
    const dados = await request.formData();
    const id = texto(dados, "id");
    const qualidade = Number(dados.get("qualidade"));
    if (![0, 1, 2, 3].includes(qualidade)) return fail(400, { erro: "Resposta inválida." });

    const { data: cartao, error: erroBusca } = await locals.supabase
      .from("cards")
      .select("interval, ease_factor")
      .eq("id", id)
      .eq("deck_id", params.id)
      .maybeSingle();
    if (erroBusca || !cartao) return fail(404, { erro: "Cartão não encontrado." });

    const { error } = await locals.supabase
      .from("cards")
      .update(calcularProximaRevisao(cartao, qualidade))
      .eq("id", id)
      .eq("deck_id", params.id);
    if (error) return fail(500, { erro: "Não foi possível salvar a resposta." });

    return { ok: true };
  },
};
