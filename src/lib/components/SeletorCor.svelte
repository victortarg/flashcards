<script>
  import CheckIcon from "phosphor-svelte/lib/CheckIcon";
  import { CORES } from "#lib/cores.js";

  /** @type {{ valor?: string }} */
  let { valor = $bindable(CORES[3].chave) } = $props();
</script>

<fieldset>
  <legend class="rotulo">Cor</legend>
  <div class="mt-2.5 flex gap-2.5">
    {#each CORES as cor (cor.chave)}
      <label class="relative grid size-8 place-items-center rounded-full" style="background: {cor.valor}">
        <input type="radio" name="cor" value={cor.chave} bind:group={valor} class="peer sr-only" />
        <span class="sr-only">{cor.nome}</span>
        <span
          class="absolute -inset-1 rounded-full border-2 border-transparent transition-colors duration-150 peer-checked:border-texto peer-focus-visible:border-texto"
        ></span>
        {#if valor === cor.chave}
          <CheckIcon size={14} weight="bold" color="white" />
        {/if}
      </label>
    {/each}
  </div>
</fieldset>
