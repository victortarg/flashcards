<script>
  export let frente = "";
  export let verso = "";
  export let imagemFrente = null;
  export let imagemVerso = null;
  export let revelado = false;
  export let darkMode = false;

  let imagemParaExpandir = null;

  const virar = () => {
    if (imagemParaExpandir) return;
    revelado = !revelado;
  };

  const expandir = (e, img) => {
    e.stopPropagation();
    imagemParaExpandir = img;
  };

  const fecharZoom = () => {
    imagemParaExpandir = null;
  };
</script>

{#if imagemParaExpandir}
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in"
    on:click={fecharZoom}
    role="button"
    tabindex="0"
  >
    <button
      class="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path
          d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
        />
      </svg>
    </button>
    <img
      src={imagemParaExpandir}
      alt="Zoom"
      class="max-w-full max-h-full object-contain shadow-2xl animate-zoom"
    />
  </div>
{/if}

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
    <div
      class="absolute inset-0 w-full h-full rounded-xl shadow-lg border-2 flex flex-col [backface-visibility:hidden] overflow-hidden transition-colors duration-300
      {darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'}"
    >
      <div
        class="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center {darkMode
          ? 'scrollbar-thin-dark'
          : 'scrollbar-thin'}"
      >
        {#if imagemFrente}
          <div class="relative group/img mb-3">
            <img
              src={imagemFrente}
              alt="Imagem da pergunta"
              class="max-h-32 w-auto object-contain rounded-lg shadow-sm {darkMode
                ? 'border border-gray-600 bg-gray-700'
                : 'border border-gray-100'}"
            />
            <button
              on:click={(e) => expandir(e, imagemFrente)}
              class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/img:opacity-100 transition rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="white"
                viewBox="0 0 16 16"
              >
                <path
                  d="M1.5 15a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 1 0v3.5h3.5a.5.5 0 0 1 0 1h-4ZM15 1.5a.5.5 0 0 1-.5.5h-3.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-3.5Z"
                />
              </svg>
            </button>
          </div>
        {/if}

        <p
          class="text-xl font-bold text-center whitespace-pre-line leading-relaxed {darkMode
            ? 'text-gray-100'
            : 'text-gray-800'}"
        >
          {frente}
        </p>
      </div>

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

    <div
      class="absolute inset-0 w-full h-full bg-indigo-600 rounded-xl shadow-xl flex flex-col [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden"
    >
      <div
        class="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center scrollbar-thin-light"
      >
        {#if imagemVerso}
          <div class="relative group/img mb-4">
            <img
              src={imagemVerso}
              alt="Imagem da resposta"
              class="max-h-32 w-auto object-contain rounded-lg shadow-md border border-white/20 bg-white/10"
            />
            <button
              on:click={(e) => expandir(e, imagemVerso)}
              class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/img:opacity-100 transition rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="white"
                viewBox="0 0 16 16"
              >
                <path
                  d="M1.5 15a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 1 0v3.5h3.5a.5.5 0 0 1 0 1h-4ZM15 1.5a.5.5 0 0 1-.5.5h-3.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-3.5Z"
                />
              </svg>
            </button>
          </div>
        {/if}

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

  /* Animações Modal Zoom */
  .animate-fade-in {
    animation: fadeIn 0.2s ease-out;
  }
  .animate-zoom {
    animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes zoomIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
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
