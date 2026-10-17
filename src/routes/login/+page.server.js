import { fail, redirect } from "@sveltejs/kit";
import { caminhoSeguro } from "#lib/server/redirecionar.js";

const AVISOS = {
  confirmado: { tipo: "sucesso", texto: "Email confirmado. Agora é só entrar com sua senha." },
  "erro-google": { tipo: "erro", texto: "Não foi possível entrar com o Google. Tente de novo." },
  "link-invalido": { tipo: "erro", texto: "Esse link expirou ou já foi usado. Entre de novo." },
};

/** @type {import('./$types').PageServerLoad} */
export function load({ url }) {
  const aviso = url.searchParams.get("aviso");
  return {
    next: caminhoSeguro(url.searchParams.get("next")),
    aviso: aviso && aviso in AVISOS ? AVISOS[/** @type {keyof typeof AVISOS} */ (aviso)] : null,
  };
}

/** @param {{ code?: string, message: string }} erro */
function traduzirErro(erro) {
  switch (erro.code) {
    case "invalid_credentials":
      return "Email ou senha incorretos.";
    case "email_not_confirmed":
      return "Confirme seu email antes de entrar. O link está na sua caixa de entrada (ou no spam).";
    case "user_already_exists":
    case "email_exists":
      return "Já existe uma conta com esse email. Tente entrar.";
    case "weak_password":
      return "Senha fraca. Use pelo menos 6 caracteres.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Muitas tentativas seguidas. Espere um minuto e tente de novo.";
    case "validation_failed":
      return "Confira o email digitado.";
    default:
      return erro.message || "Não foi possível autenticar.";
  }
}

/** @param {FormData} dados */
function lerCredenciais(dados) {
  return {
    email: String(dados.get("email") ?? "").trim().toLowerCase(),
    senha: String(dados.get("senha") ?? ""),
    next: caminhoSeguro(String(dados.get("next") ?? "/")),
  };
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
  entrar: async ({ request, locals }) => {
    const { email, senha, next } = lerCredenciais(await request.formData());
    if (!email || !senha) return fail(400, { modo: "entrar", email, erro: "Preencha email e senha." });

    const { error } = await locals.supabase.auth.signInWithPassword({ email, password: senha });
    if (error) return fail(400, { modo: "entrar", email, erro: traduzirErro(error) });

    redirect(303, next);
  },

  cadastrar: async ({ request, locals, url }) => {
    const { email, senha, next } = lerCredenciais(await request.formData());
    if (!email || !senha) return fail(400, { modo: "cadastrar", email, erro: "Preencha email e senha." });
    if (senha.length < 6) {
      return fail(400, { modo: "cadastrar", email, erro: "A senha precisa ter pelo menos 6 caracteres." });
    }

    const { data, error } = await locals.supabase.auth.signUp({
      email,
      password: senha,
      options: { emailRedirectTo: `${url.origin}/auth/callback?tipo=cadastro` },
    });
    if (error) return fail(400, { modo: "cadastrar", email, erro: traduzirErro(error) });

    // Projetos sem confirmação de email já devolvem a sessão.
    if (data.session) redirect(303, next);
    return { modo: "cadastrar", enviado: true, email };
  },

  google: async ({ request, locals, url }) => {
    const { next } = lerCredenciais(await request.formData());
    const { data, error } = await locals.supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error || !data.url) return fail(400, { modo: "entrar", erro: "Não foi possível falar com o Google." });

    redirect(303, data.url, { external: true });
  },
};
