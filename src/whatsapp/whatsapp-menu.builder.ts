import { InteractiveMessage } from './whatsapp-client';
import { CachedProduct, CachedCategory } from '@prisma/client';

export const WA_ACTION = {
  STORE_SELECT: 'store_sel',
  STORE_MENU: 'store_menu',
  CAT_MENU: 'cat_menu',
  CAT_SELECT: 'cat_sel',
  PROD_SELECT: 'prod_sel',
  CART_VIEW: 'cart_view',
  CART_ADD: 'cart_add',
  QTY_SEL: 'qty_sel',
  CHECKOUT: 'checkout',
  SEARCH: 'search',
  AI_CHAT: 'ai_chat',
  ADDR_SELECT: 'addr_sel',
  ADDR_NEW: 'addr_new',
  DELIVERY_SEL: 'delivery_sel',
  LABEL_SEL: 'label_sel',
  PAY_SEL: 'pay_sel',
  PREV_PAGE: 'prev_page',
  NEXT_PAGE: 'next_page',
};

// ─── Welcome / Store Selection ──────────────────────────────────────────────
export function buildStoreListMenu(stores: { slug: string; name: string }[]): InteractiveMessage {
  return {
    type: 'list',
    header: { type: 'text', text: 'Prompt Commerce' },
    body: { text: 'Welcome! Please select a store to start shopping.' },
    footer: { text: 'Select a store below 👇' },
    action: {
      button: 'View Stores',
      sections: [
        {
          title: 'Available Stores',
          rows: stores.slice(0, 10).map((s) => ({
            id: `${WA_ACTION.STORE_SELECT}:${s.slug}`,
            title: s.name.substring(0, 24),
            description: `Visit ${s.name}`.substring(0, 72),
          })),
        },
      ],
    },
  };
}

// ─── Store Main Menu ────────────────────────────────────────────────────────
export function buildStoreMainMenu(storeName: string, storeSlug: string): InteractiveMessage {
  return {
    type: 'list',
    header: { type: 'text', text: `🏪 ${storeName.substring(0, 50)}` },
    body: { text: 'What would you like to do?' },
    action: {
      button: 'Menu Options',
      sections: [
        {
          title: 'Shop',
          rows: [
            { id: `${WA_ACTION.CAT_MENU}:${storeSlug}`, title: 'Browse Categories', description: 'See all product categories' },
            { id: `${WA_ACTION.AI_CHAT}:${storeSlug}`, title: '🤖 Ask AI Assistant', description: 'Find products instantly' }
          ],
        },
        {
          title: 'Your Order',
          rows: [
            { id: `${WA_ACTION.CART_VIEW}:${storeSlug}`, title: '🛒 View Cart', description: 'Check your current items' },
          ],
        },
        {
          title: 'Other',
          rows: [
            { id: 'start', title: '⬅️ Change Store', description: 'Go back to store list' },
          ],
        }
      ],
    },
  };
}

function stockBadge(stock: number): string {
  if (stock === 0) return '❌';
  if (stock <= 3) return '⚠️';
  return '✅';
}

// ─── Search Results ─────────────────────────────────────────────────────────
export function buildSearchResultsList(
  products: CachedProduct[], 
  storeSlug: string,
  options: {
    query?: string;
    page?: number;
    totalPages?: number;
    totalResults?: number;
    cartCount?: number;
  } = {}
): InteractiveMessage {
  const { query, page = 1, totalPages = 1, totalResults = products.length, cartCount = 0 } = options;

  if (products.length === 0) {
    return {
      type: 'button',
      body: { text: query ? `No products found for "${query.substring(0, 80)}"`.substring(0, 1024) : 'No products found.' },
      action: {
        buttons: [{ type: 'reply', reply: { id: `${WA_ACTION.CAT_MENU}:${storeSlug || 'all'}`, title: 'View Categories' } }]
      }
    };
  }

  const rows = products.map((p) => {
    const priceStr = `₱${(p.price || 0).toLocaleString('en-PH')}`;
    const badge = stockBadge(p.stockQuantity ?? 0);
    const snippet = p.description
      ? ' · ' + p.description.replace(/[\n\r]+/g, ' ').trim()
      : '';
    const desc = `${priceStr} · ${badge}${snippet}`;
    return {
      id: `${WA_ACTION.PROD_SELECT}:${p.storeSlug || storeSlug}:${p.sellerId}`,
      title: p.title.substring(0, 24),
      description: desc.substring(0, 72),
    };
  });

  // Navigation rows
  const navRows: any[] = [];
  if (page > 1) {
    navRows.push({ id: `${WA_ACTION.PREV_PAGE}:${page - 1}`, title: '◀ Previous Page', description: `Back to page ${page - 1}` });
  }
  if (page < totalPages) {
    navRows.push({ id: `${WA_ACTION.NEXT_PAGE}:${page + 1}`, title: 'Next Page ▶', description: `More results on page ${page + 1}` });
  }
  if (cartCount > 0) {
    navRows.push({ id: `${WA_ACTION.CART_VIEW}:${storeSlug}`, title: `🛒 View Cart (${cartCount})`, description: 'Proceed to checkout' });
  }

  const sections = [
    {
      title: 'Products',
      rows
    }
  ];

  if (navRows.length > 0) {
    sections.push({
      title: 'Navigation',
      rows: navRows
    });
  }

  const bodyText = query
    ? `🔍 *${totalResults} result${totalResults === 1 ? '' : 's'}* for "${query.substring(0, 60)}"\n\nTap any product to see details, photo, and add to cart.`
    : `🔍 *${totalResults} product${totalResults === 1 ? '' : 's'}* found.\n\nTap any product to see details, photo, and add to cart.`;

  return {
    type: 'list',
    header: { type: 'text', text: `🛍 Page ${page} of ${totalPages}`.substring(0, 60) },
    body: { text: bodyText.substring(0, 1024) },
    action: {
      button: 'Browse Products',
      sections
    }
  };
}

// ─── Search Result Buttons ──────────────────────────────────────────────────
export function buildSearchResultButtons(product: CachedProduct, storeSlug: string, cartCount: number = 0): InteractiveMessage {
  const addLabel = cartCount > 0 ? `🛒 Add More (${cartCount})` : '🛒 Add to Cart';
  
  return {
    type: 'button',
    body: { text: `Options for ${product.title}:` },
    action: {
      buttons: [
        { type: 'reply', reply: { id: `${WA_ACTION.PROD_SELECT}:${storeSlug}:${product.sellerId}`, title: '📋 View Details' } },
        { type: 'reply', reply: { id: `${WA_ACTION.CART_ADD}:${storeSlug}:${product.sellerId}:1`, title: addLabel.substring(0, 20) } }
      ]
    }
  };
}

// ─── Product Card (search result card — image header + body + action buttons) ─
// Mirrors Telegram's photo card UX. imageUrl is optional; omitting it produces
// a text-only card which still renders richer than a plain list row.
export function buildProductCard(
  product: CachedProduct,
  storeSlug: string,
  cartCount: number = 0,
  options: { pageInfo?: string; imageUrl?: string } = {},
): InteractiveMessage {
  const { pageInfo, imageUrl } = options;

  const priceStr  = `₱${(product.price || 0).toLocaleString('en-PH')}`;
  const stock     = product.stockQuantity ?? 0;
  const stockText = stock === 0 ? '❌ Out of stock' : stock <= 3 ? `⚠️ Only ${stock} left` : '✅ In stock';
  const snippet   = product.description
    ? '\n' + product.description.replace(/[\n\r]+/g, ' ').trim()
    : '';

  const bodyText = `*${product.title}*\n${priceStr} · ${stockText}${snippet}`;

  const addLabel = cartCount > 0 ? `🛒 Add More (${cartCount})` : '🛒 Add to Cart';

  const msg: InteractiveMessage = {
    type: 'button',
    body: { text: bodyText.substring(0, 1024) },
    action: {
      buttons: [
        { type: 'reply', reply: { id: `${WA_ACTION.QTY_SEL}:${storeSlug}:${product.sellerId}`, title: addLabel.substring(0, 20) } },
        { type: 'reply', reply: { id: `${WA_ACTION.PROD_SELECT}:${storeSlug}:${product.sellerId}`, title: '📋 Full Details' } },
      ],
    },
  };

  if (imageUrl) {
    msg.header = { type: 'image', image: { link: imageUrl } };
  }

  if (pageInfo) {
    msg.footer = { text: pageInfo.substring(0, 60) };
  }

  return msg;
}

// ─── Search Navigation Footer ────────────────────────────────────────────────
// Shown after all product cards to let users paginate or jump to cart.
// Returns null when there is only one page and the cart is empty (no nav needed).
export function buildSearchNavigation(
  storeSlug: string,
  page: number,
  totalPages: number,
  cartCount: number = 0,
): InteractiveMessage | null {
  const buttons: any[] = [];

  if (page > 1) {
    buttons.push({ type: 'reply', reply: { id: `${WA_ACTION.PREV_PAGE}:${page - 1}`, title: '◀ Previous Page' } });
  }
  if (page < totalPages) {
    buttons.push({ type: 'reply', reply: { id: `${WA_ACTION.NEXT_PAGE}:${page + 1}`, title: 'Next Page ▶' } });
  }
  if (cartCount > 0) {
    buttons.push({ type: 'reply', reply: { id: `${WA_ACTION.CART_VIEW}:${storeSlug}`, title: `🛒 Cart (${cartCount})` } });
  } else if (buttons.length < 3) {
    buttons.push({ type: 'reply', reply: { id: `${WA_ACTION.STORE_MENU}:${storeSlug}`, title: '🏪 Store Menu' } });
  }

  if (buttons.length === 0) return null;

  return {
    type: 'button',
    body: { text: `Page ${page} of ${totalPages} — choose an action:` },
    action: { buttons: buttons.slice(0, 3) as any },
  };
}

// ─── Product Details Buttons ────────────────────────────────────────────────
export function buildProductDetailButtons(product: CachedProduct, storeSlug: string, cartCount: number = 0, source?: string): InteractiveMessage {
  // Route through qty picker so users can choose quantity (mirrors Telegram UX)
  const addLabel = cartCount > 0 ? `🛒 Add More (${cartCount})` : '🛒 Add to Cart';

  const buttons = [
    { type: 'reply', reply: { id: `${WA_ACTION.QTY_SEL}:${storeSlug}:${product.sellerId}`, title: addLabel.substring(0, 20) } },
    { type: 'reply', reply: { id: `${WA_ACTION.CART_VIEW}:${storeSlug}`, title: '🛒 View Cart' } },
  ];

  if (source === 'search') {
    buttons.push({ type: 'reply', reply: { id: `back_to_search:${storeSlug}`, title: '⬅️ Back to Results' } });
  } else if (source === 'category') {
    buttons.push({ type: 'reply', reply: { id: `back_to_cat:${storeSlug}`, title: '⬅️ Back to Category' } });
  } else if (source === 'ai') {
    buttons.push({ type: 'reply', reply: { id: `${WA_ACTION.AI_CHAT}:${storeSlug}`, title: '🤖 Back to AI' } });
  } else {
    buttons.push({ type: 'reply', reply: { id: `${WA_ACTION.STORE_MENU}:${storeSlug}`, title: '🏪 Store Menu' } });
  }

  const inCartNote = cartCount > 0 ? `\n\n_You already have ${cartCount} in your cart._` : '';
  return {
    type: 'button',
    body: { text: `What would you like to do with *${product.title}*?${inCartNote}` },
    action: { buttons: buttons as any }
  };
}

// ─── Quantity Selection Menu ─────────────────────────────────────────────────
export function buildQuantityMenu(storeSlug: string, productId: number): InteractiveMessage {
  return {
    type: 'list',
    header: { type: 'text', text: 'How many would you like?' },
    body: { text: 'Choose a quantity to add to your cart. You can always adjust it later.' },
    action: {
      button: 'Select Quantity',
      sections: [
        {
          title: 'Quantity',
          rows: [1, 2, 3, 5, 10].map(qty => ({
            id: `${WA_ACTION.CART_ADD}:${storeSlug}:${productId}:${qty}`,
            title: `${qty} ${qty === 1 ? 'item' : 'items'}`,
            description: qty === 1 ? 'Add one to cart' : `Add ${qty} to your cart`,
          })),
        },
      ],
    },
  };
}

// ─── Delivery Type Selection ────────────────────────────────────────────────
export function buildDeliveryMenu(storeSlug: string, allowsPickup: boolean): InteractiveMessage {
  const buttons = [
    { type: 'reply', reply: { id: `${WA_ACTION.DELIVERY_SEL}:${storeSlug}:delivery`, title: '🏠 Home Delivery' } }
  ];
  if (allowsPickup) {
    buttons.push({ type: 'reply', reply: { id: `${WA_ACTION.DELIVERY_SEL}:${storeSlug}:pickup`, title: '🏪 Store Pickup' } });
  }
  
  return {
    type: 'button',
    body: { text: '🚚 *Delivery Options*\n\nHow would you like to receive your order?' },
    action: { buttons: buttons as any }
  };
}

// ─── Delivery Type Selection ────────────────────────────────────────────────

export function buildCategoryListMenu(storeSlug: string, categories: CachedCategory[]): InteractiveMessage {
  return {
    type: 'list',
    header: { type: 'text', text: 'Browse Categories' },
    body: { text: 'Select a category to see its products.' },
    action: {
      button: 'View Categories',
      sections: [
        {
          title: 'Categories',
          rows: categories.map(c => ({
            id: `${WA_ACTION.CAT_SELECT}:${storeSlug}:${c.sellerId}`,
            title: c.name.substring(0, 24)
          }))
        },
        {
          title: 'Options',
          rows: [
            { id: `${WA_ACTION.STORE_MENU}:${storeSlug}`, title: '🏪 Store Menu', description: 'Go back to main menu' }
          ]
        }
      ]
    }
  };
}

// ─── Address Label Selection ───────────────────────────────────────────────
export function buildLabelMenu(storeSlug: string): InteractiveMessage {
  return {
    type: 'list',
    header: { type: 'text', text: 'Save Address' },
    body: { text: 'How would you like to label this address? Choose a label below, or type your own custom label (e.g. "Condo").' },
    action: {
      button: 'Choose Label',
      sections: [
        {
          title: 'Labels',
          rows: [
            { id: `${WA_ACTION.LABEL_SEL}:${storeSlug}:Home`, title: 'Home' },
            { id: `${WA_ACTION.LABEL_SEL}:${storeSlug}:Work`, title: 'Work' },
            { id: `${WA_ACTION.LABEL_SEL}:${storeSlug}:Other`, title: 'Other' },
            { id: `${WA_ACTION.LABEL_SEL}:${storeSlug}:skip`, title: '❌ Don\'t save' },
          ]
        }
      ]
    }
  };
}

// ─── Cart Menu ──────────────────────────────────────────────────────────────
export function buildCartMenu(storeSlug: string, itemCount: number): InteractiveMessage {
  if (itemCount === 0) {
    return {
      type: 'button',
      body: { text: `Your cart is empty.` },
      action: {
        buttons: [{ type: 'reply', reply: { id: `${WA_ACTION.STORE_MENU}:${storeSlug}`, title: 'Browse Products' } }]
      }
    };
  }

  return {
    type: 'button',
    body: { text: `You have ${itemCount} types of items in your cart. What's next?` },
    action: {
        buttons: [
        { type: 'reply', reply: { id: `${WA_ACTION.CHECKOUT}:${storeSlug}`, title: 'Checkout 💳' } },
        { type: 'reply', reply: { id: `${WA_ACTION.STORE_MENU}:${storeSlug}`, title: 'Keep Shopping' } },
        { type: 'reply', reply: { id: `${WA_ACTION.CART_VIEW}:${storeSlug}:clear`, title: 'Clear Cart ❌' } }
      ]
    }
  };
}

// ─── Address Selection Menu ────────────────────────────────────────────────
export function buildAddressSelectMenu(storeSlug: string, addresses: any[]): InteractiveMessage {
  return {
    type: 'list',
    header: { type: 'text', text: 'Shipping Address' },
    body: { text: 'Where should we deliver your order?' },
    action: {
      button: 'Select Address',
      sections: [
        {
          title: 'Saved Addresses',
          rows: addresses.map(a => ({
            id: `${WA_ACTION.ADDR_SELECT}:${storeSlug}:${a.id}`,
            title: a.streetLine.length > 20 ? `${a.streetLine.substring(0, 19)}…` : a.streetLine,
            description: `${a.city}, ${a.province}`.substring(0, 72)
          }))
        },
        {
          title: 'Options',
          rows: [
            { id: `${WA_ACTION.ADDR_NEW}:${storeSlug}`, title: '➕ Add New Address', description: 'Enter a different shipping address' }
          ]
        }
      ]
    }
  };
}

// ─── Payment Selection Menu ────────────────────────────────────────────────
export function buildPaymentMenu(storeSlug: string, methods: string[]): InteractiveMessage {
  const methodMap: Record<string, string> = {
    cod: 'Cash on Delivery',
    mock: 'Credit/Debit Card (Test)',
    assisted: 'Bank Transfer / GCash',
    paymongo: 'GCash / Maya (PayMongo)',
    stripe: 'Stripe Card'
  };

  return {
    type: 'list',
    header: { type: 'text', text: 'Payment Method' },
    body: { text: 'How would you like to pay?' },
    action: {
      button: 'Choose Method',
      sections: [
        {
          title: 'Available Methods',
          rows: methods.map(m => ({
            id: `pay_sel:${storeSlug}:${m}`,
            title: methodMap[m] || m.toUpperCase()
          }))
        }
      ]
    }
  };
}
