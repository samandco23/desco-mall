export type ProductColor = {
  name: string;
  hex: string;
};

export type ProductImage = {
  url: string;
  alt: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  details: string[];
  price: number;
  comparePrice?: number;
  category: { slug: string; name: string };
  images: ProductImage[];
  colors: ProductColor[];
  sizes: string[];
  stock: Record<string, number>;
  isNew: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  tags: string[];
  createdAt: string;
};

export type CatalogCategory = {
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount?: number;
};

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "UNPAID"
  | "PENDING_CONFIRMATION"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type DemoOrderItem = {
  productName: string;
  variantInfo?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
};

export type DemoOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  neighborhood: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "MTN_MOMO" | "ORANGE_MONEY";
  total: number;
  shippingFee: number;
  items: DemoOrderItem[];
  createdAt: string;
  timeline: { status: OrderStatus; note?: string; at: string }[];
};

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** Prix unitaire de base (tarif détail), en centimes XAF */
  price: number;
  size: string;
  color: string;
  quantity: number;
  maxQuantity: number;
};
