import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface PurchaseQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (
    quantity: number,
    buyPrice?: number,
    sellPrice?: number
  ) => void;
}

const PurchaseQuantityModal: React.FC<PurchaseQuantityModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm
}) => {
  const [quantity, setQuantity] = useState(1);
  const [useCustomPrice, setUseCustomPrice] = useState(false);

  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');

  // When modal opens, load default values from product
  useEffect(() => {
    if (product) {
      setBuyPrice(product.buysellpricePerUnit?.toString() || '');
      setSellPrice(product.sellpricePerUnit?.toString() || '');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const finalBuy = useCustomPrice && buyPrice
    ? parseFloat(buyPrice)
    : product.buysellpricePerUnit;

  const finalSell = useCustomPrice && sellPrice
    ? parseFloat(sellPrice)
    : product.sellpricePerUnit;

  const totalCost = quantity * finalBuy;

  const handleConfirm = async () => {
    if (quantity > 0) {
      onConfirm(quantity, finalBuy, finalSell);

      try {
        await fetch(`/api/products/${product.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buysellpricePerUnit: finalBuy,
            sellsellpricePerUnit: finalSell
          })
        });
      } catch (error) {
        console.error("Error updating prices:", error);
      }

      setQuantity(1);
      setUseCustomPrice(false);
      setBuyPrice('');
      setSellPrice('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-blue-500/20 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-b border-blue-500/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Purchase Stock</h2>
                <p className="text-slate-400 text-sm">Set quantity and prices</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product Info */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-white font-semibold">{product.name}</h3>
                <p className="text-slate-400 text-sm">ID: {product.id}</p>
                <p className="text-blue-400 font-medium">
                  Current Stock: {product.stock} {product.unit}
                </p>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-6">
            <div>
              <label className="block text-slate-400 text-sm mb-3">
                Purchase Quantity ({product.unit})
              </label>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300 disabled:opacity-50"
                >
                  <Minus className="w-5 h-5 text-white" />
                </button>
                <div className="bg-white/10 border border-white/20 rounded-lg px-6 py-3 min-w-[100px] text-center">
                  <span className="text-white text-xl font-bold">{quantity}</span>
                </div>
                <button
                  onClick={incrementQuantity}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Price Inputs */}
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  id="useCustomPrice"
                  checked={useCustomPrice}
                  onChange={(e) => setUseCustomPrice(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="useCustomPrice" className="text-slate-400 text-sm">
                  Use custom buy & sell price
                </label>
              </div>

              {useCustomPrice ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Buy Price */}
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Buy Price per {product.unit}
                    </label>
                    <input
                      type="number"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      placeholder={`৳${product.buysellpricePerUnit}`}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>

                  {/* Sell Price */}
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Sell Price per {product.unit}
                    </label>
                    <input
                      type="number"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      placeholder={`৳${product.sellpricePerUnit}`}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 border border-white/20 rounded-lg p-3 space-y-1">
                  <p>
                    <span className="text-slate-400 text-sm">Default Buy: </span>
                    <span className="text-blue-400 font-medium">
                      ৳{product.buysellpricePerUnit}/{product.unit}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-400 text-sm">Default Sell: </span>
                    <span className="text-green-400 font-medium">
                      ৳{product.sellpricePerUnit}/{product.unit}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Total Cost */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Total Cost:</span>
                <span className="text-blue-400 text-2xl font-bold">
                  ৳{totalCost.toFixed(2)}
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                {quantity} {product.unit} × ৳{finalBuy.toFixed(2)} = ৳{totalCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white/5 border-t border-white/10 p-6">
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition-all hover:scale-[1.02]"
            >
              Add to Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseQuantityModal;
