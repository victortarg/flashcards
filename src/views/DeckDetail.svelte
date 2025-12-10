<script>
  import {
    baralhos,
    baralhoAtual,
    modoEscuro,
    navegarPara,
    buscarDados,
  } from "../stores.js";
  import { supabase } from "../lib/supabaseClient";

  let novaFrente = "";
  let novoVerso = "";
  let novaImagem = null;
  let refFileInput;
  let idEmEdicao = null; // ID do cartão sendo editado
  let carregandoCartao = false;

  // Atualiza referência local do baralho
  $: baralhoLocal = $baralhos.find((b) => b.id === $baralhoAtual.id);

  // --- Imagem ---
  function lidarUploadImagem(e) {
    const arquivo = e.target.files[0];
    if (arquivo) {
      const leitor = new FileReader();
      leitor.onload = (evt) => {
        novaImagem = evt.target.result;
      };
      leitor.readAsDataURL(arquivo);
    }
  }

  function removerImagem() {
    novaImagem = null;
    if (refFileInput) refFileInput.value = "";
  }

  // --- CRUD Cartões ---
  function prepararEdicao(cartao) {
    novaFrente = cartao.front;
    novoVerso = cartao.back;
    novaImagem = cartao.image_url;
    idEmEdicao = cartao.id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicao() {
    novaFrente = "";
    novoVerso = "";
    removerImagem();
    idEmEdicao = null;
  }

  async function salvarCartao() {
    if ((!novaFrente.trim() && !novaImagem) || !novoVerso.trim()) return;
    carregandoCartao = true;

    try {
      const dadosCartao = {
        front: novaFrente,
        back: novoVerso,
        image_url: novaImagem, // Se usar storage real, aqui iria a URL. Como é base64, vai direto.
        deck_id: baralhoLocal.id,
      };

      if (idEmEdicao) {
        // Atualizar
        const { error } = await supabase
          .from("cards")
          .update(dadosCartao)
          .eq("id", idEmEdicao);
        if (error) throw error;
      } else {
        // Criar
        const { error } = await supabase.from("cards").insert(dadosCartao);
        if (error) throw error;
      }

      await buscarDados(); // Recarrega para atualizar a lista
      cancelarEdicao();
    } catch (erro) {
      alert("Erro ao salvar cartão: " + erro.message);
    } finally {
      carregandoCartao = false;
    }
  }

  async function deletarCartao(id) {
    if (!confirm("Deletar este cartão?")) return;
    if (idEmEdicao === id) cancelarEdicao();

    try {
      await supabase.from("cards").delete().eq("id", id);
      buscarDados();
    } catch (erro) {
      alert("Erro ao deletar: " + erro.message);
    }
  }
</script>

<!-- Cabeçalho -->
<div
  class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 p-6 rounded-xl border shadow-sm transition-colors {$modoEscuro
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-100'}"
>
  <div class="text-center sm:text-left">
    <span
      class="text-xs font-bold uppercase tracking-wider flex items-center gap-1 {$modoEscuro
        ? 'text-indigo-400'
        : 'text-indigo-600'}">Editando</span
    >
    <h2
      class="text-2xl font-bold mt-1 {$modoEscuro
        ? 'text-white'
        : 'text-gray-900'}"
    >
      {baralhoLocal.title}
    </h2>
    <p class="text-sm {$modoEscuro ? 'text-gray-400' : 'text-gray-500'}">
      {baralhoLocal.cartoes?.length || 0} cartões
    </p>
  </div>
  {#if baralhoLocal.cartoes?.length > 0}
    <button
      on:click={() => navegarPara("estudo", baralhoLocal)}
      class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg font-bold transition transform active:scale-95 flex items-center justify-center gap-2"
    >
      ▶ Iniciar Estudos
    </button>
  {/if}
</div>

<!-- Formulário -->
<div
  class="p-6 rounded-xl border mb-8 transition-colors border-l-4 {$modoEscuro
    ? 'bg-gray-800 border-gray-700 border-l-indigo-500'
    : 'bg-indigo-50/50 border-indigo-100 border-l-indigo-500'}"
>
  <h3
    class="text-sm font-bold uppercase mb-4 flex items-center gap-2 {$modoEscuro
      ? 'text-indigo-400'
      : 'text-indigo-900'}"
  >
    {#if idEmEdicao}
      ✎ Editando Cartão
    {:else}
      + Adicionar Novo Cartão
    {/if}
  </h3>

  <div class="grid grid-cols-1 gap-4 mb-4">
    <textarea
      bind:value={novaFrente}
      rows="2"
      placeholder="Frente (Pergunta)"
      class="w-full p-3 border rounded-lg outline-none resize-none transition {$modoEscuro
        ? 'bg-gray-700 border-gray-600 text-white'
        : 'bg-white border-gray-200 text-gray-900'}"
    ></textarea>

    <div class="flex items-center gap-4">
      <label
        class="cursor-pointer border px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2 {$modoEscuro
          ? 'bg-gray-700 border-gray-600 text-gray-300'
          : 'bg-white border-gray-300 text-gray-600'}"
      >
        📷 {novaImagem ? "Trocar Foto" : "Adicionar Foto"}
        <input
          bind:this={refFileInput}
          type="file"
          accept="image/*"
          class="hidden"
          on:change={lidarUploadImagem}
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
            on:click={removerImagem}
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
      class="w-full p-3 border rounded-lg outline-none resize-none transition {$modoEscuro
        ? 'bg-gray-700 border-gray-600 text-white'
        : 'bg-white border-gray-200 text-gray-900'}"
    ></textarea>
  </div>

  <div class="flex gap-3">
    {#if idEmEdicao}
      <button
        on:click={cancelarEdicao}
        class="px-6 py-3 font-medium rounded-lg transition {$modoEscuro
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}"
        disabled={carregandoCartao}>Cancelar</button
      >
    {/if}
    <button
      on:click={salvarCartao}
      disabled={(!novaFrente.trim() && !novaImagem) ||
        !novoVerso.trim() ||
        carregandoCartao}
      class="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
    >
      {carregandoCartao
        ? "Salvando..."
        : idEmEdicao
          ? "Salvar Alterações"
          : "Salvar Cartão"}
    </button>
  </div>
</div>

<!-- Lista -->
<div class="space-y-4">
  {#if baralhoLocal.cartoes}
    {#each baralhoLocal.cartoes as cartao (cartao.id)}
      <div
        class="group flex flex-col sm:flex-row rounded-lg shadow-sm border transition relative overflow-hidden min-h-[5rem] {$modoEscuro
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'} {idEmEdicao === cartao.id
          ? 'ring-2 ring-indigo-500'
          : ''}"
      >
        <div
          class="absolute top-2 right-2 flex gap-1 z-10 sm:opacity-0 group-hover:opacity-100 transition"
        >
          <!-- svelte-ignore a11y_consider_explicit_label -->
          <button
            on:click={() => prepararEdicao(cartao)}
            class="p-1.5 rounded transition bg-white/10 backdrop-blur-sm shadow-sm {$modoEscuro
              ? 'text-gray-400 hover:text-indigo-400 hover:bg-gray-700'
              : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'}"
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
            on:click={() => deletarCartao(cartao.id)}
            class="p-1.5 rounded transition bg-white/10 backdrop-blur-sm shadow-sm {$modoEscuro
              ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              /></svg
            >
          </button>
        </div>

        <div
          class="w-full sm:w-1/2 p-5 flex items-start gap-3 relative border-b sm:border-b-0 sm:border-r {$modoEscuro
            ? 'border-gray-700'
            : 'border-gray-100'}"
        >
          <span class="absolute top-3 left-3 text-xs font-bold text-gray-400"
            >P</span
          >
          {#if cartao.image_url}
            <img
              src={cartao.image_url}
              alt="Thumb"
              class="w-10 h-10 object-cover rounded border shrink-0 ml-4"
            />
          {/if}
          <p
            class="font-medium break-words whitespace-pre-wrap w-full pl-2 mt-1 ml-4 {$modoEscuro
              ? 'text-gray-200'
              : 'text-gray-800'}"
          >
            {cartao.front || "(Apenas imagem)"}
          </p>
        </div>

        <div
          class="w-full sm:w-1/2 p-5 flex items-center relative {$modoEscuro
            ? 'bg-gray-700/30'
            : 'bg-gray-50/50'}"
        >
          <span class="absolute top-3 left-3 text-xs font-bold text-gray-400"
            >R</span
          >
          <p
            class="break-words whitespace-pre-wrap w-full pl-2 ml-4 {$modoEscuro
              ? 'text-gray-400'
              : 'text-gray-600'}"
          >
            {cartao.back}
          </p>
        </div>
      </div>
    {/each}
  {/if}
</div>
