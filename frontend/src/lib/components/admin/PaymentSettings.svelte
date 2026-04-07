<script lang="ts">
  import { CreditCard, CheckCircle2, AlertTriangle, Loader2 } from "lucide-svelte";
  import { onMount } from "svelte";
  import type { ApiFunction } from "$shared/types";

  let { api } = $props<{
    api: ApiFunction;
  }>();

  let defaultPaymentProvider = $state("cod");
  let defaultPaymentInstructions = $state("");
  let defaultPaymentLinkTemplate = $state("");
  let defaultPaymentLabel = $state("Assisted Payment");
  let isSavingPayments = $state(false);
  let paymentsSavedMsg = $state("");
  let paymentsError = $state("");

  async function loadPaymentSettings() {
    paymentsSavedMsg = "";
    paymentsError = "";
    const [provider, instructions, template, label] = await Promise.all([
      api("GET", "/api/settings/default_payment_provider"),
      api("GET", "/api/settings/default_payment_instructions"),
      api("GET", "/api/settings/default_payment_link_template"),
      api("GET", "/api/settings/default_payment_label"),
    ]);

    if (provider?.value) defaultPaymentProvider = provider.value;
    if (instructions?.value) defaultPaymentInstructions = instructions.value;
    if (template?.value) defaultPaymentLinkTemplate = template.value;
    if (label?.value) defaultPaymentLabel = label.value;
  }

  async function savePaymentSettings() {
    paymentsSavedMsg = "";
    paymentsError = "";
    isSavingPayments = true;

    try {
      await Promise.all([
        api("PUT", "/api/settings/default_payment_provider", {
          value: defaultPaymentProvider,
        }),
        api("PUT", "/api/settings/default_payment_instructions", {
          value: defaultPaymentInstructions,
        }),
        api("PUT", "/api/settings/default_payment_link_template", {
          value: defaultPaymentLinkTemplate,
        }),
        api("PUT", "/api/settings/default_payment_label", {
          value: defaultPaymentLabel,
        }),
      ]);
      paymentsSavedMsg = "Payment settings saved.";
      setTimeout(() => {
        paymentsSavedMsg = "";
      }, 4000);
    } catch (err: unknown) {
      paymentsError = err instanceof Error ? err.message : "Save failed";
    } finally {
      isSavingPayments = false;
    }
  }

  onMount(() => {
    loadPaymentSettings();
  });
</script>

<div class="max-w-2xl bg-white border border-gray-200 rounded-[2.5rem] p-10 md:p-14 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
  <div class="absolute -top-20 -right-20 w-64 h-64 bg-emerald-50/50 blur-3xl rounded-full pointer-events-none"></div>

  <div class="relative z-10 flex flex-col gap-10">
    <div>
      <div class="flex items-center gap-4 mb-8">
        <div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
          <CreditCard size={28} strokeWidth={2.5} />
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">Default Payment Settings</h2>
          <p class="text-gray-400 font-medium text-sm mt-0.5">Fallbacks for stores with no payment config</p>
        </div>
      </div>

      <div class="space-y-8">
        <div>
          <span class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3 ml-1">Default Provider</span>
          <div class="grid grid-cols-2 gap-3">
            {#each [["mock", "📦 Mock"], ["cod", "💵 COD"], ["assisted", "🤝 Assisted"]] as [pid, label]}
              <button
                onclick={() => (defaultPaymentProvider = pid)}
                class="rounded-2xl border-2 px-6 py-4 text-sm font-black transition-all
                  {defaultPaymentProvider === pid
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/10'
                  : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}"
              >{label}</button>
            {/each}
          </div>
        </div>

        {#if defaultPaymentProvider === "assisted"}
          <div class="p-8 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-6">
            <div>
              <label for="assisted-label" class="block text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] mb-3 ml-1">Assisted Label</label>
              <input
                id="assisted-label"
                type="text"
                bind:value={defaultPaymentLabel}
                placeholder="e.g. Bank Transfer"
                class="w-full bg-white border border-blue-100 rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label for="default-instructions" class="block text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] mb-3 ml-1">Default Instructions</label>
              <textarea
                id="default-instructions"
                bind:value={defaultPaymentInstructions}
                rows="3"
                placeholder="Instructions shown to the buyer..."
                class="w-full bg-white border border-blue-100 rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-300 shadow-sm"
              ></textarea>
            </div>
            <div>
              <label for="default-link-template" class="block text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] mb-3 ml-1">Default Link Template</label>
              <input
                id="default-link-template"
                type="text"
                bind:value={defaultPaymentLinkTemplate}
                placeholder="https://pay.me/..."
                class="w-full bg-white border border-blue-100 rounded-2xl px-6 py-4 text-gray-900 font-mono text-sm font-bold focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-300 shadow-sm"
              />
            </div>
          </div>
        {/if}
      </div>

      {#if paymentsSavedMsg}
        <div class="text-emerald-700 text-sm font-black mt-8 flex items-center gap-3 bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 animate-in zoom-in-95">
          <CheckCircle2 size={18} />
          {paymentsSavedMsg}
        </div>
      {/if}

      {#if paymentsError}
        <div class="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-black mt-8 flex items-center gap-3">
          <AlertTriangle size={18} />
          {paymentsError}
        </div>
      {/if}

      <button
        onclick={savePaymentSettings}
        disabled={isSavingPayments}
        class="w-full bg-gray-900 hover:bg-black text-white py-6 px-8 rounded-3xl font-black text-xl transition-all shadow-2xl active:scale-95 disabled:opacity-70 flex items-center justify-center gap-4 mt-10"
      >
        {#if isSavingPayments}
          <Loader2 class="w-7 h-7 animate-spin px-1" />
          <span>Saving Changes...</span>
        {:else}
          Save Payment Settings
        {/if}
      </button>
    </div>
  </div>
</div>
