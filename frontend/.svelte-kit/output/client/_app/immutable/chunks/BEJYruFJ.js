import{C as m,z as t,D as $,F as h,G as u,h as _,f as b}from"./yGL7olir.js";import{c as y,a as k}from"./BnmpjQZA.js";import"./Dw9Aqclx.js";import{I as E,s as S}from"./DMqIy6ot.js";import{l as z,s as I}from"./DyYNTT68.js";function x(e,a,s=a){var c=new WeakSet;m(e,"input",async l=>{var r=l?e.defaultValue:e.value;if(r=v(e)?d(r):r,s(r),t!==null&&c.add(t),await $(),r!==(r=a())){var f=e.selectionStart,o=e.selectionEnd,i=e.value.length;if(e.value=r??"",o!==null){var n=e.value.length;f===o&&o===i&&n>i?(e.selectionStart=n,e.selectionEnd=n):(e.selectionStart=f,e.selectionEnd=Math.min(o,n))}}}),(_&&e.defaultValue!==e.value||h(a)==null&&e.value)&&(s(v(e)?d(e.value):e.value),t!==null&&c.add(t)),u(()=>{var l=a();if(e===document.activeElement){var r=t;if(c.has(r))return}v(e)&&l===d(e.value)||e.type==="date"&&!l&&!e.value||l!==e.value&&(e.value=l??"")})}function v(e){var a=e.type;return a==="number"||a==="range"}function d(e){return e===""?null:+e}function C(e,a,s=a){m(e,"change",()=>{s(e.files)}),_&&e.files&&s(e.files),u(()=>{e.files=a()})}function D(e,a){const s=z(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const c=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56"}]];E(e,I({name:"loader-circle"},()=>s,{get iconNode(){return c},children:(l,r)=>{var f=y(),o=b(f);S(o,a,"default",{}),k(l,f)},$$slots:{default:!0}}))}export{D as L,C as a,x as b};
