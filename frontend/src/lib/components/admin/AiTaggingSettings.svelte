<script lang="ts">
  import { Sparkles, Check, Loader2, Info, Eye, EyeOff } from 'lucide-svelte';
  import type { ApiFunction, Retailer } from '../../../shared/types';
  import { onMount } from 'svelte';

  let { api, retailers }: { api: ApiFunction; retailers: Retailer[] } = $props();

  // ── Config State ────────────────────────────────────────────────────────────
  let provider = $state('claude');
  let apiKeyInput = $state('');
  let apiKeyHasValue = $state(false);
  let showApiKey = $state(false);
  let model = $state('');
  
  let isSaving = $state(false);
  let savedMsg = $state('');
  let saveError = $state('');

  // ── Backfill State ──────────────────────────────────────────────────────────
  type StoreStatus = { 
    id: number; 
    name: string; 
    slug: string; 
    total: number; 
    tagged: number; 
    backfilling: boolean; 
    backfillDone: boolean;
    error: string;
  };
  let storeStatuses = $state<StoreStatus[]>([]);
  let isLoadingStatuses = $state(true);

  const PROVIDERS = [
    { id: 'claude', name: 'Claude', placeholder: 'claude-3-5-haiku-20241022' },
    { id: 'openai', name: 'OpenAI', placeholder: 'gpt-4o-mini' },
    { id: 'gemini', name: 'Gemini', placeholder: 'gemini-1.5-flash' },
  ];

  onMount(async () => {
    await loadSettings();
    await loadStoreStatuses();
  });

  async function loadSettings() {
    try {
      const [pRes, kRes, mRes] = await Promise.all([
        api('GET', '/api/settings/gateway_ai_provider'),
        api('GET', '/api/settings/gateway_ai_api_key'),
        api('GET', '/api/settings/gateway_ai_model'),
      ]);
      provider = pRes.value || 'claude';
      apiKeyHasValue = !!kRes.value;
      model = mRes.value || '';
    } catch (e) {
      console.error('Failed to load AI tagging settings', e);
    }
  }

  async function loadStoreStatuses() {
    isLoadingStatuses = true;
    // Map initial retailers
    storeStatuses = retailers.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      total: 0,
      tagged: 0,
      backfilling: false,
      backfillDone: false,
      error: ''
    }));

    // Fetch progress for each store (serial to avoid overwhelming server)
    for (let i = 0; i < storeStatuses.length; i++) {
      const s = storeStatuses[i];
      try {
        const res = await api('GET', `/api/retailers/${s.id}/catalog/ai-tags/status`);
        s.total = res.total;
        s.tagged = res.tagged;
      } catch (e) {
        console.error(`Failed to load status for ${s.slug}`, e);
      }
    }
    isLoadingStatuses = false;
  }

  async function saveConfig() {
    isSaving = true;
    savedMsg = '';
    saveError = '';

    try {
      await api('PUT', '/api/settings/gateway_ai_provider', { value: provider });
      await api('PUT', '/api/settings/gateway_ai_model', { value: model });

      if (apiKeyInput.trim()) {
        await api('PUT', '/api/settings/gateway_ai_api_key', { value: apiKeyInput.trim() });
        apiKeyHasValue = true;
        apiKeyInput = '';
      }

      savedMsg = 'AI Tagging settings saved successfully.';
      setTimeout(() => { if (savedMsg === 'AI Tagging settings saved successfully.') savedMsg = ''; }, 3000);
    } catch (e: any) {
      saveError = e.message || 'Failed to save settings.';
    } finally {
      isSaving = false;
    }
  }

  async function runBackfill(store: StoreStatus) {
    store.backfilling = true;
    store.error = '';
    
    try {
      await api('POST', `/api/retailers/${store.id}/catalog/backfill-ai-tags`);
      store.backfilling = false;
      store.backfillDone = true;
      
      // Refresh status after a short delay
      setTimeout(async () => {
        try {
          const res = await api('GET', `/api/retailers/${store.id}/catalog/ai-tags/status`);
          store.total = res.total;
          store.tagged = res.tagged;
        } catch {}
        store.backfillDone = false;
      }, 3000);
    } catch (e: any) {
      store.error = e.message || 'Backfill failed.';
      store.backfilling = false;
    }
  }
</script>

<div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
  
  <!-- Config Card -->
  <div class="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
    <div class="p-8 md:p-12">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900 leading-tight">AI Tagging Configuration</h2>
          <p class="text-gray-500 text-sm">Configure the platform AI provider used for semantic product tagging.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
        <!-- Left: Provider & Model -->
        <div class="space-y-6">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1" for="provider">
              AI Provider
            </label>
            <div class="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
              {#each PROVIDERS as p}
                <button
                  class="flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 {provider === p.id ? 'bg-white text-purple-600 shadow-md ring-1 ring-purple-100' : 'text-gray-400 hover:text-gray-600'}"
                  onclick={() => provider = p.id}
                >
                  {p.name}
                </button>
              {/each}
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1" for="model">
              AI Model
            </label>
            <input
              id="model"
              type="text"
              bind:value={model}
              placeholder={PROVIDERS.find(p => p.id === provider)?.placeholder}
              class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-gray-900 font-medium focus:outline-none focus:border-purple-200 focus:bg-white transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        <!-- Right: API Key -->
        <div class="space-y-6">
          <div>
            <div class="flex items-center justify-between mb-3 ml-1">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest" for="apiKey">
                Gateway API Key
              </label>
              {#if apiKeyHasValue}
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider ring-1 ring-green-200">
                  <Check size={10} strokeWidth={3} /> Configured
                </span>
              {:else}
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-wider ring-1 ring-orange-200">
                  Missing
                </span>
              {/if}
            </div>
            
            <div class="relative">
              <input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                bind:value={apiKeyInput}
                placeholder={apiKeyHasValue ? "••••••••••••••••••••••••" : "Paste your API key here..."}
                class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-6 pr-14 py-4 text-gray-900 font-medium focus:outline-none focus:border-purple-200 focus:bg-white transition-all placeholder:text-gray-300"
              />
              <button 
                type="button"
                onclick={() => showApiKey = !showApiKey}
                class="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-purple-600 transition-colors"
              >
                {#if showApiKey}<EyeOff size={20} />{:else}<Eye size={20} />{/if}
              </button>
            </div>
            <p class="mt-3 text-[11px] text-gray-400 leading-relaxed italic px-1">
              Note: This key is used globally for all stores. Individual retailers provide their own keys for customer AI chat.
            </p>
          </div>
        </div>
      </div>

      <div class="mt-10 pt-10 border-t border-gray-50 flex items-center justify-between">
        <div class="flex-1">
          {#if savedMsg}
            <p class="text-green-600 font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <Check size={18} strokeWidth={3} /> {savedMsg}
            </p>
          {:else if saveError}
            <p class="text-red-500 font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              ⚠️ {saveError}
            </p>
          {/if}
        </div>
        <button
          onclick={saveConfig}
          disabled={isSaving}
          class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 text-white font-bold px-10 py-4 rounded-2xl shadow-lg shadow-purple-200 transition-all duration-300 transform active:scale-95 flex items-center gap-3"
        >
          {#if isSaving}
            <Loader2 size={20} class="animate-spin" />
            Saving...
          {:else}
            Save Configuration
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Backfill Card -->
  <div class="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
    <div class="p-8 md:p-12">
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 leading-tight">Store Backfill Status</h2>
          <p class="text-gray-500 text-sm">Monitor tagging progress and trigger manual backfills for each store.</p>
        </div>
        <button 
          onclick={loadStoreStatuses} 
          class="p-3 text-gray-400 hover:text-purple-600 bg-gray-50 rounded-xl transition-all"
          title="Refresh Statuses"
        >
          <Loader2 size={20} class={isLoadingStatuses ? 'animate-spin' : ''} />
        </button>
      </div>

      <div class="overflow-x-auto -mx-2">
        <table class="w-full border-separate border-spacing-y-4">
          <thead>
            <tr class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">
              <th class="px-4 pb-2">Store Details</th>
              <th class="px-4 pb-2 text-center">Progress</th>
              <th class="px-4 pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each storeStatuses as s (s.id)}
              <tr class="group">
                <td class="bg-gray-50/50 rounded-l-2xl px-6 py-5">
                  <div class="font-bold text-gray-900">{s.name}</div>
                  <div class="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{s.slug}</div>
                </td>
                <td class="bg-gray-50/50 px-6 py-5 min-w-[200px]">
                  {#if s.total > 0}
                    {@const percent = Math.round((s.tagged / s.total) * 100)}
                    <div class="space-y-2">
                      <div class="flex justify-between text-[11px] font-black text-gray-500">
                        <span>{s.tagged} / {s.total} tagged</span>
                        <span>{percent}%</span>
                      </div>
                      <div class="h-2.5 bg-gray-200 rounded-full overflow-hidden flex ring-1 ring-white">
                        <div 
                          class="h-full bg-purple-500 transition-all duration-1000 ease-out" 
                          style="width: {percent}%"
                        ></div>
                      </div>
                    </div>
                  {:else}
                    <div class="text-center italic text-gray-400 text-xs">No products synced yet</div>
                  {/if}
                </td>
                <td class="bg-gray-50/50 rounded-r-2xl px-6 py-5 text-right">
                  <button
                    onclick={() => runBackfill(s)}
                    disabled={s.backfilling || s.backfillDone || s.total === 0 || !apiKeyHasValue}
                    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform active:scale-95
                      {s.backfillDone ? 'bg-green-500 text-white' : 
                       s.backfilling ? 'bg-purple-100 text-purple-600' :
                       (s.total === 0 || !apiKeyHasValue) ? 'bg-gray-100 text-gray-300 grayscale' :
                       'bg-white text-purple-600 shadow-sm border border-purple-100 hover:bg-purple-600 hover:text-white hover:shadow-purple-100'}"
                  >
                    {#if s.backfilling}
                      <Loader2 size={14} class="animate-spin" /> Queuing...
                    {:else if s.backfillDone}
                      <Check size={14} strokeWidth={3} /> Queued!
                    {:else}
                      Run Backfill
                    {/if}
                  </button>
                  {#if s.error}
                    <p class="text-[10px] text-red-500 mt-1 font-bold">{s.error}</p>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if !apiKeyHasValue}
        <div class="mt-8 flex items-start gap-4 p-6 bg-orange-50 rounded-3xl border border-orange-100">
          <div class="text-orange-500 mt-0.5"><Info size={20} /></div>
          <div>
            <h4 class="font-bold text-orange-900 text-sm">AI Configuration Required</h4>
            <p class="text-orange-700 text-xs leading-relaxed mt-1">
              You must configure and save an AI Provider and API Key above before you can trigger product tagging.
            </p>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
