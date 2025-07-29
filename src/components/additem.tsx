import React, { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
}

const API_BASE = 'https://shop-inventory-api.onrender.com/api';

const AddItem: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    // Fetch categories from API
    fetch(`${API_BASE}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  const handleSave = async () => {
    if (!selectedCategory || !itemName.trim()) {
      setNotification('Please select a category and enter an item name.');
      setTimeout(() => setNotification(''), 2000);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/category-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategory,
          name: itemName.trim()
        })
      });
      if (res.ok) {
        setNotification('Item saved!');
        setItemName('');
      } else {
        setNotification('Failed to save item.');
      }
    } catch {
      setNotification('Error saving item.');
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(''), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-white font-semibold mb-2">Select Category</label>
      <select
        value={selectedCategory}
        onChange={e => setSelectedCategory(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-cyan-400 mb-4"
      >
        <option value="">-- Select Category --</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <label className="block text-white font-semibold mb-2">New Item Name</label>
      <input
        type="text"
        value={itemName}
        onChange={e => setItemName(e.target.value)}
        placeholder="Enter item name"
        className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-cyan-400 mb-4"
      />

      <button
        onClick={handleSave}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
      {notification && (
        <div className="mt-2 text-green-400">{notification}</div>
      )}
    </div>
  );
};

export default AddItem;
