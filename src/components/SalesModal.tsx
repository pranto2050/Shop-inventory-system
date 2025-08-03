import React, { useState } from 'react';
import { X, Download, Trash2, ShoppingBag, Calendar, Shield, User, Loader2 } from 'lucide-react'; // Added Loader2 for loading indicator
import { SaleItem, CustomerDetails } from '../types';
import { downloadSalesData } from '../utils/storage';

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesItems: SaleItem[];
  onRemoveItem: (productId: string) => void;
  // onCompleteSale is now called after the API request is handled internally
  onCompleteSale: () => void; // Simplified as API call is now internal
  // You might pass user info (e.g., loggedInUserEmail) as a prop if needed for 'soldBy'
  loggedInUserEmail?: string;
  loggedInUserName?: string;
}

const SalesModal: React.FC<SalesModalProps> = ({
  isOpen,
  onClose,
  salesItems,
  onRemoveItem,
  onCompleteSale,
  loggedInUserEmail, // Added for soldBy info
  loggedInUserName // Added for soldBy info
}) => {
  const [customDateTime, setCustomDateTime] = useState('');
  const [useCustomDateTime, setUseCustomDateTime] = useState(false);
  const [isProcessingSale, setIsProcessingSale] = useState(false); // New loading state
  const [saleMessage, setSaleMessage] = useState(''); // New state for success/error messages

  // Warranty fields
  const [dateOfSale, setDateOfSale] = useState(new Date().toISOString().split('T')[0]);
  const [warrantyPeriod, setWarrantyPeriod] = useState('1 year');
  const [customWarrantyEndDate, setCustomWarrantyEndDate] = useState('');
  const [useCustomWarrantyEnd, setUseCustomWarrantyEnd] = useState(false);

  // Customer information fields
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  if (!isOpen) return null;

  const totalAmount = salesItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = salesItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleDownload = () => {
    downloadSalesData();
  };

  const clearAllFormFields = () => {
    // Clear customer fields
    setCustomerName('');
    setCustomerMobile('');
    setCustomerEmail('');
    setCustomerAddress('');
    
    // Reset date/time fields
    setCustomDateTime('');
    setUseCustomDateTime(false);
    
    // Reset warranty fields to defaults
    setDateOfSale(new Date().toISOString().split('T')[0]);
    setWarrantyPeriod('1 year');
    setCustomWarrantyEndDate('');
    setUseCustomWarrantyEnd(false);

    setSaleMessage(''); // Clear any previous messages
  };

  // Test API endpoint availability
  const testApiEndpoint = async () => {
    try {
      const response = await fetch('https://shop-inventory-api.onrender.com/api/sales', {
        method: 'GET',
      });
      console.log('API health check:', response.status);
      return response.ok;
    } catch (error) {
      console.log('API health check failed:', error);
      return false;
    }
  };

  const handleCompleteSale = async () => {
    if (isProcessingSale) return; // Prevent double submission

    if (!customerMobile.trim()) {
      setSaleMessage('Error: Customer mobile number is required.');
      return;
    }
    if (salesItems.length === 0) {
      setSaleMessage('Error: No items in sale.');
      return;
    }

    setIsProcessingSale(true);
    setSaleMessage('Processing sale...');

    const dateTimeToUse = useCustomDateTime && customDateTime ? customDateTime : new Date().toISOString();
    
    // Calculate warranty end date
    let calculatedWarrantyEndDate: string;
    if (useCustomWarrantyEnd && customWarrantyEndDate) {
      calculatedWarrantyEndDate = customWarrantyEndDate;
    } else {
      const saleDate = new Date(dateOfSale);
      const endDate = new Date(saleDate);
      
      // Parse warranty period and add to sale date
      if (warrantyPeriod.includes('month')) {
        const months = parseInt(warrantyPeriod);
        endDate.setMonth(endDate.getMonth() + months);
      } else if (warrantyPeriod.includes('year')) {
        const years = parseInt(warrantyPeriod);
        endDate.setFullYear(endDate.getFullYear() + years);
      } else if (warrantyPeriod.includes('day')) {
        const days = parseInt(warrantyPeriod);
        endDate.setDate(endDate.getDate() + days);
      } else {
        // Default to 1 year if can't parse
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      calculatedWarrantyEndDate = endDate.toISOString().split('T')[0];
    }
    
    const customerDetails: CustomerDetails = {
      name: customerName.trim() || 'Customer',
      mobile: customerMobile.trim(),
      email: customerEmail.trim(),
      address: customerAddress.trim()
    };

    // Construct the sale object to send to the backend
    const saleObject = {
      items: salesItems, // Array of SaleItem
      totalAmount: totalAmount,
      totalItems: totalItems,
      dateOfSale: dateOfSale, // The date chosen for the sale
      warrantyEndDate: calculatedWarrantyEndDate,
      customerName: customerDetails.name,
      customerMobile: customerDetails.mobile,
      customerEmail: customerDetails.email,
      customerAddress: customerDetails.address,
      soldByEmail: loggedInUserEmail || 'unknown@example.com', // Placeholder, ideally from auth context
      soldBy: loggedInUserName || 'Unknown User', // Placeholder, ideally from auth context
      timestamp: dateTimeToUse, // Use the chosen or current timestamp
    };

    try {
      console.log('Sending sale data:', saleObject); // Debug log
      
      // First, try to check if API is available
      const isApiAvailable = await testApiEndpoint();
      if (!isApiAvailable) {
        console.warn('API appears to be unavailable, but proceeding with request...');
      }
      
      const response = await fetch('https://shop-inventory-api.onrender.com/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleObject),
      });

      console.log('Response status:', response.status); // Debug log
      console.log('Response headers:', response.headers); // Debug log

      if (!response.ok) {
        // Try to get error message, but handle HTML responses
        let errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            // If it's HTML or other content, read as text
            const errorText = await response.text();
            console.log('Error response body:', errorText); // Debug log
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.log('Non-JSON response:', responseText);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      console.log('Sale recorded successfully:', data); // Debug log
      
      setSaleMessage(`Sale recorded successfully! Sale ID: ${data.saleId || 'Unknown'}`);
      
      // Call the parent's onCompleteSale to trigger dashboard refresh or cart clear
      onCompleteSale(); 
      onClose(); // Close the modal after successful completion
      clearAllFormFields(); // Clear form fields
      
    } catch (error: any) {
      console.error('Full error details:', error);
      let errorMessage = 'Failed to record sale.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'TypeError' && error.message?.includes('fetch')) {
        errorMessage = 'Network error: Could not connect to server. Please check your internet connection.';
      }
      
      // As a fallback, try to store locally
      try {
        console.log('Attempting to store sale locally as fallback...');
        
        // Generate a local sale ID
        const localSaleId = `LOCAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const saleWithId = { ...saleObject, saleId: localSaleId };
        
        // Store in localStorage as backup
        const existingSales = JSON.parse(localStorage.getItem('pendingSales') || '[]');
        existingSales.push(saleWithId);
        localStorage.setItem('pendingSales', JSON.stringify(existingSales));
        
        setSaleMessage(`Sale stored locally! ID: ${localSaleId}. Will sync when server is available.`);
        
        // Still trigger the completion flow
        onCompleteSale(); 
        onClose();
        clearAllFormFields();
        
      } catch (localError) {
        console.error('Failed to store locally:', localError);
        setSaleMessage(`Error: ${errorMessage}`);
      }
      
    } finally {
      setIsProcessingSale(false);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-b border-white/10 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Sales Summary</h2>
                <p className="text-slate-400">Review and complete your sale</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto">
          {/* Content */}
          <div className="p-6">
          {salesItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No items in sale</p>
            </div>
          ) : (
            <div className="space-y-4">
              {salesItems.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.image || `https://placehold.co/64x64/334155/E2E8F0?text=No+Image`}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => { e.currentTarget.src = `https://placehold.co/64x64/334155/E2E8F0?text=No+Image`; }}
                    />
                    <div>
                      <h3 className="text-white font-semibold">{item.product.name}</h3>
                      <p className="text-slate-400 text-sm">ID: {item.product.id}</p>
                      <p className="text-emerald-400 text-sm">
                        ৳{item.product.sellpricePerUnit}/{item.product.unit}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {item.quantity} {item.product.unit}
                      </p>
                      <p className="text-emerald-400 font-bold text-lg">
                        ৳{item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date/Time Section */}
        {salesItems.length > 0 && (
          <div className="bg-white/5 border-t border-white/10 p-6">
            {/* Customer Information Section - Top Priority */}
            <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Customer Information</h3>
                  <p className="text-slate-400 text-sm">Add customer details (mobile number is required)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Name */}
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer's full name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all"
                  />
                </div>

                {/* Mobile Number (Required) */}
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="e.g., +8801XXXXXXXXX"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all"
                  />
                </div>

                {/* Customer Address */}
                <div className="md:col-span-2">
                  <label className="block text-slate-400 text-sm mb-2">Address</label>
                  <textarea
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Enter customer's full address"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  id="useCustomDateTime"
                  checked={useCustomDateTime}
                  onChange={(e) => setUseCustomDateTime(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="useCustomDateTime" className="text-slate-400 text-sm">
                  Use custom date & time for this sale
                </label>
              </div>
              
              {useCustomDateTime ? (
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Sale Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={customDateTime || getCurrentDateTime()}
                    onChange={(e) => setCustomDateTime(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all"
                  />
                </div>
              ) : (
                <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                  <span className="text-slate-400 text-sm">Current Date & Time: </span>
                  <span className="text-emerald-400 font-medium">
                    {new Date().toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Warranty Information Section */}
            <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Warranty Information</h3>
                  <p className="text-slate-400 text-sm">Set warranty details for this sale</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date of Sale */}
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Date of Sale</label>
                  <input
                    type="date"
                    value={dateOfSale}
                    onChange={(e) => setDateOfSale(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                  />
                </div>

                {/* Warranty Period */}
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Warranty Period</label>
                  <select
                    value={warrantyPeriod}
                    onChange={(e) => setWarrantyPeriod(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                  >
                    <option value="3 months" className="bg-slate-800">3 Months</option>
                    <option value="6 months" className="bg-slate-800">6 Months</option>
                    <option value="1 year" className="bg-slate-800">1 Year</option>
                    <option value="2 years" className="bg-slate-800">2 Years</option>
                    <option value="3 years" className="bg-slate-800">3 Years</option>
                    <option value="custom" className="bg-slate-800">Custom End Date</option>
                  </select>
                </div>

                {/* Custom Warranty End Date */}
                {warrantyPeriod === 'custom' && (
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-sm mb-2">Custom Warranty End Date</label>
                    <input
                      type="date"
                      value={customWarrantyEndDate}
                      onChange={(e) => {
                        setCustomWarrantyEndDate(e.target.value);
                        setUseCustomWarrantyEnd(true);
                      }}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                    />
                  </div>
                )}

                {/* Warranty Preview */}
                <div className="md:col-span-2 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">Warranty Preview</span>
                  </div>
                  <div className="text-sm text-slate-300">
                    <p>Sale Date: <span className="text-white font-medium">{new Date(dateOfSale).toLocaleDateString()}</span></p>
                    <p>Warranty Ends: <span className="text-white font-medium">
                      {warrantyPeriod === 'custom' && customWarrantyEndDate 
                        ? new Date(customWarrantyEndDate).toLocaleDateString()
                        : (() => {
                            const saleDate = new Date(dateOfSale);
                            const endDate = new Date(saleDate);
                            if (warrantyPeriod.includes('month')) {
                              const months = parseInt(warrantyPeriod);
                              endDate.setMonth(endDate.getMonth() + months);
                            } else if (warrantyPeriod.includes('year')) {
                              const years = parseInt(warrantyPeriod);
                              endDate.setFullYear(endDate.getFullYear() + years);
                            } else if (warrantyPeriod.includes('day')) { // Added 'day' handling
                              const days = parseInt(warrantyPeriod);
                              endDate.setDate(endDate.getDate() + days);
                            }
                            return endDate.toLocaleDateString();
                          })()
                      }
                    </span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Footer - Fixed at bottom */}
        {salesItems.length > 0 && (
          <div className="bg-white/5 border-t border-white/10 p-6 flex-shrink-0">
            {saleMessage && (
              <p className={`text-center mb-4 text-sm font-medium ${saleMessage.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                {saleMessage}
              </p>
            )}
            <div className="flex items-center justify-between mb-6">
              <div className="text-white">
                <p className="text-lg">Total Items: <span className="font-bold">{totalItems}</span></p>
                <p className="text-2xl font-bold text-emerald-400">
                  Total Amount: ৳{totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg border border-blue-500/30 transition-all duration-300"
              >
                <Download className="w-5 h-5" />
                <span>Download Receipt</span>
              </button>

              {/* Debug button - remove in production */}
              <button
                onClick={async () => {
                  const isAvailable = await testApiEndpoint();
                  setSaleMessage(isAvailable ? 'API is available!' : 'API is not available!');
                }}
                className="flex items-center space-x-2 px-4 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg border border-yellow-500/30 transition-all duration-300"
              >
                <span>Test API</span>
              </button>
              
              <button
                onClick={handleCompleteSale}
                className="flex-1 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-slate-900 font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center space-x-2"
                disabled={isProcessingSale || salesItems.length === 0 || !customerMobile.trim()}
              >
                {isProcessingSale && <Loader2 className="animate-spin w-5 h-5" />}
                <span>{isProcessingSale ? 'Processing...' : 'Complete Sale'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesModal;
