<script lang="ts">
  import { onMount } from 'svelte';
  import { Store, ShoppingBag, FolderTree, Search, ArrowRight, Loader2 } from 'lucide-svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';

  let stores = $state<any[]>([]);
  let isLoading = $state(true);
  let searchQuery = $state('');

  let filteredStores = $derived(
    stores.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  onMount(async () => {
    try {
      const res = await fetch('/api/storefront/stores');
      if (res.ok) {
        stores = await res.json();
      }
    } finally {
      isLoading = false;
    }
  });
</script>

<svelte:head>
  <title>Stores - Prompt Commerce</title>
</svelte:head>

<div class="min-h-screen bg-[#0b0c10] text-gray-100 flex flex-col">
  <div class="bg-[#14161c] border-b border-gray-800 sticky top-0 z-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-3 text-white font-semibold">
        <img src="/logo-w.png" alt="Logo" class="w-8 h-8" />
        <span>Prompt Commerce</span>
      </a>
    </div>
  </div>

  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
    <div class="mb-12 text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-sm">Discover amazing stores</h1>
      <p class="text-gray-400 text-lg max-w-2xl mx-auto font-light">Explore premium products curated by our registered independent retailers.</p>
    </div>

    <div class="max-w-xl mx-auto mb-12">
      <SearchBar bind:value={searchQuery} placeholder="Search stores by name or slug..." />
    </div>

    {#if isLoading}
       <div class="flex justify-center items-center py-20 text-blue-500"><Loader2 class="w-10 h-10 animate-spin" /></div>
    {:else if filteredStores.length === 0}
       <div class="text-center py-20 bg-[#1c1e26] rounded-3xl border border-gray-800 border-dashed">
         <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 border border-gray-800 text-gray-500 mb-4"><Search size={32} /></div>
         <h2 class="text-xl font-medium text-white mb-2">No stores found</h2>
         <p class="text-gray-400 text-sm">Try adjusting your search query to find what you're looking for.</p>
       </div>
    {:else}
       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
         {#each filteredStores as store}
           <a href={`/stores/${store.slug}`} class="group flex flex-col h-full bg-[#1c1e26] border border-gray-800 rounded-3xl p-6 hover:border-blue-500/40 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
             <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

             <div class="flex items-start justify-between mb-5 relative z-10">
               <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-bold text-2xl border border-gray-700/80 shadow-inner group-hover:shadow-blue-500/20 group-hover:border-blue-500/30 transition-all">
                 {store.name.charAt(0).toUpperCase()}
               </div>
               <div class="bg-gray-800/50 p-2 rounded-full text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                  <ArrowRight size={18} class="transform group-hover:translate-x-0.5 transition-transform" />
               </div>
             </div>
             
             <h2 class="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1 relative z-10">{store.name}</h2>
             <p class="text-blue-400/70 text-sm mb-6 flex items-center gap-1.5 font-medium relative z-10">
                <Store size={14} class="opacity-80" /> {store.slug}
             </p>
             
             <div class="flex items-center gap-5 text-sm font-medium text-gray-400 pt-5 border-t border-gray-800 mt-auto relative z-10">
               <div class="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-800/80">
                 <ShoppingBag size={14} class="text-emerald-400" />
                 <span>{store.productCount ?? 0}</span>
               </div>
               <div class="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-800/80">
                 <FolderTree size={14} class="text-blue-400" />
                 <span>{store.categoryCount ?? 0}</span>
               </div>
             </div>
           </a>
         {/each}
       </div>
    {/if}
  </main>
</div>
