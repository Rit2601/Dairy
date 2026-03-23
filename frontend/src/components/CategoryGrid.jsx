import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { staggerContainer, staggerItem } from '../animations/motionVariants';

const DEFAULT_CATEGORIES = [
  { name: 'Milk', slug: 'milk', emoji: '🥛', color: 'from-blue-50 to-blue-100', accent: 'text-blue-600' },
  { name: 'Curd', slug: 'curd', emoji: '🫙', color: 'from-yellow-50 to-amber-100', accent: 'text-amber-600' },
  { name: 'Paneer', slug: 'paneer', emoji: '🧀', color: 'from-orange-50 to-orange-100', accent: 'text-orange-500' },
  { name: 'Butter', slug: 'butter', emoji: '🧈', color: 'from-yellow-50 to-yellow-100', accent: 'text-yellow-600' },
  { name: 'Ghee', slug: 'ghee', emoji: '✨', color: 'from-amber-50 to-amber-100', accent: 'text-amber-500' },
  { name: 'Buttermilk', slug: 'buttermilk', emoji: '🥤', color: 'from-green-50 to-green-100', accent: 'text-green-600' },
  { name: 'Cheese', slug: 'cheese', emoji: '🫕', color: 'from-red-50 to-rose-100', accent: 'text-rose-500' },
  { name: 'Ice Cream', slug: 'ice-cream', emoji: '🍦', color: 'from-purple-50 to-purple-100', accent: 'text-purple-500' },
];

export default function CategoryGrid({ categories = [] }) {
  const displayCats = categories.length > 0
    ? categories.map((c, i) => ({ ...c, emoji: DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length].emoji, color: DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length].color, accent: DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length].accent }))
    : DEFAULT_CATEGORIES;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-50px' }}
      className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3"
    >
      {displayCats.map((cat, i) => (
        <motion.div key={cat.slug || cat.name} variants={staggerItem}>
          <Link
            to={`/categories?category=${cat.slug}`}
            className="group block"
          >
            <motion.div
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.96 }}
              className={`bg-gradient-to-br ${cat.color} rounded-2xl p-3 flex flex-col items-center gap-2 border border-white hover:shadow-md transition-all duration-200`}
            >
              <span className="text-2xl sm:text-3xl">{cat.emoji}</span>
              <span className={`text-xs font-semibold ${cat.accent} text-center leading-tight`}>
                {cat.name}
              </span>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}