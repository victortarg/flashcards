// Migra as imagens antigas (base64 dentro da tabela cards) para o Storage.
//
// Uso (uma vez só, depois de rodar o SQL em supabase/migrations):
//   1. Adicione SUPABASE_SERVICE_ROLE_KEY ao .env (Project Settings > API Keys).
//      Essa chave ignora o RLS: nunca coloque ela na Vercel nem no código.
//   2. npm run migrar-imagens
//   3. Apague a chave do .env quando terminar.
import { createClient } from "@supabase/supabase-js";

const BUCKET = "card-images";
const LOTE = 20;

const limpar = (/** @type {string | undefined} */ valor) =>
  valor?.trim().replace(/['"]/g, "");

const url = limpar(process.env.VITE_SUPABASE_URL);
const chave = limpar(process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!url || !chave) {
  console.error("Faltam VITE_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env.");
  process.exit(1);
}

const supabase = createClient(url, chave, { auth: { persistSession: false } });

/**
 * @param {string} dataUrl
 * @param {string} idUsuario
 */
async function enviar(dataUrl, idUsuario) {
  const [cabecalho, base64] = dataUrl.split(",");
  const tipo = cabecalho.match(/^data:(.*?);base64$/)?.[1] ?? "image/png";
  const extensao = tipo.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
  const caminho = `${idUsuario}/${crypto.randomUUID()}.${extensao}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(caminho, Buffer.from(base64, "base64"), {
      contentType: tipo,
      cacheControl: "31536000",
    });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
}

let migrados = 0;
/** @type {Set<string>} */
const falhas = new Set();

while (true) {
  let consulta = supabase
    .from("cards")
    .select("id, user_id, image_url, image_back_url, decks(user_id)")
    .or("image_url.like.data:*,image_back_url.like.data:*")
    .limit(LOTE);
  // Cartões que falharam ficam de fora das próximas buscas (e intactos no banco).
  if (falhas.size) consulta = consulta.not("id", "in", `(${[...falhas].join(",")})`);

  const { data: cartoes, error } = await consulta;

  if (error) {
    console.error("Erro ao buscar cartões:", error.message);
    process.exit(1);
  }
  if (!cartoes.length) break;

  for (const cartao of cartoes) {
    // @ts-ignore o relacionamento decks vem como objeto
    const idUsuario = cartao.user_id ?? cartao.decks?.user_id;
    try {
      if (!idUsuario) throw new Error("cartão sem dono");

      /** @type {Record<string, string | null>} */
      const atualizacao = {};
      for (const campo of /** @type {const} */ (["image_url", "image_back_url"])) {
        const valor = cartao[campo];
        if (valor?.startsWith("data:")) atualizacao[campo] = await enviar(valor, idUsuario);
      }

      const { error: erroUpdate } = await supabase
        .from("cards")
        .update(atualizacao)
        .eq("id", cartao.id);
      if (erroUpdate) throw erroUpdate;

      migrados++;
      console.log(`ok   ${cartao.id}`);
    } catch (erro) {
      falhas.add(String(cartao.id));
      console.error(`erro ${cartao.id}:`, erro instanceof Error ? erro.message : erro);
    }
  }
}

console.log(`\nPronto: ${migrados} cartões migrados, ${falhas.size} com erro (não alterados).`);
