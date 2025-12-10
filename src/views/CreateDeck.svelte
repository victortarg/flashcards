<script>
  import {
    idPastaAtiva,
    modoEscuro,
    navegarPara,
    buscarDados,
  } from "../stores.js";
  import { supabase } from "../lib/supabaseClient";

  let tituloNovoBaralho = "";
  let carregando = false;

  const cores = [
    "bg-indigo-500",
    "bg-purple-500",
    "bg-blue-500",
    "bg-teal-500",
    "bg-rose-500",
  ];
  const gerarCor = () => cores[Math.floor(Math.random() * cores.length)];

  async function criarBaralho() {
    if (!tituloNovoBaralho.trim()) return;

    carregando = true;
    const idPasta = $idPastaAtiva;

    // Objeto para o Supabase
    const novoBaralho = {
      title: tituloNovoBaralho, // Coluna 'title' no banco
      color: gerarCor(),
      folder_id: idPasta, // Coluna 'folder_id' no banco
    };

    try {
      const { error } = await supabase.from("decks").insert(novoBaralho);
      if (error) throw error;

      await buscarDados(); // Atualiza a lista global
      navegarPara("home");
    } catch (erro) {
      alert("Erro ao criar: " + erro.message);
    } finally {
      carregando = false;
    }
  }
</script>

<div
  class="p-8 rounded-xl shadow-sm border max-w-md mx-auto mt-8 transition-colors {$modoEscuro
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-100'}"
>
  <h2
    class="text-xl font-bold mb-6 text-center {$modoEscuro
      ? 'text-white'
      : 'text-gray-900'}"
  >
    Criar Novo Baralho {$idPastaAtiva ? "na Pasta" : ""}
  </h2>

  <input
    bind:value={tituloNovoBaralho}
    placeholder="Ex: Anatomia, Bandeiras..."
    class="w-full p-3 border rounded-lg mb-6 outline-none transition focus:ring-2 focus:ring-indigo-500
    {$modoEscuro
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-gray-50 border-gray-200 text-gray-900'}"
    on:keydown={(e) => e.key === "Enter" && criarBaralho()}
    disabled={carregando}
    autofocus
  />

  <div class="flex gap-3">
    <button
      on:click={() => navegarPara("home")}
      class="flex-1 py-3 font-medium rounded-lg transition {$modoEscuro
        ? 'text-gray-300 hover:bg-gray-700'
        : 'text-gray-600 hover:bg-gray-50'}"
      disabled={carregando}>Cancelar</button
    >
    <button
      on:click={criarBaralho}
      class="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition flex justify-center"
      disabled={carregando}
    >
      {#if carregando}
        ...
      {:else}
        Criar
      {/if}
    </button>
  </div>
</div>
