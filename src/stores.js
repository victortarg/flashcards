import { writable } from "svelte/store";

// Função auxiliar para carregar do localStorage
const carregarDados = () => {
  const dadosSalvos = localStorage.getItem("flashcards-data");
  if (dadosSalvos) return JSON.parse(dadosSalvos);

  // Dados iniciais de exemplo
  return [
    {
      id: 1,
      titulo: "Inglês Básico",
      cor: "bg-indigo-500",
      cards: [
        { id: 1, frente: "Hello", verso: "Olá" },
        { id: 2, frente: "Apple", verso: "Maçã" },
      ],
    },
  ];
};

export const decks = writable(carregarDados());

// Subscreve ao store para salvar qualquer alteração no localStorage
decks.subscribe((val) => {
  localStorage.setItem("flashcards-data", JSON.stringify(val));
});
