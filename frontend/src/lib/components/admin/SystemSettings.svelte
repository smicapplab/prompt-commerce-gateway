<script lang="ts">
  import { Shield, Info, Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2 } from "lucide-svelte";
  import { onMount } from "svelte";
  import type { ApiFunction } from "$shared/types";

  let { api } = $props<{
    api: ApiFunction;
  }>();

  let tgToken = $state("");
  let showTgToken = $state(false);
  let tgTokenHasValue = $state(false);
  let isSavingSettings = $state(false);
  let settingsSavedMsg = $state("");
  let settingsError = $state("");

  async function loadSettings() {
    settingsSavedMsg = "";
    settingsError = "";
    const tg = await api("GET", "/api/settings/telegram_bot_token");
    tgTokenHasValue = !!(tg && tg.value);
  }

  async function saveSettings() {
    settingsSavedMsg = "";
    settingsError = "";
    isSavingSettings = true;

    try {
      const tokenToSave = tgToken.trim();
      if (tokenToSave) {
        await api("PUT", "/api/settings/telegram_bot_token", {
          value: tokenToSave,
        });
      }
      tgToken = ""; // clear input
      settingsSavedMsg = "Settings saved.";
      setTimeout(() => {
        settingsSavedMsg = "";
      }, 4000);
      loadSettings();
    } catch (err: unknown) {
      settingsError = err instanceof Error ? err.message : "Save failed";
    } finally {
      isSavingSettings = false;
    }
  }

  onMount(() => {
    loadSettings();
  });
</script>

<div class="max-w-2xl bg-white border border-gray-200 rounded-[2.5rem] p-10 md:p-14 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
  <div class="absolute -top-20 -right-20 w-64 h-64 bg-blue-50/50 blur-3xl rounded-full pointer-events-none"></div>

  <div class="relative z-10 flex flex-col gap-10">
    <div>
      <div class="flex items-center gap-4 mb-8">
        <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
          <Shield size={28} strokeWidth={2.5} />
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">System Bot Config</h2>
          <p class="text-gray-400 font-medium text-sm mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
            Primary credentials for the Telegram API
          </p>
        </div>
      </div>

      <div class="mb-8 p-8 bg-gray-50 rounded-3xl border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <div class="font-black text-gray-900 flex items-center gap-3">
            <svg class="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
            </svg>
            Telegram Bot Token
          </div>
          {#if tgTokenHasValue}
            <span class="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">Configured</span>
          {:else}
            <span class="text-[10px] font-black text-gray-400 bg-gray-200 px-3 py-1 rounded-full uppercase tracking-wider">Missing</span>
          {/if}
        </div>

        <div class="relative">
          <input
            type={showTgToken ? "text" : "password"}
            bind:value={tgToken}
            placeholder={tgTokenHasValue ? "••••••••••••••••••••••••••••••" : "Paste your bot token here..."}
            class="w-full bg-white border border-gray-200 rounded-2xl px-6 py-5 pr-14 text-gray-900 font-black focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 shadow-sm"
          />
          <button
            type="button"
            class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors"
            onclick={() => (showTgToken = !showTgToken)}
          >
            {#if showTgToken}
              <EyeOff size={22} strokeWidth={2.5} />
            {:else}
              <Eye size={22} strokeWidth={2.5} />
            {/if}
          </button>
        </div>
        <p class="text-xs text-gray-400 font-bold mt-4 flex items-center gap-2 uppercase tracking-wide">
          <Info size={14} class="text-blue-500" />
          Obtained via @BotFather
        </p>
      </div>

      {#if settingsSavedMsg}
        <div class="text-emerald-700 text-sm font-black mb-10 flex items-center gap-3 bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 animate-in zoom-in-95">
          <CheckCircle2 size={18} />
          {settingsSavedMsg}
        </div>
      {/if}

      {#if settingsError}
        <div class="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-black mb-10 flex items-center gap-3">
          <AlertTriangle size={18} />
          {settingsError}
        </div>
      {/if}

      <button
        onclick={saveSettings}
        disabled={isSavingSettings}
        class="w-full bg-gray-900 hover:bg-black text-white py-6 px-8 rounded-3xl font-black text-xl transition-all shadow-2xl active:scale-95 disabled:opacity-70 flex items-center justify-center gap-4"
      >
        {#if isSavingSettings}
          <Loader2 class="w-7 h-7 animate-spin px-1" />
          <span>Saving Changes...</span>
        {:else}
          Update Credentials
        {/if}
      </button>
    </div>
  </div>
</div>
