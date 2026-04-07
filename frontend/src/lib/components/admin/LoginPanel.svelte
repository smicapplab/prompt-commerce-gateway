<script lang="ts">
  import { Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-svelte";
  import { apiFetch } from "$lib/api";

  let { onLoginSuccess } = $props<{
    onLoginSuccess: (token: string) => void;
  }>();

  // Login Form
  let lUser = $state("");
  let lPass = $state("");
  let showPass = $state(false);
  let isLoggingIn = $state(false);
  let loginError = $state("");

  async function handleLogin(e: Event) {
    e.preventDefault();
    loginError = "";
    isLoggingIn = true;

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: lUser, password: lPass }),
      });
      if (!res.ok) throw new Error("Invalid credentials.");
      const data = await res.json();
      onLoginSuccess(data.access_token);
    } catch (err: any) {
      loginError = err.message || "Login failed";
    } finally {
      isLoggingIn = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
  <!-- Decoration -->
  <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/50 blur-3xl rounded-full"></div>
  <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-50/50 blur-3xl rounded-full"></div>

  <div class="max-w-md w-full relative z-10">
    <div class="bg-white border border-gray-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-gray-200/50">
      <div class="flex flex-col items-center gap-6 mb-12 text-center">
        <div class="w-20 h-20 bg-gray-900 rounded-[2rem] flex items-center justify-center shadow-2xl transform -rotate-6 transition-transform hover:rotate-0 duration-500">
          <Lock size={40} class="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tight leading-tight">Admin Portal</h1>
          <p class="text-gray-500 font-medium text-sm mt-2">Manage your AI retail network</p>
        </div>
      </div>

      {#if loginError}
        <div class="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-black mb-8 flex items-center gap-4">
          <div class="w-3 h-3 rounded-full bg-red-600 animate-pulse"></div>
          {loginError}
        </div>
      {/if}

      <form onsubmit={handleLogin} class="space-y-6">
        <div>
          <label for="lUser" class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3 ml-1">Username</label>
          <input
            id="lUser"
            type="text"
            bind:value={lUser}
            placeholder="admin"
            required
            class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-gray-900 font-black focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 text-sm shadow-sm"
          />
        </div>
        <div>
          <label for="lPass" class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3 ml-1">Password</label>
          <div class="relative">
            <input
              id="lPass"
              type={showPass ? "text" : "password"}
              bind:value={lPass}
              placeholder="••••••••"
              required
              class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-gray-900 font-black focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 text-sm shadow-sm pr-14"
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
            <ArrowRight size={24} class="group-hover:translate-x-1 transition-transform" />
          {/if}
        </button>
      </form>
    </div>
  </div>
</div>
