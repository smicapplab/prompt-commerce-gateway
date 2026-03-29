<script lang="ts">
  import { CheckCircle2, ArrowRight, Home } from 'lucide-svelte';
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
  <div class="max-w-xl w-full bg-white border border-gray-200 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl shadow-gray-200/50">
    <div class="flex justify-center mb-10">
      <div class="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-500 shadow-inner">
        <CheckCircle2 size={48} strokeWidth={2.5} />
      </div>
    </div>
    
    <h1 class="text-4xl font-black mb-4 text-gray-900 tracking-tight">Application Received</h1>
    <p class="text-gray-500 font-medium leading-relaxed mb-10 text-lg">
      Thank you for registering your store. Your application has been submitted successfully and is now pending manual review.
    </p>
    
    <div class="text-left bg-gray-50 p-8 rounded-[2rem] border border-gray-100 mb-10">
      <h3 class="text-[10px] uppercase tracking-[0.2em] font-black text-blue-600 mb-6 flex items-center gap-2">
        <div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
        What's Next?
      </h3>
      <ul class="space-y-4 text-sm text-gray-600 font-bold">
        <li class="flex items-start gap-3">
          <div class="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</div>
          <span>Our team will verify your business details and permit.</span>
        </li>
        <li class="flex items-start gap-3">
          <div class="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</div>
          <span>You will receive a confirmation email shortly.</span>
        </li>
        <li class="flex items-start gap-3">
          <div class="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</div>
          <span>Once approved, we will send your <strong class="text-gray-900 underline decoration-blue-500 decoration-2">Platform Key</strong> to your registered email address.</span>
        </li>
      </ul>
    </div>

    <a href="/" class="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white py-4 px-10 rounded-2xl font-black transition-all shadow-xl active:scale-95">
      <Home size={18} />
      Back to Home
    </a>
  </div>
</div>
