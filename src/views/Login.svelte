<script>
  import { supabase } from "../lib/supabaseClient";
  import { modoEscuro } from "../stores.js";

  let email = "";
  let senha = "";
  let carregando = false;
  let modo = "login"; // 'login' ou 'cadastro'
  let mensagem = "";

  const lidarComAuth = async () => {
    try {
      carregando = true;
      mensagem = "";

      if (modo === "cadastro") {
        const { error } = await supabase.auth.signUp({
          email: email,
          password: senha,
        });
        if (error) throw error;
        mensagem = "Cadastro realizado! Verifique seu email para confirmar.";
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: senha,
        });
        if (error) throw error;
        // O redirecionamento é automático via stores.js
      }
    } catch (erro) {
      mensagem = erro.error_description || erro.message;
    } finally {
      carregando = false;
    }
  };
</script>

<div
  class="min-h-screen flex items-center justify-center p-4 transition-colors duration-300 {$modoEscuro
    ? 'bg-gray-900'
    : 'bg-gray-50'}"
>
  <div
    class="w-full max-w-md p-8 rounded-2xl shadow-xl transition-colors duration-300 {$modoEscuro
      ? 'bg-gray-800'
      : 'bg-white'}"
  >
    <div class="text-center mb-8">
      <h1
        class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-2"
      >
        FlashMind
      </h1>
      <p class="text-sm {$modoEscuro ? 'text-gray-400' : 'text-gray-500'}">
        Seus estudos em qualquer lugar.
      </p>
    </div>

    <div class="space-y-4">
      {#if mensagem}
        <div
          class="p-3 rounded-lg text-sm text-center {mensagem.includes(
            'Verifique'
          )
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'}"
        >
          {mensagem}
        </div>
      {/if}

      <div>
        <label
          class="block text-sm font-medium mb-1 {$modoEscuro
            ? 'text-gray-300'
            : 'text-gray-700'}">Email</label
        >
        <input
          type="email"
          bind:value={email}
          placeholder="seu@email.com"
          class="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500 transition
          {$modoEscuro
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-gray-50 border-gray-300 text-gray-900'}"
        />
      </div>

      <div>
        <label
          class="block text-sm font-medium mb-1 {$modoEscuro
            ? 'text-gray-300'
            : 'text-gray-700'}">Senha</label
        >
        <input
          type="password"
          bind:value={senha}
          placeholder="******"
          class="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500 transition
          {$modoEscuro
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-gray-50 border-gray-300 text-gray-900'}"
          on:keydown={(e) => e.key === "Enter" && lidarComAuth()}
        />
      </div>

      <button
        on:click={lidarComAuth}
        disabled={carregando}
        class="w-full py-3 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 flex justify-center"
      >
        {#if carregando}
          ...
        {:else}
          {modo === "login" ? "Entrar" : "Cadastrar"}
        {/if}
      </button>

      <div class="text-center mt-4">
        <button
          on:click={() => {
            modo = modo === "login" ? "cadastro" : "login";
            mensagem = "";
          }}
          class="text-sm font-medium hover:underline {$modoEscuro
            ? 'text-indigo-400'
            : 'text-indigo-600'}"
        >
          {modo === "login"
            ? "Não tem conta? Cadastre-se"
            : "Já tem conta? Faça login"}
        </button>
      </div>
    </div>
  </div>
</div>
