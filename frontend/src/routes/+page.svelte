<div class="min-h-screen flex items-center justify-center p-6">
  <div
    class="max-w-md w-full bg-[#1c1e26] border border-gray-800 rounded-2xl p-8 text-center shadow-2xl"
  >
    <div class="flex flex-col items-center gap-2">
      <img src="/logo-w.png" alt="Logo" class="w-12 h-12" />
      <h1 class="text-3xl font-bold mb-2">Prompt Commerce</h1>
      <p class="text-gray-400 mb-8">Gateway Portal</p>
    </div>
    <div class="flex flex-col gap-3 mb-8">
      <a
        href="/stores"
        class="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white py-4 px-6 rounded-xl font-bold transition-transform hover:scale-[1.02] active:scale-95 shadow-lg flex items-center justify-center gap-2"
      >
        Browse Stores
      </a>
      <div class="grid grid-cols-2 gap-3">
        <a
          href="/register"
          class="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
        >
          Register Store
        </a>
        <a
          href="/admin"
          class="bg-[#242731] hover:bg-gray-700 border border-gray-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
        >
          Admin Login
        </a>
      </div>
    </div>

    <div class="border-t border-gray-800 pt-8 text-left">
      <p
        class="text-xs text-gray-500 mb-4 uppercase tracking-wider font-semibold"
      >
        Claude Desktop Config
      </p>
      <pre
        class="bg-black/50 p-4 rounded-xl text-xs text-emerald-400 overflow-x-auto border border-gray-800"><code
          >{`{
  "mcpServers": {
    "prompt-commerce": {
      "url": "https://gateway.example.com/sse"
    }
  }
}`}</code
        ></pre>
    </div>
  </div>
</div>
