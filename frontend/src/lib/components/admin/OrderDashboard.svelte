<script lang="ts">
  import { RotateCw } from "lucide-svelte";
  import { onMount } from "svelte";
  import type { Retailer, Order, OrderStats, ApiFunction } from "$shared/types";

  let { retailers, api } = $props<{
    retailers: Retailer[];
    api: ApiFunction;
  }>();

  // Orders State
  let orders = $state<Order[]>([]);
  let ordersTotal = $state(0);
  let orderStats = $state<OrderStats | null>(null);
  let isLoadingOrders = $state(false);
  let orderStoreFilter = $state("");
  let orderStatusFilter = $state("");
  let orderPage = $state(1);
  let orderExpandedId = $state<number | null>(null);
  let showDeletedOrderItems = $state(false);

  async function loadOrders() {
    isLoadingOrders = true;
    const params = new URLSearchParams();
    if (orderStoreFilter) params.append("store", orderStoreFilter);
    if (orderStatusFilter) params.append("status", orderStatusFilter);
    params.append("page", String(orderPage));

    const data = await api("GET", `/api/orders?${params}`);
    isLoadingOrders = false;
    if (data) {
      orders = data.orders;
      ordersTotal = data.total;
      orderStats = data.stats;
    }
  }

  onMount(() => {
    loadOrders();
  });
</script>

<div class="space-y-8">
  <!-- Stats Grid -->
  {#if orderStats}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Orders</p>
        <p class="text-3xl font-black text-gray-900">{ordersTotal}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Avg Fulfillment</p>
        <p class="text-3xl font-black text-blue-600">
          {orderStats.avgFulfillmentHours.toFixed(1)}h
        </p>
      </div>
      <div class="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pending</p>
        <p class="text-3xl font-black text-amber-500">
          {orderStats.byStatus.find((s) => s.orderStatus === "pending")?._count ?? 0}
        </p>
      </div>
      <div class="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delivered</p>
        <p class="text-3xl font-black text-emerald-600">
          {orderStats.byStatus.find((s) => s.orderStatus === "delivered")?._count ?? 0}
        </p>
      </div>
    </div>
  {/if}

  <!-- Filters -->
  <div class="flex flex-wrap gap-4 bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm">
    <div class="flex-1 min-w-[200px]">
      <select
        bind:value={orderStoreFilter}
        onchange={() => {
          orderPage = 1;
          loadOrders();
        }}
        class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-all"
      >
        <option value="">All Stores</option>
        {#each retailers as r}
          <option value={r.slug}>{r.name}</option>
        {/each}
      </select>
    </div>
    <div class="flex-1 min-w-[200px]">
      <select
        bind:value={orderStatusFilter}
        onchange={() => {
          orderPage = 1;
          loadOrders();
        }}
        class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-all"
      >
        <option value="">All Statuses</option>
        {#each ["pending_payment", "pending", "paid", "picking", "packing", "ready_for_pickup", "picked_up", "in_transit", "delivered", "cancelled", "refunded"] as s}
          <option value={s}>{s.replace(/_/g, " ").toUpperCase()}</option>
        {/each}
      </select>
    </div>
    <button
      onclick={loadOrders}
      class="p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all active:scale-95"
    >
      <RotateCw size={20} class={isLoadingOrders ? "animate-spin" : ""} />
    </button>
  </div>

  <!-- Orders Table -->
  <div class="bg-white border border-gray-200 rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-gray-50/50 border-b border-gray-100">
          <th class="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Order ID</th>
          <th class="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Store</th>
          <th class="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Buyer</th>
          <th class="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
          <th class="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total</th>
          <th class="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        {#if isLoadingOrders}
          <tr><td colspan="6" class="px-8 py-24 text-center text-gray-400 font-bold">Loading order ledger...</td></tr>
        {:else if orders.length === 0}
          <tr><td colspan="6" class="px-8 py-24 text-center text-gray-400 font-bold">No orders found.</td></tr>
        {:else}
          {#each orders as o}
            <tr class="group hover:bg-gray-50/30 transition-colors">
              <td class="px-8 py-6 font-mono text-xs font-black text-blue-600">#{String(o.orderId).padStart(6, "0")}</td>
              <td class="px-8 py-6"><span class="text-sm font-bold text-gray-900">{o.storeSlug}</span></td>
              <td class="px-8 py-6"><span class="text-sm font-bold text-gray-500">{o.buyerRef}</span></td>
              <td class="px-8 py-6">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                  {o.orderStatus === 'delivered'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : o.orderStatus === 'cancelled'
                      ? 'bg-red-50 text-red-700 border-red-100'
                      : 'bg-blue-50 text-blue-700 border-blue-100'}"
                >
                  {o.orderStatus.replace(/_/g, " ")}
                </span>
              </td>
              <td class="px-8 py-6 font-black text-gray-900">
                {new Intl.NumberFormat("en-PH", { style: "currency", currency: o.currency }).format(o.amount)}
              </td>
              <td class="px-8 py-6 text-right">
                <button
                  onclick={() => (orderExpandedId = orderExpandedId === o.id ? null : o.id)}
                  class="text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest"
                >
                  {orderExpandedId === o.id ? "Close" : "View Detail"}
                </button>
              </td>
            </tr>
            {#if orderExpandedId === o.id}
              <tr class="bg-gray-50/50">
                <td colspan="6" class="px-12 py-10">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Fulfillment Details</h4>
                      <div class="space-y-4">
                        <div class="flex justify-between border-b border-gray-100 pb-3">
                          <span class="text-xs font-bold text-gray-400 uppercase">Delivery Type</span>
                          <span class="text-xs font-black text-gray-900 uppercase">{o.deliveryType}</span>
                        </div>
                        {#if o.trackingNumber}
                          <div class="flex justify-between border-b border-gray-100 pb-3">
                            <span class="text-xs font-bold text-gray-400 uppercase">Tracking</span>
                            <span class="text-xs font-black text-gray-900">{o.courierName}: {o.trackingNumber}</span>
                          </div>
                        {/if}
                        <div class="flex justify-between border-b border-gray-100 pb-3">
                          <span class="text-xs font-bold text-gray-400 uppercase">Payment Method</span>
                          <span class="text-xs font-black text-gray-900 uppercase">{o.provider}</span>
                        </div>
                        <div class="flex justify-between border-b border-gray-100 pb-3">
                          <span class="text-xs font-bold text-gray-400 uppercase">Created At</span>
                          <span class="text-xs font-black text-gray-900">{new Date(o.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div class="flex items-center justify-between mb-6">
                        <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Internal Timeline</h4>
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" bind:checked={showDeletedOrderItems} class="w-3 h-3 rounded text-blue-600" />
                          <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Show Deleted</span>
                        </label>
                      </div>
                      <div class="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                        {#each (o.orderNotes || []).filter((n) => showDeletedOrderItems || !n.deletedAt) as note}
                          <div class="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm {note.deletedAt ? 'opacity-40 grayscale' : ''}">
                            <div class="flex justify-between items-center mb-2">
                              <span class="text-[10px] font-black text-blue-600 uppercase">{note.createdBy}</span>
                              <span class="text-[9px] font-bold text-gray-300">{new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p class="text-xs font-medium text-gray-600 leading-relaxed">{note.note}</p>
                          </div>
                        {:else}
                          <p class="text-xs text-gray-400 italic">No notes synced for this order.</p>
                        {/each}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            {/if}
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>
