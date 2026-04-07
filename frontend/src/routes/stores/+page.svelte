<script lang="ts">
  import { onMount } from "svelte";
  import {
    Store,
    ShoppingBag,
    FolderTree,
    Search,
    ArrowRight,
    Loader2,
    Sparkles,
  } from "lucide-svelte";
  import SearchBar from "$lib/components/SearchBar.svelte";
  import Header from "$lib/components/Header.svelte";
  import { apiFetch } from "$lib/api";
  import type { Store as StoreData } from "$shared/types";

  let stores = $state<StoreData[]>([]);
  let isLoading = $state(true);
  let searchQuery = $state("");

  let filteredStores = $derived(
    stores.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.slug.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  onMount(async () => {
    try {
      const res = await apiFetch("/api/storefront/stores");
      if (res.ok) {
        stores = await res.json();
      }
    } finally {
      isLoading = false;
    }
  });
</script>

<svelte:head>
  <title>Browse Stores - Prompt Commerce</title>
</svelte:head>

<Header />

<div class="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
  <main
    class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative"
  >
    <!-- Background Sparkles -->
    <div
      class="absolute top-10 right-10 text-blue-100 hidden lg:block animate-pulse"
    >
      <Sparkles size={120} />
    </div>

    <div class="mb-16 text-center relative z-10">
      <div
        class="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm"
      >
        <Store size={14} class="text-blue-600" />
        Official Registry
      </div>
      <h1
        class="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight"
      >
        Discover amazing stores
      </h1>
      <p
        class="text-gray-500 text-xl max-w-2xl mx-auto font-medium leading-relaxed"
      >
        Explore premium products curated by our registered independent
        retailers.
      </p>
    </div>

    <div class="max-w-xl mx-auto mb-16 relative z-10">
      <div
        class="bg-white p-2 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100"
      >
        <SearchBar
          bind:value={searchQuery}
          placeholder="Search stores by name or slug..."
        />
      </div>
    </div>

    {#if isLoading}
      <div class="flex justify-center items-center py-24 text-blue-600">
        <Loader2 class="w-12 h-12 animate-spin" />
      </div>
    {:else if filteredStores.length === 0}
      <div
        class="text-center py-24 bg-white rounded-[3rem] border border-gray-200 border-dashed shadow-sm max-w-2xl mx-auto"
      >
        <div
          class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-50 border border-gray-200 text-gray-300 mb-6"
        >
          <Search size={40} />
        </div>
        <h2 class="text-2xl font-black text-gray-900 mb-2">No stores found</h2>
        <p class="text-gray-500 font-medium">
          Try adjusting your search query to find what you're looking for.
        </p>
        {#if searchQuery}
          <button
            onclick={() => (searchQuery = "")}
            class="mt-8 px-8 py-3 bg-gray-900 text-white rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            Clear Search
          </button>
        {/if}
      </div>
    {:else}
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
      >
        {#each filteredStores as store}
          <a
            href={`/stores/${store.slug}`}
            class="group flex flex-col h-full bg-white border border-gray-200 rounded-[2.5rem] p-8 hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 shadow-xl shadow-gray-200/50 hover:-translate-y-2 overflow-hidden relative"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            ></div>

            <div class="flex items-start justify-between mb-8 relative z-10">
              <div
                class="w-16 h-16 lg:w-20 lg:h-20 rounded-3xl bg-gray-900 flex items-center justify-center text-white font-black text-3xl shadow-2xl group-hover:bg-blue-600 transition-colors transform -rotate-2 group-hover:rotate-0"
              >
                {store.name.charAt(0).toUpperCase()}
              </div>
              <div
                class="bg-gray-50 p-3 rounded-2xl text-gray-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all border border-gray-100"
              >
                <ArrowRight
                  size={22}
                  class="transform group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>

            <h2
              class="text-2xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1 relative z-10 tracking-tight"
            >
              {store.name}
            </h2>
            <p
              class="text-blue-600/70 text-sm mb-8 flex items-center gap-1.5 font-black relative z-10 uppercase tracking-widest"
            >
              <Store size={14} class="opacity-80" />
              {store.slug}
            </p>

            <div
              class="flex items-center gap-6 text-sm font-black text-gray-400 pt-8 border-t border-gray-100 mt-auto relative z-10"
            >
              <div
                class="flex flex-col gap-1"
                aria-label={`${store.productCount ?? 0} products`}
              >
                <span class="text-gray-900 text-lg leading-none"
                  >{store.productCount ?? 0}</span
                >
                <span class="text-[9px] uppercase tracking-widest opacity-60"
                  >Products</span
                >
              </div>
              <div class="w-px h-6 bg-gray-100"></div>
              <div
                class="flex flex-col gap-1"
                aria-label={`${store.categoryCount ?? 0} categories`}
              >
                <span class="text-gray-900 text-lg leading-none"
                  >{store.categoryCount ?? 0}</span
                >
                <span class="text-[9px] uppercase tracking-widest opacity-60"
                  >Categories</span
                >
              </div>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </main>
</div>
