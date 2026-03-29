<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import {
    Loader2,
    Search,
    ArrowLeft,
    ShoppingBag,
    Store,
    Sparkles,
  } from "lucide-svelte";
  import ProductCard from "$lib/components/ProductCard.svelte";
  import SearchBar from "$lib/components/SearchBar.svelte";
  import Header from "$lib/components/Header.svelte";

  let searchQuery = $state($page.url.searchParams.get("q") || "");
  let products = $state<any[]>([]);
  let isLoading = $state(false);
  let currentPage = $state(1);
  let hasMore = $state(false);
  let total = $state(0);

  async function performSearch(isLoadMore = false) {
    if (!searchQuery.trim()) {
      products = [];
      total = 0;
      hasMore = false;
      return;
    }

    isLoading = true;
    if (!isLoadMore) currentPage = 1;

    try {
      const res = await fetch(
        `/api/storefront/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=24`,
      );
      if (res.ok) {
        const data = await res.json();
        if (isLoadMore) {
          products = [...products, ...data.products];
        } else {
          products = data.products;
        }
        total = data.pagination?.total ?? 0;
        hasMore = data.pagination?.hasMore ?? false;
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      isLoading = false;
    }
  }

  function handleSearch(v: string) {
    if (searchQuery === v) return;
    searchQuery = v;
    performSearch();
    // Update URL without reload
    const url = new URL(window.location.href);
    if (v) {
      url.searchParams.set("q", v);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState({}, "", url);
  }

  function loadMore() {
    if (isLoading || !hasMore) return;
    currentPage += 1;
    performSearch(true);
  }

  onMount(() => {
    if (searchQuery) {
      performSearch();
    }
  });
</script>

<svelte:head>
  <title
    >{searchQuery
      ? `${searchQuery} - Search | Prompt Commerce`
      : "Global Search - Prompt Commerce"}</title
  >
</svelte:head>

<Header />

<div class="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
  <main
    class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-16 relative"
  >
    <!-- Background Sparkles -->
    <div
      class="absolute top-10 right-10 text-blue-100 hidden lg:block animate-pulse pointer-events-none"
    >
      <Sparkles size={100} />
    </div>

    <div class="mb-12 relative z-10">
      <div
        class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
      >
        <div>
          <div
            class="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-sm"
          >
            <Search size={14} class="text-blue-600" />
            Global Search
          </div>
          <h1
            class="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight leading-tight"
          >
            {#if searchQuery}
              Results for <span class="text-blue-600">"{searchQuery}"</span>
            {:else}
              What are you looking for?
            {/if}
          </h1>
        </div>

        {#if searchQuery && total > 0}
          <div
            class="bg-white px-6 py-3 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3"
          >
            <ShoppingBag size={18} class="text-emerald-500" />
            <span
              class="text-sm font-black text-gray-900 uppercase tracking-widest"
            >
              {total} <span class="text-gray-400">Products found</span>
            </span>
          </div>
        {/if}
      </div>

      <div class="max-w-2xl relative z-20">
        <div
          class="bg-white p-2 rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100"
        >
          <SearchBar
            value={searchQuery}
            onsearch={handleSearch}
            placeholder="Search anything across all stores..."
          />
        </div>
      </div>
    </div>

    {#if isLoading && products.length === 0}
      <div class="flex justify-center items-center py-32 text-blue-600">
        <Loader2 class="w-16 h-16 animate-spin" />
      </div>
    {:else if products.length === 0}
      <div
        class="bg-white border border-gray-200 border-dashed rounded-[3rem] p-20 text-center shadow-lg relative z-10 overflow-hidden"
      >
        <div
          class="absolute -bottom-20 -right-20 w-64 h-64 bg-gray-50 rounded-full blur-3xl opacity-50"
        ></div>

        <div
          class="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gray-50 border border-gray-200 text-gray-200 mb-8 relative z-10"
        >
          <Search size={50} strokeWidth={1} />
        </div>
        <h2
          class="text-3xl font-black text-gray-900 mb-4 tracking-tight relative z-10"
        >
          {searchQuery ? "No matching products" : "Start your discovery"}
        </h2>
        <p
          class="text-gray-500 font-medium max-w-md mx-auto mb-12 text-lg leading-relaxed relative z-10"
        >
          {searchQuery
            ? "We couldn't find anything matching your query across our stores. Try broadening your keywords."
            : "Search for laptops, headphones, coffee, or anything else from our global independent retail network."}
        </p>
        {#if !searchQuery}
          <div class="flex flex-wrap justify-center gap-3 relative z-10">
            {#each ["Laptop", "Headphones", "Coffee", "Minimalist", "Camera", "Watch"] as tag}
              <button
                onclick={() => handleSearch(tag)}
                class="px-6 py-3 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-500 font-black rounded-2xl transition-all text-xs tracking-widest uppercase active:scale-95 shadow-sm hover:shadow-md"
              >
                {tag}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <div
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10 relative z-10"
      >
        {#each products as product}
          <div class="flex flex-col gap-3">
            <ProductCard {product} storeSlug={product.storeSlug} />
            <div class="flex items-center gap-2 pl-2">
              <span
                class="bg-gray-100 text-gray-500 text-[9px] font-black px-2.5 py-1.5 rounded-lg border border-gray-200 uppercase tracking-widest flex items-center gap-1.5 shadow-sm"
              >
                <Store size={10} strokeWidth={3} />
                {product.storeSlug}
              </span>
            </div>
          </div>
        {/each}
      </div>

      {#if hasMore}
        <div class="mt-20 flex justify-center">
          <button
            onclick={loadMore}
            disabled={isLoading}
            class="group flex items-center gap-4 px-12 py-6 rounded-[1.5rem] bg-gray-900 text-white hover:bg-black transition-all shadow-2xl hover:scale-105 active:scale-95 font-black text-lg disabled:opacity-50"
          >
            {#if isLoading}
              <Loader2 class="w-6 h-6 animate-spin" />
              <span>Loading more...</span>
            {:else}
              <span>Load more results</span>
              <ArrowLeft
                size={22}
                class="rotate-180 group-hover:translate-x-1 transition-transform"
              />
            {/if}
          </button>
        </div>
      {/if}
    {/if}
  </main>
</div>
