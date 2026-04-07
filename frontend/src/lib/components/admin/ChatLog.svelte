<script lang="ts">
  import { Globe, MessageSquare, X, Loader2, ArrowRight } from "lucide-svelte";
  import { onMount, onDestroy } from "svelte";
  import type { Retailer, Conversation, Message, ApiFunction } from "$shared/types";

  let { retailers, api, requireConfirm, showToast } = $props<{
    retailers: Retailer[];
    api: ApiFunction;
    requireConfirm: (title: string, desc: string, fn: () => Promise<void>) => void;
    showToast: (msg: string, type?: "success" | "error") => void;
  }>();

  let conversations = $state<Conversation[]>([]);
  let isLoadingConversations = $state(false);
  let selectedConv = $state<Conversation | null>(null);
  let convMessages = $state<Message[]>([]);
  let isLoadingMessages = $state(false);
  let chatStoreFilter = $state("");
  let chatNewMessage = $state("");
  let isSendingChatMessage = $state(false);
  let chatPollingInterval: ReturnType<typeof setInterval>;

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
      if (selectedConv) {
        const data = await api("GET", `/api/chat/conversations/${selectedConv.id}/messages`);
        if (data && data.length !== convMessages.length) {
          convMessages = data;
        }
      } else {
        clearInterval(chatPollingInterval);
      }
    }, 5000);
  }

  async function selectConversation(conv: Conversation) {
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
      const data = await api("POST", `/api/chat/conversations/${selectedConv.id}/messages`, {
        body,
        senderName: "Platform Admin",
      });
      if (data) {
        await loadMessages(selectedConv.id);
      }
    } catch (err) {
      showToast("Failed to send message", "error");
    } finally {
      isSendingChatMessage = false;
    }
  }

  onMount(() => {
    loadConversations();
  });

  onDestroy(() => {
    clearInterval(chatPollingInterval);
  });
</script>

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
            class="w-full text-left p-5 rounded-2xl transition-all border {selectedConv?.id === conv.id
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-white border-gray-100 hover:border-blue-500 group'}"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="font-black truncate flex-1 mr-2">{conv.buyerName || conv.buyerRef}</div>
              <div class="text-[10px] opacity-60 font-bold shrink-0">
                {new Date(conv.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <div class="text-xs opacity-80 truncate mb-3">{conv.lastMessage || "No messages yet"}</div>
            <div class="flex items-center gap-2">
              <span
                class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full {selectedConv?.id === conv.id
                  ? 'bg-white/20'
                  : 'bg-gray-100 group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600'}"
              >
                {conv.storeSlug}
              </span>
              {#if conv.mode === "human"}
                <span
                  class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full {selectedConv?.id === conv.id
                    ? 'bg-white/20'
                    : 'bg-blue-100 text-blue-600'}">Human</span
                >
              {:else}
                <span
                  class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full {selectedConv?.id === conv.id
                    ? 'bg-white/20'
                    : 'bg-purple-100 text-purple-600'}">AI</span
                >
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
                    await api("PATCH", `/api/chat/conversations/${selectedConv!.id}`, {
                      mode: "human",
                      assignedTo: "Platform Admin",
                    });
                    showToast("Chat switched to human mode.");
                    loadConversations();
                    selectedConv!.mode = "human";
                  }
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
                    await api("PATCH", `/api/chat/conversations/${selectedConv!.id}`, { mode: "closed" });
                    showToast("Conversation closed.");
                    loadConversations();
                    selectedConv!.mode = "closed";
                  }
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
      <div class="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8 bg-gray-50/10">
        {#if isLoadingMessages}
          <div class="flex items-center justify-center h-full">
            <Loader2 class="w-10 h-10 animate-spin text-blue-600" />
          </div>
        {:else}
          {#each convMessages as msg}
            {#if msg.senderType === "system"}
              <div class="flex justify-center">
                <span class="px-4 py-2 bg-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-200">
                  {msg.body}
                </span>
              </div>
            {:else}
              <div class="flex {msg.senderType === 'buyer' ? 'justify-start' : 'justify-end'}">
                <div class="max-w-[80%] flex flex-col {msg.senderType === 'buyer' ? 'items-start' : 'items-end'}">
                  <div class="flex items-center gap-2 mb-2 px-1">
                    {#if msg.senderType === "buyer"}
                      <span class="text-[10px] font-black text-gray-900 uppercase tracking-widest">{selectedConv.buyerName || "Buyer"}</span>
                    {:else if msg.senderType === "ai"}
                      <span class="text-[10px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-1.5">
                        🤖 {msg.senderName || "AI Bot"}
                      </span>
                    {:else}
                      <span class="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                        👤 {msg.senderName || "Human Agent"}
                      </span>
                    {/if}
                    <span class="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
              disabled={isSendingChatMessage || !chatNewMessage.trim()}
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
