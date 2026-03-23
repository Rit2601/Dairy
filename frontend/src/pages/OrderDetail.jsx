import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../store/slices/orderSlice';
import { pageTransition } from '../animations/motionVariants';
import { MapPin, Clock, CreditCard, Package, ChevronLeft } from 'lucide-react';
import { Spinner } from '../components/Loader';

const ORDER_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '📦' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚴' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

export default function OrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrderById(id)); }, [id, dispatch]);

  if (loading || !order) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  const currentStepIdx = ORDER_STEPS.findIndex(s => s.key === order.status);

  return (
    <motion.div {...pageTransition} className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/orders" className="flex items-center gap-1 text-gray-500 hover:text-brand-600 mb-5 text-sm">
        <ChevronLeft size={16} /> Back to Orders
      </Link>

      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-display text-xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-sm text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">₹{order.total}</p>
              <p className="text-xs text-gray-400">{order.payment.method.toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Tracking */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Order Tracking</h2>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />
              {ORDER_STEPS.map((step, i) => {
                const isCompleted = i <= currentStepIdx;
                const isCurrent = i === currentStepIdx;
                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`relative flex items-start gap-4 pb-5 last:pb-0 ${isCompleted ? '' : 'opacity-40'}`}
                  >
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${isCurrent ? 'border-brand-500 bg-brand-50' : isCompleted ? 'border-brand-500 bg-brand-500' : 'border-gray-200 bg-white'}`}>
                      {step.icon}
                    </div>
                    <div className="pt-2">
                      <p className={`text-sm font-semibold ${isCurrent ? 'text-brand-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
                      {isCurrent && <p className="text-xs text-brand-500 mt-0.5">Current status</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3">Items Ordered</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3">
                <img src={item.image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=60&fit=crop'} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.unit} × {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800">₹{(item.price * item.quantity).toFixed(0)}</p>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
            <div className="flex justify-between text-gray-500"><span>Delivery</span><span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span></div>
            <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span>₹{order.total}</span></div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><MapPin size={16} className="text-brand-600" /> Delivery Address</h2>
          <p className="text-sm text-gray-600">{order.address.fullName} • {order.address.phone}</p>
          <p className="text-sm text-gray-500">{order.address.line1}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
        </div>
      </div>
    </motion.div>
  );
}