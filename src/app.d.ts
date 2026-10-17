import type { SupabaseClient } from "@supabase/supabase-js";

declare global {
  namespace App {
    interface Usuario {
      id: string;
      email: string;
      nome: string;
      avatar: string | null;
    }

    type Tema = "claro" | "escuro" | "sistema";

    interface Locals {
      supabase: SupabaseClient;
      usuario: Usuario | null;
      tema: Tema;
    }

    interface PageData {
      usuario: Usuario | null;
      tema: Tema;
    }
  }
}

export {};
