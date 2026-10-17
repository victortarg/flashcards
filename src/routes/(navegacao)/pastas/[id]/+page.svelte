<script>
  import ArrowLeftIcon from "phosphor-svelte/lib/ArrowLeftIcon";
  import DotsThreeIcon from "phosphor-svelte/lib/DotsThreeIcon";
  import PencilSimpleIcon from "phosphor-svelte/lib/PencilSimpleIcon";
  import PlusIcon from "phosphor-svelte/lib/PlusIcon";
  import TrashIcon from "phosphor-svelte/lib/TrashIcon";
  import Biblioteca from "#lib/components/Biblioteca.svelte";
  import DialogosPasta from "#lib/components/DialogosPasta.svelte";
  import Menu from "#lib/components/Menu.svelte";

  let { data } = $props();

  /** @type {Biblioteca} */
  let biblioteca;
  /** @type {DialogosPasta} */
  let dialogosPasta;

  const baralhos = $derived(data.baralhos.filter((b) => b.folder_id === data.pasta.id));
  const pendentes = $derived(baralhos.reduce((soma, b) => soma + b.pendentes, 0));
</script>

<svelte:head>
  <title>{data.pasta.name} · Reviz</title>
</svelte:head>

<a href="/" class="btn btn-fantasma btn-sm -ml-3 mb-4">
  <ArrowLeftIcon size={16} /> Início
</a>

<header class="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
  <div class="min-w-0">
    <div class="flex items-center gap-2">
      <h1 class="truncate text-3xl font-semibold sm:text-[2.5rem] sm:leading-[1.1]">{data.pasta.name}</h1>
      <Menu rotulo="Opções da pasta" lado="inicio">
        {#snippet gatilho()}<DotsThreeIcon size={20} weight="bold" />{/snippet}
        <button type="button" role="menuitem" class="menu-item" onclick={() => dialogosPasta.renomear(data.pasta)}>
          <PencilSimpleIcon size={16} /> Renomear
        </button>
        <button
          type="button"
          role="menuitem"
          class="menu-item"
          data-perigo
          onclick={() => dialogosPasta.apagar(data.pasta, baralhos.length, "/")}
        >
          <TrashIcon size={16} /> Apagar pasta
        </button>
      </Menu>
    </div>
    <p class="mt-2 text-texto-2 numeros">
      {baralhos.length === 1 ? "1 baralho" : `${baralhos.length} baralhos`}{pendentes > 0
        ? `, ${pendentes} ${pendentes === 1 ? "cartão" : "cartões"} para hoje`
        : ""}
    </p>
  </div>

  <button type="button" class="btn btn-primario" onclick={() => biblioteca.novoBaralho()}>
    <PlusIcon size={16} weight="bold" /> Novo baralho
  </button>
</header>

<Biblioteca
  bind:this={biblioteca}
  pastas={data.pastas}
  {baralhos}
  todosBaralhos={data.baralhos}
  idPasta={data.pasta.id}
/>

<DialogosPasta bind:this={dialogosPasta} />
