import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductBySlug } from '../store/slices/productSlice';
import { addToCart, openCart } from '../store/slices/cartSlice';
import { pageTransition } from '../animations/motionVariants';
import { Minus, Plus, ShoppingCart, Star, Zap, Shield, Leaf } from 'lucide-react';
import { Spinner } from '../components/Loader';
import toast from 'react-hot-toast';

export default function Product() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct: product, loading } = useSelector((s) => s.products);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
  }, [slug, dispatch]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); navigate('/login'); return; }
    setAdding(true);
    try {
      await dispatch(addToCart({ productId: product._id, quantity: qty })).unwrap();
      dispatch(openCart());
      toast.success('Added to cart! 🛒');
    } catch (err) {
      toast.error(err || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const imgs = product.images?.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&h=600&fit=crop'];

  return (
    <motion.div {...pageTransition} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <motion.div
            key={activeImg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-cream-50 rounded-3xl overflow-hidden aspect-square border border-gray-100"
          >
            <img src={imgs[activeImg]} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>
          {imgs.length > 1 && (
            <div className="flex gap-2 mt-3">
              {imgs.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-brand-500' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-brand-600 font-medium text-sm">{product.category?.name}</p>
            <h1 className="font-display text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
            <p className="text-gray-500 mt-1">{product.unit}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={16} className={n <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'} />
              ))}
            </div>
            <span className="text-sm text-gray-500">{product.rating?.toFixed(1)} ({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.mrp}</span>
                <span className="bg-red-100 text-red-500 text-sm font-bold px-2 py-0.5 rounded-lg">
                  {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Stock */}
          <div>
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-brand-700 bg-brand-50 text-sm font-medium px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-brand-500 rounded-full" />
                In Stock ({product.stock} left)
              </span>
            ) : (
              <span className="text-red-500 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Qty + Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-brand-50 transition-colors">
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-bold text-lg">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {adding ? <Spinner size="sm" /> : <ShoppingCart size={18} />}
              {adding ? 'Adding...' : 'Add to Cart'}
            </motion.button>
          </div>

          {/* Trust icons */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            {[
              { icon: <Zap size={18} className="text-amber-500" />, text: '30-min delivery' },
              { icon: <Shield size={18} className="text-brand-600" />, text: 'Quality assured' },
              { icon: <Leaf size={18} className="text-green-500" />, text: 'No preservatives' },
            ].map(item => (
              <div key={item.text} className="flex flex-col items-center gap-1 text-center p-2 bg-gray-50 rounded-xl">
                {item.icon}
                <span className="text-xs text-gray-600">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}