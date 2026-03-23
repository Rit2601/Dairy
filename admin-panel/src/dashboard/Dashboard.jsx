import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, ShoppingCart, Users, IndianRupee, TrendingUp, Clock } from 'lucide-react';

const STAT_CARDS = [
  { label: 'Total Revenue', key: 'revenue', icon: <IndianRupee size={20} />, color: 'bg-green-100 text-green-700', prefix: '₹' },
  { label: 'Total Orders', key: 'orders', icon: <ShoppingCart size={20} />, color: 'bg-blue-100 text-blue-700' },
  { label: 'Products', key: 'products', icon: <Package size={20} />, color: 'bg-purple-100 text-purple-700' },
  { label: 'Customers', key: 'customers', icon: <Users size={20} />, color: 'bg-orange-100 text-orange-700' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ revenue: '0', orders: 0, products: 0, customers: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get('http://localhost:5000/api/orders/all', { headers }),
      axios.get('http://localhost:5000/api/products', { headers }),
    ]).then(([ordersRes, productsRes]) => {
      const orders = ordersRes.data.orders || [];
      const revenue = orders.filter(o => o.payment?.status === 'paid').reduce((s, o) => s + o.total, 0);
      setStats({
        revenue: revenue.toLocaleString('en-IN'),
        orders: orders.length,
        products: productsRes.data.total || 0,
        customers: new Set(orders.map(o => o.user?._id)).size,
      });
      setRecentOrders(orders.slice(0, 8));
    }).catch(() => {});
  }, []);

  const STATUS_COLORS = {
    placed: 'text-blue-600 bg-blue-50',
    confirmed: 'text-indigo-600 bg-indigo-50',
    preparing: 'text-amber-600 bg-amber-50',
    out_for_delivery: 'text-orange-600 bg-orange-50',
    delivered: 'text-green-600 bg-green-50',
    cancelled: 'text-red-500 bg-red-50',
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS.map(card => (
          <div key={card.key} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className={`inline-flex p-2 rounded-xl ${card.color} mb-3`}>{card.icon}</div>
            <p className="text-2xl font-bold text-gray-800">{card.prefix || ''}{stats[card.key]}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Clock size={18} className="text-gray-400" />
          <h2 className="font-semibold text-gray-700">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {['Order #', 'Customer', 'Amount', 'Payment', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.user?.name || '—'}</td>
                  <td className="px-4 py-3 font-semibold">₹{order.total}</td>
                  <td className="px-4 py-3 uppercase text-xs">{order.payment?.method}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'text-gray-600 bg-gray-100'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}