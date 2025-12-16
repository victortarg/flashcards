<script>
  import { baralhoAtual, modoEscuro, navegarPara } from "../stores.js";
  import Flashcard from "../components/Flashcard.svelte";

  let indiceCartao = 0;
  let cartaoRevelado = false;

  // Se não tiver baralho selecionado, volta pra home por segurança
  if (!$baralhoAtual) navegarPara("home");

  function proximoCartao() {
    if (indiceCartao < $baralhoAtual.cartoes.length - 1) {
      cartaoRevelado = false;
      setTimeout(() => indiceCartao++, 150);
    } else {
      navegarPara("conclusao", $baralhoAtual);
    }
  }

  function cartaoAnterior() {
    if (indiceCartao > 0) {
      cartaoRevelado = false;
      setTimeout(() => indiceCartao--, 150);
    }
  }
</script>

<div
  class="flex flex-col items-center justify-center h-full pt-4 max-w-xl mx-auto"
>
  <!-- Barra de Progresso -->
  <div class="w-full flex items-center gap-3 mb-6">
    <span
      class="text-xs font-bold w-8 text-right {$modoEscuro
        ? 'text-indigo-400'
        : 'text-indigo-600'}"
    >
      {Math.round(((indiceCartao + 1) / $baralhoAtual.cartoes.length) * 100)}%
    </span>
    <div
      class="flex-1 h-2 rounded-full overflow-hidden {$modoEscuro
        ? 'bg-gray-700'
        : 'bg-gray-200'}"
    >
      <div
        class="bg-indigo-500 h-full transition-all duration-300 ease-out"
        style="width: {((indiceCartao + 1) / $baralhoAtual.cartoes.length) *
          100}%"
      ></div>
    </div>
  </div>

  <p
    class="text-xs mb-4 font-bold uppercase tracking-widest flex items-center gap-2 {$modoEscuro
      ? 'text-gray-500'
      : 'text-gray-400'}"
  >
    Cartão {indiceCartao + 1} de {$baralhoAtual.cartoes.length}
  </p>

  <!-- Componente Flashcard -->
  <div class="w-full mb-8 px-2">
    <Flashcard
      frente={$baralhoAtual.cartoes[indiceCartao].front}
      verso={$baralhoAtual.cartoes[indiceCartao].back}
      imagem={$baralhoAtual.cartoes[indiceCartao].image_url}
      bind:revelado={cartaoRevelado}
      darkMode={$modoEscuro}
    />
  </div>

  <!-- Botões de Controle -->
  <div class="flex gap-4 w-full px-2">
    <button
      on:click={cartaoAnterior}
      disabled={indiceCartao === 0}
      class="flex-1 py-4 rounded-xl font-bold border transition shadow-sm flex items-center justify-center gap-2
          {$modoEscuro
        ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-30'
        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40'}"
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
          d="M15 19l-7-7 7-7"
        />
      </svg>
      Anterior
    </button>

    <button
      on:click={proximoCartao}
      class="flex-1 py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition transform active:scale-95 flex items-center justify-center gap-2"
    >
      {#if indiceCartao === $baralhoAtual.cartoes.length - 1}
        Concluir
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
            d="M5 13l4 4L19 7"
          />
        </svg>
      {:else}
        Próximo
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      {/if}
    </button>
  </div>
</div>
