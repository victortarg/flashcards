<script>
  import ArrowsOutSimpleIcon from "phosphor-svelte/lib/ArrowsOutSimpleIcon";
  import Dialogo from "./Dialogo.svelte";

  /**
   * Ficha com frente (pergunta) e verso (resposta). O giro é a única animação
   * longa do estudo; quando vem do teclado ela é instantânea, porque quem
   * estuda pelo teclado repete isso centenas de vezes.
   * @type {{
   *   frente?: string | null,
   *   verso?: string | null,
   *   imagemFrente?: string | null,
   *   imagemVerso?: string | null,
   *   revelado?: boolean,
   *   instantaneo?: boolean,
   *   interativo?: boolean,
   *   compacto?: boolean,
   * }}
   */
  let {
    frente = "",
    verso = "",
    imagemFrente = null,
    imagemVerso = null,
    revelado = $bindable(false),
    instantaneo = false,
    interativo = true,
    compacto = false,
  } = $props();

  /** @type {string | null} */
  let imagemAmpliada = $state(null);
  let zoomAberto = $state(false);

  /** Texto curto fica grande; texto longo encolhe e troca para a fonte de leitura. */
  function estiloTexto(/** @type {string | null | undefined} */ texto, temImagem = false) {
    const tamanho = texto?.length ?? 0;
    if (compacto) return "font-display text-lg leading-snug";
    if (tamanho <= 48 && !temImagem) return "font-display text-[1.75rem] leading-[1.15] sm:text-[2.125rem]";
    if (tamanho <= 140) return "font-display text-xl leading-snug sm:text-2xl";
    return "text-base leading-relaxed sm:text-lg";
  }

  function ampliar(/** @type {MouseEvent} */ evento, /** @type {string} */ url) {
    evento.stopPropagation();
    imagemAmpliada = url;
    zoomAberto = true;
  }
</script>

{#snippet face(/** @type {'frente' | 'verso'} */ lado, /** @type {string | null | undefined} */ texto, /** @type {string | null | undefined} */ imagem)}
  <div
    class="face {lado}"
    aria-hidden={lado === "frente" ? revelado : !revelado}
    inert={lado === "frente" ? revelado : !revelado}
  >
    <div class="cabecalho-face">
      <span>{lado === "frente" ? "Pergunta" : "Resposta"}</span>
    </div>
    <div class="miolo-face {compacto ? 'px-5 pb-5' : 'px-6 pb-8 sm:px-10'}">
      {#if imagem}
        <div class="relative mb-4 inline-block max-w-full">
          <img
            src={imagem}
            alt={lado === "frente" ? "Imagem da pergunta" : "Imagem da resposta"}
            class="max-h-40 w-auto max-w-full rounded-[10px] border border-borda object-contain sm:max-h-52 {compacto ? 'max-h-24 sm:max-h-24' : ''}"
            loading="lazy"
            decoding="async"
          />
          {#if !compacto}
            <button
              type="button"
              class="btn btn-secundario btn-icone btn-sm absolute bottom-2 right-2"
              aria-label="Ampliar imagem"
              onclick={(evento) => ampliar(evento, imagem)}
            >
              <ArrowsOutSimpleIcon size={16} />
            </button>
          {/if}
        </div>
      {/if}
      {#if texto}
        <p class="{estiloTexto(texto, Boolean(imagem))} whitespace-pre-line text-balance break-words">
          {texto}
        </p>
      {/if}
    </div>
  </div>
{/snippet}

<!-- O clique na ficha é um atalho; o caminho acessível é o botão "Mostrar resposta". -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  class="cena"
  class:interativa={interativo}
  data-revelado={revelado}
  data-instantaneo={instantaneo}
  onclick={() => {
    if (interativo) revelado = !revelado;
  }}
>
  <div class="giro {compacto ? 'min-h-48' : 'min-h-[min(22rem,58dvh)] sm:min-h-[22rem]'}">
    {@render face("frente", frente, imagemFrente)}
    {@render face("verso", verso, imagemVerso)}
  </div>
</div>

<Dialogo bind:aberto={zoomAberto} titulo="Imagem" largura="livre">
  {#if imagemAmpliada}
    <img src={imagemAmpliada} alt="Imagem ampliada" class="max-h-[75dvh] w-auto max-w-full rounded-[10px]" />
  {/if}
</Dialogo>

<style>
  .cena {
    perspective: 1600px;
    -webkit-tap-highlight-color: transparent;
  }
  .cena.interativa {
    cursor: pointer;
  }
  .cena.interativa:active .giro {
    scale: 0.99;
  }

  .giro {
    display: grid;
    transform-style: preserve-3d;
    transition:
      transform 300ms var(--ease-in-out),
      scale 160ms var(--ease-out);
  }
  .cena[data-revelado="true"] .giro {
    transform: rotateY(180deg);
  }
  .cena[data-instantaneo="true"] .giro {
    transition: scale 160ms var(--ease-out);
  }

  .face {
    grid-area: 1 / 1;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    overflow: hidden;
    border-radius: var(--radius-superficie);
    background: var(--superficie);
    border: 1px solid var(--borda);
    box-shadow: var(--sombra-2);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  .verso {
    transform: rotateY(180deg);
  }

  /* A linha vermelha de margem da ficha pautada, só no verso (o lado da resposta). */
  .cabecalho-face {
    display: flex;
    align-items: center;
    height: 2.75rem;
    padding-inline: 1.25rem;
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.06em;
    color: var(--texto-3);
  }
  .verso .cabecalho-face {
    border-bottom: 2px solid var(--acento);
    color: var(--acento-texto);
  }

  .miolo-face {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    overflow-y: auto;
    padding-top: 1rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .giro,
    .cena[data-revelado="true"] .giro {
      transform: none;
    }
    .verso {
      transform: none;
    }
    .face {
      transition: opacity 150ms ease;
    }
    .cena[data-revelado="true"] .frente,
    .cena[data-revelado="false"] .verso {
      opacity: 0;
    }
  }
</style>
