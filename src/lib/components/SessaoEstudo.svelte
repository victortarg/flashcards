<script>
  import { deserialize } from "$app/forms";
  import { invalidate } from "$app/navigation";
  import { page } from "$app/state";
  import { toast } from "svelte-sonner";
  import ArrowCounterClockwiseIcon from "phosphor-svelte/lib/ArrowCounterClockwiseIcon";
  import CheckIcon from "phosphor-svelte/lib/CheckIcon";
  import ShuffleIcon from "phosphor-svelte/lib/ShuffleIcon";
  import XIcon from "phosphor-svelte/lib/XIcon";
  import Flashcard from "./Flashcard.svelte";
  import { quandoVolta } from "#lib/datas.js";
  import { easeOut, reduzirMovimento } from "#lib/movimento.js";
  import { calcularProximaRevisao, descreverIntervalo } from "#lib/srs.js";

  /**
   * Uma sessão de estudo. A página recria este componente sempre que chega uma
   * fila nova (por exemplo, ao começar outro treino livre).
   * @type {{ data: {
   *   baralho: { id: string, title: string },
   *   cartoes: any[],
   *   livre: boolean,
   *   total: number,
   *   proximaRevisao: string | null,
   * } }}
   */
  let { data } = $props();

  const RESPOSTAS = /** @type {const} */ ([
    { qualidade: 0, rotulo: "Errei", tecla: "1", cor: "var(--acento)" },
    { qualidade: 1, rotulo: "Difícil", tecla: "2", cor: "var(--aviso)" },
    { qualidade: 2, rotulo: "Bom", tecla: "3", cor: "var(--texto-2)" },
    { qualidade: 3, rotulo: "Fácil", tecla: "4", cor: "var(--sucesso)" },
  ]);

  // A fila é fixa durante a sessão; recarregar a página busca a fila nova.
  // svelte-ignore state_referenced_locally
  const fila = data.cartoes;
  let indice = $state(0);
  /** @type {string | null} */
  let reveladoId = $state(null);
  let viaTeclado = $state(false);
  let contagem = $state([0, 0, 0, 0]);
  let concluido = $state(false);

  /** @type {Set<Promise<void>>} */
  const envios = new Set();

  const atual = $derived(fila[indice]);
  const revelado = $derived(atual ? reveladoId === atual.id : false);
  const progresso = $derived(fila.length ? (concluido ? 1 : indice / fila.length) : 0);
  const revisados = $derived(contagem.reduce((a, b) => a + b, 0));

  const intervalos = $derived(
    atual && !data.livre
      ? RESPOSTAS.map((r) => descreverIntervalo(calcularProximaRevisao(atual, r.qualidade).interval))
      : [],
  );

  /** @param {boolean} teclado */
  function revelar(teclado) {
    if (!atual) return;
    viaTeclado = teclado;
    reveladoId = atual.id;
  }

  /** @param {number} qualidade @param {boolean} teclado */
  function responder(qualidade, teclado) {
    if (!atual || !revelado) return;
    viaTeclado = teclado;
    contagem[qualidade]++;
    if (!data.livre) registrar(atual.id, qualidade);

    if (indice + 1 >= fila.length) {
      concluido = true;
      finalizar();
    } else {
      indice++;
    }
  }

  /** Envia a resposta em segundo plano: a próxima ficha aparece sem esperar a rede. */
  function registrar(/** @type {string} */ id, /** @type {number} */ qualidade) {
    const tentar = async () => {
      const corpo = new FormData();
      corpo.set("id", id);
      corpo.set("qualidade", String(qualidade));
      const resposta = await fetch(`${page.url.pathname}?/responder`, {
        method: "POST",
        body: corpo,
        headers: { "x-sveltekit-action": "true" },
      });
      const resultado = deserialize(await resposta.text());
      if (resultado.type !== "success") throw new Error("falha ao salvar");
    };

    const envio = tentar()
      .catch(() => new Promise((r) => setTimeout(r, 1500)).then(tentar))
      .catch(() => {
        toast.error("Uma resposta não foi salva. Confira sua conexão.");
      })
      .finally(() => envios.delete(envio));
    envios.add(envio);
  }

  async function finalizar() {
    await Promise.allSettled([...envios]);
    // Atualiza os contadores da tela inicial para quando a pessoa voltar.
    invalidate("app:biblioteca");
  }

  /** @param {KeyboardEvent} evento */
  function teclado(evento) {
    if (evento.ctrlKey || evento.metaKey || evento.altKey || concluido || !atual) return;
    const alvo = /** @type {HTMLElement} */ (evento.target);
    if (alvo.closest("input, textarea, [contenteditable], dialog")) return;

    if (!revelado && (evento.key === " " || evento.key === "Enter")) {
      evento.preventDefault();
      revelar(true);
      return;
    }
    if (!revelado) return;

    const resposta = RESPOSTAS.find((r) => r.tecla === evento.key);
    if (resposta) {
      evento.preventDefault();
      responder(resposta.qualidade, true);
    } else if (evento.key === " ") {
      evento.preventDefault();
      responder(2, true);
    }
  }

  /**
   * Troca de ficha: a anterior sai rápido e a próxima sobe um pouco.
   * Pelo teclado não anima, para não atrasar quem está indo rápido.
   * @param {Element} _no
   * @param {{ saida?: boolean }} opcoes
   */
  function trocar(_no, { saida = false } = {}) {
    if (viaTeclado) return { duration: 0 };
    if (reduzirMovimento()) {
      return { duration: saida ? 100 : 150, css: (/** @type {number} */ t) => `opacity: ${t}` };
    }
    return saida
      ? {
          duration: 140,
          easing: easeOut,
          css: (/** @type {number} */ t) => `opacity: ${t}; transform: translateY(${(t - 1) * 8}px) scale(${0.98 + 0.02 * t})`,
        }
      : {
          duration: 220,
          easing: easeOut,
          css: (/** @type {number} */ t) => `opacity: ${t}; transform: translateY(${(1 - t) * 12}px)`,
        };
  }

  /** @param {Element} _no @param {{ ordem: number }} opcoes */
  function celebrar(_no, { ordem }) {
    const atraso = ordem * 50;
    if (reduzirMovimento()) return { delay: atraso, duration: 200, css: (/** @type {number} */ t) => `opacity: ${t}` };
    return {
      delay: atraso,
      duration: 360,
      easing: easeOut,
      css: (/** @type {number} */ t) => `opacity: ${t}; transform: translateY(${(1 - t) * 10}px)`,
    };
  }
</script>

<svelte:window onkeydown={teclado} />

<div class="flex min-h-dvh flex-col">
  <header class="mx-auto flex h-14 w-full max-w-3xl items-center gap-3 px-3 sm:px-6">
    <a href="/baralhos/{data.baralho.id}" class="btn btn-fantasma btn-icone" aria-label="Sair do estudo">
      <XIcon size={20} />
    </a>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium">{data.baralho.title}</p>
      {#if data.livre}<p class="text-xs text-texto-3">Treino livre, sem mudar as datas</p>{/if}
    </div>
    {#if fila.length > 0 && !concluido}
      <span class="font-mono text-sm text-texto-2 numeros" aria-label="Cartão {indice + 1} de {fila.length}">
        {indice + 1}/{fila.length}
      </span>
    {/if}
  </header>
  <div class="mx-auto h-0.5 w-full max-w-3xl px-3 sm:px-6" aria-hidden="true">
    <div class="h-full overflow-hidden rounded-full bg-borda">
      <div class="progresso h-full origin-left rounded-full bg-texto" style="transform: scaleX({progresso})"></div>
    </div>
  </div>

  <main class="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pt-10">
    {#if fila.length === 0}
      <div class="m-auto max-w-md py-10 text-center">
        <div class="mx-auto grid size-12 place-items-center rounded-full bg-sucesso-suave text-sucesso">
          <CheckIcon size={22} weight="bold" />
        </div>
        {#if data.total === 0}
          <h1 class="mt-5 text-2xl font-semibold">Este baralho ainda está vazio</h1>
          <p class="mt-2 text-texto-2">Adicione alguns cartões e volte para estudar.</p>
          <a href="/baralhos/{data.baralho.id}" class="btn btn-primario mt-8">Adicionar cartões</a>
        {:else}
          <h1 class="mt-5 text-2xl font-semibold">Tudo em dia</h1>
          <p class="mt-2 text-texto-2">
            Nenhum cartão para revisar agora.
            {#if data.proximaRevisao}O próximo volta {quandoVolta(data.proximaRevisao)}.{/if}
          </p>
          <div class="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            <a href="/baralhos/{data.baralho.id}" class="btn btn-secundario">Voltar ao baralho</a>
            <a href="?modo=livre" class="btn btn-primario">
              <ShuffleIcon size={16} /> Treino livre
            </a>
          </div>
        {/if}
      </div>
    {:else if concluido}
      <div class="m-auto w-full max-w-md py-10">
        <h1 class="text-3xl font-semibold" in:celebrar={{ ordem: 0 }}>
          {data.livre ? "Treino concluído" : "Sessão concluída"}
        </h1>
        <p class="mt-2 text-texto-2" in:celebrar={{ ordem: 1 }}>
          {revisados === 1 ? "1 cartão revisado" : `${revisados} cartões revisados`} em {data.baralho.title}.
          {data.livre ? "As datas de revisão não mudaram." : ""}
        </p>
        <dl class="mt-8 grid grid-cols-4 gap-2">
          {#each RESPOSTAS as resposta, i (resposta.qualidade)}
            <div class="rounded-[12px] bg-superficie-2 px-3 py-3" in:celebrar={{ ordem: 2 + i }}>
              <dt class="flex items-center gap-1.5 text-xs text-texto-2">
                <span class="size-1.5 rounded-full" style="background: {resposta.cor}"></span>
                {resposta.rotulo}
              </dt>
              <dd class="mt-1 font-mono text-2xl font-medium numeros">{contagem[resposta.qualidade]}</dd>
            </div>
          {/each}
        </dl>
        <div class="mt-8 flex flex-col gap-2 sm:flex-row" in:celebrar={{ ordem: 6 }}>
          <a href="/baralhos/{data.baralho.id}" class="btn btn-primario flex-1">Voltar ao baralho</a>
          <a href="?modo=livre" class="btn btn-secundario flex-1">
            <ArrowCounterClockwiseIcon size={16} /> Treinar de novo
          </a>
        </div>
      </div>
    {:else if atual}
      <div class="grid flex-1 content-center">
        <!-- Lista de um item só: a ficha que sai guarda o próprio estado durante a animação. -->
        {#each [atual] as cartao (cartao.id)}
          <div class="[grid-area:1/1]" in:trocar out:trocar={{ saida: true }}>
            <Flashcard
              frente={cartao.front}
              verso={cartao.back}
              imagemFrente={cartao.image_url}
              imagemVerso={cartao.image_back_url}
              instantaneo={viaTeclado}
              bind:revelado={
                () => reveladoId === cartao.id,
                (valor) => {
                  viaTeclado = false;
                  reveladoId = valor ? cartao.id : null;
                }
              }
            />
          </div>
        {/each}
      </div>

      <div class="mt-6 min-h-[4.5rem] sm:mt-8">
        {#if !revelado}
          <button type="button" class="btn btn-primario btn-lg h-14 w-full text-base" onclick={() => revelar(false)}>
            Mostrar resposta
            <kbd class="tecla ml-1 hidden border-current/30 text-current/70 [@media(hover:hover)]:inline-grid">Espaço</kbd>
          </button>
        {:else}
          <div class="grid grid-cols-4 gap-2" role="group" aria-label="Como foi?">
            {#each RESPOSTAS as resposta, i (resposta.qualidade)}
              <button
                type="button"
                class="resposta"
                style="--cor: {resposta.cor}"
                onclick={() => responder(resposta.qualidade, false)}
              >
                <span class="text-[0.9375rem] font-semibold">{resposta.rotulo}</span>
                {#if !data.livre}
                  <span class="text-xs text-texto-3 numeros">{intervalos[i]}</span>
                {/if}
                <kbd class="tecla absolute right-1.5 top-1.5 hidden [@media(hover:hover)]:inline-grid">{resposta.tecla}</kbd>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </main>
</div>

<style>
  .progresso {
    transition: transform 300ms var(--ease-out);
  }

  .resposta {
    position: relative;
    display: flex;
    height: 4.5rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.125rem;
    border-radius: var(--radius-controle);
    border: 1px solid var(--borda-forte);
    border-bottom: 3px solid var(--cor);
    background: var(--superficie);
    box-shadow: var(--sombra-1);
    transition:
      transform 160ms var(--ease-out),
      background-color 150ms ease;
  }
  .resposta:active {
    transform: scale(0.97);
  }
  @media (hover: hover) {
    .resposta:hover {
      background: color-mix(in oklch, var(--cor) 9%, var(--superficie));
    }
  }
</style>
