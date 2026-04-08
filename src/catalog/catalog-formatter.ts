import { Injectable } from '@nestjs/common';
import { CachedProduct, CachedCategory } from '@prisma/client';

export type FormatMode = 'html' | 'whatsapp';

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
    
    if (mode === 'html') {
      return `<b>${title}</b>\n💰 <b>₱${price}</b>\n\n${desc}${sku}${tags}`;
    } else {
      return `*${title}*\n💰 *₱${price}*\n\n${desc}${sku}${tags}`;
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
   * Formats a cart summary
   */
  cartSummary(storeName: string, items: Array<{ title: string, price: number, quantity: number }>, total: number, mode: FormatMode = 'html'): string {
    const escStore = this.esc(storeName, mode);
    if (!items.length) {
      return mode === 'html'
        ? `🛒 Your cart at <b>${escStore}</b> is empty.`
        : `🛒 Your cart at *${escStore}* is empty.`;
    }

    const lines = mode === 'html'
      ? [`🛒 <b>Cart — ${escStore}</b>`, '']
      : [`🛒 *Cart — ${escStore}*`, ''];

    for (const item of items) {
      lines.push(`• ${this.esc(item.title, mode)} × ${item.quantity} = ₱${this.price(item.price * item.quantity)}`);
    }

    lines.push('');
    if (mode === 'html') {
      lines.push(`<b>Total: ₱${this.price(total)}</b>`);
    } else {
      lines.push(`*Total: ₱${this.price(total)}*`);
    }
    return lines.join('\n');
  }
}
