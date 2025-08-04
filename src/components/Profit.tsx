import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, X, DollarSign, Package, User, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProfitItem {
  saleId: string;
  productId: string;
  productName: string;
  customerName: string;
  customerMobile: string;
  soldPrice: number;
  purchasePrice: number;
  profit: number;
  quantity: number;
  totalProfit: number;
  saleDate: string;
  product?: any; // Full product details
}

interface ProfitProps {
  soldProducts: any[];
  products: any[];
}

const Profit: React.FC<ProfitProps> = ({ soldProducts, products }) => {
  const [profitItems, setProfitItems] = useState<ProfitItem[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProfitItem, setSelectedProfitItem] = useState<ProfitItem | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    calculateProfitItems();
  }, [soldProducts, products]);

  const calculateProfitItems = () => {
    const items: ProfitItem[] = soldProducts.map(soldItem => {
      const product = products.find(p => p.id === soldItem.productId);
      const purchasePrice = product?.buysellpricePerUnit || 0;
      const soldPrice = soldItem.sellpricePerUnit || 0;
      const profit = soldPrice - purchasePrice;
      const totalProfit = profit * soldItem.quantity;

      return {
        saleId: soldItem.saleId,
        productId: soldItem.productId,
        productName: soldItem.productName,
        customerName: soldItem.customerName || 'N/A',
        customerMobile: soldItem.customerMobile || 'N/A',
        soldPrice,
        purchasePrice,
        profit,
        quantity: soldItem.quantity,
        totalProfit,
        saleDate: soldItem.timestamp || soldItem.dateOfSale,
        product
      };
    }).sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());

    setProfitItems(items);
  };

  const totalProfit = profitItems.reduce((sum, item) => sum + item.totalProfit, 0);
  const displayItems = showFullHistory ? profitItems : profitItems.slice(0, 3);
  
  // Pagination for full history
  const totalPages = Math.ceil(profitItems.length / itemsPerPage);
  const paginatedItems = showFullHistory 
    ? profitItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : displayItems;

  const handleProductClick = (item: ProfitItem) => {
    setSelectedProfitItem(item);
    setShowDetailModal(true);
  };

  const downloadReceipt = () => {
    // Implement receipt download functionality
    alert('Receipt download feature coming soon!');
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (profitItems.length === 0) {
    return (
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 shadow-lg shadow-green-500/10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
          Profit Analysis
        </h3>
        <div className="text-center py-8">
          <DollarSign className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">No sales data available for profit analysis</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 shadow-lg shadow-green-500/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Profit Analysis ({profitItems.length} sales)
          </h3>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Total Profit</p>
            <p className="text-2xl font-bold text-green-400">৳{totalProfit.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-4">
          {paginatedItems.map((item) => (
            <div
              key={item.saleId}
              className="bg-slate-800/30 rounded-xl p-4 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer border border-slate-700/30"
              onClick={() => handleProductClick(item)}
            >
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                <div className="md:col-span-2">
                  <h4 className="text-white font-medium">{item.productName}</h4>
                  <p className="text-cyan-400 text-sm font-mono">ID: {item.productId}</p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-xs">Customer</p>
                  <p className="text-white text-sm">{item.customerName}</p>
                  <p className="text-slate-300 text-xs">{item.customerMobile}</p>
                </div>

                <div>
                  <p className="text-slate-400 text-xs">Sale Price</p>
                  <p className="text-white font-medium">৳{item.soldPrice.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-slate-400 text-xs">Purchase Price</p>
                  <p className="text-white font-medium">৳{item.purchasePrice.toFixed(2)}</p>
                </div>

                <div className="text-right">
                  <p className="text-slate-400 text-xs">Profit</p>
                  <p className={`text-lg font-bold ${item.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ৳{item.totalProfit.toFixed(2)}
                  </p>
                  <p className="text-slate-300 text-xs">Qty: {item.quantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!showFullHistory && profitItems.length > 3 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowFullHistory(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/25 mx-auto"
            >
              <Eye className="w-5 h-5" />
              <span>View Complete History ({profitItems.length} items)</span>
            </button>
          </div>
        )}

        {showFullHistory && (
          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFullHistory(false)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700/70 text-white rounded-lg transition-all duration-300"
              >
                <X className="w-4 h-4" />
                <span>Show Less</span>
              </button>

              {totalPages > 1 && (
                <div className="flex items-center space-x-4">
                  <span className="text-slate-400 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        currentPage === 1
                          ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-700/50 hover:bg-slate-700/70 text-white'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        currentPage === totalPages
                          ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-700/50 hover:bg-slate-700/70 text-white'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {showDetailModal && selectedProfitItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8 shadow-lg shadow-green-500/10 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Profit Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg border border-red-500/30 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="aspect-square bg-slate-800/30 rounded-xl overflow-hidden">
                  {selectedProfitItem.product?.image ? (
                    <img
                      src={selectedProfitItem.product.image}
                      alt={selectedProfitItem.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-24 h-24 text-slate-400" />
                    </div>
                  )}
                </div>
                
                <button
                  onClick={downloadReceipt}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Receipt</span>
                </button>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{selectedProfitItem.productName}</h3>
                  <p className="text-cyan-400 font-mono">ID: {selectedProfitItem.productId}</p>
                </div>

                {/* Customer Information */}
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2 text-blue-400" />
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Name:</span>
                      <span className="text-white">{selectedProfitItem.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mobile:</span>
                      <span className="text-white">{selectedProfitItem.customerMobile}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                    Financial Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Purchase Price:</span>
                      <span className="text-white">৳{selectedProfitItem.purchasePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sale Price:</span>
                      <span className="text-white">৳{selectedProfitItem.soldPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Quantity:</span>
                      <span className="text-white">{selectedProfitItem.quantity}</span>
                    </div>
                    <div className="border-t border-slate-700/50 pt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Profit per Unit:</span>
                        <span className={`font-semibold ${selectedProfitItem.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ৳{selectedProfitItem.profit.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Total Profit:</span>
                        <span className={`text-xl font-bold ${selectedProfitItem.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ৳{selectedProfitItem.totalProfit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Description */}
                {selectedProfitItem.product?.description && (
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-3">Product Description</h4>
                    <p className="text-slate-300">{selectedProfitItem.product.description}</p>
                  </div>
                )}

                {/* Sale Date */}
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-2">Sale Information</h4>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sale Date:</span>
                    <span className="text-white">
                      {new Date(selectedProfitItem.saleDate).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profit;
