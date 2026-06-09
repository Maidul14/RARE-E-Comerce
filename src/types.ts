export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  categoryId: string;
  images: string[];
  stock: number;
  sku: string;
  reviews?: Review[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

export interface Customer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  sku: string;
}

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: "Pending" | "Waiting For Verification" | "Completed" | "Rejected" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus?: string;
  payPalTransactionId?: string;
  amountPaid?: number;
  paymentScreenshot?: string;
  createdAt: number;
  paymentMethod?: string;
  originalTotal?: number;
  discountAmount?: number;
}

export interface PayPalSettings {
  paypalEmail: string;
  businessName: string;
  isEnabled: boolean;
  mobileWalletEnabled?: boolean;
  mobileWalletInfo?: string;
  mobileWalletDiscount?: number;
  mobileWalletMessage?: string;
  zelleEnabled?: boolean;
  zelleInfo?: string;
  zelleDiscount?: number;
  zelleMessage?: string;
  payoneerEnabled?: boolean;
  payoneerInfo?: string;
  payoneerDiscount?: number;
  payoneerMessage?: string;
  paypalEnabled?: boolean;
  paypalInfo?: string;
  paypalDiscount?: number;
  paypalMessage?: string;
  cardEnabled?: boolean;
  ukExchangeRate?: number;
  ukTaxRate?: number;
  ukAdjustmentPercent?: number;
  usaTaxRate?: number;
  taxEnabled?: boolean;
  taxLabel?: string;
  mobileWalletDiscountEnabled?: boolean;
  zelleDiscountEnabled?: boolean;
  payoneerDiscountEnabled?: boolean;
  paypalDiscountEnabled?: boolean;
}

export interface DotnetFile {
  name: string;
  path: string;
  content: string;
}
