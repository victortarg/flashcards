<script>
  import { decks, activeFolderId, isDarkMode, navigateTo } from "../stores.js";

  let novoDeckTitulo = "";

  const cores = [
    "bg-indigo-500",
    "bg-purple-500",
    "bg-blue-500",
    "bg-teal-500",
    "bg-rose-500",
  ];
  const gerarCor = () => cores[Math.floor(Math.random() * cores.length)];

  function criarDeck() {
    if (!novoDeckTitulo.trim()) return;

    // Usa o ID da pasta ativa (estado global)
    // Se estiver null, cria na raiz.
    const folderId = $activeFolderId;

    decks.update((d) => [
      ...d,
      {
        id: Date.now(),
        titulo: novoDeckTitulo,
        cor: gerarCor(),
        folderId: folderId,
        cards: [],
      },
    ]);

    // Volta para a home (que já estará filtrada na pasta correta graças ao estado global)
    navigateTo("home");
  }
</script>

<div
  class="p-8 rounded-xl shadow-sm border max-w-md mx-auto mt-8 transition-colors {$isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-100'}"
>
  <h2
    class="text-xl font-bold mb-6 text-center {$isDarkMode
      ? 'text-white'
      : 'text-gray-900'}"
  >
    Criar Novo Bloco {$activeFolderId ? "na Pasta" : ""}
  </h2>

  <!-- svelte-ignore a11y_autofocus -->
  <input
    bind:value={novoDeckTitulo}
    placeholder="Ex: Anatomia, Bandeiras..."
    class="w-full p-3 border rounded-lg mb-6 outline-none transition focus:ring-2 focus:ring-indigo-500
    {$isDarkMode
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-gray-50 border-gray-200 text-gray-900'}"
    on:keydown={(e) => e.key === "Enter" && criarDeck()}
    autofocus
  />

  <div class="flex gap-3">
    <button
      on:click={() => navigateTo("home")}
      class="flex-1 py-3 font-medium rounded-lg transition {$isDarkMode
        ? 'text-gray-300 hover:bg-gray-700'
        : 'text-gray-600 hover:bg-gray-50'}">Cancelar</button
    >
    <button
      on:click={criarDeck}
      class="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition"
    >
      Criar
    </button>
  </div>
</div>
