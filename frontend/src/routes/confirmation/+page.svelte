<script lang="ts">
  import { CheckCircle2 } from 'lucide-svelte';
</script>

<div class="min-h-screen flex items-center justify-center p-6">
  <div class="max-w-md w-full bg-[#1c1e26] border border-gray-800 rounded-2xl p-10 text-center shadow-2xl">
    <div class="flex justify-center mb-6">
      <div class="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
        <CheckCircle2 size={32} />
      </div>
    </div>
    
    <h1 class="text-2xl font-bold mb-4 text-white">Application Received</h1>
    <p class="text-gray-400 leading-relaxed mb-8">
      Thank you for registering your store. Your application has been submitted successfully and is now pending manual review.
    </p>
    
    <div class="text-left bg-black/20 p-6 rounded-xl border border-gray-800 mb-8">
      <h3 class="text-xs uppercase tracking-wider font-semibold text-blue-400 mb-4">What's Next?</h3>
      <ul class="space-y-3 text-sm text-gray-300 list-disc pl-5">
        <li>Our team will verify your business details and permit.</li>
        <li>You will receive a confirmation email shortly.</li>
        <li>Once approved, we will send your <strong class="text-white">Platform Key</strong> to your registered email address.</li>
      </ul>
    </div>

    <a href="/" class="inline-block bg-gray-800 hover:bg-gray-700 text-white py-2.5 px-6 rounded-lg font-medium transition-colors">
      Back to Home
    </a>
  </div>
</div>
