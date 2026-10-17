import { fail } from "@sveltejs/kit";
import { acoesBiblioteca, exigirUsuario, texto } from "#lib/server/acoes.js";
import { buscarBaralho, CAMPOS_CARTAO, garantir } from "#lib/server/dados.js";
import { apagarImagens, enviarImagem, ErroImagem } from "#lib/server/imagens.js";
import { LIMITE_TEXTO } from "#lib/xml-cartoes.js";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
  const usuario = exigirUsuario(locals);

  const [baralho, resultadoCartoes] = await Promise.all([
    buscarBaralho(locals.supabase, usuario.id, params.id),
    locals.supabase
      .from("cards")
      .select(CAMPOS_CARTAO)
      .eq("deck_id", params.id)
      .order("created_at", { ascending: false }),
  ]);

  return {
    baralho,
    cartoes: garantir(resultadoCartoes, "Não foi possível carregar os cartões."),
  };
}

/** @param {FormDataEntryValue | null} valor */
const temArquivo = (valor) => valor instanceof Blob && valor.size > 0;

/** @satisfies {import('./$types').Actions} */
export const actions = {
  ...acoesBiblioteca,

  salvarCartao: async ({ request, params, locals }) => {
    const usuario = exigirUsuario(locals);
    const { supabase } = locals;
    const dados = await request.formData();

    const id = texto(dados, "id") || null;
    const frente = texto(dados, "frente", LIMITE_TEXTO);
    const verso = texto(dados, "verso", LIMITE_TEXTO);
    const arquivoFrente = dados.get("imagem_frente");
    const arquivoVerso = dados.get("imagem_verso");
    const removerFrente = dados.get("remover_imagem_frente") === "1";
    const removerVerso = dados.get("remover_imagem_verso") === "1";

    /** @type {{ image_url: string | null, image_back_url: string | null } | null} */
    let atual = null;
    if (id) {
      atual = garantir(
        await supabase
          .from("cards")
          .select("image_url, image_back_url")
          .eq("id", id)
          .eq("deck_id", params.id)
          .maybeSingle(),
        "Não foi possível carregar o cartão.",
      );
      if (!atual) return fail(404, { erro: "Esse cartão não existe mais." });
    } else {
      await buscarBaralho(supabase, usuario.id, params.id);
    }

    const frenteTemImagem = temArquivo(arquivoFrente) || (!removerFrente && atual?.image_url);
    const versoTemImagem = temArquivo(arquivoVerso) || (!removerVerso && atual?.image_back_url);
    if (!frente && !frenteTemImagem) return fail(400, { erro: "A frente precisa de texto ou imagem." });
    if (!verso && !versoTemImagem) return fail(400, { erro: "O verso precisa de texto ou imagem." });

    const envios = await Promise.allSettled([
      enviarImagem(supabase, usuario.id, arquivoFrente),
      enviarImagem(supabase, usuario.id, arquivoVerso),
    ]);
    const enviadas = envios.map((envio) => (envio.status === "fulfilled" ? envio.value : null));
    const falha = envios.find((envio) => envio.status === "rejected");
    if (falha) {
      await apagarImagens(supabase, usuario.id, enviadas);
      const motivo = falha.reason;
      return fail(400, {
        erro: motivo instanceof ErroImagem ? motivo.message : "Não foi possível enviar a imagem.",
      });
    }

    const [novaFrente, novoVerso] = enviadas;
    const registro = {
      front: frente,
      back: verso,
      image_url: novaFrente ?? (removerFrente ? null : (atual?.image_url ?? null)),
      image_back_url: novoVerso ?? (removerVerso ? null : (atual?.image_back_url ?? null)),
    };

    const { error } = id
      ? await supabase.from("cards").update(registro).eq("id", id).eq("deck_id", params.id)
      : await supabase.from("cards").insert({ ...registro, deck_id: params.id, user_id: usuario.id });

    if (error) {
      await apagarImagens(supabase, usuario.id, enviadas);
      return fail(500, { erro: "Não foi possível salvar o cartão." });
    }

    // Imagens trocadas ou removidas deixam de ser usadas.
    if (atual) {
      await apagarImagens(supabase, usuario.id, [
        atual.image_url !== registro.image_url ? atual.image_url : null,
        atual.image_back_url !== registro.image_back_url ? atual.image_back_url : null,
      ]);
    }

    return { ok: true };
  },

  apagarCartao: async ({ request, params, locals }) => {
    const usuario = exigirUsuario(locals);
    const id = texto(await request.formData(), "id");

    const { data: cartao } = await locals.supabase
      .from("cards")
      .select("image_url, image_back_url")
      .eq("id", id)
      .eq("deck_id", params.id)
      .maybeSingle();

    const { error } = await locals.supabase
      .from("cards")
      .delete()
      .eq("id", id)
      .eq("deck_id", params.id);
    if (error) return fail(500, { erro: "Não foi possível apagar o cartão." });

    if (cartao) await apagarImagens(locals.supabase, usuario.id, [cartao.image_url, cartao.image_back_url]);
    return { ok: true };
  },

  compartilhar: async ({ params, locals }) => {
    const usuario = exigirUsuario(locals);
    const { error } = await locals.supabase
      .from("decks")
      .update({ is_public: true })
      .eq("id", params.id)
      .eq("user_id", usuario.id);
    if (error) return fail(500, { erro: "Não foi possível criar o link." });
    return { compartilhado: true };
  },

  pararDeCompartilhar: async ({ params, locals }) => {
    const usuario = exigirUsuario(locals);
    const { error } = await locals.supabase
      .from("decks")
      .update({ is_public: false })
      .eq("id", params.id)
      .eq("user_id", usuario.id);
    if (error) return fail(500, { erro: "Não foi possível desativar o link." });
    return { ok: true };
  },
};
