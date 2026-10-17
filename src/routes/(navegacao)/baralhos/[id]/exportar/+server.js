import { exigirUsuario } from "#lib/server/acoes.js";
import { buscarBaralho, garantir } from "#lib/server/dados.js";
import { gerarXml } from "#lib/xml-cartoes.js";

/**
 * Baixa o baralho como XML no formato do AnkiApp.
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ params, locals }) {
  const usuario = exigirUsuario(locals);
  const baralho = await buscarBaralho(locals.supabase, usuario.id, params.id);
  const cartoes = garantir(
    await locals.supabase
      .from("cards")
      .select("front, back, image_url, image_back_url")
      .eq("deck_id", params.id)
      .order("created_at"),
    "Não foi possível exportar os cartões.",
  );

  const nome = `${baralho.title}.xml`;
  // Nome sem acentos para navegadores antigos; o filename* leva o nome original.
  const nomeAscii =
    nome
      .normalize("NFD")
      .replace(/[^\x20-\x7E]/g, "")
      .replace(/["\\]/g, "") || "baralho.xml";

  return new Response(gerarXml(baralho.title, cartoes), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "content-disposition": `attachment; filename="${nomeAscii}"; filename*=UTF-8''${encodeURIComponent(nome)}`,
      "cache-control": "private, no-store",
    },
  });
}
