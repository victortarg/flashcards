import { redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { buscarUsuario, criarClienteSupabase } from "#lib/server/supabase.js";
import { caminhoSeguro } from "#lib/server/redirecionar.js";

/** @type {import('@sveltejs/kit/hooks').Handle} */
const supabase = async ({ event, resolve }) => {
  event.locals.supabase = criarClienteSupabase(event);
  event.locals.usuario = await buscarUsuario(event.locals.supabase);
  return resolve(event);
};

/**
 * O tema fica num cookie para o HTML já sair do servidor com as cores certas,
 * sem o "piscar" de tema claro antes do JavaScript carregar.
 * @type {import('@sveltejs/kit/hooks').Handle}
 */
const tema = async ({ event, resolve }) => {
  const salvo = event.cookies.get("reviz-tema");
  event.locals.tema = salvo === "claro" || salvo === "escuro" ? salvo : "sistema";

  const atributo =
    event.locals.tema === "sistema" ? "" : `data-tema="${event.locals.tema}"`;

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace("%reviz.tema%", atributo),
  });
};

/** @type {import('@sveltejs/kit/hooks').Handle} */
const guarda = async ({ event, resolve }) => {
  const { pathname, search, searchParams } = event.url;

  // Links antigos de compartilhamento eram /?share=<id>.
  const compartilhado = searchParams.get("share");
  if (pathname === "/" && compartilhado) {
    redirect(303, `/compartilhado/${encodeURIComponent(compartilhado)}`);
  }

  // Se /auth/callback não estiver na lista de redirects do Supabase, ele
  // devolve o código para a Site URL (/). Repassamos para o callback.
  if (pathname === "/" && searchParams.has("code")) {
    redirect(303, `/auth/callback${search}`);
  }

  // Arquivos que o navegador pede sozinho não devem cair no login.
  if (pathname === "/favicon.ico" || pathname === "/robots.txt") {
    return new Response(null, { status: 404 });
  }

  const publica = pathname === "/login" || pathname.startsWith("/auth/");

  if (!event.locals.usuario && !publica) {
    redirect(303, `/login?next=${encodeURIComponent(pathname + search)}`);
  }

  if (event.locals.usuario && pathname === "/login") {
    redirect(303, caminhoSeguro(searchParams.get("next")));
  }

  return resolve(event);
};

export const handle = sequence(supabase, tema, guarda);
