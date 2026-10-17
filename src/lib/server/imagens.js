import { VITE_SUPABASE_URL } from "$app/env/private";

export const BUCKET = "card-images";

const TIPOS = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/avif": "avif",
};

// A Vercel limita o corpo da requisição em 4,5 MB. O navegador já comprime
// antes de enviar, então isso só pega casos em que a compressão falhou.
const LIMITE_BYTES = 4 * 1024 * 1024;

export class ErroImagem extends Error {}

/**
 * Envia a imagem para o Storage, dentro da pasta do usuário, e devolve a URL pública.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} idUsuario
 * @param {FormDataEntryValue | Blob | null} arquivo
 * @returns {Promise<string | null>}
 */
export async function enviarImagem(supabase, idUsuario, arquivo) {
  if (!(arquivo instanceof Blob) || arquivo.size === 0) return null;

  const extensao = TIPOS[arquivo.type];
  if (!extensao) throw new ErroImagem("Formato de imagem não suportado.");
  if (arquivo.size > LIMITE_BYTES) {
    throw new ErroImagem("A imagem passou de 4 MB, mesmo depois de comprimida.");
  }

  const caminho = `${idUsuario}/${crypto.randomUUID()}.${extensao}`;
  const { error } = await supabase.storage.from(BUCKET).upload(caminho, arquivo, {
    contentType: arquivo.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new ErroImagem(`Não foi possível enviar a imagem: ${error.message}`);

  return supabase.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
}

/**
 * Extrai o caminho do objeto no bucket, mas só se ele pertencer ao usuário.
 * URLs antigas em base64 ou de outros lugares retornam null.
 * @param {string | null | undefined} url
 * @param {string} idUsuario
 */
export function caminhoDaImagem(url, idUsuario) {
  if (!url) return null;
  const marcador = `/storage/v1/object/public/${BUCKET}/`;
  const indice = url.indexOf(marcador);
  if (indice === -1) return null;

  const caminho = decodeURIComponent(url.slice(indice + marcador.length).split("?")[0]);
  return caminho.startsWith(`${idUsuario}/`) ? caminho : null;
}

/**
 * Apaga do Storage as imagens que pertencem ao usuário. Falhas aqui não devem
 * impedir a ação principal (no pior caso fica um arquivo órfão).
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} idUsuario
 * @param {(string | null | undefined)[]} urls
 */
export async function apagarImagens(supabase, idUsuario, urls) {
  const caminhos = urls
    .map((url) => caminhoDaImagem(url, idUsuario))
    .filter((caminho) => caminho !== null);
  if (caminhos.length === 0) return;

  const { error } = await supabase.storage.from(BUCKET).remove(caminhos);
  if (error) console.error("Erro ao apagar imagens:", error.message);
}

/**
 * Copia uma imagem (de outro usuário, ou base64 antiga) para a pasta do usuário.
 * Usado ao importar um baralho compartilhado, para a cópia não depender do original.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} idUsuario
 * @param {string | null | undefined} url
 */
export async function copiarImagem(supabase, idUsuario, url) {
  if (!url) return null;
  // Só buscamos imagens do nosso Storage ou embutidas; um link externo num
  // cartão compartilhado nunca deve fazer o servidor acessar outro endereço.
  const doStorage = Boolean(VITE_SUPABASE_URL) && url.startsWith(`${VITE_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`);
  if (!doStorage && !url.startsWith("data:")) return url;

  try {
    const resposta = await fetch(url);
    if (!resposta.ok) return url;
    return (await enviarImagem(supabase, idUsuario, await resposta.blob())) ?? url;
  } catch (erro) {
    console.error("Erro ao copiar imagem:", erro);
    return url;
  }
}

/**
 * Imagem que veio num arquivo importado. Embutidas (data:) são enviadas para
 * o Storage; as do nosso próprio Storage são copiadas para a pasta de quem
 * importa. Outros links https ficam como estão: o servidor nunca busca URLs
 * de terceiros, só o navegador de quem estuda.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} idUsuario
 * @param {string | null} src
 */
export async function resolverImagemImportada(supabase, idUsuario, src) {
  if (!src) return null;

  if (src.startsWith("data:")) {
    try {
      const [cabecalho, base64] = src.split(",");
      const tipo = cabecalho.match(/^data:(.*?);base64$/)?.[1] ?? "";
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      return await enviarImagem(supabase, idUsuario, new Blob([bytes], { type: tipo }));
    } catch {
      return null;
    }
  }

  const prefixo = `${VITE_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
  if (VITE_SUPABASE_URL && src.startsWith(prefixo)) return copiarImagem(supabase, idUsuario, src);

  return /^https:\/\//i.test(src) ? src : null;
}
