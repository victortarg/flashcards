import { writable } from "svelte/store";

// --- PERSISTÊNCIA DE DADOS ---
const carregarDados = (key, defaultVal) => {
  if (typeof localStorage !== "undefined") {
    const dados = localStorage.getItem(key);
    if (dados) {
      try {
        return JSON.parse(dados);
      } catch (e) {
        // Se der erro (ex: dado antigo salvo como texto puro), retorna o padrão
        return defaultVal;
      }
    }
  }
  return defaultVal;
};

// Decks (Blocos)
export const decks = writable(carregarDados("flashmind-data", []));
decks.subscribe((val) => {
  if (typeof localStorage !== "undefined")
    localStorage.setItem("flashmind-data", JSON.stringify(val));
});

// Pastas
export const folders = writable(carregarDados("flashmind-folders", []));
folders.subscribe((val) => {
  if (typeof localStorage !== "undefined")
    localStorage.setItem("flashmind-folders", JSON.stringify(val));
});

// --- ESTADO DA APLICAÇÃO ---
export const currentView = writable("home");
export const currentDeck = writable(null);

// NOVO: Pasta Atual (Persistente)
// Isso garante que o app lembre em qual pasta você estava
export const activeFolderId = writable(
  carregarDados("flashmind-active-folder", null)
);
activeFolderId.subscribe((val) => {
  if (typeof localStorage !== "undefined")
    localStorage.setItem("flashmind-active-folder", JSON.stringify(val));
});

export const routeParams = writable({ folderId: null });

// Tema
export const isDarkMode = writable(
  carregarDados("flashmind-theme", false) === true
);

isDarkMode.subscribe((val) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("flashmind-theme", JSON.stringify(val));

    if (val) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }
});

// Navegação
export const navigateTo = (view, deck = null, params = { folderId: null }) => {
  currentDeck.set(deck);
  routeParams.set(params);
  currentView.set(view);
};
