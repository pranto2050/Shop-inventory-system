import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Category {
  id: string;
  name: string;
  items: string[];
  description: string;
  createdDate: string;
}

const AddItem: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/data/categories.json')
      .then(res => {
        // Migrate old structure to new if needed
        const data = res.data.map((cat: any) => ({
          ...cat,
          items: cat.items || []
        }));
        setCategories(data);
      })
      .catch(() => setCategories([]));
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      setMessage('Please select a category.');
      return;
    }
    if (!newItemName.trim()) {
      setMessage('Item name is required.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const updatedCategories = categories.map(cat =>
        cat.id === selectedCategoryId
          ? { ...cat, items: [...(cat.items || []), newItemName] }
          : cat
      );
      // Save to backend (uses correct server URL)
      await axios.post('https://shop-inventory-api.onrender.com/api/categories', updatedCategories);
      setCategories(updatedCategories);
      setMessage('Item added successfully!');
      setNewItemName('');
    } catch (err) {
      setMessage('Failed to add item.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900/70 backdrop-blur-xl border border-slate-700/40 rounded-3xl shadow-2xl p-8 mt-10">
      <h2 className="text-2xl font-bold text-white text-center mb-6">Add Category Item</h2>
      <form onSubmit={handleAddItem} className="space-y-6 mb-10">
        <div>
          <label className="block text-slate-400 text-sm mb-2">Select Category</label>
          <select
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all hover:bg-slate-800/80"
            value={selectedCategoryId}
            onChange={e => setSelectedCategoryId(e.target.value)}
          >
            <option value="">-- Choose Category --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-2">New Item Name</label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all hover:bg-slate-800/80"
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            placeholder="Enter item name"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.03] shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        {message && <div className="mt-2 text-sm text-red-500">{message}</div>}
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="border border-slate-700/40 rounded-2xl p-4 bg-slate-800/40 backdrop-blur-lg shadow-lg">
            <h3 className="text-xl font-bold text-white mb-2">{cat.name}</h3>
            <ul className="list-disc pl-6 mb-2">
              {cat.items && cat.items.length > 0 ? (
                cat.items.map((item, idx) => <li key={idx} className="text-white/90">{item}</li>)
              ) : (
                <li className="text-slate-400">No items yet</li>
              )}
            </ul>
            <p className="text-sm text-slate-400">{cat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddItem;
