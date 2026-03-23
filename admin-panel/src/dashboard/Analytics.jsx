import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#16a34a', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    axios.get('http://localhost:5000/api/orders/all', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => setOrders(r.data.orders || [])).catch(() => {});
  }, []);

  // Revenue by day (last 7 days)
  const revenueByDay = (() => {
    const days = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { weekday: 'short' });
      days[key] = 0;
    }
    orders.filter(o => o.payment?.status === 'paid').forEach(o => {
      const d = new Date(o.createdAt);
      const key = d.toLocaleDateString('en-IN', { weekday: 'short' });
      if (key in days) days[key] += o.total;
    });
    return Object.entries(days).map(([name, revenue]) => ({ name, revenue }));
  })();

  // Order status distribution
  const statusData = (() => {
    const counts = {};
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  const totalRevenue = orders.filter(o => o.payment?.status === 'paid').reduce((s, o) => s + o.total, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-green-600' },
          { label: 'Total Orders', value: orders.length, color: 'text-blue-600' },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'text-purple-600' },
          { label: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: 'text-red-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">Revenue (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={v => [`₹${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">Order Status Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}