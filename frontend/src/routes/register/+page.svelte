<script lang="ts">
  import {
    Loader2,
    Upload,
    CheckCircle2,
    UserPlus,
    Info,
    ArrowRight,
  } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import Header from "$lib/components/Header.svelte";
  import { apiFetch } from "$lib/api";

  let name = $state("");
  let slug = $state("");
  let contactEmail = $state("");
  let mcpServerUrl = $state("");
  let fileList: FileList | null = $state(null);

  let isLoading = $state(false);
  let errorMsg = $state("");

  // Auto-generate slug when name changes
  $effect(() => {
    if (name && !slug) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 48);
    }
  });

  function handleNameInput(e: Event) {
    name = (e.target as HTMLInputElement).value;
    slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 48);
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    errorMsg = "";
    isLoading = true;

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("slug", slug);
      formData.append("contactEmail", contactEmail);
      formData.append("mcpServerUrl", mcpServerUrl);
      if (fileList && fileList.length > 0) {
        formData.append("businessPermit", fileList[0]);
      }

      const res = await apiFetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed.");

      goto("/confirmation");
    } catch (err: any) {
      errorMsg = err.message || "An unexpected error occurred.";
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Register Store - Prompt Commerce</title>
</svelte:head>

<Header />

<div class="min-h-screen bg-gray-50 flex flex-col font-sans">
  <main class="flex-1 flex items-center justify-center p-6 lg:py-20">
    <div class="max-w-xl w-full">
      <div
        class="bg-white border border-gray-200 rounded-[3rem] p-8 md:p-14 shadow-2xl shadow-gray-200/50 relative overflow-hidden"
      >
        <!-- Decoration -->
        <div
          class="absolute -top-10 -right-10 w-40 h-40 bg-blue-50/50 rounded-full blur-3xl pointer-events-none"
        ></div>

        <div
          class="flex flex-col items-center gap-6 mb-12 text-center relative z-10"
        >
          <div
            class="w-20 h-20 bg-gray-900 rounded-[2rem] flex items-center justify-center shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500"
          >
            <UserPlus size={40} class="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1
              class="text-4xl font-black text-gray-900 tracking-tight leading-tight"
            >
              Register Store
            </h1>
            <p class="text-gray-500 font-medium text-lg mt-2">
              Join the global AI-powered retail network
            </p>
          </div>
        </div>

        {#if errorMsg}
          <div
            class="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-black mb-10 flex items-center gap-4 animate-in fade-in slide-in-from-top-2"
          >
            <div
              class="w-3 h-3 rounded-full bg-red-600 animate-pulse shrink-0"
            ></div>
            {errorMsg}
          </div>
        {/if}

        <form onsubmit={handleSubmit} class="space-y-8 relative z-10">
          <div class="grid grid-cols-1 gap-8">
            <div>
              <label
                for="name"
                class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3 ml-1"
              >
                Store Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                oninput={handleNameInput}
                placeholder="Steve's Sari-Sari Store"
                required
                class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-gray-900 font-black focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 text-lg shadow-sm"
              />
            </div>

            <div>
              <label
                for="slug"
                class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3 ml-1"
              >
                Store Slug
              </label>
              <div
                class="flex items-center bg-gray-50 border border-gray-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all pr-4 shadow-sm overflow-hidden"
              >
                <span
                  class="pl-6 pr-2 text-gray-300 text-base font-black whitespace-nowrap opacity-60"
                >
                  /store/
                </span>
                <input
                  id="slug"
                  bind:value={slug}
                  type="text"
                  placeholder="steves-store"
                  required
                  pattern="[a-z0-9\-]+"
                  class="w-full bg-transparent py-5 text-gray-900 font-black focus:outline-none placeholder:text-gray-300 text-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              for="contactEmail"
              class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3 ml-1"
            >
              Contact Email
            </label>
            <input
              id="contactEmail"
              bind:value={contactEmail}
              type="email"
              placeholder="you@example.com"
              required
              class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-gray-900 font-black focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 text-lg shadow-sm"
            />
          </div>

          <div>
            <label
              for="mcpServerUrl"
              class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3 ml-1"
            >
              MCP Server URL
            </label>
            <input
              id="mcpServerUrl"
              bind:value={mcpServerUrl}
              type="url"
              placeholder="https://your-server.com"
              required
              class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-gray-900 font-black focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 text-lg shadow-sm"
            />
            <div class="flex items-center gap-2 mt-3 ml-1 text-gray-400">
              <Info size={14} class="text-blue-500" />
              <span class="text-[10px] font-bold uppercase tracking-wider"
                >Must be a public SSL endpoint</span
              >
            </div>
          </div>

          <div>
            <label
              for="businessPermit"
              class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3 ml-1"
            >
              Business Permit
            </label>
            <div
              class="mt-1 flex justify-center px-6 py-10 border-2 border-gray-100 border-dashed rounded-[2.5rem] hover:border-blue-500/50 hover:bg-blue-50/30 transition-all bg-gray-50 group cursor-pointer relative shadow-sm overflow-hidden"
            >
              <input
                id="businessPermit"
                bind:files={fileList}
                type="file"
                accept="image/*,.pdf"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div class="space-y-4 text-center">
                <div
                  class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform text-gray-300 group-hover:text-blue-600"
                >
                  <Upload size={32} strokeWidth={2.5} />
                </div>
                <div class="flex flex-col">
                  <span class="font-black text-gray-900 tracking-tight"
                    >Select your permit</span
                  >
                  <span
                    class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1"
                    >PNG, JPG, PDF (Max 5MB)</span
                  >
                </div>
              </div>
            </div>
            {#if fileList && fileList.length > 0}
              <div
                class="mt-6 text-sm text-emerald-700 flex items-center gap-3 bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 font-black animate-in zoom-in-95"
              >
                <div class="bg-emerald-600 text-white p-1 rounded-full">
                  <CheckCircle2 size={16} />
                </div>
                {fileList[0].name} selected
              </div>
            {/if}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            class="w-full flex items-center justify-center gap-4 bg-gray-900 hover:bg-black text-white py-6 px-8 rounded-3xl font-black text-xl transition-all shadow-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-8 group"
          >
            {#if isLoading}
              <Loader2 class="w-7 h-7 animate-spin" />
              <span>Processing...</span>
            {:else}
              Submit Registration
              <ArrowRight
                size={22}
                class="group-hover:translate-x-1 transition-transform"
              />
            {/if}
          </button>
        </form>

        <div
          class="mt-14 text-center text-[10px] text-gray-400 leading-relaxed border-t border-gray-100 pt-10 font-black uppercase tracking-[0.2em]"
        >
          Verification usually takes <span class="text-gray-900"
            >24-48 hours</span
          >.<br />
          Email confirmation will follow approval.
        </div>
      </div>
    </div>
  </main>
</div>
