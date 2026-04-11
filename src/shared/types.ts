// ─── Shared Types for Backend (NestJS) and Frontend (SvelteKit) ───────────────

// ─── Registry / Admin ─────────────────────────────────────────────────────────

export interface Retailer {
  id: number;
  slug: string;
  name: string;
  contactEmail: string;
  mcpServerUrl: string;
  businessPermitUrl?: string | null;
  verified: boolean;
  active: boolean;
  allowsPickup: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;

  // AI Config
  aiProvider?: string | null;
  aiModel?: string | null;
  aiSystemPrompt?: string | null;

  // Payment Config
  paymentProvider?: string | null;
  paymentMethods?: string; // JSON string array

  // Platform Key (nested if joined)
  platformKey?: PlatformKey | null;
}

export interface PlatformKey {
  id: number;
  retailerId: number;
  key: string;
  issuedAt: string | Date;
  revokedAt?: string | Date | null;
}

export interface Order {
  id: number;
  orderId: number; // seller-side SQLite order ID
  referenceId: string;
  storeSlug: string;
  buyerRef: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | string;
  orderStatus: string;
  deliveryType: string;
  trackingNumber?: string | null;
  courierName?: string | null;
  provider?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  orderNotes?: OrderNote[];
}

export interface OrderNote {
  id: number;
  sellerId: number;
  paymentId: number;
  note: string;
  createdBy: string;
  createdAt: string | Date;
  deletedAt?: string | Date | null;
}

export interface Conversation {
  id: number;
  storeSlug: string;
  buyerRef: string;
  buyerName?: string | null;
  mode: 'ai' | 'human' | 'closed';
  lastMessage?: string | null;
  updatedAt: string | Date;
}

export interface Message {
  id: number;
  conversationId: number;
  senderType: 'buyer' | 'ai' | 'human' | 'system';
  senderName?: string | null;
  body: string;
  createdAt: string | Date;
}

export interface OrderStats {
  avgFulfillmentHours: number;
  byStatus: {
    orderStatus: string;
    _count: number;
  }[];
}

// ─── Storefront ───────────────────────────────────────────────────────────────

export interface Store {
  id: number;
  slug: string;
  name: string;
  verified: boolean;
  active: boolean;
  allowsPickup: boolean;
  productCount?: number;
  categoryCount?: number;
}

export interface Category {
  id: number;
  sellerId: number;
  name: string;
}

export interface Product {
  id: number;
  sellerId: number;
  title: string;
  description?: string | null;
  price: number;
  currency?: string;
  sku?: string | null;
  tags?: string[];
  images?: string[];
  stockQuantity: number;
  storeSlug?: string; // present in cross-store search results
}

// ─── Admin UI ─────────────────────────────────────────────────────────────────

export type AdminTabId =
  | 'pending'
  | 'verified'
  | 'all'
  | 'chat'
  | 'payments'
  | 'orders'
  | 'settings';

// The admin `api()` helper returns parsed JSON — typed as any since each
// call site knows what shape to expect.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiFunction = (method: string, path: string, body?: unknown) => Promise<any>;
