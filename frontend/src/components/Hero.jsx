import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Shield, Leaf } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-emerald-400 text-white">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-brand-300/20 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-4"
            >
              <span className="w-2 h-2 bg-amber-300 rounded-full animate-pulse" />
              Fresh delivery in 30 minutes
            </motion.div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Pure Dairy,
              <br />
              <span className="text-amber-300">Delivered Fresh</span>
            </h1>

            <p className="mt-4 text-brand-100 text-lg leading-relaxed max-w-md">
              Farm-fresh milk, curd, paneer & more — delivered to your doorstep within 5 km of our dairy.
            </p>

            <div className="flex flex-wrap gap-3 mt-7">
              <Link to="/categories">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 bg-white text-brand-700 font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  Shop Now <ArrowRight size={18} />
                </motion.button>
              </Link>
              <Link to="/categories?fresh=true">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-2xl hover:bg-white/30 transition-all"
                >
                  Today's Fresh
                </motion.button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mt-8">
              {[
                { icon: <Clock size={14} />, text: '30-min delivery' },
                { icon: <Shield size={14} />, text: 'Quality assured' },
                { icon: <Leaf size={14} />, text: '100% natural' },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-1.5 text-sm text-brand-100">
                  <span className="text-amber-300">{badge.icon}</span>
                  {badge.text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero image / illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            className="hidden lg:block relative"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&h=500&fit=crop&crop=center"
                alt="Fresh dairy products"
                className="w-full max-w-sm mx-auto rounded-3xl shadow-2xl object-cover aspect-square"
              />
              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -left-6 top-1/4 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2"
              >
                <span className="text-2xl">🥛</span>
                <div>
                  <p className="text-xs font-bold text-gray-800">Full Cream Milk</p>
                  <p className="text-xs text-brand-600 font-semibold">₹52 / 500ml</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute -right-4 bottom-1/4 bg-white rounded-2xl shadow-xl p-3"
              >
                <p className="text-xs font-bold text-gray-800">⭐ 4.9 Rating</p>
                <p className="text-xs text-gray-400">2,400+ reviews</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}