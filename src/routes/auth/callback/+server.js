import { redirect } from "@sveltejs/kit";
import { caminhoSeguro } from "#lib/server/redirecionar.js";

/**
 * Destino do login com Google e do link de confirmação de email (fluxo PKCE).
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ url, locals }) {
  const codigo = url.searchParams.get("code");
  const cadastro = url.searchParams.get("tipo") === "cadastro";

  if (codigo) {
    const { error } = await locals.supabase.auth.exchangeCodeForSession(codigo);
    if (!error) redirect(303, caminhoSeguro(url.searchParams.get("next")));
  }

  // Confirmação aberta em outro navegador: o email já foi confirmado pelo
  // Supabase, só não dá para criar a sessão aqui. Basta entrar com a senha.
  if (cadastro) redirect(303, "/login?aviso=confirmado");
  redirect(303, codigo ? "/login?aviso=erro-google" : "/login?aviso=link-invalido");
}
