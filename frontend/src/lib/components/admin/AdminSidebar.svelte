<script lang="ts">
  import { ShieldAlert, ShieldCheck, Users, MessageSquare, ShoppingBag, Settings, CreditCard, LogOut } from "lucide-svelte";
  import type { Retailer, AdminTabId } from "$shared/types";

  let { currentTab, switchTab, retailers, logout } = $props<{
    currentTab: AdminTabId;
    switchTab: (tab: AdminTabId) => void;
    retailers: Retailer[];
    logout: () => void;
  }>();
</script>

<aside class="w-64 md:w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 shadow-sm relative z-20">
  <div class="p-6 flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
    <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-1">Management</h3>

    <button
      onclick={() => switchTab("pending")}
      class="group flex items-center justify-between px-5 py-3 rounded-2xl transition-all text-sm {currentTab === 'pending'
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-bold'}"
    >
      <div class="flex items-center gap-4">
        <ShieldAlert size={22} strokeWidth={2.5} />
        <span>Pending</span>
      </div>
      {#if retailers.filter((r: Retailer) => !r.verified).length > 0}
        <span
          class="w-5 h-5 rounded-full {currentTab === 'pending' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'} text-[10px] flex items-center justify-center font-black"
        >
          {retailers.filter((r: Retailer) => !r.verified).length}
        </span>
      {/if}
    </button>

    <button
      onclick={() => switchTab("verified")}
      class="flex items-center gap-4 px-5 py-3 rounded-2xl transition-all text-sm {currentTab === 'verified'
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-bold'}"
    >
      <ShieldCheck size={22} strokeWidth={2.5} /> Verified
    </button>

    <button
      onclick={() => switchTab("all")}
      class="flex items-center gap-4 px-5 py-3 rounded-2xl transition-all text-sm {currentTab === 'all'
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-bold'}"
    >
      <Users size={22} strokeWidth={2.5} /> All Retailers
    </button>

    <button
      onclick={() => switchTab("chat")}
      class="flex items-center gap-4 px-5 py-3 rounded-2xl transition-all text-sm {currentTab === 'chat'
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-bold'}"
    >
      <MessageSquare size={22} strokeWidth={2.5} /> Chat Log
    </button>

    <button
      onclick={() => switchTab("orders")}
      class="flex items-center gap-4 px-5 py-3 rounded-2xl transition-all text-sm {currentTab === 'orders'
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-bold'}"
    >
      <ShoppingBag size={22} strokeWidth={2.5} /> Global Orders
    </button>

    <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-10 mb-4 ml-1">System</h3>

    <button
      onclick={() => switchTab("settings")}
      class="flex items-center gap-4 px-5 py-3 rounded-2xl transition-all text-sm {currentTab === 'settings'
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-bold'}"
    >
      <Settings size={22} strokeWidth={2.5} /> Settings
    </button>

    <button
      onclick={() => switchTab("payments")}
      class="flex items-center gap-4 px-5 py-3 rounded-2xl transition-all text-sm {currentTab === 'payments'
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-bold'}"
    >
      <CreditCard size={22} strokeWidth={2.5} /> Payments
    </button>
  </div>

  <div class="mt-auto border-t border-gray-100">
    <button
      onclick={logout}
      class="py-5 w-full flex items-center justify-center gap-4 px-6 py-3 text-sm text-gray-900 border-0 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-black"
    >
      <LogOut size={20} strokeWidth={2.5} />
      Sign out
    </button>
  </div>
</aside>
