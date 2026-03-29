<script lang="ts">
  import { Image } from 'lucide-svelte';

  let { product, storeSlug } = $props();
  let imageError = $state(false);

  // product has: id, title, price, images[], stockQuantity
</script>

<a href={`/stores/${storeSlug}/products/${product.sellerId}`} class="block group h-full">
  <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 transform duration-300 h-full flex flex-col">
    <div class="aspect-square bg-gray-50 border-b border-gray-100 flex items-center justify-center p-4 relative overflow-hidden shrink-0">
      {#if product.images && product.images.length > 0 && !imageError}
        <img 
          src={product.images[0]} 
          alt={product.title} 
          class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
          onerror={() => imageError = true}
        />
      {:else}
        <div class="text-gray-200 group-hover:text-blue-200 transition-colors">
          <Image size={64} strokeWidth={1} />
        </div>
      {/if}
      {#if product.stockQuantity <= 0}
         <div class="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-[0.1em] shadow-lg">Sold Out</div>
      {/if}
    </div>
    <div class="p-5 flex flex-col flex-1">
      <h3 class="text-gray-900 font-bold line-clamp-2 leading-snug mb-3 group-hover:text-blue-600 transition-colors flex-1" title={product.title}>{product.title}</h3>
      <div class="flex items-center justify-between mt-auto">
        <span class="text-emerald-600 font-black text-lg tracking-tight">₱{product.price?.toLocaleString(undefined, { minimumFractionDigits: 0 }) ?? 'TBD'}</span>
      </div>
    </div>
  </div>
</a>
