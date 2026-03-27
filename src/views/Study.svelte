<script>
  import {
    baralhoAtual,
    modoEscuro,
    navegarPara,
    buscarDados,
  } from "../stores.js";
  import Flashcard from "../components/Flashcard.svelte";
  import { supabase } from "../lib/supabaseClient";
  import { calcularProximaRevisao } from "../lib/srs.js";

  // --- Lógica de Fila de Estudo ---
  let filaDeEstudo = [];
  let cartaoAtual = null;
  let cartaoRevelado = false;
  let carregando = false;
  let finalizado = false;

  // Variável para controlar se estamos no modo "Revisão Forçada"
  let revisaoForcada = false;

  // Função para inicializar a fila
  function inicializarFila(forcarTudo = false) {
    if (!$baralhoAtual) {
      navegarPara("home");
      return;
    }

    const hoje = new Date();

    if (forcarTudo) {
      // Pega TODOS os cartões, independente da data
      filaDeEstudo = [...$baralhoAtual.cartoes];
      revisaoForcada = true;
    } else {
      revisaoForcada = false;
      // Filtra apenas os vencidos ou novos
      filaDeEstudo = $baralhoAtual.cartoes.filter((c) => {
        if (!c.next_review) return true; // Se não tem data, é novo
        return new Date(c.next_review) <= hoje;
      });
    }

    if (filaDeEstudo.length > 0) {
      cartaoAtual = filaDeEstudo[0];
      finalizado = false;
    } else {
      finalizado = true; // Nada para estudar hoje
    }
  }

  // Roda a inicialização padrão ao abrir
  inicializarFila();

  async function processarResposta(qualidade) {
    if (!cartaoAtual || carregando) return;
    carregando = true;

    try {
      // SÓ CALCULA E SALVA NO BANCO SE NÃO FOR REVISÃO FORÇADA
      if (!revisaoForcada) {
        // 1. Calcular novos dados SRS
        const atualizacao = calcularProximaRevisao(cartaoAtual, qualidade);

        // 2. Salvar no Supabase
        const { error } = await supabase
          .from("cards")
          .update(atualizacao)
          .eq("id", cartaoAtual.id);

        if (error) throw error;
      }

      // 3. Passar para o próximo (Comum para ambos os modos)
      filaDeEstudo.shift(); // Remove o primeiro da fila

      if (filaDeEstudo.length > 0) {
        cartaoAtual = filaDeEstudo[0];
        cartaoRevelado = false;
      } else {
        // Acabou a fila
        // Se foi revisão real, atualiza os dados globais para refletir as novas datas
        if (!revisaoForcada) {
          await buscarDados();
        }
        navegarPara("conclusao", $baralhoAtual);
      }
    } catch (erro) {
      alert("Erro ao salvar progresso: " + erro.message);
    } finally {
      carregando = false;
    }
  }
</script>

<div
  class="flex flex-col items-center justify-center h-full pt-4 max-w-xl mx-auto"
>
  {#if finalizado}
    <!-- TELA DE NADA PARA ESTUDAR -->
    <div class="text-center py-12 animate-fade-in">
      <div class="text-6xl mb-4">🎉</div>
      <h2
        class="text-2xl font-bold mb-2 {$modoEscuro
          ? 'text-white'
          : 'text-gray-800'}"
      >
        Tudo em dia!
      </h2>
      <p class="text-lg mb-8 {$modoEscuro ? 'text-gray-400' : 'text-gray-600'}">
        Você não tem cartões pendentes para revisar neste baralho agora.
      </p>

      <div class="flex flex-col gap-3 max-w-xs mx-auto">
        <button
          on:click={() => navegarPara("home")}
          class="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition"
        >
          Voltar ao Início
        </button>

        <!-- Botão para forçar revisão -->
        <button
          on:click={() => inicializarFila(true)}
          class="px-6 py-3 rounded-xl font-medium border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition {$modoEscuro
            ? 'border-gray-700 text-indigo-400 hover:bg-gray-800'
            : ''}"
        >
          Revisar Tudo Mesmo Assim
        </button>
      </div>
    </div>
  {:else if cartaoAtual}
    <!-- MODO ESTUDO ATIVO -->

    <!-- Barra de Progresso (Quantos faltam na fila de hoje) -->
    <div
      class="w-full flex justify-between items-center mb-6 px-2 text-xs font-bold uppercase tracking-widest {$modoEscuro
        ? 'text-gray-500'
        : 'text-gray-400'}"
    >
      <span>Pendentes: {filaDeEstudo.length}</span>
      <span
        >Baralho: {$baralhoAtual.title}
        {revisaoForcada ? "(Treino Livre)" : ""}</span
      >
    </div>

    <!-- Componente Flashcard -->
    <div class="w-full mb-8 px-2">
      <Flashcard
        frente={cartaoAtual.front}
        verso={cartaoAtual.back}
        imagem={cartaoAtual.image_url}
        bind:revelado={cartaoRevelado}
        darkMode={$modoEscuro}
      />
    </div>

    <!-- Controles -->
    <div class="w-full px-2 min-h-[80px]">
      {#if !cartaoRevelado}
        <!-- Botão VER RESPOSTA -->
        <button
          on:click={() => (cartaoRevelado = true)}
          class="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition transform active:scale-95"
        >
          Ver Resposta
        </button>
      {:else}
        <!-- Botões de Classificação SRS -->
        <div class="grid grid-cols-4 gap-2">
          <!-- ERREI (0) -->
          <button
            on:click={() => processarResposta(0)}
            disabled={carregando}
            class="py-3 rounded-lg font-bold text-sm bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 transition flex flex-col items-center gap-1 disabled:opacity-50"
          >
            <span>Errei</span>
            {#if !revisaoForcada}
              <span class="text-[10px] opacity-75 font-normal">Reiniciar</span>
            {/if}
          </button>

          <!-- DIFÍCIL (1) -->
          <button
            on:click={() => processarResposta(1)}
            disabled={carregando}
            class="py-3 rounded-lg font-bold text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200 transition flex flex-col items-center gap-1 disabled:opacity-50"
          >
            <span>Difícil</span>
            {#if !revisaoForcada}
              <span class="text-[10px] opacity-75 font-normal">Rever breve</span
              >
            {/if}
          </button>

          <!-- BOM (2) -->
          <button
            on:click={() => processarResposta(2)}
            disabled={carregando}
            class="py-3 rounded-lg font-bold text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 transition flex flex-col items-center gap-1 disabled:opacity-50"
          >
            <span>Bom</span>
            {#if !revisaoForcada}
              <span class="text-[10px] opacity-75 font-normal">padrão</span>
            {/if}
          </button>

          <!-- FÁCIL (3) -->
          <button
            on:click={() => processarResposta(3)}
            disabled={carregando}
            class="py-3 rounded-lg font-bold text-sm bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 transition flex flex-col items-center gap-1 disabled:opacity-50"
          >
            <span>Fácil</span>
            {#if !revisaoForcada}
              <span class="text-[10px] opacity-75 font-normal">+ tempo</span>
            {/if}
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>

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
