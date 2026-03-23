import React from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateCartItem, removeFromCart, selectCartTotal } from '../store/slices/cartSlice';
import { pageTransition } from '../animations/motionVariants';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { items } = useSelector((s) => s.cart);
  const total = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const DELIVERY_FEE = total >= 199 ? 0 : 20;

  return (
    <motion.div {...pageTransition} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">My Cart ({items.length} items)</h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingBag size={56} className="mx-auto text-gray-200 mb-4" />
          <h2 className="font-display text-xl text-gray-500">Your cart is empty</h2>
          <Link to="/categories" className="inline-block mt-4 btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <motion.div
                key={item._id}
                layout
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm"
              >
                <img
                  src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&fit=crop'}
                  alt={item.product?.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.product?.name}</h3>
                  <p className="text-sm text-gray-400">{item.product?.unit}</p>
                  <p className="text-brand-600 font-bold mt-1">₹{item.price}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => dispatch(removeFromCart(item._id))} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center gap-1.5 mt-auto">
                    <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))} className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm h-fit sticky top-20">
            <h3 className="font-display text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between"><span>Subtotal ({items.length} items)</span><span>₹{total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Delivery fee</span><span className={DELIVERY_FEE === 0 ? 'text-brand-600 font-medium' : ''}>{DELIVERY_FEE === 0 ? 'FREE' : `₹${DELIVERY_FEE}`}</span></div>
              {total < 199 && <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1">Add ₹{(199 - total).toFixed(0)} more for free delivery</p>}
              <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{(total + DELIVERY_FEE).toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary block text-center mt-4">Proceed to Checkout →</Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}