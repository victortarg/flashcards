<script>
  import { onMount } from "svelte";
  import { supabase } from "../lib/supabaseClient";
  import {
    idCompartilhado,
    modoEscuro,
    navegarPara,
    buscarDados,
    usuario,
  } from "../stores.js";

  let baralhoBuscado = null;
  let cartoesBuscados = [];
  let carregando = true;
  let erro = null;
  let salvando = false;

  onMount(async () => {
    if (!$idCompartilhado) {
      navegarPara("home");
      return;
    }

    try {
      const { data: dadosBaralho, error: erroBaralho } = await supabase
        .from("decks")
        .select("*")
        .eq("id", $idCompartilhado)
        .single();

      if (erroBaralho) throw erroBaralho;
      baralhoBuscado = dadosBaralho;

      const { data: dadosCartoes, error: erroCartoes } = await supabase
        .from("cards")
        .select("*")
        .eq("deck_id", $idCompartilhado);

      if (erroCartoes) throw erroCartoes;
      cartoesBuscados = dadosCartoes || [];
    } catch (e) {
      erro = "Baralho não encontrado ou o link expirou.";
    } finally {
      carregando = false;
    }
  });

  async function clonarParaMinhaConta() {
    salvando = true;
    try {
      const { data: novoBaralho, error: erroCriarBaralho } = await supabase
        .from("decks")
        .insert({
          title: baralhoBuscado.title + " (Cópia)",
          color: baralhoBuscado.color,
          folder_id: null,
          is_public: false,
        })
        .select()
        .single();

      if (erroCriarBaralho) throw erroCriarBaralho;

      if (cartoesBuscados.length > 0) {
        const novosCartoes = cartoesBuscados.map((c) => ({
          front: c.front,
          back: c.back,
          image_url: c.image_url,
          deck_id: novoBaralho.id,
          user_id: $usuario.id,
        }));

        const { error: erroInserirCartoes } = await supabase
          .from("cards")
          .insert(novosCartoes);
        if (erroInserirCartoes) throw erroInserirCartoes;
      }

      window.history.replaceState({}, document.title, "/");
      idCompartilhado.set(null);
      await buscarDados();
      navegarPara("home");
    } catch (e) {
      alert("Erro ao importar: " + e.message);
    } finally {
      salvando = false;
    }
  }

  function cancelar() {
    window.history.replaceState({}, document.title, "/");
    idCompartilhado.set(null);
    navegarPara("home");
  }
</script>

<div class="max-w-md mx-auto mt-12 text-center animate-fade-in">
  {#if carregando}
    <div
      class="flex flex-col items-center justify-center gap-4 text-indigo-500"
    >
      <svg
        class="animate-spin h-10 w-10"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p
        class="text-lg font-medium {$modoEscuro
          ? 'text-gray-300'
          : 'text-gray-600'}"
      >
        Procurando baralho...
      </p>
    </div>
  {:else if erro}
    <div
      class="p-8 rounded-2xl border shadow-sm {$modoEscuro
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'}"
    >
      <div
        class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6"
      >
        <svg
          class="h-8 w-8 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2
        class="text-2xl font-bold mb-2 {$modoEscuro
          ? 'text-white'
          : 'text-gray-900'}"
      >
        Oops!
      </h2>
      <p class="mb-8 {$modoEscuro ? 'text-gray-400' : 'text-gray-600'}">
        {erro}
      </p>
      <button
        on:click={cancelar}
        class="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition"
        >Ir para o Início</button
      >
    </div>
  {:else}
    <div
      class="p-8 rounded-2xl shadow-xl border {$modoEscuro
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-100'}"
    >
      <div
        class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-6"
      >
        <svg
          class="h-8 w-8 text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
      </div>

      <h2
        class="text-2xl font-bold mb-2 {$modoEscuro
          ? 'text-white'
          : 'text-gray-900'}"
      >
        Baralho Recebido
      </h2>
      <p class="mb-6 {$modoEscuro ? 'text-gray-400' : 'text-gray-600'}">
        Você recebeu o baralho <strong
          class={$modoEscuro ? "text-indigo-400" : "text-indigo-600"}
          >"{baralhoBuscado.title}"</strong
        >.
      </p>

      <div
        class="flex items-center justify-center gap-2 mb-8 text-sm font-medium px-4 py-3 rounded-lg {$modoEscuro
          ? 'bg-gray-700 text-gray-300'
          : 'bg-gray-50 text-gray-700'}"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 opacity-75"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          /></svg
        >
        Contém {cartoesBuscados.length} cartões
      </div>

      <div class="flex flex-col gap-3">
        <button
          on:click={clonarParaMinhaConta}
          disabled={salvando}
          class="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {#if salvando}
            Salvando...
          {:else}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              /></svg
            >
            Adicionar à Minha Conta
          {/if}
        </button>
        <button
          on:click={cancelar}
          disabled={salvando}
          class="w-full py-3 font-medium rounded-xl transition {$modoEscuro
            ? 'text-gray-300 hover:bg-gray-700'
            : 'text-gray-600 hover:bg-gray-50'}"
        >
          Recusar
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
