import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    axios.get('http://localhost:5000/api/orders/all', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => {
      const orders = r.data.orders || [];
      const map = {};
      orders.forEach(o => {
        if (o.user?._id) {
          if (!map[o.user._id]) map[o.user._id] = { ...o.user, orderCount: 0, totalSpent: 0 };
          map[o.user._id].orderCount += 1;
          map[o.user._id].totalSpent += o.total;
        }
      });
      setCustomers(Object.values(map));
    }).catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Customers ({customers.length})</h1>
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>{['Name', 'Email', 'Phone', 'Orders', 'Total Spent'].map(h => <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map(c => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {c.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.email}</td>
                <td className="px-4 py-3 text-gray-500">{c.phone}</td>
                <td className="px-4 py-3">
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">{c.orderCount} orders</span>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-800">₹{c.totalSpent.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}