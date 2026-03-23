import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import Hero from '../components/Hero';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import Banner from '../components/Banner';
import { SkeletonCard } from '../components/Loader';
import { pageTransition } from '../animations/motionVariants';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function SectionHeader({ title, subtitle, link }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {link && (
        <Link to={link} className="flex items-center gap-1 text-brand-600 text-sm font-semibold hover:underline">
          See all <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const { items: products, categories, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts({ limit: 50 }));
  }, [dispatch]);

  // Smart fallback — always show products regardless of flags
  const featured = products.filter((p) => p.isFeatured);
  const bestSellers = products.filter((p) => p.isBestSeller);
  const freshToday = products.filter((p) => p.isFreshToday);

  const showFeatured = featured.length > 0 ? featured.slice(0, 8) : products.slice(0, 8);
  const showBest = bestSellers.length > 0 ? bestSellers.slice(0, 4) : products.slice(0, 4);
  const showFresh = freshToday.length > 0 ? freshToday.slice(0, 4) : products.slice(0, 4);

  return (
    <motion.div {...pageTransition}>
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

        {/* Categories */}
        <section>
          <SectionHeader title="Shop by Category" subtitle="Explore our fresh dairy range" />
          <CategoryGrid categories={categories} />
        </section>

        {/* Featured Products */}
        <section>
          <SectionHeader
            title="Featured Products"
            subtitle="Hand-picked quality for you"
            link="/categories"
          />
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : showFeatured.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🥛</p>
              <p>No products yet. Add some from the admin panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {showFeatured.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Promotional Banners */}
        <section>
          <Banner />
        </section>

        {/* Best Sellers */}
        {showBest.length > 0 && (
          <section>
            <SectionHeader
              title="Best Sellers 🔥"
              subtitle="Most loved by our customers"
              link="/categories"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {showBest.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Today's Fresh */}
        {showFresh.length > 0 && (
          <section>
            <SectionHeader
              title="Today's Fresh Batch 🌱"
              subtitle="Freshly prepared this morning"
              link="/categories"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {showFresh.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Why DairyFresh */}
        <section className="bg-gradient-to-br from-brand-50 to-cream-100 rounded-3xl p-8">
          <h2 className="font-display text-2xl font-bold text-center text-gray-900 mb-8">
            Why DairyFresh?
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { emoji: '🥛', title: 'Farm Fresh Daily', desc: 'Sourced directly from our trusted dairy farm every morning' },
              { emoji: '⚡', title: '30-Min Delivery', desc: 'Lightning fast delivery within 5 km of our dairy location' },
              { emoji: '🌿', title: 'No Preservatives', desc: 'Pure, natural dairy with zero artificial additives' },
            ].map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-5 text-center shadow-sm"
              >
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </motion.div>
  );
}