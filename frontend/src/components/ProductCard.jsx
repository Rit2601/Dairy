import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Star, Zap } from 'lucide-react';
import { addToCart, openCart } from '../store/slices/cartSlice';
import { getProductImage, PLACEHOLDER_IMGS } from '../utils/imageUrl';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index = 0 }) {
  const [adding, setAdding] = useState(false);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const imgSrc = getProductImage(product, index);

  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const slug =
    product.slug ||
    product.name?.toLowerCase().replace(/\s+/g, '-') ||
    product._id;

  const categoryName =
    typeof product.category === 'object'
      ? product.category?.name || 'Dairy'
      : product.category || 'Dairy';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    setAdding(true);
    try {
      await dispatch(
        addToCart({ productId: product._id, quantity: 1 })
      ).unwrap();
      dispatch(openCart());
      toast.success(`${product.name} added to cart! 🛒`);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <Link to={`/product/${slug}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50 aspect-square">
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = PLACEHOLDER_IMGS[index % PLACEHOLDER_IMGS.length];
            }}
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {discount}% OFF
              </span>
            )}
            {product.isFreshToday && (
              <span className="bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Zap size={9} /> FRESH
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-xs text-brand-600 font-medium">{categoryName}</p>
          <h3 className="font-semibold text-gray-800 text-sm mt-0.5 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{product.unit || '500ml'}</p>

          {product.rating > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="text-xs text-gray-500">
                {Number(product.rating).toFixed(1)}
                {product.reviewCount > 0 && ` (${product.reviewCount})`}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mt-2.5">
            <div>
              <span className="text-base font-bold text-gray-900">
                ₹{product.price}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-xs text-gray-400 line-through ml-1">
                  ₹{product.mrp}
                </span>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all ${
                product.stock === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-brand-500 hover:bg-brand-600 shadow-sm hover:shadow'
              }`}
            >
              {adding ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <Plus size={16} />
              )}
            </motion.button>
          </div>

          {product.stock === 0 && (
            <p className="text-xs text-red-400 font-medium mt-1">Out of stock</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}