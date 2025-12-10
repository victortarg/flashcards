import { writable } from "svelte/store";
import { supabase } from "./lib/supabaseClient";

// --- ESTADO DO USUÁRIO ---
export const usuario = writable(null);

// --- DADOS DA NUVEM (Cache local) ---
export const baralhos = writable([]);
export const pastas = writable([]);

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
    // 1. Buscar Pastas
    const { data: dadosPastas, error: erroPastas } = await supabase
      .from("folders")
      .select("*")
      .order("created_at");

    if (erroPastas) throw erroPastas;
    if (dadosPastas) pastas.set(dadosPastas);

    // 2. Buscar Baralhos e Cartões
    // O select('*, cards(*)') faz um "JOIN" automático e traz os cartões dentro do baralho
    const { data: dadosBaralhos, error: erroBaralhos } = await supabase
      .from("decks")
      .select("*, cards(*)")
      .order("created_at");

    if (erroBaralhos) throw erroBaralhos;

    if (dadosBaralhos) {
      // Mapeia para garantir que a propriedade se chame 'cartoes' no front-end
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
  params = { idPasta: null }
) => {
  baralhoAtual.set(baralho);
  parametrosRota.set(params);
  visualizacaoAtual.set(visualizacao);
};

// --- LISTENER DE AUTENTICAÇÃO ---
// Isso roda assim que o app abre para ver se tem alguém logado
supabase.auth.getSession().then(({ data: { session } }) => {
  usuario.set(session?.user ?? null);
  if (session?.user) {
    visualizacaoAtual.set("home");
    buscarDados(); // Se logado, busca os dados
  } else {
    visualizacaoAtual.set("login");
  }
});

// Escuta mudanças (ex: se clicar em Sair ou o token expirar)
supabase.auth.onAuthStateChange((_event, session) => {
  usuario.set(session?.user ?? null);
  if (session?.user) {
    visualizacaoAtual.set("home");
    buscarDados();
  } else {
    visualizacaoAtual.set("login");
    baralhos.set([]); // Limpa memória por segurança
    pastas.set([]);
  }
});
