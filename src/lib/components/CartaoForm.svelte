<script>
  import { onMount, tick } from "svelte";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import CircleNotchIcon from "phosphor-svelte/lib/CircleNotchIcon";
  import SeletorImagem from "./SeletorImagem.svelte";
  import { deDataUrl, paraDataUrl } from "#lib/imagem.js";

  /**
   * Formulário de criar/editar cartão. No modo "novo", guarda um rascunho no
   * navegador para não perder o que foi digitado ao trocar de aba ou recarregar.
   * @type {{
   *   idBaralho: string,
   *   cartao?: { id: string, front: string | null, back: string | null, image_url: string | null, image_back_url: string | null } | null,
   *   aoConcluir?: () => void,
   *   aoCancelar?: () => void,
   * }}
   */
  let { idBaralho, cartao = null, aoConcluir, aoCancelar } = $props();

  // svelte-ignore state_referenced_locally
  const original = cartao;
  const chaveRascunho = $derived(`reviz_rascunho_${idBaralho}`);

  let frente = $state(original?.front ?? "");
  let verso = $state(original?.back ?? "");
  /** @type {File | null} */
  let arquivoFrente = $state(null);
  /** @type {File | null} */
  let arquivoVerso = $state(null);
  let urlFrente = $state(original?.image_url ?? null);
  let urlVerso = $state(original?.image_back_url ?? null);
  let enviando = $state(false);
  let rascunhoPronto = $state(false);

  /** @type {HTMLFormElement} */
  let formulario;
  /** @type {HTMLTextAreaElement} */
  let campoFrente;
  /** @type {SeletorImagem} */
  let seletorFrente;
  /** @type {SeletorImagem} */
  let seletorVerso;

  const temFrente = $derived(Boolean(frente.trim() || arquivoFrente || urlFrente));
  const temVerso = $derived(Boolean(verso.trim() || arquivoVerso || urlVerso));
  const valido = $derived(temFrente && temVerso);

  onMount(async () => {
    if (original) {
      campoFrente.focus();
      return;
    }
    try {
      const salvo = JSON.parse(localStorage.getItem(chaveRascunho) ?? "null");
      if (salvo) {
        frente = salvo.frente ?? "";
        verso = salvo.verso ?? "";
        if (salvo.imagemFrente) arquivoFrente = await deDataUrl(salvo.imagemFrente);
        if (salvo.imagemVerso) arquivoVerso = await deDataUrl(salvo.imagemVerso);
      }
    } catch {
      // Rascunho corrompido ou storage bloqueado: segue sem ele.
    }
    rascunhoPronto = true;
  });

  // Salva o rascunho (só no modo "novo") um pouco depois da última alteração.
  $effect(() => {
    if (original || !rascunhoPronto) return;
    const estado = { frente, verso, arquivoFrente, arquivoVerso };

    const espera = setTimeout(async () => {
      try {
        if (!estado.frente && !estado.verso && !estado.arquivoFrente && !estado.arquivoVerso) {
          localStorage.removeItem(chaveRascunho);
          return;
        }
        localStorage.setItem(
          chaveRascunho,
          JSON.stringify({
            frente: estado.frente,
            verso: estado.verso,
            imagemFrente: estado.arquivoFrente ? await paraDataUrl(estado.arquivoFrente) : null,
            imagemVerso: estado.arquivoVerso ? await paraDataUrl(estado.arquivoVerso) : null,
          }),
        );
      } catch {
        // Sem espaço no storage: o rascunho fica só com o que couber da próxima vez.
      }
    }, 400);

    return () => clearTimeout(espera);
  });

  /** Colar uma imagem no campo de texto anexa ela naquele lado do cartão. */
  function colar(/** @type {ClipboardEvent} */ evento, /** @type {SeletorImagem} */ seletor) {
    const imagem = [...(evento.clipboardData?.files ?? [])].find((arquivo) =>
      arquivo.type.startsWith("image/"),
    );
    if (!imagem) return;
    evento.preventDefault();
    seletor.receber(imagem);
  }

  function limpar() {
    frente = "";
    verso = "";
    arquivoFrente = null;
    arquivoVerso = null;
    urlFrente = null;
    urlVerso = null;
    try {
      localStorage.removeItem(chaveRascunho);
    } catch {}
  }

  /** @type {import('$app/forms').SubmitFunction} */
  const enviar = () => {
    enviando = true;
    return async ({ result, update }) => {
      enviando = false;
      if (result.type === "failure") {
        toast.error(result.data?.erro ?? "Não foi possível salvar o cartão.");
        return;
      }
      if (result.type === "error") {
        toast.error(result.error?.message ?? "Erro inesperado ao salvar.");
        return;
      }
      if (result.type === "success") {
        if (original) {
          toast.success("Cartão atualizado.");
        } else {
          limpar();
          toast.success("Cartão adicionado.");
        }
      }
      await update({ reset: false });
      if (!original) {
        await tick();
        campoFrente?.focus();
      }
      aoConcluir?.();
    };
  };
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions (atalhos Ctrl+Enter e Esc do formulário) -->
<form
  bind:this={formulario}
  method="POST"
  action="?/salvarCartao"
  enctype="multipart/form-data"
  use:enhance={enviar}
  onkeydown={(evento) => {
    if ((evento.ctrlKey || evento.metaKey) && evento.key === "Enter") {
      evento.preventDefault();
      if (valido && !enviando) formulario.requestSubmit();
    }
    if (evento.key === "Escape" && original) aoCancelar?.();
  }}
>
  {#if original}
    <input type="hidden" name="id" value={original.id} />
  {/if}

  <div class="grid gap-4 md:grid-cols-2 md:gap-5">
    <div class="flex flex-col gap-2">
      <label class="rotulo" for="frente-{original?.id ?? 'novo'}">Frente</label>
      <textarea
        bind:this={campoFrente}
        bind:value={frente}
        id="frente-{original?.id ?? 'novo'}"
        name="frente"
        rows="3"
        maxlength="2000"
        placeholder="A pergunta, termo ou imagem"
        class="entrada campo-cartao"
        onpaste={(evento) => colar(evento, seletorFrente)}
      ></textarea>
      <div class="min-h-8">
        <SeletorImagem
          bind:this={seletorFrente}
          nome="imagem_frente"
          rotulo="Imagem da frente"
          bind:arquivo={arquivoFrente}
          bind:urlAtual={urlFrente}
          urlOriginal={original?.image_url}
        />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <label class="rotulo" for="verso-{original?.id ?? 'novo'}">Verso</label>
      <textarea
        bind:value={verso}
        id="verso-{original?.id ?? 'novo'}"
        name="verso"
        rows="3"
        maxlength="2000"
        placeholder="A resposta"
        class="entrada campo-cartao"
        onpaste={(evento) => colar(evento, seletorVerso)}
      ></textarea>
      <div class="min-h-8">
        <SeletorImagem
          bind:this={seletorVerso}
          nome="imagem_verso"
          rotulo="Imagem do verso"
          bind:arquivo={arquivoVerso}
          bind:urlAtual={urlVerso}
          urlOriginal={original?.image_back_url}
        />
      </div>
    </div>
  </div>

  <div class="mt-4 flex items-center justify-end gap-2 border-t border-borda pt-4">
    <p class="mr-auto hidden items-center gap-1.5 text-xs text-texto-3 [@media(hover:hover)]:flex">
      <kbd class="tecla">Ctrl</kbd><kbd class="tecla">Enter</kbd> para salvar
    </p>
    {#if original}
      <button type="button" class="btn btn-fantasma" onclick={() => aoCancelar?.()}>Cancelar</button>
    {/if}
    <button type="submit" class="btn btn-primario" disabled={!valido || enviando}>
      {#if enviando}
        <CircleNotchIcon size={16} class="girar" />
        Salvando
      {:else}
        {original ? "Salvar alterações" : "Adicionar cartão"}
      {/if}
    </button>
  </div>
</form>

<style>
  .campo-cartao {
    resize: none;
    min-height: 5.5rem;
    field-sizing: content;
    max-height: 16rem;
  }
</style>
