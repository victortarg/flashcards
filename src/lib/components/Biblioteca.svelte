<script>
  import DotsThreeIcon from "phosphor-svelte/lib/DotsThreeIcon";
  import FileArrowUpIcon from "phosphor-svelte/lib/FileArrowUpIcon";
  import FolderSimpleIcon from "phosphor-svelte/lib/FolderSimpleIcon";
  import PencilSimpleIcon from "phosphor-svelte/lib/PencilSimpleIcon";
  import PlusIcon from "phosphor-svelte/lib/PlusIcon";
  import TrashIcon from "phosphor-svelte/lib/TrashIcon";
  import CartaoBaralho from "./CartaoBaralho.svelte";
  import DialogosBaralho from "./DialogosBaralho.svelte";
  import DialogosPasta from "./DialogosPasta.svelte";
  import Menu from "./Menu.svelte";

  /**
   * Grade de pastas e baralhos, usada na tela inicial e dentro de uma pasta.
   * @type {{
   *   pastas: { id: string, name: string }[],
   *   baralhos: any[],
   *   todosBaralhos: any[],
   *   idPasta?: string | null,
   *   mostrarPastas?: boolean,
   * }}
   */
  let { pastas, baralhos, todosBaralhos, idPasta = null, mostrarPastas = false } = $props();

  /** @type {DialogosBaralho} */
  let dialogosBaralho;
  /** @type {DialogosPasta} */
  let dialogosPasta;

  export const novoBaralho = () => dialogosBaralho.novo(idPasta);
  export const novaPasta = () => dialogosPasta.criar();
  export const importarXml = () => dialogosBaralho.importar(idPasta);

  /** @param {string} id */
  function resumoPasta(id) {
    const dentro = todosBaralhos.filter((b) => b.folder_id === id);
    return {
      baralhos: dentro.length,
      pendentes: dentro.reduce((soma, b) => soma + b.pendentes, 0),
    };
  }
</script>

{#if mostrarPastas && pastas.length > 0}
  <section aria-labelledby="titulo-pastas" class="mb-10">
    <h2 id="titulo-pastas" class="mb-3 font-sans text-sm font-medium tracking-normal text-texto-2">Pastas</h2>
    <ul class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {#each pastas as pasta (pasta.id)}
        {@const resumo = resumoPasta(pasta.id)}
        <li
          class="group relative flex items-center gap-3 rounded-[16px] border border-borda bg-superficie py-3 pl-4 pr-2 transition-colors duration-150 hover:border-borda-forte"
        >
          <FolderSimpleIcon size={22} weight="duotone" class="shrink-0 text-texto-2" />
          <div class="min-w-0 flex-1">
            <a
              href="/pastas/{pasta.id}"
              class="block truncate text-[0.9375rem] font-medium after:absolute after:inset-0 after:rounded-[16px] focus-visible:outline-none after:focus-visible:outline-2 after:focus-visible:outline-texto"
            >
              {pasta.name}
            </a>
            <p class="mt-0.5 flex items-center gap-2 text-xs text-texto-3 numeros">
              {resumo.baralhos === 1 ? "1 baralho" : `${resumo.baralhos} baralhos`}
              {#if resumo.pendentes > 0}
                <span class="font-medium text-acento-texto">{resumo.pendentes} para hoje</span>
              {/if}
            </p>
          </div>
          <div class="relative z-10">
            <Menu rotulo="Opções de {pasta.name}">
              {#snippet gatilho()}<DotsThreeIcon size={20} weight="bold" />{/snippet}
              <button type="button" role="menuitem" class="menu-item" onclick={() => dialogosPasta.renomear(pasta)}>
                <PencilSimpleIcon size={16} /> Renomear
              </button>
              <button
                type="button"
                role="menuitem"
                class="menu-item"
                data-perigo
                onclick={() => dialogosPasta.apagar(pasta, resumo.baralhos)}
              >
                <TrashIcon size={16} /> Apagar pasta
              </button>
            </Menu>
          </div>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<section aria-labelledby="titulo-baralhos">
  {#if mostrarPastas && pastas.length > 0}
    <h2 id="titulo-baralhos" class="mb-3 font-sans text-sm font-medium tracking-normal text-texto-2">Baralhos</h2>
  {:else}
    <h2 id="titulo-baralhos" class="sr-only">Baralhos</h2>
  {/if}

  {#if baralhos.length === 0}
    <div class="vazio flex flex-col items-start gap-5 rounded-[16px] border border-dashed border-borda-forte px-6 py-12 sm:flex-row sm:items-center sm:px-10">
      <div class="pilha-vazia" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="max-w-sm">
        <p class="font-display text-xl font-semibold tracking-tight">
          {idPasta ? "Esta pasta está vazia" : mostrarPastas && pastas.length ? "Nenhum baralho solto" : "Comece pelo primeiro baralho"}
        </p>
        <p class="mt-1.5 text-sm text-texto-2">
          {idPasta
            ? "Crie um baralho aqui ou mova um existente pelo menu dele."
            : "Um baralho reúne os cartões de um assunto. Depois é só adicionar perguntas e respostas."}
        </p>
        <div class="mt-5 flex flex-wrap gap-2">
          <button type="button" class="btn btn-primario" onclick={novoBaralho}>
            <PlusIcon size={16} weight="bold" /> Novo baralho
          </button>
          <button type="button" class="btn btn-secundario" onclick={importarXml}>
            <FileArrowUpIcon size={17} /> Importar XML
          </button>
        </div>
      </div>
    </div>
  {:else}
    <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each baralhos as baralho (baralho.id)}
        <li class="grid">
          <CartaoBaralho
            {baralho}
            aoEditar={() => dialogosBaralho.editar(baralho)}
            aoMover={() => dialogosBaralho.mover(baralho)}
            aoApagar={() => dialogosBaralho.apagar(baralho)}
          />
        </li>
      {/each}
    </ul>
  {/if}
</section>

<DialogosBaralho bind:this={dialogosBaralho} {pastas} />
<DialogosPasta bind:this={dialogosPasta} />

<style>
  /* Três fichas empilhadas: o único "desenho" do app, feito só com bordas. */
  .pilha-vazia {
    position: relative;
    width: 5.5rem;
    height: 4rem;
    flex-shrink: 0;
  }
  .pilha-vazia span {
    position: absolute;
    inset: 0;
    border-radius: 10px;
    border: 1px solid var(--borda-forte);
    background: var(--superficie);
  }
  .pilha-vazia span:nth-child(1) {
    rotate: -8deg;
    translate: -4px 2px;
    background: var(--superficie-2);
  }
  .pilha-vazia span:nth-child(2) {
    rotate: 5deg;
    translate: 4px 0;
    background: var(--superficie-2);
  }
  .pilha-vazia span:nth-child(3) {
    border-top: 2px solid var(--acento);
  }
</style>
