<script>
  import { surgir } from "#lib/movimento.js";

  /**
   * Menu suspenso com navegação por setas. Os itens usam a classe .menu-item
   * e role="menuitem" (ou menuitemradio); clicar em qualquer item fecha o menu.
   * @type {{
   *   rotulo: string,
   *   gatilho: import('svelte').Snippet,
   *   children: import('svelte').Snippet,
   *   classeGatilho?: string,
   *   lado?: 'inicio' | 'fim',
   * }}
   */
  let { rotulo, gatilho, children, classeGatilho = "btn btn-fantasma btn-icone btn-sm", lado = "fim" } = $props();

  let aberto = $state(false);
  /** @type {HTMLDivElement} */
  let raiz;
  /** @type {HTMLButtonElement} */
  let botao;
  /** @type {HTMLDivElement | undefined} */
  let painel = $state();

  const itens = () =>
    /** @type {HTMLElement[]} */ ([...(painel?.querySelectorAll('[role^="menuitem"]') ?? [])]);

  $effect(() => {
    if (!aberto) return;

    queueMicrotask(() => itens()[0]?.focus());

    /** @param {PointerEvent} evento */
    const fora = (evento) => {
      if (!raiz.contains(/** @type {Node} */ (evento.target))) aberto = false;
    };
    /** @param {KeyboardEvent} evento */
    const teclas = (evento) => {
      if (evento.key === "Escape") {
        aberto = false;
        botao.focus();
        return;
      }
      if (evento.key !== "ArrowDown" && evento.key !== "ArrowUp") return;
      evento.preventDefault();
      const lista = itens();
      const atual = lista.indexOf(/** @type {HTMLElement} */ (document.activeElement));
      const passo = evento.key === "ArrowDown" ? 1 : -1;
      lista[(atual + passo + lista.length) % lista.length]?.focus();
    };

    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", teclas);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", teclas);
    };
  });
</script>

<div class="relative" bind:this={raiz}>
  <button
    bind:this={botao}
    type="button"
    class={classeGatilho}
    aria-label={rotulo}
    aria-haspopup="menu"
    aria-expanded={aberto}
    onclick={() => (aberto = !aberto)}
  >
    {@render gatilho()}
  </button>

  {#if aberto}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      bind:this={painel}
      role="menu"
      tabindex="-1"
      aria-label={rotulo}
      class="menu top-[calc(100%+6px)] {lado === 'fim' ? 'right-0' : 'left-0'}"
      style="transform-origin: top {lado === 'fim' ? 'right' : 'left'}"
      in:surgir={{ duracao: 150 }}
      out:surgir={{ duracao: 100 }}
      onclick={(evento) => {
        if (/** @type {HTMLElement} */ (evento.target).closest('[role^="menuitem"]')) aberto = false;
      }}
    >
      {@render children()}
    </div>
  {/if}
</div>
