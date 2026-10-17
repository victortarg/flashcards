<script>
  import { enhance } from "$app/forms";
  import CircleNotchIcon from "phosphor-svelte/lib/CircleNotchIcon";
  import DownloadSimpleIcon from "phosphor-svelte/lib/DownloadSimpleIcon";
  import Flashcard from "#lib/components/Flashcard.svelte";
  import { corDoBaralho } from "#lib/cores.js";
  import { comFeedback } from "#lib/formularios.js";

  let { data } = $props();

  const baralho = $derived(data.compartilhado);
  let importando = $state(false);
</script>

<svelte:head>
  <title>{baralho.title} · Baralho compartilhado · Reviz</title>
</svelte:head>

<div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-14">
  <section class="lg:sticky lg:top-24">
    <p class="text-sm text-texto-2">Baralho compartilhado com você</p>
    <h1 class="mt-2 flex items-center gap-3 break-words text-3xl font-semibold sm:text-[2.5rem] sm:leading-[1.1]">
      <span class="size-3 shrink-0 rounded-full" style="background: {corDoBaralho(baralho.color)}" aria-hidden="true"></span>
      {baralho.title}
    </h1>
    <p class="mt-3 text-texto-2 numeros">
      {baralho.total === 1 ? "1 cartão" : `${baralho.total} cartões`}. Ao adicionar, você ganha uma cópia
      só sua, com o progresso começando do zero.
    </p>

    {#if baralho.proprio}
      <p class="mt-6 rounded-[10px] bg-superficie-2 px-3.5 py-3 text-sm text-texto-2">
        Este baralho é seu. Quem receber o link vê esta página.
      </p>
      <a href="/baralhos/{baralho.id}" class="btn btn-primario btn-lg mt-6">Abrir o baralho</a>
    {:else}
      <form
        method="POST"
        action="?/importar"
        class="mt-8 flex flex-col gap-2 sm:flex-row"
        use:enhance={comFeedback({ carregando: (ativo) => (importando = ativo) })}
      >
        <button type="submit" class="btn btn-primario btn-lg" disabled={importando}>
          {#if importando}
            <CircleNotchIcon size={18} class="girar" /> Copiando cartões
          {:else}
            <DownloadSimpleIcon size={18} /> Adicionar à minha conta
          {/if}
        </button>
        <a href="/" class="btn btn-fantasma btn-lg">Agora não</a>
      </form>
    {/if}
  </section>

  <section aria-label="Alguns cartões do baralho" class="flex flex-col gap-4">
    {#each baralho.amostra as cartao, i (i)}
      <Flashcard
        compacto
        frente={cartao.front}
        verso={cartao.back}
        imagemFrente={cartao.image_url}
        imagemVerso={cartao.image_back_url}
      />
    {:else}
      <p class="rounded-[16px] border border-dashed border-borda-forte px-6 py-10 text-center text-sm text-texto-2">
        Este baralho ainda não tem cartões.
      </p>
    {/each}
    {#if baralho.total > baralho.amostra.length}
      <p class="text-sm text-texto-3 numeros">
        E mais {baralho.total - baralho.amostra.length}. Toque numa ficha para ver a resposta.
      </p>
    {/if}
  </section>
</div>
