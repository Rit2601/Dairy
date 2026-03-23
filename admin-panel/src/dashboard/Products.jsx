import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const API = 'http://localhost:5000/api';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('adminToken')}` });

const EMPTY_PRODUCT = {
  name: '', slug: '', description: '', price: '', mrp: '', unit: '500ml',
  stock: 0, category: '', isFeatured: false, isBestSeller: false, isFreshToday: false,
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [editId, setEditId] = useState(null);

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        axios.get(`${API}/products?limit=50`, { headers: getHeaders() }),
        axios.get(`${API}/categories`),
      ]);
      setProducts(pRes.data.products);
      setCategories(cRes.data.categories);
    } catch { toast.error('Failed to load'); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API}/products/${editId}`, form, { headers: getHeaders() });
        toast.success('Product updated!');
      } else {
        await axios.post(`${API}/products`, form, { headers: { ...getHeaders(), 'Content-Type': 'application/json' } });
        toast.success('Product created!');
      }
      setShowModal(false);
      setForm(EMPTY_PRODUCT);
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await axios.delete(`${API}/products/${id}`, { headers: getHeaders() });
    toast.success('Deleted');
    load();
  };

  const openEdit = (p) => {
    setForm({ ...p, category: p.category?._id || p.category });
    setEditId(p._id);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button onClick={() => { setForm(EMPTY_PRODUCT); setEditId(null); setShowModal(true); }} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>{['Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.category?.name}</td>
                <td className="px-4 py-3">₹{p.price}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${p.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    {p.stock > 0 ? `${p.stock} in stock` : 'Out'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {p.isFeatured && <span className="bg-purple-50 text-purple-600 text-xs px-1.5 py-0.5 rounded">Featured</span>}
                    {p.isBestSeller && <span className="bg-orange-50 text-orange-600 text-xs px-1.5 py-0.5 rounded">Bestseller</span>}
                    {p.isFreshToday && <span className="bg-green-50 text-green-600 text-xs px-1.5 py-0.5 rounded">Fresh</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg"><Edit size={15} /></button>
                    <button onClick={() => handleDelete(p._id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{editId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { key: 'name', label: 'Product Name', type: 'text', required: true },
                { key: 'slug', label: 'Slug', type: 'text', required: true },
                { key: 'price', label: 'Price (₹)', type: 'number', required: true },
                { key: 'mrp', label: 'MRP (₹)', type: 'number' },
                { key: 'unit', label: 'Unit (e.g. 500ml)', type: 'text' },
                { key: 'stock', label: 'Stock', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    required={f.required}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" required />
              </div>
              <div className="flex gap-4">
                {['isFeatured', 'isBestSeller', 'isFreshToday'].map(flag => (
                  <label key={flag} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={form[flag]} onChange={e => setForm({ ...form, [flag]: e.target.checked })} className="accent-green-600" />
                    {flag.replace('is', '')}
                  </label>
                ))}
              </div>
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors">
                {editId ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}