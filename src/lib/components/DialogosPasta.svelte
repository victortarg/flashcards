<script>
  import { enhance } from "$app/forms";
  import CircleNotchIcon from "phosphor-svelte/lib/CircleNotchIcon";
  import Dialogo from "./Dialogo.svelte";
  import { comFeedback } from "#lib/formularios.js";

  /** @typedef {{ id: string, name: string }} Pasta */
  /** @typedef {'criar' | 'renomear' | 'apagar'} Modo */

  /** @type {Modo | null} */
  let modo = $state(null);
  /** @type {Pasta | null} */
  let alvo = $state(null);
  let quantidade = $state(0);
  let destino = $state("");
  let enviando = $state(false);
  let aberto = $state(false);

  export function criar() {
    abrir("criar", null);
  }
  /** @param {Pasta} pasta */
  export function renomear(pasta) {
    abrir("renomear", pasta);
  }
  /** @param {Pasta} pasta @param {number} baralhos @param {string} [voltarPara] */
  export function apagar(pasta, baralhos, voltarPara = "") {
    quantidade = baralhos;
    destino = voltarPara;
    abrir("apagar", pasta);
  }

  /** @param {Modo} novoModo @param {Pasta | null} pasta */
  function abrir(novoModo, pasta) {
    modo = novoModo;
    alvo = pasta;
    enviando = false;
    aberto = true;
  }

  const feedback = (/** @type {string} */ mensagem) =>
    comFeedback({
      carregando: (ativo) => (enviando = ativo),
      aoSucesso: () => (aberto = false),
      sucesso: mensagem,
    });

  const descricaoApagar = $derived(
    quantidade === 0
      ? "A pasta está vazia."
      : quantidade === 1
        ? "O baralho dentro dela volta para a tela inicial. Nenhum cartão é apagado."
        : `Os ${quantidade} baralhos dentro dela voltam para a tela inicial. Nenhum cartão é apagado.`,
  );
</script>

{#snippet botaoEnviar(/** @type {string} */ rotulo, perigo = false)}
  <div class="mt-6 flex justify-end gap-2">
    <button type="button" class="btn btn-fantasma" onclick={() => (aberto = false)}>Cancelar</button>
    <button type="submit" class="btn {perigo ? 'btn-perigo' : 'btn-primario'}" disabled={enviando}>
      {#if enviando}<CircleNotchIcon size={16} class="girar" />{/if}
      {rotulo}
    </button>
  </div>
{/snippet}

<Dialogo
  bind:aberto
  titulo={modo === "criar" ? "Nova pasta" : modo === "renomear" ? "Renomear pasta" : "Apagar pasta?"}
  descricao={modo === "apagar" ? descricaoApagar : undefined}
>
  {#if modo === "apagar" && alvo}
    <form method="POST" action="?/apagarPasta" use:enhance={feedback("Pasta apagada.")}>
      <input type="hidden" name="id" value={alvo.id} />
      <input type="hidden" name="destino" value={destino} />
      {@render botaoEnviar("Apagar pasta", true)}
    </form>
  {:else if modo}
    <form
      method="POST"
      action={modo === "criar" ? "?/criarPasta" : "?/renomearPasta"}
      use:enhance={feedback(modo === "criar" ? "Pasta criada." : "Pasta renomeada.")}
    >
      {#if alvo}<input type="hidden" name="id" value={alvo.id} />{/if}
      <div class="flex flex-col gap-2">
        <label class="rotulo" for="nome-pasta">Nome</label>
        <!-- svelte-ignore a11y_autofocus -->
        <input
          id="nome-pasta"
          name="nome"
          class="entrada"
          value={alvo?.name ?? ""}
          placeholder="Semestre 3, Concurso, Idiomas…"
          maxlength="80"
          required
          autofocus
        />
      </div>
      {@render botaoEnviar(modo === "criar" ? "Criar pasta" : "Salvar")}
    </form>
  {/if}
</Dialogo>
