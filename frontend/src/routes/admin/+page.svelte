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
    Lock,
    Shield,
    ArrowRight,
    ExternalLink,
    Mail,
    Globe,
    Info,
    MessageSquare,
    X,
  } from "lucide-svelte";
  import Header from "$lib/components/Header.svelte";

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
  let currentTab = $state<"pending" | "verified" | "all" | "chat" | "settings">(
    "pending",
  );
  let retailers = $state<any[]>([]);
  let isLoadingRetailers = $state(false);

  // Chat Log State
  let conversations = $state<any[]>([]);
  let isLoadingConversations = $state(false);
  let selectedConv = $state<any | null>(null);
  let convMessages = $state<any[]>([]);
  let isLoadingMessages = $state(false);
  let chatStoreFilter = $state("");
  let chatNewMessage = $state("");
  let isSendingChatMessage = $state(false);
  let chatPollingInterval: any;

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

  async function loadConversations() {
    isLoadingConversations = true;
    const params = new URLSearchParams();
    if (chatStoreFilter) params.append("store", chatStoreFilter);
    const data = await api("GET", `/api/chat/conversations?${params}`);
    isLoadingConversations = false;
    if (data) conversations = data.conversations;
  }

  async function loadMessages(id: number) {
    isLoadingMessages = true;
    const data = await api("GET", `/api/chat/conversations/${id}/messages`);
    isLoadingMessages = false;
    if (data) convMessages = data;
  }

  function startChatPolling() {
    clearInterval(chatPollingInterval);
    chatPollingInterval = setInterval(async () => {
      if (selectedConv && currentTab === "chat") {
        const data = await api(
          "GET",
          `/api/chat/conversations/${selectedConv.id}/messages`,
        );
        if (data && data.length !== convMessages.length) {
          convMessages = data;
        }
      } else {
        clearInterval(chatPollingInterval);
      }
    }, 5000);
  }

  async function selectConversation(conv: any) {
    selectedConv = conv;
    await loadMessages(conv.id);
    startChatPolling();
  }

  async function sendChatMessage() {
    if (!selectedConv || !chatNewMessage.trim() || isSendingChatMessage) return;
    const body = chatNewMessage.trim();
    chatNewMessage = "";
    isSendingChatMessage = true;
    try {
      const data = await api(
        "POST",
        `/api/chat/conversations/${selectedConv.id}/messages`,
        {
          body,
          senderName: "Platform Admin",
        },
      );
      if (data) {
        await loadMessages(selectedConv.id);
      }
    } catch (err) {
      showToast("Failed to send message", "error");
    } finally {
      isSendingChatMessage = false;
    }
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

  function switchTab(tab: "pending" | "verified" | "all" | "chat" | "settings") {
    currentTab = tab;
    showKeyBanner = false;
    clearInterval(chatPollingInterval);
    if (tab === "settings") {
      loadSettings();
    } else if (tab === "chat") {
      loadConversations();
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

<svelte:head>
  <title>Admin Portal - Prompt Commerce</title>
</svelte:head>

<Header />

{#if !isLoggedIn}
  <!-- LOGIN SCREEN -->
  <div
    class="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans relative overflow-hidden"
  >
    <!-- Decoration -->
    <div
      class="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/50 blur-3xl rounded-full"
    ></div>
    <div
      class="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-50/50 blur-3xl rounded-full"
    ></div>

    <div class="max-w-md w-full relative z-10">
      <div
        class="bg-white border border-gray-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-gray-200/50"
      >
        <div class="flex flex-col items-center gap-6 mb-12 text-center">
          <div
            class="w-20 h-20 bg-gray-900 rounded-[2rem] flex items-center justify-center shadow-2xl transform -rotate-6 transition-transform hover:rotate-0 duration-500"
          >
            <Lock size={40} class="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1
              class="text-4xl font-black text-gray-900 tracking-tight leading-tight"
            >
              Admin Portal
            </h1>
            <p class="text-gray-500 font-medium text-lg mt-2">
              Manage your AI retail network
            </p>
          </div>
        </div>

        {#if loginError}
          <div
            class="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-black mb-8 flex items-center gap-4"
          >
            <div class="w-3 h-3 rounded-full bg-red-600 animate-pulse"></div>
            {loginError}
          </div>
        {/if}

        <form onsubmit={handleLogin} class="space-y-6">
          <div>
            <label
              for="lUser"
              class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3 ml-1"
              >Username</label
            >
            <input
              id="lUser"
              type="text"
              bind:value={lUser}
              placeholder="admin"
              required
              class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-gray-900 font-black focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 text-lg shadow-sm"
            />
          </div>
          <div>
            <label
              for="lPass"
              class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3 ml-1"
              >Password</label
            >
            <div class="relative">
              <input
                id="lPass"
                type={showPass ? "text" : "password"}
                bind:value={lPass}
                placeholder="••••••••"
                required
                class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-gray-900 font-black focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 text-lg shadow-sm pr-14"
              />
              <button
                type="button"
                class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors"
                onclick={() => (showPass = !showPass)}
              >
                {#if showPass}
                  <EyeOff size={22} strokeWidth={2.5} />
                {:else}
                  <Eye size={22} strokeWidth={2.5} />
                {/if}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoggingIn}
            class="w-full flex items-center justify-center gap-4 bg-gray-900 hover:bg-black text-white py-6 px-10 rounded-[1.5rem] font-black text-xl transition-all shadow-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-4 group"
          >
            {#if isLoggingIn}
              <Loader2 class="w-7 h-7 animate-spin" />
              <span>Signing in...</span>
            {:else}
              Sign in
              <ArrowRight
                size={24}
                class="group-hover:translate-x-1 transition-transform"
              />
            {/if}
          </button>
        </form>
      </div>
    </div>
  </div>
{:else}
  <!-- ADMIN DASHBOARD (Premium Light Theme) -->
  <div
    class="min-h-screen bg-gray-50 text-gray-900 flex h-[calc(100vh-80px)] overflow-hidden font-sans"
  >
    <!-- Sidebar -->
    <aside
      class="w-64 md:w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 shadow-sm relative z-20"
    >
      <div class="p-8 flex flex-col gap-3 overflow-y-auto">
        <h3
          class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-1"
        >
          Management
        </h3>

        <button
          onclick={() => switchTab("pending")}
          class="group flex items-center justify-between px-5 py-4 rounded-2xl transition-all {currentTab ===
          'pending'
            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-bold'}"
        >
          <div class="flex items-center gap-4">
            <ShieldAlert size={22} strokeWidth={2.5} />
            <span>Pending</span>
          </div>
          {#if retailers.filter((r) => !r.verified).length > 0}
            <span
              class="w-5 h-5 rounded-full {currentTab === 'pending'
                ? 'bg-white text-blue-600'
                : 'bg-blue-600 text-white'} text-[10px] flex items-center justify-center font-black"
            >
              {retailers.filter((r) => !r.verified).length}
            </span>
          {/if}
        </button>

        <button
          onclick={() => switchTab("verified")}
          class="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all {currentTab ===
          'verified'
            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-bold'}"
        >
          <ShieldCheck size={22} strokeWidth={2.5} /> Verified
        </button>

        <button
          onclick={() => switchTab("all")}
          class="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all {currentTab ===
          'all'
            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-bold'}"
        >
          <Users size={22} strokeWidth={2.5} /> All Retailers
        </button>

        <button
          onclick={() => switchTab("chat")}
          class="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all {currentTab ===
          'chat'
            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-bold'}"
        >
          <MessageSquare size={22} strokeWidth={2.5} /> Chat Log
        </button>

        <h3
          class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-10 mb-4 ml-1"
        >
          System
        </h3>

        <button
          onclick={() => switchTab("settings")}
          class="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all {currentTab ===
          'settings'
            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-bold'}"
        >
          <Settings size={22} strokeWidth={2.5} /> Settings
        </button>
      </div>

      <div class="mt-auto p-8 border-t border-gray-100">
        <button
          onclick={logout}
          class="w-full flex items-center justify-center gap-4 px-6 py-4 text-gray-900 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all rounded-2xl font-black shadow-sm"
        >
          <LogOut size={20} strokeWidth={2.5} />
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main
      class="flex-1 overflow-y-auto bg-gray-50/50 p-8 md:p-12 lg:p-16 relative"
    >
      <div class="max-w-7xl mx-auto">
        <header class="mb-12 flex items-center justify-between relative z-10">
          <div>
            <h1
              class="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight leading-tight"
            >
              {currentTab === "pending"
                ? "Pending Verification"
                : currentTab === "verified"
                  ? "Verified Retailers"
                  : currentTab === "all"
                    ? "All Retailers"
                    : currentTab === "chat"
                      ? "Global Chat Log"
                      : "Gateway Settings"}
            </h1>
            <p class="text-gray-500 font-medium text-lg mt-2">
              {currentTab === "settings"
                ? "Global gateway configuration and bot secrets."
                : currentTab === "chat"
                  ? "Monitor real-time conversations across all stores."
                  : "Review and manage store certifications."}
            </p>
          </div>

          {#if currentTab !== "settings"}
            <button
              onclick={currentTab === 'chat' ? loadConversations : loadRetailers}
              class="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm hover:shadow-lg active:scale-90"
            >
              <RotateCw class="w-6 h-6 {isLoadingConversations || isLoadingRetailers ? 'animate-spin' : ''}" />
            </button>
          {/if}
        </header>

        {#if currentTab === "settings"}
          <!-- Settings Panel -->
          <div
            class="max-w-2xl bg-white border border-gray-200 rounded-[2.5rem] p-10 md:p-14 shadow-2xl shadow-gray-200/50 relative overflow-hidden"
          >
            <div
              class="absolute -top-20 -right-20 w-64 h-64 bg-blue-50/50 blur-3xl rounded-full pointer-events-none"
            ></div>

            <div class="relative z-10 flex flex-col gap-10">
              <div>
                <div class="flex items-center gap-4 mb-8">
                  <div
                    class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm"
                  >
                    <Shield size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2
                      class="text-2xl font-black text-gray-900 tracking-tight"
                    >
                      System Bot Config
                    </h2>
                    <p
                      class="text-gray-400 font-medium text-sm mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      Primary credentials for the Telegram API
                    </p>
                  </div>
                </div>

                <div
                  class="mb-8 p-8 bg-gray-50 rounded-3xl border border-gray-100"
                >
                  <div class="flex justify-between items-center mb-6">
                    <div
                      class="font-black text-gray-900 flex items-center gap-3"
                    >
                      <svg
                        class="w-6 h-6 text-blue-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"
                        />
                      </svg>
                      Telegram Bot Token
                    </div>
                    {#if tgTokenHasValue}
                      <span
                        class="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider"
                        >Configured</span
                      >
                    {:else}
                      <span
                        class="text-[10px] font-black text-gray-400 bg-gray-200 px-3 py-1 rounded-full uppercase tracking-wider"
                        >Missing</span
                      >
                    {/if}
                  </div>

                  <div class="relative">
                    <input
                      type={showTgToken ? "text" : "password"}
                      bind:value={tgToken}
                      placeholder={tgTokenHasValue
                        ? "••••••••••••••••••••••••••••••"
                        : "Paste your bot token here..."}
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
                  <p
                    class="text-xs text-gray-400 font-bold mt-4 flex items-center gap-2 uppercase tracking-wide"
                  >
                    <Info size={14} class="text-blue-500" />
                    Obtained via @BotFather
                  </p>
                </div>

                {#if settingsSavedMsg}
                  <div
                    class="text-emerald-700 text-sm font-black mb-10 flex items-center gap-3 bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 animate-in zoom-in-95"
                  >
                    <CheckCircle2 size={18} />
                    {settingsSavedMsg}
                  </div>
                {/if}

                {#if settingsError}
                  <div
                    class="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-black mb-10 flex items-center gap-3"
                  >
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
        {:else if currentTab === "chat"}
          <!-- Chat Log Panel -->
          <div class="flex flex-col lg:flex-row gap-8 h-[calc(100vh-280px)]">
            <!-- Left: Conversations -->
            <div class="w-full lg:w-96 flex flex-col gap-6 bg-white border border-gray-200 rounded-[2.5rem] p-6 shadow-xl shadow-gray-200/50">
              <div class="flex items-center justify-between mb-2 px-2">
                <h2 class="font-black text-gray-900">Conversations</h2>
              </div>
              
              <div class="relative">
                <select 
                  bind:value={chatStoreFilter} 
                  onchange={loadConversations}
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Stores</option>
                  {#each retailers as r}
                    <option value={r.slug}>{r.name}</option>
                  {/each}
                </select>
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <Globe size={16} />
                </div>
              </div>

              <div class="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {#if isLoadingConversations}
                  <div class="py-12 text-center text-gray-400 font-bold text-sm">Loading chat log...</div>
                {:else if conversations.length === 0}
                  <div class="py-12 text-center text-gray-400 font-bold text-sm">No conversations yet.</div>
                {:else}
                  {#each conversations as conv}
                    <button 
                      onclick={() => selectConversation(conv)}
                      class="w-full text-left p-5 rounded-2xl transition-all border {selectedConv?.id === conv.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white border-gray-100 hover:border-blue-500 group'}"
                    >
                      <div class="flex justify-between items-start mb-2">
                        <div class="font-black truncate flex-1 mr-2">{conv.buyerName || conv.buyerRef}</div>
                        <div class="text-[10px] opacity-60 font-bold shrink-0">
                          {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div class="text-xs opacity-80 truncate mb-3">
                        {conv.lastMessage || 'No messages yet'}
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full {selectedConv?.id === conv.id ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600'}">
                          {conv.storeSlug}
                        </span>
                        {#if conv.mode === 'human'}
                          <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full {selectedConv?.id === conv.id ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}">Human</span>
                        {:else}
                          <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full {selectedConv?.id === conv.id ? 'bg-white/20' : 'bg-purple-100 text-purple-600'}">AI</span>
                        {/if}
                      </div>
                    </button>
                  {/each}
                {/if}
              </div>
            </div>

            <!-- Right: Message Thread -->
            <div class="flex-1 flex flex-col bg-white border border-gray-200 rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden relative">
              {#if !selectedConv}
                <div class="flex-1 flex flex-col items-center justify-center text-gray-300 gap-6">
                  <div class="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-100 shadow-inner">
                    <MessageSquare size={48} />
                  </div>
                  <p class="font-black text-xl">Select a session to view the log</p>
                </div>
              {:else}
                <!-- Thread Header -->
                <div class="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                  <div class="flex items-center gap-6">
                    <div class="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg">
                      {(selectedConv.buyerName || selectedConv.buyerRef).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 class="text-xl font-black text-gray-900 tracking-tight">{selectedConv.buyerName || selectedConv.buyerRef}</h3>
                      <div class="flex items-center gap-3 mt-0.5">
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">ID: {selectedConv.buyerRef}</span>
                        <span class="w-1 h-1 rounded-full bg-gray-200"></span>
                        <span class="text-xs font-bold text-blue-600 uppercase tracking-widest">{selectedConv.storeSlug}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    {#if selectedConv.mode === "ai"}
                      <button
                        onclick={() => {
                          requireConfirm(
                            "Take Over Chat",
                            "This will notify the store and switch the chat to human mode. You will be acting as a platform admin.",
                            async () => {
                              await api(
                                "PATCH",
                                `/api/chat/conversations/${selectedConv.id}`,
                                {
                                  mode: "human",
                                  assignedTo: "Platform Admin",
                                },
                              );
                              showToast("Chat switched to human mode.");
                              loadConversations();
                              selectedConv.mode = "human";
                            },
                          );
                        }}
                        class="text-[10px] font-black text-purple-700 bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded-full uppercase tracking-widest border border-purple-200 transition-colors"
                      >
                        🤖 Take Over
                      </button>
                    {:else if selectedConv.mode === "human"}
                      <span
                        class="text-[10px] font-black text-blue-700 bg-blue-100 px-4 py-2 rounded-full uppercase tracking-widest border border-blue-200"
                        >👤 Human Agent</span
                      >
                    {:else}
                      <span
                        class="text-[10px] font-black text-gray-700 bg-gray-100 px-4 py-2 rounded-full uppercase tracking-widest border border-gray-200"
                        >✅ Closed</span
                      >
                    {/if}

                    {#if selectedConv.mode !== "closed"}
                      <button
                        onclick={() => {
                          requireConfirm(
                            "Close Conversation",
                            "Are you sure you want to force-close this session? The bot will no longer respond until the user starts a new chat.",
                            async () => {
                              await api(
                                "PATCH",
                                `/api/chat/conversations/${selectedConv.id}`,
                                { mode: "closed" },
                              );
                              showToast("Conversation closed.");
                              loadConversations();
                              selectedConv.mode = "closed";
                            },
                          );
                        }}
                        class="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Force Close Session"
                      >
                        <X size={20} />
                      </button>
                    {/if}
                  </div>
                </div>

                <!-- Message Stream -->
                <div
                  class="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8 bg-gray-50/10"
                >
                  {#if isLoadingMessages}
                    <div class="flex items-center justify-center h-full">
                      <Loader2 class="w-10 h-10 animate-spin text-blue-600" />
                    </div>
                  {:else}
                    {#each convMessages as msg}
                      {#if msg.senderType === "system"}
                        <div class="flex justify-center">
                          <span
                            class="px-4 py-2 bg-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-200"
                          >
                            {msg.body}
                          </span>
                        </div>
                      {:else}
                        <div
                          class="flex {msg.senderType === 'buyer'
                            ? 'justify-start'
                            : 'justify-end'}"
                        >
                          <div
                            class="max-w-[80%] flex flex-col {msg.senderType ===
                            'buyer'
                              ? 'items-start'
                              : 'items-end'}"
                          >
                            <div class="flex items-center gap-2 mb-2 px-1">
                              {#if msg.senderType === "buyer"}
                                <span
                                  class="text-[10px] font-black text-gray-900 uppercase tracking-widest"
                                  >{selectedConv.buyerName || "Buyer"}</span
                                >
                              {:else if msg.senderType === "ai"}
                                <span
                                  class="text-[10px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-1.5"
                                >
                                  🤖 {msg.senderName || "AI Bot"}
                                </span>
                              {:else}
                                <span
                                  class="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5"
                                >
                                  👤 {msg.senderName || "Human Agent"}
                                </span>
                              {/if}
                              <span
                                class="text-[9px] font-bold text-gray-300 uppercase tracking-widest"
                              >
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                            <div
                              class="rounded-3xl px-8 py-5 text-sm font-medium leading-relaxed shadow-sm
                              {msg.senderType === 'buyer'
                                ? 'bg-white border border-gray-100 text-gray-900 rounded-bl-none'
                                : msg.senderType === 'ai'
                                  ? 'bg-purple-600 text-white rounded-br-none shadow-purple-600/20'
                                  : 'bg-blue-600 text-white rounded-br-none shadow-blue-600/20'}"
                            >
                              {msg.body}
                            </div>
                          </div>
                        </div>
                      {/if}
                    {/each}
                  {/if}
                </div>

                <!-- Chat Compose -->
                {#if selectedConv.mode !== "closed"}
                  <div class="px-10 py-8 border-t border-gray-100 bg-white">
                    <div class="flex gap-6 items-end">
                      <div class="flex-1 relative">
                        <textarea
                          bind:value={chatNewMessage}
                          placeholder="Type a message as Platform Admin..."
                          rows={1}
                          onkeydown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              sendChatMessage();
                            }
                          }}
                          class="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-8 py-5 text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 shadow-sm resize-none"
                        ></textarea>
                      </div>
                      <button
                        onclick={sendChatMessage}
                        disabled={isSendingChatMessage ||
                          !chatNewMessage.trim()}
                        class="bg-gray-900 hover:bg-black text-white p-5 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-30 disabled:grayscale"
                      >
                        {#if isSendingChatMessage}
                          <Loader2 class="w-6 h-6 animate-spin" />
                        {:else}
                          <ArrowRight class="w-6 h-6" />
                        {/if}
                      </button>
                    </div>
                  </div>
                {/if}
              {/if}
            </div>
          </div>
        {:else}
          <!-- Retailers Panel -->
          <div class="space-y-10 relative z-10">
            {#if showKeyBanner}
              <div
                class="border border-emerald-200 bg-emerald-50 rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-200/50 flex flex-col md:flex-row md:items-center justify-between gap-10 animate-in slide-in-from-top-4 duration-500"
              >
                <div class="flex-1">
                  <div
                    class="text-emerald-800 font-black text-2xl mb-3 flex items-center gap-3 tracking-tight leading-none"
                  >
                    <div
                      class="bg-emerald-600 text-white p-2 rounded-xl shadow-lg shadow-emerald-600/30"
                    >
                      <Key size={24} />
                    </div>
                    Platform Key Issued
                  </div>
                  <p
                    class="text-emerald-700/80 font-bold text-lg mb-6 leading-relaxed"
                  >
                    Share this key with the retailer. It will <strong
                      class="text-emerald-900 font-black">not</strong
                    > be shown again.
                  </p>
                  <div
                    class="font-mono bg-white text-emerald-900 px-8 py-5 rounded-2xl text-lg font-black border border-emerald-200 shadow-inner break-all"
                  >
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

            <div
              class="bg-white border border-gray-200 rounded-[3rem] shadow-2xl shadow-gray-200/50 overflow-hidden relative"
            >
              <div class="overflow-x-auto custom-scrollbar">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-50/50 border-b border-gray-100">
                      <th
                        class="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400"
                        >Retailer Detail</th
                      >
                      <th
                        class="px-8 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400"
                        >Endpoint</th
                      >
                      <th
                        class="px-8 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400"
                        >Status</th
                      >
                      <th
                        class="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 text-right"
                        >Actions</th
                      >
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    {#if isLoadingRetailers}
                      <tr>
                        <td
                          colspan="4"
                          class="px-10 py-32 text-center text-gray-400"
                        >
                          <Loader2
                            class="w-12 h-12 animate-spin mx-auto mb-6 text-blue-600"
                          />
                          <span class="font-bold text-lg"
                            >Retreiving regional retail registry...</span
                          >
                        </td>
                      </tr>
                    {:else if filteredRetailers.length === 0}
                      <tr>
                        <td
                          colspan="4"
                          class="px-10 py-32 text-center text-gray-400"
                        >
                          <div
                            class="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-200"
                          >
                            <Users size={40} />
                          </div>
                          <h3 class="text-xl font-black text-gray-900 mb-2">
                            Registry is empty
                          </h3>
                          <p class="font-medium">
                            No retailers found in this category.
                          </p>
                        </td>
                      </tr>
                    {:else}
                      {#each filteredRetailers as r}
                        <tr class="group hover:bg-gray-50/50 transition-colors">
                          <td class="px-10 py-10">
                            <div class="flex items-center gap-6">
                              <div
                                class="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-2xl font-black shadow-lg transform -rotate-1 group-hover:rotate-0 transition-transform"
                              >
                                {r.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div
                                  class="text-gray-900 font-black text-xl tracking-tight mb-1 group-hover:text-blue-600 transition-colors"
                                >
                                  {r.name}
                                </div>
                                <div class="flex items-center gap-4">
                                  <div
                                    class="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider"
                                  >
                                    <Globe size={12} />
                                    {r.slug}
                                  </div>
                                  <div
                                    class="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider"
                                  >
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
                                  <span
                                    class="text-[9px] font-black text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5"
                                  >
                                    <div
                                      class="w-1.5 h-1.5 rounded-full bg-emerald-500"
                                    ></div>
                                    Verified
                                  </span>
                                {:else}
                                  <span
                                    class="text-[9px] font-black text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5"
                                  >
                                    <div
                                      class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"
                                    ></div>
                                    Review
                                  </span>
                                {/if}
                              </div>
                              <div class="flex items-center gap-2">
                                {#if r.platformKey && !r.platformKey.revokedAt}
                                  <span
                                    class="text-[9px] font-black text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 border border-gray-100"
                                  >
                                    <Key size={10} /> Key Active
                                  </span>
                                {:else}
                                  <span
                                    class="text-[9px] font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 border border-red-50"
                                  >
                                    <AlertTriangle size={10} /> No Key
                                  </span>
                                {/if}
                              </div>
                            </div>
                          </td>
                          <td class="px-10 py-10 text-right">
                            <div
                              class="flex items-center justify-end gap-3 flex-wrap"
                            >
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
        {/if}
      </div>
    </main>
  </div>
{/if}

<!-- Toast UI -->
{#if toastMsg}
  <div
    class="fixed bottom-10 right-10 z-[100] px-8 py-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] font-black text-white {toastType ===
    'success'
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
    <button
      class="text-white/40 hover:text-white transition-colors p-1"
      onclick={() => (toastMsg = "")}><X size={16} strokeWidth={3} /></button
    >
  </div>
{/if}

<!-- CONFIRM DIALOG -->
{#if isConfirmOpen}
  <div
    class="fixed inset-0 z-[200] flex items-center justify-center p-6 text-gray-900 font-sans"
  >
    <div
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-xl transition-opacity animate-in fade-in duration-300"
      onclick={() => !isConfirming && (isConfirmOpen = false)}
      aria-hidden="true"
    ></div>

    <div
      class="relative bg-white border border-gray-200 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-lg p-10 md:p-14 animate-in zoom-in-95 fade-in duration-300"
    >
      <div
        class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-10 shadow-sm border border-blue-100"
      >
        <Info size={32} strokeWidth={2.5} />
      </div>
      <h2
        class="text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight"
      >
        {confirmTitle}
      </h2>
      <p class="text-gray-500 font-medium text-lg mb-10 leading-relaxed">
        {confirmDesc}
      </p>

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

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
</style>
