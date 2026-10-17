const LADO_MAXIMO = 1600;
const QUALIDADE = 0.85;

/**
 * Reduz e recomprime a imagem no navegador antes do envio. Fotos de celular
 * de 4-8 MB costumam virar 150-400 KB, o que deixa o envio e a leitura rápidos.
 * GIFs passam direto para não perder a animação.
 * @param {File} arquivo
 * @returns {Promise<File>}
 */
export async function comprimirImagem(arquivo) {
  if (!arquivo.type.startsWith("image/") || arquivo.type === "image/gif") return arquivo;

  let bitmap;
  try {
    bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  } catch {
    return arquivo;
  }

  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const contexto = canvas.getContext("2d");
  if (!contexto) return arquivo;
  contexto.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  // Alguns navegadores não codificam WebP e devolvem PNG; nesse caso, JPEG.
  let blob = await paraBlob(canvas, "image/webp");
  if (!blob || blob.type !== "image/webp") blob = await paraBlob(canvas, "image/jpeg");
  if (!blob) return arquivo;

  if (escala === 1 && blob.size >= arquivo.size) return arquivo;

  const extensao = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `imagem.${extensao}`, { type: blob.type });
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} tipo
 * @returns {Promise<Blob | null>}
 */
function paraBlob(canvas, tipo) {
  return new Promise((resolver) => canvas.toBlob(resolver, tipo, QUALIDADE));
}

/** @param {Blob} blob @returns {Promise<string>} */
export function paraDataUrl(blob) {
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader();
    leitor.onload = () => resolver(/** @type {string} */ (leitor.result));
    leitor.onerror = () => rejeitar(leitor.error);
    leitor.readAsDataURL(blob);
  });
}

/** @param {string} dataUrl @returns {Promise<File>} */
export async function deDataUrl(dataUrl) {
  const blob = await (await fetch(dataUrl)).blob();
  const extensao = blob.type.split("/")[1] ?? "png";
  return new File([blob], `imagem.${extensao}`, { type: blob.type });
}
