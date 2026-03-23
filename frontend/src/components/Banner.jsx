import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BANNERS = [
  {
    title: 'Fresh Paneer',
    subtitle: 'Made daily, delivered daily',
    cta: 'Order Now',
    link: '/categories?category=paneer',
    bg: 'from-orange-400 to-amber-500',
    emoji: '🧀',
  },
  {
    title: 'Pure Cow Ghee',
    subtitle: 'Traditional taste, modern delivery',
    cta: 'Shop Ghee',
    link: '/categories?category=ghee',
    bg: 'from-yellow-400 to-orange-400',
    emoji: '✨',
  },
];

export default function Banner() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {BANNERS.map((b, i) => (
        <motion.div
          key={b.title}
          initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className={`bg-gradient-to-r ${b.bg} rounded-2xl p-5 text-white overflow-hidden relative cursor-pointer`}
        >
          <Link to={b.link} className="block">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-30">{b.emoji}</div>
            <div className="relative z-10">
              <h3 className="font-display text-xl font-bold">{b.title}</h3>
              <p className="text-white/80 text-sm mt-1">{b.subtitle}</p>
              <span className="inline-block mt-3 bg-white/25 hover:bg-white/40 text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors">
                {b.cta} →
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}