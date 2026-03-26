import { c as attr } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { Z as Zap } from "../../../chunks/zap.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let name = "";
    let slug = "";
    let contactEmail = "";
    let mcpServerUrl = "";
    let isLoading = false;
    $$renderer2.push(`<div class="min-h-screen flex items-center justify-center p-6"><div class="max-w-xl w-full bg-[#1c1e26] border border-gray-800 rounded-2xl p-8 shadow-2xl"><div class="flex items-center justify-center gap-3 mb-2 font-bold text-xl"><div class="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500">`);
    Zap($$renderer2, { size: 20 });
    $$renderer2.push(`<!----></div> Prompt Commerce</div> <div class="text-center text-gray-400 mb-8 text-sm">Register your store on the AI catalog gateway</div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <form class="space-y-5"><div><label for="name" class="block text-sm font-medium text-gray-300 mb-1">Store Name <span class="text-red-400">*</span></label> <input id="name" type="text"${attr("value", name)} placeholder="Steve's Sari-Sari Store" required="" class="w-full bg-[#0b0c10] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"/></div> <div><label for="slug" class="block text-sm font-medium text-gray-300 mb-1">Store Slug <span class="text-red-400">*</span> <span class="text-gray-500 font-normal ml-1">— URL-friendly, lowercase, no spaces</span></label> <div class="flex items-center overflow-hidden bg-[#0b0c10] border border-gray-700 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors"><span class="pl-4 pr-2 text-gray-500 text-sm whitespace-nowrap">prompt-commerce.io/store/</span> <input id="slug"${attr("value", slug)} type="text" placeholder="steves-store" required="" pattern="[a-z0-9\\-]+" class="w-full bg-transparent px-2 py-2.5 text-white focus:outline-none"/></div></div> <div><label for="contactEmail" class="block text-sm font-medium text-gray-300 mb-1">Contact Email <span class="text-red-400">*</span></label> <input id="contactEmail"${attr("value", contactEmail)} type="email" placeholder="you@example.com" required="" class="w-full bg-[#0b0c10] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"/></div> <div><label for="mcpServerUrl" class="block text-sm font-medium text-gray-300 mb-1">MCP Server URL <span class="text-red-400">*</span> <span class="text-gray-500 font-normal ml-1">— public URL where your prompt-commerce instance is running</span></label> <input id="mcpServerUrl"${attr("value", mcpServerUrl)} type="url" placeholder="http://your-vps-ip:3001" required="" class="w-full bg-[#0b0c10] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"/></div> <div><label for="businessPermit" class="block text-sm font-medium text-gray-300 mb-1">Business Permit <span class="text-gray-500 font-normal ml-1">— upload a photo or scan (max 5 MB)</span></label> <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg hover:border-blue-500/50 transition-colors bg-[#0b0c10]"><div class="space-y-1 text-center"><svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <div class="flex text-sm text-gray-400 justify-center"><label for="businessPermit" class="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"><span>Upload a file</span> <input id="businessPermit" type="file" accept="image/*,.pdf" class="sr-only"/></label> <p class="pl-1">or drag and drop</p></div> <p class="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <button type="submit"${attr("disabled", isLoading, true)} class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2">`);
    {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`Submit Registration`);
    }
    $$renderer2.push(`<!--]--></button></form> <div class="mt-8 text-center text-sm text-gray-500 leading-relaxed border-t border-gray-800 pt-6">Once your business permit is verified, you'll receive your platform key by email.<br/> Paste it into your local <strong class="text-gray-300">prompt-commerce</strong> admin panel to go live.</div></div></div>`);
  });
}
export {
  _page as default
};
