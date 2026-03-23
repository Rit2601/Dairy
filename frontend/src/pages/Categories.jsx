import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Loader';
import { pageTransition } from '../animations/motionVariants';
import { Search } from 'lucide-react';

export default function Categories() {
  const dispatch = useDispatch();
  const { items, categories, loading } = useSelector((s) => s.products);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCat, setSelectedCat] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = { limit: 50 };
    if (search.trim()) params.search = search.trim();
    dispatch(fetchProducts(params));
  }, [search, dispatch]);

  // Filter by selected category on the frontend
  // (avoids ObjectId vs string mismatch issues with the DB)
  const filteredItems = selectedCat
    ? items.filter((p) => {
        const catName = typeof p.category === 'object'
          ? p.category?.name
          : p.category;
        return catName?.toLowerCase() === selectedCat.toLowerCase();
      })
    : items;

  // Sort
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Build category list from actual products if DB categories empty
  const categoryList = categories.length > 0
    ? categories
    : [...new Set(items.map((p) =>
        typeof p.category === 'object' ? p.category?.name : p.category
      ).filter(Boolean))].map((name) => ({ _id: name, name, slug: name.toLowerCase() }));

  return (
    <motion.div {...pageTransition} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6">

        {/* Sidebar */}
        <aside className="md:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl p-4 shadow-sm sticky top-20">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCat('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                  !selectedCat
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Products ({items.length})
              </button>
              {categoryList.map((cat) => {
                const count = items.filter((p) => {
                  const cn = typeof p.category === 'object' ? p.category?.name : p.category;
                  return cn?.toLowerCase() === cat.name?.toLowerCase();
                }).length;
                return (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCat(cat.name)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                      selectedCat === cat.name
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low–High</option>
              <option value="price_desc">Price: High–Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            {sortedItems.length} product{sortedItems.length !== 1 ? 's' : ''} found
          </p>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-gray-500 font-medium">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different category or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedItems.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}