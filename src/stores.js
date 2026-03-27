import { writable, get } from "svelte/store";
import { supabase } from "./lib/supabaseClient";

// --- ESTADO DO USUÁRIO ---
export const usuario = writable(null);

// --- DADOS DA NUVEM (Cache local) ---
export const baralhos = writable([]);
export const pastas = writable([]);

// --- COMPARTILHAMENTO ---
// Lê a URL apenas uma vez quando o app inicia
const urlParams =
  typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
export const idCompartilhado = writable(
  urlParams ? urlParams.get("share") : null,
);

// --- ESTADO DA UI ---
export const visualizacaoAtual = writable("login"); // Começa no login
export const baralhoAtual = writable(null);
export const idPastaAtiva = writable(null);
export const parametrosRota = writable({ idPasta: null });

// --- TEMA (Mantemos local pois é preferência de dispositivo) ---
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

// --- FUNÇÃO: BUSCAR DADOS DO SUPABASE ---
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
    console.error("Erro ao sincronizar:", erro.message);
  }
};

// --- NAVEGAÇÃO ---
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
supabase.auth.getSession().then(({ data: { session } }) => {
  usuario.set(session?.user ?? null);
  if (session?.user) {
    buscarDados();
    // Redireciona para compartilhamento ou home de forma síncrona
    if (get(idCompartilhado)) {
      visualizacaoAtual.set("compartilhado");
    } else {
      visualizacaoAtual.set("home");
    }
  } else {
    visualizacaoAtual.set("login");
  }
});

supabase.auth.onAuthStateChange((_event, session) => {
  usuario.set(session?.user ?? null);
  if (session?.user) {
    buscarDados();
    if (get(idCompartilhado)) {
      visualizacaoAtual.set("compartilhado");
    } else {
      visualizacaoAtual.set("home");
    }
  } else {
    visualizacaoAtual.set("login");
    baralhos.set([]);
    pastas.set([]);
  }
});
