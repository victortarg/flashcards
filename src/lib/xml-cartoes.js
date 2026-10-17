import { XMLParser } from "fast-xml-parser";

// Formato de XML do AnkiApp: um <deck> que declara os campos em <fields>
// (sides="11" aparece na frente e no verso, sides="01" só no verso) e uma
// lista de <card>, cada campo com HTML escapado dentro. Usado tanto no
// servidor (importação de verdade) quanto no navegador (prévia do arquivo).

export const LIMITE_ARQUIVO = 4 * 1024 * 1024;
export const LIMITE_CARTOES = 5000;
export const LIMITE_TEXTO = 10000;

export class ErroXml extends Error {}

/**
 * @typedef {{ frente: string, verso: string, imagemFrente: string | null, imagemVerso: string | null }} CartaoImportado
 * @typedef {{ titulo: string, cartoes: CartaoImportado[], ignorados: number }} BaralhoImportado
 */

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#texto",
  alwaysCreateTextNode: true,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: false,
  processEntities: true,
  htmlEntities: false,
});

/** @param {unknown} valor @returns {any[]} */
const lista = (valor) => (valor == null ? [] : Array.isArray(valor) ? valor : [valor]);

/** Procura <deck> na raiz ou dentro de um elemento que agrupe vários. */
function encontrarDecks(/** @type {any} */ no, profundidade = 0) {
  if (!no || typeof no !== "object" || profundidade > 3) return [];
  if (no.deck) return lista(no.deck);
  return Object.entries(no)
    .filter(([chave]) => !chave.startsWith("@_") && chave !== "#texto")
    .flatMap(([, filho]) => lista(filho).flatMap((item) => encontrarDecks(item, profundidade + 1)));
}

/** Elementos-filho de um nó como { nome, conteudo, lados }. */
function campos(/** @type {any} */ no) {
  if (!no || typeof no !== "object") return [];
  return Object.entries(no)
    .filter(([chave]) => !chave.startsWith("@_") && chave !== "#texto")
    .flatMap(([, valor]) => lista(valor))
    .filter((elemento) => elemento && typeof elemento === "object")
    .map((elemento) => ({
      nome: String(elemento["@_name"] ?? ""),
      lados: String(elemento["@_sides"] ?? ""),
      conteudo: String(elemento["#texto"] ?? ""),
    }));
}

const ENTIDADES = /** @type {Record<string, string>} */ ({
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  hellip: "…", mdash: "—", ndash: "–", laquo: "«", raquo: "»",
  ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", bull: "•", middot: "·",
  deg: "°", ordm: "º", ordf: "ª", plusmn: "±", times: "×", divide: "÷",
  micro: "µ", copy: "©", reg: "®", eacute: "é", aacute: "á", iacute: "í",
  oacute: "ó", uacute: "ú", atilde: "ã", otilde: "õ", ccedil: "ç",
  acirc: "â", ecirc: "ê", ocirc: "ô", agrave: "à",
});

/** @param {string} texto */
function decodificarEntidades(texto) {
  return texto.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (original, codigo) => {
    if (codigo[0] === "#") {
      const numero = codigo[1].toLowerCase() === "x" ? parseInt(codigo.slice(2), 16) : parseInt(codigo.slice(1), 10);
      return Number.isFinite(numero) && numero > 0 && numero <= 0x10ffff ? String.fromCodePoint(numero) : original;
    }
    return ENTIDADES[codigo.toLowerCase()] ?? original;
  });
}

/** Só aceitamos imagens por https ou embutidas (data:image). */
function imagemValida(/** @type {string} */ src) {
  return /^https?:\/\//i.test(src) || /^data:image\/(png|jpe?g|webp|gif|avif);base64,/i.test(src);
}

/**
 * Converte o HTML de um campo em texto simples (o que o Reviz guarda):
 * parágrafos viram linhas, itens de lista viram "• item" e as imagens
 * são separadas para virar a imagem do cartão.
 * @param {string} html
 */
export function htmlParaTexto(html) {
  /** @type {string[]} */
  const imagens = [];
  for (const [, , aspasDuplas, aspasSimples, semAspas] of html.matchAll(
    /<img\b[^>]*?\bsrc\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi,
  )) {
    const src = decodificarEntidades((aspasDuplas ?? aspasSimples ?? semAspas ?? "").trim());
    if (imagemValida(src)) imagens.push(src);
  }

  const texto = decodificarEntidades(
    html
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "")
      .replace(/\s*\n\s*/g, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<li\b[^>]*>/gi, "\n• ")
      .replace(/<\/(p|div|h[1-6]|li|ul|ol|tr|blockquote|pre)>/gi, "\n")
      .replace(/<[^>]*>/g, ""),
  )
    .replace(/[​-‍﻿]/g, "")
    .replace(/ /g, " ")
    .split("\n")
    .map((linha) => linha.replace(/[ \t]+/g, " ").trim())
    .filter((linha) => linha && linha !== "•")
    .join("\n");

  return { texto, imagens };
}

/**
 * Lê um XML no formato do AnkiApp. Lança ErroXml com uma mensagem pronta
 * para mostrar à pessoa quando o arquivo não serve.
 * @param {string} xml
 * @returns {BaralhoImportado[]}
 */
export function lerXml(xml) {
  // Sem DOCTYPE/ENTITY: evita expansão de entidades (o formato não usa isso).
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) {
    throw new ErroXml("O arquivo usa declarações de XML (DOCTYPE) que não são aceitas.");
  }

  let raiz;
  try {
    raiz = parser.parse(xml, true);
  } catch {
    throw new ErroXml("Esse arquivo não é um XML válido.");
  }

  const decks = encontrarDecks(raiz);
  if (decks.length === 0) {
    throw new ErroXml("Não encontrei nenhum baralho no arquivo. O formato aceito é o XML do AnkiApp.");
  }

  let total = 0;
  const baralhos = decks.map((deck) => {
    const declarados = campos(deck.fields);
    const nomesDaFrente = new Set(declarados.filter((c) => c.lados[0] === "1").map((c) => c.nome));

    let ignorados = 0;
    /** @type {CartaoImportado[]} */
    const cartoes = [];

    for (const card of lista(deck.cards?.card)) {
      const valores = campos(card);
      // Sem declaração de campos: o primeiro é a frente e o resto é o verso.
      const ehFrente = (/** @type {{ nome: string }} */ v, /** @type {number} */ i) =>
        nomesDaFrente.size ? nomesDaFrente.has(v.nome) : i === 0;

      const frente = valores.filter(ehFrente).map((v) => htmlParaTexto(v.conteudo));
      const verso = valores.filter((v, i) => !ehFrente(v, i)).map((v) => htmlParaTexto(v.conteudo));

      const cartao = {
        frente: frente.map((p) => p.texto).filter(Boolean).join("\n").slice(0, LIMITE_TEXTO),
        verso: verso.map((p) => p.texto).filter(Boolean).join("\n").slice(0, LIMITE_TEXTO),
        imagemFrente: frente.flatMap((p) => p.imagens)[0] ?? null,
        imagemVerso: verso.flatMap((p) => p.imagens)[0] ?? null,
      };

      if ((!cartao.frente && !cartao.imagemFrente) || (!cartao.verso && !cartao.imagemVerso)) {
        ignorados++;
        continue;
      }
      cartoes.push(cartao);
    }

    total += cartoes.length;
    return {
      titulo: String(deck["@_name"] ?? "").trim().slice(0, 120) || "Baralho importado",
      cartoes,
      ignorados,
    };
  });

  if (total === 0) throw new ErroXml("O arquivo não tem nenhum cartão com frente e verso.");
  if (total > LIMITE_CARTOES) {
    throw new ErroXml(`O arquivo tem ${total} cartões. O limite por importação é ${LIMITE_CARTOES}.`);
  }
  return baralhos;
}

/** @param {string} texto */
const escaparXml = (texto) =>
  texto
    // Caracteres de controle não são permitidos em XML 1.0.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Texto do Reviz para o HTML do campo: linhas viram parágrafos e linhas
 * começando com "•" voltam a ser uma lista.
 * @param {string | null} texto
 * @param {string | null} imagem
 */
export function textoParaHtml(texto, imagem) {
  /** @type {string[]} */
  const partes = [];
  if (imagem && !imagem.startsWith("data:")) partes.push(`<p><img src="${escaparXml(imagem)}"></p>`);

  /** @type {string[]} */
  let itens = [];
  const fecharLista = () => {
    if (itens.length) partes.push(`<ul>${itens.map((item) => `<li>${escaparXml(item)}</li>`).join("")}</ul>`);
    itens = [];
  };

  for (const linha of (texto ?? "").split("\n")) {
    const item = linha.match(/^\s*•\s*(.*)$/);
    if (item) {
      itens.push(item[1]);
      continue;
    }
    fecharLista();
    if (linha.trim()) partes.push(`<p>${escaparXml(linha)}</p>`);
  }
  fecharLista();

  return partes.join("");
}

/**
 * Gera o XML de um baralho no formato do AnkiApp.
 * @param {string} titulo
 * @param {{ front: string | null, back: string | null, image_url: string | null, image_back_url: string | null }[]} cartoes
 */
export function gerarXml(titulo, cartoes) {
  const cards = cartoes
    .map(
      (c) =>
        `<card><rich-text name="Frente">${escaparXml(textoParaHtml(c.front, c.image_url))}</rich-text>` +
        `<rich-text name="Verso">${escaparXml(textoParaHtml(c.back, c.image_back_url))}</rich-text></card>`,
    )
    .join("");

  return (
    `<deck name="${escaparXml(titulo)}" tags=""><config base="rich-text"></config>` +
    `<fields><rich-text name="Frente" sides="11"></rich-text><rich-text name="Verso" sides="01"></rich-text></fields>` +
    `<cards>${cards}</cards></deck>\n`
  );
}
