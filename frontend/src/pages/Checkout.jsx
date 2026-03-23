import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../store/slices/orderSlice';
import { selectCartTotal, clearCartState } from '../store/slices/cartSlice';
import { pageTransition } from '../animations/motionVariants';
import { MapPin, Clock, CreditCard, ChevronRight } from 'lucide-react';
import { Spinner } from '../components/Loader';
import api from '../services/api';
import toast from 'react-hot-toast';

const DELIVERY_SLOTS = [
  {
    date: 'Today',
    slots: ['7:00 AM - 9:00 AM', '10:00 AM - 12:00 PM', '4:00 PM - 6:00 PM'],
  },
  {
    date: 'Tomorrow',
    slots: ['7:00 AM - 9:00 AM', '10:00 AM - 12:00 PM', '4:00 PM - 6:00 PM'],
  },
];

const STEPS = ['Address', 'Delivery Slot', 'Payment'];

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    lat: null,
    lng: null,
  });
  const [slot, setSlot] = useState({ date: '', timeSlot: '' });
  const [payMethod, setPayMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const { items } = useSelector((s) => s.cart);
  const total = useSelector(selectCartTotal);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const DELIVERY_FEE = total >= 199 ? 0 : 20;
  const grandTotal = total + DELIVERY_FEE;

  // Validate address fields
  const validateAddress = () => {
    if (!address.fullName.trim()) { toast.error('Please enter your name'); return false; }
    if (!address.phone.trim()) { toast.error('Please enter your phone number'); return false; }
    if (!address.line1.trim()) { toast.error('Please enter address line 1'); return false; }
    if (!address.city.trim()) { toast.error('Please enter your city'); return false; }
    if (!address.pincode.trim()) { toast.error('Please enter your pincode'); return false; }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        product: i.product._id,
        name: i.product.name,
        image: i.product.images?.[0] || i.product.image || '',
        price: i.price,
        quantity: i.quantity,
        unit: i.product.unit || '500ml',
      }));

      const orderData = {
        address,
        deliverySlot: slot,
        paymentMethod: payMethod,
        items: orderItems,
        subtotal: total,
        deliveryFee: DELIVERY_FEE,
        discount: 0,
        total: grandTotal,
      };

      const order = await dispatch(createOrder(orderData)).unwrap();

      if (payMethod === 'razorpay') {
        // Razorpay online payment flow
        const { data } = await api.post('/payments/create-order', {
          amount: grandTotal,
          orderId: order._id,
        });

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: 'INR',
          name: 'DairyFresh',
          description: 'Order Payment',
          order_id: data.razorpayOrderId,
          handler: async (response) => {
            try {
              await api.post('/payments/verify', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: order._id,
              });
              dispatch(clearCartState());
              toast.success('Payment successful! 🎉');
              navigate(`/orders/${order._id}`);
            } catch {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: { color: '#16a34a' },
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          toast.error('Razorpay not loaded. Please refresh and try again.');
        }
      } else {
        // COD or UPI
        dispatch(clearCartState());
        toast.success('Order placed successfully! 🥛');
        navigate(`/orders/${order._id}`);
      }
    } catch (err) {
      const message = typeof err === 'string' ? err : err?.message || 'Failed to place order';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${i <= step ? 'text-brand-600' : 'text-gray-400'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  i < step
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : i === step
                    ? 'border-brand-600 text-brand-600'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 sm:w-16 mx-1 ${i < step ? 'bg-brand-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">

          {/* Step 0: Address */}
          {step === 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-5 shadow-sm"
            >
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-brand-600" /> Delivery Address
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { key: 'fullName', label: 'Full Name', span: false },
                  { key: 'phone', label: 'Phone Number', span: false },
                  { key: 'line1', label: 'Address Line 1', span: true },
                  { key: 'line2', label: 'Address Line 2 (optional)', span: true },
                  { key: 'city', label: 'City', span: false },
                  { key: 'state', label: 'State', span: false },
                  { key: 'pincode', label: 'Pincode', span: false },
                ].map((f) => (
                  <div key={f.key} className={f.span ? 'sm:col-span-2' : ''}>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      {f.label}
                    </label>
                    <input
                      type="text"
                      value={address[f.key]}
                      onChange={(e) => setAddress({ ...address, [f.key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => { if (validateAddress()) setStep(1); }}
                className="mt-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-1 transition-colors"
              >
                Continue <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* Step 1: Delivery Slot */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-5 shadow-sm"
            >
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock size={18} className="text-brand-600" /> Choose Delivery Slot
              </h2>
              {DELIVERY_SLOTS.map(({ date, slots }) => (
                <div key={date} className="mb-4">
                  <p className="text-sm font-bold text-gray-700 mb-2">{date}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSlot({ date, timeSlot: s })}
                        className={`border rounded-xl p-2 text-xs font-medium transition-colors ${
                          slot.date === date && slot.timeSlot === s
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-gray-200 hover:border-brand-300 text-gray-600'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setStep(0)}
                  className="border-2 border-brand-600 text-brand-600 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-brand-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!slot.date) { toast.error('Please select a delivery slot'); return; }
                    setStep(2);
                  }}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2 rounded-xl text-sm flex items-center gap-1 transition-colors"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-5 shadow-sm"
            >
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-brand-600" /> Payment Method
              </h2>
              <div className="space-y-2">
                {[
                  { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
                  { value: 'razorpay', label: 'Online Payment', icon: '💳', desc: 'Cards, UPI, NetBanking via Razorpay' },
                  { value: 'upi', label: 'UPI Direct', icon: '📱', desc: 'Pay directly via UPI apps' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      payMethod === opt.value
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-brand-200'
                    }`}
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      checked={payMethod === opt.value}
                      onChange={() => setPayMethod(opt.value)}
                      className="hidden"
                    />
                    <span className="text-xl">{opt.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.desc}</p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        payMethod === opt.value
                          ? 'border-brand-500 bg-brand-500'
                          : 'border-gray-300'
                      }`}
                    />
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="border-2 border-brand-600 text-brand-600 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-brand-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? <Spinner size="sm" /> : null}
                  {loading ? 'Placing order...' : `Place Order • ₹${grandTotal.toFixed(2)}`}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm h-fit sticky top-20">
          <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm max-h-52 overflow-y-auto mb-3">
            {items.map((i) => (
              <div key={i._id} className="flex justify-between text-gray-600">
                <span className="truncate flex-1 pr-2">
                  {i.product?.name} × {i.quantity}
                </span>
                <span className="font-medium flex-shrink-0">
                  ₹{(i.price * i.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span className={DELIVERY_FEE === 0 ? 'text-brand-600 font-medium' : ''}>
                {DELIVERY_FEE === 0 ? 'FREE' : `₹${DELIVERY_FEE}`}
              </span>
            </div>
            {total < 199 && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1">
                Add ₹{(199 - total).toFixed(0)} more for free delivery
              </p>
            )}
            <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2 mt-1">
              <span>Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}