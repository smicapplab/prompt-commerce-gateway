<script lang="ts">
  import { Key, Loader2, Users, Globe, Mail, ExternalLink, AlertTriangle, RotateCw } from "lucide-svelte";
  import type { Retailer, ApiFunction } from "$shared/types";

  let { retailers, isLoadingRetailers, currentTab, api, loadRetailers, requireConfirm, showToast } = $props<{
    retailers: Retailer[];
    isLoadingRetailers: boolean;
    currentTab: string;
    api: ApiFunction;
    loadRetailers: () => Promise<void>;
    requireConfirm: (title: string, desc: string, fn: () => Promise<void>) => void;
    showToast: (msg: string, type?: "success" | "error") => void;
  }>();

  let issuedKey = $state("");
  let showKeyBanner = $state(false);

  let filteredRetailers = $derived(
    retailers.filter((r: Retailer) => {
      if (currentTab === "pending") return !r.verified;
      if (currentTab === "verified") return r.verified;
      return true;
    })
  );

  function verifyStore(id: number) {
    requireConfirm(
      "Verify Retailer",
      "Are you sure you want to verify this store? A platform key will be automatically issued.",
      async () => {
        await api("PATCH", `/api/retailers/${id}`, { verified: true });
        showToast("Retailer verified. Key auto-issued.");
        showKeyBanner = false;
        loadRetailers();
      }
    );
  }

  function issueKey(id: number) {
    requireConfirm(
      "Issue Platform Key",
      "Are you sure you want to issue or rotate the platform key for this retailer? Previous keys will become invalid.",
      async () => {
        const data = await api("POST", `/api/retailers/${id}/keys/issue`);
        if (!data) return;
        issuedKey = data.platform_key;
        showKeyBanner = true;
        showToast("Platform key issued.");
        loadRetailers();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    );
  }

  async function toggleActive(id: number, active: boolean) {
    await api("PATCH", `/api/retailers/${id}`, { active });
    showToast(active ? "Retailer reactivated." : "Retailer suspended.");
    loadRetailers();
  }

  function copyKey() {
    navigator.clipboard.writeText(issuedKey).then(() => showToast("Key copied to clipboard."));
  }
</script>

<div class="space-y-10 relative z-10">
  {#if showKeyBanner}
    <div
      class="border border-emerald-200 bg-emerald-50 rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-200/50 flex flex-col md:flex-row md:items-center justify-between gap-10 animate-in slide-in-from-top-4 duration-500"
    >
      <div class="flex-1">
        <div class="text-emerald-800 font-black text-2xl mb-3 flex items-center gap-3 tracking-tight leading-none">
          <div class="bg-emerald-600 text-white p-2 rounded-xl shadow-lg shadow-emerald-600/30">
            <Key size={24} />
          </div>
          Platform Key Issued
        </div>
        <p class="text-emerald-700/80 font-bold text-sm mb-6 leading-relaxed">
          Share this key with the retailer. It will <strong class="text-emerald-900 font-black">not</strong> be shown again.
        </p>
        <div class="font-mono bg-white text-emerald-900 px-8 py-5 rounded-2xl text-sm font-black border border-emerald-200 shadow-inner break-all">
          {issuedKey}
        </div>
      </div>
      <button
        onclick={copyKey}
        class="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white py-6 px-10 rounded-[1.5rem] font-black text-xl transition-all shadow-2xl active:scale-95 flex items-center gap-3"
      >
        Copy Secure Key
      </button>
    </div>
  {/if}

  <div class="bg-white border border-gray-200 rounded-[3rem] shadow-2xl shadow-gray-200/50 overflow-hidden relative">
    <div class="overflow-x-auto custom-scrollbar">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/50 border-b border-gray-100">
            <th class="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Retailer Detail</th>
            <th class="px-8 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Endpoint</th>
            <th class="px-8 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Status</th>
            <th class="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          {#if isLoadingRetailers}
            <tr>
              <td colspan="4" class="px-10 py-32 text-center text-gray-400">
                <Loader2 class="w-12 h-12 animate-spin mx-auto mb-6 text-blue-600" />
                <span class="font-bold text-sm">Retreiving regional retail registry...</span>
              </td>
            </tr>
          {:else if filteredRetailers.length === 0}
            <tr>
              <td colspan="4" class="px-10 py-32 text-center text-gray-400">
                <div class="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-200">
                  <Users size={40} />
                </div>
                <h3 class="text-xl font-black text-gray-900 mb-2">Registry is empty</h3>
                <p class="font-medium">No retailers found in this category.</p>
              </td>
            </tr>
          {:else}
            {#each filteredRetailers as r}
              <tr class="group hover:bg-gray-50/50 transition-colors">
                <td class="px-10 py-10">
                  <div class="flex items-center gap-6">
                    <div class="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-2xl font-black shadow-lg transform -rotate-1 group-hover:rotate-0 transition-transform">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div class="text-gray-900 font-black text-xl tracking-tight mb-1 group-hover:text-blue-600 transition-colors">
                        {r.name}
                      </div>
                      <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                          <Globe size={12} />
                          {r.slug}
                        </div>
                        <div class="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                          <Mail size={12} />
                          {r.contactEmail}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-10">
                  <div class="flex flex-col gap-2">
                    <span
                      class="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-xl text-xs font-black truncate max-w-[200px] inline-block font-mono border border-gray-100 group-hover:bg-white transition-colors"
                      title={r.mcpServerUrl}
                    >
                      {r.mcpServerUrl}
                    </span>
                    {#if r.businessPermitUrl}
                      <a
                        href={`/${r.businessPermitUrl}`}
                        target="_blank"
                        class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-widest pl-1"
                      >
                        <ExternalLink size={12} /> Permit PDF
                      </a>
                    {/if}
                  </div>
                </td>
                <td class="px-8 py-10">
                  <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2">
                      {#if r.verified}
                        <span class="text-[9px] font-black text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                          <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          Verified
                        </span>
                      {:else}
                        <span class="text-[9px] font-black text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                          <div class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                          Review
                        </span>
                      {/if}
                    </div>
                    <div class="flex items-center gap-2">
                      {#if r.platformKey && !r.platformKey.revokedAt}
                        <span class="text-[9px] font-black text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 border border-gray-100">
                          <Key size={10} /> Key Active
                        </span>
                      {:else}
                        <span class="text-[9px] font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 border border-red-50">
                          <AlertTriangle size={10} /> No Key
                        </span>
                      {/if}
                    </div>
                  </div>
                </td>
                <td class="px-10 py-10 text-right">
                  <div class="flex items-center justify-end gap-3 flex-wrap">
                    {#if !r.verified}
                      <button
                        onclick={() => verifyStore(r.id)}
                        class="text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95"
                      >
                        Verify
                      </button>
                    {/if}

                    <button
                      onclick={() => issueKey(r.id)}
                      class="text-xs font-black bg-white border border-gray-200 hover:border-gray-900 text-gray-900 px-6 py-3 rounded-2xl transition-all shadow-sm active:scale-95 flex items-center gap-2.5"
                    >
                      {#if r.platformKey && !r.platformKey.revokedAt}
                        <RotateCw size={14} strokeWidth={2.5} /> Rotate
                      {:else}
                        <Key size={14} strokeWidth={2.5} /> Issue Key
                      {/if}
                    </button>

                    {#if r.verified}
                      {#if r.active}
                        <button
                          onclick={() => toggleActive(r.id, false)}
                          class="text-xs font-black bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-2xl transition-all border border-red-100 active:scale-95"
                        >
                          Suspend
                        </button>
                      {:else}
                        <button
                          onclick={() => toggleActive(r.id, true)}
                          class="text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95"
                        >
                          Reactivate
                        </button>
                      {/if}
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>
