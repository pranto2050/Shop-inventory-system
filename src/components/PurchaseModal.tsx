import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Download, Trash2 } from 'lucide-react';
import { AdminPurchaseItem } from '../types';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseItems: AdminPurchaseItem[];
  onRemoveItem: (productId: string) => void;
  onCompletePurchase: (customDateTime?: string) => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  purchaseItems,
  onRemoveItem,
  onCompletePurchase
}) => {
  const [customDateTime, setCustomDateTime] = useState('');
  const [useCustomDateTime, setUseCustomDateTime] = useState(false);

  if (!isOpen) return null;

  const totalCost = purchaseItems.reduce((sum, item) => sum + item.totalCost, 0);
  const totalItems = purchaseItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCompletePurchase = () => {
    const dateTimeToUse = useCustomDateTime && customDateTime ? customDateTime : undefined;
    onCompletePurchase(dateTimeToUse);
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
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-b border-slate-700/50 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Purchase Summary</h2>
                <p className="text-slate-400">Review and complete your stock purchase</p>
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

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {purchaseItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No items in purchase order</p>
              </div>
            ) : (
              <div className="space-y-4">
                {purchaseItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800/50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="text-white font-semibold">{item.product.name}</h3>
                        <p className="text-slate-400 text-sm">ID: {item.product.id}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-blue-400 text-sm">
                            ₹{item.product.sellpricePerUnit}/{item.product.unit}
                          </span>
                          {item.product.supplier && (
                            <span className="text-slate-500 text-xs bg-slate-700/50 px-2 py-1 rounded">
                              {item.product.supplier}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {item.quantity} {item.product.unit}
                        </p>
                        <p className="text-blue-400 font-bold text-lg">
                          ₹{item.totalCost.toFixed(2)}
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
          {purchaseItems.length > 0 && (
            <div className="px-6 pb-6">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                <div className="mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="checkbox"
                      id="useCustomPurchaseDateTime"
                      checked={useCustomDateTime}
                      onChange={(e) => setUseCustomDateTime(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="useCustomPurchaseDateTime" className="text-slate-400 text-sm">
                      Use custom date & time for this purchase
                    </label>
                  </div>
                  
                  {useCustomDateTime ? (
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Purchase Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={customDateTime || getCurrentDateTime()}
                        onChange={(e) => setCustomDateTime(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                      <span className="text-slate-400 text-sm">Current Date & Time: </span>
                      <span className="text-blue-400 font-medium">
                        {new Date().toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        {purchaseItems.length > 0 && (
          <div className="bg-slate-800/30 border-t border-slate-700/50 p-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-6">
              <div className="text-white">
                <p className="text-lg">Total Items: <span className="font-bold text-blue-400">{totalItems}</span></p>
                <p className="text-2xl font-bold text-blue-400">
                  Total Cost: ₹{totalCost.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-xl border border-slate-600/50 transition-all duration-300"
              >
                Cancel
              </button>
              
              <button
                onClick={handleCompletePurchase}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25"
              >
                Complete Purchase
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseModal;