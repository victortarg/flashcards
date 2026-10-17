import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      adapter: adapter(),
    }),
  ],
  // O leitor de XML só é carregado quando alguém abre a importação; declarar
  // aqui evita que o Vite recarregue a página em dev ao descobri-lo.
  optimizeDeps: {
    include: ["fast-xml-parser"],
  },
});
