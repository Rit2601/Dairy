import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, Search, Menu, X, ChevronDown, LogOut, Package, User } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { toggleCart, selectCartCount } from '../store/slices/cartSlice';
import logo from '../assets/logo.png';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <motion.img
              src={logo}
              alt="Shridhar Dairy"
              whileHover={{ scale: 1.04 }}
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-brand-600 font-medium text-sm transition-colors"
            >
              Home
            </Link>
            <Link
              to="/categories"
              className="text-gray-600 hover:text-brand-600 font-medium text-sm transition-colors"
            >
              Products
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className="text-gray-600 hover:text-brand-600 font-medium text-sm transition-colors"
              >
                My Orders
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">

            {/* Search */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-brand-600 transition-colors"
            >
              <Search size={20} />
            </motion.button>

            {/* Cart */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-brand-600 transition-colors"
            >
              <ShoppingCart size={20} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-2 rounded-xl transition-colors"
                >
                  <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      {/* Click outside to close */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                      >
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                        >
                          <User size={16} className="text-brand-500" /> Profile
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                        >
                          <Package size={16} className="text-brand-500" /> My Orders
                        </Link>
                        <div className="border-t border-gray-100" />
                        <button
                          onClick={() => {
                            dispatch(logout());
                            setUserMenuOpen(false);
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 text-sm text-red-500 transition-colors"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-100 py-3 space-y-1 overflow-hidden"
            >
              {[
                { path: '/', label: 'Home' },
                { path: '/categories', label: 'Products' },
                { path: '/orders', label: 'My Orders' },
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-gray-700 hover:bg-brand-50 hover:text-brand-600 rounded-xl text-sm font-medium transition-colors"
                >
                  {label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
            onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -20, scale: 0.97 }}
              className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-2xl"
            >
              <form onSubmit={handleSearch} className="flex gap-3">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for milk, curd, paneer, ghee..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2 rounded-xl transition-colors"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}