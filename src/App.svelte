<script>
  import { visualizacaoAtual, modoEscuro, usuario } from "./stores.js";
  import Header from "./components/Header.svelte";

  // Views
  import Login from "./views/Login.svelte";
  import Home from "./views/Home.svelte";
  import CriarBaralho from "./views/CreateDeck.svelte";
  import DetalhesBaralho from "./views/DeckDetail.svelte";
  import Estudo from "./views/Study.svelte";
  import Conclusao from "./views/Conclusao.svelte";
</script>

<div
  class="min-h-screen font-sans pb-20 transition-colors duration-300 {$modoEscuro
    ? 'bg-gray-900 text-gray-100'
    : 'bg-gray-50 text-gray-800'} selection:bg-indigo-500 selection:text-white"
>
  <!-- Só mostra Header se estiver logado -->
  {#if $usuario}
    <Header />
  {/if}

  <div class="max-w-3xl mx-auto px-4 py-8">
    <!-- Roteamento simples -->
    {#if !$usuario || $visualizacaoAtual === "login"}
      <Login />
    {:else if $visualizacaoAtual === "home"}
      <Home />
    {:else if $visualizacaoAtual === "criar-baralho"}
      <CriarBaralho />
    {:else if $visualizacaoAtual === "detalhes"}
      <DetalhesBaralho />
    {:else if $visualizacaoAtual === "estudo"}
      <Estudo />
    {:else if $visualizacaoAtual === "conclusao"}
      <Conclusao />
    {/if}
  </div>
</div>
