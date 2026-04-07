<script lang="ts">
  import { Info, Loader2 } from "lucide-svelte";

  let { isConfirmOpen = $bindable(), confirmTitle, confirmDesc, onConfirmFn } = $props<{
    isConfirmOpen: boolean;
    confirmTitle: string;
    confirmDesc: string;
    onConfirmFn: () => Promise<void>;
  }>();

  let isConfirming = $state(false);

  async function handleConfirm() {
    isConfirming = true;
    try {
      await onConfirmFn();
    } finally {
      isConfirming = false;
      isConfirmOpen = false;
    }
  }
</script>

{#if isConfirmOpen}
  <div class="fixed inset-0 z-[200] flex items-center justify-center p-6 text-gray-900 font-sans">
    <div
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-xl transition-opacity animate-in fade-in duration-300"
      onclick={() => !isConfirming && (isConfirmOpen = false)}
      aria-hidden="true"
    ></div>

    <div class="relative bg-white border border-gray-200 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-lg p-10 md:p-14 animate-in zoom-in-95 fade-in duration-300">
      <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-10 shadow-sm border border-blue-100">
        <Info size={32} strokeWidth={2.5} />
      </div>
      <h2 class="text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight">{confirmTitle}</h2>
      <p class="text-gray-500 font-medium text-sm mb-10 leading-relaxed">{confirmDesc}</p>

      <div class="flex flex-col sm:flex-row items-center justify-end gap-4">
        <button
          type="button"
          disabled={isConfirming}
          onclick={() => (isConfirmOpen = false)}
          class="w-full sm:w-auto px-8 py-5 text-base font-black text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isConfirming}
          onclick={handleConfirm}
          class="w-full sm:w-auto px-10 py-5 text-base font-black text-white bg-gray-900 hover:bg-black rounded-2xl transition-all shadow-2xl disabled:opacity-70 flex items-center justify-center gap-3 active:scale-95"
        >
          {#if isConfirming}
            <Loader2 class="w-5 h-5 animate-spin" />
            <span>Working...</span>
          {:else}
            Confirm
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
