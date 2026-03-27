import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim().replace(
  /['"]/g,
  "",
);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim().replace(
  /['"]/g,
  "",
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "ERRO FATAL: O ficheiro .env não contém a URL ou a Chave Anon.",
  );
  alert("Erro de configuração do Supabase. Verifique a consola.");
}

// Cria o cliente com as credenciais devidamente limpas
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
