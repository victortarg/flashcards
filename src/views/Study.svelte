<script>
  import { currentDeck, isDarkMode, navigateTo } from "../stores.js";
  import Flashcard from "../components/Flashcard.svelte";

  let cardIndex = 0;
  let isCardRevelado = false;

  // Se não tiver deck selecionado, volta pra home (segurança)
  if (!$currentDeck) navigateTo("home");

  function proximoCard() {
    if (cardIndex < $currentDeck.cards.length - 1) {
      isCardRevelado = false;
      setTimeout(() => cardIndex++, 150);
    } else {
      navigateTo("conclusao", $currentDeck);
    }
  }

  function anteriorCard() {
    if (cardIndex > 0) {
      isCardRevelado = false;
      setTimeout(() => cardIndex--, 150);
    }
  }
</script>

<div
  class="flex flex-col items-center justify-center h-full pt-4 max-w-xl mx-auto"
>
  <div class="w-full flex items-center gap-3 mb-6">
    <span
      class="text-xs font-bold w-8 text-right {$isDarkMode
        ? 'text-indigo-400'
        : 'text-indigo-600'}"
      >{Math.round(((cardIndex + 1) / $currentDeck.cards.length) * 100)}%</span
    >
    <div
      class="flex-1 h-2 rounded-full overflow-hidden {$isDarkMode
        ? 'bg-gray-700'
        : 'bg-gray-200'}"
    >
      <div
        class="bg-indigo-500 h-full transition-all duration-300 ease-out"
        style="width: {((cardIndex + 1) / $currentDeck.cards.length) * 100}%"
      ></div>
    </div>
  </div>

  <p
    class="text-xs mb-4 font-bold uppercase tracking-widest flex items-center gap-2 {$isDarkMode
      ? 'text-gray-500'
      : 'text-gray-400'}"
  >
    Cartão {cardIndex + 1} de {$currentDeck.cards.length}
  </p>

  <div class="w-full mb-8 px-2">
    <Flashcard
      frente={$currentDeck.cards[cardIndex].frente}
      verso={$currentDeck.cards[cardIndex].verso}
      imagem={$currentDeck.cards[cardIndex].imagem}
      bind:revelado={isCardRevelado}
      darkMode={$isDarkMode}
    />
  </div>

  <div class="flex gap-4 w-full px-2">
    <button
      on:click={anteriorCard}
      disabled={cardIndex === 0}
      class="flex-1 py-4 rounded-xl font-bold border transition shadow-sm flex items-center justify-center gap-2
          {$isDarkMode
        ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-30'
        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40'}"
    >
      ← Anterior
    </button>
    <button
      on:click={proximoCard}
      class="flex-1 py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition transform active:scale-95 flex items-center justify-center gap-2"
    >
      {cardIndex === $currentDeck.cards.length - 1 ? "Concluir" : "Próximo →"}
    </button>
  </div>
</div>
