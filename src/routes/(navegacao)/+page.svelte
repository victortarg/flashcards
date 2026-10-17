<script>
  import FolderSimplePlusIcon from "phosphor-svelte/lib/FolderSimplePlusIcon";
  import PlusIcon from "phosphor-svelte/lib/PlusIcon";
  import Biblioteca from "#lib/components/Biblioteca.svelte";

  let { data } = $props();

  /** @type {Biblioteca} */
  let biblioteca;

  const soltos = $derived(data.baralhos.filter((b) => !b.folder_id));
  const pendentes = $derived(data.baralhos.reduce((soma, b) => soma + b.pendentes, 0));
  const comPendencia = $derived(data.baralhos.filter((b) => b.pendentes > 0).length);
  const primeiroNome = $derived.by(() => {
    const nome = data.usuario?.nome.trim().split(/\s+/)[0] ?? "";
    return nome.charAt(0).toLocaleUpperCase("pt-BR") + nome.slice(1);
  });
</script>

<svelte:head>
  <title>Seus baralhos · Reviz</title>
</svelte:head>

<header class="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <h1 class="text-3xl font-semibold sm:text-[2.5rem] sm:leading-[1.1]">
      {primeiroNome ? `Olá, ${primeiroNome}` : "Seus baralhos"}
    </h1>
    <p class="mt-2 text-texto-2">
      {#if data.baralhos.length === 0}
        Crie um baralho para começar a estudar.
      {:else if pendentes > 0}
        <span class="font-medium text-texto numeros">{pendentes === 1 ? "1 cartão" : `${pendentes} cartões`}</span>
        para revisar hoje{comPendencia > 1 ? `, em ${comPendencia} baralhos` : ""}.
      {:else}
        Nada para revisar agora. Bom momento para escrever cartões novos.
      {/if}
    </p>
  </div>

  <div class="flex flex-wrap gap-2">
    <button type="button" class="btn btn-secundario flex-1 basis-36 sm:flex-none sm:basis-auto" onclick={() => biblioteca.novaPasta()}>
      <FolderSimplePlusIcon size={17} /> Nova pasta
    </button>
    <button type="button" class="btn btn-primario flex-1 basis-36 sm:flex-none sm:basis-auto" onclick={() => biblioteca.novoBaralho()}>
      <PlusIcon size={16} weight="bold" /> Novo baralho
    </button>
  </div>
</header>

<Biblioteca
  bind:this={biblioteca}
  pastas={data.pastas}
  baralhos={soltos}
  todosBaralhos={data.baralhos}
  mostrarPastas
/>
