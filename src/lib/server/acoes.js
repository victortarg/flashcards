import { error, fail, redirect } from "@sveltejs/kit";
import { CORES } from "#lib/cores.js";
import { apagarImagens } from "./imagens.js";
import { caminhoSeguro } from "./redirecionar.js";

/**
 * @param {FormData} dados
 * @param {string} campo
 * @param {number} [limite]
 */
export function texto(dados, campo, limite = 120) {
  return String(dados.get(campo) ?? "").trim().slice(0, limite);
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
    const idPasta = texto(dados, "idPasta") || null;

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
      .update({ folder_id: texto(dados, "idPasta") || null })
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
};
