import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🥛</span>
              <span className="font-display text-white text-xl font-bold">ShridharDairy</span>
            </div>
            <p className="text-sm leading-relaxed">Pure. Fresh. Delivered. Your daily dose of nutrition, right at your doorstep.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Shop</h4>
            <ul className="space-y-2 text-sm">
              {['Milk', 'Curd', 'Paneer', 'Butter', 'Ghee'].map(c => (
                <li key={c}><Link to={`/categories?category=${c.toLowerCase()}`} className="hover:text-brand-400 transition-colors">{c}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              {['About Us', 'Contact', 'Blog', 'Careers'].map(l => (
                <li key={l}><a href="#" className="hover:text-brand-400 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Support</h4>
            <ul className="space-y-2 text-sm">
              {['FAQ', 'Delivery Info', 'Returns', 'Privacy Policy', 'Terms'].map(l => (
                <li key={l}><a href="#" className="hover:text-brand-400 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>© 2025 DairyFresh. All rights reserved.</p>
          <p>Delivering freshness within 5 km radius 🗺️</p>
        </div>
      </div>
    </footer>
  );
}