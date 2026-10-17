<script>
  import { enhance } from "$app/forms";
  import EyeIcon from "phosphor-svelte/lib/EyeIcon";
  import EyeSlashIcon from "phosphor-svelte/lib/EyeSlashIcon";
  import CircleNotchIcon from "phosphor-svelte/lib/CircleNotchIcon";
  import EnvelopeSimpleIcon from "phosphor-svelte/lib/EnvelopeSimpleIcon";
  import Flashcard from "#lib/components/Flashcard.svelte";

  let { data, form } = $props();

  // svelte-ignore state_referenced_locally
  let modo = $state(form?.modo === "cadastrar" ? "cadastrar" : "entrar");
  let mostrarSenha = $state(false);
  let carregando = $state(false);
  let indoParaGoogle = $state(false);
  let demoRevelada = $state(false);

  const enviado = $derived(form?.modo === "cadastrar" && "enviado" in form && form.enviado);
  const erro = $derived(form && "erro" in form ? form.erro : null);
</script>

<svelte:head>
  <title>Entrar · Reviz</title>
</svelte:head>

<main class="grid min-h-dvh lg:grid-cols-[1.08fr_1fr]">
  <section class="relative hidden flex-col justify-between overflow-hidden border-r border-borda bg-fundo px-12 py-10 lg:flex xl:px-16">
    <a href="/login" class="flex items-center gap-2.5">
      <img src="/icon-site.svg" alt="" class="size-7" />
      <span class="font-display text-xl font-semibold tracking-tight">Reviz</span>
    </a>

    <div class="entrada-suave max-w-xl">
      <h1 class="max-w-[17ch] text-[2.75rem] font-semibold leading-[1.05] xl:text-[3.25rem]">
        Estude o que está prestes a esquecer.
      </h1>
      <p class="mt-5 max-w-[42ch] text-lg leading-relaxed text-texto-2">
        Flashcards com repetição espaçada. Você responde, o Reviz decide quando cada cartão volta.
      </p>
    </div>

    <div class="entrada-suave atraso-1 relative max-w-md pb-6">
      <div class="pilha" aria-hidden="true"></div>
      <div class="relative -rotate-[1.5deg]">
        <Flashcard
          compacto
          bind:revelado={demoRevelada}
          frente="Por que revisar em intervalos cada vez maiores?"
          verso="Cada revisão perto do esquecimento fortalece a memória. O intervalo cresce a cada acerto."
        />
      </div>
      <p class="mt-5 text-sm text-texto-3">
        {demoRevelada ? "Toque de novo para voltar à pergunta." : "Toque na ficha para ver a resposta."}
      </p>
    </div>
  </section>

  <section class="flex flex-col justify-center px-4 py-10 sm:px-8 lg:bg-superficie">
    <div class="entrada-suave mx-auto w-full max-w-sm">
      <a href="/login" class="mb-10 flex items-center gap-2.5 lg:hidden">
        <img src="/icon-site.svg" alt="" class="size-7" />
        <span class="font-display text-xl font-semibold tracking-tight">Reviz</span>
      </a>

      {#if enviado}
        <div class="grid size-11 place-items-center rounded-full bg-acento-suave text-acento-texto">
          <EnvelopeSimpleIcon size={22} />
        </div>
        <h2 class="mt-5 text-2xl font-semibold">Confira seu email</h2>
        <p class="mt-2 text-texto-2">
          Enviamos um link de confirmação para <strong class="font-medium text-texto">{form?.email}</strong>.
          Depois de confirmar, é só voltar e entrar.
        </p>
        <p class="ajuda mt-4">Não chegou? Procure na caixa de spam.</p>
        <a href="/login" class="btn btn-secundario mt-8 w-full">Voltar para entrar</a>
      {:else}
        <h2 class="text-2xl font-semibold">{modo === "entrar" ? "Entrar no Reviz" : "Criar sua conta"}</h2>
        <p class="mt-1.5 text-texto-2">
          {modo === "entrar" ? "Seus baralhos continuam onde você parou." : "Leva menos de um minuto."}
        </p>

        {#if data.aviso}
          <p
            class="mt-6 rounded-[10px] px-3.5 py-3 text-sm {data.aviso.tipo === 'sucesso'
              ? 'bg-sucesso-suave text-texto'
              : 'bg-acento-suave text-acento-texto'}"
            role="status"
          >
            {data.aviso.texto}
          </p>
        {/if}

        <form method="POST" action="?/google" class="mt-7" onsubmit={() => (indoParaGoogle = true)}>
          <input type="hidden" name="next" value={data.next} />
          <button type="submit" class="btn btn-primario btn-lg w-full" disabled={indoParaGoogle}>
            {#if indoParaGoogle}
              <CircleNotchIcon size={18} class="girar" />
            {:else}
              <!-- Marca oficial do Google (exigida pelas diretrizes de login). -->
              <svg viewBox="0 0 48 48" class="size-[18px]" aria-hidden="true">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
            {/if}
            Continuar com Google
          </button>
        </form>

        <div class="my-6 flex items-center gap-3 text-xs text-texto-3">
          <span class="h-px flex-1 bg-borda"></span>
          ou com email
          <span class="h-px flex-1 bg-borda"></span>
        </div>

        <form
          method="POST"
          action={modo === "entrar" ? "?/entrar" : "?/cadastrar"}
          class="flex flex-col gap-4"
          use:enhance={() => {
            carregando = true;
            return async ({ update }) => {
              await update({ reset: false });
              carregando = false;
            };
          }}
        >
          <input type="hidden" name="next" value={data.next} />

          <div class="flex flex-col gap-2">
            <label class="rotulo" for="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="entrada"
              value={form?.email ?? ""}
              aria-invalid={erro ? "true" : undefined}
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="rotulo" for="senha">Senha</label>
            <div class="relative">
              <input
                id="senha"
                name="senha"
                type={mostrarSenha ? "text" : "password"}
                autocomplete={modo === "entrar" ? "current-password" : "new-password"}
                minlength={modo === "cadastrar" ? 6 : undefined}
                required
                class="entrada pr-11"
                aria-invalid={erro ? "true" : undefined}
                aria-describedby={modo === "cadastrar" ? "ajuda-senha" : undefined}
              />
              <button
                type="button"
                class="btn btn-fantasma btn-icone btn-sm absolute right-1.5 top-1/2 -translate-y-1/2"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                onclick={() => (mostrarSenha = !mostrarSenha)}
              >
                {#if mostrarSenha}<EyeSlashIcon size={18} />{:else}<EyeIcon size={18} />{/if}
              </button>
            </div>
            {#if modo === "cadastrar"}
              <p id="ajuda-senha" class="ajuda">Pelo menos 6 caracteres. Vamos pedir para você confirmar o email.</p>
            {/if}
          </div>

          {#if erro}
            <p class="erro-campo" role="alert">{erro}</p>
          {/if}

          <button type="submit" class="btn btn-secundario btn-lg mt-1 w-full" disabled={carregando}>
            {#if carregando}<CircleNotchIcon size={18} class="girar" />{/if}
            {modo === "entrar" ? "Entrar com email" : "Criar conta"}
          </button>
        </form>

        <p class="mt-8 text-center text-sm text-texto-2">
          {modo === "entrar" ? "Ainda não tem conta?" : "Já tem conta?"}
          <button
            type="button"
            class="font-medium text-texto underline decoration-borda-forte underline-offset-4 transition-colors hover:decoration-texto"
            onclick={() => (modo = modo === "entrar" ? "cadastrar" : "entrar")}
          >
            {modo === "entrar" ? "Criar com email" : "Entrar"}
          </button>
        </p>
      {/if}
    </div>
  </section>
</main>

<style>
  /* Tela vista raramente: aqui cabe uma entrada mais suave. */
  .entrada-suave {
    animation: subir 520ms var(--ease-out) both;
  }
  .atraso-1 {
    animation-delay: 80ms;
  }
  @keyframes subir {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .entrada-suave {
      animation-name: aparecer;
      animation-duration: 200ms;
    }
    @keyframes aparecer {
      from {
        opacity: 0;
      }
    }
  }

  /* Uma ficha atrás da outra, sugerindo o baralho. */
  .pilha {
    position: absolute;
    inset: 0.75rem -0.75rem 2.5rem 1rem;
    rotate: 3deg;
    border-radius: var(--radius-superficie);
    background: var(--superficie-3);
    border: 1px solid var(--borda);
  }
</style>
