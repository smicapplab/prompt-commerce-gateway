<script lang="ts">
  import { Search, X } from 'lucide-svelte';
  
  let { value = $bindable(''), placeholder = 'Search...', onsearch }: { value?: string, placeholder?: string, onsearch?: (v: string) => void } = $props();

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (onsearch) onsearch(value);
  }

  function handleClear() {
    value = '';
    if (onsearch) onsearch('');
  }
</script>

<form onsubmit={handleSubmit} class="relative w-full">
  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
    <Search size={18} />
  </div>
  <input 
    type="text" 
    bind:value={value} 
    {placeholder}
    class="w-full bg-[#1c1e26] border border-gray-700 rounded-xl py-2.5 pl-10 pr-10 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner"
  />
  {#if value}
    <button type="button" onclick={handleClear} class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors">
      <X size={16} />
    </button>
  {/if}
</form>
