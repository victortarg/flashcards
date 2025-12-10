import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // Verifique se o nome bate com o .env

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltam as variáveis de ambiente do Supabase no arquivo .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
