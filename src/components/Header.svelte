<script>
  import { currentView, isDarkMode, navigateTo } from "../stores.js";

  const toggleTheme = () => {
    isDarkMode.update((n) => !n);
  };
</script>

<header
  class="shadow-sm sticky top-0 z-20 border-b transition-colors duration-300 {$isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-100'}"
>
  <div class="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <h1
        class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 cursor-pointer select-none"
        on:click={() => navigateTo("home")}
      >
        FlashCards
      </h1>

      <!-- Botão Toggle Dark Mode -->
      <button
        on:click={toggleTheme}
        class="p-2 rounded-full transition-colors {$isDarkMode
          ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
      >
        {#if $isDarkMode}
          <!-- Sol -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        {:else}
          <!-- Lua -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        {/if}
      </button>
    </div>

    {#if $currentView !== "home"}
      <button
        on:click={() => navigateTo("home")}
        class="text-sm font-medium transition flex items-center gap-1 group {$isDarkMode
          ? 'text-gray-400 hover:text-indigo-400'
          : 'text-gray-500 hover:text-indigo-600'}"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 transition {$isDarkMode
            ? 'text-gray-500 group-hover:text-indigo-400'
            : 'text-gray-400 group-hover:text-indigo-600'}"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        Fechar
      </button>
    {/if}
  </div>
</header>
