<script lang="ts">
  import { page } from '$app/stores';
  import { LayoutDashboard, Store, UserPlus, Home, Menu, X, Search } from 'lucide-svelte';
  import { slide } from 'svelte/transition';

  let isMobileMenuOpen = $state(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/stores', label: 'Browse Stores', icon: Store },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/register', label: 'Register', icon: UserPlus },
    { href: '/admin', label: 'Admin Portal', icon: LayoutDashboard },
  ];

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }
</script>

<header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
    <!-- Logo & Brand -->
    <a href="/" class="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group">
      <div class="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-all duration-300">
        <img src="/logo-w.png" alt="Logo" class="w-6 h-6" />
      </div>
      <div class="flex flex-col">
          <span class="text-lg font-black text-gray-900 tracking-tight leading-none uppercase">Prompt Commerce</span>
          <span class="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Gateway Hub</span>
      </div>
    </a>

    <!-- Desktop Nav -->
    <nav class="hidden md:flex items-center gap-1">
      {#each navLinks as link}
        <a 
          href={link.href} 
          class="px-4 py-2.5 rounded-2xl text-sm font-black transition-all flex items-center gap-2.5 
          {$page.url.pathname === link.href || ($page.url.pathname.startsWith(link.href) && link.href !== '/') 
            ? 'bg-gray-100 text-gray-900 shadow-sm' 
            : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}"
        >
          <link.icon size={18} strokeWidth={2.5} />
          {link.label}
        </a>
      {/each}
    </nav>

    <!-- Mobile Menu Toggle -->
    <button 
      class="md:hidden p-2 rounded-2xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
      onclick={toggleMobileMenu}
      aria-label="Toggle Menu"
    >
      {#if isMobileMenuOpen}
        <X size={24} />
      {:else}
        <Menu size={24} />
      {/if}
    </button>
  </div>

  <!-- Mobile Nav -->
  {#if isMobileMenuOpen}
    <div class="md:hidden bg-white border-t border-gray-100 p-4 shadow-xl" transition:slide={{ duration: 250 }}>
      <nav class="flex flex-col gap-2">
        {#each navLinks as link}
          <a 
            href={link.href} 
            onclick={() => isMobileMenuOpen = false}
            class="px-5 py-4 rounded-2xl text-base font-black flex items-center gap-4 transition-all
            {$page.url.pathname === link.href || ($page.url.pathname.startsWith(link.href) && link.href !== '/') 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'text-gray-500 bg-gray-50'}"
          >
            <link.icon size={22} strokeWidth={2.5} />
            {link.label}
          </a>
        {/each}
      </nav>
    </div>
  {/if}
</header>
