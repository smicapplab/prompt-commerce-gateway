<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Loader2, ArrowLeft, Tag as TagIcon, CheckCircle2, XCircle, ShoppingBag, ChevronRight } from 'lucide-svelte';
  import Header from '$lib/components/Header.svelte';
  
  let slug = $derived($page.params.slug);
  let id = $derived(Number($page.params.id));
  let product = $state<any>(null);
  let store = $state<any>(null);
  let isLoading = $state(true);
  let activeImageIndex = $state(0);
  let imageError = $state(false);
  
  onMount(async () => {
    try {
      const [prodRes, storeRes] = await Promise.all([
        fetch(`/api/storefront/stores/${slug}/products/${id}`),
        fetch(`/api/storefront/stores/${slug}`)
      ]);
      if (prodRes.ok) product = await prodRes.json();
      if (storeRes.ok) store = await storeRes.json();
    } finally {
      isLoading = false;
    }
  });
</script>

<svelte:head>
  <title>{product ? `${product.title} - ${store?.name} | Prompt Commerce` : 'Product Detail'}</title>
</svelte:head>

<Header />

<div class="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
  <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
     {#if isLoading}
       <div class="flex justify-center items-center py-32 text-blue-600"><Loader2 class="w-10 h-10 animate-spin" /></div>
     {:else if product}
       <!-- Breadcrumb -->
       <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 overflow-hidden whitespace-nowrap">
         <a href="/stores" class="hover:text-blue-600 transition-colors shrink-0">Stores</a>
         <ChevronRight size={12} class="shrink-0 opacity-50" />
         <a href={`/stores/${slug}`} class="hover:text-blue-600 transition-colors truncate max-w-[100px] sm:max-w-none">{store?.name ?? 'Store'}</a>
         <ChevronRight size={12} class="shrink-0 opacity-50" />
         <span class="text-gray-900 truncate">{product.title}</span>
       </nav>

       <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          <div class="space-y-6">
            <div class="aspect-square bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden flex items-center justify-center p-6 lg:p-12 shadow-2xl shadow-gray-200/50 relative group">
              {#if product.images && product.images.length > 0 && !imageError}
                <img 
                  src={product.images[activeImageIndex]} 
                  alt={product.title} 
                  class="w-full h-full object-contain drop-shadow-2xl relative z-10 transition-transform group-hover:scale-110 duration-700" 
                  onerror={() => imageError = true}
                />
              {:else}
                <div class="text-gray-200 flex flex-col items-center relative z-10">
                  <ShoppingBag size={120} strokeWidth={1} class="mb-4 opacity-50" />
                  <span class="text-xs font-black uppercase tracking-[0.2em] text-gray-400">No image available</span>
                </div>
              {/if}
            </div>
            
            {#if product.images && product.images.length > 1}
              <div class="flex gap-4 overflow-x-auto pb-4 no-scrollbar pt-2">
                {#each product.images as img, i}
                  <button 
                    class="w-24 h-24 shrink-0 rounded-3xl overflow-hidden border-4 transition-all p-1.5 {activeImageIndex === i ? 'border-blue-600 bg-white shadow-xl shadow-blue-500/20 scale-105' : 'border-transparent bg-white hover:bg-gray-50'}"
                    onclick={() => { activeImageIndex = i; imageError = false; }}
                  >
                    <img src={img} alt="" class="w-full h-full object-cover rounded-2xl" />
                  </button>
                {/each}
              </div>
            {/if}
          </div>
          
          <div class="flex flex-col lg:py-4">
             <div class="mb-6 flex flex-wrap items-center gap-3">
                {#if product.stockQuantity > 0}
                   <span class="inline-flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 tracking-[0.1em] uppercase shadow-sm">
                     <CheckCircle2 size={14} /> In Stock ({product.stockQuantity})
                   </span>
                {:else}
                   <span class="inline-flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-xl bg-red-50 text-red-500 border border-red-100 tracking-[0.1em] uppercase shadow-sm">
                     <XCircle size={14} /> Out of Stock
                   </span>
                {/if}
             </div>
             
             <h1 class="text-3xl sm:text-4xl lg:text-6xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tighter">{product.title}</h1>
             
             <div class="text-5xl font-black text-emerald-600 mb-10 pb-10 border-b border-gray-100 flex items-baseline gap-1">
               <span class="text-2xl opacity-50">₱</span>{product.price?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) ?? 'TBD'}
             </div>
             
             <div class="max-w-none mb-12 text-lg leading-relaxed text-gray-600 font-medium">
               {#if product.description}
                  <p class="whitespace-pre-line">{product.description}</p>
               {:else}
                  <p class="italic text-gray-300">No description provided for this product.</p>
               {/if}
             </div>
             
             {#if product.sku || (product.tags && product.tags.length > 0)}
               <div class="bg-white border border-gray-200 rounded-[2.5rem] p-8 lg:p-10 mt-auto shadow-xl shadow-gray-200/50">
                 <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                   <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                   Product Intelligence
                 </h3>
                 <div class="grid grid-cols-1 sm:grid-cols-2 gap-10">
                   {#if product.sku}
                     <div>
                       <span class="block text-[10px] uppercase tracking-wider font-black text-gray-400 mb-3">SKU Identifier</span>
                       <span class="font-mono text-sm font-black text-blue-600 bg-blue-50 py-2.5 px-4 rounded-xl border border-blue-100 inline-block shadow-sm">{product.sku}</span>
                     </div>
                   {/if}
                   {#if product.tags && product.tags.length > 0}
                     <div>
                       <span class="block text-[10px] uppercase tracking-wider font-black text-gray-400 mb-3">Classifications</span>
                       <div class="flex flex-wrap gap-2">
                         {#each product.tags as tag}
                           <span class="inline-flex items-center gap-2 bg-gray-50 font-bold border border-gray-100 text-gray-600 text-xs px-4 py-2 rounded-xl shadow-sm hover:border-blue-200 hover:text-blue-600 transition-colors cursor-default">
                             <TagIcon size={12} class="opacity-40" /> {tag}
                           </span>
                         {/each}
                       </div>
                     </div>
                   {/if}
                 </div>
               </div>
             {/if}
          </div>
       </div>
     {:else}
        <div class="text-center py-20 bg-white rounded-[2.5rem] border border-gray-200 max-w-lg mx-auto shadow-2xl shadow-gray-200/50">
          <div class="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gray-100 text-gray-300">
            <ShoppingBag size={48} strokeWidth={1} />
          </div>
          <h2 class="text-3xl font-black text-gray-900 mb-3">Product Not Found</h2>
          <p class="text-gray-500 font-medium mb-10 mx-auto px-10 text-lg">We couldn't locate this product. It may have been removed or is no longer available.</p>
          <a href={`/stores/${slug}`} class="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-xl active:scale-95">
            <ArrowLeft size={20} /> Return to Store
          </a>
        </div>
     {/if}
  </main>
</div>

