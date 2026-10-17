<script>
  import MenuUsuario from "#lib/components/MenuUsuario.svelte";

  let { data, children } = $props();
</script>

<a
  href="#conteudo"
  class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-[10px] focus:bg-superficie focus:px-3 focus:py-2 focus:shadow-2"
>
  Pular para o conteúdo
</a>

<header class="sticky top-0 z-30 border-b border-borda/80 bg-fundo/85 backdrop-blur-md supports-[not(backdrop-filter:blur(1px))]:bg-fundo">
  <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
    <a href="/" class="-ml-1 flex items-center gap-2 rounded-[10px] px-1 py-1">
      <img src="/icon-site.svg" alt="" class="size-6" />
      <span class="font-display text-lg font-semibold tracking-tight">Reviz</span>
    </a>
    {#if data.usuario}
      <MenuUsuario usuario={data.usuario} tema={data.tema} />
    {/if}
  </div>
</header>

<main id="conteudo" class="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10">
  {@render children()}
</main>
