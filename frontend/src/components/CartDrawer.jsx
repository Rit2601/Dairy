import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  closeCart,
  updateCartItem,
  removeFromCart,
  selectCartTotal,
} from '../store/slices/cartSlice';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=80&h=80&fit=crop';

export default function CartDrawer() {
  const { isOpen, items } = useSelector((s) => s.cart);
  const total = useSelector(selectCartTotal);
  const dispatch = useDispatch();

  const DELIVERY_FEE = total >= 199 ? 0 : 20;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-brand-600" size={22} />
                <h2 className="font-display text-lg font-semibold">Your Cart</h2>
                <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {items.length} items
                </span>
              </div>
              <button
                onClick={() => dispatch(closeCart())}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Free delivery banner */}
            {total > 0 && total < 199 && (
              <div className="mx-3 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
                🎉 Add ₹{(199 - total).toFixed(0)} more for FREE delivery!
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="text-5xl mb-4">🛒</div>
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-1">Add some fresh dairy products!</p>
                  <button
                    onClick={() => dispatch(closeCart())}
                    className="mt-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-5 rounded-2xl text-sm transition-colors"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-3 bg-gray-50 rounded-2xl p-3"
                  >
                    <img
                      src={
                        item.product?.images?.[0] ||
                        item.product?.image ||
                        PLACEHOLDER
                      }
                      alt={item.product?.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      onError={(e) => { e.target.src = PLACEHOLDER; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-gray-400">{item.product?.unit}</p>
                      <p className="text-sm font-bold text-brand-600 mt-0.5">₹{item.price}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="p-1 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-gray-300"
                      >
                        <Trash2 size={13} />
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                          className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-brand-50 hover:border-brand-300 transition-colors"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-sm font-bold w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                          className="w-6 h-6 rounded-lg bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 p-4 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className={DELIVERY_FEE === 0 ? 'text-brand-600 font-medium' : ''}>
                      {DELIVERY_FEE === 0 ? 'FREE' : `₹${DELIVERY_FEE}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                    <span>Total</span>
                    <span>₹{(total + DELIVERY_FEE).toFixed(2)}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => dispatch(closeCart())}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold block text-center w-full py-3 rounded-2xl transition-colors"
                >
                  Proceed to Checkout →
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}