<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { Loader2, ArrowLeft, Filter, Tag } from "lucide-svelte";
  import ProductCard from "$lib/components/ProductCard.svelte";
  import SearchBar from "$lib/components/SearchBar.svelte";
  import Header from "$lib/components/Header.svelte";

  let slug = $derived($page.params.slug);

  let store = $state<any>(null);
  let categories = $state<any[]>([]);
  let products = $state<any[]>([]);
  let isLoadingInfo = $state(true);
  let isLoadingProducts = $state(true);

  let selectedCategory = $state<number | null>(null);
  let searchQuery = $state("");
  let prevSearchQuery = $state("");

  // Handlers
  async function loadStoreInfo() {
    isLoadingInfo = true;
    try {
      const [storeRes, catsRes] = await Promise.all([
        fetch(`/api/storefront/stores/${slug}`),
        fetch(`/api/storefront/stores/${slug}/categories`),
      ]);
      if (storeRes.ok) store = await storeRes.json();
      if (catsRes.ok) categories = await catsRes.json();
    } finally {
      isLoadingInfo = false;
    }
  }

  let currentPage = $state(1);
  let hasMore = $state(false);

  async function loadProducts(isLoadMore = false) {
    isLoadingProducts = true;
    if (!isLoadMore) {
      currentPage = 1;
    }
    try {
      let url = `/api/storefront/stores/${slug}/products?limit=24&page=${currentPage}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (isLoadMore) {
          products = [...products, ...data.products];
        } else {
          products = data.products;
        }
        hasMore = data.pagination?.hasMore ?? false;
      }
    } finally {
      isLoadingProducts = false;
    }
  }

  function loadMore() {
    if (isLoadingProducts || !hasMore) return;
    currentPage += 1;
    loadProducts(true);
  }

  function handleCategoryClick(catId: number | null) {
    if (selectedCategory === catId) return;
    selectedCategory = catId;
    loadProducts();
  }

  onMount(() => {
    if (slug) {
      loadStoreInfo();
      loadProducts();
    }
  });

  // Watch searchQuery and debounce fetch
  $effect(() => {
    const _q = searchQuery;
    if (_q === prevSearchQuery) return;
    prevSearchQuery = _q;
    if (!slug) return;

    const timer = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timer);
  });
</script>

<svelte:head>
  <title
    >{store
      ? `${store.name} - Prompt Commerce`
      : "Store - Prompt Commerce"}</title
  >
</svelte:head>

<Header />

<div class="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
  <main
    class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-10"
  >
    <div class="mb-6">
      <a
        href="/stores"
        class="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 font-black uppercase tracking-widest text-[10px] transition-all group"
      >
        <div
          class="p-2 bg-white border border-gray-100 rounded-xl shadow-sm group-hover:shadow-md transition-all"
        >
          <ArrowLeft size={16} strokeWidth={3} />
        </div>
        Back to Stores
      </a>
    </div>
    {#if isLoadingInfo && !store}
      <div class="flex justify-center items-center py-32 text-blue-600">
        <Loader2 class="w-10 h-10 animate-spin" />
      </div>
    {:else if store}
      <!-- Store Header -->
      <div
        class="bg-white border border-gray-200 rounded-[2.5rem] p-8 lg:p-12 mb-8 shadow-xl shadow-gray-200/50 relative overflow-hidden"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent"
        ></div>
        <div
          class="absolute -right-20 -top-20 w-80 h-80 bg-blue-100/30 blur-3xl rounded-full pointer-events-none"
        ></div>

        <div
          class="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-10 relative z-10"
        >
          <div
            class="w-24 h-24 lg:w-32 lg:h-32 shrink-0 rounded-3xl bg-gray-900 flex items-center justify-center text-5xl font-black text-white shadow-2xl transform -rotate-2"
          >
            {store.name.charAt(0).toUpperCase()}
          </div>
          <div class="flex-1 text-center md:text-left pt-2">
            <div class="flex flex-col md:flex-row md:items-center gap-3 mb-3">
              <h1
                class="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight"
              >
                {store.name}
              </h1>
              <div
                class="flex items-center justify-center md:justify-start gap-2"
              >
                <span
                  class="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full uppercase tracking-wider"
                  >Active</span
                >
              </div>
            </div>
            <p
              class="text-blue-600 font-bold flex items-center justify-center md:justify-start gap-2 mb-6"
            >
              <Tag size={16} />
              {store.slug}
            </p>

            <div
              class="flex items-center justify-center md:justify-start gap-6"
            >
              <div class="flex flex-col">
                <span class="text-2xl font-black text-gray-900 leading-none"
                  >{store.productCount ?? 0}</span
                >
                <span
                  class="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mt-1"
                  >Products</span
                >
              </div>
              <div class="w-px h-8 bg-gray-200"></div>
              <div class="flex flex-col">
                <span class="text-2xl font-black text-gray-900 leading-none"
                  >{store.categoryCount ?? 0}</span
                >
                <span
                  class="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mt-1"
                  >Categories</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Filters -->
        <div class="lg:col-span-1">
          <div
            class="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm lg:sticky top-[88px]"
          >
            <h3
              class="font-black text-gray-400 mb-5 flex items-center gap-2 uppercase tracking-[0.15em] text-xs"
            >
              <Filter size={14} strokeWidth={3} />
              Categories
            </h3>

            <!-- Mobile Horizontal Scroll / Desktop Vertical List -->
            <div
              class="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar"
            >
              <button
                class="whitespace-nowrap lg:text-left px-4 py-3 rounded-2xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 {selectedCategory ===
                null
                  ? 'bg-gray-900 text-white font-black shadow-lg shadow-gray-900/20'
                  : 'bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-bold'}"
                onclick={() => handleCategoryClick(null)}
              >
                All Products
              </button>
              {#each categories as category}
                <button
                  class="whitespace-nowrap lg:text-left px-4 py-3 rounded-2xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 {selectedCategory ===
                  category.sellerId
                    ? 'bg-gray-900 text-white font-black shadow-lg shadow-gray-900/20'
                    : 'bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-bold'}"
                  onclick={() => handleCategoryClick(category.sellerId)}
                >
                  {category.name}
                </button>
              {/each}
            </div>
          </div>
        </div>

        <!-- Main Products Grid -->
        <div class="lg:col-span-3">
          <div
            class="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-gray-200 p-3 md:pl-6 rounded-3xl shadow-sm"
          >
            <h2 class="text-lg font-black text-gray-900 hidden md:block">
              {selectedCategory
                ? categories.find((c) => c.sellerId === selectedCategory)?.name
                : "All Products"}
            </h2>
            <div class="w-full md:w-80">
              <SearchBar
                bind:value={searchQuery}
                placeholder="Search products..."
              />
            </div>
          </div>

          {#if isLoadingProducts && products.length === 0}
            <div class="flex justify-center items-center py-32 text-blue-600">
              <Loader2 class="w-10 h-10 animate-spin" />
            </div>
          {:else if products.length === 0}
            <div
              class="bg-white border border-gray-200 border-dashed rounded-[2.5rem] p-16 text-center shadow-sm"
            >
              <div
                class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 border border-gray-200 text-gray-300 mb-6"
              >
                <Tag size={40} strokeWidth={1} />
              </div>
              <h3 class="text-2xl font-black text-gray-900 mb-2">
                No products found
              </h3>
              <p class="text-gray-500 font-medium max-w-md mx-auto mb-8">
                We couldn't find any items matching your current filters in this
                store.
              </p>
              {#if selectedCategory || searchQuery}
                <button
                  class="text-sm text-white bg-gray-900 hover:bg-black transition-all font-black px-8 py-4 rounded-2xl shadow-lg active:scale-95"
                  onclick={() => {
                    selectedCategory = null;
                    searchQuery = "";
                    loadProducts();
                  }}
                >
                  Clear all filters
                </button>
              {/if}
            </div>
          {:else}
            <div
              class="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8"
            >
              {#each products as product}
                <ProductCard {product} storeSlug={slug} />
              {/each}
            </div>

            {#if hasMore}
              <div class="mt-12 flex justify-center">
                <button
                  onclick={loadMore}
                  disabled={isLoadingProducts}
                  class="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border border-gray-200 text-gray-900 hover:border-gray-900 transition-all focus:outline-none focus:ring-4 focus:ring-gray-900/5 font-black disabled:opacity-50 shadow-sm active:scale-95"
                >
                  {#if isLoadingProducts}
                    <Loader2 class="w-5 h-5 animate-spin text-blue-600" />
                    <span>Loading...</span>
                  {:else}
                    <span>Load more products</span>
                  {/if}
                </button>
              </div>
            {/if}
          {/if}
        </div>
      </div>
    {:else}
      <div class="text-center py-32">
        <div
          class="inline-flex justify-center items-center w-24 h-24 bg-red-50 text-red-500 rounded-3xl mb-8"
        >
          <ArrowLeft size={40} />
        </div>
        <h2 class="text-4xl font-black text-gray-900 mb-4">Store not found</h2>
        <p class="text-gray-500 font-medium mb-10 text-lg">
          The store you are looking for does not exist or has been disabled.
        </p>
        <a
          href="/stores"
          class="inline-flex items-center px-10 py-4 bg-gray-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-xl active:scale-95"
        >
          Browse all stores
        </a>
      </div>
    {/if}
  </main>
</div>
