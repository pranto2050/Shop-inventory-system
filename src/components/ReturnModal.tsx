import React, { useState } from 'react';
import { X, Search, Undo2, Package } from 'lucide-react';
import { getProductById } from '../utils/storage';
import { Product } from '../types';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessReturn: (productId: string, quantity: number, reason: string) => void;
}

const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  onProcessReturn
}) => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [maxPurchased, setMaxPurchased] = useState<number | null>(null);
  const [isEditingComp, setIsEditingComp] = useState(false);
  const [compType, setCompType] = useState<'percent' | 'amount'>('percent');
  const [compValue, setCompValue] = useState<number>(0);
  const [finalRefund, setFinalRefund] = useState<number | null>(null);

  // Helper to fetch JSON data
  const fetchJson = async (path: string) => {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to fetch ' + path);
    return await res.json();
  };

  const handleSearch = async () => {
    if (!productId.trim()) {
      setError('Please enter a Product ID or Customer Mobile Number');
      return;
    }

    try {
      const sales = await fetchJson('/data/sales.json');
      const input = productId.trim();
      // Check if input is mobile number (10+ digits or starts with +880)
      const isMobile = /^\+?\d{10,}$/.test(input);
      let saleRecord = null;
      let purchasedQty = null;
      if (isMobile) {
        // Find all sales for this mobile number
        const customerSales = sales.filter((s: any) => s.customerMobile.replace(/\D/g, '') === input.replace(/\D/g, ''));
        if (customerSales.length === 0) {
          setProduct(null);
          setMaxPurchased(null);
          setError('Product not found');
          return;
        }
        // Use the first product for display, but sum quantity for that product
        const firstProductId = customerSales[0].productId;
        const foundProduct = await getProductById(firstProductId);
        if (foundProduct) {
          setProduct(foundProduct);
          // Sum quantity for this product and customer
          purchasedQty = customerSales
            .filter((s: any) => s.productId === firstProductId)
            .reduce((sum: number, s: any) => sum + (s.quantity || 0), 0);
          setMaxPurchased(purchasedQty);
          setError('');
        } else {
          setProduct(null);
          setMaxPurchased(null);
          setError('Product not found');
        }
      } else {
        // Find sale by product ID
        saleRecord = sales.find((s: any) => s.productId === input);
        if (!saleRecord) {
          setProduct(null);
          setMaxPurchased(null);
          setError('Product not found');
          return;
        }
        const foundProduct = await getProductById(saleRecord.productId);
        if (foundProduct) {
          setProduct(foundProduct);
          setMaxPurchased(saleRecord.quantity || 0);
          setError('');
        } else {
          setProduct(null);
          setMaxPurchased(null);
          setError('Product not found');
        }
      }
    } catch (err) {
      setProduct(null);
      setMaxPurchased(null);
      setError('Error searching for product/sale');
    }
  };

  const handleReturn = () => {
    if (!product) {
      setError('Please search for a valid product first');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (maxPurchased !== null && quantity > maxPurchased) {
      setError(`You cannot return more than you purchased (${maxPurchased}).`);
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for return');
      return;
    }

    onProcessReturn(product.id, quantity, reason);
    // Reset form
    setProductId('');
    setQuantity(1);
    setReason('');
    setProduct(null);
    setError('');
    setMaxPurchased(null);
    onClose();
  };

  const totalRefund = product ? quantity * product.sellpricePerUnit : 0;
  // Calculate compensated refund
  const compensatedRefund = (() => {
    if (!isEditingComp && finalRefund !== null) return finalRefund;
    if (compType === 'percent' && compValue > 0 && compValue <= 100) {
      return totalRefund * (compValue / 100);
    }
    if (compType === 'amount' && compValue > 0 && compValue <= totalRefund) {
      return totalRefund - compValue;
    }
    return totalRefund;
  })();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col">
        {/* Content (scrollable) */}
        <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {/* Product/Customer Search */}
          <div>
            <label className="block text-slate-400 text-sm mb-3">Product ID or Customer Mobile Number</label>
            <div className="flex space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="Enter Product ID (e.g., RICE001) or Mobile Number"
                  className="w-full pl-4 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 text-orange-400 rounded-xl border border-orange-500/30 transition-all duration-300 flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Product Details */}
          {product && (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{product.name}</h3>
                  <p className="text-slate-400 text-sm">ID: {product.id}</p>
                  <p className="text-orange-400 font-medium">৳{product.sellpricePerUnit}/{product.unit}</p>
                  <p className="text-slate-500 text-sm">Current Stock: {product.stock} {product.unit}</p>
                  {maxPurchased !== null && (
                    <p className="text-green-400 text-sm mt-1">Purchased Quantity: {maxPurchased} {product.unit}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Return Details */}
          {product && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-3">Return Quantity ({product.unit})</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-3">Reason for Return</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for return (e.g., damaged, expired, customer complaint)"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                />
              </div>

              {/* Refund Calculation */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Total Refund Amount:</span>
                  <span className="text-orange-400 text-2xl font-bold flex items-center gap-2">
                    ৳{compensatedRefund.toFixed(2)}
                    <button
                      className="ml-2 p-1 rounded hover:bg-orange-500/30"
                      onClick={() => setIsEditingComp((v) => !v)}
                      title="Edit Compensation"
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                    </button>
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-2">
                  {quantity} {product.unit} × ৳{product.sellpricePerUnit} = ৳{totalRefund.toFixed(2)}
                </p>
                {isEditingComp && (
                  <div className="mt-4 flex items-center gap-3">
                    <select
                      value={compType}
                      onChange={e => setCompType(e.target.value as 'percent' | 'amount')}
                      className="bg-slate-800/50 border border-slate-700/50 rounded px-2 py-1 text-white"
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="amount">Amount (৳)</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      max={compType === 'percent' ? 100 : totalRefund}
                      value={compValue}
                      onChange={e => setCompValue(Number(e.target.value))}
                      placeholder={compType === 'percent' ? 'Enter %' : 'Enter amount'}
                      className="w-24 px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-white"
                    />
                    <button
                      className="p-2 rounded bg-green-500/30 hover:bg-green-500/50"
                      title="Apply Deduction"
                      onClick={() => {
                        let newRefund = totalRefund;
                        if (compType === 'percent' && compValue > 0 && compValue <= 100) {
                          newRefund = totalRefund * (compValue / 100);
                        } else if (compType === 'amount' && compValue > 0 && compValue <= totalRefund) {
                          newRefund = totalRefund - compValue;
                        }
                        setFinalRefund(newRefund);
                        setIsEditingComp(false);
                      }}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                    </button>
                  </div>
                )}
                {finalRefund !== null && !isEditingComp && (
                  <p className="text-slate-400 text-xs mt-2">Compensation applied: {compType === 'percent' ? `${compValue}%` : `৳${compValue}`} deducted.</p>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800/30 border-t border-slate-700/50 p-6">
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-xl border border-slate-600/50 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleReturn}
              disabled={!product}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Process Return
            </button>
          </div>
        </div>
        {/* Header moved to bottom */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-t border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Undo2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Return Policy</h2>
                <p className="text-slate-400">Process product returns and refunds</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;