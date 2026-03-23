import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyOrders } from '../store/slices/orderSlice';
import { pageTransition } from '../animations/motionVariants';
import { Package, ChevronRight } from 'lucide-react';
import { Spinner } from '../components/Loader';
import { getImageUrl } from '../utils/imageUrl';

const STATUS_CONFIG = {
  placed: { label: 'Order Placed', color: 'bg-blue-100 text-blue-700', icon: '📦' },
  confirmed: { label: 'Confirmed', color: 'bg-indigo-100 text-indigo-700', icon: '✅' },
  preparing: { label: 'Preparing', color: 'bg-amber-100 text-amber-700', icon: '👨‍🍳' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700', icon: '🚴' },
  delivered: { label: 'Delivered', color: 'bg-brand-100 text-brand-700', icon: '🎉' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-500', icon: '✕' },
};

export default function Orders() {
  const dispatch = useDispatch();
  const { items: orders, loading } = useSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <motion.div
      {...pageTransition}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8"
    >
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">
        My Orders
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={56} className="mx-auto text-gray-200 mb-4" />
          <h2 className="font-display text-xl text-gray-500">No orders yet</h2>
          <Link to="/categories" className="inline-block mt-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => {
            const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/orders/${order._id}`}
                  className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {order.items.length} item
                        {order.items.length > 1 ? 's' : ''} • ₹{order.total}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.color}`}
                      >
                        {st.icon} {st.label}
                      </span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {order.items.slice(0, 3).map((item, j) => (
                      <img
                        key={j}
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=60&fit=crop';
                        }}
                      />
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-semibold">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}