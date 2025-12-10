<script>
  export let frente = "";
  export let verso = "";
  export let imagem = null;
  export let revelado = false;
  export let darkMode = false; // Controlado pelo pai (Study.svelte) via store $modoEscuro

  const virar = () => {
    revelado = !revelado;
  };
</script>

<!-- Container do Card -->
<div
  class="group w-full h-72 sm:h-80 [perspective:1000px] cursor-pointer"
  on:click={virar}
  on:keydown={(e) => e.key === "Enter" && virar()}
  role="button"
  tabindex="0"
>
  <div
    class="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d]"
    class:rotate-y-180={revelado}
  >
    <!-- ================= FRENTE ================= -->
    <div
      class="absolute inset-0 w-full h-full rounded-xl shadow-lg border-2 flex flex-col [backface-visibility:hidden] overflow-hidden transition-colors duration-300
      {darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'}"
    >
      <!-- Área de conteúdo (Texto + Imagem) -->
      <div
        class="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center {darkMode
          ? 'scrollbar-thin-dark'
          : 'scrollbar-thin'}"
      >
        {#if imagem}
          <img
            src={imagem}
            alt="Imagem da pergunta"
            class="max-h-32 w-auto object-contain rounded-lg mb-3 shadow-sm {darkMode
              ? 'border border-gray-600 bg-gray-700'
              : 'border border-gray-100'}"
          />
        {/if}

        <p
          class="text-xl font-bold text-center whitespace-pre-line leading-relaxed {darkMode
            ? 'text-gray-100'
            : 'text-gray-800'}"
        >
          {frente}
        </p>
      </div>

      <!-- Rodapé -->
      <div
        class="h-10 flex items-center justify-center border-t shrink-0 {darkMode
          ? 'border-gray-700 bg-gray-800'
          : 'border-gray-50 bg-gray-50'}"
      >
        <span
          class="text-[10px] uppercase tracking-widest font-bold {darkMode
            ? 'text-gray-500'
            : 'text-gray-400'}">Ver Resposta</span
        >
      </div>
    </div>

    <!-- ================= VERSO ================= -->
    <div
      class="absolute inset-0 w-full h-full bg-indigo-600 rounded-xl shadow-xl flex flex-col [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden"
    >
      <div
        class="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center scrollbar-thin-light"
      >
        <p
          class="text-xl font-medium text-white text-center whitespace-pre-line leading-relaxed"
        >
          {verso}
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  .rotate-y-180 {
    transform: rotateY(180deg);
  }

  /* Scrollbar Clara */
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Scrollbar Escura */
  .scrollbar-thin-dark::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin-dark::-webkit-scrollbar-thumb {
    background-color: #4b5563;
    border-radius: 10px;
  }
  .scrollbar-thin-dark::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Scrollbar Verso (Sempre clara pois o fundo é roxo) */
  .scrollbar-thin-light::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin-light::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 10px;
  }
  .scrollbar-thin-light::-webkit-scrollbar-track {
    background: transparent;
  }
</style>
