<script lang="ts">
  import { onMount } from "svelte";
  import {
    Loader2,
    Key,
    Settings,
    Users,
    ShieldCheck,
    ShieldAlert,
    LogOut,
    CheckCircle2,
    RotateCw,
    AlertTriangle,
    Eye,
    EyeOff,
  } from "lucide-svelte";

  // --- Auth & State ---
  let isLoggedIn = $state(false);
  let token = $state<string | null>(null);

  // Login Form
  let lUser = $state("");
  let lPass = $state("");
  let showPass = $state(false);
  let isLoggingIn = $state(false);
  let loginError = $state("");

  // Dashboard State
  let currentTab = $state<"pending" | "verified" | "all" | "settings">(
    "pending",
  );
  let retailers = $state<any[]>([]);
  let isLoadingRetailers = $state(false);

  // Issued Key Banner
  let issuedKey = $state("");
  let showKeyBanner = $state(false);

  // Settings
  let tgToken = $state("");
  let showTgToken = $state(false);
  let tgTokenHasValue = $state(false);
  let isSavingSettings = $state(false);
  let settingsSavedMsg = $state("");
  let settingsError = $state("");

  // Toast
  let toastMsg = $state("");
  let toastType = $state<"success" | "error">("success");
  let toastTimeout: any;

  // Confirm Dialog
  let isConfirmOpen = $state(false);
  let confirmTitle = $state("");
  let confirmDesc = $state("");
  let onConfirmFn = $state<(() => Promise<void>) | null>(null);
  let isConfirming = $state(false);

  function requireConfirm(
    title: string,
    desc: string,
    fn: () => Promise<void>,
  ) {
    confirmTitle = title;
    confirmDesc = desc;
    onConfirmFn = fn;
    isConfirmOpen = true;
  }

  async function handleConfirm() {
    if (!onConfirmFn) return;
    isConfirming = true;
    try {
      await onConfirmFn();
    } finally {
      isConfirming = false;
      isConfirmOpen = false;
      onConfirmFn = null;
    }
  }

  onMount(() => {
    token = localStorage.getItem("gw_token");
    if (token) {
      isLoggedIn = true;
      loadRetailers();
    }
  });

  function showToast(msg: string, type: "success" | "error" = "success") {
    toastMsg = msg;
    toastType = type;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastMsg = "";
    }, 3500);
  }

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async function api(method: string, path: string, body?: any) {
    const res = await fetch(path, {
      method,
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) {
      logout();
      return null;
    }
    if (res.status === 204) return null;
    return res.json();
  }

  // --- Actions ---

  async function handleLogin(e: Event) {
    e.preventDefault();
    loginError = "";
    isLoggingIn = true;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: lUser, password: lPass }),
      });
      if (!res.ok) throw new Error("Invalid credentials.");
      const data = await res.json();
      token = data.access_token;
      localStorage.setItem("gw_token", token as string);
      isLoggedIn = true;
      loadRetailers();
    } catch (err: any) {
      loginError = err.message || "Login failed";
    } finally {
      isLoggingIn = false;
    }
  }

  function logout() {
    localStorage.removeItem("gw_token");
    token = null;
    isLoggedIn = false;
  }

  // --- Retailers ---

  async function loadRetailers() {
    isLoadingRetailers = true;
    const all = await api("GET", "/api/retailers");
    isLoadingRetailers = false;
    if (all) retailers = all;
  }

  let filteredRetailers = $derived(
    retailers.filter((r) => {
      if (currentTab === "pending") return !r.verified;
      if (currentTab === "verified") return r.verified;
      return true;
    }),
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
      },
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
      },
    );
  }

  async function toggleActive(id: number, active: boolean) {
    await api("PATCH", `/api/retailers/${id}`, { active });
    showToast(active ? "Retailer reactivated." : "Retailer suspended.");
    loadRetailers();
  }

  function copyKey() {
    navigator.clipboard
      .writeText(issuedKey)
      .then(() => showToast("Key copied to clipboard."));
  }

  // --- Settings ---

  async function loadSettings() {
    settingsSavedMsg = "";
    settingsError = "";
    const tg = await api("GET", "/api/settings/telegram_bot_token");
    if (tg && tg.value) {
      tgTokenHasValue = true;
    } else {
      tgTokenHasValue = false;
    }
  }

  function switchTab(tab: "pending" | "verified" | "all" | "settings") {
    currentTab = tab;
    showKeyBanner = false;
    if (tab === "settings") {
      loadSettings();
    } else {
      loadRetailers();
    }
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
    } catch (err: any) {
      settingsError = err.message ?? "Save failed";
    } finally {
      isSavingSettings = false;
    }
  }
</script>

<!-- Global Toast -->
{#if toastMsg}
  <div
    class="fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-medium text-white {toastType ===
    'success'
      ? 'bg-emerald-600'
      : 'bg-red-600'} transition-opacity animate-in fade-in slide-in-from-bottom-4"
  >
    {toastMsg}
  </div>
{/if}

{#if !isLoggedIn}
  <!-- LOGIN SCREEN -->
  <div class="min-h-screen flex items-center justify-center p-6 text-gray-100">
    <div
      class="max-w-md w-full bg-[#1c1e26] border border-gray-800 rounded-2xl p-8 shadow-2xl"
    >
      <div class="flex flex-col items-center justify-center gap-3 mb-2">
        <img src="/logo-w.png" alt="Logo" class="w-10 h-10" />
        <div
          class="flex items-center justify-center gap-3 mb-2 font-bold text-xl"
        >
          Prompt Commerce
        </div>
        <div class="text-center text-gray-400 mb-8 text-sm">Gateway Admin</div>
      </div>
      {#if loginError}
        <div
          class="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-6"
        >
          {loginError}
        </div>
      {/if}

      <form onsubmit={handleLogin} class="space-y-5">
        <div>
          <label
            for="lUser"
            class="block text-sm font-medium text-gray-300 mb-1">Username</label
          >
          <input
            id="lUser"
            type="text"
            bind:value={lUser}
            placeholder="admin"
            required
            class="w-full bg-[#0b0c10] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
        <div>
          <label
            for="lPass"
            class="block text-sm font-medium text-gray-300 mb-1">Password</label
          >
          <div class="relative">
            <input
              id="lPass"
              type={showPass ? "text" : "password"}
              bind:value={lPass}
              placeholder="••••••••"
              required
              class="w-full bg-[#0b0c10] border border-gray-700 rounded-lg px-4 py-2.5 pr-12 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              onclick={() => (showPass = !showPass)}
            >
              {#if showPass}
                <EyeOff size={18} />
              {:else}
                <Eye size={18} />
              {/if}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoggingIn}
          class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {#if isLoggingIn}
            <Loader2 class="w-5 h-5 animate-spin" /> Signing in...
          {:else}
            Sign in
          {/if}
        </button>
      </form>
    </div>
  </div>
{:else}
  <!-- ADMIN DASHBOARD -->
  <div
    class="min-h-screen bg-[#0b0c10] text-gray-100 flex h-screen overflow-hidden"
  >
    <!-- Sidebar -->
    <aside
      class="w-64 bg-[#14161c] border-r border-gray-800 flex flex-col shrink-0 text-sm"
    >
      <div
        class="h-16 flex items-center px-6 border-b border-gray-800 text-white font-semibold gap-3 shrink-0"
      >
        <img src="/logo-w.png" alt="Logo" class="w-10 h-10" />
        <span class="pt-2">Gateway Admin</span>
      </div>

      <div class="p-4 flex flex-col gap-1 overflow-y-auto">
        <button
          onclick={() => switchTab("pending")}
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors {currentTab ===
          'pending'
            ? 'bg-blue-600/10 text-blue-400 font-medium'
            : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}"
        >
          <ShieldAlert size={18} /> Pending
        </button>
        <button
          onclick={() => switchTab("verified")}
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors {currentTab ===
          'verified'
            ? 'bg-blue-600/10 text-blue-400 font-medium'
            : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}"
        >
          <ShieldCheck size={18} /> Verified
        </button>
        <button
          onclick={() => switchTab("all")}
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors {currentTab ===
          'all'
            ? 'bg-blue-600/10 text-blue-400 font-medium'
            : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}"
        >
          <Users size={18} /> All Retailers
        </button>
        <button
          onclick={() => switchTab("settings")}
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors {currentTab ===
          'settings'
            ? 'bg-blue-600/10 text-blue-400 font-medium'
            : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}"
        >
          <Settings size={18} /> Settings
        </button>
      </div>

      <div class="mt-auto p-4 border-t border-gray-800">
        <button
          onclick={logout}
          class="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
        >
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-8">
      <h1 class="text-2xl font-bold text-white mb-8">
        {currentTab === "pending"
          ? "Pending Verification"
          : currentTab === "verified"
            ? "Verified Retailers"
            : currentTab === "all"
              ? "All Retailers"
              : "Settings"}
      </h1>

      {#if currentTab === "settings"}
        <!-- Settings Panel -->
        <div
          class="max-w-2xl bg-[#1c1e26] border border-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div class="flex flex-col gap-6">
            <div>
              <h2 class="text-lg font-semibold text-white mb-1">
                Gateway Settings
              </h2>
              <p class="text-sm text-gray-400 mb-6">
                Global settings for this gateway instance. These apply to all
                stores.
              </p>

              <div class="mb-6 border-b border-gray-800 pb-6">
                <div class="flex justify-between items-center mb-4">
                  <div class="font-medium text-white flex items-center gap-2">
                    <svg
                      class="w-5 h-5 text-blue-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"
                      />
                    </svg>
                    Telegram Bot
                  </div>
                  {#if tgTokenHasValue}
                    <span
                      class="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md"
                      >Token Configured</span
                    >
                  {:else}
                    <span
                      class="text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-1 rounded-md"
                      >Not Set</span
                    >
                  {/if}
                </div>

                <div class="relative">
                  <input
                    type={showTgToken ? "text" : "password"}
                    bind:value={tgToken}
                    placeholder={tgTokenHasValue
                      ? "Paste new token to replace…"
                      : "123456:ABC-DEF…"}
                    class="w-full bg-[#0b0c10] border border-gray-700 rounded-lg px-4 py-2.5 pr-12 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    onclick={() => (showTgToken = !showTgToken)}
                  >
                    {#if showTgToken}
                      <EyeOff size={18} />
                    {:else}
                      <Eye size={18} />
                    {/if}
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  Get this from <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    class="text-blue-400 hover:underline">@BotFather</a
                  > on Telegram. Leave blank to keep existing.
                </p>
              </div>

              {#if settingsSavedMsg}
                <div
                  class="text-emerald-400 text-sm font-medium mb-4 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  {settingsSavedMsg}
                </div>
              {/if}

              {#if settingsError}
                <div
                  class="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-4"
                >
                  {settingsError}
                </div>
              {/if}

              <button
                onclick={saveSettings}
                disabled={isSavingSettings}
                class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center gap-2 text-sm"
              >
                {#if isSavingSettings}
                  <Loader2 class="w-4 h-4 animate-spin" /> Saving...
                {:else}
                  Save Settings
                {/if}
              </button>
            </div>
          </div>
        </div>
      {:else}
        <!-- Retailers Panel -->
        {#if showKeyBanner}
          <div
            class="mb-8 border border-emerald-500/30 bg-emerald-500/10 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div
                class="text-emerald-400 font-semibold mb-1 flex items-center gap-2"
              >
                <CheckCircle2 size={18} /> Platform Key Issued
              </div>
              <p class="text-sm text-emerald-400/80 mb-3">
                Share this key with the retailer. It will <strong
                  class="text-emerald-300">not</strong
                > be shown again.
              </p>
              <div
                class="font-mono bg-black/40 text-emerald-300 px-4 py-2.5 rounded-lg text-sm border border-emerald-500/20 inline-block overflow-x-auto max-w-full"
              >
                {issuedKey}
              </div>
            </div>
            <button
              onclick={copyKey}
              class="shrink-0 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 py-2 px-4 rounded-lg font-medium transition-colors text-sm self-start sm:self-auto border border-emerald-500/30"
            >
              Copy Key
            </button>
          </div>
        {/if}

        <div
          class="bg-[#1c1e26] border border-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead
                class="text-xs uppercase bg-[#14161c] text-gray-400 border-b border-gray-800"
              >
                <tr>
                  <th class="px-5 py-4 font-medium tracking-wider">Store</th>
                  <th class="px-5 py-4 font-medium tracking-wider">MCP URL</th>
                  <th class="px-5 py-4 font-medium tracking-wider">Email</th>
                  <th class="px-5 py-4 font-medium tracking-wider text-center"
                    >Permit</th
                  >
                  <th class="px-5 py-4 font-medium tracking-wider">Status</th>
                  <th class="px-5 py-4 font-medium tracking-wider">Key</th>
                  <th class="px-5 py-4 font-medium tracking-wider text-right"
                    >Actions</th
                  >
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800">
                {#if isLoadingRetailers}
                  <tr>
                    <td
                      colspan="7"
                      class="px-5 py-12 text-center text-gray-500"
                    >
                      <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading retailers...
                    </td>
                  </tr>
                {:else if filteredRetailers.length === 0}
                  <tr>
                    <td
                      colspan="7"
                      class="px-5 py-12 text-center text-gray-500"
                    >
                      No retailers found in this category.
                    </td>
                  </tr>
                {:else}
                  {#each filteredRetailers as r}
                    <tr class="hover:bg-gray-800/30 transition-colors">
                      <td class="px-5 py-4">
                        <div class="text-white font-medium mb-0.5">
                          {r.name}
                        </div>
                        <div class="text-gray-500 text-xs">{r.slug}</div>
                      </td>
                      <td
                        class="px-5 py-4 text-gray-400 max-w-xs truncate"
                        title={r.mcpServerUrl}>{r.mcpServerUrl}</td
                      >
                      <td class="px-5 py-4 text-gray-300">{r.contactEmail}</td>
                      <td class="px-5 py-4 text-center">
                        {#if r.businessPermitUrl}
                          <a
                            href={`/${r.businessPermitUrl}`}
                            target="_blank"
                            class="inline-flex text-blue-400 hover:text-blue-300 text-xs font-medium bg-blue-400/10 px-2 py-1 rounded"
                            >View Permit</a
                          >
                        {:else}
                          <span class="text-gray-600">—</span>
                        {/if}
                      </td>
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-2 flex-wrap">
                          {#if r.verified}
                            <span
                              class="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md border border-emerald-400/20"
                              >Verified</span
                            >
                            {#if !r.active}
                              <span
                                class="text-xs font-semibold text-red-400 bg-red-400/10 px-2.5 py-1 rounded-md border border-red-400/20"
                                >Suspended</span
                              >
                            {/if}
                          {:else}
                            <span
                              class="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20"
                              >Pending</span
                            >
                          {/if}
                        </div>
                      </td>
                      <td class="px-5 py-4">
                        {#if r.platformKey && !r.platformKey.revokedAt}
                          <div
                            class="flex items-center gap-1.5 text-xs text-emerald-400 font-medium whitespace-nowrap"
                          >
                            <Key size={14} /> Active
                          </div>
                        {:else}
                          <div
                            class="flex items-center gap-1.5 text-xs text-gray-600 font-medium whitespace-nowrap"
                          >
                            <AlertTriangle size={14} /> None
                          </div>
                        {/if}
                      </td>
                      <td class="px-5 py-4 text-right">
                        <div
                          class="flex items-center justify-end gap-2 flex-wrap min-w-[140px]"
                        >
                          {#if !r.verified}
                            <button
                              onclick={() => verifyStore(r.id)}
                              class="text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors"
                            >
                              Verify
                            </button>
                          {/if}

                          <button
                            onclick={() => issueKey(r.id)}
                            class="text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 border border-gray-700"
                          >
                            {#if r.platformKey && !r.platformKey.revokedAt}
                              <RotateCw size={12} /> Rotate
                            {:else}
                              <Key size={12} /> Issue Key
                            {/if}
                          </button>

                          {#if r.verified}
                            {#if r.active}
                              <button
                                onclick={() => toggleActive(r.id, false)}
                                class="text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded transition-colors border border-red-500/20"
                              >
                                Suspend
                              </button>
                            {:else}
                              <button
                                onclick={() => toggleActive(r.id, true)}
                                class="text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded transition-colors border border-emerald-500/20"
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
      {/if}
    </main>
  </div>
{/if}

<!-- CONFIRM DIALOG -->
{#if isConfirmOpen}
  <div
    class="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-0 text-gray-100"
  >
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onclick={() => !isConfirming && (isConfirmOpen = false)}
      aria-hidden="true"
    ></div>

    <div
      class="relative bg-[#1c1e26] border border-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 fade-in duration-200"
    >
      <h2 class="text-lg font-semibold text-white mb-2">{confirmTitle}</h2>
      <p class="text-sm text-gray-400 mb-6">{confirmDesc}</p>

      <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          disabled={isConfirming}
          onclick={() => (isConfirmOpen = false)}
          class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isConfirming}
          onclick={handleConfirm}
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {#if isConfirming}
            <Loader2 class="w-4 h-4 animate-spin" /> Confirming...
          {:else}
            Confirm
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
