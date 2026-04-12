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
  trackingUrl?: string | null;
  cancellationReason?: string | null;
  paymentInstructions?: string | null;
  provider?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  terminalStatusAt?: string | Date | null;
  orderCreatedAt?: string | Date | null;
  orderNotes?: OrderNote[];
  orderFiles?: OrderFile[];
}

export interface OrderNote {
  id: number;
  sellerId: number;
  paymentId: number;
  note: string;
  createdBy: string;
  createdAt: string | Date;
  deletedAt?: string | Date | null;
  deletedBy?: string | null;
}

export interface OrderFile {
  id: number;
  sellerId: number;
  paymentId: number;
  filename: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedAt: string | Date;
  deletedAt?: string | Date | null;
  deletedBy?: string | null;
}

// ─── Seller App Sync Payloads ────────────────────────────────────────────────

export interface SellerOrder {
  id: number;
  status: string;
  total?: number | null;
  buyer_ref?: string | null;
  payment_provider?: string | null;
  delivery_type?: string | null;
  tracking_number?: string | null;
  courier_name?: string | null;
  tracking_url?: string | null;
  cancellation_reason?: string | null;
  payment_instructions?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SellerOrderNote {
  id: number;
  order_id: number;
  note: string;
  created_by: string;
  created_at: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

export interface SellerOrderFile {
  id: number;
  order_id: number;
  filename: string;
  original_name: string;
  file_url: string;
  mime_type: string;
  size_bytes: number;
  uploaded_by: string;
  uploaded_at: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

export interface OrderSyncPayload {
  upsert: {
    orders?: SellerOrder[];
    orderNotes?: SellerOrderNote[];
    orderFiles?: SellerOrderFile[];
  };
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

// ─── Bot Flow State ───────────────────────────────────────────────────────────

export interface CheckoutState {
  storeSlug:     string;
  step:          'name' | 'email' | 'addressList' | 'addressPicker' | 'freeAddress' | 'labelType' | 'delivery' | 'payment' | 'confirm' | string;
  name?:         string;
  email?:        string;
  
  // New address flow state
  province?:     string;
  city?:         string;
  barangay?:     string;
  streetLine?:   string;
  postalCode?:   string;
  addressId?:    number;
  lat?:          number;
  lng?:          number;

  address?:      string;
  deliveryType?: 'delivery' | 'pickup' | string;
  paymentMethod?: string;  // e.g. 'cod', 'mock', 'assisted', 'paymongo', 'stripe'
}

// ─── Admin UI ─────────────────────────────────────────────────────────────────

export type AdminTabId =
  | 'pending'
  | 'verified'
  | 'all'
  | 'chat'
  | 'payments'
  | 'orders'
  | 'settings'
  | 'ai-tagging';

// The admin `api()` helper returns parsed JSON — typed as any since each
// call site knows what shape to expect.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiFunction = (method: string, path: string, body?: unknown) => Promise<any>;
