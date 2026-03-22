// ─────────────────────────────────────────────────────────────────────────────
// In-memory cart store — one cart per (userId, storeSlug) pair.
// Resets on server restart; good enough for the Telegram prototype.
// ─────────────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
}

type CartKey = string; // `${userId}:${storeSlug}`

const carts = new Map<CartKey, CartItem[]>();

function key(userId: number, storeSlug: string): CartKey {
  return `${userId}:${storeSlug}`;
}

export const CartStore = {
  get(userId: number, storeSlug: string): CartItem[] {
    return carts.get(key(userId, storeSlug)) ?? [];
  },

  add(userId: number, storeSlug: string, item: Omit<CartItem, 'quantity'>, qty = 1): CartItem[] {
    const k = key(userId, storeSlug);
    const cart = carts.get(k) ?? [];
    const existing = cart.find(i => i.productId === item.productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ ...item, quantity: qty });
    }
    carts.set(k, cart);
    return cart;
  },

  remove(userId: number, storeSlug: string, productId: number): CartItem[] {
    const k = key(userId, storeSlug);
    const cart = (carts.get(k) ?? []).filter(i => i.productId !== productId);
    carts.set(k, cart);
    return cart;
  },

  clear(userId: number, storeSlug: string): void {
    carts.delete(key(userId, storeSlug));
  },

  total(userId: number, storeSlug: string): number {
    return CartStore.get(userId, storeSlug)
      .reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  isEmpty(userId: number, storeSlug: string): boolean {
    const cart = carts.get(key(userId, storeSlug));
    return !cart || cart.length === 0;
  },
};
