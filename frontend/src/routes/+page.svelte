<script lang="ts">
  import { onMount } from "svelte";
  import {
    Search,
    Store,
    ArrowRight,
    Sparkles,
    Zap,
    ShieldCheck,
  } from "lucide-svelte";
  import Header from "$lib/components/Header.svelte";

  let config = $state({ gatewayUrl: "https://gateway.example.com/sse" });

  onMount(async () => {
    try {
      const res = await fetch("/api/storefront/config");
      if (res.ok) config = await res.json();
    } catch {}
  });
</script>

<svelte:head>
  <title>Prompt Commerce - AI-First Retail Ecosystem</title>
</svelte:head>

<Header />

<div class="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
  <main class="flex-1">
    <!-- Hero Section -->
    <section
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-32 lg:pb-40 text-center relative overflow-hidden"
    >
      <!-- Background Accents -->
      <div
        class="absolute -top-24 -left-20 w-96 h-96 bg-blue-100/50 blur-3xl rounded-full pointer-events-none opacity-50"
      ></div>
      <div
        class="absolute -bottom-24 -right-20 w-96 h-96 bg-emerald-100/50 blur-3xl rounded-full pointer-events-none opacity-50"
      ></div>

      <div class="relative z-10 max-w-4xl mx-auto">
        <div
          class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest mb-8 animate-pulse shadow-sm border border-blue-100"
        >
          <Sparkles size={14} />
          The Future of AI Commerce is Here
        </div>

        <h1
          class="text-4xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1] mb-8"
        >
          The AI-powered <br />
          <span class="text-blue-600">Local Commerce</span> Network
        </h1>

        <p
          class="text-xl md:text-2xl text-gray-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          The hub connecting AI-powered stores to global customers via Telegram,
          Web, and Agentic workflows.
        </p>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <a
            href="/stores"
            class="w-full sm:w-auto px-10 py-5 bg-gray-900 text-white rounded-[1.25rem] font-black text-lg shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <Store size={22} />
            Browse Stores
          </a>
          <a
            href="/search"
            class="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border border-gray-200 rounded-[1.25rem] font-black text-lg shadow-xl hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <Search size={22} />
            Search Products
          </a>
        </div>

        <!-- System Stats / Features -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div
            class="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all group"
          >
            <div
              class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
            >
              <Zap size={24} strokeWidth={2.5} />
            </div>
            <h3 class="text-xl font-black mb-2">Zero Latency</h3>
            <p class="text-gray-500 font-medium text-sm leading-relaxed">
              Real-time product updates and instant search across the entire
              global retail registry.
            </p>
          </div>
          <div
            class="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all group"
          >
            <div
              class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
            >
              <ShieldCheck size={24} strokeWidth={2.5} />
            </div>
            <h3 class="text-xl font-black mb-2">Verified Stores</h3>
            <p class="text-gray-500 font-medium text-sm leading-relaxed">
              Every retailer is manually verified with business permits to
              ensure a safe shopping experience.
            </p>
          </div>
          <div
            class="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all group"
          >
            <div
              class="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
            >
              <img src="/logo-w.png" alt="Logo" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-black mb-2">Agentic Core</h3>
            <p class="text-gray-500 font-medium text-sm leading-relaxed">
              Native MCP support allows any AI agent to interact with your store
              using natural language.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- MCP Config Section -->
    <section class="bg-white border-t border-gray-100 py-24">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <div
          class="inline-block px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
        >
          Developer Integration
        </div>
        <h2 class="text-3xl font-black mb-6">Claude Desktop Config</h2>
        <p class="text-gray-500 font-medium mb-10">
          Paste this into your <code>claude_desktop_config.json</code> to start managing
          stores directly from Claude.
        </p>

        <div class="relative group max-w-xl mx-auto">
          <pre
            class="bg-gray-900 p-8 rounded-[2rem] text-[13px] leading-relaxed text-emerald-400 overflow-x-auto border border-gray-800 shadow-2xl custom-scrollbar text-left font-mono"><code
              >{`{
  "mcpServers": {
    "prompt-commerce": {
      "url": "${config.gatewayUrl}"
    }
  }
}`}</code
            ></pre>
          <div class="absolute top-4 right-4 animate-in fade-in zoom-in">
            <div
              class="px-3 py-1 bg-emerald-400/10 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-400/20"
            >
              Live endpoint
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Simple Footer -->
  <footer class="py-12 border-t border-gray-100 text-center">
    <p class="text-[10px] uppercase font-black tracking-[0.3em] text-gray-300">
      &copy; 2026 Prompt Commerce Protocol
    </p>
  </footer>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #313244;
    border-radius: 10px;
  }
</style>
