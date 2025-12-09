<script>
  import { currentDeck, isDarkMode, navigateTo } from "../stores.js";
</script>

<div
  class="flex flex-col items-center justify-center py-12 text-center h-full animate-fade-in"
>
  <div
    class="p-8 rounded-full mb-8 shadow-sm {$isDarkMode
      ? 'bg-green-900/20'
      : 'bg-green-100'}"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-16 w-16 {$isDarkMode ? 'text-green-400' : 'text-green-600'}"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  </div>

  <h2
    class="text-3xl font-bold mb-2 {$isDarkMode
      ? 'text-white'
      : 'text-gray-800'}"
  >
    Parabéns!
  </h2>
  <p
    class="mb-8 text-lg max-w-xs mx-auto {$isDarkMode
      ? 'text-gray-400'
      : 'text-gray-500'}"
  >
    Você concluiu todos os {$currentDeck.cards.length} cartões do bloco
    <span
      class="font-semibold {$isDarkMode
        ? 'text-indigo-400'
        : 'text-indigo-600'}">"{$currentDeck.titulo}"</span
    >.
  </p>

  <div class="flex flex-col sm:flex-row gap-4 w-full max-w-sm px-4">
    <button
      on:click={() => navigateTo("home")}
      class="flex-1 py-3 px-6 rounded-xl font-bold border transition shadow-sm
      {$isDarkMode
        ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}"
    >
      Início
    </button>
    <button
      on:click={() => navigateTo("study", $currentDeck)}
      class="flex-1 py-3 px-6 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition"
    >
      Reiniciar
    </button>
  </div>
</div>

<style>
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
