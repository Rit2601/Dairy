import React from 'react';
import { motion } from 'framer-motion';

// Full page loader
export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-4xl"
      >
        🥛
      </motion.div>
    </div>
  );
}

// Skeleton card
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
      <div className="bg-gray-200 aspect-square" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-between items-center mt-3">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-8 w-8 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Inline spinner
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={`${sizes[size]} border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin`} />
  );
}