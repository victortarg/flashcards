<script>
  import { supabase } from "../lib/supabaseClient";
  import { modoEscuro } from "../stores.js";

  let email = "";
  let senha = "";
  let carregando = false;
  let modo = "login"; // 'login' ou 'cadastro'
  let mensagem = "";
  let tipoMensagem = ""; // 'sucesso' ou 'erro'

  const lidarComAuth = async () => {
    try {
      carregando = true;
      mensagem = "";
      tipoMensagem = "";

      if (modo === "cadastro") {
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: senha,
        });
        if (error) throw error;

        // Verifica se o login automático não ocorreu (significa que precisa confirmar email)
        if (data?.user && !data?.session) {
          mensagem =
            "Cadastro realizado com sucesso! Enviamos um link de confirmação para o seu email. Por favor, verifique sua caixa de entrada (e spam) antes de entrar.";
          tipoMensagem = "sucesso";
        } else {
          mensagem = "Cadastro realizado!";
          tipoMensagem = "sucesso";
        }
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
      tipoMensagem = "erro";
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
      <!-- Mensagens de Erro ou Sucesso -->
      {#if mensagem}
        <div
          class="p-4 rounded-lg text-sm text-center border {tipoMensagem ===
          'sucesso'
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-red-100 text-red-800 border-red-200'}"
        >
          {mensagem}
        </div>
      {/if}

      <!-- Aviso Prévio: Aparece apenas no modo Cadastro e se não houver outra mensagem -->
      {#if modo === "cadastro" && !mensagem}
        <div
          class="p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs text-center"
        >
          <span class="font-bold block mb-1">Nota Importante:</span>
          Para sua segurança, você precisará confirmar seu email clicando no link
          que enviaremos após o cadastro.
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
          <svg
            class="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
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
