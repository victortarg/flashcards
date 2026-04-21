import { writable } from "svelte/store";
import { supabase } from "./lib/supabaseClient";

// --- ESTADO DO USUÁRIO ---
/** @type {import('svelte/store').Writable<any>} */
export const usuario = writable(null);

// --- DADOS DA NUVEM ---
/** @type {import('svelte/store').Writable<any[]>} */
export const baralhos = writable([]);

/** @type {import('svelte/store').Writable<any[]>} */
export const pastas = writable([]);

// --- COMPARTILHAMENTO ---
// Lê a URL apenas uma vez quando o app inicia
const urlParams =
  typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
const shareId = urlParams ? urlParams.get("share") : null;
export const idCompartilhado = writable(shareId);

// --- ESTADO DA UI ---
/** @type {import('svelte/store').Writable<string>} */
export const visualizacaoAtual = writable("login");

/** @type {import('svelte/store').Writable<any>} */
export const baralhoAtual = writable(null);

/** @type {import('svelte/store').Writable<any>} */
export const idPastaAtiva = writable(null);

/** @type {import('svelte/store').Writable<any>} */
export const parametrosRota = writable({ idPasta: null });

// --- TEMA ---
const temaSalvo =
  typeof localStorage !== "undefined" && localStorage.getItem("flashmind-tema");
export const modoEscuro = writable(temaSalvo === "escuro");

modoEscuro.subscribe((ativo) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("flashmind-tema", ativo ? "escuro" : "claro");
    if (ativo) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }
});

// --- BUSCAR DADOS DO SUPABASE ---
export const buscarDados = async () => {
  try {
    const { data: dadosPastas, error: erroPastas } = await supabase
      .from("folders")
      .select("*")
      .order("created_at");

    if (erroPastas) throw erroPastas;
    if (dadosPastas) pastas.set(dadosPastas);

    const { data: dadosBaralhos, error: erroBaralhos } = await supabase
      .from("decks")
      .select("*, cards(*)")
      .order("created_at");

    if (erroBaralhos) throw erroBaralhos;

    if (dadosBaralhos) {
      const formatados = dadosBaralhos.map((b) => ({
        ...b,
        cartoes: b.cards || [],
      }));
      baralhos.set(formatados);
    }
  } catch (erro) {
    // Solução para o erro 'erro is of type unknown'
    if (erro instanceof Error) {
      console.error("Erro ao sincronizar:", erro.message);
    } else {
      console.error("Erro ao sincronizar:", erro);
    }
  }
};

// --- NAVEGAÇÃO ---
/**
 * @param {string} visualizacao
 * @param {any} baralho
 * @param {any} params
 */
export const navegarPara = (
  visualizacao,
  baralho = null,
  params = { idPasta: null },
) => {
  baralhoAtual.set(baralho);
  parametrosRota.set(params);
  visualizacaoAtual.set(visualizacao);
};

// --- LISTENER DE AUTENTICAÇÃO ---
let telaAtual = "login";
visualizacaoAtual.subscribe((valor) => {
  telaAtual = valor;
});

supabase.auth.getSession().then(({ data: { session } }) => {
  usuario.set(session?.user ?? null);
  if (session?.user) {
    buscarDados();
    if (telaAtual === "login") {
      visualizacaoAtual.set(shareId ? "compartilhado" : "home");
    }
  } else {
    visualizacaoAtual.set("login");
  }
});

supabase.auth.onAuthStateChange((event, session) => {
  usuario.set(session?.user ?? null);
  if (session?.user) {
    buscarDados();
    if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
      if (telaAtual === "login") {
        visualizacaoAtual.set(shareId ? "compartilhado" : "home");
      }
    }
  } else {
    visualizacaoAtual.set("login");
    baralhos.set([]);
    pastas.set([]);
  }
});
