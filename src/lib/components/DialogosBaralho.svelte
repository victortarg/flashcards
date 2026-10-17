<script>
  import { enhance } from "$app/forms";
  import CircleNotchIcon from "phosphor-svelte/lib/CircleNotchIcon";
  import FolderSimpleIcon from "phosphor-svelte/lib/FolderSimpleIcon";
  import HouseIcon from "phosphor-svelte/lib/HouseIcon";
  import Dialogo from "./Dialogo.svelte";
  import SeletorCor from "./SeletorCor.svelte";
  import { corAleatoria } from "#lib/cores.js";
  import { comFeedback } from "#lib/formularios.js";

  /** @typedef {{ id: string, title: string, color: string | null, folder_id: string | null, total?: number }} Baralho */
  /** @typedef {'novo' | 'editar' | 'mover' | 'apagar'} Modo */

  /** @type {{ pastas: { id: string, name: string }[] }} */
  let { pastas } = $props();

  /** @type {Modo | null} */
  let modo = $state(null);
  /** @type {Baralho | null} */
  let alvo = $state(null);
  /** @type {string | null} */
  let idPastaNova = $state(null);
  let destino = $state("");
  let cor = $state(corAleatoria());
  let enviando = $state(false);

  let aberto = $state(false);

  /** @param {string | null} [idPasta] */
  export function novo(idPasta = null) {
    idPastaNova = idPasta;
    cor = corAleatoria();
    abrir("novo", null);
  }
  /** @param {Baralho} baralho */
  export function editar(baralho) {
    cor = baralho.color ?? cor;
    abrir("editar", baralho);
  }
  /** @param {Baralho} baralho */
  export function mover(baralho) {
    abrir("mover", baralho);
  }
  /** @param {Baralho} baralho @param {string} [voltarPara] */
  export function apagar(baralho, voltarPara = "") {
    destino = voltarPara;
    abrir("apagar", baralho);
  }

  /** @param {Modo} novoModo @param {Baralho | null} baralho */
  function abrir(novoModo, baralho) {
    modo = novoModo;
    alvo = baralho;
    enviando = false;
    aberto = true;
  }

  const feedback = (/** @type {string} */ mensagem) =>
    comFeedback({
      carregando: (ativo) => (enviando = ativo),
      aoSucesso: () => (aberto = false),
      sucesso: mensagem,
    });

  const titulos = {
    novo: "Novo baralho",
    editar: "Editar baralho",
    mover: "Mover para pasta",
    apagar: "Apagar baralho?",
  };
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
  titulo={modo ? titulos[modo] : ""}
  descricao={modo === "apagar" && alvo
    ? `"${alvo.title}" e ${alvo.total === 1 ? "o seu cartão" : `os seus ${alvo.total ?? 0} cartões`} serão apagados. Não dá para desfazer.`
    : undefined}
>
  {#if modo === "novo"}
    <form
      method="POST"
      action="?/criarBaralho"
      use:enhance={comFeedback({ carregando: (ativo) => (enviando = ativo), aoSucesso: () => (aberto = false) })}
    >
      <input type="hidden" name="idPasta" value={idPastaNova ?? ""} />
      <div class="flex flex-col gap-2">
        <label class="rotulo" for="titulo-novo">Nome</label>
        <!-- svelte-ignore a11y_autofocus -->
        <input id="titulo-novo" name="titulo" class="entrada" placeholder="Anatomia, Inglês, Direito Civil…" maxlength="120" required autofocus />
      </div>
      <div class="mt-5"><SeletorCor bind:valor={cor} /></div>
      {@render botaoEnviar("Criar baralho")}
    </form>
  {:else if modo === "editar" && alvo}
    <form method="POST" action="?/renomearBaralho" use:enhance={feedback("Baralho atualizado.")}>
      <input type="hidden" name="id" value={alvo.id} />
      <div class="flex flex-col gap-2">
        <label class="rotulo" for="titulo-editar">Nome</label>
        <!-- svelte-ignore a11y_autofocus -->
        <input id="titulo-editar" name="titulo" class="entrada" value={alvo.title} maxlength="120" required autofocus />
      </div>
      <div class="mt-5"><SeletorCor bind:valor={cor} /></div>
      {@render botaoEnviar("Salvar")}
    </form>
  {:else if modo === "mover" && alvo}
    <form method="POST" action="?/moverBaralho" use:enhance={feedback("Baralho movido.")}>
      <input type="hidden" name="id" value={alvo.id} />
      <fieldset class="flex max-h-72 flex-col gap-1 overflow-y-auto">
        <legend class="sr-only">Destino</legend>
        {#each [{ id: "", name: "Sem pasta (início)" }, ...pastas] as pasta (pasta.id)}
          <label class="flex h-11 items-center gap-3 rounded-[10px] px-3 transition-colors duration-150 has-[:checked]:bg-superficie-2 hover:bg-superficie-2">
            <input type="radio" name="idPasta" value={pasta.id} checked={(alvo.folder_id ?? "") === pasta.id} class="accent-[var(--texto)]" />
            {#if pasta.id}<FolderSimpleIcon size={18} class="text-texto-3" />{:else}<HouseIcon size={18} class="text-texto-3" />{/if}
            <span class="truncate text-sm">{pasta.name}</span>
          </label>
        {/each}
      </fieldset>
      {#if pastas.length === 0}
        <p class="ajuda mt-3">Você ainda não tem pastas. Crie uma na tela inicial.</p>
      {/if}
      {@render botaoEnviar("Mover")}
    </form>
  {:else if modo === "apagar" && alvo}
    <form method="POST" action="?/apagarBaralho" use:enhance={feedback("Baralho apagado.")}>
      <input type="hidden" name="id" value={alvo.id} />
      <input type="hidden" name="destino" value={destino} />
      {@render botaoEnviar("Apagar baralho", true)}
    </form>
  {/if}
</Dialogo>
