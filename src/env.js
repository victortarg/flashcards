import { defineEnvVars } from "@sveltejs/kit/env";

/**
 * Remove espaços e aspas que às vezes vêm coladas no valor do .env.
 * @param {string | undefined} valor
 */
const limpar = (valor) => valor?.trim().replace(/['"]/g, "") || undefined;

// Os nomes continuam com prefixo VITE_ para não precisar mexer nas variáveis
// já cadastradas na Vercel. Mesmo assim, ficam só no servidor ($app/env/private).
export const variables = defineEnvVars({
  VITE_SUPABASE_URL: {
    schema: limpar,
    description: "URL do projeto Supabase",
  },
  VITE_SUPABASE_ANON_KEY: {
    schema: limpar,
    description: "Chave anon (pública) do Supabase",
  },
});
