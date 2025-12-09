<script>
  import { decks, currentDeck, isDarkMode, navigateTo } from "../stores.js";

  let novaFrente = "";
  let novoVerso = "";
  let novaImagem = null;
  let fileInput;

  // Estado para controlar qual card está sendo editado (null = criando novo)
  let editingId = null;

  // Reativo: sempre que $decks mudar, atualiza a cópia local do deck atual
  $: deckLocal = $decks.find((d) => d.id === $currentDeck.id);

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

  function prepararEdicao(card) {
    novaFrente = card.frente;
    novoVerso = card.verso;
    novaImagem = card.imagem;
    editingId = card.id;

    // Rola a página suavemente para o formulário
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicao() {
    novaFrente = "";
    novoVerso = "";
    removerImagemAnexada();
    editingId = null;
  }

  function salvarCard() {
    if ((!novaFrente.trim() && !novaImagem) || !novoVerso.trim()) return;

    decks.update((allDecks) => {
      const index = allDecks.findIndex((d) => d.id === deckLocal.id);

      if (editingId) {
        // --- MODO EDIÇÃO: Atualiza o card existente ---
        const cardIndex = allDecks[index].cards.findIndex(
          (c) => c.id === editingId
        );
        if (cardIndex !== -1) {
          allDecks[index].cards[cardIndex] = {
            ...allDecks[index].cards[cardIndex], // Mantém ID e outros dados
            frente: novaFrente,
            verso: novoVerso,
            imagem: novaImagem,
          };
        }
      } else {
        // --- MODO CRIAÇÃO: Adiciona novo card ---
        allDecks[index].cards.push({
          id: Date.now(),
          frente: novaFrente,
          verso: novoVerso,
          imagem: novaImagem,
        });
      }

      return allDecks;
    });

    // Limpa o formulário
    cancelarEdicao();
  }

  function deletarCard(cardId) {
    if (!confirm("Deletar este cartão?")) return;

    // Se estiver editando o card que vai ser deletado, cancela a edição
    if (editingId === cardId) cancelarEdicao();

    decks.update((allDecks) => {
      const index = allDecks.findIndex((d) => d.id === deckLocal.id);
      allDecks[index].cards = allDecks[index].cards.filter(
        (c) => c.id !== cardId
      );
      return allDecks;
    });
  }
</script>

<!-- Cabeçalho do Deck -->
<div
  class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 p-6 rounded-xl border shadow-sm transition-colors {$isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-100'}"
>
  <div class="text-center sm:text-left">
    <span
      class="text-xs font-bold uppercase tracking-wider flex items-center gap-1 {$isDarkMode
        ? 'text-indigo-400'
        : 'text-indigo-600'}">Editando</span
    >
    <h2
      class="text-2xl font-bold mt-1 {$isDarkMode
        ? 'text-white'
        : 'text-gray-900'}"
    >
      {deckLocal.titulo}
    </h2>
    <p class="text-sm {$isDarkMode ? 'text-gray-400' : 'text-gray-500'}">
      {deckLocal.cards.length} cartões no total
    </p>
  </div>
  {#if deckLocal.cards.length > 0}
    <button
      on:click={() => navigateTo("study", deckLocal)}
      class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg font-bold transition transform active:scale-95 flex items-center justify-center gap-2"
    >
      ▶ Iniciar Estudos
    </button>
  {/if}
</div>

<!-- Form Adicionar / Editar -->
<div
  class="p-6 rounded-xl border mb-8 transition-colors border-l-4 {$isDarkMode
    ? 'bg-gray-800 border-gray-700 border-l-indigo-500'
    : 'bg-indigo-50/50 border-indigo-100 border-l-indigo-500'}"
>
  <h3
    class="text-sm font-bold uppercase mb-4 flex items-center gap-2 {$isDarkMode
      ? 'text-indigo-400'
      : 'text-indigo-900'}"
  >
    {#if editingId}
      ✎ Editando Flashcard
    {:else}
      + Adicionar Novo Flashcard
    {/if}
  </h3>

  <div class="grid grid-cols-1 gap-4 mb-4">
    <textarea
      bind:value={novaFrente}
      rows="2"
      placeholder="Frente (Texto da Pergunta)"
      class="w-full p-3 border rounded-lg outline-none resize-none transition {$isDarkMode
        ? 'bg-gray-700 border-gray-600 text-white'
        : 'bg-white border-gray-200 text-gray-900'}"
    ></textarea>

    <div class="flex items-center gap-4">
      <label
        class="cursor-pointer border px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2 {$isDarkMode
          ? 'bg-gray-700 border-gray-600 text-gray-300'
          : 'bg-white border-gray-300 text-gray-600'}"
      >
        {novaImagem ? "Trocar Foto" : "Adicionar Foto"}
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
            class="h-12 w-12 object-cover rounded-lg border shadow-sm"
          />
          <button
            on:click={removerImagemAnexada}
            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
            >✕</button
          >
        </div>
      {/if}
    </div>

    <textarea
      bind:value={novoVerso}
      rows="2"
      placeholder="Verso (Resposta)"
      class="w-full p-3 border rounded-lg outline-none resize-none transition {$isDarkMode
        ? 'bg-gray-700 border-gray-600 text-white'
        : 'bg-white border-gray-200 text-gray-900'}"
    ></textarea>
  </div>

  <div class="flex gap-3">
    {#if editingId}
      <button
        on:click={cancelarEdicao}
        class="px-6 py-3 font-medium rounded-lg transition {$isDarkMode
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}"
      >
        Cancelar
      </button>
    {/if}

    <button
      on:click={salvarCard}
      disabled={(!novaFrente.trim() && !novaImagem) || !novoVerso.trim()}
      class="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
    >
      {editingId ? "Salvar Alterações" : "Salvar Card"}
    </button>
  </div>
</div>

<!-- Lista de Cards -->
<div class="space-y-4">
  {#each deckLocal.cards as card (card.id)}
    <div
      class="group flex flex-col sm:flex-row rounded-lg shadow-sm border transition relative overflow-hidden min-h-[5rem] {$isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'} {editingId === card.id
        ? 'ring-2 ring-indigo-500'
        : ''}"
    >
      <!-- Ações do Card (Editar / Excluir) -->
      <div
        class="absolute top-2 right-2 flex gap-1 z-10 sm:opacity-0 group-hover:opacity-100 transition"
      >
        <button
          on:click={() => prepararEdicao(card)}
          class="p-1.5 rounded transition bg-white/10 backdrop-blur-sm shadow-sm {$isDarkMode
            ? 'text-gray-400 hover:text-indigo-400 hover:bg-gray-700'
            : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'}"
          title="Editar"
        >
          <!-- Ícone Lápis -->
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
        <button
          on:click={() => deletarCard(card.id)}
          class="p-1.5 rounded transition bg-white/10 backdrop-blur-sm shadow-sm {$isDarkMode
            ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}"
          title="Excluir"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <div
        class="w-full sm:w-1/2 p-5 flex items-start gap-3 relative border-b sm:border-b-0 sm:border-r {$isDarkMode
          ? 'border-gray-700'
          : 'border-gray-100'}"
      >
        <span class="absolute top-3 left-3 text-xs font-bold text-gray-400"
          >P</span
        >
        {#if card.imagem}
          <img
            src={card.imagem}
            alt="Thumb"
            class="w-10 h-10 object-cover rounded border shrink-0 ml-4"
          />
        {/if}
        <p
          class="font-medium break-words whitespace-pre-wrap w-full pl-2 mt-1 ml-4 {$isDarkMode
            ? 'text-gray-200'
            : 'text-gray-800'}"
        >
          {card.frente || "(Apenas imagem)"}
        </p>
      </div>

      <div
        class="w-full sm:w-1/2 p-5 flex items-center relative {$isDarkMode
          ? 'bg-gray-700/30'
          : 'bg-gray-50/50'}"
      >
        <span class="absolute top-3 left-3 text-xs font-bold text-gray-400"
          >R</span
        >
        <p
          class="break-words whitespace-pre-wrap w-full pl-2 ml-4 {$isDarkMode
            ? 'text-gray-400'
            : 'text-gray-600'}"
        >
          {card.verso}
        </p>
      </div>
    </div>
  {/each}
  {#if deckLocal.cards.length === 0}
    <div
      class="text-center py-10 opacity-50 {$isDarkMode
        ? 'text-gray-500'
        : 'text-gray-400'}"
    >
      <p>Nenhum cartão neste bloco.</p>
    </div>
  {/if}
</div>
