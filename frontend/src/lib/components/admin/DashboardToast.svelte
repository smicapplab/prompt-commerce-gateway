<script lang="ts">
  import { CheckCircle2, AlertTriangle, X } from "lucide-svelte";

  let { toastMsg = $bindable(), toastType = "success" } = $props<{
    toastMsg: string;
    toastType: "success" | "error";
  }>();
</script>

{#if toastMsg}
  <div
    class="fixed bottom-10 right-10 z-[100] px-8 py-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] font-black text-white {toastType === 'success'
      ? 'bg-gray-900'
      : 'bg-red-600'} transition-all animate-in slide-in-from-bottom-10 fade-in flex items-center gap-4 min-w-[300px] border border-white/10 backdrop-blur-md"
  >
    {#if toastType === "success"}
      <div class="bg-emerald-500 p-1.5 rounded-full text-white shadow-lg">
        <CheckCircle2 size={18} strokeWidth={3} />
      </div>
    {:else}
      <div class="bg-white p-1.5 rounded-full text-red-600 shadow-lg">
        <AlertTriangle size={18} strokeWidth={3} />
      </div>
    {/if}
    <span class="flex-1">{toastMsg}</span>
    <button class="text-white/40 hover:text-white transition-colors p-1" onclick={() => (toastMsg = "")}><X size={16} strokeWidth={3} /></button>
  </div>
{/if}
