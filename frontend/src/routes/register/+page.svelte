<script lang="ts">
  import { Loader2 } from "lucide-svelte";
  import { goto } from "$app/navigation";

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

      const res = await fetch("/api/register", {
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

<div class="min-h-screen flex items-center justify-center p-6">
  <div
    class="max-w-xl w-full bg-[#1c1e26] border border-gray-800 rounded-2xl p-8 shadow-2xl"
  >
    <div class="flex items-center justify-center gap-3 mb-2 font-bold text-xl">
      <img src="/logo-w.png" alt="Logo" class="w-12 h-12" />
      <span class="pt-5">Prompt Commerce</span>
    </div>
    <div class="text-center text-gray-400 mb-8 text-sm">
      Register your store on the AI catalog gateway
    </div>

    {#if errorMsg}
      <div
        class="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-6"
      >
        {errorMsg}
      </div>
    {/if}

    <form onsubmit={handleSubmit} class="space-y-5">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-300 mb-1">
          Store Name <span class="text-red-400">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          oninput={handleNameInput}
          placeholder="Steve's Sari-Sari Store"
          required
          class="w-full bg-[#0b0c10] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
      </div>

      <div>
        <label for="slug" class="block text-sm font-medium text-gray-300 mb-1">
          Store Slug <span class="text-red-400">*</span>
          <span class="text-gray-500 font-normal ml-1"
            >— URL-friendly, lowercase, no spaces</span
          >
        </label>
        <div
          class="flex items-center overflow-hidden bg-[#0b0c10] border border-gray-700 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors"
        >
          <span class="pl-4 pr-2 text-gray-500 text-sm whitespace-nowrap"
            >prompt-commerce.io/store/</span
          >
          <input
            id="slug"
            bind:value={slug}
            type="text"
            placeholder="steves-store"
            required
            pattern="[a-z0-9\-]+"
            class="w-full bg-transparent px-2 py-2.5 text-white focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label
          for="contactEmail"
          class="block text-sm font-medium text-gray-300 mb-1"
        >
          Contact Email <span class="text-red-400">*</span>
        </label>
        <input
          id="contactEmail"
          bind:value={contactEmail}
          type="email"
          placeholder="you@example.com"
          required
          class="w-full bg-[#0b0c10] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
      </div>

      <div>
        <label
          for="mcpServerUrl"
          class="block text-sm font-medium text-gray-300 mb-1"
        >
          MCP Server URL <span class="text-red-400">*</span>
          <span class="text-gray-500 font-normal ml-1"
            >— public URL where your prompt-commerce instance is running</span
          >
        </label>
        <input
          id="mcpServerUrl"
          bind:value={mcpServerUrl}
          type="url"
          placeholder="http://your-vps-ip:3001"
          required
          class="w-full bg-[#0b0c10] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
      </div>

      <div>
        <label
          for="businessPermit"
          class="block text-sm font-medium text-gray-300 mb-1"
        >
          Business Permit
          <span class="text-gray-500 font-normal ml-1"
            >— upload a photo or scan (max 5 MB)</span
          >
        </label>
        <div
          class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg hover:border-blue-500/50 transition-colors bg-[#0b0c10]"
        >
          <div class="space-y-1 text-center">
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div class="flex text-sm text-gray-400 justify-center">
              <label
                for="businessPermit"
                class="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload a file</span>
                <input
                  id="businessPermit"
                  bind:files={fileList}
                  type="file"
                  accept="image/*,.pdf"
                  class="sr-only"
                />
              </label>
              <p class="pl-1">or drag and drop</p>
            </div>
            <p class="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
          </div>
        </div>
        {#if fileList && fileList.length > 0}
          <div class="mt-2 text-sm text-emerald-400 flex items-center gap-2">
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path></svg
            >
            {fileList[0].name} selected
          </div>
        {/if}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
      >
        {#if isLoading}
          <Loader2 class="w-5 h-5 animate-spin" />
          Registering...
        {:else}
          Submit Registration
        {/if}
      </button>
    </form>

    <div
      class="mt-8 text-center text-sm text-gray-500 leading-relaxed border-t border-gray-800 pt-6"
    >
      Once your business permit is verified, you'll receive your platform key by
      email.<br />
      Paste it into your local
      <strong class="text-gray-300">prompt-commerce</strong> admin panel to go live.
    </div>
  </div>
</div>
