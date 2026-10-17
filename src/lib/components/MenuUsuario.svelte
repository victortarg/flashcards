<script>
  import CheckIcon from "phosphor-svelte/lib/CheckIcon";
  import DesktopIcon from "phosphor-svelte/lib/DesktopIcon";
  import MoonIcon from "phosphor-svelte/lib/MoonIcon";
  import SignOutIcon from "phosphor-svelte/lib/SignOutIcon";
  import SunIcon from "phosphor-svelte/lib/SunIcon";
  import Menu from "./Menu.svelte";
  import { aplicarTema } from "#lib/tema.js";

  /** @type {{ usuario: App.Usuario, tema: App.Tema }} */
  let { usuario, tema } = $props();

  // svelte-ignore state_referenced_locally
  let temaAtual = $state(tema);
  let imagemFalhou = $state(false);

  const nomeExibido = $derived(usuario.nome || usuario.email.split("@")[0]);
  const inicial = $derived(nomeExibido.trim().charAt(0).toUpperCase() || "?");

  const TEMAS = /** @type {const} */ ([
    { valor: "sistema", rotulo: "Tema do sistema", icone: DesktopIcon },
    { valor: "claro", rotulo: "Claro", icone: SunIcon },
    { valor: "escuro", rotulo: "Escuro", icone: MoonIcon },
  ]);

  /** @param {App.Tema} valor */
  function escolherTema(valor) {
    temaAtual = valor;
    aplicarTema(valor);
  }
</script>

<Menu rotulo="Conta e preferências" classeGatilho="btn btn-fantasma h-9 gap-2 rounded-full pl-1 pr-1 sm:pr-3">
  {#snippet gatilho()}
    {#if usuario.avatar && !imagemFalhou}
      <img
        src={usuario.avatar}
        alt=""
        referrerpolicy="no-referrer"
        class="size-7 rounded-full object-cover"
        onerror={() => (imagemFalhou = true)}
      />
    {:else}
      <span class="grid size-7 place-items-center rounded-full bg-acento-suave text-xs font-semibold text-acento-texto">
        {inicial}
      </span>
    {/if}
    <span class="hidden max-w-32 truncate text-sm text-texto sm:inline">{nomeExibido}</span>
  {/snippet}

  <div class="px-2.5 pb-2 pt-1.5">
    <p class="truncate text-sm font-medium">{nomeExibido}</p>
    <p class="truncate text-xs text-texto-3">{usuario.email}</p>
  </div>
  <div class="menu-separador"></div>
  {#each TEMAS as opcao (opcao.valor)}
    <button
      type="button"
      role="menuitemradio"
      aria-checked={temaAtual === opcao.valor}
      class="menu-item"
      onclick={() => escolherTema(opcao.valor)}
    >
      <opcao.icone size={16} />
      <span class="flex-1">{opcao.rotulo}</span>
      {#if temaAtual === opcao.valor}<CheckIcon size={14} weight="bold" />{/if}
    </button>
  {/each}
  <div class="menu-separador"></div>
  <form method="POST" action="/sair">
    <button type="submit" role="menuitem" class="menu-item">
      <SignOutIcon size={16} />
      Sair
    </button>
  </form>
</Menu>
