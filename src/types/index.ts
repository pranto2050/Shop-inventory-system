export interface User {
  id: string;
  email: string;
  password: string;
  role: 'customer' | 'admin' | 'seller';
  points: number;
  purchaseHistory: Purchase[];
  name: string;
}

export type Product = {
  id: string;
  name: string;
  brand: string;
  brandDescription: string;
  brandLogo: string;
  supplier: string;
  addedDate: string; // ISO date string like "2025-07-30"
  buysellpricePerUnit: number;
  sellpricePerUnit: number;
  stock: number;
  unit: string;
  category: string;
  rating: number;
  image: string;
  description: string;
  specifications: Record<string, any>; // or a more specific type if you know the structure
  commonId: string;
  uniqueId: string;
  subcategory: string;
  model: string;
};



export interface Purchase {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  timestamp: string;
  pointsEarned: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleItem {
  product: Product;
  quantity: number;
  totalPrice: number;
}

export interface CustomerDetails {
  name: string;
  mobile: string;
  email: string;
  address: string;
}

export interface SaleRecord {
  productID: string;
  productName: string;
  quantitySold: number;
  sellpricePerUnit: number;
  totalPrice: number;
  unit: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  // Seller information
  sellerId?: string;
  sellerName?: string;
  sellerRole?: 'admin' | 'seller';
  // New fields for product identification
  commonId: string;
  uniqueId: string;
  // Customer details (optional)
  customer?: CustomerDetails;
}

// Warranty-related types
export interface WarrantySaleRecord {
  saleId: string;
  productId: string;
  productName: string;
  customerId: string;
  customerEmail: string;
  quantity: number;
  sellpricePerUnit: number;
  totalPrice: number;
  unit: string;
  currency: string;
  dateOfSale: string;
  warrantyEndDate: string;
  timestamp: string;
  // Seller information
  sellerId?: string;
  sellerName?: string;
  sellerRole?: 'admin' | 'seller';
  // New fields for product identification
  commonId: string;
  uniqueId: string;
}

export interface WarrantyItem {
  saleId: string;
  productId: string;
  productName: string;
  customerId: string;
  customerEmail: string;
  quantity: number;
  sellpricePerUnit: number;
  totalPrice: number;
  dateOfSale: string;
  warrantyEndDate: string;
  warrantyStatus: 'active' | 'expired' | 'unknown';
  daysRemaining: number;
  timestamp: string;
  // Additional fields for enhanced functionality
  commonId?: string;
  uniqueId?: string;
  customerMobile?: string;
  customerAddress?: string;
  currency?: string;
  unit?: string;
  itemIndex?: number;
}

export interface WarrantyApproval {
  approvalId: string;
  saleId: string;
  productId: string;
  dateOfSale: string;
  warrantyEndDate: string;
  approvalDate: string;
  approvedBy: string;
  notes: string;
  timestamp: string;
}

export interface PurchaseRecord {
  productID: string;
  productName: string;
  quantityAdded: number;
  sellpricePerUnit: number;
  totalCost: number;
  timestamp: string;
  adminId: string;
  supplier?: string;
  // New fields for product identification
  commonId: string;
  uniqueId: string;
}

export interface ReturnRecord {
  productID: string;
  productName: string;
  quantityReturned: number;
  sellpricePerUnit: number;
  totalRefund: number;
  unit: string;
  timestamp: string;
  adminId: string;
  reason?: string;
  originalSaleDate?: string;
}

export interface DailySales {
  date: string;
  sales: SaleRecord[];
  totalAmount: number;
  totalItems: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdDate: string;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string; // URL for external logo image
  logoFile?: string; // Path for uploaded logo file
  createdDate: string;
}

// ...existing code...
export interface AdminPurchaseItem {
  product: Product;
  quantity: number;
  totalCost: number;
  customPrice?: number;
}
// ...existing code...

export interface PriceFilter {
  min: number;
  max: number;
}

export interface ProductFilters {
  category: string;
  priceRange: PriceFilter | null;
  availability: 'all' | 'in-stock' | 'out-of-stock';
  brand: string;
}

// New interface for product identification validation
export interface ProductIdValidation {
  isValid: boolean;
  message: string;
  isDuplicate?: boolean;
}

// New interface for stock item with unique identification
export interface StockItem {
  commonId: string;
  uniqueId: string;
  productName: string;
  sellpricePerUnit: number;
  unit: string;
  addedDate: string;
  supplier?: string;
  category: string;
  image: string;
  description: string;
  specifications?: { [key: string]: string };
}