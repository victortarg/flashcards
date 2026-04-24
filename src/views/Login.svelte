<script>
  import { supabase } from "../lib/supabaseClient";
  import {
    modoEscuro,
    visualizacaoAtual,
    usuario,
    buscarDados,
  } from "../stores.js";

  let email = "";
  let senha = "";
  let carregando = false;
  let modo = "login";
  let mensagem = "";
  let tipoMensagem = "";
  let mostrarSenha = false;

  const lidarComAuth = async () => {
    try {
      carregando = true;
      mensagem = "";
      tipoMensagem = "";

      if (modo === "cadastro") {
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: senha,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        if (data?.user && !data?.session) {
          mensagem =
            "Cadastro realizado com sucesso! Verifique seu email para confirmar.";
          tipoMensagem = "sucesso";
        } else {
          mensagem = "Cadastro realizado!";
          tipoMensagem = "sucesso";
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: senha,
        });

        if (error) throw error;
      }
    } catch (erro) {
      console.error("Erro detalhado do Supabase:", erro);
      mensagem = erro.message || "Erro desconhecido ao autenticar.";
      tipoMensagem = "erro";
    } finally {
      carregando = false;
    }
  };

  const lidarComGoogle = async () => {
    try {
      carregando = true;
      mensagem = "";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (erro) {
      mensagem = "Erro ao conectar com Google: " + erro.message;
      tipoMensagem = "erro";
      carregando = false;
    }
  };

  const alternarMostrarSenha = () => {
    mostrarSenha = !mostrarSenha;
  };
</script>

<div
  class="min-h-screen flex items-center justify-center p-4 transition-colors duration-300 {$modoEscuro
    ? 'bg-gray-900'
    : 'bg-gray-50'}"
>
  <div
    class="w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl transition-colors duration-300 {$modoEscuro
      ? 'bg-gray-800'
      : 'bg-white'}"
  >
    <div class="text-center mb-6 sm:mb-8">
      <h1
        class="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-2"
      >
        Reviz
      </h1>
      <p class="text-sm {$modoEscuro ? 'text-gray-400' : 'text-gray-500'}">
        Sistema de flashcards para um estudo mais dinâmico.
      </p>
    </div>

    <div class="space-y-4">
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

      <button
        on:click={lidarComGoogle}
        disabled={carregando}
        class="w-full py-3 px-4 rounded-lg font-medium border flex items-center justify-center gap-3 transition shadow-sm hover:shadow-md disabled:opacity-50 {$modoEscuro
          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width="20px"
          height="20px"
        >
          <path
            fill="#FFC107"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
          />
          <path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
          />
          <path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
          />
          <path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
          />
        </svg>
        Entrar com Google
      </button>

      <div class="relative py-2">
        <div class="absolute inset-0 flex items-center">
          <div
            class="w-full border-t {$modoEscuro
              ? 'border-gray-600'
              : 'border-gray-300'}"
          ></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span
            class="px-2 {$modoEscuro
              ? 'bg-gray-800 text-gray-400'
              : 'bg-white text-gray-500'}"
          >
            ou continue com email
          </span>
        </div>
      </div>

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
          class="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500 transition text-base
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
        <div class="relative">
          <input
            type={mostrarSenha ? "text" : "password"}
            bind:value={senha}
            placeholder="******"
            class="w-full p-3 pr-12 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500 transition text-base
            {$modoEscuro
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-gray-50 border-gray-300 text-gray-900'}"
            on:keydown={(e) => e.key === "Enter" && lidarComAuth()}
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 px-3 flex items-center transition-colors {$modoEscuro
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-500 hover:text-gray-700'}"
            on:click={alternarMostrarSenha}
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
          >
            {#if mostrarSenha}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  d="M10.79 12.912l-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"
                />
                <path
                  d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708l-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829z"
                />
                <path
                  fill-rule="evenodd"
                  d="M13.646 14.354l-12-12 .708-.708 12 12-.708.708z"
                />
              </svg>
            {:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                <path
                  d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
                />
              </svg>
            {/if}
          </button>
        </div>
      </div>

      <button
        on:click={lidarComAuth}
        disabled={carregando}
        class="w-full py-3 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 flex justify-center items-center active:scale-95 transform duration-150 mt-2"
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
            ? "Não tem conta? Cadastre-se com email"
            : "Já tem conta? Faça login com email"}
        </button>
      </div>
    </div>
  </div>
</div>
