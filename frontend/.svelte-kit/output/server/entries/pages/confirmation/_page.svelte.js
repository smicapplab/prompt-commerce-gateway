import "clsx";
import { s as sanitize_props, a as spread_props, b as slot } from "../../../chunks/index2.js";
import { I as Icon } from "../../../chunks/Icon.js";
function Circle_check($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.477.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    ["path", { "d": "m9 12 2 2 4-4" }]
  ];
  Icon($$renderer, spread_props([
    { name: "circle-check" },
    $$sanitized_props,
    {
      /**
       * @component @name CircleCheck
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8cGF0aCBkPSJtOSAxMiAyIDIgNC00IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/circle-check
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page($$renderer) {
  $$renderer.push(`<div class="min-h-screen flex items-center justify-center p-6"><div class="max-w-md w-full bg-[#1c1e26] border border-gray-800 rounded-2xl p-10 text-center shadow-2xl"><div class="flex justify-center mb-6"><div class="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">`);
  Circle_check($$renderer, { size: 32 });
  $$renderer.push(`<!----></div></div> <h1 class="text-2xl font-bold mb-4 text-white">Application Received</h1> <p class="text-gray-400 leading-relaxed mb-8">Thank you for registering your store. Your application has been submitted successfully and is now pending manual review.</p> <div class="text-left bg-black/20 p-6 rounded-xl border border-gray-800 mb-8"><h3 class="text-xs uppercase tracking-wider font-semibold text-blue-400 mb-4">What's Next?</h3> <ul class="space-y-3 text-sm text-gray-300 list-disc pl-5"><li>Our team will verify your business details and permit.</li> <li>You will receive a confirmation email shortly.</li> <li>Once approved, we will send your <strong class="text-white">Platform Key</strong> to your registered email address.</li></ul></div> <a href="/" class="inline-block bg-gray-800 hover:bg-gray-700 text-white py-2.5 px-6 rounded-lg font-medium transition-colors">Back to Home</a></div></div>`);
}
export {
  _page as default
};
