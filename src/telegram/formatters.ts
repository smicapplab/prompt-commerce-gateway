import type { CartItem } from '../cart/cart.service';

// ─── Escape HTML for Telegram HTML parse mode ─────────────────────────────────
export function esc(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Price ────────────────────────────────────────────────────────────────────
export function price(value: number | null | undefined): string {
  if (value == null) return 'Price on request';
  return `₱${value.toFixed(2)}`;
}

// ─── Product detail message ───────────────────────────────────────────────────
export function productDetail(product: {
  id: number;
  title: string;
  description?: string | null;
  price?: number | null;
  stock_quantity?: number;
  sku?: string | null;
  tags?: string[];
  images?: string[];
}): string {
  const lines: string[] = [];
  lines.push(`<b>${esc(product.title)}</b>`);
  if (product.sku) lines.push(`<i>SKU: ${esc(product.sku)}</i>`);
  lines.push('');
  if (product.description) lines.push(esc(product.description));
  lines.push('');
  lines.push(`💰 <b>${price(product.price)}</b>`);
  if (product.stock_quantity != null) {
    const stock = product.stock_quantity;
    lines.push(stock > 0 ? `📦 ${stock} in stock` : '⚠️ Out of stock');
  }
  if (product.tags?.length) {
    lines.push(`🏷 ${product.tags.map(t => `#${t}`).join(' ')}`);
  }
  return lines.join('\n');
}

// ─── Product list item (compact) ─────────────────────────────────────────────
export function productListItem(product: {
  id: number;
  title: string;
  price?: number | null;
  stock_quantity?: number;
}): string {
  const stockBadge = product.stock_quantity === 0 ? ' ⚠️' : '';
  return `${esc(product.title)}${stockBadge} — ${price(product.price)}`;
}

// ─── Cart summary ─────────────────────────────────────────────────────────────
export function cartSummary(storeName: string, items: CartItem[], total: number): string {
  if (!items.length) {
    return `🛒 Your cart at <b>${esc(storeName)}</b> is empty.`;
  }
  const lines = [`🛒 <b>Cart — ${esc(storeName)}</b>`, ''];
  for (const item of items) {
    lines.push(`• ${esc(item.title)} × ${item.quantity} = ${price(item.price * item.quantity)}`);
  }
  lines.push('');
  lines.push(`<b>Total: ${price(total)}</b>`);
  return lines.join('\n');
}

// ─── Order confirmation ───────────────────────────────────────────────────────
export function orderConfirmation(orderId: number, items: CartItem[], total: number): string {
  const lines = [
    `✅ <b>Order #${orderId} placed!</b>`,
    '',
    ...items.map(i => `• ${esc(i.title)} × ${i.quantity} — ${price(i.price * i.quantity)}`),
    '',
    `<b>Total: ${price(total)}</b>`,
    '',
    'We\'ll process your order shortly. Thank you! 🎉',
  ];
  return lines.join('\n');
}

// ─── Welcome message ──────────────────────────────────────────────────────────
export function welcomeMessage(firstName: string): string {
  return (
    `👋 Hi <b>${esc(firstName)}</b>! Welcome to <b>Prompt Commerce</b>.\n\n` +
    `Browse our stores, chat with the AI assistant, or search for products.\n\n` +
    `Select a store below to get started 👇`
  );
}

// ─── Store menu ───────────────────────────────────────────────────────────────
export function storeMenuMessage(storeName: string): string {
  return (
    `🏪 <b>${esc(storeName)}</b>\n\n` +
    `What would you like to do?`
  );
}
