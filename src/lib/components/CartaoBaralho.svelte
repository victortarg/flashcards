<script>
  import DotsThreeIcon from "phosphor-svelte/lib/DotsThreeIcon";
  import FileArrowDownIcon from "phosphor-svelte/lib/FileArrowDownIcon";
  import FolderSimpleIcon from "phosphor-svelte/lib/FolderSimpleIcon";
  import PencilSimpleIcon from "phosphor-svelte/lib/PencilSimpleIcon";
  import TrashIcon from "phosphor-svelte/lib/TrashIcon";
  import Menu from "./Menu.svelte";
  import { corDoBaralho } from "#lib/cores.js";

  /**
   * @type {{
   *   baralho: { id: string, title: string, color: string | null, folder_id: string | null, total: number, pendentes: number },
   *   aoEditar: () => void,
   *   aoMover: () => void,
   *   aoApagar: () => void,
   * }}
   */
  let { baralho, aoEditar, aoMover, aoApagar } = $props();
</script>

<article
  class="group relative flex min-h-36 flex-col rounded-[16px] border border-borda bg-superficie p-4 pl-5 shadow-1 transition-colors duration-150 hover:border-borda-forte"
>
  <span
    class="absolute inset-y-4 left-0 w-1 rounded-r-full"
    style="background: {corDoBaralho(baralho.color)}"
    aria-hidden="true"
  ></span>

  <div class="flex items-start gap-2">
    <div class="min-w-0 flex-1">
      <h3 class="font-sans text-[0.9375rem] font-semibold leading-snug tracking-normal">
        <a
          href="/baralhos/{baralho.id}"
          class="line-clamp-2 break-words after:absolute after:inset-0 after:rounded-[16px] focus-visible:outline-none after:focus-visible:outline-2 after:focus-visible:outline-texto"
        >
          {baralho.title}
        </a>
      </h3>
      <p class="mt-1 text-sm text-texto-3 numeros">
        {baralho.total === 1 ? "1 cartão" : `${baralho.total} cartões`}
      </p>
    </div>
    <div class="relative z-10 -mr-1.5 -mt-1">
      <Menu rotulo="Opções de {baralho.title}">
        {#snippet gatilho()}<DotsThreeIcon size={20} weight="bold" />{/snippet}
        <button type="button" role="menuitem" class="menu-item" onclick={aoEditar}>
          <PencilSimpleIcon size={16} /> Editar
        </button>
        <button type="button" role="menuitem" class="menu-item" onclick={aoMover}>
          <FolderSimpleIcon size={16} /> Mover para pasta
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
        <button type="button" role="menuitem" class="menu-item" data-perigo onclick={aoApagar}>
          <TrashIcon size={16} /> Apagar
        </button>
      </Menu>
    </div>
  </div>

  <div class="mt-auto flex items-center justify-between gap-2 pt-5">
    {#if baralho.total === 0}
      <span class="text-sm text-texto-3">Sem cartões ainda</span>
    {:else if baralho.pendentes > 0}
      <span class="contador contador-acento">{baralho.pendentes} para hoje</span>
      <a href="/baralhos/{baralho.id}/estudar" class="btn btn-secundario btn-sm relative z-10">Estudar</a>
    {:else}
      <span class="text-sm text-texto-3">Em dia</span>
    {/if}
  </div>
</article>
