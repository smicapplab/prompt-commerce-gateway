import { Injectable } from '@nestjs/common';
import { CachedProduct, CachedCategory } from '@prisma/client';

@Injectable()
export class CatalogFormatter {
  /**
   * Escape HTML-sensitive characters for Telegram (or generic use)
   */
  esc(str: string | undefined | null): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
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
  productDetail(product: CachedProduct, mcpServerUrl?: string): string {
    const title = this.esc(product.title);
    const price = this.price(product.price);
    const desc = this.esc(product.description);
    const tags = product.tags && product.tags.length > 0 ? `\n🏷 <i>${product.tags.map(t => '#' + t).join(' ')}</i>` : '';
    const sku = product.sku ? `\n🆔 SKU: <code>${this.esc(product.sku)}</code>` : '';
    
    // Attempt to build public image URL if mcpServerUrl is provided
    let imageInfo = '';
    if (product.images && product.images.length > 0 && mcpServerUrl) {
      const baseUrl = mcpServerUrl.replace(/\/sse\/?$/, ''); // Remove /sse from end
      const firstImage = product.images[0];
      const publicImageUrl = `${baseUrl}/uploads/${firstImage}`;
      // Note: We don't return the URL in the text usually for WhatsApp, but for Telegram we might
    }

    return `<b>${title}</b>\n💰 <b>₱${price}</b>\n\n${desc}${sku}${tags}`;
  }

  /**
   * Formats a product for a list view (one-liner)
   */
  productListLine(product: CachedProduct): string {
    const title = this.esc(product.title);
    const price = this.price(product.price);
    return `• ${title} - ₱${price}`;
  }

  /**
   * Formats a cart summary
   */
  cartSummary(storeName: string, items: Array<{ title: string, price: number, quantity: number }>, total: number): string {
    if (!items.length) {
      return `🛒 Your cart at <b>${this.esc(storeName)}</b> is empty.`;
    }
    const lines = [`🛒 <b>Cart — ${this.esc(storeName)}</b>`, ''];
    for (const item of items) {
      lines.push(`• ${this.esc(item.title)} × ${item.quantity} = ₱${this.price(item.price * item.quantity)}`);
    }
    lines.push('');
    lines.push(`<b>Total: ₱${this.price(total)}</b>`);
    return lines.join('\n');
  }
}
