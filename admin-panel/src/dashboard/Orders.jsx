import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000/api';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('adminToken')}` });

const STATUS_OPTIONS = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  placed: 'text-blue-600 bg-blue-50', confirmed: 'text-indigo-600 bg-indigo-50',
  preparing: 'text-amber-600 bg-amber-50', out_for_delivery: 'text-orange-600 bg-orange-50',
  delivered: 'text-green-600 bg-green-50', cancelled: 'text-red-500 bg-red-50',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get(`${API}/orders/all`, { headers: getHeaders() })
      .then(r => setOrders(r.data.orders))
      .catch(() => toast.error('Failed to load orders'));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/orders/${id}/status`, { status }, { headers: getHeaders() });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders</h1>
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>{['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(order => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{order.user?.name || '—'}</p>
                  <p className="text-gray-400 text-xs">{order.user?.phone}</p>
                </td>
                <td className="px-4 py-3 text-gray-500">{order.items?.length} items</td>
                <td className="px-4 py-3 font-semibold">₹{order.total}</td>
                <td className="px-4 py-3 text-xs uppercase text-gray-500">{order.payment?.method}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order._id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-400"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}