import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { pageTransition } from '../animations/motionVariants';
import { User, Package, LogOut, ChevronRight } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile', form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div {...pageTransition} className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Avatar + info */}
      <div className="bg-gradient-to-br from-brand-500 to-emerald-400 rounded-2xl p-6 text-white mb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/25 rounded-2xl flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-display text-xl font-bold">{user?.name}</p>
            <p className="text-brand-100 text-sm">{user?.email}</p>
            <p className="text-brand-100 text-sm">{user?.phone}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Edit Profile */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Edit Profile</h2>
          <form onSubmit={handleUpdate} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Email (read-only)</label>
              <input value={user?.email} className="input-field bg-gray-50 text-gray-400" readOnly />
            </div>
            <button type="submit" disabled={saving} className="btn-primary text-sm py-2">{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <Link to="/orders" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
            <Package size={18} className="text-brand-600" />
            <span className="flex-1 text-sm font-medium text-gray-700">My Orders</span>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
          <button
            onClick={() => { dispatch(logout()); navigate('/'); }}
            className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} className="text-red-400" />
            <span className="flex-1 text-left text-sm font-medium text-red-500">Logout</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}