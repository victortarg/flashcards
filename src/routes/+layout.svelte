<script>
  import "@fontsource-variable/geist";
  import "@fontsource-variable/geist-mono";
  import "@fontsource-variable/bricolage-grotesque";
  import "../app.css";

  import { Toaster } from "svelte-sonner";
  import { navigating } from "$app/state";

  let { children } = $props();

  // A barra só aparece se a navegação demorar; trocas rápidas ficam sem indicador.
  let carregandoVisivel = $state(false);
  $effect(() => {
    if (!navigating.to) {
      carregandoVisivel = false;
      return;
    }
    const espera = setTimeout(() => (carregandoVisivel = true), 150);
    return () => clearTimeout(espera);
  });
</script>

<svelte:head>
  <title>Reviz</title>
  <meta name="description" content="Flashcards com repetição espaçada para estudar o que está perto de esquecer." />
</svelte:head>

{#if carregandoVisivel}
  <div class="barra-navegacao" role="progressbar" aria-label="Carregando página"></div>
{/if}

{@render children()}

<Toaster position="bottom-center" offset="24px" mobileOffset="16px" />

<style>
  .barra-navegacao {
    position: fixed;
    inset: 0 0 auto;
    z-index: 60;
    height: 2px;
    background: var(--acento);
    transform-origin: left;
    animation: progresso 8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  }
  @keyframes progresso {
    from {
      transform: scaleX(0.08);
    }
    to {
      transform: scaleX(0.92);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .barra-navegacao {
      animation: none;
      transform: scaleX(0.6);
    }
  }
</style>
