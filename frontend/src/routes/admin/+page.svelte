<script lang="ts">
  import { onMount } from "svelte";
  import { RotateCw } from "lucide-svelte";
  import Header from "$lib/components/Header.svelte";
  import { apiFetch } from "$lib/api";
  import type { Retailer, AdminTabId } from "$shared/types";

  // Admin Components
  import LoginPanel from "$lib/components/admin/LoginPanel.svelte";
  import AdminSidebar from "$lib/components/admin/AdminSidebar.svelte";
  import RetailerList from "$lib/components/admin/RetailerList.svelte";
  import OrderDashboard from "$lib/components/admin/OrderDashboard.svelte";
  import ChatLog from "$lib/components/admin/ChatLog.svelte";
  import SystemSettings from "$lib/components/admin/SystemSettings.svelte";
  import PaymentSettings from "$lib/components/admin/PaymentSettings.svelte";
  import DashboardToast from "$lib/components/admin/DashboardToast.svelte";
  import ConfirmModal from "$lib/components/admin/ConfirmModal.svelte";

  // --- Auth & State ---
  // SEC-A: No token in JS memory. Auth is handled via httpOnly cookie set by
  // the server on login. All requests include credentials: 'include' (see api.ts).
  let isLoggedIn = $state(false);

  // Dashboard State
  let currentTab = $state<AdminTabId>("pending");
  let retailers = $state<Retailer[]>([]);
  let isLoadingRetailers = $state(false);

  // Toast
  let toastMsg = $state("");
  let toastType = $state<"success" | "error">("success");
  let toastTimeout: ReturnType<typeof setTimeout>;

  // Confirm Dialog
  let isConfirmOpen = $state(false);
  let confirmTitle = $state("");
  let confirmDesc = $state("");
  let onConfirmFn = $state<() => Promise<void>>(() => Promise.resolve());

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

  let activityTimeout: ReturnType<typeof setInterval>;
  const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

  function resetActivity() {
    if (!isLoggedIn) return;
    localStorage.setItem("last_activity", Date.now().toString());
  }

  function checkActivity() {
    if (!isLoggedIn) return;
    const last = parseInt(localStorage.getItem("last_activity") || "0", 10);
    if (Date.now() - last > IDLE_TIMEOUT_MS) {
      logout();
      showToast("Session expired due to inactivity.", "error");
    }
  }

  onMount(() => {
    (async () => {
      // SEC-A: Check session via /api/auth/me instead of reading a localStorage token.
      // The httpOnly cookie is sent automatically; if valid the server returns 200.
      try {
        const res = await apiFetch("/api/auth/me");
        if (res.ok) {
          isLoggedIn = true;
          loadRetailers();
          resetActivity();
        }
      } catch {
        // Not logged in — show login panel
      }
    })();

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];
    const handleActivity = () => resetActivity();
    activityEvents.forEach((e) =>
      window.addEventListener(e, handleActivity, { passive: true }),
    );
    activityTimeout = setInterval(checkActivity, 60000);

    return () => {
      activityEvents.forEach((e) =>
        window.removeEventListener(e, handleActivity),
      );
      clearInterval(activityTimeout);
    };
  });

  function showToast(msg: string, type: "success" | "error" = "success") {
    toastMsg = msg;
    toastType = type;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastMsg = "";
    }, 3500);
  }

  async function api(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<any> {
    const res = await apiFetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) {
      logout();
      return null;
    }
    if (res.status === 204) return null;
    return res.json();
  }

  function onLoginSuccess() {
    // SEC-A: Cookie was set server-side; nothing to store here.
    isLoggedIn = true;
    resetActivity();
    loadRetailers();
  }

  async function logout() {
    // Ask the server to clear the httpOnly cookie
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    isLoggedIn = false;
  }

  async function loadRetailers() {
    isLoadingRetailers = true;
    const all = await api("GET", "/api/retailers");
    isLoadingRetailers = false;
    if (all) retailers = all;
  }

  function switchTab(tab: typeof currentTab) {
    currentTab = tab;
    if (
      tab !== "settings" &&
      tab !== "payments" &&
      tab !== "orders" &&
      tab !== "chat"
    ) {
      loadRetailers();
    }
  }
</script>

<svelte:head>
  <title>Admin Portal - Prompt Commerce</title>
</svelte:head>

<Header />

{#if !isLoggedIn}
  <LoginPanel {onLoginSuccess} />
{:else}
  <div
    class="bg-gray-50 text-gray-900 flex h-[calc(100vh-5rem)] overflow-hidden font-sans"
  >
    <AdminSidebar {currentTab} {switchTab} {retailers} {logout} />

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
                      : currentTab === "orders"
                        ? "Network Order Dashboard"
                        : currentTab === "payments"
                          ? "Gateway Payments"
                          : "Gateway Settings"}
            </h1>
            <p class="text-gray-500 font-medium text-sm mt-2">
              {currentTab === "settings"
                ? "Global gateway configuration and bot secrets."
                : currentTab === "payments"
                  ? "Global default payment providers and offline instructions."
                  : currentTab === "chat"
                    ? "Monitor real-time conversations across all stores."
                    : "Review and manage store certifications."}
            </p>
          </div>

          {#if currentTab !== "settings" && currentTab !== "payments"}
            <button
              onclick={loadRetailers}
              class="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm hover:shadow-lg active:scale-90"
            >
              <RotateCw
                class="w-6 h-6 {isLoadingRetailers ? 'animate-spin' : ''}"
              />
            </button>
          {/if}
        </header>

        {#if currentTab === "settings"}
          <SystemSettings {api} />
        {:else if currentTab === "payments"}
          <PaymentSettings {api} />
        {:else if currentTab === "orders"}
          <OrderDashboard {api} {retailers} />
        {:else if currentTab === "chat"}
          <ChatLog {api} {retailers} {requireConfirm} {showToast} />
        {:else}
          <RetailerList
            {retailers}
            {isLoadingRetailers}
            {currentTab}
            {api}
            {loadRetailers}
            {requireConfirm}
            {showToast}
          />
        {/if}
      </div>
    </main>
  </div>
{/if}

<DashboardToast bind:toastMsg {toastType} />

<ConfirmModal bind:isConfirmOpen {confirmTitle} {confirmDesc} {onConfirmFn} />

<style>
  :global(.custom-scrollbar::-webkit-scrollbar) {
    width: 6px;
    height: 6px;
  }
  :global(.custom-scrollbar::-webkit-scrollbar-track) {
    background: transparent;
  }
  :global(.custom-scrollbar::-webkit-scrollbar-thumb) {
    background: #e2e8f0;
    border-radius: 10px;
  }
</style>
