<script>
  import { page } from "$app/state";
  import ArrowLeftIcon from "phosphor-svelte/lib/ArrowLeftIcon";
</script>

<svelte:head>
  <title>{page.status === 404 ? "Não encontrado" : "Erro"} · Reviz</title>
</svelte:head>

<main class="mx-auto flex min-h-[80dvh] max-w-md flex-col justify-center px-4 py-16">
  <p class="font-mono text-sm text-texto-3 numeros">Erro {page.status}</p>
  <h1 class="mt-2 text-3xl font-semibold">
    {page.status === 404 ? "Essa página não existe." : "Algo deu errado."}
  </h1>
  <p class="mt-3 text-texto-2">
    {page.error?.message ?? "Tente de novo em alguns instantes."}
  </p>
  <a href="/" class="btn btn-secundario mt-8 self-start">
    <ArrowLeftIcon size={16} />
    Voltar ao início
  </a>
</main>
