<script>
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import CircleNotchIcon from "phosphor-svelte/lib/CircleNotchIcon";
  import FileArrowUpIcon from "phosphor-svelte/lib/FileArrowUpIcon";

  /**
   * Escolhe um .xml (formato do AnkiApp), mostra uma prévia lida no próprio
   * navegador e envia o arquivo para o servidor, que lê tudo de novo.
   * @type {{ idPasta?: string | null, aoConcluir: () => void, aoCancelar: () => void }}
   */
  let { idPasta = null, aoConcluir, aoCancelar } = $props();

  /** @type {HTMLInputElement} */
  let entrada;
  /** @type {File | null} */
  let arquivo = $state(null);
  /** @type {import('#lib/xml-cartoes.js').BaralhoImportado[] | null} */
  let previa = $state(null);
  /** @type {string | null} */
  let erro = $state(null);
  let lendo = $state(false);
  let enviando = $state(false);
  let arrastando = $state(false);

  const total = $derived(previa?.reduce((soma, b) => soma + b.cartoes.length, 0) ?? 0);
  const ignorados = $derived(previa?.reduce((soma, b) => soma + b.ignorados, 0) ?? 0);

  /** @param {File | undefined | null} escolhido */
  async function ler(escolhido) {
    if (!escolhido) return;
    arquivo = escolhido;
    previa = null;
    erro = null;
    lendo = true;
    try {
      // O leitor só é baixado quando alguém abre a importação.
      const { lerXml, LIMITE_ARQUIVO } = await import("#lib/xml-cartoes.js");
      if (escolhido.size > LIMITE_ARQUIVO) throw new Error("O arquivo passou de 4 MB.");
      previa = lerXml(await escolhido.text());
    } catch (falha) {
      erro = falha instanceof Error ? falha.message : "Não foi possível ler o arquivo.";
    } finally {
      lendo = false;
    }
  }

  /** @param {DragEvent} evento */
  function soltar(evento) {
    evento.preventDefault();
    arrastando = false;
    const solto = evento.dataTransfer?.files?.[0];
    if (!solto) return;
    const transferencia = new DataTransfer();
    transferencia.items.add(solto);
    entrada.files = transferencia.files;
    ler(solto);
  }

  /** @type {import('$app/forms').SubmitFunction} */
  const enviar = () => {
    enviando = true;
    return async ({ result, update }) => {
      if (result.type === "failure" || result.type === "error") {
        enviando = false;
        toast.error(
          result.type === "failure"
            ? (result.data?.erro ?? "Não foi possível importar.")
            : (result.error?.message ?? "Erro inesperado ao importar."),
        );
        return;
      }
      toast.success(
        result.type === "success" && result.data?.importados > 1
          ? `${result.data.importados} baralhos importados.`
          : "Baralho importado.",
      );
      aoConcluir();
      await update();
    };
  };
</script>

<form method="POST" action="?/importarXml" enctype="multipart/form-data" use:enhance={enviar}>
  <input type="hidden" name="idPasta" value={idPasta ?? ""} />

  <label
    class="zona flex cursor-pointer flex-col items-center gap-2 rounded-[12px] border border-dashed border-borda-forte px-4 py-7 text-center transition-colors duration-150 focus-within:border-texto-2 hover:bg-superficie-2 {arrastando ? 'bg-superficie-2' : ''}"
    ondragover={(evento) => {
      evento.preventDefault();
      arrastando = true;
    }}
    ondragleave={() => (arrastando = false)}
    ondrop={soltar}
  >
    <input
      bind:this={entrada}
      type="file"
      name="arquivo"
      accept=".xml,text/xml,application/xml"
      class="sr-only"
      required
      onchange={(evento) => ler(/** @type {HTMLInputElement} */ (evento.currentTarget).files?.[0])}
    />
    <FileArrowUpIcon size={26} class="text-texto-2" />
    <span class="max-w-full truncate text-sm font-medium">{arquivo ? arquivo.name : "Escolher arquivo .xml"}</span>
    <span class="ajuda">{arquivo ? "Toque para trocar" : "ou arraste o arquivo para cá"}</span>
  </label>

  <div class="mt-4 min-h-6" aria-live="polite">
    {#if lendo}
      <p class="flex items-center gap-2 text-sm text-texto-2"><CircleNotchIcon size={16} class="girar" /> Lendo o arquivo</p>
    {:else if erro}
      <p class="erro-campo" role="alert">{erro}</p>
    {:else if previa}
      <ul class="flex flex-col gap-2">
        {#each previa as baralho, i (i)}
          <li class="rounded-[10px] bg-superficie-2 px-3.5 py-3">
            <p class="truncate text-sm font-medium">{baralho.titulo}</p>
            <p class="text-xs text-texto-3 numeros">
              {baralho.cartoes.length === 1 ? "1 cartão" : `${baralho.cartoes.length} cartões`}
            </p>
            {#if baralho.cartoes[0]}
              <p class="mt-2 line-clamp-2 border-l-2 border-acento pl-2.5 text-sm text-texto-2">
                {baralho.cartoes[0].frente || "Cartão só com imagem"}
              </p>
            {/if}
          </li>
        {/each}
      </ul>
      {#if ignorados > 0}
        <p class="ajuda mt-2">
          {ignorados === 1 ? "1 cartão sem frente ou verso vai ficar de fora." : `${ignorados} cartões sem frente ou verso vão ficar de fora.`}
        </p>
      {/if}
    {:else}
      <p class="ajuda">Aceita o XML exportado pelo AnkiApp ou pelo Reviz. Os cartões entram como novos.</p>
    {/if}
  </div>

  <div class="mt-6 flex justify-end gap-2">
    <button type="button" class="btn btn-fantasma" onclick={aoCancelar}>Cancelar</button>
    <button type="submit" class="btn btn-primario" disabled={!previa || enviando}>
      {#if enviando}<CircleNotchIcon size={16} class="girar" /> Importando{:else}Importar {total === 1 ? "1 cartão" : `${total} cartões`}{/if}
    </button>
  </div>
</form>
