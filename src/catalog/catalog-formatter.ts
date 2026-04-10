import { Injectable } from '@nestjs/common';
import { CachedProduct, CachedCategory } from '@prisma/client';

export type FormatMode = 'html' | 'whatsapp';

export interface CartItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
}

@Injectable()
export class CatalogFormatter {
  /**
   * Escape sensitive characters
   */
  esc(str: string | undefined | null, mode: FormatMode = 'html'): string {
    if (!str) return '';
    if (mode === 'html') {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
    // WhatsApp doesn't need HTML escaping but we might want to escape its own special chars if needed
    // However, usually we just pass text as is.
    return str;
  }

  /**
   * Formats a price number into a currency string (e.g., 50000 -> "50,000")
   */
  price(amount: number | undefined | null): string {
    if (amount === undefined || amount === null) return '0';
    return new Intl.NumberFormat('en-PH').format(amount);
  }

  /**
   * Formats a product into a detailed multi-line string
   */
  productDetail(product: CachedProduct, mode: FormatMode = 'html', mcpServerUrl?: string): string {
    const title = this.esc(product.title, mode);
    const price = this.price(product.price);
    const desc = this.esc(product.description, mode);
    
    let tags = '';
    if (product.tags && product.tags.length > 0) {
      const tagList = product.tags.map(t => '#' + t).join(' ');
      tags = mode === 'html' 
        ? `\n🏷 <i>${tagList}</i>` 
        : `\n🏷 _${tagList}_`;
    }

    let sku = '';
    if (product.sku) {
      const escapedSku = this.esc(product.sku, mode);
      sku = mode === 'html'
        ? `\n🆔 SKU: <code>${escapedSku}</code>`
        : `\n🆔 SKU: \`\`\`${escapedSku}\`\`\``;
    }

    const stock = product.stockQuantity != null
      ? (mode === 'html' 
          ? `\n📦 ${product.stockQuantity === 0 ? '⚠️ <i>Out of stock</i>' : `${product.stockQuantity} in stock`}`
          : `\n📦 ${product.stockQuantity === 0 ? '⚠️ _Out of stock_' : `${product.stockQuantity} in stock`}`)
      : '';
    
    if (mode === 'html') {
      return `<b>${title}</b>\n💰 <b>₱${price}</b>${stock}\n\n${desc}${sku}${tags}`;
    } else {
      return `*${title}*\n💰 *₱${price}*${stock}\n\n${desc}${sku}${tags}`;
    }
  }

  /**
   * Formats a product into a concise one-liner or short block for search results
   */
  productShortDetail(product: CachedProduct, storeName?: string, mode: FormatMode = 'html'): string {
    const title = this.esc(product.title, mode);
    const price = this.price(product.price);
    const store = storeName ? (mode === 'html' ? `\n🏪 <i>${this.esc(storeName, mode)}</i>` : `\n🏪 _${this.esc(storeName, mode)}_`) : '';
    const stock = product.stockQuantity != null && product.stockQuantity === 0
      ? (mode === 'html' ? ' ⚠️ <i>(Out of stock)</i>' : ' ⚠️ _(Out of stock)_')
      : '';

    if (mode === 'html') {
      return `<b>${title}</b>\n💰 <b>₱${price}</b>${stock}${store}`;
    } else {
      return `*${title}*\n💰 *₱${price}*${stock}${store}`;
    }
  }

  /**
   * Formats a product for a list view (one-liner)
   */
  productListLine(product: CachedProduct, mode: FormatMode = 'html'): string {
    const title = this.esc(product.title, mode);
    const price = this.price(product.price);
    return `• ${title} - ₱${price}`;
  }

  /**
   * Formats a product into a beautiful e-commerce card for Telegram/WhatsApp
   */
  productCard(
    product: { 
      title: string; 
      price: number | null; 
      stockQuantity: number | null; 
      description?: string | null; 
      storeName?: string | null; 
      sku?: string | null 
    },
    mode: FormatMode = 'html',
    options: {
      showStore?: boolean;
      showSku?: boolean;
      pageInfo?: string;
    } = {}
  ): string {
    const title = this.esc(product.title, mode);
    const price = this.price(product.price);
    const badge = this.stockBadge(product.stockQuantity ?? 0);
    
    const bold = (s: string) => mode === 'html' ? `<b>${s}</b>` : `*${s}*`;
    const italic = (s: string) => mode === 'html' ? `<i>${s}</i>` : `_${s}_`;
    const code = (s: string) => mode === 'html' ? `<code>${s}</code>` : `\`\`\`${s}\`\`\``;

    const lines = [
      bold(title),
      mode === 'html' ? '──────────────────────' : '----------------------',
      `💰 ₱${price}  ·  📦 ${badge}`
    ];

    if (options.showSku && product.sku) {
      lines.push(`🏷️ SKU: ${code(this.esc(product.sku, mode))}`);
    }

    if (options.showStore && product.storeName) {
      lines.push(`🏪 Store: ${italic(this.esc(product.storeName, mode))}`);
    }

    if (product.description) {
      const desc = this.esc(product.description, mode);
      const shortDesc = desc.length > 80 ? desc.slice(0, 77) + '...' : desc;
      lines.push(italic(shortDesc));
    }

    if (options.pageInfo) {
      lines.push('');
      lines.push(italic(options.pageInfo));
    }

    return lines.join('\n');
  }

  /**
   * Returns a stock status badge with emoji
   */
  stockBadge(stock: number): string {
    if (stock === 0) return '❌ Out of Stock';
    if (stock <= 3) return `⚠️ Low Stock (${stock} left)`;
    return '✅ In Stock';
  }

  /**
   * Formats a standardized AI greeting
   */
  formatAiGreeting(storeName: string, mode: FormatMode = 'html'): string {
    const bold = (s: string) => mode === 'html' ? `<b>${s}</b>` : `*${s}*`;
    return [
      `🤖 ${bold(`AI Assistant — ${storeName}`)}`,
      '',
      `Hi! I'm the AI shopping assistant for ${storeName}. I can help you:`,
      '• Search for products',
      '• Answer questions about items',
      '• Guide you through checkout',
      '',
      'What are you looking for today?',
    ].join('\n');
  }

  /**
   * Formats a cart summary for WhatsApp/Telegram
   */
  cartSummary(storeName: string, items: CartItem[], total: number, mode: FormatMode = 'html'): string {
    const bold = (s: string) => mode === 'html' ? `<b>${s}</b>` : `*${s}*`;
    
    if (!items.length) {
      return `🛒 Your cart at ${bold(this.esc(storeName, mode))} is empty.`;
    }
    
    const lines = [`🛒 ${bold(`Cart — ${this.esc(storeName, mode)}`)}`, ''];
    for (const item of items) {
      lines.push(`• ${this.esc(item.title, mode)} × ${item.quantity} = ₱${this.price(item.price * item.quantity)}`);
    }
    lines.push('');
    lines.push(bold(`Total: ₱${this.price(total)}`));
    return lines.join('\n');
  }
}
