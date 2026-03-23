import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './dashboard/Dashboard';
import Products from './dashboard/Products';
import Orders from './dashboard/Orders';
import Customers from './dashboard/Customers';
import Analytics from './dashboard/Analytics';
import Login from './dashboard/Login';
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, LogOut, Menu, X } from 'lucide-react';

function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const token = localStorage.getItem('adminToken');

  const links = [
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/products', icon: <Package size={18} />, label: 'Products' },
    { to: '/orders', icon: <ShoppingCart size={18} />, label: 'Orders' },
    { to: '/customers', icon: <Users size={18} />, label: 'Customers' },
    { to: '/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
  ];

  return (
    <aside className={`h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'} flex-shrink-0`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && <span className="font-bold text-brand-400 text-sm">🥛 DairyFresh Admin</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-white">
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${location.pathname === link.to ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            {link.icon}
            {!collapsed && link.label}
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t border-gray-700">
        <button
          onClick={() => { localStorage.removeItem('adminToken'); window.location.href = '/login'; }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white text-sm"
        >
          <LogOut size={18} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AdminLayout />} />
      </Routes>
    </BrowserRouter>
  );
}