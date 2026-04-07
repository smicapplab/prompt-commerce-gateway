import { InteractiveMessage } from './whatsapp-client';
import { CachedProduct, CachedCategory } from '@prisma/client';

export const WA_ACTION = {
  STORE_SELECT: 'store_sel',
  CAT_MENU: 'cat_menu',
  CAT_SELECT: 'cat_sel',
  PROD_SELECT: 'prod_sel',
  CART_VIEW: 'cart_view',
  CART_ADD: 'cart_add',
  CHECKOUT: 'checkout',
  SEARCH: 'search',
  AI_CHAT: 'ai_chat',
  ADDR_SELECT: 'addr_sel',
  ADDR_NEW: 'addr_new',
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

// ─── Search Results ─────────────────────────────────────────────────────────
export function buildSearchResultsList(products: CachedProduct[], query: string, storeSlug: string): InteractiveMessage {
  if (products.length === 0) {
    return {
      type: 'button',
      body: { text: `No products found for "${query}"` },
      action: {
        buttons: [{ type: 'reply', reply: { id: `${WA_ACTION.CAT_MENU}:${storeSlug || 'all'}`, title: 'View Categories' } }]
      }
    };
  }

  return {
    type: 'list',
    header: { type: 'text', text: `Search Results` },
    body: { text: `Found ${products.length} items for "${query}"` },
    action: {
      button: 'View Products',
      sections: [
        {
          title: 'Top Results',
          rows: products.slice(0, 10).map((p: any) => ({
            id: `${WA_ACTION.PROD_SELECT}:${p.storeSlug || storeSlug}:${p.sellerId}`,
            title: p.title.substring(0, 24),
            description: `₱${p.price || 0}`
          }))
        }
      ]
    }
  };
}

// ─── Product Details Menu ───────────────────────────────────────────────────
export function buildProductDetailMenu(product: CachedProduct, storeSlug: string): InteractiveMessage {
  return {
    type: 'button',
    body: { text: `Would you like to add ${product.title} to your cart?` },
    action: {
      buttons: [
        { type: 'reply', reply: { id: `${WA_ACTION.CART_ADD}:${storeSlug}:${product.sellerId}:1`, title: 'Add to Cart' } },
        { type: 'reply', reply: { id: `${WA_ACTION.CART_VIEW}:${storeSlug}`, title: 'View Cart' } },
        { type: 'reply', reply: { id: `${WA_ACTION.CAT_MENU}:${storeSlug}`, title: 'Menu' } }
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
        buttons: [{ type: 'reply', reply: { id: `${WA_ACTION.CAT_MENU}:${storeSlug}`, title: 'Browse Products' } }]
      }
    };
  }

  return {
    type: 'button',
    body: { text: `You have ${itemCount} types of items in your cart. What's next?` },
    action: {
      buttons: [
        { type: 'reply', reply: { id: `${WA_ACTION.CHECKOUT}:${storeSlug}`, title: 'Checkout 💳' } },
        { type: 'reply', reply: { id: `${WA_ACTION.CAT_MENU}:${storeSlug}`, title: 'Keep Shopping' } },
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
            title: `${a.streetLine.substring(0, 20)}...`,
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
