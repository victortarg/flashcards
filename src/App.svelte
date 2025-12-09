<script>
  import { currentView, isDarkMode } from "./stores.js";
  import Header from "./components/Header.svelte";

  // Importação das Views (Telas)
  import Home from "./views/Home.svelte";
  import CreateDeck from "./views/CreateDeck.svelte";
  import DeckDetail from "./views/DeckDetail.svelte";
  import Study from "./views/Study.svelte";
  import Conclusao from "./views/Conclusao.svelte";
</script>

<!-- 
  Container Principal 
  - Controla o Tema Escuro/Claro globalmente
  - Gerencia qual tela (view) está sendo exibida
-->
<div
  class="min-h-screen font-sans pb-20 transition-colors duration-300 {$isDarkMode
    ? 'bg-gray-900 text-gray-100'
    : 'bg-gray-50 text-gray-800'} selection:bg-indigo-500 selection:text-white"
>
  <!-- O Header agora é um componente isolado -->
  <Header />

  <div class="max-w-3xl mx-auto px-4 py-8">
    <!-- Renderização Condicional das Telas -->
    {#if $currentView === "home"}
      <Home />
    {:else if $currentView === "create"}
      <CreateDeck />
    {:else if $currentView === "details"}
      <DeckDetail />
    {:else if $currentView === "study"}
      <Study />
    {:else if $currentView === "conclusao"}
      <Conclusao />
    {/if}
  </div>
</div>
