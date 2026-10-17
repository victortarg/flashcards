import { error, fail, redirect } from "@sveltejs/kit";
import { CORES, corAleatoria } from "#lib/cores.js";
import { ErroXml, LIMITE_ARQUIVO, lerXml } from "#lib/xml-cartoes.js";
import { apagarImagens, resolverImagemImportada } from "./imagens.js";
import { caminhoSeguro } from "./redirecionar.js";

/**
 * @param {FormData} dados
 * @param {string} campo
 * @param {number} [limite]
 */
export function texto(dados, campo, limite = 120) {
  return String(dados.get(campo) ?? "").trim().slice(0, limite);
}

/**
 * Só aceita uma pasta que seja do próprio usuário; qualquer outra vira "sem pasta".
 * @param {App.Locals} locals
 * @param {string} idUsuario
 * @param {string} idPasta
 */
async function pastaDoUsuario(locals, idUsuario, idPasta) {
  if (!idPasta) return null;
  const { data } = await locals.supabase
    .from("folders")
    .select("id")
    .eq("id", idPasta)
    .eq("user_id", idUsuario)
    .maybeSingle();
  return data?.id ?? null;
}

/** @param {App.Locals} locals */
export function exigirUsuario(locals) {
  if (!locals.usuario) error(401, "Faça login para continuar.");
  return locals.usuario;
}

/**
 * Ações de pastas e baralhos. São reexportadas pelas páginas que mostram a
 * biblioteca, para os formulários sempre postarem na própria página.
 * @satisfies {import('@sveltejs/kit').Actions}
 */
export const acoesBiblioteca = {
  criarPasta: async ({ request, locals }) => {
    const usuario = exigirUsuario(locals);
    const nome = texto(await request.formData(), "nome", 80);
    if (!nome) return fail(400, { erro: "Dê um nome para a pasta." });

    const { error: erro } = await locals.supabase
      .from("folders")
      .insert({ name: nome, user_id: usuario.id });
    if (erro) return fail(500, { erro: "Não foi possível criar a pasta." });
    return { ok: true };
  },

  renomearPasta: async ({ request, locals }) => {
    const usuario = exigirUsuario(locals);
    const dados = await request.formData();
    const id = texto(dados, "id");
    const nome = texto(dados, "nome", 80);
    if (!nome) return fail(400, { erro: "O nome não pode ficar vazio." });

    const { error: erro } = await locals.supabase
      .from("folders")
      .update({ name: nome })
      .eq("id", id)
      .eq("user_id", usuario.id);
    if (erro) return fail(500, { erro: "Não foi possível renomear a pasta." });
    return { ok: true };
  },

  apagarPasta: async ({ request, locals }) => {
    const usuario = exigirUsuario(locals);
    const dados = await request.formData();
    const id = texto(dados, "id");

    // Os baralhos da pasta voltam para a tela inicial, como antes.
    const desvincular = await locals.supabase
      .from("decks")
      .update({ folder_id: null })
      .eq("folder_id", id)
      .eq("user_id", usuario.id);
    if (desvincular.error) return fail(500, { erro: "Não foi possível esvaziar a pasta." });

    const { error: erro } = await locals.supabase
      .from("folders")
      .delete()
      .eq("id", id)
      .eq("user_id", usuario.id);
    if (erro) return fail(500, { erro: "Não foi possível apagar a pasta." });

    const destino = texto(dados, "destino", 300);
    if (destino) redirect(303, caminhoSeguro(destino));
    return { ok: true };
  },

  criarBaralho: async ({ request, locals }) => {
    const usuario = exigirUsuario(locals);
    const dados = await request.formData();
    const titulo = texto(dados, "titulo", 120);
    if (!titulo) return fail(400, { erro: "Dê um nome para o baralho." });

    const corEscolhida = texto(dados, "cor");
    const cor = CORES.some((c) => c.chave === corEscolhida) ? corEscolhida : CORES[3].chave;
    const idPasta = await pastaDoUsuario(locals, usuario.id, texto(dados, "idPasta"));

    const { data, error: erro } = await locals.supabase
      .from("decks")
      .insert({ title: titulo, color: cor, folder_id: idPasta, user_id: usuario.id })
      .select("id")
      .single();
    if (erro) return fail(500, { erro: "Não foi possível criar o baralho." });

    redirect(303, `/baralhos/${data.id}`);
  },

  renomearBaralho: async ({ request, locals }) => {
    const usuario = exigirUsuario(locals);
    const dados = await request.formData();
    const titulo = texto(dados, "titulo", 120);
    if (!titulo) return fail(400, { erro: "O nome não pode ficar vazio." });

    /** @type {{ title: string, color?: string }} */
    const atualizacao = { title: titulo };
    const cor = texto(dados, "cor");
    if (CORES.some((c) => c.chave === cor)) atualizacao.color = cor;

    const { error: erro } = await locals.supabase
      .from("decks")
      .update(atualizacao)
      .eq("id", texto(dados, "id"))
      .eq("user_id", usuario.id);
    if (erro) return fail(500, { erro: "Não foi possível salvar o baralho." });
    return { ok: true };
  },

  moverBaralho: async ({ request, locals }) => {
    const usuario = exigirUsuario(locals);
    const dados = await request.formData();

    const { error: erro } = await locals.supabase
      .from("decks")
      .update({ folder_id: await pastaDoUsuario(locals, usuario.id, texto(dados, "idPasta")) })
      .eq("id", texto(dados, "id"))
      .eq("user_id", usuario.id);
    if (erro) return fail(500, { erro: "Não foi possível mover o baralho." });
    return { ok: true };
  },

  apagarBaralho: async ({ request, locals }) => {
    const usuario = exigirUsuario(locals);
    const dados = await request.formData();
    const id = texto(dados, "id");

    // Guarda as imagens antes: o delete em cascata apaga os cartões.
    const { data: cartoes } = await locals.supabase
      .from("cards")
      .select("image_url, image_back_url")
      .eq("deck_id", id);

    const { error: erro } = await locals.supabase
      .from("decks")
      .delete()
      .eq("id", id)
      .eq("user_id", usuario.id);
    if (erro) return fail(500, { erro: "Não foi possível apagar o baralho." });

    await apagarImagens(
      locals.supabase,
      usuario.id,
      (cartoes ?? []).flatMap((c) => [c.image_url, c.image_back_url]),
    );

    const destino = texto(dados, "destino", 300);
    if (destino) redirect(303, caminhoSeguro(destino));
    return { ok: true };
  },

  importarXml: async ({ request, locals }) => {
    const usuario = exigirUsuario(locals);
    const { supabase } = locals;
    const dados = await request.formData();
    const arquivo = dados.get("arquivo");

    if (!(arquivo instanceof Blob) || arquivo.size === 0) return fail(400, { erro: "Escolha um arquivo .xml." });
    if (arquivo.size > LIMITE_ARQUIVO) return fail(400, { erro: "O arquivo passou de 4 MB." });

    let baralhos;
    try {
      baralhos = lerXml(await arquivo.text());
    } catch (erroLeitura) {
      if (erroLeitura instanceof ErroXml) return fail(400, { erro: erroLeitura.message });
      throw erroLeitura;
    }

    const idPasta = await pastaDoUsuario(locals, usuario.id, texto(dados, "idPasta"));
    /** @type {string[]} */
    const criados = [];

    for (const baralho of baralhos) {
      if (baralho.cartoes.length === 0) continue;

      const { data: novo, error: erroBaralho } = await supabase
        .from("decks")
        .insert({ title: baralho.titulo, color: corAleatoria(), folder_id: idPasta, user_id: usuario.id })
        .select("id")
        .single();
      if (erroBaralho) return fail(500, { erro: "Não foi possível criar o baralho importado." });

      // Imagens em lotes pequenos, para não abrir dezenas de envios de uma vez.
      const registros = [];
      for (let i = 0; i < baralho.cartoes.length; i += 4) {
        const lote = baralho.cartoes.slice(i, i + 4);
        registros.push(
          ...(await Promise.all(
            lote.map(async (cartao) => ({
              front: cartao.frente,
              back: cartao.verso,
              image_url: await resolverImagemImportada(supabase, usuario.id, cartao.imagemFrente),
              image_back_url: await resolverImagemImportada(supabase, usuario.id, cartao.imagemVerso),
              deck_id: novo.id,
              user_id: usuario.id,
            })),
          )),
        );
      }

      for (let i = 0; i < registros.length; i += 500) {
        const { error: erroCartoes } = await supabase.from("cards").insert(registros.slice(i, i + 500));
        if (erroCartoes) {
          await supabase.from("decks").delete().eq("id", novo.id);
          return fail(500, { erro: `Não foi possível salvar os cartões de "${baralho.titulo}".` });
        }
      }
      criados.push(novo.id);
    }

    if (criados.length === 1) redirect(303, `/baralhos/${criados[0]}`);
    return { importados: criados.length };
  },
};
