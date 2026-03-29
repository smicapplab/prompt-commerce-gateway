<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Loader2, ArrowLeft, Store, Tag as TagIcon, CheckCircle2, XCircle, ShoppingBag } from 'lucide-svelte';
  
  let slug = $derived($page.params.slug);
  let id = $derived(Number($page.params.id));
  let product = $state<any>(null);
  let store = $state<any>(null);
  let isLoading = $state(true);
  let activeImageIndex = $state(0);
  
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

<div class="min-h-screen bg-[#0b0c10] text-gray-100 flex flex-col font-sans">
  <div class="bg-[#14161c] border-b border-gray-800 sticky top-0 z-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a href={`/stores/${slug}`} class="text-gray-400 hover:text-white transition-colors flex items-center justify-center p-2 rounded-lg hover:bg-gray-800">
          <ArrowLeft size={20} />
          <span class="ml-2 font-medium hidden sm:inline">{store ? store.name : 'Back to Store'}</span>
        </a>
      </div>
      <a href="/stores" class="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1.5 font-medium border border-gray-800 px-3 py-1.5 rounded-lg hover:border-gray-700 bg-gray-900/50">
        <Store size={16} /> All Stores
      </a>
    </div>
  </div>
  
  <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
     {#if isLoading}
       <div class="flex justify-center items-center py-32 text-blue-500"><Loader2 class="w-10 h-10 animate-spin" /></div>
     {:else if product}
       <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div class="space-y-4">
            <div class="aspect-square bg-[#1c1e26] border border-gray-800 rounded-[2rem] overflow-hidden flex items-center justify-center p-6 lg:p-10 shadow-xl relative">
              {#if product.images && product.images.length > 0}
                <img src={product.images[activeImageIndex]} alt={product.title} class="w-full h-full object-contain drop-shadow-2xl relative z-10 transition-transform hover:scale-105 duration-500" />
              {:else}
                <div class="text-gray-700 flex flex-col items-center relative z-10">
                  <ShoppingBag size={80} class="mb-4 opacity-50 stroke-[1.5]" />
                  <span class="text-sm font-semibold uppercase tracking-widest text-gray-500">No image available</span>
                </div>
              {/if}
            </div>
            
            {#if product.images && product.images.length > 1}
              <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-none pt-2">
                {#each product.images as img, i}
                  <button 
                    class="w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all p-1 {activeImageIndex === i ? 'border-blue-500 bg-blue-500/10 scale-105 shadow-md' : 'border-gray-800 hover:border-gray-600 bg-gray-900/50 hover:bg-gray-800'}"
                    onclick={() => activeImageIndex = i}
                  >
                    <img src={img} alt="" class="w-full h-full object-cover rounded-xl" />
                  </button>
                {/each}
              </div>
            {/if}
          </div>
          
          <div class="flex flex-col lg:py-6">
             <div class="mb-5 flex flex-wrap items-center gap-3">
                {#if product.stockQuantity > 0}
                   <span class="inline-flex flex-row items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wide uppercase shadow-sm">
                     <CheckCircle2 size={16} /> In Stock ({product.stockQuantity})
                   </span>
                {:else}
                   <span class="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 tracking-wide uppercase shadow-sm">
                     <XCircle size={16} /> Out of Stock
                   </span>
                {/if}
             </div>
             
             <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">{product.title}</h1>
             
             <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 mb-8 pb-8 border-b border-gray-800/80 drop-shadow-sm flex items-end">
               ₱{product.price?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) ?? 'TBD'}
             </div>
             
             <div class="prose prose-invert prose-p:text-gray-300 prose-headings:text-gray-100 max-w-none mb-10 text-lg leading-relaxed font-light">
               {#if product.description}
                  <p class="whitespace-pre-line">{product.description}</p>
               {:else}
                  <p class="italic opacity-50">No description provided.</p>
               {/if}
             </div>
             
             {#if product.sku || (product.tags && product.tags.length > 0)}
               <div class="bg-[#1c1e26] border border-gray-800 rounded-3xl p-6 lg:p-8 mt-auto shadow-inner">
                 <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                   Product Details
                 </h3>
                 <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {#if product.sku}
                     <div>
                       <span class="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">SKU</span>
                       <span class="font-mono text-sm font-bold text-blue-400 bg-blue-500/10 py-1.5 px-3 rounded-lg border border-blue-500/20 inline-block shadow-sm">{product.sku}</span>
                     </div>
                   {/if}
                   {#if product.tags && product.tags.length > 0}
                     <div>
                       <span class="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Tags</span>
                       <div class="flex flex-wrap gap-2">
                         {#each product.tags as tag}
                           <span class="inline-flex items-center gap-1.5 bg-[#14161c] font-medium border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg shadow-sm">
                             <TagIcon size={12} class="opacity-50 text-blue-400" /> {tag}
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
        <div class="text-center py-20 bg-[#1c1e26] rounded-3xl border border-gray-800 max-w-lg mx-auto shadow-xl">
          <div class="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800"><ShoppingBag size={32} class="text-gray-600" /></div>
          <h2 class="text-2xl font-bold text-white mb-2">Product Not Found</h2>
          <p class="text-gray-400 mb-8 mx-auto px-6">We couldn't locate this product. It may have been removed or is no longer available.</p>
          <a href={`/stores/${slug}`} class="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors border border-gray-700">
            <ArrowLeft size={18} /> Return to Store
          </a>
        </div>
     {/if}
  </main>
</div>
