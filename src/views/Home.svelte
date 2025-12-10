<script>
  import {
    baralhos,
    pastas,
    idPastaAtiva,
    modoEscuro,
    navegarPara,
    buscarDados,
  } from "../stores.js";
  import { supabase } from "../lib/supabaseClient";

  // --- Filtros ---
  // Filtra os baralhos para mostrar apenas os da pasta atual (ou da raiz)
  $: baralhosFiltrados = $baralhos.filter((b) => {
    if ($idPastaAtiva) return b.folder_id === $idPastaAtiva; // Nota: folder_id é o nome da coluna no banco
    return !b.folder_id; // Raiz
  });

  $: pastaAtual = $pastas.find((p) => p.id === $idPastaAtiva);

  // --- Controle do Modal (Criar/Renomear) ---
  let mostrarModal = false;
  let modoModal = "criar_pasta"; // 'criar_pasta', 'editar_pasta', 'renomear_baralho'
  let valorInputModal = "";
  let idAlvoModal = null;
  let refInput;

  function abrirModalCriarPasta() {
    modoModal = "criar_pasta";
    valorInputModal = "";
    mostrarModal = true;
    setTimeout(() => refInput?.focus(), 50);
  }

  function abrirModalEditarPasta(pasta, e) {
    e.stopPropagation();
    modoModal = "editar_pasta";
    valorInputModal = pasta.name;
    idAlvoModal = pasta.id;
    mostrarModal = true;
    setTimeout(() => refInput?.focus(), 50);
  }

  function abrirModalRenomearBaralho(baralho, e) {
    e.stopPropagation();
    modoModal = "renomear_baralho";
    valorInputModal = baralho.title; // title é coluna do banco
    idAlvoModal = baralho.id;
    mostrarModal = true;
    setTimeout(() => refInput?.focus(), 50);
  }

  function fecharModal() {
    mostrarModal = false;
    valorInputModal = "";
  }

  // --- Ações no Banco de Dados (Supabase) ---

  async function confirmarModal() {
    if (!valorInputModal.trim()) return;
    const valor = valorInputModal.trim();
    fecharModal(); // Fecha rápido para UX

    try {
      if (modoModal === "criar_pasta") {
        const { error } = await supabase
          .from("folders")
          .insert({ name: valor });
        if (error) throw error;
      } else if (modoModal === "editar_pasta") {
        const { error } = await supabase
          .from("folders")
          .update({ name: valor })
          .eq("id", idAlvoModal);
        if (error) throw error;
      } else if (modoModal === "renomear_baralho") {
        const { error } = await supabase
          .from("decks")
          .update({ title: valor })
          .eq("id", idAlvoModal);
        if (error) throw error;
      }
      // Recarrega dados para atualizar a tela
      await buscarDados();
    } catch (erro) {
      alert("Erro ao salvar: " + erro.message);
    }
  }

  async function deletarPasta(id, e) {
    e.stopPropagation();
    if (
      confirm(
        "Tem certeza? Os baralhos dentro desta pasta ficarão soltos na raiz."
      )
    ) {
      try {
        // 1. Desvincula baralhos (update folder_id = null)
        await supabase
          .from("decks")
          .update({ folder_id: null })
          .eq("folder_id", id);
        // 2. Deleta a pasta
        await supabase.from("folders").delete().eq("id", id);

        if ($idPastaAtiva === id) idPastaAtiva.set(null);
        buscarDados();
      } catch (erro) {
        alert("Erro ao deletar: " + erro.message);
      }
    }
  }

  async function deletarBaralho(id, e) {
    e.stopPropagation();
    if (confirm("Apagar este baralho e todos os seus cartões?")) {
      try {
        // O banco está configurado com 'cascade', então deletar o deck deleta os cards automaticamente
        await supabase.from("decks").delete().eq("id", id);
        buscarDados();
      } catch (erro) {
        alert("Erro: " + erro.message);
      }
    }
  }

  // --- Navegação ---
  function entrarPasta(id) {
    idPastaAtiva.set(id);
  }
  function sairPasta() {
    idPastaAtiva.set(null);
  }

  function irParaCriarBaralho() {
    navegarPara("criar-baralho", null, { idPasta: $idPastaAtiva });
  }
</script>

<!-- Header da Home -->
<div
  class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4"
>
  <div class="flex items-center gap-2 w-full sm:w-auto">
    {#if $idPastaAtiva && pastaAtual}
      <button
        on:click={sairPasta}
        class="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition shrink-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 {$modoEscuro ? 'text-white' : 'text-gray-700'}"
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
      </button>
      <div class="overflow-hidden">
        <h2
          class="text-2xl font-bold truncate {$modoEscuro
            ? 'text-white'
            : 'text-gray-900'}"
        >
          {pastaAtual.name}
        </h2>
        <p
          class="text-sm mt-1 truncate {$modoEscuro
            ? 'text-gray-400'
            : 'text-gray-500'}"
        >
          Visualizando pasta
        </p>
      </div>
    {:else}
      <div>
        <h2
          class="text-2xl font-bold {$modoEscuro
            ? 'text-white'
            : 'text-gray-900'}"
        >
          Seus Baralhos
        </h2>
        <p
          class="text-sm mt-1 {$modoEscuro ? 'text-gray-400' : 'text-gray-500'}"
        >
          Organize seus estudos
        </p>
      </div>
    {/if}
  </div>

  <div class="flex gap-2 w-full sm:w-auto">
    {#if !$idPastaAtiva}
      <button
        on:click={abrirModalCriarPasta}
        class="flex-1 sm:flex-none border border-indigo-200 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition text-sm font-bold flex items-center justify-center gap-2 {$modoEscuro
          ? 'border-gray-600 text-indigo-400 hover:bg-gray-800'
          : ''}"
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
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <span class="whitespace-nowrap">Nova Pasta</span>
      </button>
    {/if}

    <button
      on:click={irParaCriarBaralho}
      class="flex-1 sm:flex-none bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition text-sm font-bold flex items-center justify-center gap-2"
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
          d="M12 4v16m8-8H4"
        />
      </svg>
      <span class="whitespace-nowrap">Novo Baralho</span>
    </button>
  </div>
</div>

<!-- GRID DE PASTAS -->
{#if !$idPastaAtiva && $pastas.length > 0}
  <div class="mb-8">
    <h3
      class="text-sm font-bold uppercase tracking-wider mb-3 {$modoEscuro
        ? 'text-gray-500'
        : 'text-gray-400'}"
    >
      Pastas
    </h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {#each $pastas as pasta (pasta.id)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          on:click={() => entrarPasta(pasta.id)}
          class="p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:shadow-md relative group
          {$modoEscuro
            ? 'bg-gray-800 border-gray-700 hover:border-indigo-500'
            : 'bg-white border-gray-200 hover:border-indigo-300'}"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
            />
          </svg>
          <span
            class="font-medium text-center truncate w-full text-sm sm:text-base {$modoEscuro
              ? 'text-gray-200'
              : 'text-gray-700'}">{pasta.name}</span
          >

          <button
            on:click={(e) => abrirModalEditarPasta(pasta, e)}
            class="absolute top-1 left-1 p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition {$modoEscuro
              ? 'hover:bg-gray-700 text-gray-500'
              : 'hover:bg-gray-100 text-gray-400'}"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              /></svg
            >
          </button>

          <button
            on:click={(e) => deletarPasta(pasta.id, e)}
            class="absolute top-1 right-1 p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition {$modoEscuro
              ? 'hover:bg-gray-700 text-gray-500'
              : 'hover:bg-gray-100 text-gray-400'}"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              ><path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              /></svg
            >
          </button>
        </div>
      {/each}
    </div>
  </div>
{/if}

<!-- GRID DE BARALHOS -->
<div>
  <h3
    class="text-sm font-bold uppercase tracking-wider mb-3 {$modoEscuro
      ? 'text-gray-500'
      : 'text-gray-400'}"
  >
    {$idPastaAtiva && pastaAtual
      ? `Baralhos em "${pastaAtual.name}"`
      : "Baralhos Soltos"}
  </h3>

  {#if baralhosFiltrados.length === 0}
    <div
      class="text-center py-16 rounded-xl border border-dashed transition-colors {$modoEscuro
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-300'}"
    >
      <p class="mb-2 {$modoEscuro ? 'text-gray-500' : 'text-gray-400'}">
        {$idPastaAtiva
          ? "Esta pasta está vazia."
          : "Nenhum baralho criado aqui."}
      </p>
      <button
        on:click={irParaCriarBaralho}
        class="text-indigo-500 font-medium hover:underline"
      >
        Criar novo baralho aqui
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {#each baralhosFiltrados as baralho (baralho.id)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          on:click={() => navegarPara("detalhes", baralho)}
          class="p-6 rounded-xl shadow-sm border transition-all cursor-pointer relative group overflow-hidden hover:shadow-md
          {$modoEscuro
            ? 'bg-gray-800 border-gray-700 hover:border-indigo-500'
            : 'bg-white border-gray-100 hover:border-indigo-100'}"
        >
          <div class="absolute top-0 left-0 w-1.5 h-full {baralho.color}"></div>
          <div class="flex justify-between items-start mb-2">
            <h3
              class="font-bold text-lg line-clamp-1 pr-2 {$modoEscuro
                ? 'text-gray-100'
                : 'text-gray-800'}"
            >
              {baralho.title}
            </h3>

            <div class="flex gap-1">
              <button
                on:click={(e) => abrirModalRenomearBaralho(baralho, e)}
                class="p-1 rounded transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100 {$modoEscuro
                  ? 'text-gray-500 hover:text-indigo-400 hover:bg-gray-700'
                  : 'text-gray-300 hover:text-indigo-500 hover:bg-indigo-50'}"
              >
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  /></svg
                >
              </button>
              <button
                on:click={(e) => deletarBaralho(baralho.id, e)}
                class="p-1 rounded transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100 {$modoEscuro
                  ? 'text-gray-500 hover:text-red-400 hover:bg-gray-700'
                  : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}"
              >
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  /></svg
                >
              </button>
            </div>
          </div>
          <div
            class="flex items-center gap-2 text-sm {$modoEscuro
              ? 'text-gray-400'
              : 'text-gray-500'}"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
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
            <span
              class="px-2 py-0.5 rounded text-xs font-medium {$modoEscuro
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-100'}">{baralho.cartoes?.length || 0} cartões</span
            >
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- MODAL GENÉRICO -->
{#if mostrarModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    style="background-color: rgba(0,0,0,0.5); backdrop-filter: blur(4px);"
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="absolute inset-0" on:click={fecharModal}></div>
    <div
      class="w-full max-w-sm rounded-xl shadow-2xl p-6 relative z-10 transition-colors {$modoEscuro
        ? 'bg-gray-800'
        : 'bg-white'}"
    >
      <h3
        class="text-lg font-bold mb-4 text-center {$modoEscuro
          ? 'text-white'
          : 'text-gray-900'}"
      >
        {#if modoModal === "criar_pasta"}
          Nova Pasta
        {:else if modoModal === "editar_pasta"}
          Renomear Pasta
        {:else}
          Renomear Baralho
        {/if}
      </h3>

      <input
        bind:this={refInput}
        bind:value={valorInputModal}
        placeholder={modoModal === "renomear_baralho"
          ? "Nome do baralho"
          : "Nome da pasta"}
        class="w-full p-3 border rounded-lg mb-6 outline-none transition focus:ring-2 focus:ring-indigo-500
          {$modoEscuro
          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
          : 'bg-gray-50 border-gray-200 text-gray-900'}"
        on:keydown={(e) => e.key === "Enter" && confirmarModal()}
      />

      <div class="flex gap-3">
        <button
          on:click={fecharModal}
          class="flex-1 py-2 font-medium rounded-lg transition {$modoEscuro
            ? 'text-gray-300 hover:bg-gray-700'
            : 'text-gray-600 hover:bg-gray-100'}">Cancelar</button
        >
        <button
          on:click={confirmarModal}
          disabled={!valorInputModal.trim()}
          class="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          Salvar
        </button>
      </div>
    </div>
  </div>
{/if}
