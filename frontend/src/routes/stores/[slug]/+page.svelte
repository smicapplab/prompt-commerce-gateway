<script lang="ts">
  import { page } from '$app/stores';
  import { Loader2, ArrowLeft, Filter, Tag } from 'lucide-svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';

  let slug = $derived($page.params.slug);
  
  let store = $state<any>(null);
  let categories = $state<any[]>([]);
  let products = $state<any[]>([]);
  let isLoadingInfo = $state(true);
  let isLoadingProducts = $state(true);
  
  let selectedCategory = $state<number | null>(null);
  let searchQuery = $state('');
  
  // Handlers
  async function loadStoreInfo() {
    isLoadingInfo = true;
    try {
      const [storeRes, catsRes] = await Promise.all([
        fetch(`/api/storefront/stores/${slug}`),
        fetch(`/api/storefront/stores/${slug}/categories`)
      ]);
      if (storeRes.ok) store = await storeRes.json();
      if (catsRes.ok) categories = await catsRes.json();
    } finally {
      isLoadingInfo = false;
    }
  }

  async function loadProducts() {
    isLoadingProducts = true;
    try {
      let url = `/api/storefront/stores/${slug}/products?limit=50`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        products = data.products;
      }
    } finally {
      isLoadingProducts = false;
    }
  }

  // Effect to load info when store slug is available
  $effect(() => {
     if (slug) {
         loadStoreInfo();
     }
  });

  // Watch selectedCategory and searchQuery and debounce fetch
  $effect(() => {
    // track state to ensure Svelte 5 recognizes it as dependencies
    const _cat = selectedCategory;
    const _q = searchQuery;
    let timer: any;
    // this block gets evaluated when selectedCategory or searchQuery changes
    // it will be called initially, we only want it if slug exists
    if(slug) {
      timer = setTimeout(() => {
          loadProducts();
      }, 300);
    }
    return () => clearTimeout(timer);
  });

</script>

<svelte:head>
  <title>{store ? `${store.name} - Prompt Commerce` : 'Store - Prompt Commerce'}</title>
</svelte:head>

<div class="min-h-screen bg-[#0b0c10] text-gray-100 flex flex-col font-sans">
  <div class="bg-[#14161c] border-b border-gray-800 sticky top-0 z-30 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a href="/stores" class="text-gray-400 hover:text-white transition-colors flex items-center justify-center p-2 rounded-lg hover:bg-gray-800">
          <ArrowLeft size={20} />
          <span class="sr-only">Back</span>
        </a>
        <a href="/" class="hidden sm:flex items-center gap-2.5 text-white font-semibold border-l border-gray-800 pl-4 ml-1">
          <img src="/logo-w.png" alt="Logo" class="w-6 h-6" />
          <span>Prompt Commerce</span>
        </a>
      </div>
    </div>
  </div>

  <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
    {#if isLoadingInfo && !store}
      <div class="flex justify-center items-center py-32 text-blue-500"><Loader2 class="w-10 h-10 animate-spin" /></div>
    {:else if store}
      <!-- Store Header -->
      <div class="bg-gradient-to-r from-[#1c1e26] to-[#14161c] border border-gray-800 rounded-3xl p-8 lg:p-10 mb-8 shadow-xl relative overflow-hidden">
        <div class="absolute inset-0 bg-blue-500/5"></div>
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 lg:gap-8 relative z-10">
          <div class="w-24 h-24 lg:w-28 lg:h-28 shrink-0 rounded-[1.25rem] bg-gray-900 border border-gray-700 flex items-center justify-center text-5xl font-bold text-white shadow-lg bg-gradient-to-br from-gray-800 to-black">
            {store.name.charAt(0).toUpperCase()}
          </div>
          <div class="flex-1 text-center sm:text-left pt-2">
            <h1 class="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2 drop-shadow-sm">{store.name}</h1>
            <p class="text-blue-400/80 font-medium flex items-center justify-center sm:justify-start gap-2 max-w-lg mb-4">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              {store.slug}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Filters -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-[#1c1e26] border border-gray-800 rounded-2xl p-5 shadow-md lg:sticky top-[88px]">
            <h3 class="font-semibold text-white mb-4 flex items-center gap-2 uppercase tracking-wider text-sm text-gray-400">
              <Filter size={16} />
              Categories
            </h3>
            <div class="flex flex-col gap-1">
              <button 
                class="text-left px-3 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 {selectedCategory === null ? 'bg-blue-600/10 text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 font-medium'}"
                onclick={() => selectedCategory = null}
              >
                All Products
              </button>
              {#each categories as category}
                <button 
                  class="text-left px-3 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 {selectedCategory === category.sellerId ? 'bg-blue-600/10 text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 font-medium'}"
                  onclick={() => selectedCategory = category.sellerId}
                >
                  {category.name}
                </button>
              {/each}
            </div>
          </div>
        </div>

        <!-- Main Products Grid -->
        <div class="lg:col-span-3">
          <div class="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#1c1e26] border border-gray-800 p-2 sm:pl-5 sm:py-2 rounded-2xl shadow-sm">
            <h2 class="text-lg font-bold text-white hidden sm:block">
              {selectedCategory ? categories.find(c => c.sellerId === selectedCategory)?.name : 'All Products'}
            </h2>
            <div class="w-full sm:w-80">
              <SearchBar bind:value={searchQuery} placeholder="Search products..." />
            </div>
          </div>

          {#if isLoadingProducts}
            <div class="flex justify-center items-center py-32 text-blue-500"><Loader2 class="w-8 h-8 animate-spin" /></div>
          {:else if products.length === 0}
            <div class="bg-[#14161c] border border-gray-800 border-dashed rounded-3xl p-16 text-center shadow-inner">
              <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1c1e26] border border-gray-800 text-gray-500 mb-6 drop-shadow-sm">
                <Tag size={36} />
              </div>
              <h3 class="text-xl font-bold text-white mb-2">No products found</h3>
              <p class="text-gray-400 max-w-md mx-auto mb-8">We couldn't find any items matching your current filters in this store.</p>
              {#if selectedCategory || searchQuery}
                <button 
                  class="text-sm text-blue-400 hover:text-white transition-colors font-bold border border-blue-500/30 px-6 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/30 shadow-sm"
                  onclick={() => { selectedCategory = null; searchQuery = ''; }}
                >
                  Clear all filters
                </button>
              {/if}
            </div>
          {:else}
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
              {#each products as product}
                <ProductCard {product} storeSlug={slug} />
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {:else}
       <div class="text-center py-32">
         <div class="inline-flex justify-center items-center w-20 h-20 bg-red-500/10 text-red-400 rounded-full mb-6">
            <ArrowLeft size={32} />
         </div>
         <h2 class="text-3xl font-bold text-white mb-4">Store not found</h2>
         <p class="text-gray-400 mb-8">The store you are looking for does not exist or has been disabled.</p>
         <a href="/stores" class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg">
           Browse all stores
         </a>
       </div>
    {/if}
  </main>
</div>
