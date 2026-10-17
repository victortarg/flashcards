<script>
  import XIcon from "phosphor-svelte/lib/XIcon";

  /**
   * Diálogo nativo (<dialog>): foco preso, Esc e fundo inerte vêm do navegador.
   * @type {{
   *   aberto?: boolean,
   *   titulo: string,
   *   descricao?: string,
   *   largura?: 'sm' | 'md' | 'lg' | 'livre',
   *   children: import('svelte').Snippet,
   *   aoFechar?: () => void,
   * }}
   */
  let {
    aberto = $bindable(false),
    titulo,
    descricao,
    largura = "sm",
    children,
    aoFechar,
  } = $props();

  const id = $props.id();

  /** @type {HTMLDialogElement} */
  let dialogo;

  $effect(() => {
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  });

  // Mantém o conteúdo montado enquanto a animação de saída roda.
  let montado = $state(false);
  $effect(() => {
    if (aberto) {
      montado = true;
      return;
    }
    const espera = setTimeout(() => (montado = false), 220);
    return () => clearTimeout(espera);
  });
</script>

<dialog
  bind:this={dialogo}
  class="dialogo"
  data-largura={largura}
  aria-labelledby="{id}-titulo"
  onclose={() => {
    aberto = false;
    aoFechar?.();
  }}
  onclick={(evento) => {
    // Clique no fundo (fora do conteúdo) fecha.
    if (evento.target === evento.currentTarget) dialogo.close();
  }}
>
  <div class="dialogo-conteudo">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h2 id="{id}-titulo" class="text-lg font-semibold leading-tight">{titulo}</h2>
        {#if descricao}
          <p class="mt-1.5 text-sm text-texto-2">{descricao}</p>
        {/if}
      </div>
      <button
        type="button"
        class="btn btn-fantasma btn-icone btn-sm -mr-1.5 -mt-1 shrink-0"
        aria-label="Fechar"
        onclick={() => dialogo.close()}
      >
        <XIcon size={18} />
      </button>
    </div>
    <div class="mt-5">
      {#if aberto || montado}
        {@render children()}
      {/if}
    </div>
  </div>
</dialog>
