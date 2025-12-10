<script>
  import { baralhoAtual, modoEscuro, navegarPara } from "../stores.js";
</script>

<div
  class="flex flex-col items-center justify-center py-12 text-center h-full animate-fade-in"
>
  <div
    class="p-8 rounded-full mb-8 shadow-sm {$modoEscuro
      ? 'bg-green-900/20'
      : 'bg-green-100'}"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-16 w-16 {$modoEscuro ? 'text-green-400' : 'text-green-600'}"
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
    class="text-3xl font-bold mb-2 {$modoEscuro
      ? 'text-white'
      : 'text-gray-800'}"
  >
    Parabéns!
  </h2>

  <p
    class="mb-8 text-lg max-w-xs mx-auto {$modoEscuro
      ? 'text-gray-400'
      : 'text-gray-500'}"
  >
    Você concluiu todos os {$baralhoAtual.cartoes.length} cartões do bloco
    <span
      class="font-semibold {$modoEscuro
        ? 'text-indigo-400'
        : 'text-indigo-600'}">"{$baralhoAtual.title}"</span
    >.
  </p>

  <div class="flex flex-col sm:flex-row gap-4 w-full max-w-sm px-4">
    <button
      on:click={() => navegarPara("home")}
      class="flex-1 py-3 px-6 rounded-xl font-bold border transition shadow-sm flex items-center justify-center gap-2
      {$modoEscuro
        ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
      Início
    </button>

    <button
      on:click={() => navegarPara("estudo", $baralhoAtual)}
      class="flex-1 py-3 px-6 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
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
