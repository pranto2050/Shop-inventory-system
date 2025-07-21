import React, { useState } from 'react';

const categories = [
  'Electronics',
  'Groceries',
  'Clothing',
  'Home Appliances',
  'Books',
  'Other',
];

const AddCategoryItem: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    if (!selectedCategory || !itemName.trim()) return;
    // Save logic here
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    setItemName('');
    setSelectedCategory('');
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900/95 border border-slate-700/50 rounded-2xl shadow-2xl p-8 mt-10">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Add Category Item</h2>
      <div className="mb-6">
        <label className="block text-slate-400 text-sm mb-2">Select Category</label>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
        >
          <option value="">-- Choose Category --</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="mb-6">
        <label className="block text-slate-400 text-sm mb-2">New Item Name</label>
        <input
          type="text"
          value={itemName}
          onChange={e => setItemName(e.target.value)}
          placeholder="Enter item name"
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={!selectedCategory || !itemName.trim()}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save
      </button>
      {success && (
        <div className="mt-4 text-green-400 text-center">Item saved successfully!</div>
      )}
    </div>
  );
};

export default AddCategoryItem;
