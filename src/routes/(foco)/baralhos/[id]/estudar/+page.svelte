<script>
  import SessaoEstudo from "#lib/components/SessaoEstudo.svelte";

  let { data } = $props();
</script>

<svelte:head>
  <title>Estudando {data.baralho.title} · Reviz</title>
</svelte:head>

{#key data.cartoes}
  <SessaoEstudo {data} />
{/key}
