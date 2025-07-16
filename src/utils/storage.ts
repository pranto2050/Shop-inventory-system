import { Product, SaleRecord, PurchaseRecord, ReturnRecord, DailySales, Category, Customer, CustomerDetails } from '../types';
import { apiService } from './apiService';

// Products
export const getProducts = async (): Promise<Product[]> => {
  try {
    return await apiService.getProducts();
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

export const addProduct = async (product: Product): Promise<boolean> => {
  try {
    const result = await apiService.addProduct(product);
    return result.success;
  } catch (error) {
    console.error('Failed to add product:', error);
    return false;
  }
};

export const updateProduct = async (product: Product): Promise<boolean> => {
  try {
    const result = await apiService.updateProduct(product.id, product);
    return result.success;
  } catch (error) {
    console.error('Failed to update product:', error);
    return false;
  }
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    const result = await apiService.deleteProduct(productId);
    return result.success;
  } catch (error) {
    console.error('Failed to delete product:', error);
    return false;
  }
};

export const updateStock = async (productId: string, newStock: number): Promise<boolean> => {
  try {
    const products = await getProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
      product.stock = newStock;
      return await updateProduct(product);
    }
    return false;
  } catch (error) {
    console.error('Failed to update stock:', error);
    return false;
  }
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    return await apiService.getCategories();
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};

export const addCategory = async (category: Category): Promise<boolean> => {
  try {
    const result = await apiService.addCategory(category);
    return result.success;
  } catch (error) {
    console.error('Failed to add category:', error);
    return false;
  }
};

export const deleteCategory = async (categoryId: string): Promise<boolean> => {
  try {
    const result = await apiService.deleteCategory(categoryId);
    return result.success;
  } catch (error) {
    console.error('Failed to delete category:', error);
    return false;
  }
};

// Sales
export const getSalesLogs = async (): Promise<SaleRecord[]> => {
  try {
    return await apiService.getSales();
  } catch (error) {
    console.error('Failed to fetch sales logs:', error);
    return [];
  }
};

export const logSale = async (sale: SaleRecord): Promise<boolean> => {
  try {
    const result = await apiService.addSale(sale);
    return result.success;
  } catch (error) {
    console.error('Failed to log sale:', error);
    return false;
  }
};

// Purchases
export const getPurchaseLogs = async (): Promise<PurchaseRecord[]> => {
  try {
    return await apiService.getPurchases();
  } catch (error) {
    console.error('Failed to fetch purchase logs:', error);
    return [];
  }
};

export const logPurchase = async (purchase: PurchaseRecord): Promise<boolean> => {
  try {
    const result = await apiService.addPurchase(purchase);
    return result.success;
  } catch (error) {
    console.error('Failed to log purchase:', error);
    return false;
  }
};

// Returns
export const getReturnLogs = async (): Promise<ReturnRecord[]> => {
  try {
    return await apiService.getReturns();
  } catch (error) {
    console.error('Failed to fetch return logs:', error);
    return [];
  }
};

export const logReturn = async (returnRecord: ReturnRecord): Promise<boolean> => {
  try {
    const result = await apiService.addReturn(returnRecord);
    return result.success;
  } catch (error) {
    console.error('Failed to log return:', error);
    return false;
  }
};

// Search and filter functions
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  const products = await getProducts();
  return products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const filterProducts = async (filters: {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Product[]> => {
  const products = await getProducts();
  return products.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.brand && product.brand?.toLowerCase() !== filters.brand.toLowerCase()) return false;
    if (filters.minPrice !== undefined && product.pricePerUnit < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && product.pricePerUnit > filters.maxPrice) return false;
    return true;
  });
};

// Today's sales calculation
export const getTodaysSales = async (): Promise<DailySales> => {
  const sales = await getSalesLogs();
  const today = new Date().toISOString().split('T')[0];
  
  const todaysSales = sales.filter(sale => 
    sale.timestamp && sale.timestamp.split('T')[0] === today
  );

  return {
    date: today,
    sales: todaysSales,
    totalAmount: todaysSales.reduce((sum, sale) => sum + sale.totalPrice, 0),
    totalItems: todaysSales.reduce((sum, sale) => sum + sale.quantitySold, 0)
  };
};

// Additional utility functions
export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const products = await getProducts();
    return products.find(p => p.id === productId) || null;
  } catch (error) {
    console.error('Failed to fetch product by ID:', error);
    return null;
  }
};

export const downloadSalesData = async (): Promise<boolean> => {
  try {
    const sales = await getSalesLogs();
    const dataStr = JSON.stringify(sales, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Failed to download sales data:', error);
    return false;
  }
};

// Warranty Management
export const saveSaleWithWarranty = async (saleData: any): Promise<{ success: boolean; saleId?: string; message?: string }> => {
  try {
    const response = await fetch('http://localhost:3001/api/sales-with-warranty', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleData)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to save sale with warranty:', error);
    return { success: false, message: 'Failed to save sale with warranty' };
  }
};

export const searchWarrantyByProductId = async (productId: string): Promise<{ success: boolean; warranties?: any[]; message?: string }> => {
  try {
    const response = await fetch(`http://localhost:3001/api/warranty/search/${productId}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to search warranty:', error);
    return { success: false, message: 'Failed to search warranty information' };
  }
};

export const approveWarrantyClaim = async (approvalData: any): Promise<{ success: boolean; approvalId?: string; message?: string }> => {
  try {
    const response = await fetch('http://localhost:3001/api/warranty/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(approvalData)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to approve warranty claim:', error);
    return { success: false, message: 'Failed to approve warranty claim' };
  }
};

export const getWarrantyApprovals = async (): Promise<{ success: boolean; approvals?: any[]; message?: string }> => {
  try {
    const response = await fetch('http://localhost:3001/api/warranty/approvals');
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to fetch warranty approvals:', error);
    return { success: false, message: 'Failed to fetch warranty approvals' };
  }
};

export const getDailySalesReport = async (date: string): Promise<{ success: boolean; sales?: any[]; date?: string; message?: string }> => {
  try {
    const response = await fetch(`http://localhost:3001/api/sales/daily/${date}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to fetch daily sales:', error);
    return { success: false, message: 'Failed to fetch daily sales report' };
  }
};

// Sold Products
export const getSoldProducts = async (): Promise<any[]> => {
  try {
    const response = await fetch('http://localhost:3001/api/soldproducts');
    const result = await response.json();
    return result.success ? result.soldProducts : [];
  } catch (error) {
    console.error('Failed to fetch sold products:', error);
    return [];
  }
};

// Brands
export const getBrands = async (): Promise<any[]> => {
  try {
    const response = await fetch('http://localhost:3001/api/brands');
    const brands = await response.json();
    return Array.isArray(brands) ? brands : [];
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    return [];
  }
};

export const addBrand = async (brand: any): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:3001/api/brands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brand)
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to add brand:', error);
    return false;
  }
};

export const updateBrand = async (brandId: string, brand: any): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:3001/api/brands/${brandId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brand)
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to update brand:', error);
    return false;
  }
};

export const deleteBrand = async (brandId: string): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:3001/api/brands/${brandId}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to delete brand:', error);
    return false;
  }
};

// Customer management functions
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await fetch('http://localhost:3001/api/customers');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return [];
  }
};

export const addCustomer = async (customer: Customer): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:3001/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer)
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to add customer:', error);
    return false;
  }
};

export const updateCustomer = async (customerId: string, customer: Customer): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:3001/api/customers/${customerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer)
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to update customer:', error);
    return false;
  }
};

export const getCustomerByMobile = async (mobile: string): Promise<Customer | null> => {
  try {
    const customers = await getCustomers();
    return customers.find(customer => customer.mobile === mobile) || null;
  } catch (error) {
    console.error('Failed to find customer by mobile:', error);
    return null;
  }
};

export const saveCustomerData = async (customerDetails: CustomerDetails): Promise<Customer | null> => {
  try {
    // Check if customer already exists
    const existingCustomer = await getCustomerByMobile(customerDetails.mobile);
    
    if (existingCustomer) {
      // Update existing customer
      const updatedCustomer: Customer = {
        ...existingCustomer,
        name: customerDetails.name,
        email: customerDetails.email,
        address: customerDetails.address,
        totalPurchases: existingCustomer.totalPurchases + 1,
        lastPurchaseDate: new Date().toISOString()
      };
      
      const success = await updateCustomer(existingCustomer.id, updatedCustomer);
      return success ? updatedCustomer : null;
    } else {
      // Create new customer
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        name: customerDetails.name,
        mobile: customerDetails.mobile,
        email: customerDetails.email,
        address: customerDetails.address,
        registrationDate: new Date().toISOString(),
        totalPurchases: 1,
        lastPurchaseDate: new Date().toISOString()
      };
      
      const success = await addCustomer(newCustomer);
      return success ? newCustomer : null;
    }
  } catch (error) {
    console.error('Failed to save customer data:', error);
    return null;
  }
};
