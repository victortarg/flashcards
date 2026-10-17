<script>
  import ImageSquareIcon from "phosphor-svelte/lib/ImageSquareIcon";
  import XIcon from "phosphor-svelte/lib/XIcon";
  import { toast } from "svelte-sonner";
  import { comprimirImagem } from "#lib/imagem.js";

  /**
   * Escolhe uma imagem, comprime no navegador e coloca o arquivo já comprimido
   * no <input type="file">, para o formulário enviar normalmente.
   * @type {{
   *   nome: string,
   *   rotulo: string,
   *   arquivo?: File | null,
   *   urlAtual?: string | null,
   *   urlOriginal?: string | null,
   * }}
   */
  let {
    nome,
    rotulo,
    arquivo = $bindable(null),
    urlAtual = $bindable(null),
    urlOriginal = null,
  } = $props();

  /** @type {HTMLInputElement} */
  let entrada;
  let comprimindo = $state(false);
  let arrastando = $state(false);

  const previa = $derived(arquivo ? URL.createObjectURL(arquivo) : urlAtual);
  const removida = $derived(Boolean(urlOriginal) && !urlAtual && !arquivo);

  $effect(() => {
    const url = previa;
    return () => {
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  });

  // Mantém o <input type="file"> sincronizado com o arquivo (inclusive rascunhos restaurados).
  $effect(() => {
    if (!entrada) return;
    if (!arquivo) {
      entrada.value = "";
      return;
    }
    if (entrada.files?.[0] === arquivo) return;
    const transferencia = new DataTransfer();
    transferencia.items.add(arquivo);
    entrada.files = transferencia.files;
  });

  /** @param {File | undefined | null} escolhido */
  export async function receber(escolhido) {
    if (!escolhido) return;
    if (!escolhido.type.startsWith("image/")) {
      toast.error("Esse arquivo não é uma imagem.");
      return;
    }
    comprimindo = true;
    try {
      arquivo = await comprimirImagem(escolhido);
    } finally {
      comprimindo = false;
    }
  }

  function remover() {
    arquivo = null;
    urlAtual = null;
  }
</script>

<input
  bind:this={entrada}
  type="file"
  name={nome}
  accept="image/*"
  class="sr-only"
  tabindex="-1"
  aria-hidden="true"
  onchange={(evento) => receber(/** @type {HTMLInputElement} */ (evento.currentTarget).files?.[0])}
/>
<input type="hidden" name="remover_{nome}" value={removida ? "1" : ""} />

{#if previa}
  <div class="relative inline-block">
    <img
      src={previa}
      alt={rotulo}
      class="h-20 w-auto max-w-40 rounded-[10px] border border-borda object-cover"
    />
    <button
      type="button"
      class="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border border-borda bg-superficie text-texto-2 shadow-1 transition-transform duration-150 active:scale-90"
      aria-label="Remover {rotulo.toLowerCase()}"
      onclick={remover}
    >
      <XIcon size={12} weight="bold" />
    </button>
  </div>
{:else}
  <button
    type="button"
    class="btn btn-fantasma btn-sm -ml-2 {arrastando ? 'bg-superficie-2 text-texto' : ''}"
    disabled={comprimindo}
    onclick={() => entrada.click()}
    ondragover={(evento) => {
      evento.preventDefault();
      arrastando = true;
    }}
    ondragleave={() => (arrastando = false)}
    ondrop={(evento) => {
      evento.preventDefault();
      arrastando = false;
      receber(evento.dataTransfer?.files?.[0]);
    }}
  >
    <ImageSquareIcon size={16} />
    {comprimindo ? "Preparando imagem…" : "Adicionar imagem"}
  </button>
{/if}
