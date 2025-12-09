<script>
  import {
    decks,
    folders,
    activeFolderId,
    isDarkMode,
    navigateTo,
  } from "../stores.js";

  // Filtra os decks baseado no estado GLOBAL da pasta atual
  $: filteredDecks = $decks.filter((d) => {
    if ($activeFolderId) return d.folderId === $activeFolderId;
    return !d.folderId; // Retorna decks da raiz se não houver pasta selecionada
  });

  // Pega o nome da pasta atual
  $: currentFolder = $folders.find((f) => f.id === $activeFolderId);

  // --- Controle do Modal Genérico (Criar/Renomear) ---
  let showModal = false;
  let modalMode = "create_folder"; // 'create_folder', 'edit_folder', 'rename_deck'
  let modalInputValue = "";
  let modalTargetId = null; // ID do item sendo editado
  let inputRef; // Referência para focar no input

  function abrirModalCriarPasta() {
    modalMode = "create_folder";
    modalInputValue = "";
    modalTargetId = null;
    showModal = true;
    setTimeout(() => inputRef?.focus(), 50);
  }

  function abrirModalEditarPasta(folder, e) {
    e.stopPropagation(); // Impede entrar na pasta ao clicar no editar
    modalMode = "edit_folder";
    modalInputValue = folder.name;
    modalTargetId = folder.id;
    showModal = true;
    setTimeout(() => inputRef?.focus(), 50);
  }

  function abrirModalRenomearDeck(deck, e) {
    e.stopPropagation(); // Impede abrir detalhes ao clicar no editar
    modalMode = "rename_deck";
    modalInputValue = deck.titulo;
    modalTargetId = deck.id;
    showModal = true;
    setTimeout(() => inputRef?.focus(), 50);
  }

  function fecharModal() {
    showModal = false;
    modalInputValue = "";
    modalTargetId = null;
  }

  function confirmarModal() {
    if (!modalInputValue.trim()) return;

    if (modalMode === "create_folder") {
      folders.update((all) => [
        ...all,
        { id: Date.now(), name: modalInputValue.trim() },
      ]);
    } else if (modalMode === "edit_folder") {
      folders.update((all) =>
        all.map((f) =>
          f.id === modalTargetId ? { ...f, name: modalInputValue.trim() } : f
        )
      );
    } else if (modalMode === "rename_deck") {
      decks.update((all) =>
        all.map((d) =>
          d.id === modalTargetId ? { ...d, titulo: modalInputValue.trim() } : d
        )
      );
    }

    fecharModal();
  }

  // --- Ações de Navegação e Deleção ---

  function entrarPasta(id) {
    activeFolderId.set(id);
  }

  function sairPasta() {
    activeFolderId.set(null);
  }

  function deletarPasta(id, e) {
    e.stopPropagation();
    if (
      confirm(
        "Deseja apagar esta pasta? Os blocos dentro dela voltarão para a tela inicial."
      )
    ) {
      decks.update((all) =>
        all.map((d) => (d.folderId === id ? { ...d, folderId: null } : d))
      );
      folders.update((all) => all.filter((f) => f.id !== id));
      if ($activeFolderId === id) activeFolderId.set(null);
    }
  }

  function deletarDeck(id, e) {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja apagar este bloco?")) {
      decks.update((d) => d.filter((deck) => deck.id !== id));
    }
  }

  function irParaCriarDeck() {
    navigateTo("create");
  }
</script>

<!-- Header da Home -->
<div
  class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4"
>
  <div class="flex items-center gap-2 w-full sm:w-auto">
    {#if $activeFolderId && currentFolder}
      <button
        on:click={sairPasta}
        class="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition shrink-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 {$isDarkMode ? 'text-white' : 'text-gray-700'}"
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
          class="text-2xl font-bold truncate {$isDarkMode
            ? 'text-white'
            : 'text-gray-900'}"
        >
          {currentFolder.name}
        </h2>
        <p
          class="text-sm mt-1 truncate {$isDarkMode
            ? 'text-gray-400'
            : 'text-gray-500'}"
        >
          Visualizando pasta
        </p>
      </div>
    {:else}
      <div>
        <h2
          class="text-2xl font-bold {$isDarkMode
            ? 'text-white'
            : 'text-gray-900'}"
        >
          Seus Blocos
        </h2>
        <p
          class="text-sm mt-1 {$isDarkMode ? 'text-gray-400' : 'text-gray-500'}"
        >
          Organize seus estudos
        </p>
      </div>
    {/if}
  </div>

  <div class="flex gap-2 w-full sm:w-auto">
    <!-- Botão Criar Pasta -->
    {#if !$activeFolderId}
      <button
        on:click={abrirModalCriarPasta}
        class="flex-1 sm:flex-none border border-indigo-200 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition text-sm font-bold flex items-center justify-center gap-2 {$isDarkMode
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
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <span class="whitespace-nowrap">Nova Pasta</span>
      </button>
    {/if}

    <button
      on:click={irParaCriarDeck}
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
      <span class="whitespace-nowrap">Novo Bloco</span>
    </button>
  </div>
</div>

<!-- SEÇÃO DE PASTAS -->
{#if !$activeFolderId && $folders.length > 0}
  <div class="mb-8">
    <h3
      class="text-sm font-bold uppercase tracking-wider mb-3 {$isDarkMode
        ? 'text-gray-500'
        : 'text-gray-400'}"
    >
      Pastas
    </h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {#each $folders as folder (folder.id)}
        <div
          on:click={() => entrarPasta(folder.id)}
          class="p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:shadow-md relative group
          {$isDarkMode
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
            class="font-medium text-center truncate w-full text-sm sm:text-base {$isDarkMode
              ? 'text-gray-200'
              : 'text-gray-700'}">{folder.name}</span
          >

          <!-- Botão Editar (Esquerda) -->
          <button
            on:click={(e) => abrirModalEditarPasta(folder, e)}
            class="absolute top-1 left-1 p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition {$isDarkMode
              ? 'hover:bg-gray-700 text-gray-500'
              : 'hover:bg-gray-100 text-gray-400'}"
            title="Renomear"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>

          <!-- Botão Deletar (Direita) -->
          <button
            on:click={(e) => deletarPasta(folder.id, e)}
            class="absolute top-1 right-1 p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition {$isDarkMode
              ? 'hover:bg-gray-700 text-gray-500'
              : 'hover:bg-gray-100 text-gray-400'}"
            title="Excluir"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  </div>
{/if}

<!-- SEÇÃO DE BLOCOS -->
<div>
  <h3
    class="text-sm font-bold uppercase tracking-wider mb-3 {$isDarkMode
      ? 'text-gray-500'
      : 'text-gray-400'}"
  >
    {$activeFolderId && currentFolder
      ? `Blocos em "${currentFolder.name}"`
      : "Blocos Soltos"}
  </h3>

  {#if filteredDecks.length === 0}
    <div
      class="text-center py-16 rounded-xl border border-dashed transition-colors {$isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-300'}"
    >
      <p class="mb-2 {$isDarkMode ? 'text-gray-500' : 'text-gray-400'}">
        {$activeFolderId
          ? "Esta pasta está vazia."
          : "Nenhum bloco criado aqui."}
      </p>
      <button
        on:click={irParaCriarDeck}
        class="text-indigo-500 font-medium hover:underline"
      >
        Criar novo bloco aqui
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {#each filteredDecks as deck (deck.id)}
        <div
          on:click={() => navigateTo("details", deck)}
          class="p-6 rounded-xl shadow-sm border transition-all cursor-pointer relative group overflow-hidden hover:shadow-md
          {$isDarkMode
            ? 'bg-gray-800 border-gray-700 hover:border-indigo-500'
            : 'bg-white border-gray-100 hover:border-indigo-100'}"
        >
          <div class="absolute top-0 left-0 w-1.5 h-full {deck.cor}"></div>
          <div class="flex justify-between items-start mb-2">
            <h3
              class="font-bold text-lg line-clamp-1 pr-2 {$isDarkMode
                ? 'text-gray-100'
                : 'text-gray-800'}"
            >
              {deck.titulo}
            </h3>

            <div class="flex gap-1">
              <!-- Botão Renomear Deck -->
              <button
                on:click={(e) => abrirModalRenomearDeck(deck, e)}
                class="p-1 rounded transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100 {$isDarkMode
                  ? 'text-gray-500 hover:text-indigo-400 hover:bg-gray-700'
                  : 'text-gray-300 hover:text-indigo-500 hover:bg-indigo-50'}"
                title="Renomear"
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>

              <!-- Botão Deletar Deck -->
              <button
                on:click={(e) => deletarDeck(deck.id, e)}
                class="p-1 rounded transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100 {$isDarkMode
                  ? 'text-gray-500 hover:text-red-400 hover:bg-gray-700'
                  : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}"
                title="Excluir"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div
            class="flex items-center gap-2 text-sm {$isDarkMode
              ? 'text-gray-400'
              : 'text-gray-500'}"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span
              class="px-2 py-0.5 rounded text-xs font-medium {$isDarkMode
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-100'}">{deck.cards.length} cards</span
            >
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- MODAL GENÉRICO: Criar/Editar -->
{#if showModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    style="background-color: rgba(0,0,0,0.5); backdrop-filter: blur(4px);"
  >
    <div class="absolute inset-0" on:click={fecharModal}></div>

    <div
      class="w-full max-w-sm rounded-xl shadow-2xl p-6 relative z-10 transition-colors {$isDarkMode
        ? 'bg-gray-800'
        : 'bg-white'}"
    >
      <h3
        class="text-lg font-bold mb-4 text-center {$isDarkMode
          ? 'text-white'
          : 'text-gray-900'}"
      >
        {#if modalMode === "create_folder"}
          Nova Pasta
        {:else if modalMode === "edit_folder"}
          Renomear Pasta
        {:else}
          Renomear Bloco
        {/if}
      </h3>

      <input
        bind:this={inputRef}
        bind:value={modalInputValue}
        placeholder={modalMode === "rename_deck"
          ? "Nome do bloco"
          : "Nome da pasta"}
        class="w-full p-3 border rounded-lg mb-6 outline-none transition focus:ring-2 focus:ring-indigo-500
          {$isDarkMode
          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
          : 'bg-gray-50 border-gray-200 text-gray-900'}"
        on:keydown={(e) => e.key === "Enter" && confirmarModal()}
      />

      <div class="flex gap-3">
        <button
          on:click={fecharModal}
          class="flex-1 py-2 font-medium rounded-lg transition {$isDarkMode
            ? 'text-gray-300 hover:bg-gray-700'
            : 'text-gray-600 hover:bg-gray-100'}"
        >
          Cancelar
        </button>
        <button
          on:click={confirmarModal}
          disabled={!modalInputValue.trim()}
          class="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {modalMode === "create_folder" ? "Criar" : "Salvar"}
        </button>
      </div>
    </div>
  </div>
{/if}
