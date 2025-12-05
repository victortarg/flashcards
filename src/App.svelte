<script>
  import { onMount } from "svelte";
  import { decks } from "./stores.js";
  import Flashcard from "./components/Flashcard.svelte";

  // --- Estado da Aplicação ---
  let view = "home";
  let deckAtual = null;
  let cardIndex = 0;
  let isCardRevelado = false;

  // Estado do Tema (Dark Mode)
  let isDarkMode = false;

  // --- Inputs de Dados ---
  let novoDeckTitulo = "";
  let novaFrente = "";
  let novoVerso = "";
  let novaImagem = null;
  let fileInput;

  // Carregar preferência de tema ao iniciar
  onMount(() => {
    const temaSalvo = localStorage.getItem("flashmind-theme");
    if (temaSalvo) {
      isDarkMode = temaSalvo === "dark";
    } else {
      // Verifica preferência do sistema
      isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  });

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem("flashmind-theme", isDarkMode ? "dark" : "light");
  }

  // --- Navegação ---
  function abrirDeck(deck) {
    deckAtual = deck;
    view = "deck-view";
    limparInputsCard();
  }

  function iniciarEstudo() {
    if (deckAtual.cards.length === 0) return;
    cardIndex = 0;
    isCardRevelado = false;
    view = "study";
  }

  function voltarHome() {
    view = "home";
    deckAtual = null;
  }

  function reiniciarEstudo() {
    iniciarEstudo();
  }

  function limparInputsCard() {
    novaFrente = "";
    novoVerso = "";
    novaImagem = null;
    if (fileInput) fileInput.value = "";
  }

  // --- Funções: Gerenciamento de Decks ---
  function criarDeck() {
    if (!novoDeckTitulo.trim()) return;

    decks.update((d) => [
      ...d,
      {
        id: Date.now(),
        titulo: novoDeckTitulo,
        cor: gerarCorAleatoria(),
        cards: [],
      },
    ]);

    novoDeckTitulo = "";
    view = "home";
  }

  function deletarDeck(id, e) {
    e.stopPropagation();
    if (
      confirm("Tem certeza que deseja apagar este bloco e todos os seus cards?")
    ) {
      decks.update((d) => d.filter((deck) => deck.id !== id));
    }
  }

  // --- Funções: Upload de Imagem ---
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        novaImagem = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  function removerImagemAnexada() {
    novaImagem = null;
    if (fileInput) fileInput.value = "";
  }

  // --- Funções: Gerenciamento de Cards ---
  function adicionarCard() {
    if ((!novaFrente.trim() && !novaImagem) || !novoVerso.trim()) return;

    decks.update((allDecks) => {
      const index = allDecks.findIndex((d) => d.id === deckAtual.id);
      allDecks[index].cards.push({
        id: Date.now(),
        frente: novaFrente,
        verso: novoVerso,
        imagem: novaImagem,
      });
      deckAtual = allDecks[index];
      return allDecks;
    });

    limparInputsCard();
  }

  function deletarCard(cardId) {
    if (!confirm("Deletar este cartão?")) return;

    decks.update((allDecks) => {
      const deckIndex = allDecks.findIndex((d) => d.id === deckAtual.id);
      const novosCards = allDecks[deckIndex].cards.filter(
        (c) => c.id !== cardId
      );

      allDecks[deckIndex].cards = novosCards;
      deckAtual = allDecks[deckIndex];
      return allDecks;
    });
  }

  // --- Funções: Lógica de Estudo ---
  function proximoCard() {
    if (cardIndex < deckAtual.cards.length - 1) {
      isCardRevelado = false;
      setTimeout(() => cardIndex++, 150);
    } else {
      view = "conclusion";
    }
  }

  function anteriorCard() {
    if (cardIndex > 0) {
      isCardRevelado = false;
      setTimeout(() => cardIndex--, 150);
    }
  }

  function gerarCorAleatoria() {
    const cores = [
      "bg-indigo-500",
      "bg-purple-500",
      "bg-blue-500",
      "bg-teal-500",
      "bg-rose-500",
    ];
    return cores[Math.floor(Math.random() * cores.length)];
  }
</script>

<!-- Main Wrapper com Toggle de Cores -->
<main
  class="min-h-screen font-sans pb-20 transition-colors duration-300 {isDarkMode
    ? 'bg-gray-900 text-gray-100'
    : 'bg-gray-50 text-gray-800'} selection:bg-indigo-500 selection:text-white"
>
  <!-- Header Fixo -->
  <header
    class="shadow-sm sticky top-0 z-20 border-b transition-colors duration-300 {isDarkMode
      ? 'bg-gray-800 border-gray-700'
      : 'bg-white border-gray-100'}"
  >
    <div class="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <h1
          class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 cursor-pointer select-none"
          on:click={voltarHome}
        >
          FlashMind
        </h1>

        <!-- Botão Toggle Dark Mode -->
        <button
          on:click={toggleTheme}
          class="p-2 rounded-full transition-colors {isDarkMode
            ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
        >
          {#if isDarkMode}
            <!-- Sol -->
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
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          {:else}
            <!-- Lua -->
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
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          {/if}
        </button>
      </div>

      {#if view !== "home"}
        <button
          on:click={voltarHome}
          class="text-sm font-medium transition flex items-center gap-1 group {isDarkMode
            ? 'text-gray-400 hover:text-indigo-400'
            : 'text-gray-500 hover:text-indigo-600'}"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 transition {isDarkMode
              ? 'text-gray-500 group-hover:text-indigo-400'
              : 'text-gray-400 group-hover:text-indigo-600'}"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Fechar
        </button>
      {/if}
    </div>
  </header>

  <div class="max-w-3xl mx-auto px-4 py-8">
    <!-- ================= VIEW: HOME ================= -->
    {#if view === "home"}
      <div class="flex justify-between items-end mb-6">
        <div>
          <h2
            class="text-2xl font-bold {isDarkMode
              ? 'text-white'
              : 'text-gray-900'}"
          >
            Seus Blocos
          </h2>
          <p
            class="text-sm mt-1 {isDarkMode
              ? 'text-gray-400'
              : 'text-gray-500'}"
          >
            Selecione um tópico para estudar
          </p>
        </div>
        <button
          on:click={() => (view = "create-deck")}
          class="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition text-sm font-bold flex items-center gap-2"
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
          Novo Bloco
        </button>
      </div>

      {#if $decks.length === 0}
        <div
          class="text-center py-20 rounded-xl border border-dashed transition-colors {isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-300'}"
        >
          <p class="mb-2 {isDarkMode ? 'text-gray-500' : 'text-gray-400'}">
            Nenhum bloco criado ainda.
          </p>
          <button
            on:click={() => (view = "create-deck")}
            class="text-indigo-500 font-medium hover:underline"
          >
            Crie seu primeiro bloco
          </button>
        </div>
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {#each $decks as deck (deck.id)}
            <div
              on:click={() => abrirDeck(deck)}
              class="p-6 rounded-xl shadow-sm border transition-all cursor-pointer relative group overflow-hidden hover:shadow-md
              {isDarkMode
                ? 'bg-gray-800 border-gray-700 hover:border-indigo-500'
                : 'bg-white border-gray-100 hover:border-indigo-100'}"
            >
              <div class="absolute top-0 left-0 w-1.5 h-full {deck.cor}"></div>
              <div class="flex justify-between items-start mb-2">
                <h3
                  class="font-bold text-lg line-clamp-1 pr-2 {isDarkMode
                    ? 'text-gray-100'
                    : 'text-gray-800'}"
                >
                  {deck.titulo}
                </h3>
                <button
                  on:click={(e) => deletarDeck(deck.id, e)}
                  class="p-1 rounded transition {isDarkMode
                    ? 'text-gray-500 hover:text-red-400 hover:bg-gray-700'
                    : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}"
                  title="Excluir bloco"
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
              <div
                class="flex items-center gap-2 text-sm {isDarkMode
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
                  class="px-2 py-0.5 rounded text-xs font-medium {isDarkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100'}">{deck.cards.length} cards</span
                >
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- ================= VIEW: CRIAR BLOCO ================= -->
    {:else if view === "create-deck"}
      <div
        class="p-8 rounded-xl shadow-sm border max-w-md mx-auto mt-8 transition-colors {isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-100'}"
      >
        <h2
          class="text-xl font-bold mb-6 text-center {isDarkMode
            ? 'text-white'
            : 'text-gray-900'}"
        >
          Criar Novo Bloco
        </h2>
        <input
          bind:value={novoDeckTitulo}
          placeholder="Ex: Anatomia, Bandeiras..."
          class="w-full p-3 border rounded-lg mb-6 outline-none transition focus:ring-2 focus:ring-indigo-500
          {isDarkMode
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
            : 'bg-gray-50 border-gray-200 text-gray-900'}"
          on:keydown={(e) => e.key === "Enter" && criarDeck()}
        />
        <div class="flex gap-3">
          <button
            on:click={voltarHome}
            class="flex-1 py-3 font-medium rounded-lg transition {isDarkMode
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-50'}">Cancelar</button
          >
          <button
            on:click={criarDeck}
            class="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition"
          >
            Criar
          </button>
        </div>
      </div>

      <!-- ================= VIEW: GERENCIAR BLOCO ================= -->
    {:else if view === "deck-view"}
      <div
        class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 p-6 rounded-xl border shadow-sm transition-colors {isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-100'}"
      >
        <div class="text-center sm:text-left">
          <span
            class="text-xs font-bold uppercase tracking-wider flex items-center gap-1 {isDarkMode
              ? 'text-indigo-400'
              : 'text-indigo-600'}"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3"
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
            Editando
          </span>
          <h2
            class="text-2xl font-bold mt-1 {isDarkMode
              ? 'text-white'
              : 'text-gray-900'}"
          >
            {deckAtual.titulo}
          </h2>
          <p class="text-sm {isDarkMode ? 'text-gray-400' : 'text-gray-500'}">
            {deckAtual.cards.length} cartões no total
          </p>
        </div>
        {#if deckAtual.cards.length > 0}
          <button
            on:click={iniciarEstudo}
            class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-green-500/30 font-bold transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clip-rule="evenodd"
              />
            </svg>
            Iniciar Estudos
          </button>
        {/if}
      </div>

      <!-- Formulário de Adicionar Card -->
      <div
        class="p-6 rounded-xl border mb-8 transition-colors {isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-indigo-50/50 border-indigo-100'}"
      >
        <h3
          class="text-sm font-bold uppercase mb-4 flex items-center gap-2 {isDarkMode
            ? 'text-indigo-400'
            : 'text-indigo-900'}"
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
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Adicionar Novo Flashcard
        </h3>

        <div class="grid grid-cols-1 gap-4 mb-4">
          <!-- Campo Frente -->
          <div>
            <textarea
              bind:value={novaFrente}
              rows="2"
              placeholder="Frente (Texto da Pergunta)"
              class="w-full p-3 border rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none transition
                {isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-200 text-gray-900'}"
            ></textarea>
          </div>

          <!-- Campo Upload de Imagem -->
          <div class="flex items-center gap-4">
            <label
              class="cursor-pointer border px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2
              {isDarkMode
                ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}"
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
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Adicionar Foto
              <input
                bind:this={fileInput}
                type="file"
                accept="image/*"
                class="hidden"
                on:change={handleImageUpload}
              />
            </label>

            {#if novaImagem}
              <div class="relative group">
                <img
                  src={novaImagem}
                  alt="Preview"
                  class="h-12 w-12 object-cover rounded-lg border shadow-sm {isDarkMode
                    ? 'border-gray-600'
                    : 'border-indigo-200'}"
                />
                <button
                  on:click={removerImagemAnexada}
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600"
                  title="Remover imagem"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3"
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
              <span
                class="text-xs text-green-500 font-medium flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Foto anexada
              </span>
            {/if}
          </div>

          <!-- Campo Verso -->
          <div>
            <textarea
              bind:value={novoVerso}
              rows="2"
              placeholder="Verso (Resposta)"
              class="w-full p-3 border rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none transition
                {isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-200 text-gray-900'}"
            ></textarea>
          </div>
        </div>

        <button
          on:click={adicionarCard}
          disabled={(!novaFrente.trim() && !novaImagem) || !novoVerso.trim()}
          class="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/30 flex items-center justify-center gap-2"
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          Salvar Card
        </button>
      </div>

      <!-- LISTA DE CARDS -->
      <div class="space-y-4">
        {#each deckAtual.cards as card (card.id)}
          <div
            class="group flex flex-col sm:flex-row rounded-lg shadow-sm border transition relative overflow-hidden min-h-[5rem]
           {isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-indigo-500'
              : 'bg-white border-gray-200 hover:border-indigo-300'}"
          >
            <button
              on:click={() => deletarCard(card.id)}
              class="absolute top-2 right-2 p-1 sm:opacity-0 group-hover:opacity-100 transition z-10
                {isDarkMode
                ? 'text-gray-500 hover:text-red-400'
                : 'text-gray-300 hover:text-red-500'}"
              title="Excluir cartão"
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

            <!-- Lado da Frente na Lista -->
            <div
              class="w-full sm:w-1/2 p-5 flex items-start gap-3 relative border-b sm:border-b-0 sm:border-r {isDarkMode
                ? 'border-gray-700'
                : 'border-gray-100'}"
            >
              <div
                class="absolute top-3 left-3 {isDarkMode
                  ? 'text-gray-600'
                  : 'text-gray-300'}"
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
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              {#if card.imagem}
                <img
                  src={card.imagem}
                  alt="Thumb"
                  class="w-10 h-10 object-cover rounded border shrink-0 ml-4 {isDarkMode
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-gray-100 border-gray-200'}"
                />
              {/if}

              <p
                class="font-medium break-words whitespace-pre-wrap w-full pl-2 mt-1 ml-4 {isDarkMode
                  ? 'text-gray-200'
                  : 'text-gray-800'}"
              >
                {card.frente || "(Apenas imagem)"}
              </p>
            </div>

            <!-- Lado do Verso na Lista -->
            <div
              class="w-full sm:w-1/2 p-5 flex items-center relative {isDarkMode
                ? 'bg-gray-700/30'
                : 'bg-gray-50/50'}"
            >
              <div
                class="absolute top-3 left-3 {isDarkMode
                  ? 'text-gray-600'
                  : 'text-gray-300'}"
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
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
              <p
                class="break-words whitespace-pre-wrap w-full pl-2 ml-4 {isDarkMode
                  ? 'text-gray-400'
                  : 'text-gray-600'}"
              >
                {card.verso}
              </p>
            </div>
          </div>
        {/each}
        {#if deckAtual.cards.length === 0}
          <div
            class="text-center py-10 opacity-50 {isDarkMode
              ? 'text-gray-500'
              : 'text-gray-400'}"
          >
            <p>A lista está vazia.</p>
          </div>
        {/if}
      </div>

      <!-- ================= VIEW: MODO ESTUDO ================= -->
    {:else if view === "study"}
      <div
        class="flex flex-col items-center justify-center h-full pt-4 max-w-xl mx-auto"
      >
        <div class="w-full flex items-center gap-3 mb-6">
          <span
            class="text-xs font-bold w-8 text-right {isDarkMode
              ? 'text-indigo-400'
              : 'text-indigo-600'}"
            >{Math.round(
              ((cardIndex + 1) / deckAtual.cards.length) * 100
            )}%</span
          >
          <div
            class="flex-1 h-2 rounded-full overflow-hidden {isDarkMode
              ? 'bg-gray-700'
              : 'bg-gray-200'}"
          >
            <div
              class="bg-indigo-500 h-full transition-all duration-300 ease-out"
              style="width: {((cardIndex + 1) / deckAtual.cards.length) * 100}%"
            ></div>
          </div>
        </div>

        <p
          class="text-xs mb-4 font-bold uppercase tracking-widest flex items-center gap-2 {isDarkMode
            ? 'text-gray-500'
            : 'text-gray-400'}"
        >
          Cartão {cardIndex + 1} de {deckAtual.cards.length}
        </p>

        <div class="w-full mb-8 px-2">
          <Flashcard
            frente={deckAtual.cards[cardIndex].frente}
            verso={deckAtual.cards[cardIndex].verso}
            imagem={deckAtual.cards[cardIndex].imagem}
            bind:revelado={isCardRevelado}
            darkMode={isDarkMode}
          />
        </div>

        <div class="flex gap-4 w-full px-2">
          <button
            on:click={anteriorCard}
            disabled={cardIndex === 0}
            class="flex-1 py-4 rounded-xl font-bold border transition shadow-sm flex items-center justify-center gap-2
                {isDarkMode
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
            on:click={proximoCard}
            class="flex-1 py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            {#if cardIndex === deckAtual.cards.length - 1}
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

      <!-- ================= VIEW: CONCLUSÃO ================= -->
    {:else if view === "conclusion"}
      <div
        class="flex flex-col items-center justify-center py-12 text-center h-full animate-fade-in"
      >
        <div
          class="p-8 rounded-full mb-8 shadow-sm {isDarkMode
            ? 'bg-green-900/20'
            : 'bg-green-100'}"
        >
          <!-- Ícone Trophy -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 {isDarkMode ? 'text-green-400' : 'text-green-600'}"
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
          class="text-3xl font-bold mb-2 {isDarkMode
            ? 'text-white'
            : 'text-gray-800'}"
        >
          Parabéns!
        </h2>
        <p
          class="mb-8 text-lg max-w-xs mx-auto {isDarkMode
            ? 'text-gray-400'
            : 'text-gray-500'}"
        >
          Você concluiu todos os {deckAtual.cards.length} cartões do bloco
          <span
            class="font-semibold {isDarkMode
              ? 'text-indigo-400'
              : 'text-indigo-600'}">"{deckAtual.titulo}"</span
          >.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 w-full max-w-sm px-4">
          <button
            on:click={voltarHome}
            class="flex-1 py-3 px-6 rounded-xl font-bold border transition shadow-sm flex items-center justify-center gap-2
            {isDarkMode
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
            on:click={reiniciarEstudo}
            class="flex-1 py-3 px-6 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition flex items-center justify-center gap-2"
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
    {/if}
  </div>
</main>

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
