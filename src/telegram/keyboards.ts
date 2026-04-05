import { InlineKeyboard } from 'grammy';
import type { CartItem } from './cart.service';

// ─── Callback data prefixes ───────────────────────────────────────────────────
// All must stay ≤ 64 bytes total (Telegram limit).
// Format: prefix:storeSlug[:id[:page]]

export const CB = {
  store:    (slug: string)                => `s:${slug}`,
  cats:     (slug: string)                => `cats:${slug}`,
  cat:      (slug: string, id: number)    => `c:${slug}:${id}`,
  prod:     (slug: string, id: number)    => `p:${slug}:${id}`,
  qty:      (slug: string, id: number)    => `qty:${slug}:${id}`,
  addCart:  (slug: string, id: number)    => `a:${slug}:${id}`,
  rmCart:   (slug: string, id: number)    => `r:${slug}:${id}`,
  cart:     (slug: string)                => `cart:${slug}`,
  checkout: (slug: string)                => `chk:${slug}`,
  ai:       (slug: string)                => `ai:${slug}`,
  back:     (slug: string)                => `bk:${slug}`,
  page:     (slug: string, cat: number | string, pg: number) => `pg:${slug}:${cat}:${pg}`,
};

// ─── Store list ───────────────────────────────────────────────────────────────
export function storeListKeyboard(stores: Array<{ slug: string; name: string }>): InlineKeyboard {
  const kb = new InlineKeyboard();
  for (const s of stores) {
    kb.text(s.name, CB.store(s.slug)).row();
  }
  return kb;
}

// ─── Store main menu ──────────────────────────────────────────────────────────
export function storeMenuKeyboard(slug: string): InlineKeyboard {
  return new InlineKeyboard()
    .text('🗂 Browse Categories', CB.cats(slug)).row()
    .text('🤖 Ask AI Assistant',  CB.ai(slug)).row()
    .text('🛒 View Cart',         CB.cart(slug)).row();
}

// ─── Category list ────────────────────────────────────────────────────────────
export function categoryKeyboard(
  slug: string,
  categories: Array<{ id: number; name: string }>,
): InlineKeyboard {
  const kb = new InlineKeyboard();
  for (const c of categories) {
    kb.text(c.name, CB.cat(slug, c.id)).row();
  }
  kb.text('⬅️ Back', CB.back(slug));
  return kb;
}

// ─── Product list (with pagination) ──────────────────────────────────────────
export function productListKeyboard(
  slug: string,
  products: Array<{ id: number; title: string; price: number | null }>,
  catId: number | string,
  page: number,
  hasMore: boolean,
): InlineKeyboard {
  const ph = (n: number | null) => n == null ? 'TBD' : `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;
  const kb = new InlineKeyboard();
  for (const p of products) {
    const label = `${p.title.slice(0, 35)} (${ph(p.price)})`;
    kb.text(label, CB.prod(slug, p.id)).row();
  }
  // Pagination row
  if (page > 0 || hasMore) {
    if (page > 0) kb.text('◀️ Prev', CB.page(slug, catId, page - 1));
    if (hasMore)  kb.text('Next ▶️', CB.page(slug, catId, page + 1));
    kb.row();
  }
  kb.text('⬅️ Back', CB.cats(slug));
  return kb;
}

// ─── Product detail ───────────────────────────────────────────────────────────
export function productDetailKeyboard(
  slug: string,
  productId: number,
  catId: number | string,
  page: number,
): InlineKeyboard {
  return new InlineKeyboard()
    .text('🛒 Add to Cart', CB.qty(slug, productId)).row()
    .text('🛍 View Cart', CB.cart(slug))
    .text('⬅️ Back', CB.page(slug, catId, page));
}

// ─── Product detail (from search context) ─────────────────────────────────────
// "Back to Search" re-paginates from offset 0 using stored search query.
export function productDetailSearchKeyboard(
  slug: string,
  productId: number,
): InlineKeyboard {
  return new InlineKeyboard()
    .text('🛒 Add to Cart', CB.qty(slug, productId)).row()
    .text('🛍 View Cart', CB.cart(slug))
    .text('🔍 Back to Search', 'srch:0');
}

// ─── Product detail (from AI chat context) ────────────────────────────────────
// "Back to AI" re-enters the store's AI assistant.
export function productDetailAiKeyboard(
  slug: string,
  productId: number,
): InlineKeyboard {
  return new InlineKeyboard()
    .text('🛒 Add to Cart', CB.qty(slug, productId)).row()
    .text('🛍 View Cart', CB.cart(slug))
    .text('🤖 Back to AI Chat', CB.ai(slug));
}

// ─── Quantity selection ───────────────────────────────────────────────────────
export function quantityKeyboard(slug: string, productId: number): InlineKeyboard {
  return new InlineKeyboard()
    .text('1', `a:${slug}:${productId}:1`)
    .text('2', `a:${slug}:${productId}:2`)
    .text('3', `a:${slug}:${productId}:3`)
    .text('4', `a:${slug}:${productId}:4`)
    .text('5', `a:${slug}:${productId}:5`).row()
    .text('⬅️ Cancel', CB.prod(slug, productId));
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export function cartKeyboard(slug: string, items: CartItem[]): InlineKeyboard {
  const kb = new InlineKeyboard();
  for (const item of items) {
    kb.text(`❌ Remove ${item.title.slice(0, 25)}`, CB.rmCart(slug, item.productId)).row();
  }
  kb.text('✅ Checkout',  CB.checkout(slug)).row();
  kb.text('🏪 Back to Store', CB.back(slug));
  return kb;
}

// ─── Empty cart ───────────────────────────────────────────────────────────────
export function emptyCartKeyboard(slug: string): InlineKeyboard {
  return new InlineKeyboard()
    .text('🗂 Browse Products', CB.cats(slug)).row()
    .text('🤖 Ask AI',          CB.ai(slug));
}

// ─── AI mode ──────────────────────────────────────────────────────────────────
export function aiModeKeyboard(slug: string): InlineKeyboard {
  return new InlineKeyboard()
    .text('🛒 View Cart',    CB.cart(slug))
    .text('🏪 Back to Store', CB.back(slug));
}

// ─── AI mode with product buttons ────────────────────────────────────────────
// Shown after an AI search response — each found product is a tappable button.
export function aiProductKeyboard(
  slug: string,
  products: Array<{ id: number; title: string; price: number | null }>,
): InlineKeyboard {
  const ph = (n: number | null) => n == null ? 'TBD' : `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;
  const kb = new InlineKeyboard();
  for (const p of products) {
    const label = `${p.title.slice(0, 30)} (${ph(p.price)})`;
    kb.text(label, CB.prod(slug, p.id)).row();
  }
  kb.text('🛒 View Cart', CB.cart(slug))
    .text('🏪 Back to Store', CB.back(slug));
  return kb;
}

// ─── Back to store only ───────────────────────────────────────────────────────
export function backKeyboard(slug: string): InlineKeyboard {
  return new InlineKeyboard().text('🏪 Back to Store', CB.back(slug));
}
