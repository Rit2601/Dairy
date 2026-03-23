// Centralized image URL helper for production/development
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL?.replace('/api', '') ||
  'http://localhost:5000';

const PLACEHOLDER_IMGS = [
  'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400&h=400&fit=crop',
];

export const getImageUrl = (url, fallbackIndex = 0) => {
  if (!url) return PLACEHOLDER_IMGS[fallbackIndex % PLACEHOLDER_IMGS.length];
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_URL}${url}`;
};

export const getProductImage = (product, fallbackIndex = 0) => {
  const url = product?.images?.[0] || product?.image;
  return getImageUrl(url, fallbackIndex);
};

export { PLACEHOLDER_IMGS };