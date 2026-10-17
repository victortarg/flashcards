<script>
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import { toast } from "svelte-sonner";
  import ArrowLeftIcon from "phosphor-svelte/lib/ArrowLeftIcon";
  import CopyIcon from "phosphor-svelte/lib/CopyIcon";
  import DotsThreeIcon from "phosphor-svelte/lib/DotsThreeIcon";
  import FileArrowDownIcon from "phosphor-svelte/lib/FileArrowDownIcon";
  import FolderSimpleIcon from "phosphor-svelte/lib/FolderSimpleIcon";
  import LinkIcon from "phosphor-svelte/lib/LinkIcon";
  import MagnifyingGlassIcon from "phosphor-svelte/lib/MagnifyingGlassIcon";
  import PencilSimpleIcon from "phosphor-svelte/lib/PencilSimpleIcon";
  import PlayIcon from "phosphor-svelte/lib/PlayIcon";
  import ShareNetworkIcon from "phosphor-svelte/lib/ShareNetworkIcon";
  import ShuffleIcon from "phosphor-svelte/lib/ShuffleIcon";
  import TrashIcon from "phosphor-svelte/lib/TrashIcon";
  import CircleNotchIcon from "phosphor-svelte/lib/CircleNotchIcon";
  import CartaoForm from "#lib/components/CartaoForm.svelte";
  import Dialogo from "#lib/components/Dialogo.svelte";
  import DialogosBaralho from "#lib/components/DialogosBaralho.svelte";
  import Menu from "#lib/components/Menu.svelte";
  import { corDoBaralho } from "#lib/cores.js";
  import { normalizar, situacaoRevisao } from "#lib/datas.js";
  import { comFeedback } from "#lib/formularios.js";
  import { estaPendente } from "#lib/srs.js";

  let { data } = $props();

  /** @type {DialogosBaralho} */
  let dialogosBaralho;

  /** @type {string | null} */
  let editando = $state(null);
  let busca = $state("");
  let compartilhando = $state(false);
  let enviandoLink = $state(false);
  /** @type {any} */
  let cartaoParaApagar = $state(null);
  let confirmandoApagar = $state(false);
  let apagando = $state(false);

  const baralho = $derived(data.baralho);
  const pasta = $derived(data.pastas.find((p) => p.id === baralho.folder_id) ?? null);
  const pendentes = $derived(data.cartoes.filter((c) => estaPendente(c)).length);
  const novos = $derived(data.cartoes.filter((c) => !c.next_review).length);
  const link = $derived(`${page.url.origin}/compartilhado/${baralho.id}`);
  const resumoBaralho = $derived({ ...baralho, total: data.cartoes.length });

  const filtrados = $derived.by(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return data.cartoes;
    return data.cartoes.filter(
      (c) => normalizar(c.front).includes(termo) || normalizar(c.back).includes(termo),
    );
  });

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não deu para copiar automaticamente. Selecione o link e copie.");
    }
  }
</script>

<svelte:head>
  <title>{baralho.title} · Reviz</title>
</svelte:head>

<a href={pasta ? `/pastas/${pasta.id}` : "/"} class="btn btn-fantasma btn-sm -ml-3 mb-4 max-w-full">
  <ArrowLeftIcon size={16} class="shrink-0" />
  <span class="truncate">{pasta?.name ?? "Início"}</span>
</a>

<header class="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
  <div class="min-w-0">
    <div class="flex items-center gap-2">
      <span class="size-3 shrink-0 rounded-full" style="background: {corDoBaralho(baralho.color)}" aria-hidden="true"></span>
      <h1 class="min-w-0 break-words text-3xl font-semibold sm:text-[2.5rem] sm:leading-[1.1]">{baralho.title}</h1>
      <Menu rotulo="Opções do baralho" lado="inicio">
        {#snippet gatilho()}<DotsThreeIcon size={20} weight="bold" />{/snippet}
        <button type="button" role="menuitem" class="menu-item" onclick={() => dialogosBaralho.editar(resumoBaralho)}>
          <PencilSimpleIcon size={16} /> Editar
        </button>
        <button type="button" role="menuitem" class="menu-item" onclick={() => dialogosBaralho.mover(resumoBaralho)}>
          <FolderSimpleIcon size={16} /> Mover para pasta
        </button>
        <button type="button" role="menuitem" class="menu-item" onclick={() => (compartilhando = true)}>
          <ShareNetworkIcon size={16} /> Compartilhar
        </button>
        <a
          href="/baralhos/{baralho.id}/exportar"
          download
          role="menuitem"
          class="menu-item"
          data-sveltekit-preload-data="false"
        >
          <FileArrowDownIcon size={16} /> Exportar XML
        </a>
        <div class="menu-separador"></div>
        <button
          type="button"
          role="menuitem"
          class="menu-item"
          data-perigo
          onclick={() => dialogosBaralho.apagar(resumoBaralho, pasta ? `/pastas/${pasta.id}` : "/")}
        >
          <TrashIcon size={16} /> Apagar baralho
        </button>
      </Menu>
    </div>
    <p class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-texto-2 numeros">
      <span>{data.cartoes.length === 1 ? "1 cartão" : `${data.cartoes.length} cartões`}</span>
      {#if pendentes > 0}<span class="contador contador-acento">{pendentes} para hoje</span>{/if}
      {#if novos > 0 && novos !== pendentes}<span class="text-sm text-texto-3">{novos} novos</span>{/if}
      {#if baralho.is_public}
        <button type="button" class="inline-flex items-center gap-1 text-sm text-texto-3 underline-offset-4 hover:underline" onclick={() => (compartilhando = true)}>
          <LinkIcon size={14} /> Compartilhado
        </button>
      {/if}
    </p>
  </div>

  {#if data.cartoes.length > 0}
    <div class="flex flex-wrap gap-2">
      {#if pendentes > 0}
        <a href="/baralhos/{baralho.id}/estudar?modo=livre" class="btn btn-secundario btn-lg flex-1 basis-36 md:flex-none md:basis-auto">
          <ShuffleIcon size={18} /> Treino livre
        </a>
        <a href="/baralhos/{baralho.id}/estudar" class="btn btn-primario btn-lg flex-1 basis-36 md:flex-none md:basis-auto">
          <PlayIcon size={16} weight="fill" /> Estudar
        </a>
      {:else}
        <a href="/baralhos/{baralho.id}/estudar?modo=livre" class="btn btn-primario btn-lg flex-1 md:flex-none">
          <ShuffleIcon size={18} /> Treino livre
        </a>
      {/if}
    </div>
  {/if}
</header>

<section aria-labelledby="titulo-novo" class="superficie p-4 shadow-1 sm:p-5">
  <h2 id="titulo-novo" class="mb-4 font-sans text-base font-semibold tracking-normal">Novo cartão</h2>
  {#key baralho.id}
    <CartaoForm idBaralho={baralho.id} />
  {/key}
</section>

<section aria-labelledby="titulo-cartoes" class="mt-10">
  <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
    <h2 id="titulo-cartoes" class="font-sans text-base font-semibold tracking-normal">
      Cartões <span class="font-normal text-texto-3 numeros">{data.cartoes.length}</span>
    </h2>
    {#if data.cartoes.length > 5}
      <div class="relative w-full sm:w-64">
        <MagnifyingGlassIcon size={16} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-texto-3" />
        <input
          type="search"
          bind:value={busca}
          placeholder="Buscar nos cartões"
          aria-label="Buscar nos cartões"
          class="entrada min-h-10 py-2 pl-9"
        />
      </div>
    {/if}
  </div>

  {#if data.cartoes.length === 0}
    <p class="rounded-[16px] border border-dashed border-borda-forte px-6 py-10 text-center text-sm text-texto-2">
      Nenhum cartão ainda. Escreva a primeira pergunta e resposta no quadro acima.
    </p>
  {:else if filtrados.length === 0}
    <p class="px-1 py-6 text-sm text-texto-2">Nenhum cartão com "{busca}".</p>
  {:else}
    <ul class="flex flex-col gap-2.5">
      {#each filtrados as cartao (cartao.id)}
        {@const situacao = situacaoRevisao(cartao)}
        <li class="group rounded-[16px] border border-borda bg-superficie {editando === cartao.id ? 'shadow-2' : ''}">
          {#if editando === cartao.id}
            <div class="p-4 sm:p-5">
              <CartaoForm
                idBaralho={baralho.id}
                {cartao}
                aoConcluir={() => (editando = null)}
                aoCancelar={() => (editando = null)}
              />
            </div>
          {:else}
            <div class="grid gap-x-6 gap-y-3 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7.5rem] sm:p-5">
              {#each [{ rotulo: "Frente", texto: cartao.front, imagem: cartao.image_url }, { rotulo: "Verso", texto: cartao.back, imagem: cartao.image_back_url }] as lado, indice (lado.rotulo)}
                <div class="min-w-0 {indice === 1 ? 'border-t border-borda pt-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0' : ''}">
                  <p class="mb-1.5 text-xs text-texto-3">{lado.rotulo}</p>
                  {#if lado.imagem}
                    <img src={lado.imagem} alt="" loading="lazy" decoding="async" class="mb-2 h-16 w-auto max-w-full rounded-[8px] border border-borda object-cover" />
                  {/if}
                  {#if lado.texto}
                    <p class="line-clamp-4 whitespace-pre-line break-words text-[0.9375rem] leading-relaxed {indice === 1 ? 'text-texto-2' : ''}">{lado.texto}</p>
                  {/if}
                </div>
              {/each}
              <div class="flex items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-start">
                <span class="whitespace-nowrap text-xs {situacao.pendente ? 'font-medium text-acento-texto' : 'text-texto-3'}">
                  {situacao.texto}
                </span>
                <div class="flex gap-0.5 transition-opacity duration-150 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100">
                  <button type="button" class="btn btn-fantasma btn-icone btn-sm" aria-label="Editar cartão" onclick={() => (editando = cartao.id)}>
                    <PencilSimpleIcon size={16} />
                  </button>
                  <button
                    type="button"
                    class="btn btn-fantasma btn-icone btn-sm hover:text-acento-texto"
                    aria-label="Apagar cartão"
                    onclick={() => {
                      cartaoParaApagar = cartao;
                      confirmandoApagar = true;
                    }}
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

<DialogosBaralho bind:this={dialogosBaralho} pastas={data.pastas} />

<Dialogo bind:aberto={confirmandoApagar} titulo="Apagar cartão?" descricao="O histórico de revisão dele também some. Não dá para desfazer.">
  <form
    method="POST"
    action="?/apagarCartao"
    use:enhance={comFeedback({
      carregando: (ativo) => (apagando = ativo),
      aoSucesso: () => {
        confirmandoApagar = false;
        if (editando === cartaoParaApagar?.id) editando = null;
      },
      sucesso: "Cartão apagado.",
    })}
  >
    <input type="hidden" name="id" value={cartaoParaApagar?.id ?? ""} />
    <div class="flex justify-end gap-2">
      <button type="button" class="btn btn-fantasma" onclick={() => (confirmandoApagar = false)}>Cancelar</button>
      <button type="submit" class="btn btn-perigo" disabled={apagando}>
        {#if apagando}<CircleNotchIcon size={16} class="girar" />{/if}
        Apagar cartão
      </button>
    </div>
  </form>
</Dialogo>

<Dialogo
  bind:aberto={compartilhando}
  titulo="Compartilhar baralho"
  descricao="Quem abrir o link, com uma conta no Reviz, pode copiar este baralho para a própria conta. O seu continua só seu."
  largura="md"
>
  {#if baralho.is_public}
    <div class="flex gap-2">
      <input
        readonly
        value={link}
        aria-label="Link do baralho"
        class="entrada min-w-0 font-mono text-sm"
        onfocus={(evento) => evento.currentTarget.select()}
      />
      <button type="button" class="btn btn-primario h-11 shrink-0" onclick={copiarLink}>
        <CopyIcon size={16} /> Copiar
      </button>
    </div>
    <form
      method="POST"
      action="?/pararDeCompartilhar"
      class="mt-5 border-t border-borda pt-4"
      use:enhance={comFeedback({ carregando: (ativo) => (enviandoLink = ativo), sucesso: "Link desativado." })}
    >
      <button type="submit" class="btn btn-fantasma -ml-3 text-acento-texto" disabled={enviandoLink}>
        Desativar link
      </button>
    </form>
  {:else}
    <form
      method="POST"
      action="?/compartilhar"
      use:enhance={comFeedback({
        carregando: (ativo) => (enviandoLink = ativo),
        aoSucesso: () => copiarLink(),
      })}
    >
      <button type="submit" class="btn btn-primario" disabled={enviandoLink}>
        {#if enviandoLink}<CircleNotchIcon size={16} class="girar" />{:else}<LinkIcon size={16} />{/if}
        Criar e copiar link
      </button>
    </form>
  {/if}
</Dialogo>
