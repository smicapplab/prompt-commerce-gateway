<script lang="ts">
  import { Search, X } from 'lucide-svelte';
  
  let { value = $bindable(''), placeholder = 'Search...', onsearch }: { value?: string, placeholder?: string, onsearch?: (v: string) => void } = $props();
  let inputElement: HTMLInputElement | undefined = $state();

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (onsearch) onsearch(value);
  }

  function handleClear() {
    value = '';
    if (onsearch) onsearch('');
    inputElement?.focus();
  }
</script>

<form onsubmit={handleSubmit} class="relative w-full group">
  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
    <Search size={18} />
  </div>
  <input 
    bind:this={inputElement}
    type="text" 
    bind:value={value} 
    {placeholder}
    class="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-11 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm font-medium"
  />
  {#if value}
    <button type="button" onclick={handleClear} class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
      <X size={18} />
    </button>
  {/if}
</form>
