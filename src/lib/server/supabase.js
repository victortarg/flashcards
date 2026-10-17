import { createServerClient } from "@supabase/ssr";
import { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } from "$app/env/private";

/**
 * Cria um cliente Supabase por requisição, lendo e gravando a sessão nos
 * cookies. Como não existe cliente no navegador, os cookies podem ser httpOnly.
 * @param {import('@sveltejs/kit').RequestEvent} event
 */
export function criarClienteSupabase(event) {
  if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
    throw new Error(
      "Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env (ou nas variáveis da Vercel).",
    );
  }

  return createServerClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookies, cabecalhos) => {
        for (const { name, value, options } of cookies) {
          event.cookies.set(name, value, {
            ...options,
            path: "/",
            httpOnly: true,
          });
        }
        // Impede que a Vercel guarde em cache respostas que renovaram a sessão.
        try {
          if (cabecalhos) event.setHeaders(cabecalhos);
        } catch {
          // setHeaders falha se o cabeçalho já foi definido nesta requisição.
        }
      },
    },
  });
}

/**
 * Lê o usuário a partir do JWT validado (getClaims verifica a assinatura).
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<App.Usuario | null>}
 */
export async function buscarUsuario(supabase) {
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;

  const { claims } = data;
  const meta = claims.user_metadata ?? {};

  return {
    id: claims.sub,
    email: claims.email ?? "",
    nome: meta.full_name ?? meta.name ?? "",
    avatar: meta.avatar_url ?? meta.picture ?? null,
  };
}
