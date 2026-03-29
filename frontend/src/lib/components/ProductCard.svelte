<script lang="ts">
  import { Image } from 'lucide-svelte';

  let { product, storeSlug } = $props();

  // product has: id, title, price, images[], stockQuantity
</script>

<a href={`/stores/${storeSlug}/products/${product.sellerId}`} class="block group h-full">
  <div class="bg-[#1c1e26] border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200 h-full flex flex-col">
    <div class="aspect-square bg-gray-900 border-b border-gray-800 flex items-center justify-center p-4 relative overflow-hidden shrink-0">
      {#if product.images && product.images.length > 0}
        <img src={product.images[0]} alt={product.title} class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
      {:else}
        <div class="text-gray-700">
          <Image size={48} />
        </div>
      {/if}
      {#if product.stockQuantity <= 0}
         <div class="absolute top-2 right-2 bg-red-500/90 backdrop-blur border border-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">Out of Stock</div>
      {/if}
    </div>
    <div class="p-4 flex flex-col flex-1">
      <h3 class="text-gray-200 font-medium line-clamp-2 leading-tight mb-2 group-hover:text-blue-400 transition-colors flex-1" title={product.title}>{product.title}</h3>
      <div class="flex items-center justify-between mt-auto">
        <span class="text-emerald-400 font-bold tracking-tight">₱{product.price?.toLocaleString(undefined, { minimumFractionDigits: 0 }) ?? 'TBD'}</span>
      </div>
    </div>
  </div>
</a>
